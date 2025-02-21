const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { getDocument } = require("pdfjs-dist");

/**
 * Extracts text from a file buffer (PDF or Word) and splits it into clear chunks.
 * @param {Buffer} fileBuffer - The uploaded file's buffer.
 * @param {string} mimeType - The MIME type of the file.
 * @returns {Promise<string[]>} - An array of cleaned text chunks.
 */
async function extractAndChunkText(fileBuffer, mimeType) {
    let extractedText = "";
    try {
        if (mimeType === "application/pdf") {
            extractedText = await extractPdfText(fileBuffer);
        } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            extractedText = result.value;
        }
    } catch (error) {
        console.error("Error extracting text:", error);
        new Error("Unsupported file type");
        return [];
    }

    // Clean and format text
    const cleanedText = cleanText(extractedText);

    // Split text into chunks
    return chunkText(cleanedText);
}
/**
 * Extract text from PDFs using pdfjs-dist (better quality).
 * @param {Buffer} fileBuffer - PDF file buffer.
 * @returns {Promise<string>} - Extracted text.
 */
async function extractPdfText(fileBuffer) {
    try {
        // Convert Buffer to Uint8Array
        const pdfData = new Uint8Array(fileBuffer);

        const pdfDoc = await getDocument({ data: pdfData }).promise;
        let extractedText = "";

        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            const page = await pdfDoc.getPage(pageNum);
            const content = await page.getTextContent();
            const pageText = content.items.map((item) => item.str).join(" ");
            extractedText += pageText + "\n";
        }

        return extractedText;
    } catch (error) {
        console.warn("Fallback to pdf-parse due to pdfjs error:", error);
        const data = await pdf(fileBuffer);
        return data.text;
    }
}
/**
 * Cleans extracted text by removing extra spaces, special characters, and newlines.
 * @param {string} text - Raw extracted text.
 * @returns {string} - Cleaned text.
 */
function cleanText(text) {
    return text
/*        .replace(/\s+/g, ' ') // Convert multiple spaces & newlines to a single space
        .replace(/([.,!?()\-–—«»“”±×÷√∞π∑∫≈≠≤≥])\1+/g, '$1') // Remove repeated punctuation
        .replace(/,\s*,+/g, ',') // Remove consecutive commas
        .replace(/(\(\s*\d+\s*\))/g, '') // Remove isolated numbers in parentheses (like "(6)")
        .replace(/[^a-zA-Zа-яА-ЯіІїЇєЄ0-9.,!?()\-–—«»“”±×÷√∞π∑∫≈≠≤≥ ]/g, '') // Keep only useful symbols
        .replace(/\s+/g, ' ') // Final cleanup of spaces
        .trim();*/
}

/**
 * Splits text into manageable chunks without breaking sentences.
 * @param {string} text - The cleaned text to be chunked.
 * @returns {string[]} - An array of text chunks.
 */
async function chunkText(text) {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 400,  // ~500 characters per chunk
        chunkOverlap: 150,// Helps preserve context
        separators: [
            "\n\n", // Paragraph breaks
            "\n"   // Line breaks (e.g., bullet points)
        ],
    });

    return await splitter.splitText(text);
}

module.exports = extractAndChunkText;