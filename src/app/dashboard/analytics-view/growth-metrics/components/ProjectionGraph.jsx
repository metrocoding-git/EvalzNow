import { CartesianGrid, Label, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function GrowthProjectionChart({ data, title, lineColor = "#3b82f6", thirdPPDayCount, properties }) {

  const getStrokeDashArray = (style) => {
    switch (style) {
      case "dashed":
        return "6 4";
      case "dotted":
        return "2 2";
      case "dashdot":
        return "6 2 2 2";
      default:
        return undefined;
    }
  };
  
  const visibility = properties?.visibility ?? true;

  const showLabel = properties?.showLabel ?? true;

  const projectionLineColor =
    properties?.projectionLineColor || "#6366f1";
  
  const positiveLineColor =
    properties?.positiveLineColor || "#10b981";
  
  const lineThickness =
    properties?.lineThickness || 2;
  
  const lineStyle =
    properties?.lineStyle || "solid";
  
  const shadeArea =
    properties?.shadeArea || "#ffffff";

    const linearProjectionColor =
    properties?.positiveLineColor || "#10b981";

  const cubicSplineColor =
    properties?.projectionLineColor || "#6366f1";

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
        <div className=" bg-white rounded-xl">
          {/* <h2 className="text-lg font-semibold mb-2 text-center">{title}</h2> */}
          <div className="flex justify-center items-start h-100 pt-1 text-gray-400 uppercase">
            No projection data available
          </div>
        </div>
      );
    }
  
    return (
      <div
        className="w-full h-full rounded"
        style={{
          backgroundColor: shadeArea,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 75,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
  
            {/* X Axis */}
            <XAxis
              dataKey="dayCount"
              type="number"
              domain={["dataMin", "dataMax"]}
            >
              {showLabel && (
                <Label
                  value="Days"
                  position="insideBottom"
                  offset={-10}
                />
              )}
            </XAxis>
  
            {/* Y Axis */}
            <YAxis
              tickFormatter={(value) =>
                Number(value).toFixed(3)
              }
            >
              {showLabel && (
                <Label
                  value={`Growth Differential ${metricSuffix}`}
                  angle={-90}
                  position="insideLeft"
                  textAnchor="middle"
                  offset={-5}
                />
              )}
            </YAxis>
  
            <Tooltip content={<CustomTooltip />} />
  
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                paddingTop: 20,
                paddingLeft: 35,
              }}
            />
  
            {/* Reference Lines */}
  
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
  
            {/* Lines */}
  
            {visibility && (
              <>
                {/* Linear Projection */}
                <Line
                  type="monotone"
                  dataKey="l"
                  stroke={linearProjectionColor}
                  strokeWidth={lineThickness}
                  strokeDasharray={getStrokeDashArray(lineStyle)}
                  dot={false}
                  name="Linear Projection"
                />
  
                {/* Cubic Spline Projection */}
                <Line
                  type="monotone"
                  dataKey="s"
                  stroke={cubicSplineColor}
                  strokeWidth={lineThickness}
                  strokeDasharray={getStrokeDashArray(lineStyle)}
                  dot={false}
                  name="Cubic Spline Projection"
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };