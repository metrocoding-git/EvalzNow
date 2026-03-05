"use client";

import { useSearchParams } from "next/navigation";

export default function HelpViewer() {
  const searchParams = useSearchParams();
  const file = searchParams.get("file");

  if (!file) return <div className="text-center mt-20">No file selected</div>;

  // URL encode filename to prevent 404
  const encodedFile = encodeURIComponent(file);

  return (
    <div className="w-full h-screen">
      <iframe
        src={`/docs/${encodedFile}`}
        className="w-full h-full"
        title={file}
      />
    </div>
  );
}