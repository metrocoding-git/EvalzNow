/**
 * Capsule Stat Distributions – same functions and payloads as unitDistributionService, computed in the
 * browser with the server distribution logic (src/lib/capsule/distributions, generated from the server).
 * payload.unitId is the capsule id.
 */
import { getNormalDistributionData as normal } from "@/lib/capsule/distributions/normal";
import { getTDistributionData as tDist } from "@/lib/capsule/distributions/tDistribution";
import { getExponetialDistributionData as exponential } from "@/lib/capsule/distributions/exponential";
import { getChiDistributionData as chi } from "@/lib/capsule/distributions/chiSquare";
import { getFDistributionData as fDist } from "@/lib/capsule/distributions/fDistribution";
import { getBetaDistributionData as beta } from "@/lib/capsule/distributions/beta";
import { getUniformDistributionData as uniform } from "@/lib/capsule/distributions/uniform";
import { getWeibullCDFDistributionData as weibullCdf } from "@/lib/capsule/distributions/weibullCdf";
import { getWeibullPDFDistributionData as weibullPdf } from "@/lib/capsule/distributions/weibullPdf";
import { getWeibullRiskDistributionData as weibullRisk } from "@/lib/capsule/distributions/weibullRisk";

/** Runs a server-style (req, res) handler and resolves with what it sends. */
function run(handler, payload) {
  return new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(data) {
        if (this.statusCode >= 400) {
          const err = new Error(data?.message || "Distribution error");
          err.response = { status: this.statusCode, data };
          reject(err);
        } else {
          resolve(data);
        }
        return this;
      },
    };
    Promise.resolve(handler({ body: payload, query: payload, params: {} }, res)).catch(reject);
  });
}

export const getNormalDistributionData = (payload) => run(normal, payload);
export const getTDistributionData = (payload) => run(tDist, payload);
export const getExponentialDistributionData = (payload) => run(exponential, payload);
export const getChiDistributionData = (payload) => run(chi, payload);
export const getChilDistributionData = (payload) => run(chi, payload);
export const getFDistributionData = (payload) => run(fDist, payload);
export const getBetaDistributionData = (payload) => run(beta, payload);
export const getUniformDistributionData = (payload) => run(uniform, payload);
export const getWeibullCDFDistributionData = (payload) => run(weibullCdf, payload);
export const getWeibullPDFDistributionData = (payload) => run(weibullPdf, payload);
export const getWeibullRiskDistributionData = (payload) => run(weibullRisk, payload);
