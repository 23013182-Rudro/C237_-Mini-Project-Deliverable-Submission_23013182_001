const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();

// Database connection setup
const pool = mysql.createPool({
    host: 'mysql-rudro-socials.alwaysdata.net',
    user: 'rudro-socials',
    password: 'wtfkindapass124!',
    database: 'rudro-socials_finplanbuddy',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

// Home route (index.ejs)
app.get('/', (req, res) => {
    const user = req.session.user || null;
    res.render('index', { title: 'Home', user });
});

// Login route
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login', message: null });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const query = `SELECT * FROM users WHERE username = ?`;
        const [rows] = await pool.promise().query(query, [username]);

        if (rows.length > 0) {
            const user = rows[0];
            const passwordMatch = await bcrypt.compare(password, user.password_hash);

            if (passwordMatch) {
                req.session.user = user;
                res.redirect('/dashboard');
            } else {
                res.render('login', { title: 'Login', message: 'Invalid username or password.' });
            }
        } else {
            res.render('login', { title: 'Login', message: 'User not found.' });
        }
    } catch (err) {
        console.error('Error logging in user:', err);
        res.render('login', { title: 'Login', message: 'Error logging in user. Please try again.' });
    }
});

// Register route
app.get('/register', (req, res) => {
    res.render('register', { title: 'Register', message: null });
});

app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
        await pool.promise().execute(query, [username, email, hashedPassword]);
        res.redirect('/login');
    } catch (err) {
        console.error('Error registering user:', err);
        res.render('register', { title: 'Register', message: 'Error registering user. Please try again.' });
    }
});

// Dashboard route
app.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;

        const [expenses] = await pool.promise().query('SELECT * FROM expenses WHERE user_id = ?', [userId]);
        const [budgets] = await pool.promise().query('SELECT * FROM budgets WHERE user_id = ?', [userId]);
        const [goals] = await pool.promise().query('SELECT * FROM goals WHERE user_id = ?', [userId]);

        res.render('dashboard', { title: 'Dashboard', user: req.session.user, expenses, budgets, goals });
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        res.status(500).send('Error fetching dashboard data');
    }
});

// Add expense route
app.get('/expenses/add', isAuthenticated, (req, res) => {
    res.render('add_expense', { title: 'Add Expense' });
});

app.post('/expenses/add', isAuthenticated, async (req, res) => {
    try {
        const {amount, category, date, description } = req.body;

        // Log the input values
        console.log('Expense Input:', {amount, category, date, description });

        // Ensure required fields are provided and are not undefined
        if (!amount || !category || !date || !description) {
            return res.status(400).send('All fields are required');
        }

        // Replace empty strings with null
        const cleanValue = value => (value === '' || value === undefined) ? null : value;

        // Clean inputs
        const cleanAmount = cleanValue(amount);
        const cleanCategory = cleanValue(category);
        const cleanDate = cleanValue(date);
        const cleanDescription = cleanValue(description);

        // Log cleaned values
        console.log('Cleaned Expense Input:', {cleanAmount, cleanCategory, cleanDate, cleanDescription });

        // Insert into expenses table
        const query = 'INSERT INTO expenses (amount, category, date, description) VALUES (?, ?, ?, ?, ?)';
        await pool.promise().execute(query, [cleanAmount, cleanCategory, cleanDate, cleanDescription]);
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Error adding expense:', err);
        res.status(500).send('Error adding expense');
    }
});

// Add budget route
app.get('/budgets/add', isAuthenticated, (req, res) => {
    res.render('add_budget', { title: 'Add Budget' });
});

app.post('/budgets/add', isAuthenticated, async (req, res) => {
    try {
        const { category, amount, month, year } = req.body;
        const userId = req.session.user.id;

        const query = 'INSERT INTO budgets (user_id, category, amount, month, year) VALUES (?, ?, ?, ?, ?)';
        await pool.promise().execute(query, [userId, category, amount, month, year]);
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Error adding budget:', err);
        res.status(500).send('Error adding budget');
    }
});

// Add goal route
app.get('/goals/add', isAuthenticated, (req, res) => {
    res.render('add_goal', { title: 'Add Goal' });
});

app.post('/goals/add', isAuthenticated, async (req, res) => {
    try {
        const { goal_name, target_amount, current_amount, deadline } = req.body;
        const userId = req.session.user.id;

        const query = 'INSERT INTO goals (user_id, goal_name, target_amount, current_amount, deadline) VALUES (?, ?, ?, ?, ?)';
        await pool.promise().execute(query, [userId, goal_name, target_amount, current_amount, deadline]);
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Error adding goal:', err);
        res.status(500).send('Error adding goal');
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
