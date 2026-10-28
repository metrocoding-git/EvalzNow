"use client";
import { useEffect, useState } from "react";
import DownloadLoader from "@/components/DownloadLoader";
import { getActiveCapsuleId, getActiveEntityType } from "@/lib/activeEntity";
import { getCapsuleById } from "@/services/capsuleService";
import { getUnitById } from "@/services/unitService";
import { downloadEZFile } from "../data-reports/downloadEZ";
import { downloadEZFilesAsZip } from "../data-reports/helper/downloadEZFilesAsZip";
import { auditFileName, buildCapsuleAudit, buildUnitAudit, listCapsules, listUnits } from "@/lib/auditStatus";

/**
 * Analytics View → Audit Status (Capacity_Part18). Audit files for the active Unit / all Units and the
 * active Capsule / all Capsules. Multiple files are zipped ("Audit Status Units" / "Audit Status Capsules").
 * The audit templates come from Rick; the file content is provisional until then (see src/lib/auditStatus.js).
 */
export default function AuditStatus() {
  const [mode, setMode] = useState(null);
  const [unit, setUnit] = useState(null);
  const [capsule, setCapsule] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [option, setOption] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const m = getActiveEntityType();
    setMode(m);
    setClientId(sessionStorage.getItem("activeClientId"));
    if (m === "unit") {
      const id = sessionStorage.getItem("selectedUnitId");
      if (id) getUnitById(id).then(setUnit).catch(() => setUnit(null));
    } else {
      getCapsuleById(getActiveCapsuleId()).then(setCapsule).catch(() => setCapsule(null));
    }
  }, []);

  const unitActive = mode === "unit" && !!unit;
  const capsuleActive = mode === "capsule" && !!capsule;

  const options = [
    { id: "active-unit", label: "Extract Audit Status for the Active Unit", disabled: !unitActive },
    { id: "all-units", label: "Extract Audit Status for All Units", disabled: false },
    { id: "active-capsule", label: "Extract Audit Status for the Active Capsule", disabled: !capsuleActive },
    { id: "all-capsules", label: "Extract Audit Status for All Capsules", disabled: false },
  ];

  const handleExtract = async () => {
    if (!option) return;
    setBusy(true);
    setMessage("");
    try {
      if (option === "active-unit") {
        await downloadEZFile(await buildUnitAudit(unit.id), auditFileName(unit.unitName, unit.unitId));
      } else if (option === "all-units") {
        const units = clientId ? await listUnits(clientId) : [];
        const files = [];
        for (const u of units || []) files.push({ filename: auditFileName(u.unitName, u.unitId), content: await buildUnitAudit(u.id) });
        if (!files.length) setMessage("No units found.");
        else await downloadEZFilesAsZip(files, "Audit Status Units.zip");
      } else if (option === "active-capsule") {
        await downloadEZFile(await buildCapsuleAudit(capsule.id), auditFileName(capsule.capsuleName, capsule.capsuleId));
      } else if (option === "all-capsules") {
        const capsules = await listCapsules();
        const files = [];
        for (const c of capsules) files.push({ filename: auditFileName(c.capsuleName, c.capsuleId), content: await buildCapsuleAudit(c.id) });
        if (!files.length) setMessage("No capsules found.");
        else await downloadEZFilesAsZip(files, "Audit Status Capsules.zip");
      }
    } catch (err) {
      console.error("Audit status extraction failed:", err);
      setMessage("Could not extract the audit status. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const details = unitActive
    ? [["Unit Name", unit.unitName], ["Unit ID", unit.unitId], ["Unit Type", unit.unitType], ["Signature Profile", unit.signatureProfile]]
    : capsuleActive
      ? [["Capsule Name", capsule.capsuleName], ["Capsule ID", capsule.capsuleId], ["Capsule Type", capsule.capsuleType], ["Signature Profile", capsule.signatureProfile]]
      : null;

  return (
    <div className="w-full flex flex-col">
      <div className="flex h-full overflow-hidden w-full m-1">
        <div className="w-6/12 lg:w-4/12 flex flex-col border-2 h-full border-gray-200">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 text-gray-800 font-semibold text-sm">Details</div>
          <div className="px-4 py-3">
            {details ? (
              <div className="border border-gray-200 p-1">
                {details.map(([l, v]) => (
                  <div key={l} className="text-sm text-gray-400">{l}: {v ?? "-"}</div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400">No Unit or Capsule is active.</div>
            )}
          </div>
        </div>
        <div className="w-6/12 lg:w-8/12 bg-white flex flex-col border-2 ml-1 h-full border-gray-200">
          <div className="flex-1 flex flex-col items-center justify-center pb-15 h-full bg-white shadow-md p-6 overflow-y-auto space-y-4">
            <div className="flex flex-col justify-center items-center text-base font-semibold text-gray-800 my-8 leading-relaxed">
              <p>EvalzNow – Human Capital & Education</p>
              <p>Quantitative and Qualitative Assessment</p>
              <p>Hybrid Proficiency & Growth Monitoring</p>
              <p>Audit Status Generation</p>
            </div>
            <div className="flex flex-col justify-center space-y-3 text-sm">
              {options.map((item) => (
                <div key={item.id} className={`flex items-center gap-2 ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
                  <input
                    id={item.id}
                    type="radio"
                    name="auditOption"
                    disabled={item.disabled}
                    onChange={() => setOption(item.id)}
                    className="w-4 h-4 text-gray-600 accent-black border-gray-300 focus:ring-black"
                  />
                  <label htmlFor={item.id} className={`text-gray-800 ${item.disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>{item.label}</label>
                </div>
              ))}
            </div>
            {message && <p className="text-sm text-gray-500">{message}</p>}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleExtract}
                disabled={!option || busy}
                className="w-32 mt-4 bg-gray-200 hover:bg-gray-300 font-medium px-5 py-2 transition disabled:opacity-50"
              >
                {busy ? "Processing..." : "Extract"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {busy && <DownloadLoader title="Extracting Audit Status..." />}
    </div>
  );
}
