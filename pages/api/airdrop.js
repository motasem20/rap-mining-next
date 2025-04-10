// pages/api/airdrop.js
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user_id } = req.body;
  const numericId = parseInt(user_id);

  if (!numericId) {
    return res.status(400).json({ error: "Missing or invalid user_id" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("rap_mining");
    const users = db.collection("users");

    const result = await users.updateOne(
      { user_id: numericId },
      { $inc: { balance: 100 } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "Airdrop claimed successfully" });
  } catch (err) {
    console.error("💥 ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
