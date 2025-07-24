'use client';
import DisplayArea from '@/components/DisplayArea';
import MainTabs from '@/components/MainTabs';
import React, { useState } from 'react'

export default function InsertScores() {
    const [showDisplay, setShowDisplay] = useState(true);
    return (
        <>
            {/* Left panel with Input and Editor stacked vertically */}
            <div className="w-6/12 lg:w-3/12 border-r flex flex-col">

                {/* Tabs right below top ribbon */}
                <MainTabs />

            </div>

        </>
    )
}
