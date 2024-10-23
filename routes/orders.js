const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Orders GET');
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