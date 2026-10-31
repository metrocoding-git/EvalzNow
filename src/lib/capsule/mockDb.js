/**
 * A very small Sequelize-like layer over the capsule data of the API, so the server auxiliary controller
 * code (findAll / findOne / findByPk / create / update / save / destroy with simple where, Op.in, order
 * and the includes below) runs unchanged for capsules.
 *
 * Reads come from the capsule snapshot (GET /capsules/store/:clientId), writes go to
 * /capsules/aux/:kind. "unitId" in the controller code is the capsule id; the Unit model is answered
 * from the capsules.
 */
import {
  loadCapsuleStore, createCapsuleAuxRecord, updateCapsuleAuxRecord, deleteCapsuleAuxRecord,
} from "@/services/capsuleService";
import { getStaffDirectory } from "./staffDirectory";

export const Op = { in: "__in", ne: "__ne", gte: "__gte", lte: "__lte", between: "__between" };

const same = (a, b) => String(a) === String(b);

function matches(row, where = {}) {
  return Object.entries(where).every(([k, cond]) => {
    const v = row[k];
    if (cond && typeof cond === "object" && !Array.isArray(cond)) {
      return Object.entries(cond).every(([op, arg]) => {
        if (op === Op.in) return (arg || []).some((x) => same(x, v));
        if (op === Op.ne) return !same(arg, v);
        if (op === Op.gte) return v >= arg;
        if (op === Op.lte) return v <= arg;
        if (op === Op.between) return v >= arg[0] && v <= arg[1];
        return false;
      });
    }
    if (cond === null) return v === null || v === undefined;
    return same(v, cond);
  });
}

function sortRows(rows, order) {
  if (!order?.length) return rows;
  return [...rows].sort((a, b) => {
    for (const [field, dir] of order) {
      const x = a[field];
      const y = b[field];
      if (x === y) continue;
      const r = x > y ? 1 : -1;
      return String(dir).toUpperCase() === "DESC" ? -r : r;
    }
    return 0;
  });
}

// ---------------------------------------------------------------------------
// Virtual (read-only) tables built from the capsule data
// ---------------------------------------------------------------------------

function staffLookups(store) {
  const out = [];
  store.capsules.forEach((c) => {
    (c.staffAssignments || []).forEach((s, i) => {
      out.push({ id: s.id ?? c.id * 1000 + i + 1, unitId: c.id, staffId: s.staffId ?? s.staff?.id, roleType: s.roleType });
    });
  });
  return out;
}

const VIRTUAL = {
  Unit: (store) => store.capsules.map((c) => ({
    ...c, unitName: c.capsuleName, unitStartDate: c.capsuleStartDate, unitType: "Third Parameter",
  })),
  Candidate: (store) => {
    const map = new Map();
    store.rosters.forEach((r) => r.candidate && map.set(String(r.candidate.id), r.candidate));
    return [...map.values()];
  },
  AssessmentBlockManager: (store) => store.blocks.map((b) => ({ ...b, unitId: b.capsuleId })),
  StaffLookup: (store) => staffLookups(store),
  Staff: () => getStaffDirectory(),
};

/** Model → [snapshot key, API record kind] */
const TABLES = {
  CandidateMarks: ["auxCandidateMarks", "candidateMarks"],
  CandidateNeedAssessment: ["auxNeedAssessments", "needAssessments"],
  UnitImprovement: ["auxImprovements", "improvements"],
  AssessmentChain: ["auxChains", "chains"],
  LeaderMarks: ["auxLeaderMarks", "leaderMarks"],
};

/** Association alias → [model, foreign key on the row]. */
const ASSOCIATIONS = {
  candidate: ["Candidate", "candidateId"],
  unit: ["Unit", "unitId"],
  leaderLookup: ["StaffLookup", "staffLookupId"],
  staff: ["Staff", "staffId"],
  block1: ["AssessmentBlockManager", "selection1"],
  block2: ["AssessmentBlockManager", "selection2"],
  block3: ["AssessmentBlockManager", "selection3"],
  block4: ["AssessmentBlockManager", "selection4"],
  block5: ["AssessmentBlockManager", "selection5"],
};
const ASSOCIATION_KEYS = Object.keys(ASSOCIATIONS);
const SERVER_KEYS = ["id", "createdAt", "updatedAt", "capsuleId"];

function rowsOf(name, store) {
  if (VIRTUAL[name]) return VIRTUAL[name](store);
  return store[TABLES[name][0]] || [];
}

function withIncludes(row, include, store) {
  if (!row || !include?.length) return row;
  const out = { ...row };
  include.forEach((inc) => {
    const alias = inc.as;
    const assoc = ASSOCIATIONS[alias];
    if (!assoc) return;
    const [model, fk] = assoc;
    const target = rowsOf(model, store).find((r) => same(r.id, row[fk])) || null;
    out[alias] = target ? withIncludes(target, inc.include, store) : null;
  });
  return out;
}

/** Fields of a record that are sent to the API (no relations / server-managed keys). */
function payloadOf(obj) {
  const out = { ...obj };
  ASSOCIATION_KEYS.forEach((k) => delete out[k]);
  SERVER_KEYS.forEach((k) => delete out[k]);
  return out;
}

function instance(name, row, include, store) {
  const data = withIncludes(row, include, store);
  if (!data) return null;
  const define = (k, fn) => Object.defineProperty(data, k, { value: fn, enumerable: false, writable: true });
  const kind = TABLES[name]?.[1];
  define("update", async (patch) => {
    if (!kind) throw new Error(`${name} is read-only for capsules`);
    const saved = await updateCapsuleAuxRecord(kind, row.id, payloadOf({ unitId: row.unitId, ...patch }));
    Object.assign(data, patch, { updatedAt: saved?.updatedAt });
    return data;
  });
  define("save", async () => data.update(payloadOf(data)));
  define("destroy", async () => {
    if (!kind) throw new Error(`${name} is read-only for capsules`);
    await deleteCapsuleAuxRecord(kind, row.id);
  });
  define("toJSON", () => ({ ...data }));
  define("get", () => ({ ...data }));
  return data;
}

function model(name) {
  const kind = TABLES[name]?.[1];
  return {
    async findAll({ where, order, include } = {}) {
      const store = await loadCapsuleStore();
      return sortRows(rowsOf(name, store).filter((r) => matches(r, where)), order).map((r) => instance(name, r, include, store));
    },
    async findOne({ where, order, include } = {}) {
      const store = await loadCapsuleStore();
      const r = sortRows(rowsOf(name, store).filter((x) => matches(x, where)), order)[0];
      return r ? instance(name, r, include, store) : null;
    },
    async findByPk(id, { include } = {}) {
      const store = await loadCapsuleStore();
      const r = rowsOf(name, store).find((x) => same(x.id, id));
      return r ? instance(name, r, include, store) : null;
    },
    async create(data) {
      if (!kind) throw new Error(`${name} is read-only for capsules`);
      const row = await createCapsuleAuxRecord(kind, payloadOf(data));
      return instance(name, row, null, await loadCapsuleStore());
    },
    async destroy({ where } = {}) {
      if (!kind) throw new Error(`${name} is read-only for capsules`);
      const store = await loadCapsuleStore();
      const rows = rowsOf(name, store).filter((r) => matches(r, where));
      for (const r of rows) await deleteCapsuleAuxRecord(kind, r.id);
      return rows.length;
    },
  };
}

export const db = Object.fromEntries(
  [...Object.keys(TABLES), ...Object.keys(VIRTUAL)].map((n) => [n, model(n)]),
);
export const Sequelize = { fn: () => null, col: () => null };
