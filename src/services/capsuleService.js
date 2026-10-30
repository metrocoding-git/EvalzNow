/**
 * Capsule service – UI phase.
 *
 * The Capsule backend (tables + API) is not built yet, so this service keeps capsule data in the
 * browser (localStorage) with a small set of sample capsules. Every function is async and has the
 * same shape a real API call will have, so the screens do not change when the backend is added:
 * only the bodies of these functions will be replaced with `api.get/post/put/delete` calls.
 */

const STORE_KEY = "evz_capsule_ui_store_v1";

const nowIso = () => new Date().toISOString();

const SAMPLE_STORE = () => ({
  nextId: { capsule: 3, roster: 1, block: 1, benchmark: 3, score: 1, projection: 1 },
  capsules: [
    {
      id: 1,
      capsuleName: "C1_Combined_Neuro",
      capsuleId: "CC-001",
      capsuleStartDate: "2026-01-05",
      capsuleEndDate: "2026-06-30",
      capsuleDirector: "",
      capsuleType: "Capacity - Combined",
      signatureProfile: "Case 1: Solid Balanced",
      environment: "Clinical-Neuro",
      frameworkAge: "1-2 years",
      staffAssignments: [],
      benchmarks: [
        { id: 1, benchmarkId: "1", benchmarkType: "Baseline", benchmarkRef: "1", benchmarkDescription: "Sample benchmark" },
      ],
      XEP: 0.7, XCFL: 0.7, XCPL: 0.7, XCTL: 0.7, XCOL: 0.7, XCP: 0.7, XBP: 0.7, MSIP: 0.45,
      "ΔPC1": 0, "ΔPC2": 0, "ΔPC3": 0, "ΔGEQ": 0, IC: 2, NDIV: 0.5,
      createdAt: nowIso(),
    },
    {
      id: 2,
      capsuleName: "C2_Isolated_Neuro",
      capsuleId: "CC-002",
      capsuleStartDate: "2026-02-02",
      capsuleEndDate: "2026-08-31",
      capsuleDirector: "",
      capsuleType: "Capacity - Isolated",
      signatureProfile: "Case 1: Solid Balanced",
      environment: "Clinical-Neuro",
      frameworkAge: "< 1 year",
      staffAssignments: [],
      benchmarks: [
        { id: 2, benchmarkId: "1", benchmarkType: "Standard", benchmarkRef: "1", benchmarkDescription: "Sample benchmark" },
      ],
      XEP: 0.7, XFLL: 0.7, XFLR: 0.7, XPLL: 0.7, XPLR: 0.7, XTLL: 0.7, XTLR: 0.7, XOLL: 0.7, XOLR: 0.7,
      XCP: 0.7, XBP: 0.7, MSIP: 0.45, "ΔPC1": 0, "ΔPC2": 0, "ΔPC3": 0, "ΔGEQ": 0, IC: 2, NDIV: 0.5,
      createdAt: nowIso(),
    },
  ],
  rosters: [],
  blocks: [],
  scores: [],
  markerNames: {},
  projections: [],
});

function load() {
  if (typeof window === "undefined") return SAMPLE_STORE();
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) return upgrade(JSON.parse(raw));
  } catch {
    /* storage unavailable – fall back to sample data */
  }
  const fresh = SAMPLE_STORE();
  save(fresh);
  return fresh;
}

/** Adds collections that were introduced after a browser first stored the sample data. */
function upgrade(store) {
  store.nextId = { capsule: 1, roster: 1, block: 1, benchmark: 1, score: 1, ...(store.nextId || {}) };
  store.scores = store.scores || [];
  store.markerNames = store.markerNames || {};
  store.projections = store.projections || [];
  store.effectivity = store.effectivity || [];
  return store;
}

function save(store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* ignore – data then only lives for this page */
  }
}

const clone = (v) => JSON.parse(JSON.stringify(v));
const delay = (v) => new Promise((resolve) => setTimeout(() => resolve(clone(v)), 60));

