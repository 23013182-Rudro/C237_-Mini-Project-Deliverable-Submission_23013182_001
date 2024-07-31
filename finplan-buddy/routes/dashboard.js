const express = require('express');
const router = express.Router();
const connection = require('../config/db');

router.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const userId = req.session.user.user_id;

    connection.query('SELECT * FROM expenses WHERE user_id = ?', [userId], (err, expenses) => {
        if (err) throw err;

        connection.query('SELECT * FROM budgets WHERE user_id = ?', [userId], (err, budgets) => {
            if (err) throw err;

            connection.query('SELECT * FROM goals WHERE user_id = ?', [userId], (err, goals) => {
                if (err) throw err;

                res.render('dashboard', { user: req.session.user, expenses, budgets, goals });
            });
        });
    });
});

module.exports = router;
