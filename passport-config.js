const LocalStrategy = require('passport-local').Strategy;
const { query } = require('./db/index');
const bcrypt = require('bcrypt');

const initialize = (passport) => {
    passport.use(new LocalStrategy(async (username, password, done) => {
        const user = await query('SELECT * FROM users WHERE username = $1', [username]);
    
        if (user.rowCount == 0) {
            console.log('Username not found');
            return done(null, false, { message: 'No user with that username.'});
        }
    
        try {
            if (await bcrypt.compare(password, user.rows[0].password)) {
                return done(null, user.rows[0]);
            } else {
                console.log('incorrect password');
                return done(null, false, { message: 'Password is incorrect for user.'});
            }
        } catch (error) {
            return done(error);
        }
    }));
    passport.serializeUser((user, done) => {
        process.nextTick(() => {
            console.log('seri');
            done(null, { 
                userId: user.user_id, 
                username: user.username,
                address: user.address
            });
        });
    });
    
    passport.deserializeUser((user, done) => {
        process.nextTick(() => {
            console.log('dese');
            console.log(user);
            return done(null, user);
        });
    });
};

const checkAuthenticated = (req, res, next) => {
    const header = req.headers['authorization'];
    console.log(header);

    if (typeof header != 'undefined') {
        const bearer = header.split(' ');
        const token = bearer[1];
        console.log(token);
        console.log(req.isAuthenticated());
        if (req.isAuthenticated()) {
            req.token = token;
            return next();
        } else {
            res.status(403).send({
                authenticated: false,
                message: 'Not authenticated.'
            });
        };
    } else {
        console.log('Header is undefined');
        res.status(403).send({
            authenticated: false,
            message: 'Not authenticated.'
        });
    }
    
    // const header = req.headers['authorization'];

    // if (typeof header != 'undefined') {
    //     const bearer = header.split(' ');
    //     const token = bearer[1];
    //     console.log(token);
    //     if (req.isAuthenticated()) {
    //         req.token = token;
    //         return next();
    //     } else {
    //         res.send('Not Authenticatedddd');
    //     };
    // } else {
    //     res.status(403).send({message: 'Not authenticated.'});
    // };  
};

module.exports = {
    initialize,
    checkAuthenticated
};