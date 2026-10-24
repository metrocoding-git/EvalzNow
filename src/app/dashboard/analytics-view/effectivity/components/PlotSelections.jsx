'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, RefreshCw, FolderOutput } from 'lucide-react';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Label,
  ScatterChart, Scatter, PieChart, Pie, ReferenceLine, Cell,
} from 'recharts';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';
import { html2canvas, ExcelJS, ensureExportLibs } from '@/lib/exportLibs';
import PropertyEditor from '../../components/PropertyEditor';
import { getCandidateEffectivity, getUnitEffectivity, saveEffectivity } from '@/services/effectivityService';
import EffectivityObject, { EFFECTIVITY_FIELD_LABELS } from './EffectivityObject';

const PARAMS = Array.from({ length: 10 }, (_, i) => i);
const pName = (i) => `Parameter ${String(i + 1).padStart(2, '0')}`;
const TYPE_COLORS = {
  Holistic: '#3b82f6',
  'Mission-Focused': '#10b981',
  'Not Applicable': '#9ca3af',
  'Proactive Dominant': '#f59e0b',
  'Reactive Dominant': '#ef4444',
};

// Plot list (Effectivity_Part1). Table = square icon, charts = circle icon.
const CANDIDATE_PLOTS = [
  { key: 'table', name: 'Effectivity Table', icon: '🟦', type: 'table' },
  ...PARAMS.map((i) => ({ key: `p${i}`, index: i, name: `Effectivity - ${pName(i)} vs. PP ID`, icon: '🔵', type: 'line' })),
  { key: 'type', name: 'Effectivity Type Tracking', icon: '🔵', type: 'pie' },
];
const UNIT_PLOTS = [
  ...PARAMS.map((i) => ({ key: `p${i}`, index: i, name: `Effectivity - ${pName(i)} vs. PP ID`, icon: '🔵', type: 'scatter' })),
  { key: 'type', name: 'Effectivity Type Tracking', icon: '🔵', type: 'pie' },
];

const fmt = (v) => (v === null || v === undefined || Number.isNaN(Number(v)) ? '-' : Number(v).toFixed(3));

const dashFor = (style) =>
  style === 'dashed' ? '6 4' : style === 'dotted' ? '2 4' : style === 'dashdot' ? '8 4 2 4' : '0';

