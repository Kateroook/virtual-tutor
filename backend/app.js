const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require("body-parser");
const passport = require('./config/passport');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/files');
const chatRoutes = require('./routes/chat');
const {sequelize} = require('./config/database');

dotenv.config();
async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully!');

        // Ensure `pgvector` extension is enabled
        await sequelize.query(`CREATE EXTENSION IF NOT EXISTS vector;`);

        // Sync database (drops and recreates tables when `force: true`)
        await sequelize.sync({ force: false });

        // Convert embedding column from STRING to vector
        await sequelize.query(
            `ALTER TABLE "Embeddings" ALTER COLUMN embedding TYPE vector(768) USING embedding::vector;`
        );

        console.log('Database synced successfully with vector support!');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
}

// Initialize DB
initializeDatabase();


const app = express();

// Middleware
const corsOptions = {
    origin: 'http://localhost:3000', // Allow requests from React app
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave:false,
        saveUninitialized:false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000, // 1-day expiration
        },
    })
);

app.use(passport.initialize());
app.use(passport.session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set secure: true if using HTTPS
    })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', uploadRoutes);
app.use('/api/chat', chatRoutes);

app.use(bodyParser.json());
app.use("/api/chat", chatRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));