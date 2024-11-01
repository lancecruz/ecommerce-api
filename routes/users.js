const express = require('express');
const router = express.Router();
const { query } = require('../db/index');
const bcrypt = require('bcrypt');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const { checkAuthenticated } = require('../passport-config');

const ADD_USER_QUERY = 'INSERT INTO users (username, password, address, created, updated) VALUES ($1, $2, $3, $4, $5)';
const SELECT_USER_BY_USERNAME_QUERY = 'SELECT * FROM users WHERE username = $1';

// passport.use(new LocalStrategy(async (username, password, done) => {
//     const user = await query('SELECT * FROM users WHERE username = $1', [username]);

//     if (user.rowCount == 0) {
//         return done(null, false, { message: 'No user with that username.'});
//     }

//     try {
//         if (await bcrypt.compare(password, user.rows[0].password)) {
//             return done(null, user.rows[0]);
//         } else {
//             console.log('incorrect password');
//             return done(null, false, { message: 'Password is incorrect for user.'});
//         }
//     } catch (error) {
//         return done(error);
//     }
// }));

// passport.serializeUser((user, done) => {
//     process.nextTick(() => {
//         console.log('seri');
//         done(null, { userId: user.user_id, username: user.username });
//     });
// });

// passport.deserializeUser((user, done) => {
//     process.nextTick(() => {
//         console.log('dese');
//         console.log(user);
//         return done(null, user);
//     });
// });

// const checkAuthenticated = (req, res, next) => {
//     if (req.isAuthenticated()) {
//         return next();
//     }

//     res.send('Not authenticated.');
// };

router.get('/', checkAuthenticated, async (req, res) => {
    console.log(req.isAuthenticated());
    console.log(req.user);
    res.send('Users GET');
});

router.post('/register', async (req, res) => {
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

router.post('/login', passport.authenticate('local'), async (req, res) => {
    try {
        res.send('test');
    } catch (error) {
        res.send(error);
    }
});

router.post('/logout', checkAuthenticated, (req, res, next) => {
    req.logout((error) => {
        if (error) return next(error);
    });
});

router.put('/:id', (req, res) => {
    res.send('Users PUT');
});

router.delete('/:id', (req, res) => {
    res.send('Users DELETE');
});

module.exports = router;