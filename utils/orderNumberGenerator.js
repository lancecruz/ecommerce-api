const crypto = require('crypto');

const generateOrderNumber = (userId) => {
    console.log('Generating Order ID.......');

    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = crypto.randomBytes(3).toString("hex").toUpperCase();
    let orderId = `ORD-${date}-${randomStr}`;

    if (userId) {
        const userHash = crypto.createHash("md5").update(String(userId)).digest("hex").slice(0, 4).toUpperCase();
        orderId += `-${userHash}`;
    }

  return orderId;
}

module.exports = { generateOrderNumber };