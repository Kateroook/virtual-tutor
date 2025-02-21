const { generateEmbeddingForQuery} = require("../middlewares/LangchainEmbeddings");
const { searchSimilarDocuments } = require("../middlewares/searchSimilarDocument");
const { generateAnswerWithVertexAI, generateFlashcards } = require("../middlewares/VertexAI");

async function handleUserQuery(req, res) {
    try {
        const { question, selectedFileIds } = req.body;
        if (!question) {
            return res.status(400).json({ error: "Question is required." });
        }

        const queryEmbedding = await generateEmbeddingForQuery(question);
        if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
            throw new Error("Failed to generate embedding.");
        }

        const results = await searchSimilarDocuments(queryEmbedding, selectedFileIds) || [];
        const sources = results.map(row => ({
            name: row.file_name,
            title: row.title,
            url: row.file_url,
            text: row.text,
        }));

        const answer = await generateAnswerWithVertexAI(question, sources);
        const flashcards = await  generateFlashcards(answer);
        res.json({
            answer: answer || "I'm sorry, but I couldn't find a relevant answer.",
            sources,
            flashcards,
        });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { handleUserQuery };