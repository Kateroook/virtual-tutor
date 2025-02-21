import React, {useEffect, useState} from "react";
import FileUpload from "./FileUpload";
import FilesList from "./FilesList";
import axios from "axios";
import {Box, Paper} from "@mui/material";

const FileManager = () => {
    const [files, setFiles] = useState([]);
    const fetchFiles = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/files", { withCredentials: true });
            setFiles(response.data);
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleFileUploaded = (newFile) => {
        setFiles((prevFiles) => {
            // console.log("Updated Files List:", updatedFiles);
            return [...prevFiles, newFile];
        });
    };
    const handleFileUpdated = () => {
        fetchFiles(); // Refresh file list
    };


    return (
        <Box flex={1} display="flex" flexDirection="column" gap={2}>
            {/* Subjects Section */}
            <Paper elevation={3} sx={{ flex: 2, padding: 2, borderRadius: 4, display: 'flex', justifyContent:'space-between', alignContent: 'space-between'}}>
                <FilesList files={files} onFileUpdated={handleFileUpdated} />
            </Paper>

            {/* Upload Section */}
                <FileUpload onFileUploaded={handleFileUploaded} />

        </Box>
    );
};

export default FileManager;