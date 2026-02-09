"use client";

import { useSearchParams } from "next/navigation";

export default function HelpViewer() {
  const searchParams = useSearchParams();
  const file = searchParams.get("file");

  return (
    <div className="w-full h-screen">
      <iframe
        src={`/docs/${file}`}
        className="w-full h-full"
      />
    </div>
  );
}
