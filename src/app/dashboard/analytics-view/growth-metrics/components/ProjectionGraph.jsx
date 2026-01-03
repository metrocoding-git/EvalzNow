import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function GrowthProjectionChart({ data, title, lineColor = "#3b82f6", thirdPPDayCount }) {

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
          <h2 className="text-lg font-semibold mb-2 text-center">{title}</h2>
          <div className="flex justify-center items-center h-64 text-gray-400">
            No projection data available
          </div>
        </div>
      );
    }
  
    return (
      <div className="p-4 bg-white rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-2 text-center">{title}</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="dayCount" 
              type="number"
              label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis 
              label={{ value: 'Growth Differential', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />

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
        
        {/* Legend for Growth Projection Meaning */}
        <div className="mt-3 text-xs text-gray-600 text-center space-y-1">
          <div className="font-semibold">Projection Legend</div>
          <div className="flex justify-center space-x-4 mt-1">
            <div className="flex items-center space-x-1">
              <span className="w-4 h-0.5 bg-blue-500 inline-block"></span>
              <span>Linear Extrapolation</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-4 h-0.5 bg-red-500 inline-block"></span>
              <span>Cubic Spline Extrapolation</span>
            </div>
          </div>
        </div>
      </div>
    );
  };