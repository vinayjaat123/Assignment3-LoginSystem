const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend")));

const dbPath = path.join(__dirname, "users.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database:", dbPath);
  }
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 20;

function isValidEmail(email) {
  return emailRegex.test(email);
}

function isValidPassword(password) {
  return password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH;
}

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      fullName TEXT,
      email TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      content TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      taskText TEXT NOT NULL,
      completed INTEGER DEFAULT 0
    )
  `);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.post("/register", async (req, res) => {
  const email = req.body.email ? req.body.email.trim().toLowerCase() : "";
  const password = req.body.password ? req.body.password.trim() : "";

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      message: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`
    });
  }

  try {
    db.get("SELECT id FROM users WHERE email = ?", [email], async (selectErr, existingUser) => {
      if (selectErr) {
        console.error("Register select error:", selectErr.message);
        return res.status(500).json({ message: "Database error during registration." });
      }

      if (existingUser) {
        return res.status(400).json({ message: "Email already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      db.run(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hashedPassword],
        function (insertErr) {
          if (insertErr) {
            console.error("Register insert error:", insertErr.message);

            if (insertErr.message.includes("UNIQUE constraint failed")) {
              return res.status(400).json({ message: "Email already exists." });
            }

            return res.status(500).json({ message: "Registration failed." });
          }

          return res.status(201).json({ message: "Registration successful." });
        }
      );
    });
  } catch (error) {
    console.error("Register server error:", error.message);
    return res.status(500).json({ message: "Server error during registration." });
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email ? req.body.email.trim().toLowerCase() : "";
  const password = req.body.password ? req.body.password.trim() : "";

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      message: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`
    });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) {
      console.error("Login DB error:", err.message);
      return res.status(500).json({ message: "Database error." });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      return res.json({
        message: "Login successful.",
        email: user.email
      });
    } catch (compareErr) {
      console.error("Password compare error:", compareErr.message);
      return res.status(500).json({ message: "Server error during login." });
    }
  });
});

app.get("/api/profile/:username", (req, res) => {
  const username = req.params.username;

  db.get("SELECT * FROM profiles WHERE username = ?", [username], (err, row) => {
    if (err) {
      console.error("Load profile error:", err.message);
      return res.status(500).json({ message: "Error loading profile." });
    }

    return res.json(row || { username, fullName: "", email: "" });
  });
});

app.post("/api/profile", (req, res) => {
  const { username, fullName, email } = req.body;

  db.run(
    `INSERT INTO profiles (username, fullName, email)
     VALUES (?, ?, ?)
     ON CONFLICT(username) DO UPDATE SET
     fullName = excluded.fullName,
     email = excluded.email`,
    [username, fullName || "", email || ""],
    function (err) {
      if (err) {
        console.error("Save profile error:", err.message);
        return res.status(500).json({ message: "Error saving profile." });
      }

      return res.json({ message: "Profile saved successfully." });
    }
  );
});

app.get("/api/notes/:username", (req, res) => {
  const username = req.params.username;

  db.get("SELECT * FROM notes WHERE username = ?", [username], (err, row) => {
    if (err) {
      console.error("Load notes error:", err.message);
      return res.status(500).json({ message: "Error loading notes." });
    }

    return res.json(row || { username, content: "" });
  });
});

app.post("/api/notes", (req, res) => {
  const { username, content } = req.body;

  db.run(
    `INSERT INTO notes (username, content)
     VALUES (?, ?)
     ON CONFLICT(username) DO UPDATE SET
     content = excluded.content`,
    [username, content || ""],
    function (err) {
      if (err) {
        console.error("Save notes error:", err.message);
        return res.status(500).json({ message: "Error saving notes." });
      }

      return res.json({ message: "Notes saved successfully." });
    }
  );
});

app.get("/api/tasks/:username", (req, res) => {
  const username = req.params.username;

  db.all(
    "SELECT * FROM tasks WHERE username = ? ORDER BY id DESC",
    [username],
    (err, rows) => {
      if (err) {
        console.error("Load tasks error:", err.message);
        return res.status(500).json({ message: "Error loading tasks." });
      }

      return res.json(rows);
    }
  );
});

app.post("/api/tasks", (req, res) => {
  const { username, taskText } = req.body;

  if (!taskText || !taskText.trim()) {
    return res.status(400).json({ message: "Task text is required." });
  }

  db.run(
    "INSERT INTO tasks (username, taskText, completed) VALUES (?, ?, 0)",
    [username, taskText.trim()],
    function (err) {
      if (err) {
        console.error("Add task error:", err.message);
        return res.status(500).json({ message: "Error adding task." });
      }

      return res.json({ message: "Task added successfully." });
    }
  );
});

app.put("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  db.run(
    "UPDATE tasks SET completed = ? WHERE id = ?",
    [completed ? 1 : 0, id],
    function (err) {
      if (err) {
        console.error("Update task error:", err.message);
        return res.status(500).json({ message: "Error updating task." });
      }

      return res.json({ message: "Task updated successfully." });
    }
  );
});

app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Delete task error:", err.message);
      return res.status(500).json({ message: "Error deleting task." });
    }

    return res.json({ message: "Task deleted successfully." });
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});