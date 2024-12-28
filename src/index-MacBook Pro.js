const express = require("express");
var mongo = require("./mongo");
var poolPromise = require("./db"); // Import promise

const app = express();
const port = 3004;

// Set view engine
app.set("view engine", "ejs");

// Main Page
app.get("/", (req, res) => {
  res.render("mainPage", { studentLink: "/students", gradeLink: "/grades", lecturerLink: "/lecturers" });
});

// STUDENTS DATABASE
app.get("/students", async (req, res) => {
  try {
    const pool = await poolPromise;
    const students = await pool.query("SELECT * FROM student");
    res.render("students", { students: students });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.get("/grades", async (req, res) => {
  try {
    const pool = await poolPromise;
    const students = await pool.query("SELECT * FROM student");
    res.render("students", { students: students });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// LECTURERS JSON
app.get("/lecturers", (req, res) => {
  mongo
    .findAll()
    .then((data) => {
      console.log(JSON.stringify(data));
      res.send(data);
    })
    .catch((error) => {
      console.log(JSON.stringify(error));
      res.send(error);
    });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
