const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Middleware untuk logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

let users = [];

const checkUserData = (data) => {
  if (!data.id || !data.name) {
    return { isValid: false, message: "ID and Name are required" };
  }
  if (typeof data.id !== "number") {
    return { isValid: false, message: "ID must be a number" };
  }
  if (typeof data.name !== "string") {
    return { isValid: false, message: "Name must be a string" };
  }
  return { isValid: true };
};

app.get("/users", (req, res) => {
  res.json(users);
});

app.post("/users", (req, res) => {
  const user = req.body;
  const validation = checkUserData(user);

  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }

  const isExist = users.find((u) => u.id === user.id);
  if (!isExist) {
    users.push(user);
    res.status(201).json(user);
  } else {
    res.status(400).json({ message: `User with ID ${user.id} already exists` });
  }
});

app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const user = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const index = users.findIndex((u) => u.id === parseInt(id, 10));
  if (index === -1) {
    res.status(404).json({ message: `User with ID ${id} not found` });
  } else {
    const validation = checkUserData(user);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    users[index] = { ...users[index], ...user };
    res.json(users[index]);
  }
});

app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  const index = users.findIndex((u) => u.id === parseInt(id, 10));

  if (index === -1) {
    res.status(404).json({ message: `User with ID ${id} not found` });
  } else {
    users.splice(index, 1);
    res.status(204).end();
  }
});

app.get("/users/search", (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: "Missing name query parameter" });
  }

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(name.toLowerCase())
  );

  if (filteredUsers.length === 0) {
    res.status(404).json({ message: "User not found" });
  } else {
    res.status(200).json(filteredUsers);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
