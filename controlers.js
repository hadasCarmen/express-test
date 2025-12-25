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
  const { username, password, type } = req.body;
  const users = await readUsers();

  if (users.some((u) => u.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  const newUser = {
    username,
    password,
  };
  if (type) {
    newUser["type"] = type;
  } else {
    newUser["type"] = "user";
  }

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

export const createEvent = async (req, res) => {
  const { username, password, eventName, ticketsAvailable } = req.body;

  const user = await validateUser(username, password);
  if (!user) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid username or password" });
  }
  if (user.type === "user") {
    const events = await readEvent();

    const newEvent = {
      eventName,
      ticketsAvailable,
      createdBy: user.username,
    };

    events.push(newEvent);
    await writeEvents(events);
    res.status(201).json({ message: "Event created successfully" });
  } else {
    res.status(401).send("just user can create event");
  }
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

export const ticketOneUser = async (req, res) => {
  try {
    const { username } = req.params;
    const receipts = await readReceipts();
    const userReceipts = receipts.filter((r) => r.username === username);
    const totalTicketsBought = userReceipts.reduce(
      (sumi, r) => sumi + r.ticketsBought,
      0
    );
    const events = [];
    userReceipts.forEach((e) => {
      const exist = events.some((re) => re.eventName === e.eventName);
      if (!exist) {
        events.push(e.eventName);
      }
    });
    const averageTicketsPerEvent = totalTicketsBought / userReceipts.length;
    const summary = {
      totalTicketsBought: totalTicketsBought,
      events: events,
      averageTicketsPerEvent: averageTicketsPerEvent,
    };
    res.status(200).json({ summary });
  } catch (error) {
    res.status(500).send("not receipts exist");
  }
};

export const transferTickets = async (req, res) => {
  const { username, username2, password, eventName, quantityTransfer } =
    req.body;
  const user = await validateUser(username, password);
  if (!user) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid username or password" });
  }
  const users = readUsers();

  const events =await readEvent();
  const event = events.findIndex((e) => e.eventName === eventName);
  const newEvent2 = {
    eventName,
    ticketsAvailable: quantityTransfer,
    createdBy: username2,
  };
  const newEvent1 = {
    eventName,
    ticketsAvailable: (events[event].ticketsAvailable -= quantityTransfer),
    createdBy: username,
  };
  events[event] = newEvent1;
  events.push(newEvent2);
  writeEvents(events);
};
