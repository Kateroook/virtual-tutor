// frontend/components/Navbar.js
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AppBar, Toolbar, Typography, Button, Avatar, Box } from '@mui/material';

const Navbar = () => {
    const { user, isAuthenticated, login, logout } = useContext(AuthContext);
    console.log(user);
    return (

        <AppBar position="static" color="primary" sx={{ padding: '0 2rem' }}>
            <Toolbar>
                {/* App Name */}
                <Typography
                    variant="h5"
                    component="div"
                    sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }}
                >
                    Hippo
                </Typography>
                {isAuthenticated ? (
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar alt={user.username} src={user.avatarUrl} />
                        <Typography variant="body1" sx={{ fontWeight: '500' }}>
                            {user.username}
                        </Typography>

                        {/* Logout Button */}
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={logout}
                            sx={{ textTransform: 'none' }}
                        >
                            Logout
                        </Button>
                    </Box>
                ) : (
                    /* Login Button */
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={login}
                        sx={{ textTransform: 'none' }}
                    >
                        Login
                    </Button>
                )}
            </Toolbar>
        </AppBar>

    );
};
export default Navbar;
