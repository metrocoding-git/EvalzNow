import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function GrowthProjectionChart({ data, title, lineColor = "#3b82f6", thirdPPDayCount }) {

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow text-sm">
          {/* ✅ Add "Days:" label */}
          <div>
            <strong>Days:</strong> {Number(label).toFixed(2)}
          </div>
  
          {/* Show values */}
          {payload.map((entry, index) => (
            <div key={index}>
              <strong>{entry.name}:</strong>{" "}
              {Number(entry.value).toFixed(3)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  
  const metricSuffix = title?.split(" - ")[1] || "";
  const ppPlus15 =
    typeof thirdPPDayCount === "number"
      ? thirdPPDayCount + 15
      : null;

  const ppPlus30 =
    typeof thirdPPDayCount === "number"
      ? thirdPPDayCount + 30
      : null;
      
    if (!data || data.length === 0) {
      return (
        <div className="p-4 bg-white rounded-xl shadow-sm">
          {/* <h2 className="text-lg font-semibold mb-2 text-center">{title}</h2> */}
          <div className="flex justify-center items-center h-64 text-gray-400">
            No projection data available
          </div>
        </div>
      );
    }
  
    return (
      <div className="w-full h-full">
        {/* <h2 className="text-lg font-semibold mb-2 text-center">{title}</h2> */}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 75 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="dayCount" 
              type="number"
              label={{ value: 'Days', position: 'insideBottom', offset: -10 }}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis 
              label={{ value: `Growth Differential ${metricSuffix}`, angle: -90, position: "insideLeft",
                textAnchor: "middle",
                offset: -5, }}
                tickFormatter={(value) => Number(value).toFixed(3)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 20, paddingLeft: 35 }} />

            {ppPlus15 !== null && (
              <ReferenceLine
                x={ppPlus15}
                stroke="#dc2626"
                strokeWidth={2}
                strokeDasharray="6 4"
                label={{
                  value: "3rd PP + 15",
                  position: "top",
                  fill: "#dc2626",
                  fontSize: 12,
                }}
              />
            )}

            {/* 🔵 Third PP + 30 */}
            {ppPlus30 !== null && (
              <ReferenceLine
                x={ppPlus30}
                stroke="#2563eb"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: "3rd PP + 30",
                  position: "top",
                  fill: "#2563eb",
                  fontSize: 12,
                }}
              />
            )}
            
            {/* Blue line (Linear Projection) */}
            <Line
              type="monotone"
              dataKey="l"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Linear Projection"
            />
            
            {/* Red line (Spline Projection) */}
            <Line
              type="monotone"
              dataKey="s"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name="Cubic Spline Projection"
            />
          </LineChart>
        </ResponsiveContainer>
        
      
      </div>
    );
  };