const express = require('express');
const router = express.Router();
const connection = require('../config/db');

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const passwordHash = require('crypto').createHash('sha256').update(password).digest('hex');

    connection.query('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', 
    [username, email, passwordHash], (err, results) => {
        if (err) throw err;
        res.redirect('/login');
    });
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const passwordHash = require('crypto').createHash('sha256').update(password).digest('hex');

    connection.query('SELECT * FROM users WHERE username = ? AND password_hash = ?', 
    [username, passwordHash], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            req.session.user = results[0];
            res.redirect('/dashboard');
        } else {
            res.send('Invalid username or password.');
        }
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
