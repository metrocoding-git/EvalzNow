export function downloadEZFile(content, filename) {
    return new Promise((resolve) => {
      const blob = new Blob([content], {
        type: "text/plain;charset=utf-8",
      });
  
      const url = URL.createObjectURL(blob);
  
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
  
      document.body.appendChild(link);
      link.click();
  
      document.body.removeChild(link);
  
      URL.revokeObjectURL(url);
  
      setTimeout(resolve, 300);
    });
}