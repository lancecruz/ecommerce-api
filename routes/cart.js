const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();
const { query } = require('../db/index');
const { createOrder } = require('../services/orderService');
const jwt = require('jsonwebtoken');

const GET_CART_QUERY = 'SELECT carts.cart_id, products.product_name, products.product_cost, cart_products.quantity, cart_products.total_cost FROM carts INNER JOIN cart_products ON cart_products.cart_id = carts.cart_id INNER JOIN products ON cart_products.product_id = products.product_id WHERE carts.cart_id = $1;';
const ADD_CART_QUERY = 'INSERT INTO carts (user_id, isActive, created, updated) VALUES ($1, $2, $3, $4) RETURNING cart_id;';
const ADD_PRODUCT_TO_CART_QUERY = 'INSERT INTO cart_products (product_id, cart_id, quantity, total_cost) VALUES ($1, $2, $3, $4) RETURNING cart_product_id';
const GET_PRODUCT_QUANTITY_QUERY = 'SELECT product_quantity FROM products WHERE product_id = $1';
const REMOVE_CART_PRODUCT_QUERY = 'DELETE FROM cart_products WHERE cart_product_id = $1 RETURNING cart_product_id';
const CREATE_ORDER_QUERY = 'INSERT INTO orders (cart_id, total_cost, order_date, order_recipient_id, delivery_address, complete, created, updated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING order_id;';
const GET_PRODUCT_BY_ID_QUERY = 'SELECT product_id, product_name, product_cost, product_description, product_quantity, product_owner_id, product_added_date, products.updated, username FROM products INNER JOIN users ON users.user_id = products.product_owner_id WHERE product_id = $1;'


router.get('/:cartId', async (req, res) => {
    const cartId = req.params.cartId;

    try {
        const results = await query(GET_CART_QUERY, [cartId]);

        if (results.rowCount == 0) {
            res.status(200).send({ message: 'No cart found' });
        }

        res.status(200).send({results: results.rows, message: 'Cart found successfully.'});
    } catch (error) {
        res.send(error.message);
    }
});

// Add cart
router.post('/', async (req, res) => {
    const currentDate = new Date();

    try {
        const results = await query(ADD_CART_QUERY, [req.body.userId, true, currentDate, currentDate]);
        res.send(results);
    } catch (error) {
        res.send(error.message);
    }
});

// Checkout
router.post('/create-checkout-session', async (req, res) => {
    let userId = null;

    try {
        const { orderItems, token } = req.body;
        // let testArr = req.body.map(async (item) => {
        //     const product = await query(GET_PRODUCT_BY_ID_QUERY, [item.id]);
        //     console.log(product.rows[0]);
        // });

        if (token) {
            const decodedToken = jwt.decode(token);
            userId = decodedToken.userId;
            console.log(decodedToken);
        }

        const orderNumber = await createOrder(orderItems, userId);

        const session = await stripe.checkout.sessions.create({
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'test'
                    },
                    unit_amount: 50
                },
                quantity: 5
            }],
            mode: 'payment',
            success_url: `${process.env.SERVER_URL}/order-success/${orderNumber}`,
            cancel_url:  `${process.env.SERVER_URL}/cart/`
        });

        //console.log(session);
        res.json({url: session.url});
    } catch (error) {
        console.error(error.message);
    }
});

// Add product to cart
router.post('/:cartId', async (req, res) => {
    console.log('Add to cart.');
    const cartId = req.params.cartId;

    if (cartId == null || isNaN(cartId)) {
        return res.send('No cart id provided.');
    }

    try {
        const productIsValid = await isProductStockEnough(req.body.productId, req.body.quantity);
        
        if (productIsValid) {
            const results = await query(ADD_PRODUCT_TO_CART_QUERY, [req.body.productId, cartId, req.body.quantity, req.body.totalCost]);
            res.status(200).send({ results: results.rows[0].cart_product_id, success: true, message: 'Product added to cart successfully.' });
        } else {
            return res.send({ message: 'Product stock is not enought.' });
        }
    } catch (error) {
        res.send(error.messge);
    }
});

router.post('/:cartId/checkout', async (req, res) => {
    const cartId = req.params.cartId;
    const userId = req.body.userId;
    const deliveryAddress = req.body.deliveryAddress;
    const currentDate = new Date();
    
    if (cartId == null || isNaN(cartId)) {
        return res.send('Please provide a valid Cart ID');
    }

    try {
        // Process payment....

        // If payment is successful, create order.
        const totalOrderCost = await calculateTotalOrderCost(cartId);

        if (totalOrderCost == null){
            return res.send('Something went wrong');
        }

        // Create Order
        const results = await query(CREATE_ORDER_QUERY, [cartId, totalOrderCost, currentDate, userId, deliveryAddress, false, currentDate, currentDate]); 
        res.status(200).send({ results: results.rows[0], message: 'Order processed successfully.' });
    } catch (error) {
        res.send(error.message);
    }
});

router.delete('/:cartProductId', async (req, res) => {
    const cartProductId = req.params.cartProductId;

    try {
        const results = await query(REMOVE_CART_PRODUCT_QUERY, [cartProductId]);
        res.status(200).send({results: results.rows[0], message: 'Product removed from cart successfully.'});
    } catch (error) {
        res.send(error.message);
    }
});

const isProductStockEnough = async (productId, productQuantity) => {
    try {
        const product = await query(GET_PRODUCT_QUANTITY_QUERY, [productId]);

        if (product.rowCount == 0){
            res.send('Product does not exist.');
        }

        if (product.rows[0].product_quantity >= productQuantity) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        res.send(error.message);
    }
};

const calculateTotalOrderCost = async (cartId) => {
    let totalOrderCost = 0.00;

    try {
        const cartProducts = await query(GET_CART_QUERY, [cartId]);

        if (cartProducts.rowCount == 0) {
            return null;
        }

        cartProducts.rows.forEach(product => {
            totalOrderCost += parseFloat(parseFloat(product.total_cost).toFixed(2));
        });

        return totalOrderCost.toFixed(2);
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = router;