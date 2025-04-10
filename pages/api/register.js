// pages/api/register.js
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  console.log("📡 Register API Called");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { user_id, username } = req.body;

    if (!user_id || !username) {
      console.log("❌ Missing data:", req.body);
      return res.status(400).json({ error: "Missing user_id or username" });
    }

    const numericId = parseInt(user_id);
    if (isNaN(numericId)) {
      console.log("❌ Invalid user_id:", user_id);
      return res.status(400).json({ error: "Invalid user_id format" });
    }

    const client = await clientPromise;
    const db = client.db("rap_mining");
    const users = db.collection("users");

    const existingUser = await users.findOne({ user_id: numericId });

    if (existingUser) {
      await users.updateOne(
        { user_id: numericId },
        { $set: { username } }
      );
      console.log("✅ Updated existing user:", numericId);
    } else {
      await users.insertOne({
        user_id: numericId,
        username,
        balance: 0,
      });
      console.log("✅ New user registered:", numericId);
    }

    return res.status(200).json({ message: "User registered or updated successfully" });
  } catch (err) {
    console.error("💥 Internal error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
