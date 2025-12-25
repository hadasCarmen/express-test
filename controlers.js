import fs from "fs/promises";

async function validateUser(username, password) {
  const users = await readUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  return user || null;
}

async function readUsers() {
  try {
    const data = await fs.readFile("users.json", "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeUsers(users) {
  await fs.writeFile("users.json", JSON.stringify(users, null, 2));
}

export const reginUser = async (req, res) => {
  const { username, password } = req.body;
  const users = await readUsers();

  if (users.some((u) => u.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  const maxId = users.length > 0 ? Math.max(...users.map((u) => u.id)) : 0;

  const newUser = {
    id: maxId + 1,
    username,
    password,
  };

  users.push(newUser);
  await writeUsers(users);

  const { password: _, ...userResponse } = newUser;
  res.status(201).json({ message: "User registered successfully" });
};

async function readEvent() {
  try {
    const data = await fs.readFile("events.json", "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeEvents(events) {
  await fs.writeFile("events.json", JSON.stringify(events, null, 2));
}

// app.post("/login", async (req, res) => {
//   const { username, password } = req.body;
//   const user = await validateUser(username, password);

//   if (!user) {
//     return res.status(401).json({ message: "Invalid username or password" });
//   }

//   const { password: _, ...userResponse } = user;
//   res.json({
//     message: "Login successful",
//     user: userResponse,
//   });
// });

// app.get("/events", async (req, res) => {
//   const events = await readEvent();
//   res.json(events);
// });

export const createEvent= async (req, res) => {
  const { username, password, eventName, ticketsForSale } = req.body;

  const user = await validateUser(username, password);
  if (!user) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid username or password" });
  }

  const events = await readEvent();
  const maxId = events.length > 0 ? Math.max(...events.map((p) => p.id)) : 0;

  const newEvent = {
    id: maxId + 1,
    eventName,
    ticketsForSale,
    authorId: user.id,
    authorUsername: user.username,
  };

  events.push(newEvent);
  await writeEvents(events);
  res.status(201).json({ message: "Event created successfully" });
};
