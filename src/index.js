const express = require("express");
var mongo = require("./mongo");
var poolPromise = require("./db"); // Import promise

const app = express();
const port = 3004;

const bodyParser = require("body-parser");
// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware to parse JSON data
app.use(bodyParser.json());

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

// Display students
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

// UPDATE STUDENTS
app.get("/students/edit/:sid", async (req, res) => {
  try {
    const pool = await poolPromise;
    const sid = req.params.sid;

    // Fetch student by ID
    const student = await pool.query("SELECT * FROM student WHERE sid = ?", [
      sid,
    ]);

    // Check if query returned rows
    if (!student || student.length === 0) {
      return res.status(404).send("Student not found");
    }

    res.render("updateStudent", { student: student[0], error: null });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.post("/students/edit/:sid", async (req, res) => {
  try {
    const pool = await poolPromise;
    const sid = req.params.sid;
    const { name, age } = req.body;

    // Validate name and age
    let error = null;
    if (!name || name.length < 2) {
      error = "Name should be a minimum of 2 characters.";
    } else if (!age || age < 18) {
      error = "Age should be 18 or older.";
    }

    // Re-render form with error if validation fails
    if (error) {
      const [student] = await pool.query(
        "SELECT * FROM student WHERE sid = ?",
        [sid]
      );
      return res.render("updateStudent", { student: student, error });
    }

    // edit student in database
    await pool.query("UPDATE student SET name = ?, age = ? WHERE sid = ?", [
      name,
      age,
      sid,
    ]);

    // Redirect back to Students Page
    res.redirect("/students");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// ADD STUDENTS
app.get("/students/add", (req, res) => {
  res.render("addStudent", { error: null }); // Render form
});

app.post("/students/add", async (req, res) => {
  try {
    const pool = await poolPromise;
    const { sid, name, age } = req.body;

    // Validate input
    let error = null;
    if (!sid || sid.length !== 4) {
      error = "Student ID is invalid.";
    } else if (!name || name.length < 2) {
      error = "Name should be at least 2 characters.";
    } else if (!age || age < 18) {
      error = "Age should be 18 or older.";
    }

    // Check if student ID already exists
    const existing = await pool.query("SELECT * FROM student WHERE sid = ?", [
      sid,
    ]);

    if (existing.length > 0) {
      error = "A student with this ID already exists.";
    }

    // Show error if validation fails
    if (error) {
      return res.render("addStudent", { error });
    }

    // Insert student into MySQL database
    await pool.query("INSERT INTO student (sid, name, age) VALUES (?, ?, ?)", [
      sid,
      name,
      age,
    ]);

    // Redirect back to Students Page
    res.redirect("/students");
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
        IFNULL(m.name, ' ') AS mName, 
        IFNULL(g.grade, ' ') AS grade
      FROM student s
      LEFT JOIN grade g ON s.sid = g.sid
      LEFT JOIN module m ON g.mid = m.mid
      ORDER BY s.name ASC, g.grade ASC;
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
