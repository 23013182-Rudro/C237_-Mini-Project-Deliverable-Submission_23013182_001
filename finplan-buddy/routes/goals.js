const express = require('express');
const router = express.Router();
const connection = require('../config/db');

router.get('/add', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('add_goal');
});

router.post('/add', (req, res) => {
    const { goal_name, target_amount, current_amount, deadline } = req.body;
    const userId = req.session.user.user_id;

    connection.query('INSERT INTO goals (user_id, goal_name, target_amount, current_amount, deadline) VALUES (?, ?, ?, ?, ?)', 
    [userId, goal_name, target_amount, current_amount, deadline], (err, results) => {
        if (err) throw err;
        res.redirect('/dashboard');
    });
});

// Similar routes for edit and delete

module.exports = router;
