const express = require('express');
var poolPromise = require('./db'); // Import promise

const app = express();
const port = 3004;

// Set view engine
app.set('view engine', 'ejs');

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Express MySQL & MongoDB App!');
});

// STUDENTS DATABASE
app.get('/students', async (req, res) => {
  try {
    const pool = await poolPromise;
    const students = await pool.query('SELECT * FROM student');
    res.render('students', { students: students });
  } catch (err) {
      console.error(err);
      res.status(500).send('Database error');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});