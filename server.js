const express = require('express');
const app = express();
const { query } = require('./db/index');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');
const passport = require('passport');
const { initialize } = require('./passport-config');
const session = require('express-session');

initialize(passport);

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));


// app.use(passport.initialize());
// app.use(passport.session());
app.use(passport.authenticate('session'));

app.use(express.json());
app.use('/products', productsRoutes);
app.use('/orders', ordersRoutes);
app.use('/users', usersRoutes);
app.use('/category', categoriesRoutes);

const posts = [
    { user: 'John', message: 'Love'},
    { user: 'Deah', message: 'Hate'}
];

app.get('/posts', async (req, res) => {
    console.log('posts');
    const results = await query('SELECT * FROM users');

    console.log(results.rows);

    res.json(posts);
});

app.listen(3000);