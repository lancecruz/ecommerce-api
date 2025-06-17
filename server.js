const express = require('express');
const app = express();
const cors = require('cors');
const { query } = require('./db/index');
const passport = require('passport');
const { initialize } = require('./passport-config');
const session = require('express-session');
const multer = require('multer');
const path = require("path");
const fs = require('fs');

const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');
const cartsRoutes = require('./routes/cart');

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

initialize(passport);

// app.use(passport.initialize());
// app.use(passport.session());
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(passport.authenticate('session'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/image", express.static("image"));

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

let imageName = "";
const storage = multer.diskStorage({
  destination: path.join("./image"),
  filename: function (req, file, cb) {
    imageName = Date.now() + path.extname(file.originalname);
    cb(null, imageName);
  },
});

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 3000000 },
// }).single("myImage");

const upload = multer({ dest: "uploads/" });

app.post('/upload-image', upload.single('myImage'), (req, res) => {
    console.log(req.file);

    ///////////////////////////
    const oldPath = req.file.path;

    if (req.file.mimetype != 'image/png') {
        
    }

    fs.rename(oldPath, 'uploads/' + req.file.originalname, err => {
        if (err) return res.json({error: 'Something happened.'});

        res.status(200).json(req.file);
    });
    ///////////////////////////

    //res.status(201).json({ url: 'http://localhost:4000/uploads/' + req.file.filename});
    //res.json(req.file);
    // upload(req, res, (err) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         return res.status(201)
    //         .json({ url: 'http://localhost:4000/uploads/' + imageName });
    //     }
    // });
});

//app.use('/images', express.static(path.join(__dirname, 'images')));

app.listen(4000);