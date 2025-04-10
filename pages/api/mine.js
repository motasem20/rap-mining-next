// pages/api/mine.js
import clientPromise from "../../lib/mongodb";


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "Missing user_id" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("rap_mining");
    const users = db.collection("users");

    const result = await users.updateOne(
      { user_id },
      { $inc: { balance: 10 } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "Mined 10 RAP successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
