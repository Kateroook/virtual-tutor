const { VertexAI }  = require("@langchain/google-vertexai");

const model = new VertexAI({
    model:"gemini-pro",
    temperature: 0.2,
});

async function generateAnswerWithVertexAI(question, sources) {
    try {
        let prompt = `You are a helpful tutor-assistant. Answer the following question based on the provided documents:\n\n`;
        prompt += `Question: "${question}"\n\n`;

        if (sources.length > 0) {
            prompt += `Here are the relevant documents:\n`;
            sources.forEach((source, index) => {
                prompt += `\nDocument ${index + 1}: ${source.url}\n`;
            });
            prompt += `\nPlease provide a concise and accurate answer based on the information above.`;
        } else {
            prompt += `No relevant documents were found. Provide a general answer if possible.`;
        }

        // Generate response from Vertex AI
        const response = await model.invoke(prompt);
        return response.trim();
    } catch (error) {
        console.error("Error generating AI response:", error);
        return "I encountered an issue generating an answer.";
    }
}

async function generateFlashcards(answerText) {
    if (!answerText) return [];

    const prompt = `
Please extract key terms and definitions from the following explanation and generate flashcards in pure JSON format (term, definition). The response should ONLY contain the raw JSON data without any markdown, code blocks, or extra characters. Do **not** include "\`\`\`json" or any other markdown formatting in your response.

${answerText}

Example output:
[
    { "term": "Machine Learning", "definition": "A field of AI that enables computers to learn from data." },
    { "term": "Neural Network", "definition": "A computational model inspired by the human brain, used in deep learning." }
]
`;

    try {
        const response = await model.invoke(prompt);
        const cleanedResponse = response.replace(/^```json|```$/g, "").trim();
        return JSON.parse(cleanedResponse);
    } catch (error) {
        console.error("Error generating flashcards:", error);
        return [];
    }
}



module.exports = { generateAnswerWithVertexAI, generateFlashcards };