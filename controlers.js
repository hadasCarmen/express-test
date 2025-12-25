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

  const newUser = {
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
async function readReceipts() {
  try {
    const data = await fs.readFile("receipts.json", "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeReceipts(receipts) {
  await fs.writeFile("receipts.json", JSON.stringify(receipts, null, 2));
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

export const createEvent = async (req, res) => {
  const { username, password, eventName, ticketsAvailable } = req.body;

  const user = await validateUser(username, password);
  if (!user) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid username or password" });
  }

  const events = await readEvent();
  const maxId = events.length > 0 ? Math.max(...events.map((p) => p.id)) : 0;

  const newEvent = {
    eventName,
    ticketsAvailable,
    createdBy: user.username,
  };

  events.push(newEvent);
  await writeEvents(events);
  res.status(201).json({ message: "Event created successfully" });
};

export const buyTickets = async (req, res) => {
  const { username, password, eventName, quantity } = req.body;
  const user = await validateUser(username, password);
  if (!user) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid username or password" });
  }
  const events = await readEvent();
  const event = events.find(
    (e) => e.eventName.toUpperCase() === eventName.toUpperCase()
  );

  if (event.ticketsAvailable >= quantity) {
    event.ticketsAvailable -= quantity;

    const newReceipt = {
      username: username,
      eventName: eventName,
      ticketsBought: quantity,
    };
    const eventToUpdute = events.findIndex(
      (even) => even.eventName === event.eventName
    );
    events[eventToUpdute] = event;
    writeEvents(events);
    const receipts = await readReceipts();
    receipts.push(newReceipt);
    writeReceipts(receipts);

    res.status(201).json({ message: "Tickets purchased successfully" });
  } else {
    res.status(404).send({ message: "not enouf tickets" });
  }
};