export default function PlotSelections({ selectedSort, unitId, unitType, candidateId, candidates = [], filters, options, onResetFilters }) {
  const isUnitLevel = selectedSort === 'activateUnitLevel';
  const plots = isUnitLevel ? UNIT_PLOTS : CANDIDATE_PLOTS;

  const [selectedChart, setSelectedChart] = useState(null);
  const [activeTab, setActiveTab] = useState('Table');
  const [candidateData, setCandidateData] = useState(null);
  const [unitData, setUnitData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showObject, setShowObject] = useState(false);
  const [objectPpId, setObjectPpId] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [savingCell, setSavingCell] = useState(null);
  const chartContainerRef = useRef(null);

  const [chartProperties, setChartProperties] = useState({
    positiveVisibility: true,
    negativeVisibility: true,
    layer: 1,
    reference: false,
    showLabel: true,
    labelType: 'X Type',
    lineStyle: 'solid',
    lineColor: '#3b82f6',
    lineThickness: 2,
    symbolStyle: 'circle',
    symbolColor: '#3b82f6',
    positiveSymbolColor: '#10b981',
    negativeSymbolColor: '#ef4444',
    symbolFrequency: 1,
    symbolScaleSize: 3,
    shadeArea: '#ffffff',
    positiveLineColor: '#10b981',
    negativeLineColor: '#ef4444',
  });

  const thresholdOn = filters?.thresholdEnabled === true;

  // Keep the same plot (by key) when switching level, else pick the first one.
  useEffect(() => {
    setSelectedChart((prev) => plots.find((p) => p.key === prev?.key) || plots[0]);
  }, [isUnitLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  const candidateKey = Array.isArray(candidateId) ? candidateId.join(',') : candidateId;

  useEffect(() => {
    if (!unitId || (!isUnitLevel && !candidateId)) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (isUnitLevel) {
          const data = await getUnitEffectivity(unitId, Array.isArray(candidateId) ? candidateId : [], filters || {});
          if (!cancelled) setUnitData(data);
        } else {
          const data = await getCandidateEffectivity(unitId, candidateId, filters || {});
          if (!cancelled) setCandidateData(data);
        }
      } catch (err) {
        console.error('Effectivity load failed:', err);
        if (!cancelled) setError('Could not load effectivity data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [unitId, candidateKey, isUnitLevel, filters, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const thresholds = (isUnitLevel ? unitData?.thresholds : candidateData?.thresholds) || options?.thresholds?.[unitType] || [];
  const rows = candidateData?.rows || [];

  const nameOf = useCallback((cid) => {
    const c = candidates.find((x) => String(x.id) === String(cid));
    return c ? `${c.lastName}, ${c.firstName}` : `Candidate ${cid}`;
  }, [candidates]);

  // ---- series ---------------------------------------------------------------
  const series = useMemo(() => {
    if (selectedChart?.index === undefined) return { negative: [], positive: [] };
    const i = selectedChart.index;
    const points = isUnitLevel
      ? (unitData?.candidates || []).flatMap((c) =>
        c.rows
          .filter((r) => r.parameters)
          .map((r) => ({ ppId: r.ppId, value: r.parameters[i], candidate: nameOf(c.candidateId) })))
      : rows.filter((r) => r.parameters).map((r) => ({ ppId: r.ppId, value: r.parameters[i] }));
    return {
      negative: points.filter((p) => p.ppId < 0).sort((a, b) => b.ppId - a.ppId),
      positive: points.filter((p) => p.ppId > 0).sort((a, b) => a.ppId - b.ppId),
    };
  }, [selectedChart, isUnitLevel, unitData, rows, nameOf]);

  const typeBreakdown = isUnitLevel ? unitData?.typeBreakdown : candidateData?.typeBreakdown;
  const pieData = useMemo(() => {
    if (!typeBreakdown) return [];
    return Object.keys(typeBreakdown.counts)
      .map((name) => ({ name, value: typeBreakdown.percentages[name], count: typeBreakdown.counts[name] }))
      .filter((d) => d.count > 0);
  }, [typeBreakdown]);

  // ---- inline drop-down edit in the Effectivity Table -------------------------
  const handleCellChange = async (row, field, value) => {
    setSavingCell(`${row.ppId}-${field}`);
    try {
      const payload = { unitId: Number(unitId), candidateId: Number(candidateId), ppId: row.ppId };
      EFFECTIVITY_FIELD_LABELS.forEach(([k]) => { payload[k] = row[k] || null; });
      payload[field] = value || null;
      await saveEffectivity(payload);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Inline effectivity save failed:', err);
      toast.error('Could not save the change');
    } finally {
      setSavingCell(null);
    }
  };

  // ---- exports ----------------------------------------------------------------
  const exportAsJPG = async () => {
    if (!chartContainerRef.current) return toast.error('No chart available to export');
    try {
      const el = chartContainerRef.current;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false, scrollY: -window.scrollY });
      canvas.toBlob((blob) => saveAs(blob, 'Plot Extraction.jpg'), 'image/jpeg', 0.95);
    } catch (err) {
      console.error('JPG export failed:', err);
      toast.error('Failed to export as JPG');
    }
  };

  const exportTableExcel = async () => {
    try {
      await ensureExportLibs();
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Effectivity');
      const header = ['PP ID Callout', ...EFFECTIVITY_FIELD_LABELS.map(([, l]) => l), ...PARAMS.map(pName)];
      const addRows = (label, tableRows, average) => {
        if (label) ws.addRow([label]).font = { bold: true };
        const h = ws.addRow(header);
        h.font = { bold: true };
        tableRows.forEach((r) => ws.addRow([r.ppId, ...EFFECTIVITY_FIELD_LABELS.map(([k]) => r[k] || '-'), ...PARAMS.map((i) => (r.parameters ? r.parameters[i] : '-'))]));
        if (average) ws.addRow(['Average', '---', '---', '---', '---', '---', ...PARAMS.map((i) => (average.parameters ? average.parameters[i] : '-'))]).font = { bold: true };
        ws.addRow(['Threshold (Pass ≤)', '', '', '', '', '', ...thresholds]);
        ws.addRow([]);
      };
      if (isUnitLevel) {
        (unitData?.candidates || []).forEach((c) => addRows(nameOf(c.candidateId), c.rows, c.average));
      } else {
        addRows(null, rows, candidateData?.average);
      }
      ws.columns.forEach((col, idx) => { col.width = idx === 0 ? 18 : idx <= 5 ? 22 : 13; });
      const buffer = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `Effectivity_Table_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error('Excel export failed:', err);
      toast.error('Failed to export the table');
    }
  };

  // ---- rendering helpers -------------------------------------------------------
  const renderDot = (props, color) => {
    const { cx, cy } = props;
    if (cx === undefined || cy === undefined) return null;
    const r = chartProperties.symbolScaleSize;
    switch (chartProperties.symbolStyle) {
      case 'square': return <rect x={cx - r} y={cy - r} width={2 * r} height={2 * r} fill={color} />;
      case 'triangle': return <polygon points={`${cx},${cy - r} ${cx - r},${cy + r} ${cx + r},${cy + r}`} fill={color} />;
      case 'diamond': return <polygon points={`${cx},${cy - r} ${cx - r},${cy} ${cx},${cy + r} ${cx + r},${cy}`} fill={color} />;
      default: return <circle cx={cx} cy={cy} r={r} fill={color} />;
    }
  };

  const PointTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
      <div className="bg-white p-2 border rounded shadow text-xs">
        {p.candidate && <div><strong>Candidate:</strong> {p.candidate}</div>}
        <div><strong>PP ID (X):</strong> {p.ppId}</div>
        <div><strong>{pName(selectedChart.index)} (Y):</strong> {fmt(p.value)}</div>
      </div>
    );
  };

  const thresholdLine = selectedChart?.index !== undefined && thresholdOn && thresholds[selectedChart.index] !== undefined ? (
    <ReferenceLine y={thresholds[selectedChart.index]} stroke="#000000" strokeWidth={2} strokeDasharray="7 4 1 4"
      label={{ value: `Threshold ${fmt(thresholds[selectedChart.index])}`, position: 'insideTopRight', fill: '#b45309', fontSize: 12 }} />
  ) : null;

  const yDomain = [
    (dataMin) => (thresholdLine ? Math.min(dataMin, thresholds[selectedChart.index]) : dataMin),
    (dataMax) => (thresholdLine ? Math.max(dataMax, thresholds[selectedChart.index]) : dataMax),
  ];

  const passClass = (pass) => (!thresholdOn || pass === null || pass === undefined ? '' : pass ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50');

  const renderEffectivityTable = () => (
    <div ref={chartContainerRef} className="flex flex-col h-full min-h-0 bg-white">
      <h2 className="text-lg font-semibold mb-2 text-center">🟦 Effectivity Table</h2>
      <div className="flex-1 overflow-auto">
        <table className="text-xs border border-gray-300" style={{ width: 'max-content', minWidth: '100%' }}>
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="border border-gray-300 px-2 py-1 whitespace-nowrap">PP ID Callout</th>
              {EFFECTIVITY_FIELD_LABELS.map(([k, l]) => (
                <th key={k} className="border border-gray-300 px-2 py-1 whitespace-nowrap">{l}</th>
              ))}
              {PARAMS.map((i) => (
                <th key={i} className="border border-gray-300 px-2 py-1 whitespace-nowrap">{pName(i)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={16} className="text-center text-gray-400 py-4 italic">NO PERFORMANCE POINTS FOR THIS CANDIDATE</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.ppId} className="hover:bg-blue-50">
                <td className="border border-gray-300 px-2 py-1 text-center">{r.ppId}</td>
                {EFFECTIVITY_FIELD_LABELS.map(([k, l]) => (
                  <td key={k} className="border border-gray-300 px-1 py-0.5">
                    <select
                      aria-label={`${l} for PP ID ${r.ppId}`}
                      className="w-full bg-transparent px-1 py-0.5 text-xs disabled:opacity-50"
                      value={r[k] || ''}
                      disabled={savingCell !== null}
                      onChange={(e) => handleCellChange(r, k, e.target.value)}
                    >
                      <option value="">-</option>
                      {(options?.options?.[k] || []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                ))}
                {PARAMS.map((i) => (
                  <td key={i} className={`border border-gray-300 px-2 py-1 text-center ${passClass(r.pass?.[i])}`}>
                    {r.parameters ? fmt(r.parameters[i]) : '-'}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length > 0 && (
              <tr className="font-semibold bg-gray-50">
                <td className="border border-gray-300 px-2 py-1 text-center">Average</td>
                {EFFECTIVITY_FIELD_LABELS.map(([k]) => (
                  <td key={k} className="border border-gray-300 px-2 py-1 text-center">---</td>
                ))}
                {PARAMS.map((i) => (
                  <td key={i} className={`border border-gray-300 px-2 py-1 text-center ${passClass(candidateData?.average?.pass?.[i])}`}>
                    {fmt(candidateData?.average?.parameters?.[i])}
                  </td>
                ))}
              </tr>
            )}
            {thresholdOn && rows.length > 0 && (
              <tr className="text-gray-600">
                <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap">Threshold (Pass ≤)</td>
                <td colSpan={5} className="border border-gray-300 px-2 py-1" />
                {PARAMS.map((i) => (
                  <td key={i} className="border border-gray-300 px-2 py-1 text-center">{fmt(thresholds[i])}</td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
       
      </div>
    </div>
  );

  const renderChart = () => {
    if (!selectedChart) return <div className="flex justify-center h-full text-gray-400 text-lg">SELECT PLOT</div>;
    if (loading) return <div className="flex justify-center h-full text-gray-400 text-sm pt-10">Loading...</div>;
    if (error) return <div className="flex justify-center h-full text-red-500 text-sm pt-10">{error}</div>;

    if (selectedChart.type === 'table') return renderEffectivityTable();

    if (selectedChart.type === 'pie') {
      return (
        <div ref={chartContainerRef} className="flex flex-col h-full p-4 bg-white overflow-hidden">
          <h2 className="text-lg font-semibold mb-2 text-center flex-shrink-0">{selectedChart.icon} {selectedChart.name}</h2>
          {pieData.length === 0 ? (
            <div className="text-center text-gray-400 italic pt-10">NO EFFECTIVITY TYPES RECORDED</div>
          ) : (
            <div className="flex-1 min-h-0 h-[60vh]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 30, left: 30, bottom: 70 }}>
                  <Tooltip formatter={(value, name, props) => [`${Number(value).toFixed(3)}  Count: ${props?.payload?.count}`, name]} />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '12px', paddingTop: '4px' }} />
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%"
                    label={({ value }) => Number(value).toFixed(3)} labelLine isAnimationActive={false}>
                    {pieData.map((d) => <Cell key={d.name} fill={TYPE_COLORS[d.name] || '#6b7280'} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      );
    }

    const empty = series.negative.length === 0 && series.positive.length === 0;
    const yLabel = pName(selectedChart.index);
    return (
      <div ref={chartContainerRef} className="flex flex-col h-full min-h-0" style={{ backgroundColor: chartProperties.shadeArea }}>
        <h2 className="text-lg font-semibold mb-2 text-center">{selectedChart.icon} {selectedChart.name}</h2>
        {empty ? (
          <div className="text-center text-gray-400 italic pt-10">NO DATA FOR SELECTED PLOT</div>
        ) : (
          <div className="w-full h-[68vh] flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              {selectedChart.type === 'line' ? (
                <LineChart margin={{ top: 20, right: 30, left: 30, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="ppId" domain={['auto', 'auto']} allowDuplicatedCategory={false}>
                    {(chartProperties.showLabel || chartProperties.labelType !== 'X Type') && <Label value="PP ID" position="insideBottom" offset={-10} />}
                  </XAxis>
                  <YAxis domain={yDomain} tickFormatter={(v) => Number(v).toFixed(3)}>
                    {(chartProperties.showLabel || chartProperties.labelType !== 'Y Type') && <Label value={yLabel} angle={-90} position="insideLeft" textAnchor="middle" offset={-10} />}
                  </YAxis>
                  <Tooltip content={<PointTooltip />} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }} />
                  {thresholdLine}
                  {chartProperties.negativeVisibility && (
                    <Line name="Negative PP IDs" type="linear" dataKey="value" data={series.negative} isAnimationActive={false}
                      stroke={chartProperties.negativeLineColor} strokeDasharray={dashFor(chartProperties.negativeLineStyle)}
                      strokeWidth={chartProperties.negativeLineThickness ?? 2}
                      dot={(props) => (props.index % chartProperties.symbolFrequency ? null : <g key={`n-${props.index}`}>{renderDot(props, chartProperties.symbolColor)}</g>)} />
                  )}
                  {chartProperties.positiveVisibility && (
                    <Line name="Positive PP IDs" type="linear" dataKey="value" data={series.positive} isAnimationActive={false}
                      stroke={chartProperties.positiveLineColor} strokeDasharray={dashFor(chartProperties.positiveLineStyle)}
                      strokeWidth={chartProperties.positiveLineThickness ?? 2}
                      dot={(props) => (props.index % chartProperties.symbolFrequency ? null : <g key={`p-${props.index}`}>{renderDot(props, chartProperties.symbolColor)}</g>)} />
                  )}
                </LineChart>
              ) : (
                <ScatterChart margin={{ top: 20, right: 30, left: 30, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="ppId" name="PP ID">
                    {(chartProperties.showLabel || chartProperties.labelType !== 'X Type') && <Label value="PP ID" offset={-10} position="insideBottom" />}
                  </XAxis>
                  <YAxis type="number" dataKey="value" name={yLabel} domain={yDomain} tickFormatter={(v) => Number(v).toFixed(3)}>
                    {(chartProperties.showLabel || chartProperties.labelType !== 'Y Type') && <Label value={yLabel} angle={-90} position="insideLeft" textAnchor="middle" offset={-10} />}
                  </YAxis>
                  <Tooltip content={<PointTooltip />} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }} />
                  {thresholdLine}
                  <Scatter name="Negative PP IDs" data={series.negative} hide={!chartProperties.negativeVisibility} isAnimationActive={false}
                    fill={chartProperties.negativeLineColor} shape={(props) => renderDot(props, chartProperties.negativeLineColor)} />
                  <Scatter name="Positive PP IDs" data={series.positive} hide={!chartProperties.positiveVisibility} isAnimationActive={false}
                    fill={chartProperties.positiveLineColor} shape={(props) => renderDot(props, chartProperties.positiveLineColor)} />
                </ScatterChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderDataTab = () => {
    if (!selectedChart) return <div className="text-center text-gray-400 py-4 italic">SELECT A CHART TO DISPLAY DATA</div>;
    if (selectedChart.type === 'pie' || selectedChart.type === 'table') {
      if (!typeBreakdown) return <div className="text-center text-gray-400 py-4 italic">NOT AVAILABLE FOR SELECTED CHART</div>;
      return (
        <table className="text-xs border border-gray-300 w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-2 py-1">Effectivity Type</th>
              <th className="border border-gray-300 px-2 py-1">Count</th>
              <th className="border border-gray-300 px-2 py-1">%</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(typeBreakdown.counts).map((t) => (
              <tr key={t}>
                <td className="border border-gray-300 px-2 py-1">{t}</td>
                <td className="border border-gray-300 px-2 py-1 text-center">{typeBreakdown.counts[t]}</td>
                <td className="border border-gray-300 px-2 py-1 text-center">{fmt(typeBreakdown.percentages[t])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    const all = [...series.negative, ...series.positive];
    if (!all.length) return <div className="text-center text-gray-400 py-4 italic">NOT AVAILABLE FOR SELECTED CHART</div>;
    return (
      <>
        {isUnitLevel && unitData?.passFractions && (
          <div className="text-xs text-gray-700 mb-2">
            Pass % ({pName(selectedChart.index)}, based on candidate averages): <strong>{fmt(unitData.passFractions[selectedChart.index])}</strong>
          </div>
        )}
        <table className="text-xs border border-gray-300" style={{ width: 'max-content', minWidth: '100%' }}>
          <thead className="bg-gray-100">
            <tr>
              {isUnitLevel && <th className="border border-gray-300 px-2 py-1">Candidate</th>}
              <th className="border border-gray-300 px-2 py-1">PP ID</th>
              <th className="border border-gray-300 px-2 py-1">{pName(selectedChart.index)}</th>
            </tr>
          </thead>
          <tbody>
            {all.map((p, idx) => (
              <tr key={idx} className="hover:bg-blue-50">
                {isUnitLevel && <td className="border border-gray-300 px-2 py-1">{p.candidate}</td>}
                <td className="border border-gray-300 px-2 py-1 text-center">{p.ppId}</td>
                <td className={`border border-gray-300 px-2 py-1 text-center ${thresholdOn ? (p.value <= thresholds[selectedChart.index] ? 'text-green-700' : 'text-red-600') : ''}`}>{fmt(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };

  return (
    <>
      <h2 className="text-md font-bold bg-gray-100 p-2 flex items-center relative">
        <span className="pl-2 text-md">Plot Selections</span>
        <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
        {showObject && (
          <div className="absolute top-0 left-0 z-50 w-[560px] h-[400px] bg-white shadow-2xl border border-gray-200 rounded-md">
            <EffectivityObject
              unitId={unitId}
              candidateId={candidateId}
              rows={rows}
              options={options}
              initialPpId={objectPpId}
              onClose={() => setShowObject(false)}
              onSaved={() => setRefreshKey((k) => k + 1)}
            />
          </div>
        )}
      </h2>
      <div className="flex flex-1 min-h-100 w-full my-2">
        <div className="w-6/12 lg:w-4/12 flex flex-col border-2 h-full border-gray-200 p-1">
          <div className="flex items-center justify-between px-1 mx-1 text-gray-700">
            <h2 className="text-sm font-semibold">Plots</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setObjectPpId(null); setShowObject(true); }}
                disabled={isUnitLevel}
                title={isUnitLevel ? 'Switch to Candidate Level to add an Effectivity Object' : 'Add Effectivity Object'}
                className="text-blue-600 hover:text-blue-800 cursor-pointer disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button onClick={() => onResetFilters?.()} title="Reset Filter" className="text-blue-600 hover:text-blue-800 cursor-pointer">
                <RefreshCw className="w-4 h-4 hover:text-green-600" />
              </button>
              <div className="relative">
                <button onClick={() => setShowExportMenu(!showExportMenu)} title="Export" className="text-blue-600 hover:text-blue-800 cursor-pointer pt-2">
                  <FolderOutput className="w-4 h-4" />
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-[160px]">
                    <button onClick={() => { exportAsJPG(); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Export as JPG</button>
                    <button onClick={() => { exportTableExcel(); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Export Table (Excel)</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-full overflow-hidden w-full my-2">
            <div className="h-[35%] flex flex-col border border-gray-200">
              <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-12 bg-gray-100 text-gray-600 sticky top-0 z-10 text-sm border-b border-gray-200">
                  <div className="col-span-9 px-1 py-1 text-left">Entities</div>
                  <div className="col-span-3 py-1 text-left">ID</div>
                </div>
                <div>
                  {plots.map((chart, index) => (
                    <div
                      key={chart.key}
                      className={`grid grid-cols-12 items-center gap-2 px-2 py-1 cursor-pointer ${selectedChart?.key === chart.key ? 'bg-gray-100' : 'hover:bg-gray-200'}`}
                      onClick={() => setSelectedChart(chart)}
                    >
                      <div className="col-span-9 text-xs text-gray-700 truncate">{chart.icon} {chart.name}</div>
                      <div className="col-span-3 pl-3 text-xs text-gray-400">{index + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-[65%] flex flex-col border border-gray-200">
              <div className="flex space-x-2 border-b p-2">
                {['Property editor', 'Table'].map((tab) => (
                  <button
                    key={tab}
                    className={`px-3 py-1 text-sm cursor-pointer ${activeTab === tab
                      ? 'text-black bg-white border-t-2 border-blue-400 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800 border-t border-r border-b-transparent border-gray-300 hover:bg-white'}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'Property editor' ? 'Property Editor' : 'Table'}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-auto p-2 h-full mb-8">
                {activeTab === 'Property editor' ? (
                  selectedChart && (selectedChart.type === 'line' || selectedChart.type === 'scatter') ? (
                    <PropertyEditor properties={chartProperties} onChange={setChartProperties} selectedChart={selectedChart} />
                  ) : (
                    <div className="text-sm text-center text-gray-400 py-4 italic">NOT AVAILABLE FOR SELECTED CHART</div>
                  )
                ) : (
                  <div className="text-sm text-gray-600 mt-2 w-full overflow-auto">{renderDataTab()}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-6/12 lg:w-8/12 flex flex-col h-full bg-white border-2 border-l-0 border-gray-200 p-2 min-h-0">
          {renderChart()}
        </div>
      </div>
    </>
  );
}
