# Hippo - Virtual Tutor

The Hippo Virtual Tutor project is an intelligent learning assistant that extracts text from educational documents (PDFs and DOCX files), processes the content, and prepares structured learning materials like Q&A and flashcards.

[See demo](https://drive.google.com/file/d/11i34eOJ4MGyg3vGzM9AGlSiIQ3jbrGri/view?usp=sharing)

## Features 

- 📄 Document Processing: Extracts high-quality text from PDFs and DOCX files.

- 🧹 Text Cleaning: Removes unnecessary characters, redundant spaces, and formatting issues.

- 🔍 Intelligent Search: Retrieves relevant documents using vector-based similarity ranking. Choose files for searching in.

- ✂️ Chunking & Processing: Splits text into structured chunks for better readability and NLP processing.

- ⚡ Optimized Queries: Uses PostgreSQL with vector embeddings for fast and accurate search.

## Tech Stack

- Node.js Express – Backend server

- PostgreSQL + pgvector – Database with vector-based similarity search

- LangChain – Text chunking and processing

- pdfjs-dist & pdf-parse – PDF text extraction

- mammoth – DOCX text extraction

## Steps to Set Up

- Clone the Repository
```bash
git clone https://github.com/Kateroook/virtual-tutor.git
cd virtual-tutor
```
- Install Dependencies
```bash
npm install
```
- Set Up Environment Variables. Create a .env file and configure your database connection:
```bash
DATABASE_URL=your_postgresql_connection_string
```
- Run the Application
```bash
npm start
```
## Usage

- Upload a PDF or DOCX file.

- The system extracts and cleans the text.

- Ask a question and get the relevant documents or choose the context to search in.

- Retrieve the AI-powered answers and flashcards.

## Future Enhancements

🔹 Flashcard generation with Quizlet API / Anki API

🔹 Enhanced NLP-based study modes (e.g. Quizes, tests, pre-exams etc.)

🔹 Improved query efficiency with additional indexing strategies
