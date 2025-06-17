require('dotenv').config();
const express = require('express');
const router = express.Router();
const { query } = require('../db/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const { checkAuthenticated } = require('../passport-config');

const GET_ALL_USERS_QUERY = 'SELECT user_id, username, address FROM users;';
const GET_USER_BY_ID_QUERY = 'SELECT user_id, username, address FROM users WHERE user_id = $1';
const ADD_USER_QUERY = 'INSERT INTO users (username, password, address, created, updated) VALUES ($1, $2, $3, $4, $5)';
const UPDATE_USER_QUERY = 'UPDATE users SET username = $1, password = $2, address = $3, updated = $4 WHERE user_id = $5 RETURNING username;'
const SELECT_USER_BY_USERNAME_QUERY = 'SELECT * FROM users WHERE username = $1';
const DELETE_USER_QUERY = 'DELETE FROM users WHERE user_id = $1 RETURNING username';

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

router.get('/testServer', checkAuthenticated, (req, res) => {
    console.log(req.isAuthenticated());
    res.send({message: 'User Authenticated Test'});
});

router.get('/account', checkAuthenticated, (req, res) => {
    console.log('get account');
    try {
        jwt.verify(req.token, process.env.SECRET_KEY, ( async (err, authorizedData) => {
            if (err) {
                res.send({message: err});
            } else {
                console.log('token valid');
                console.log(authorizedData);

                //Get user account data.
                const result = await query(GET_USER_BY_ID_QUERY, [authorizedData.userId]);

                if (result.rowCount == 0) {
                    return res.status(200).send({user: null, message: 'No user found.'});
                }

                res.status(200).send({ 
                    message: 'User Account Data',
                    result: result.rows[0]
                });
            }
        }));
    } catch (error) {
        res.send({ message: error });
    }
});

router.get('/', checkAuthenticated, async (req, res) => {
    try {
        const results = await query(GET_ALL_USERS_QUERY);
        res.status(200).send(results.rows);
    } catch (error) {
        res.send(error.message);
    }
});

router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;

    if (userId == null) {
        return res.status(404).send({message: 'No user id given.'})
    }

    try {
        const result = await query(GET_USER_BY_ID_QUERY, [userId]);

        if (result.rowCount == 0) {
            return res.status(200).send({user: null, message: 'No user found.'});
        }

        res.status(200).send(result.rows);
    } catch (error) {
        res.send(error.message);     
    }
});

router.post('/register', async (req, res) => {
    try {
        console.log(req.body);

        if (req.body.username == undefined || req.body.username == '') {
            console.log('username where?');
            return res.status(200).send('Username is empty.');
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
        res.status(201).send({message: 'User added successfully.'});
    } catch (error) {
        res.status(200).send('Something wrong happened.');
    }
});

const loginFailed = (err, user, info) => {
    console.log('log in failed');
    res.send({message: 'Nani'});
};

router.post('/login2', passport.authenticate('local', {
    failureRedirect: '/notAuthorized'
}), async (req, res, next) => {
    try {
        const token = jwt.sign(
            {
                id: req.user.user_id,
                username: req.user.username,
                address: req.user.address
            }, 
            process.env.SECRET_KEY,
            {expiresIn: '10h'}
        );

        res.status(200).send({
            success: true,
            token: token
        });
    } catch (error) {
        res.send(error);
    }
});

router.get('/notAuthorized', (req, res) => {
    console.log('Not Authorized');
});

router.post('/login', async (req, res, next) => {
    passport.authenticate('local', function (err, user, info) {
        if (err) return next(err);
        if (!user) {
            console.log('User not found');
            res.status(403).send({
                success: false,
                message: 'User not found'
            });
        } else {
            req.login(user, (err) => {
                if (err) {
                    return next(err);
                }

                const token = jwt.sign(
                    {
                        userId: user.user_id,
                        username: user.username,
                        address: user.address
                    }, 
                    process.env.SECRET_KEY,
                    {expiresIn: '10h'}
                );

                console.log(req.isAuthenticated());

                res.status(200).send({
                    success: true,
                    token: token,
                    message: 'Log in successful.'
                });
            })

            // console.log(req.user);
            // console.log(req.isAuthenticated());
            // res.status(200).send({
            //     success: true,
            //     token: token
            // });
        }
    })(req, res, next);

    // try {
    //     console.log(req.body);
    //     res.send('test');
    // } catch (error) {
    //     res.send(error);
    // }
});

router.get('/loginFailed', (req, res) => {
    console.log(req.token);
    res.send({message: 'Nanidd'});
});

router.post('/logout', checkAuthenticated, (req, res, next) => {
    req.logout((error) => {
        if (error) return next(error);
    });
});

router.put('/:userId', checkAuthenticated, async (req, res) => {
    const userId = req.params.userId;
    const currentDate = new Date();

    if (userId == null) {
        return res.status(404).send({message: 'No user id given.'})
    }

    try {
        const user = await query(GET_USER_BY_ID_QUERY, [userId]);

        if (user.rowCount == 0) {
            return res.status(200).send({user: null, message: 'No user found.'});
        }

        const username = req.body.username;
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const address = req.body.address;

        const results = await query(UPDATE_USER_QUERY, [username, hashedPassword, address, currentDate, userId]);
        res.status(200).send({results: results.rows[0], message: 'User updated successfully.'});
    } catch (error) {
        res.send(error.message);     
    }
});

router.delete('/:userId', async (req, res) => {
    const userId = req.params.userId;

    if (userId == null) {
        return res.status(404).send({message: 'No user id given.'})
    }

    try {
        const results = await query(DELETE_USER_QUERY, [userId]);
        res.status(200).send({results: results.rows[0], message: 'User deleted successfully.'});
    } catch (error) {
        res.send(error.message);
    }
});

// app.get('/login', function(req, res, next) {
//     /* look at the 2nd parameter to the below call */
//     passport.authenticate('local', function(err, user, info) {
//       if (err) { return next(err); }
//       if (!user) { return res.redirect('/login'); }
//       req.logIn(user, function(err) {
//         if (err) { return next(err); }
//         return res.redirect('/users/' + user.username);
//       });
//     })(req, res, next);
// });

module.exports = router;