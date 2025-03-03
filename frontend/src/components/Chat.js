import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

import {
    TextField,
    Button,
    List,
    ListItem,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    IconButton,
    Link, Tooltip
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [flashcardIndex, setFlashcardIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMessage = { sender: "user", text: input };
        setMessages([...messages, userMessage]);

        try {
            const selectedFiles = JSON.parse(localStorage.getItem('selectedFiles')) || [];
            const selectedFileIds = selectedFiles.map(file => file.id);
            //console.log("selectedFileIds: ", selectedFileIds);
            const response = await fetch("http://localhost:5000/api/chat/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: input, selectedFileIds }),
            });
            const data = await response.json();
            const botMessage = {
                sender: "bot",
                text: data.answer,
                links: data.sources || [],
                flashcards: data.flashcards || [],
            };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Error fetching response:", error);
        }
        setInput("");
    };

    const handleFlip = () => {
        setFlipped((prev) => !prev);
    };

    const nextFlashcard = (flashcards) => {
        setFlashcardIndex((prev) => (prev + 1) % flashcards.length);
        setFlipped(false); // Reset flip state
    };

    const prevFlashcard = (flashcards) => {
        setFlashcardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
        setFlipped(false); // Reset flip state
    };

    return (
        <Paper
            sx={{
            p: 4,
            borderRadius: 4,
            boxShadow: 4,
            overflowY: "auto",
            height: '100%',
                width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            }}>
            <Box display="flex" alignItems="center" gap={2}>
                <img src="/HIPO.svg" alt="Hippo Logo" style={{ height: '30px', filter: 'invert(50%) sepia(100%) saturate(5000%) hue-rotate(180deg)' }}/>
                <Typography variant="h4" gutterBottom align="left">
                    Hippo Chat
                </Typography>
            </Box>
            <List sx={{ flex: 1, overflowY: 'auto' }}>
                {messages.map((msg, index) => (
                    <ListItem
                        key={index}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 4,
                                bgcolor: msg.sender === "user" ? "primary.main" : "grey.200",
                                color: msg.sender === "user" ? "white" : "black",
                                maxWidth: "75%",
                                wordBreak: "break-word",
                            }}
                        >
                            <Typography variant="body1">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </Typography>
                        </Box>

                        {msg.sender === "bot" && msg.links.length > 0 && (
                            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {msg.links.map((link, i) => (
                                    <Box key={i} sx={{ p: 1.5, border: '1px solid', borderColor: 'primary.main', borderRadius: 2 }}>
                                        <Typography variant="body2" color="primary">
                                            <Tooltip title={`${link.name}`} placement="top">
                                                <Link href={link.url} target="_blank" rel="noopener noreferrer" underline="hover">
                                                    {link.title}
                                                </Link>
                                            </Tooltip>
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {/* Flashcards Slider */}
                        {msg.sender === "bot" && msg.flashcards.length > 0 && (
                            <Box sx={{ mt: 2, width: "100%", textAlign: "center" }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Flashcards:</Typography>
                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 1 }}>
                                    <IconButton onClick={() => prevFlashcard(msg.flashcards)} disabled={msg.flashcards.length < 2}>
                                        <ArrowBack />
                                    </IconButton>

                                    {/* Flashcard with Flip Effect */}
                                    <Box
                                        onClick={handleFlip}
                                        sx={{
                                            width: 320,
                                            height: 200,
                                            borderRadius: 4,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            perspective: 1000,
                                            cursor: "pointer",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                position: "relative",
                                                transformStyle: "preserve-3d",
                                                transition: "transform 0.5s",
                                                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                                            }}
                                        >
                                            {/* Front Side (Term) */}
                                            <Card
                                                sx={{
                                                    position: "absolute",
                                                    width: "100%",
                                                    height: "100%",
                                                    backfaceVisibility: "hidden",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    bgcolor: "grey.200",
                                                    borderRadius: 2,
                                                    boxShadow: 3,
                                                }}
                                            >
                                                <CardContent>
                                                    <Typography variant="body1" sx={{ fontWeight: "bold", textAlign: "center" }}>
                                                        {msg.flashcards[flashcardIndex].term}
                                                    </Typography>
                                                </CardContent>
                                            </Card>

                                            {/* Back Side (Definition) */}
                                            <Card
                                                sx={{
                                                    position: "absolute",
                                                    width: "100%",
                                                    height: "100%",
                                                    backfaceVisibility: "hidden",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    bgcolor: "grey.200",
                                                    borderRadius: 2,
                                                    boxShadow: 3,
                                                    transform: "rotateY(180deg)", // Keeps text readable
                                                }}
                                            >
                                                <CardContent>
                                                    <Typography variant="body1" sx={{ fontWeight: "bold", textAlign: "center" }}>
                                                        {msg.flashcards[flashcardIndex].definition}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Box>
                                    </Box>

                                    <IconButton onClick={() => nextFlashcard(msg.flashcards)} disabled={msg.flashcards.length < 2}>
                                        <ArrowForward />
                                    </IconButton>
                                </Box>
                                <Typography variant="caption" sx={{ mt: 1 }}>
                                    {flashcardIndex + 1} / {msg.flashcards.length}
                                </Typography>
                            </Box>
                        )}
                    </ListItem>
                ))}
            </List>
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <TextField
                    sx={{ borderRadius: 8 }}
                    fullWidth
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    variant="outlined"

                />
                <Button onClick={sendMessage} variant="contained" color="primary" sx={{ borderRadius: 2}}>
                    Send
                </Button>
            </Box>
        </Paper>
    );
};

export default Chat;