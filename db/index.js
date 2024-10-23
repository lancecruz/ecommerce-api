require('dotenv').config();
const Pool = require('pg').Pool;

const pool = new Pool({
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    database: process.env.DATABASE,
    port: process.env.PORT
});

const query = async (text, params, callback) => {
    console.log("test");
    const data = await pool.query(text, params, callback);
    return data; 
};

module.exports = {
    query
};