const hasEnoughQuantity = () => {
    return `
        SELECT product_quantity >= $1 AS has_enough_quantity 
        FROM products 
        WHERE product_id = $2;
    `;
};

const getUserCart = () => {
    return `
        SELECT *
        FROM carts
        WHERE user_id = $1;
    `;
};

const updateCartProductQuantity = () => {
    return `
        UPDATE cart_products
        SET quantity = quantity + $1
        WHERE cart_id = $2 AND product_id = $3
        RETURNING product_id, quantity;
    `;
};

const insertCartProduct = () => {
    return `
        INSERT INTO cart_products ( product_id, cart_id, quantity )
        VALUES ($1, $2, $3)
        RETURNING product_id, quantity;
    `;
};

module.exports = {
    hasEnoughQuantity,
    getUserCart,
    updateCartProductQuantity,
    insertCartProduct
};