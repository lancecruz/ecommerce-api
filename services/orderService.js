const { generateOrderNumber } = require('../utils/orderNumberGenerator');
const { Pool, query } = require('../db/index');

const INSERT_ORDER_QUERY = `INSERT INTO orders (order_number, user_id, total, status, order_date, delivery_address, updated) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
const INSERT_ORDER_ITEMS_QUERY = `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`;

const createOrder = async (orderItems, userId) => {
    //const client = await Pool.connect();

    try {
        console.log(orderItems);
        console.log(userId);

        //await client.query("BEGIN");
        
        const orderNumber = generateOrderNumber(userId);
        const currentDate = new Date();
        const totalPrice = orderItems.reduce((sum, item) => sum + (item.productPrice * item.orderQty), 0);
        
        const orderResult = await query(INSERT_ORDER_QUERY, [orderNumber, userId, totalPrice, 'pending', currentDate, 'Some Address', currentDate]);
        const order = orderResult.rows[0];

        if (orderItems && orderItems.length > 0) {
            for (item of orderItems) {
                await query(INSERT_ORDER_ITEMS_QUERY, [order.order_id, item.id, item.orderQty, item.productPrice]);
            }
        };

        //await client.query("COMMIT");
        return orderNumber;
    } catch (err) {
        //await client.query("ROLLBACK");
        throw err;
    } finally {
        //client.release();
    }
}

module.exports = { createOrder };