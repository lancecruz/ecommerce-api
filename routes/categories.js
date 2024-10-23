const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Categories GET');
});

router.post('/', (req, res) => {
    res.send('Categories POST');
});

router.put('/:id', (req, res) => {
    res.send('Categories PUT');
});

router.delete('/:id', (req, res) => {
    res.send('Categories DELETE');
});

module.exports = router;