/** Same "staffLookup" → "staffAssignments" mapping the unit API does. */
function withStaff(payload, existing = {}) {
  const out = { ...existing, ...payload };
  if (Array.isArray(payload.staffLookup)) {
    const capsuleNo = Number(existing.id ?? out.id ?? 0);
    out.staffAssignments = payload.staffLookup.map((s, i) => ({
      id: capsuleNo * 1000 + i + 1, roleType: s.roleType, staffId: s.staffId, staff: { id: s.staffId, ...(s.staff || {}) },
    }));
    delete out.staffLookup;
  }
  if (Array.isArray(payload.benchmarks)) {
    out.benchmarks = payload.benchmarks.map((b, i) => ({
      id: b.id ?? i + 1,
      benchmarkId: String(b.benchmarkId ?? i + 1),
      benchmarkType: b.benchmarkType || "",
      benchmarkRef: b.benchmarkRef || "",
      benchmarkDescription: b.benchmarkDescription || "",
    }));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Capsules
// ---------------------------------------------------------------------------
export const getAllCapsules = async () => delay(load().capsules);

export const getCapsuleById = async (id) => {
  const c = load().capsules.find((x) => String(x.id) === String(id));
  if (!c) throw new Error("Capsule not found");
  return delay(c);
};

export const createCapsule = async (payload) => {
  const store = load();
  if (store.capsules.some((c) => (c.capsuleId || "").toLowerCase() === (payload.capsuleId || "").toLowerCase())) {
    throw new Error(`A capsule with ID "${payload.capsuleId}" already exists.`);
  }
  const capsule = withStaff(payload, { id: store.nextId.capsule++, createdAt: nowIso() });
  store.capsules.push(capsule);
  save(store);
  return delay(capsule);
};

export const updateCapsule = async (id, payload) => {
  const store = load();
  const i = store.capsules.findIndex((c) => String(c.id) === String(id));
  if (i === -1) throw new Error("Capsule not found");
  store.capsules[i] = withStaff(payload, store.capsules[i]);
  save(store);
  return delay(store.capsules[i]);
};

export const deleteCapsule = async (id) => {
  const store = load();
  store.capsules = store.capsules.filter((c) => String(c.id) !== String(id));
  store.rosters = store.rosters.filter((r) => String(r.capsuleId) !== String(id));
  store.blocks = store.blocks.filter((b) => String(b.capsuleId) !== String(id));
  store.scores = store.scores.filter((x) => String(x.capsuleId) !== String(id));
  delete store.markerNames[id];
  ["auxCandidateMarks", "auxNeedAssessments", "auxImprovements", "auxChains", "auxLeaderMarks"].forEach((k) => {
    store[k] = (store[k] || []).filter((x) => String(x.unitId) !== String(id));
  });
  store.effectivity = (store.effectivity || []).filter((x) => String(x.capsuleId) !== String(id));
  save(store);
  return delay({ message: "Capsule deleted" });
};

// ---------------------------------------------------------------------------
// Capsule roster
// ---------------------------------------------------------------------------
export const getAllCapsuleRoster = async () => delay(load().rosters);

export const getCapsuleRosterByCapsuleId = async (capsuleDbId) =>
  delay(load().rosters.filter((r) => String(r.capsuleId) === String(capsuleDbId)));

/** Connected capsules of a candidate (Candidate tab → Review). */
export const getCapsulesByCandidateId = async (candidateDbId) => {
  const store = load();
  const rows = store.rosters.filter((r) => String(r.candidateId) === String(candidateDbId));
  return delay(rows.map((r) => {
    const c = store.capsules.find((x) => String(x.id) === String(r.capsuleId)) || {};
    return { id: c.id, capsuleId: c.capsuleId, capsuleName: c.capsuleName, status: r.capsuleOutcome || "Ongoing" };
  }).filter((c) => c.id));
};

export const createCapsuleRoster = async (payload) => {
  const store = load();
  const row = {
    id: store.nextId.roster++,
    capsuleId: payload.capsuleId,
    candidateId: payload.candidateId,
    candidate: payload.candidate || null,
    capsuleOutcome: payload.capsuleOutcome || "Ongoing",
    ageRange: payload.ageRange || "Unknown",
    presentCount: 0, excusedAbsences: 0, unexcusedAbsences: 0, excusedTardies: 0, unexcusedTardies: 0,
  };
  store.rosters.push(row);
  save(store);
  return delay(row);
};

export const updateCapsuleRoster = async (id, payload) => {
  const store = load();
  const i = store.rosters.findIndex((r) => String(r.id) === String(id));
  if (i === -1) throw new Error("Roster entry not found");
  store.rosters[i] = { ...store.rosters[i], ...payload, id: store.rosters[i].id };
  save(store);
  return delay(store.rosters[i]);
};

export const deleteCapsuleRoster = async (id) => {
  const store = load();
  const row = store.rosters.find((r) => String(r.id) === String(id));
  store.rosters = store.rosters.filter((r) => String(r.id) !== String(id));
  if (row) {
    store.blocks = store.blocks.filter((b) => !(String(b.capsuleId) === String(row.capsuleId) && String(b.candidate_id) === String(row.candidateId)));
    store.scores = store.scores.filter((x) => !(String(x.capsuleId) === String(row.capsuleId) && String(x.candidate_id) === String(row.candidateId)));
    ["auxCandidateMarks", "auxNeedAssessments", "auxChains"].forEach((k) => {
      store[k] = (store[k] || []).filter((x) => !(String(x.unitId) === String(row.capsuleId) && String(x.candidateId) === String(row.candidateId)));
    });
    store.effectivity = (store.effectivity || []).filter((x) => !(String(x.capsuleId) === String(row.capsuleId) && String(x.candidateId) === String(row.candidateId)));
  }
  save(store);
  return delay({ message: "Roster entry deleted" });
};

// ---------------------------------------------------------------------------
// Capsule assessment blocks (same PP ID rules as units: Indirect -1,-2,…  Direct 1,2,…)
// ---------------------------------------------------------------------------
export const getCapsuleBlocksByCapsuleAndCandidate = async (capsuleDbId, candidateDbId) =>
  delay(load().blocks.filter((b) => String(b.capsuleId) === String(capsuleDbId) && String(b.candidate_id) === String(candidateDbId)));

export const createCapsuleBlock = async (payload) => {
  const store = load();
  const same = store.blocks.filter((b) =>
    String(b.capsuleId) === String(payload.capsuleId) &&
    String(b.candidate_id) === String(payload.candidate_id) &&
    b.manageType === payload.manageType);
  const ppId = payload.manageType === "Indirect" ? -(same.length + 1) : same.length + 1;
  const block = { id: store.nextId.block++, ...payload, ppId };
  store.blocks.push(block);
  save(store);
  return delay(block);
};

export const updateCapsuleBlock = async (id, payload) => {
  const store = load();
  const i = store.blocks.findIndex((b) => String(b.id) === String(id));
  if (i === -1) throw new Error("Assessment block not found");
  store.blocks[i] = { ...store.blocks[i], ...payload, id: store.blocks[i].id };
  store.scores.filter((x) => String(x.blockId) === String(id)).forEach((x) => { x.ppId = store.blocks[i].ppId; });
  save(store);
  return delay(store.blocks[i]);
};

export const deleteCapsuleBlock = async (id) => {
  const store = load();
  const block = store.blocks.find((b) => String(b.id) === String(id));
  store.blocks = store.blocks.filter((b) => String(b.id) !== String(id));
  store.scores = store.scores.filter((x) => String(x.blockId) !== String(id));
  // Renumber the remaining PP IDs of that candidate/tab so there are no gaps (as the unit API does).
  if (block) {
    const sign = block.manageType === "Indirect" ? -1 : 1;
    store.blocks
      .filter((b) => String(b.capsuleId) === String(block.capsuleId) && String(b.candidate_id) === String(block.candidate_id) && b.manageType === block.manageType)
      .sort((a, b) => Math.abs(a.ppId) - Math.abs(b.ppId))
      .forEach((b, i) => {
        b.ppId = sign * (i + 1);
        store.scores.filter((x) => String(x.blockId) === String(b.id)).forEach((x) => { x.ppId = b.ppId; });
      });
  }
  save(store);
  return delay({ message: "Assessment block deleted" });
};

// ---------------------------------------------------------------------------
// Setup View – Insert Scores for Capacity Accounting
// ---------------------------------------------------------------------------
const sortScores = (rows) =>
  [...rows].sort((a, b) => {
    const pa = Number(a.ppId), pb = Number(b.ppId);
    if ((pa < 0) !== (pb < 0)) return pa < 0 ? -1 : 1;           // indirect first
    if (pa !== pb) return Math.abs(pa) - Math.abs(pb);           // -1,-2,… / 1,2,…
    return String(a.criticalRefDate).localeCompare(String(b.criticalRefDate)) || a.id - b.id;
  });

export const getCapsuleScoresByCapsule = async (capsuleDbId) =>
  delay(sortScores(load().scores.filter((x) => String(x.capsuleId) === String(capsuleDbId))));

export const getCapsuleScoresByCapsuleAndCandidate = async (capsuleDbId, candidateDbId) =>
  delay(sortScores(load().scores.filter((x) =>
    String(x.capsuleId) === String(capsuleDbId) && String(x.candidate_id) === String(candidateDbId))));

export const createCapsuleScore = async (payload) => {
  const store = load();
  const block = store.blocks.find((b) => String(b.id) === String(payload.blockId));
  if (!block) throw new Error("Assessment block not found");
  const row = { ...payload, id: store.nextId.score++, ppId: block.ppId, createdAt: nowIso() };
  store.scores.push(row);
  save(store);
  return delay(row);
};

export const updateCapsuleScore = async (id, payload) => {
  const store = load();
  const i = store.scores.findIndex((x) => String(x.id) === String(id));
  if (i === -1) throw new Error("Score not found");
  store.scores[i] = { ...store.scores[i], ...payload, id: store.scores[i].id };
  save(store);
  return delay(store.scores[i]);
};

export const deleteCapsuleScore = async (id) => {
  const store = load();
  store.scores = store.scores.filter((x) => String(x.id) !== String(id));
  save(store);
  return delay({ message: "Score deleted" });
};

/**
 * Allowed Critical Reference Date range for a PP ID (same idea as the unit API):
 * not before the latest date of the previous PP ID, not after the earliest date of the next PP ID.
 */
export const getCapsuleCriticalRange = async (capsuleDbId, candidateDbId, ppId, ignoreScoreId = null) => {
  const rows = load().scores.filter((x) =>
    String(x.capsuleId) === String(capsuleDbId) && String(x.candidate_id) === String(candidateDbId) &&
    String(x.id) !== String(ignoreScoreId));
  const id = Number(ppId);
  const sameSide = rows.filter((x) => Math.sign(Number(x.ppId)) === Math.sign(id));
  const prev = sameSide.filter((x) => Math.abs(Number(x.ppId)) < Math.abs(id)).map((x) => x.criticalRefDate).sort();
  const next = sameSide.filter((x) => Math.abs(Number(x.ppId)) > Math.abs(id)).map((x) => x.criticalRefDate).sort();
  return delay({ ppId: id, startDate: prev.length ? prev[prev.length - 1] : null, endDate: next.length ? next[0] : null });
};

/** Clinical Marker names of a capsule (CM89–CM100 are custom criteria and can be renamed). */
export const getCapsuleMarkerNames = async (capsuleDbId) => delay(load().markerNames[capsuleDbId] || {});

export const updateCapsuleMarkerName = async (capsuleDbId, index, name) => {
  const store = load();
<<<<<<< HEAD
  // Custom criteria names: max 30 characters (one-line labels on the Insert Scores form)
  const clean = String(name ?? "").slice(0, 30);
  store.markerNames[capsuleDbId] = { ...(store.markerNames[capsuleDbId] || {}), [index]: clean };
=======
  store.markerNames[capsuleDbId] = { ...(store.markerNames[capsuleDbId] || {}), [index]: name };
>>>>>>> 6db65c5a0aa5a45f11f514bbcc0876178d12f9cb
  save(store);
  return delay(store.markerNames[capsuleDbId]);
};

/** Preview – "Master PP ID Bin Totals" (attained / maximum per capacity and PP ID). */
export const getCapsuleBinTotals = async (capsuleDbId, candidateDbId, capacities) => {
  const store = load();
  const capsule = store.capsules.find((c) => String(c.id) === String(capsuleDbId)) || {};
  const rows = sortScores(store.scores.filter((x) =>
    String(x.capsuleId) === String(capsuleDbId) && String(x.candidate_id) === String(candidateDbId)));
  const byPp = new Map();
  rows.forEach((x) => {
    if (!byPp.has(x.ppId)) byPp.set(x.ppId, []);
    byPp.get(x.ppId).push(x);
  });
  return delay([...byPp.entries()].map(([ppId, list]) => {
    const out = { ppId, capsuleName: capsule.capsuleName, capsuleId: capsule.capsuleId, capsuleType: capsule.capsuleType };
    capacities.forEach(({ name, code }) => {
      const mine = list.filter((x) => x.capacity === name);
      out[`A${code}`] = mine.reduce((t, x) => t + (Number(x.attainedScore) || 0), 0);
      out[`M${code}`] = mine.reduce((t, x) => t + (Number(x.maxScore) || 0), 0);
    });
    return out;
  }));
};

/** Preview – Master PP ID table (duration total, latest date, missing capacities). */
export const getCapsulePpSummary = async (capsuleDbId, candidateDbId, capacities) => {
  const store = load();
  const rows = store.scores.filter((x) =>
    String(x.capsuleId) === String(capsuleDbId) && String(x.candidate_id) === String(candidateDbId));
  const blocks = store.blocks.filter((b) =>
    String(b.capsuleId) === String(capsuleDbId) && String(b.candidate_id) === String(candidateDbId));
  const ppIds = [...new Set(rows.map((x) => x.ppId))];
  return delay(ppIds.map((ppId) => {
    const list = rows.filter((x) => x.ppId === ppId);
    const present = new Set(list.map((x) => x.capacity));
    const missing = capacities.map((c) => c.name).filter((n) => !present.has(n));
    const latest = list.map((x) => x.criticalRefDate).sort().pop() || null;
    const block = blocks.find((b) => b.ppId === ppId);
    return {
      ppId,
      shortDescription: block?.shortDescription || null,
      totalDuration: list.reduce((t, x) => t + (Number(x.durationDays) || 0), 0),
      latestCriticalRefDate: latest,
      missingCapacity: missing.join(", ") || null,
      error: missing.length ? "Yes" : "No",
    };
  }));
};

// ---------------------------------------------------------------------------
// Growth Metrics – Projection Table sessions (same shape as the unit projection API)
// ---------------------------------------------------------------------------
export const getCapsuleProjection = async (capsuleDbId, candidateDbId) =>
  delay(load().projections
    .filter((x) => String(x.capsuleId) === String(capsuleDbId) && String(x.candidateId) === String(candidateDbId))
    .sort((a, b) => b.id - a.id));

export const createCapsuleProjection = async (payload) => {
  const store = load();
  const session = { id: store.nextId.projection++, capsuleId: payload.unitId ?? payload.capsuleId, candidateId: payload.candidateId, points: payload.points || [], createdAt: nowIso() };
  store.projections.push(session);
  save(store);
  return delay({ session });
};

export const updateCapsuleProjection = async (sessionId, payload) => {
  const store = load();
  const s = store.projections.find((x) => String(x.id) === String(sessionId));
  if (!s) throw new Error("Projection session not found");
  s.points = payload.points || [];
  save(store);
  return delay({ session: s });
};

/** Direct (sync) access for the UI-phase data layers (src/lib/capsule/mockDb.js). */
export const loadCapsuleStore = () => load();
export const saveCapsuleStore = (store) => save(store);

/** Clears the browser sample data (used by nobody yet – handy while reviewing the UI). */
export const resetCapsuleSampleData = () => {
  save(SAMPLE_STORE());
};
