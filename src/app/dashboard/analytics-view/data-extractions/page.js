"use client";
import { useState } from "react";

export default function DataExtractions() {
    const [activeTab, setActiveTab] = useState("Data Extractions");
    
    return (
        <div>
        <h1 className="text-2xl font-bold">Data Extractions</h1>
        <p className="mt-4">This is the Data Extractions page.</p>
    </div>  
    );
}