const express = require('express');
const app = express();
const { query } = require('./db/index');
const passport = require('passport');
const { initialize } = require('./passport-config');
const session = require('express-session');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');
const cartsRoutes = require('./routes/cart');

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
app.use('/cart', cartsRoutes);

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