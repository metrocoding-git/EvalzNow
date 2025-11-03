"use client";
import React, { useState, useMemo } from "react";


// This script is used to calculate the values in the Growth Projection table for the Tabulations of Candidate Analysis
//------------------------------------------------------------------------------------------------------
//spline 2nd derivative at x2
const calculateZ2 = (m1, m2, m3, x1, x2, x3, x4) => {
  let numerator =
    m3 * x2 +
    m2 * x3 -
    m3 * x3 +
    2 * m2 * x4 +
    2 * m1 * x2 -
    2 * m1 * x4 -
    3 * m2 * x2;
  let denominator = 4 * (x1 * x2 + x3 * x4 - x1 * x4) - Math.pow(x2 + x3, 2);
  let result = 6 * (numerator / denominator);
  return result;
};

//spline 2nd derivative at x3
const calculateZ3 = (m1, m2, m3, x1, x2, x3, x4) => {

  let numerator =
    m2 * x2 +
    m1 * x3 -
    m1 * x2 +
    2 * m2 * x1 +
    2 * m3 * x3 -
    2 * m3 * x1 -
    3 * m2 * x3;
  let denominator = 4 * (x1 * x2 + x3 * x4 - x1 * x4) - Math.pow(x2 + x3, 2);
  let result = 6 * (numerator / denominator);
  return result;
};

const calculateLinearExtrapolation = (m3, x, x4, y4) => {
  let result = m3 * (x - x4) + y4;
  return result;
};

const calculateC3 = (a3, b3, x, x3, x4) => {
  let result =
    a3 * Math.pow(x - x4, 2) * (x - x3) + b3 * (x - x4) * Math.pow(x - x3, 2);
  return result;
};

export function calculateProjectionValues(
  y1, //Growth differentials for ΔRRN/ΔPRN/ΔARN of selected performance points
  y2,
  y3,
  y4,
  x1, //Daycounts associated with selected performance points
  x2,
  x3,
  x4,
  dayCount //daycount target beyond performance point PP3 selection
) {

  let data = [];

  let m1 = (y2 - y1) / (x2 - x1); //piecewise linear slopes
  let m2 = (y3 - y2) / (x3 - x2);
  let m3 = (y4 - y3) / (x4 - x3);
  let z2 = calculateZ2(m1, m2, m3, x1, x2, x3, x4); //spline 2nd derivative at x2
  let z3 = calculateZ3(m1, m2, m3, x1, x2, x3, x4); //spline 2nd derivative at x3
  let a1 = z2 / (6 * (x1 - x2)); //cubic coefficients
  let a2 = (2 * z2 + z3) / (6 * (x2 - x3));
  let a3 = z3 / (3 * (x3 - x4));
  let b1 = (2 * z2) / (6 * (x2 - x1));
  let b2 = (2 * z3 + z2) / (6 * (x3 - x2));
  let b3 = z3 / (6 * (x4 - x3));
  let l3 = calculateLinearExtrapolation(m3, x3 + dayCount, x4, y4); //Final piecewise segment before course termination
  let c3 = calculateC3(a3, b3, x3 + dayCount, x3, x4); //Final cubic correction before course termination
  let s3 = l3 + c3; //natural spline before course termination

  // s3 is the overshoot value for ΔRRN/ΔPRN/ΔARN
  // l3 is the undershoot value for ΔRRN/ΔPRN/ΔARN

  data.push(
    parseFloat(l3), // numeric undershoot
    parseFloat(s3)  // numeric overshoot
  );
  return data;
  

  // return {
  //   l3,
  //   s3,
  // };
}


