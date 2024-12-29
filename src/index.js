const express = require("express");
const bodyParser = require("body-parser");
var mongo = require("./mongo");

// Import promise
var poolPromise = require("./db");

const app = express();
const port = 3004;

// Middleware for parsing URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware for parsing JSON data in request bodies
app.use(bodyParser.json());

// Set view engine
app.set("view engine", "ejs");

// Render main Page
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

    // MySQL query
    const students = await pool.query("SELECT * FROM student");

    // Send data to .ejs file
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

    // Get student by ID
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

// Display grades
app.get("/grades", async (req, res) => {
  try {
    const pool = await poolPromise;
    
    // Join MySQL tables to get data
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

    // Render page
    res.render("grades", { grade: grade });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// Display lecturers
app.get("/lecturers", async (req, res) => {
  try {
    // Get lecturers from MongoDB
    const lecturers = await mongo.findAll();

    // Sort by Lecturer ID (ascending order)
    lecturers.sort((a, b) => a._id.localeCompare(b._id));

    // Render lecturers.ejs
    res.render("lecturers", { lecturers: lecturers, error: null });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to load lecturers.");
  }
});

// DELETE LECTURER
app.post("/lecturers/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Delete lecturer by ID
    await mongo.deleteById(id);

    // Back to lecturers page
    res.redirect("/lecturers");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to delete lecturer.");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
