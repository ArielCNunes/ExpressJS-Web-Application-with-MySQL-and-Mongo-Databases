const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3004;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set view engine
app.set('view engine', 'ejs');

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Express MySQL & MongoDB App!');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});