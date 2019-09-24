const express = require('express');
const path = require('path');
const app = express();

const port = process.env.PORT ? process.env.PORT : 8080;

app.get('/*', function (req, res) {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port);