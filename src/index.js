const express = require("express");
var mongo = require("./mongo");
var poolPromise = require("./db"); // Import promise

const app = express();
const port = 3004;

// Set view engine
app.set("view engine", "ejs");

// Main Page
app.get("/", (req, res) => {
  res.render("mainPage", {
    studentLink: "/students",
    gradeLink: "/grades",
    lecturerLink: "/lecturers",
  });
});

// STUDENTS FROM MYSQL
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

// GRADES FROM MYSQL
app.get("/grades", async (req, res) => {
  try {
    const pool = await poolPromise;
    const grade = await pool.query(`
      SELECT 
        s.name AS sName, 
        m.name AS mName, 
        g.grade AS grade
      FROM grade g
      JOIN student s ON g.sid = s.sid
      JOIN module m ON g.mid = m.mid
      ORDER BY s.name ASC, g.grade ASC
    `);
    res.render("grades", { grade: grade });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// LECTURERS FROM JSON
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
