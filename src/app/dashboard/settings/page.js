// app/dashboard/settings/page.jsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// This prevents pdfjs-dist from being imported during SSR/prerender
const SecurePdfViewer = dynamic(() => import("@/components/PdfViewers"), {
  ssr: false,
  loading: () => <div className="text-gray-400 text-center mt-20">Loading viewer...</div>,
});

const helpDocs = [
  "1.0 INTRODUCTION.pdf",
  "2.0 Brain Function and Causality.pdf",
  "3.0 EVALZNOW FUNDAMENTALS.pdf",
  "4.0 General Use - Education.pdf",
  "5.0 General Use - Industry.pdf",
  "6.0 Psychometrics and ML.pdf",
  "7.0 Issues - Pre-existing Models.pdf",
  "8.0 POLICY & LEGAL.pdf"
];

export default function SettingsPage() {
  const router = useRouter();
  const [selectedDoc, setSelectedDoc] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("activeClientId");
    sessionStorage.removeItem("selectedUnitId");
    router.push("/login");
  };

  const openDoc = (file) => setSelectedDoc(file);
  const removePdfExtension = (filename) => filename.replace(/\.pdf$/i, '');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Left Menu */}
      <div className="w-96 bg-white p-6 overflow-y-auto border-r border-gray-200 mb-35">
        <h3 className="text-lg text-left font-semibold mb-5">Help Documentation</h3>
        <ul className="space-y-1">
          {helpDocs.map((doc) => (
            <li
              key={doc}
              className={`cursor-pointer px-2 py-1 rounded ${
                selectedDoc === doc
                  ? "bg-gray-300"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => openDoc(doc)}
            >
              {removePdfExtension(doc)}
            </li>
          ))}
        </ul>
        <button
          onClick={handleLogout}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded mt-4"
        >
          Log Out
        </button>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-gray-50 overflow-auto p-4 pb-4 mb-40">
        {selectedDoc ? (
          <SecurePdfViewer file={selectedDoc} />
        ) : (
          <div className="text-gray-400 text-center mt-20 uppercase">
            Select a file to view.
          </div>
        )}
      </div>
    </div>
  );
}