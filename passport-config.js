const LocalStrategy = require('passport-local').Strategy;
const { query } = require('./db/index');
const bcrypt = require('bcrypt');

const initialize = (passport) => {
    passport.use(new LocalStrategy(async (username, password, done) => {
        const user = await query('SELECT * FROM users WHERE username = $1', [username]);
    
        if (user.rowCount == 0) {
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
            done(null, { userId: user.user_id, username: user.username });
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
    if (req.isAuthenticated()) {
        return next();
    }

    res.status(403).send('Not authenticated.');
};

module.exports = {
    initialize,
    checkAuthenticated
};