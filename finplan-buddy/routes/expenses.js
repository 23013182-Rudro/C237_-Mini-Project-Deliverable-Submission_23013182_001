const express = require('express');
const router = express.Router();
const connection = require('../config/db');

router.get('/add', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('add_expense');
});

router.post('/add', (req, res) => {
    const { amount, category, date, description } = req.body;
    const userId = req.session.user.user_id;

    connection.query('INSERT INTO expenses (user_id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)', 
    [userId, amount, category, date, description], (err, results) => {
        if (err) throw err;
        res.redirect('/dashboard');
    });
});

// Similar routes for edit and delete

module.exports = router;
