import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    List, ListItem, ListItemText,
    IconButton,
    Tooltip,
    Typography,
    Box,
    Card, CardContent,
    Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Snackbar, Alert, Chip
} from "@mui/material";
import { ArrowBack, Delete, Edit, Chat } from "@mui/icons-material";

const FilesList = ({ files, onFileUpdated }) => {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editFileDetails, setEditFileDetails] = useState({ id: null, title: "", description: "" });
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
        const savedSelectedFiles = localStorage.getItem('selectedFiles');
        if (savedSelectedFiles) {
            setSelectedFiles(JSON.parse(savedSelectedFiles));
        }

        if (files && files.length > 0) {
            const groupedSubjects = files.reduce((acc, file) => {
                acc[file.subject] = acc[file.subject] || [];
                acc[file.subject].push(file);
                return acc;
            }, {});
            setSubjects(groupedSubjects);
        }
    }, [files]);
/*
    const fetchSubjects = async () => {
        try {
            const groupedSubjects = files.reduce((acc, file) => {
                acc[file.subject] = acc[file.subject] || [];
                acc[file.subject].push(file);
                return acc;
            }, {});
            setSubjects(groupedSubjects);
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    };*/

    const openEditModal = (file) => {
        setEditFileDetails({ id: file.id, title: file.title, description: file.description });
        setEditModalOpen(true);
    };

    const handleEdit = async (id, updatedTitle, updatedDescription) => {
        try {
            await axios.put(`http://localhost:5000/api/files/${id}`, { title: updatedTitle, description: updatedDescription }, { withCredentials: true });
            setSubjects((prevSubjects) => {
                const updatedSubjects = { ...prevSubjects };
                updatedSubjects[selectedSubject] = updatedSubjects[selectedSubject].map((file) =>
                    file.id === id ? { ...file, title: updatedTitle, description: updatedDescription } : file
                );
                return updatedSubjects;
            });
            setSnackbarMessage("File updated successfully 🙌");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
            onFileUpdated();
        } catch (error) {
            // console.error("Error editing file:", error);
            setSnackbarMessage("🫸🏼Error updating file.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/files/${id}`, { withCredentials: true });
            setSubjects((prevSubjects) => {
                const updatedSubjects = { ...prevSubjects };
                updatedSubjects[selectedSubject] = updatedSubjects[selectedSubject].filter((file) => file.id !== id);
                if (updatedSubjects[selectedSubject].length === 0) {
                    delete updatedSubjects[selectedSubject];
                    setSelectedSubject(null);
                }
                return updatedSubjects;
            });
            setSnackbarMessage("File deleted successfully 💥");
            //setSnackbarSeverity("success");
            setSnackbarOpen(true);
            onFileUpdated();
        } catch (error) {
            console.error("Error deleting file:", error);
            setSnackbarMessage("🫸🏼Error deleting file.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const handleSelectFile = (file) => {
        if(!selectedFiles.some((selectedFile) => selectedFile.id === file.id)) {
            const updatedSelectedFiles = [...selectedFiles, file];
            setSelectedFiles(updatedSelectedFiles);
            localStorage.setItem('selectedFiles', JSON.stringify(updatedSelectedFiles));
        } else {
            setSnackbarMessage("File is already added 👊");
            setSnackbarSeverity("warning");
            setSnackbarOpen(true);
        }
    };

    const handleDeselectFile = (fileId) => {
        const updatedSelectedFiles = selectedFiles.filter((file) => file.id !== fileId);
        setSelectedFiles(updatedSelectedFiles);
        localStorage.setItem('selectedFiles', JSON.stringify(updatedSelectedFiles));
    };

    return (
        <Box sx={{ width: "100%", padding: "10px", borderRadius: "12px", alignContent: 'space-between', height: "460px", overflow: "hidden"}} >
            {selectedSubject ? (
                <>
                    <Box sx={{ display: "flex",  mb: 2 }}>
                        <IconButton onClick={() => setSelectedSubject(null)}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h5">{selectedSubject}</Typography>
                    </Box>
                    <List sx={{ height: "calc(100% - 210px)", overflowY: "auto" }}>
                        {subjects[selectedSubject].map((file) => (
                            <Card
                                key={file.id}
                                sx={{ display: "flex", flexDirection: "column", padding: 2, mb: 2, borderRadius: "12px", cursor: "pointer" }}
                                onClick={() => window.open(file.file_url, "_blank")}
                            >
                                <CardContent>
                                    <Tooltip title={`${file.description}`} placement="top">
                                        <Typography variant="body1" noWrap>
                                            {file.title}
                                        </Typography>
                                    </Tooltip>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEditModal(file); }}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Chat">
                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleSelectFile(file); }}>
                                                <Chat fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </List>
                    <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
                        <DialogTitle>Edit File Details</DialogTitle>
                        <DialogContent>
                            <TextField
                                label="Title"
                                fullWidth
                                margin="normal"
                                value={editFileDetails.title}
                                onChange={(e) => setEditFileDetails({ ...editFileDetails, title: e.target.value })}
                            />
                            <TextField
                                label="Description"
                                fullWidth
                                margin="normal"
                                value={editFileDetails.description}
                                onChange={(e) => setEditFileDetails({ ...editFileDetails, description: e.target.value })}
                                multiline
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    handleEdit(editFileDetails.id, editFileDetails.title, editFileDetails.description);
                                    setEditModalOpen(false);
                                }}
                            >
                                Save
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            ) : (
                <>
                    <Typography variant="h4" sx={{ textAlign: "left", mb: 2 }}>
                        Subjects
                    </Typography>
                    {Object.keys(subjects).length === 0 ? (
                            <Typography variant="body1" sx={{ textAlign: "left", mb: 2 }}>
                                There are no subjects. Please upload some files to see the list.
                            </Typography>
                        ) : (
                    <List>
                        {Object.keys(subjects).map((subject) => (
                            <ListItem key={subject} button onClick={() => setSelectedSubject(subject)} sx={{ borderRadius: "12px", mb: 1, backgroundColor: "white", boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}>
                                <ListItemText primary={<Typography variant="h6">{subject}</Typography>} sx={{ textAlign: "left" }} />
                            </ListItem>
                        ))}
                    </List>)}
                </>
            )}
            <Box sx={{ mt: 2, height: "180px", overflowY: "auto" }}>
                {selectedFiles.length > 0 && (
                    <>
                        <Typography variant="h5" sx={{ textAlign: "left", mb: 2 }}>
                            Selected Files
                        </Typography>
                        {selectedFiles.map((file) => (
                            <Chip
                                key={file.id}
                                label={file.title}
                                onDelete={() => handleDeselectFile(file.id)}
                                sx={{ margin: 0.5 }}
                                onClick={() => window.open(file.file_url, "_blank")}
                            />
                        ))}
                    </>
                )}
            </Box>
            <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
                <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
            </Snackbar>
        </Box>
    );
};

export default FilesList;