import fs from "fs/promises";

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
  res.status(201).json(userResponse);
};
