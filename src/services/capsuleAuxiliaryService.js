/**
 * Capsule Auxiliary Resultants – same functions / arguments / responses as auxiliaryService (unitId = capsule id),
 * answered by the server auxiliary controller logic running on the capsule store (UI phase).
 */
import * as C from "@/lib/capsule/auxiliary/auxiliaryController";
import { ensureStaffDirectory as ensureStaff } from "@/lib/capsule/staffDirectory";

/** Runs a server-style (req, res) handler; rejects like axios for 4xx / 5xx. */
function run(handler, { params = {}, query = {}, body = {} } = {}) {
  return new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(data) {
        const plain = JSON.parse(JSON.stringify(data ?? null));
        if (this.statusCode >= 400) {
          const err = new Error(plain?.message || "Request failed");
          err.response = { status: this.statusCode, data: plain };
          reject(err);
        } else {
          resolve(plain);
        }
        return this;
      },
    };
    Promise.resolve(handler({ params, query, body }, res)).catch(reject);
  });
}

const dateQuery = (filters) => { const f = filters || {}; return ({
  ppIdFrom: f.ppIdFrom || undefined,
  ppIdTo: f.ppIdTo || undefined,
  criticalRefDateFrom: f.criticalRefDateFrom || f.criticalDateFrom || undefined,
  criticalRefDateTo: f.criticalRefDateTo || f.criticalDateTo || undefined,
}); };

export const getAuxiliarydata = (unitId, candidateId, filters = {}) =>
  run(C.getAuxiliaryGraphData, { params: { unitId, candidate_id: String(candidateId) }, query: dateQuery(filters) });

export const getCandidateMarks = (unitId, candidateId) => run(C.getCandidateMarks, { params: { unitId, candidate_id: candidateId } });
export const createCandidateMarks = (body) => run(C.createCandidateMarks, { body });
export const updateCandidateMarks = (id, body) => run(C.updateCandidateMark, { params: { id }, body });
export const deleteCandidateMark = (id) => run(C.deleteCandidateMark, { params: { id } });

export const getNeedAssessment = (unitId, candidateId) => run(C.getCandidateNeedAssessments, { params: { unitId, candidate_id: candidateId } });
export const createNeedAssessment = (body) => run(C.createCandidateNeedAssessment, { body });
export const updateNeedAssessment = (id, body) => run(C.updateCandidateNeedAssessment, { params: { id }, body });
export const deleteNeedAssessment = (id) => run(C.deleteCandidateNeedAssessment, { params: { id } });
export const getNeedAssessmentSummary = (unitId, candidateId) =>
  run(C.getNeedAssessmentStatusSummary, { params: { unitId, candidate_id: String(candidateId) } });

export const getUnitImprovement = (unitId) => run(C.getLessonImprovements, { params: { unitId } });
export const createUnitImprovement = (body) => run(C.createLessonImprovement, { body });
export const updateUnitImprovement = (id, body) => run(C.updateLessonImprovement, { params: { id }, body });
export const deleteUnitImprovement = (id) => run(C.deleteUnitImprovement, { params: { id } });

export const getLeaderMarks = async (unitId) => { await ensureStaff(); return run(C.getLeaderMarks, { params: { unitId } }); };
export const createLeaderMarks = async (body) => { await ensureStaff(); return run(C.createLeaderMarks, { body }); };
export const updateLeaderMarks = async (id, body) => { await ensureStaff(); return run(C.updateLeaderMarks, { params: { id }, body }); };
export const deleteLeaderMark = (id) => run(C.deleteLeaderMark, { params: { id } });

export const getEffortBu = (unitId, candidateId, filters = {}) =>
  run(C.getEffortBu, { params: { unitId, candidate_id: String(candidateId) }, query: dateQuery(filters) });

export const createAssessmentChain = (body) => run(C.createAssessmentChain, { body });
export const getAssessmentChain = (unitId, candidateId) => run(C.getAssessmentChainData, { params: { unitId, candidateId } });
export const getAssessmentChainById = (id) => run(C.getAssessmentChainById, { params: { id } });
export const updateAssessmentChain = (id, body) => run(C.updateAssessmentChain, { params: { id }, body });
export const deleteAssessmentChain = (id) => run(C.deleteAssessmentChain, { params: { id } });
