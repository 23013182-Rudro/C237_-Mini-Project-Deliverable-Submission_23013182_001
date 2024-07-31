const express = require('express');
const router = express.Router();
const connection = require('../config/db');

router.get('/add', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('add_budget');
});

router.post('/add', (req, res) => {
    const { category, amount, month, year } = req.body;
    const userId = req.session.user.user_id;

    connection.query('INSERT INTO budgets (user_id, category, amount, month, year) VALUES (?, ?, ?, ?, ?)', 
    [userId, category, amount, month, year], (err, results) => {
        if (err) throw err;
        res.redirect('/dashboard');
    });
});

// Similar routes for edit and delete

module.exports = router;
