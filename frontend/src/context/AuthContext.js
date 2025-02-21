// frontend/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/auth/current-user', {
                    credentials: 'include', // Send cookies with the request
                });
                const data = await response.json();

                if (data.isAuthenticated) {
                    setUser(data.user);
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching current user:', error);
                setUser(null);
                setIsAuthenticated(false);
                setLoading(false);
            }
        };
        fetchCurrentUser();
    }, []);

    const login = async () => {
        window.location.href = 'http://localhost:5000/api/auth/google'; // Redirect to Google OAuth login
    };

    const logout = async () => {
        try {
            await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            localStorage.clear();
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
