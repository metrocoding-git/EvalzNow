// components/IconButton.jsx
export default function SubIconButton({ icon, label, onClick, active }) {
  return (

    <div
      onClick={onClick}
      className={
        `group flex flex-col items-center  w-24 p-2 mx-1 my-3 rounded-md cursor-pointer shadow-md hover:shadow-md hover:bg-blue-50 transition-all duration-200 ease-in-out ` +
        (active ? "bg-blue-200" : "bg-blue-50")
      }
    >
      <div className="text-xs text-blue-700 group-hover:scale-110 group-hover:text-blue-800 transition-transform duration-200">
        <img src={icon} alt={label} className="h-8 w-8 object-contain transition-transform group-hover:scale-110" />
      </div>
     
      <div className="mt-1 text-xs text-gray-700 font-bold group-hover:text-blue-800 text-center hover:font-bold">
        {label}
      </div>
    </div>

  );
}
