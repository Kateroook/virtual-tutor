import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Button, Typography, LinearProgress, Snackbar, Alert, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Autocomplete } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const FileUpload = ( {onFileUploaded} ) => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [subject, setSubject] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [message, setMessage] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileUrl, setFileUrl] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [openModal, setOpenModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchSubjects();
    }, []);
    const fetchSubjects = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/files/subjects", { withCredentials: true });
            setSubjects(response.data);
        } catch (error) {
            console.error("Error fetching subjects:", error);
            setMessage("🫸🏼Failed to fetch subjects.");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
        }
    };
    const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (event.dataTransfer && event.dataTransfer.files.length > 0) {
            const droppedFile = event.dataTransfer.files[0];

            if (!allowedTypes.includes(droppedFile.type)) {
                setMessage("🫸🏼Invalid file type. Only PDFs and Word Docs are allowed.");
                setSnackbarSeverity("error");
                setOpenSnackbar(true);
                return;
            }
            setFile(droppedFile);
            setOpenModal(true);
            event.dataTransfer.clearData();
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (!selectedFile) {
            setMessage("Please select a file 😕");
            setSnackbarSeverity("warning");
            setOpenSnackbar(true);
            return;
        }

        if (!allowedTypes.includes(selectedFile.type)) {
            setMessage("🫸🏼Invalid file type. Only PDFs, and Word Docs are allowed.");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            setFile(null);
            return;
        }

        setFile(selectedFile);
        setMessage("");
        setOpenModal(true);
    };

    const handleUpload = async () => {
        if (!file || !title || !subject) {
            setMessage("Please select a valid file 😕");
            setSnackbarSeverity("warning");
            setOpenSnackbar(true);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("subject", subject);
        try {
            setUploading(true);
            const response = await axios.post("http://localhost:5000/api/files/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
            });
            setFileUrl(response.data.fileUrl);
            setMessage("File uploaded successfully 🎉");
            setSnackbarSeverity("success");
            setOpenSnackbar(true);
            setOpenModal(false);
            onFileUploaded(response.data.fileMetadata);
            resetForm();
        } catch (error) {
            setMessage("🫸🏼Upload failed. " + (error.response?.data?.error || "Please try again."));
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setTitle("");
        setDescription("");
        setSubject("");
        setUploadProgress(0);
    };

    return (
        <Box  sx={{ borderRadius: 4, textAlign: "center" }}>
{/*            <Typography variant="h6" gutterBottom>
                Upload a File
            </Typography>*/}
            <Box
                sx={{
                    padding: 4,
                    border: "2px dashed gray",
                    borderRadius: 2,
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: "#f9f9f9",

                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
                onClick={() => document.getElementById("file-input").click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <CloudUploadIcon fontSize="large" />
                <Typography variant="h6" gutterBottom>Drag & Drop or Click to Select File</Typography>
            </Box>

            <input type="file" onChange={handleFileChange} hidden id="file-input" />

            {uploadProgress > 0 && <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 2 }} />}
            <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)}>
                <Alert severity={snackbarSeverity}>{message}</Alert>
            </Snackbar>

            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
                <DialogTitle>File Details</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">Selected File: {file?.name}</Typography>
                    <Autocomplete
                        freeSolo
                        options={subjects}
                        value={subject}
                        onChange={(event, newValue) => setSubject(newValue)}
                        onInputChange={(event, newInputValue) => setSubject(newInputValue)}
                        renderInput={(params) => <TextField {...params} label="Subject" fullWidth margin="normal" />}
                    />
                    <TextField label="Title" fullWidth margin="normal" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    <TextField label="Description" fullWidth margin="normal" value={description} onChange={(e) => setDescription(e.target.value)} multiline />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button variant="contained" color="primary" onClick={handleUpload} disabled={uploading}>
                        Upload
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FileUpload;