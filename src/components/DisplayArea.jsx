import { Monitor, X } from 'lucide-react';

const DisplayArea = ({ onClose }) => {
  return (
    <div className="h-full border-2 border-blue-500 rounded-md m-2 flex flex-col">
      <div className="flex justify-between items-center bg-blue-100 px-4 py-2 border-b border-blue-300">
        <div className="flex items-center gap-2 text-blue-800 font-semibold">
          <Monitor className="w-5 h-5" />
          DISPLAY AREA
        </div>
        <button onClick={onClose}>
          <X className="w-4 h-4 text-blue-600" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 bg-blue-50">
        <p className="text-blue-600">Display content here</p>
      </div>
    </div>
  );
};

export default DisplayArea;
