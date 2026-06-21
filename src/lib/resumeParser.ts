// PDF Text Extraction Helper using PDF.js CDN

let loadingPromise: Promise<any> | null = null;

function loadPdfJs(): Promise<any> {
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    // If already loaded by another script/attempt
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        // Set worker source to render and parse pdf pages in web workers
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(pdfjsLib);
      } else {
        reject(new Error("pdfjsLib not found on window object"));
      }
    };
    script.onerror = () => {
      loadingPromise = null;
      reject(new Error("Failed to load PDF.js script from CDN"));
    };
    document.head.appendChild(script);
  });

  return loadingPromise;
}

/**
 * Extracts all text contents from a PDF file.
 * @param file The PDF File object uploaded by user
 * @returns Extracted string contents
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  if (file.type !== "application/pdf") {
    throw new Error("Invalid file type. Only PDF files are supported.");
  }

  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();

  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    if (!fullText.trim()) {
      throw new Error("Could not extract any text. The PDF might be scanned or empty.");
    }

    return fullText;
  } catch (error: any) {
    console.error("PDF Parsing Error:", error);
    throw new Error(`Failed to parse PDF resume: ${error.message || error}`);
  }
}
