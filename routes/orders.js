const express = require('express');
const { query } = require('../db/index');
const router = express.Router();

const GET_ALL_ORDERS_QUERY = 'SELECT * FROM orders ORDER BY created ASC;';
const GET_ORDER_BY_ORDER_ID_QUERY = 'SELECT * FROM orders WHERE order_id = $1;';

router.get('/', async (req, res) => {
    try {
        const results = await query(GET_ALL_ORDERS_QUERY);
        res.status(200).send({ results: results.rows, message: 'Success' })
    } catch (error) {
        res.send(error.message);
    }
});

router.get('/:orderId', async (req, res) => {
    const orderId = req.params.orderId;

    if (orderId == null || isNaN(orderId)) {
        return res.send({ message: 'Please provide a valid Order ID.'});
    }

    try {
        const results = await query(GET_ORDER_BY_ORDER_ID_QUERY, [orderId]);
        
        if (results.rowCount == 0) {
            return res.send({ message: 'No Order found.' });
        }

        res.status(200).send({ results: results.rows[0], message: 'Order found successfully.' });
    } catch (error) {
        res.send(error.message);
    }
});

router.post('/', (req, res) => {
    res.send('Orders POST');
});

router.put('/:id', (req, res) => {
    res.send('Orders PUT');
});

router.delete('/:id', (req, res) => {
    res.send('Orders DELETE');
});

module.exports = router;