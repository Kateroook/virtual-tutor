import './App.css';
import React, { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Chat from './components/Chat';
import FileManager from './components/FileManager';
import { Box,  Typography } from '@mui/material';

function App() {
    const { user } = useContext(AuthContext);

    return (
        <Box>
            {/* Full-width Navbar */}
            <Box sx={{ width: '100%' }}>
                <Navbar />
            </Box>

            <Box display="flex" height="90vh    " mt={2} gap={2} padding={10}>
                {/* Chat Section */}
                <Box flex={2} sx={{ padding: 4, borderRadius: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Chat />
                </Box>

                {/* Right Panel: Subjects and Upload */}
                <Box flex={1} display="flex" flexDirection="column">
                    {/* Subjects Section */}
                        {user ? (
                            <FileManager />
                        ) : (
                            <Typography variant="h6">Please log in to view uploaded files.</Typography>
                        )}
                </Box>
            </Box>
        </Box>
    );
}

export default App;