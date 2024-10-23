const express = require('express');
const router = express.Router();
const { query } = require('../db/index');
const bcrypt = require('bcrypt');

const ADD_USER_QUERY = 'INSERT INTO users (username, password, address, created, updated) VALUES ($1, $2, $3, $4, $5)';
const SELECT_USER_BY_USERNAME_QUERY = 'SELECT * FROM users WHERE username = $1';

router.get('/', (req, res) => {
    res.send('Users GET');
});

router.post('/', async (req, res) => {
    try {
        if (req.body.username == undefined || req.body.username == '') {
            return res.send('Username is empty.');
        }

        const userExists = await query(SELECT_USER_BY_USERNAME_QUERY, [req.body.username]);

        if (userExists.rowCount > 0) {
            return res.send('User Exists');
        }

        const currentDate = new Date();
        const username = req.body.username;
        const address = req.body.address;
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        let success = await query(ADD_USER_QUERY, [username, hashedPassword, address, currentDate, currentDate]);
        res.status(201).send('User added successfully.');
    } catch (error) {
        res.status(200).send('Something wrong happened.');
    }
});

router.put('/:id', (req, res) => {
    res.send('Users PUT');
});

router.delete('/:id', (req, res) => {
    res.send('Users DELETE');
});

module.exports = router;