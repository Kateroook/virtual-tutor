const { VertexAIEmbeddings } = require("@langchain/google-vertexai");

const embeddingsModel = new VertexAIEmbeddings({
    modelName: "textembedding-gecko",
});

// Function to generate embeddings for extracted text chunks
async function langchainEmbeddings(chunks) {
    try {
        return await embeddingsModel.embedDocuments(chunks);
    } catch (error) {
        console.error("Error generating embeddings:", error);
        throw new Error("Failed to generate embeddings");
    }
}
async function generateEmbeddingForQuery(text) {
    return await embeddingsModel.embedQuery(text);
}
module.exports = { embeddingsModel, generateEmbeddings: langchainEmbeddings, generateEmbeddingForQuery };