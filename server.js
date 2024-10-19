const express = require('express');
const app = express();

const posts = [
    { user: 'John', message: 'Love'},
    { user: 'Deah', message: 'Hate'}
];

app.get('/posts', (req, res) => {
    res.json(posts);
});

app.listen(3000);