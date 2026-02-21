"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/webpack";

export default function SecurePdfViewer({ file }) {
  const canvasRef = useRef(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setPageNum(1); // Reset page when file changes
  }, [file]);

  useEffect(() => {
    if (!file) return;

    const loadPdf = async () => {
      try {
        const encodedFile = encodeURIComponent(file); // Encode spaces and special chars
        const pdf = await pdfjsLib.getDocument(`/docs/${encodedFile}`).promise;

        setTotalPages(pdf.numPages);

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    };

    loadPdf();
  }, [file, pageNum]);

  return (
    <div className="flex flex-col items-center h-full">
      <canvas ref={canvasRef} className="border shadow mb-4" />
      <div className="flex items-center gap-4">
        <button
          disabled={pageNum <= 1}
          onClick={() => setPageNum((p) => p - 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          ◀ Prev
        </button>
        <span className="text-sm">
          Page {pageNum} / {totalPages}
        </span>
        <button
          disabled={pageNum >= totalPages}
          onClick={() => setPageNum((p) => p + 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}