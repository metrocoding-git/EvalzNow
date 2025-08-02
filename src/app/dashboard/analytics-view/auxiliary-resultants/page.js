"use client";
import { useState } from "react";

export default function AuxiliaryResultants() {
  return (
    <div className="w-full flex flex-col">
      <div className="h-full flex flex-col overflow-hidden m-1 p-1 border-1 border-gray-800 rounded-md">
        <div className="flex flex-col h-full">
          <div className="flex flex-row justify-between items-center p-2 bg-blue-200 rounded-t-md">
            <h2 className="text-lg font-semibold text-blue-600">Auxiliary Resultants</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
