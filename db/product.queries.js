const productExistsQuery = () => {
    return `
        SELECT EXISTS (
            SELECT 1 
            FROM products 
            WHERE product_id = $1
        ) AS product_exists;
    `;
};

module.exports = {
    productExistsQuery
};