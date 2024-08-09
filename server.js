require('dotenv').config({ path: './.env' });
const { queryDatabase, closeConnection } = require('./database');

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const PORT = process.env.PORT;
const APP = express();
APP.use(express.json());
APP.use(express.urlencoded({ extended: true }));
APP.use(cors());
APP.use(express.static('public'));
APP.use(morgan('dev'));

APP.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Directly store the password (not recommended for real applications)
        // Check if the email is already in use
        const [existingUser] = await queryDatabase(
            'SELECT * FROM tblloginform WHERE userEmail = ?',
            [email]
        );

        if (existingUser) {
            return res.json({ error: 'You already have an account with this email.' });
        }

        await queryDatabase(
            'INSERT INTO tblloginform (userName, userEmail, userPassword) VALUES (?, ?, ?)',
            [username, email, password]
        );

        res.redirect('/login');
    } catch (err) {
        console.error('Error during registration:', err.message); // Log the error
        res.status(500).json({ error: 'An error occurred during registration. Please try again later.' });
    }
});

// Login route
APP.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Query the database to find the user by email
        const [idLogin] = await queryDatabase(
            'SELECT * FROM tblloginform WHERE userEmail = ?',
            [email]
        );

        // Check if user exists and password matches
        if (idLogin && idLogin.userPassword === password) {
            console.log('Login successful'); // Debugging line
            res.redirect('/');
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'An error occurred during login. Please try again later.' });
    }
});

// Route to close the database connection
APP.get('/close-connection', (req, res) => {
    closeConnection();
    res.json({ message: 'Connection closed' });
});

// Routes
APP.get('/home', (request, response) => {
    response.render('index.ejs');
});

APP.get('/', (request, response) => {
    response.render('login.ejs');
});

APP.get('/register', (request, response) => {
    response.render('register.ejs');
});

// Handle 404 - Page Not Found
APP.use((req, res, next) => {
    res.status(404).send("Sorry, can't find that!");
});

// Error handling middleware
APP.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Close the database connection when the application exits
process.on('SIGINT', () => {
    closeConnection();
    process.exit();
});

// Start the server
APP.listen(PORT, (err) => {
    if (err) {
        console.log('Something went wrong', err);
    } else {
        console.log(`Server is listening on port ${PORT}`);
    }
});
