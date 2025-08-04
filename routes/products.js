const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const upload = multer({ dest: "uploads/" });

const { checkAuthenticated } = require('../passport-config');
const { query } = require('../db/index');

const GET_ALL_PRODUCTS_QUERY = 'SELECT * FROM products AS p LEFT JOIN product_image ON product_image.product_id = p.product_id LEFT JOIN product_categories ON p.product_id = product_categories.product_id LEFT JOIN categories ON product_categories.category_id = categories.category_id;';
const GET_PRODUCT_BY_ID_QUERY = 'SELECT product_id, product_name, product_cost, product_description, product_quantity, product_owner_id, product_added_date, products.updated, username FROM products INNER JOIN users ON users.user_id = products.product_owner_id WHERE product_id = $1;'
const GET_ALL_PRODUCTS_BY_CATEGORY_ID_QUERY = 'SELECT products.product_id, product_name, category_name FROM products INNER JOIN product_categories ON products.product_id = product_categories.product_id INNER JOIN categories ON categories.category_id = product_categories.category_id WHERE categories.category_id = $1';
const INSERT_INTO_PRODUCTS_QUERY = 'INSERT INTO products (product_name, product_cost, product_description, product_quantity, product_owner_id, product_added_date, created, updated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING product_id';
const INSERT_INTO_PRODUCT_IMAGE = 'INSERT INTO product_image (product_id, image_path) VALUES ($1, $2) RETURNING product_id';
const UPDATE_PRODUCT_QUERY = 'UPDATE products SET product_name = $1, product_cost = $2, product_description = $3, product_quantity = $4, product_owner_id = $5, updated = $6 WHERE product_Id = $7;';
const DELETE_PRODUCT_FROM_PRODUCT_CATEGORIES_QUERY = 'DELETE FROM product_categories WHERE product_id = $1';
const DELETE_PRODUCT_BY_ID_QUERY = 'DELETE FROM products WHERE product_id = $1;';

router.get('/', async (req, res) => {
    console.log('Product Get');
    try {
        const results = await query(GET_ALL_PRODUCTS_QUERY);
        res.json(results.rows);
    } catch (error) {
        res.send(error.message);
    }
});

router.use('/images', express.static(path.join(__dirname, '../uploads')));

router.get('/test', (req, res) => {
    console.log(__dirname);
    res.json({
        message: 'Hi'
    })
});

router.get('/:productId', async (req, res) => {
    try {
        const results = await query(GET_PRODUCT_BY_ID_QUERY, [req.params.productId]);

        if (results.rowCount == 0) {
            res.send('No item found.');
        }

        res.status(200).send(results.rows[0]);
    } catch (error) {
        res.send(error.message);
    }
});

router.get('/category/:categoryId', async (req, res) => {
    const categoryId = req.params.categoryId;
    
    try {
        const results = await query(GET_ALL_PRODUCTS_BY_CATEGORY_ID_QUERY, [categoryId]);
        
        if (results.rowCount == 0) {
            res.send('No product found.');
        }

        res.status(200).send(results.rows[0]);
    } catch (error) {
        res.send(error.message);
    }
});

router.post('/add', upload.single('productPhoto'), async (req, res) => {
    try {
        console.log('hello');
        console.log(req.body);

        const oldPath = req.file.path;

        if (req.file.mimetype != 'image/png') {
            
        }

        fs.rename(oldPath, 'images/' + req.file.originalname, async (err) => {
            if (err) return res.json({error: 'Something happened.'});

            console.log(req.body);
            console.log(req.file);
            
            const date = new Date();

            const result = await query(INSERT_INTO_PRODUCTS_QUERY, [
                req.body.productName,
                req.body.productCost,
                req.body.productDescription,
                req.body.productQuantity,
                4,
                date,
                date,
                date
            ]).then(async (response) => {
                console.log(response);
                console.log(response.rows);
                const imagePath = req.file.destination + req.file.originalname;

                if (response.rowCount > 0) {
                    const insertProductImage = await query(INSERT_INTO_PRODUCT_IMAGE, [response.rows[0].product_id, imagePath]);
                    console.log(insertProductImage);
                    res.status(200).json({
                        success: true
                    });
                }
            });      
        });
    } catch (error) {
        res.status().json({
            success: false,
            message: error
        });
    };
});

router.post('/', checkAuthenticated, async (req, res) => {
    console.log('test');
    const date = new Date();
    
    try {
        const { productName } = req.body;
        console.log(req.body);
        const result = await query(INSERT_INTO_PRODUCTS_QUERY, [
            req.body.productName,
            req.body.productCost,
            req.body.productDescription,
            req.body.productQuantity,
            req.body.productOwnerId,
            date,
            date,
            date
        ]);
    } catch (error) {
        res.send(error.message);
    }
});

router.put('/:productId', checkAuthenticated, async (req, res) => {
    const date = new Date();
    const productId = req.params.productId;

    try {
        if (productId == null) {
            return res.send('No Product ID');
        }

        const result = await query(UPDATE_PRODUCT_QUERY, [
            req.body.productName,
            req.body.productCost,
            req.body.productDescription,
            req.body.productQuantity,
            req.body.productOwnerId,
            date,
            productId
        ]);

        res.status(200).send({ message: 'Product updated successfully.' });
    } catch (error) {
        res.send(error.message);
    }
});

router.delete('/:productId', checkAuthenticated, async (req, res) => {
    const productId = req.params.productId;
    console.log(productId);
    
    try {
        const deleteFromProductCategoriesResults = await query(DELETE_PRODUCT_FROM_PRODUCT_CATEGORIES_QUERY, [productId]);
        const deleteFromProductsResults = await query(DELETE_PRODUCT_BY_ID_QUERY, [productId]);
        res.status(200).send({ message: 'Product deleted successfully.' });
    } catch (error) {
        res.send(error.message);
    }
});

module.exports = router;