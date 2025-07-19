// components/IconButton.jsx
export default function IconButton({ icon, label }) {
  return (
    <div className="group flex flex-col items-center w-20 p-2 hover:bg-gray-100 rounded cursor-pointer transition-all">
      <div className="text-xl text-blue-800">{icon}</div>
      <div className="text-xs text-center text-gray-700 group-hover:text-blue-800">{label}</div>
    </div>
  );
}