export default function ProjectionTable({ visible, onClose, projectionData = [] }) {
  if (!visible) return null;

  const columns = [
    "Callout",
    "PP ID",
    "RRN",
    "PRN",
    "ARN",
    "IC",
    "ΔRRN",
    "ΔPRN",
    "ΔARN",
    "Day Count",
  ];

  const [rows, setRows] = useState([
    { Callout: "First PP Selection", PP_ID: 0, RRN: 0, PRN: 0, ARN: 0, IC: 0, ΔRRN: 0, ΔPRN: 0, ΔARN: 0, DayCount: 0 },
    { Callout: "Second PP Selection", PP_ID: 0, RRN: 0, PRN: 0, ARN: 0, IC: 0, ΔRRN: 0, ΔPRN: 0, ΔARN: 0, DayCount: 0 },
    { Callout: "Third PP Selection", PP_ID: 0, RRN: 0, PRN: 0, ARN: 0, IC: 0, ΔRRN: 0, ΔPRN: 0, ΔARN: 0, DayCount: 0 },
    { Callout: "Projection Termination Point", PP_ID: "-", RRN: "-", PRN: "-", ARN: "-", IC: "-", ΔRRN: 0, ΔPRN: 0, ΔARN: 0, DayCount: 0 },
    { Callout: "Overshoot", PP_ID: 0, RRN: 0, PRN: 0, ARN: 0, IC: 0, ΔRRN: 0, ΔPRN: 0, ΔARN: 0, DayCount: 0 },
    { Callout: "Undershoot", PP_ID: 0, RRN: 0, PRN: 0, ARN: 0, IC: 0, ΔRRN: 0, ΔPRN: 0, ΔARN: 0, DayCount: 0 },
    { Callout: "Average", PP_ID: 0, RRN: 0, PRN: 0, ARN: 0, IC: 0, ΔRRN: 0, ΔPRN: 0, ΔARN: 0, DayCount: 0 },
    { Callout: "Overshoot ", PP_ID: 0, RRN: 0, PRN: 0, ARN: 0, IC: 0, ΔRRN: 0, ΔPRN: 0, ΔARN: 0, DayCount: 0 },
    { Callout: "Undershoot ", PP_ID: 0, RRN: 0, PRN: 0, ARN: 0, IC: 0, ΔRRN: 0, ΔPRN: 0, ΔARN: 0, DayCount: 0 },
    { Callout: "Average ", PP_ID: 0, RRN: 0, PRN: 0, ARN: 0, IC: 0, ΔRRN: 0, ΔPRN: 0, ΔARN: 0, DayCount: 0 },

  ]);

  const safeNum = (val) => (isNaN(parseFloat(val)) ? 0 : parseFloat(val));

  // ✅ Extract sorted, unique ppIds > 0
  const allPpIds = useMemo(
    () =>
      Array.from(new Set(projectionData.map((d) => Number(d.ppId))))
        .filter((id) => id > 0)
        .sort((a, b) => a - b),
    [projectionData]
  );

  // ✅ Handle dropdown selection
  const handlePPChange = (idx, value) => {
    const selectedData = projectionData.find((d) => Number(d.ppId) === Number(value));
  
    setRows((prev) => {
      const updated = prev.map((row, i) => {
        if (i === idx && selectedData) {
          return {
            ...row,
            PP_ID: Number(value),
            RRN: selectedData.RR ?? 0,
            PRN: selectedData.PR ?? 0,
            ARN: selectedData.AR ?? 0,
            IC: selectedData.IC ?? "",
            ΔRRN: selectedData["ΔRR"] ?? 0,
            ΔPRN: selectedData["ΔPR"] ?? 0,
            ΔARN: selectedData["ΔAR"] ?? 0,
            DayCount: selectedData.dayCount ?? 0,
          };
        }
        if (i === idx && Number(value) === 0) {
          // Reset
          return {
            ...row,
            PP_ID: 0,
            RRN: 0,
            PRN: 0,
            ARN: 0,
            IC: 0,
            ΔRRN: 0,
            ΔPRN: 0,
            ΔARN: 0,
            DayCount: 0,
          };
        }
        return row;
      });
  
      // ✅ Update Termination Point
      const third = updated[2];
      const terminationRowIndex = 3;
      updated[terminationRowIndex] = {
        ...updated[terminationRowIndex],
        PP_ID: "-",
        RRN: "-",
        PRN: "-",
        ARN: "-",
        IC: "-",
        ΔRRN: 0,
        ΔPRN: 0,
        ΔARN: 0,
        DayCount: (third.DayCount ?? 0) + 31,
      };
  
      // ✅ Only proceed when 3 PPs are selected
      const first = updated[0];
      const second = updated[1];
      // if (first.PP_ID && second.PP_ID && third.PP_ID) {
        const dayCount = 15; // As per your rule
  
        // 🔹 ΔRRN Projection
        const [underRRN, overRRN] = calculateProjectionValues(
          first.ΔRRN, second.ΔRRN, third.ΔRRN, third.ΔRRN, // last repeated (no 4th)
          first.DayCount, second.DayCount, third.DayCount, third.DayCount + 1, // dummy x4
          dayCount
        );
  
        // 🔹 ΔPRN Projection
        const [underPRN, overPRN] = calculateProjectionValues(
          first.ΔPRN, second.ΔPRN, third.ΔPRN, third.ΔPRN,
          first.DayCount, second.DayCount, third.DayCount, third.DayCount + 1,
          dayCount
        );
  
        // 🔹 ΔARN Projection
        const [underARN, overARN] = calculateProjectionValues(
          first.ΔARN, second.ΔARN, third.ΔARN, third.ΔARN,
          first.DayCount, second.DayCount, third.DayCount, third.DayCount + 1,
          dayCount
        );
  
        const safeNum = (val) => (isNaN(parseFloat(val)) ? 0 : parseFloat(val));

        // ✅ Update Overshoot (row 4)
        updated[4] = {
          ...updated[4],
          PP_ID: `${dayCount} days`,
          DayCount: third.DayCount + 15,
          ΔRRN: overRRN.toFixed(3),
          ΔPRN: overPRN.toFixed(3),
          ΔARN: overARN.toFixed(3),
          RRN: (safeNum(third.RRN) + safeNum(overRRN)).toFixed(3),
          PRN: (safeNum(third.PRN) + safeNum(overPRN)).toFixed(3),
          ARN: (safeNum(third.ARN) + safeNum(overARN)).toFixed(3),
        };

        // ✅ Update Undershoot (row 5)
        updated[5] = {
          ...updated[5],
          PP_ID: `${dayCount} days`,
          DayCount: third.DayCount + 15,
          ΔRRN: underRRN.toFixed(3),
          ΔPRN: underPRN.toFixed(3),
          ΔARN: underARN.toFixed(3),
          RRN: (safeNum(third.RRN) + safeNum(underRRN)).toFixed(3),
          PRN: (safeNum(third.PRN) + safeNum(underPRN)).toFixed(3),
          ARN: (safeNum(third.ARN) + safeNum(underARN)).toFixed(3),
        };

  
        // ✅ Average row (row 6)
        updated[6] = {
          ...updated[6],
          PP_ID: dayCount + ' days',
          DayCount: third.DayCount + 15,
          ΔRRN: ((parseFloat(overRRN) + parseFloat(underRRN)) / 2).toFixed(3),
          ΔPRN: ((parseFloat(overPRN) + parseFloat(underPRN)) / 2).toFixed(3),
          ΔARN: ((parseFloat(overARN) + parseFloat(underARN)) / 2).toFixed(3),
          RRN: ((safeNum(first.RRN) + safeNum(second.RRN) + safeNum(third.RRN)) / 3).toFixed(3),
          PRN: ((safeNum(first.PRN) + safeNum(second.PRN) + safeNum(third.PRN)) / 3).toFixed(3),
          ARN: ((safeNum(first.ARN) + safeNum(second.ARN) + safeNum(third.ARN)) / 3).toFixed(3),
        };
      // }


      // 🔹 30-day projections
      const dayCount30 = 30;

      // Use 15-day Δs as base
      const prevOvershoot15 = updated[4];
      const prevUndershoot15 = updated[5];

      // ΔRRN Projection for 30 days
      const [underRRN30, overRRN30] = calculateProjectionValues(
        first.ΔRRN, second.ΔRRN, third.ΔRRN, third.ΔRRN,
        first.DayCount, second.DayCount, third.DayCount, third.DayCount + 1,
        dayCount30
      );

      // ΔPRN Projection for 30 days
      const [underPRN30, overPRN30] = calculateProjectionValues(
        first.ΔPRN, second.ΔPRN, third.ΔPRN, third.ΔPRN,
        first.DayCount, second.DayCount, third.DayCount, third.DayCount + 1,
        dayCount30
      );

      // ΔARN Projection for 30 days
      const [underARN30, overARN30] = calculateProjectionValues(
        first.ΔARN, second.ΔARN, third.ΔARN, third.ΔARN,
        first.DayCount, second.DayCount, third.DayCount, third.DayCount + 1,
        dayCount30
      );

      // ✅ Overshoot (30 days) - row 7
      updated[7] = {
        ...updated[7],
        PP_ID: `${dayCount30} days`,
        DayCount: third.DayCount + 30,
        ΔRRN: overRRN30.toFixed(3),
        ΔPRN: overPRN30.toFixed(3),
        ΔARN: overARN30.toFixed(3),
        RRN: (safeNum(prevOvershoot15.RRN) + safeNum(overRRN30)).toFixed(3),
        PRN: (safeNum(prevOvershoot15.PRN) + safeNum(overPRN30)).toFixed(3),
        ARN: (safeNum(prevOvershoot15.ARN) + safeNum(overARN30)).toFixed(3),
      };

      // ✅ Undershoot (30 days) - row 8
      updated[8] = {
        ...updated[8],
        PP_ID: `${dayCount30} days`,
        DayCount: third.DayCount + 30,
        ΔRRN: underRRN30.toFixed(3),
        ΔPRN: underPRN30.toFixed(3),
        ΔARN: underARN30.toFixed(3),
        RRN: (safeNum(prevUndershoot15.RRN) + safeNum(underRRN30)).toFixed(3),
        PRN: (safeNum(prevUndershoot15.PRN) + safeNum(underPRN30)).toFixed(3),
        ARN: (safeNum(prevUndershoot15.ARN) + safeNum(underARN30)).toFixed(3),
      };

      // ✅ Average (30 days) - row 9
      updated[9] = {
        ...updated[9],
        PP_ID: `${dayCount30} days`,
        DayCount: third.DayCount + 30,
        ΔRRN: ((parseFloat(overRRN30) + parseFloat(underRRN30)) / 2).toFixed(3),
        ΔPRN: ((parseFloat(overPRN30) + parseFloat(underPRN30)) / 2).toFixed(3),
        ΔARN: ((parseFloat(overARN30) + parseFloat(underARN30)) / 2).toFixed(3),
        RRN: ((safeNum(first.RRN) + safeNum(second.RRN) + safeNum(third.RRN)) / 3).toFixed(3),
        PRN: ((safeNum(first.PRN) + safeNum(second.PRN) + safeNum(third.PRN)) / 3).toFixed(3),
        ARN: ((safeNum(first.ARN) + safeNum(second.ARN) + safeNum(third.ARN)) / 3).toFixed(3),
      };

  
      return updated;
    });
  };



  // ✅ Available PP IDs logic
  // ✅ Available PP IDs logic
const availableByIndex = useMemo(() => {
  // Collect all PP IDs already used in any of the first three rows
  const usedPpIds = rows.slice(0, 3)
    .map(r => Number(r.PP_ID))
    .filter(id => id > 0);

  return rows.map((row, idx) => {
    if (idx >= 3) return [];

    return allPpIds.filter(id => {
      // Show only IDs that are NOT used in other selections
      // But allow the current row's own selection to stay visible
      return !usedPpIds.includes(id) || id === Number(row.PP_ID);
    });
  });
}, [rows, allPpIds]);


  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-5xl p-4 overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Projection Table</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 font-bold">
            X
          </button>
        </div>

        <div className="w-full overflow-auto border border-gray-200 rounded-lg">
          <table className="w-full whitespace-nowrap text-center text-xs divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-2 py-1 border border-gray-300 font-semibold text-gray-700"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const availablePpIds = idx < 3 ? availableByIndex[idx] : [];

                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 py-1 border border-gray-300">{row.Callout}</td>
                    <td className="px-2 py-1 border border-gray-300">
                      {idx < 3 ? (
                        <select
                          className="border rounded px-1 py-0.5 w-full text-xs text-center"
                          value={row.PP_ID}
                          onChange={(e) => handlePPChange(idx, Number(e.target.value))}
                        >
                          <option value={0}>Select</option>
                          {availablePpIds.map((id) => (
                            <option key={id} value={id}>
                              {id}
                            </option>
                          ))}
                        </select>
                      ) : (
                        row.PP_ID
                      )}
                    </td>

                    <td className="px-2 py-1 border border-gray-300">{row.RRN}</td>
                    <td className="px-2 py-1 border border-gray-300">{row.PRN}</td>
                    <td className="px-2 py-1 border border-gray-300">{row.ARN}</td>
                    <td className="px-2 py-1 border border-gray-300">{row.IC}</td>
                    <td className="px-2 py-1 border border-gray-300">{row.ΔRRN}</td>
                    <td className="px-2 py-1 border border-gray-300">{row.ΔPRN}</td>
                    <td className="px-2 py-1 border border-gray-300">{row.ΔARN}</td>
                    <td className="px-2 py-1 border border-gray-300">{row.DayCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
