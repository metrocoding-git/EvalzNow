"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/webpack";

export default function SecurePdfViewer({ file }) {
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // ✅ Reset page when file changes
  useEffect(() => {
    setPageNum(1);
  }, [file]);

  useEffect(() => {
    if (!file) return;

    let isMounted = true; // prevent state updates after unmount

    const loadPdf = async () => {
      try {
        const encodedFile = encodeURIComponent(file);
        const pdf = await pdfjsLib.getDocument(`/docs/${encodedFile}`).promise;

        if (!isMounted) return;

        setTotalPages(pdf.numPages);

        // ✅ Fix: prevent invalid page request
        if (pageNum > pdf.numPages) {
          setPageNum(pdf.numPages);
          return;
        }

        const safePage = Math.max(1, Math.min(pageNum, pdf.numPages));
        const page = await pdf.getPage(safePage);

        const viewport = page.getViewport({
          scale: 1.5,
          rotation: page.rotate || 0,
        });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        // Reset canvas
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // ✅ Cancel previous render safely
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const renderTask = page.render({
          canvasContext: context,
          viewport,
        });

        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (error) {
        if (error?.name !== "RenderingCancelledException") {
          console.error("Error loading PDF:", error);
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [file, pageNum]);

  return (
    <div className="flex flex-col items-center h-full">
      <canvas ref={canvasRef} className="border shadow mb-4" />

      <div className="flex items-center gap-4">
        <button
          disabled={pageNum <= 1}
          onClick={() => setPageNum((p) => Math.max(1, p - 1))}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          ◀ Prev
        </button>

        <span className="text-sm">
          Page {Math.min(pageNum, totalPages || 1)} / {totalPages}
        </span>

        <button
          disabled={pageNum >= totalPages}
          onClick={() => setPageNum((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}