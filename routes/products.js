const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Product GET');
});

router.post('/', (req, res) => {
    res.send('Product POST');
});

router.put('/:id', (req, res) => {
    res.send('Product PUT');
});

router.delete('/:id', (req, res) => {
    res.send('Product DELETE');
});

module.exports = router;