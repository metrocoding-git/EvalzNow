export default function DownloadLoader({
  title = "Preparing Report...",
  message = "Please wait while your report is being generated.",
}) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" role="status" aria-live="polite">
        <div className="bg-white rounded-xl px-10 py-8 shadow-xl flex flex-col items-center">
          <div className="w-14 h-14 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
  
          <h2 className="mt-6 text-lg font-semibold">
            {title}
          </h2>
  
          <p className="text-sm text-gray-500 mt-2">
            {message}
          </p>
        </div>
      </div>
    );
}
