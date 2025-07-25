"use client";
import { useState } from "react";

export default function DataReports() {
    const [activeTab, setActiveTab] = useState("Data Reports");

     return (
        <div>   
            <h1 className="text-2xl font-bold">Data Reports</h1>
            <p className="mt-4">This is the Data Reports page.</p>
        </div>
    );
}