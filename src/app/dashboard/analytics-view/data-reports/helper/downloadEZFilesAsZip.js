import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function downloadEZFilesAsZip(files, zipFileName) {
  // files: [{ filename: string, content: string }, ...]
  if (!files.length) return;

  const zip = new JSZip();
  files.forEach(({ filename, content }) => {
    zip.file(filename, content);
  });

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, zipFileName);
}