'use client'; 

import CreateMaterialForm from '@/components/CreateMaterialForm';
import CurveEditor from '@/components/CurveEditor';
import MaterialEditor from '@/components/MaterialEditor';
import React, { useState } from 'react';

function Page() {
  const [showMaterialEditor, setShowMaterialEditor] = useState(true);

  return (
    <div >
      {showMaterialEditor && (
        <MaterialEditor onClose={() => setShowMaterialEditor(false)} />
      )}

      
        <CreateMaterialForm />
      
      <CurveEditor/>
    </div>
  );
}

export default Page;
