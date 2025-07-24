'use client';


import React, { useState } from 'react';
import { Plus, Trash2, Copy, Search, X } from 'lucide-react';

export default function UnitRoster() {
  const [curves, setCurves] = useState([{ id: 1, name: 'curve1' }, { id: 2, name: 'curve2' }, { id: 3, name: 'curve3' }, { id: 4, name: 'curve4' }, { id: 5, name: 'curve5' }, { id: 6, name: 'curve6' }, { id: 7, name: 'curve7' }, { id: 8, name: 'curve8' }, { id: 9, name: 'curve9' }, { id: 10, name: 'curve10' }, { id: 11, name: 'curve11' }, { id: 12, name: 'curve12' }]);
  const [selectedCurveId, setSelectedCurveId] = useState(1);
  const [showCreateMaterial, setShowCreateMaterial] = useState(false);

  const [points, setPoints] = useState(
    Array.from({ length: 20 }, () => ({ x: '', y: '' }))
  );
  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('table');

  const handlePointChange = (index, field, value) => {
    const updated = [...points];
    updated[index][field] = value;
    setPoints(updated);
  };



  const handleDeleteCurve = () => {
    const updated = curves.filter((c) => c.id !== selectedCurveId);
    setCurves(updated);
    if (updated.length > 0) {
      setSelectedCurveId(updated[0].id);
    } else {
      setSelectedCurveId(null);
    }
  };

  if (!visible) return null;

  return (
    <>
      <div className="flex-grow h-2/5 border-2 border-blue-500 rounded-md flex flex-col ">
        <h2 className="text-md font-bold bg-gray-100 p-2 flex items-center">
          <span className='pl-2 text-md'>Unit Config</span>
          <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
        </h2>

        <div className="flex items-center justify-between mb-3 px-1 mx-1 mt-1 text-gray-700 ">
          <h2 className="text-sm font-semibold">Unit Roster</h2>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowCreateMaterial(true)} title="Create Material" className='text-blue-600 hover:text-blue-800 cursor-pointer'>
              <Plus className="w-4 h-4 hover:text-green-600" />
            </button>
            <button onClick={handleDeleteCurve} title="Delete Curve" className='text-red-600 hover:text-red-800 cursor-pointer'>
              <Trash2 className="w-4 h-4 hover:text-red-600" />
            </button>
            <button title="Search Curve" className='text-gray-600 hover:text-gray-800 cursor-pointer' >
              <Search className="w-4 h-4 hover:text-gray-500" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto px-3 ">
          <div className="flex-1 border-2 border-blue-200 rounded-md overflow-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-1 border">Entities</th>
                  <th className="p-1 border">ID</th>
                </tr>
              </thead>
              <tbody>
                {curves.map((curve) => (
                  <tr
                    key={curve.id}
                    className={`cursor-pointer hover:bg-blue-50 ${selectedCurveId === curve.id ? 'bg-blue-100' : ''}`}
                    onClick={() => setSelectedCurveId(curve.id)}
                  >
                    <td className="p-1 border">{curve.name}</td>
                    <td className="p-1 border">{curve.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <div className="h-3/5 overflow-auto my-2">
        <div className="border-2 border-blue-500 rounded-md flex flex-col">
          {/* Tab Buttons */}
          <div className="flex space-x-2 border-b p-2">
            <button
              className={`px-3 py-1 text-sm rounded-t ${activeTab === 'property'
                ? 'bg-blue-100 text-blue-600 font-semibold'
                : 'hover:bg-gray-100'
                }`}
              onClick={() => setActiveTab('property')}
            >
              Property Editor
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-t ${activeTab === 'table'
                ? 'bg-blue-100 text-blue-600 font-semibold'
                : 'hover:bg-gray-100'
                }`}
              onClick={() => setActiveTab('table')}
            >
              Table
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-2">
            {activeTab === 'table' && (
              <table className="w-full border text-left text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-1 w-10 text-center">#</th>
                    <th className="border p-1">Last Name</th>
                    <th className="border p-1">First Name</th>
                    <th className="border p-1">Candidate ID</th>
                    <th className="border p-1">Date of Birth</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((point, index) => (
                    <tr key={index}>
                      <td className="border p-1 text-center">{index + 1}</td>
                      <td className="border p-1">
                        <input
                          type="text"
                          value={point.x}
                          onChange={(e) =>
                            handlePointChange(index, 'x', e.target.value)
                          }
                          className="w-full border px-2 py-0.5 rounded"
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="text"
                          value={point.y}
                          onChange={(e) =>
                            handlePointChange(index, 'y', e.target.value)
                          }
                          className="w-full border px-2 py-0.5 rounded"
                        />
                      </td>

                      <td className="border p-1">
                        <input
                          type="text"
                          value={point.y}
                          onChange={(e) =>
                            handlePointChange(index, 'y', e.target.value)
                          }
                          className="w-full border px-2 py-0.5 rounded"
                        />
                      </td>


                      <td className="border p-1">
                        <input
                          type="text"
                          value={point.y}
                          onChange={(e) =>
                            handlePointChange(index, 'y', e.target.value)
                          }
                          className="w-full border px-2 py-0.5 rounded"
                        />
                      </td>


                      
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'property' && (
              <div className="text-sm text-gray-600 mt-2">
                <p className="mb-1">Name: curve{selectedCurveId}</p>
                <p className="mb-1">ID: {selectedCurveId}</p>
                <p className="mb-1">Type: Linear</p>
                <p className="italic text-gray-400 mt-3">Add More properties here…</p>
              </div>
            )}
          </div>
        </div>
      </div>


    </>
  );
}
