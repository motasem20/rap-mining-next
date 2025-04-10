// pages/api/register.js
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user_id, username } = req.body;
  const numericId = parseInt(user_id); // ✅ التحويل المهم

  if (!numericId || !username) {
    return res.status(400).json({ error: "Missing user_id or username" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("rap_mining");
    const users = db.collection("users");

    const existingUser = await users.findOne({ user_id: numericId });

    if (existingUser) {
      await users.updateOne(
        { user_id: numericId },
        { $set: { username } }
      );
    } else {
      await users.insertOne({
        user_id: numericId,
        username,
        balance: 0,
      });
    }

    res.status(200).json({ message: "User registered or updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
