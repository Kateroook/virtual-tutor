const {bucket, storage} = require("../config/googleCloudStorage");
const File = require("../models/File");
const Embedding = require("../models/Embedding");
const FileText = require("../models/FileText");
const extractAndChunkText = require('../middlewares/extractAndChunkText')
const { generateEmbeddings } = require("../middlewares/LangchainEmbeddings");
const {sequelize} = require("../config/database");
require("dotenv").config();

const bucketName = process.env.GOOGLE_CLOUD_BUCKET;
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ error: "User not authenticated" });
};
/*const getSubjects = async (req, res) => {
    try {
        const subjects = await File.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('subject')), 'subject']],
            order: [['subject', 'ASC']]
        });
        console.log("getSubjects: ", subjects);
        res.json(subjects.map(subject => subject.subject));

    } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};*/
const getSubjects = async (req, res) => {
    try {
        const [results, metadata] = await sequelize.query(`SELECT DISTINCT "subject" FROM "Files" ORDER BY "subject" ASC`);
        const subjects = results.map(row => row.subject);
        res.json(subjects);
        console.log("getSubjects: ", subjects);
    } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const uploadToGCS = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const { title, description, subject } = req.body;
    if (!title || !subject) {
        return res.status(400).json({ error: "Title and subject are required." });
    }


    try {
        const fileName = `uploads/${Date.now()}_${req.file.originalname}`;
        const blob = bucket.file(fileName);
        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: { contentType: req.file.mimetype },
        });

        blobStream.on("error", (err) => {
            console.error("Upload error:", err);
            return res.status(500).json({ error: "Failed to upload file" });
        });

        blobStream.on("finish", async () => {
            //await blob.makePublic(); // Make file public
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

            // Store file metadata in PostgreSQL
            const fileRecord = await File.create({
                name: req.file.originalname,
                title,
                description,
                subject,
                file_url: publicUrl,
                file_type: req.file.mimetype,
                size: req.file.size,
                uploaded_by: req.user.id,
            });

            const textChunks = await extractAndChunkText(req.file.buffer, req.file.mimetype);
            const embeddings = await generateEmbeddings(textChunks);

            // Store extracted text chunks
            for (let i = 0; i < textChunks.length; i++) {
                const textRecord = await FileText.create({
                    fileId: fileRecord.id,
                    text: textChunks[i],
                });
                await Embedding.create({
                    fileTextId: textRecord.id,
                    embedding: `[${embeddings[i].join(",")}]`
                });
            }

            res.json({
                message: "File uploaded successfully",
                fileUrl: publicUrl,
                fileMetadata: fileRecord,
            });
        });
        blobStream.end(req.file.buffer);
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getUploadedFiles = async (req, res) => {
    try {
        const files = await File.findAll({
            where: { uploaded_by: req.user.id },
            order: [['created_at', 'DESC']]
        });
        res.json(files);
        // console.log("getUploadedFiles: ", files);
    } catch (error) {
        console.error("Error fetching files:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateFileDetails = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    try {
        const file = await File.findByPk(id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        file.title = title;
        file.description = description;
        await file.save();

        res.json({ message: 'File details updated successfully' });
    } catch (error) {
        console.error('Error updating file details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteFile = async (req, res) => {
    const { id } = req.params;

    try {
        const file = await File.findByPk(id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }
        await FileText.destroy({ where: { fileId: id } });

        // Delete file from Google Cloud Storage
        const filePath = file.file_url.split(`https://storage.googleapis.com/${bucketName}/`)[1];
        await storage.bucket(bucketName).file(filePath).delete();

        // Delete file from database
        await File.destroy({ where: { id } });
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {ensureAuthenticated, uploadToGCS, getUploadedFiles, getSubjects, updateFileDetails, deleteFile};