export default function IconButton({ icon, label, onClick, active }) {
  return (
    <div
      onClick={onClick}
      className={
        `group flex flex-col justify-center items-center h-28 w-32 p-3  mx-1 rounded-md cursor-pointer shadow-md hover:shadow-md hover:bg-blue-50 transition-all duration-200 ease-in-out ` +
        (active ? "bg-blue-300" : "bg-blue-100")
      }
    >
      <div className="mb-1">
        <img
          src={icon}
          alt={label}
          className="h-8 w-8 object-contain transition-transform group-hover:scale-110"
        />
      </div>
      <div className="text-xs text-gray-700 group-hover:text-blue-800 text-center hover:font-bold">
        {label}
      </div>
    </div>
  );
}
