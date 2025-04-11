

// rap-mining-next/pages/api/register.js
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  console.log("📡 Register API Called");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { user_id, username, referrer } = req.body;
    if (!user_id || !username) {
      return res.status(400).json({ error: "Missing user_id or username" });
    }

    const numericId = parseInt(user_id);
    if (isNaN(numericId)) {
      return res.status(400).json({ error: "Invalid user_id format" });
    }

    const client = await clientPromise;
    const db = client.db("rap_mining");
    const users = db.collection("users");

    const existingUser = await users.findOne({ user_id: numericId });

    if (existingUser) {
      // موجود → نحدث الاسم فقط
      await users.updateOne(
        { user_id: numericId },
        { $set: { username } }
      );
    } else {
      // جديد
      const newUser = {
        user_id: numericId,
        username,
        balance: 0,
        wallet: "",
        referrer: referrer ? parseInt(referrer) : null,
        invites: 0,
      };
      await users.insertOne(newUser);

      // إذا عنده referrer صحيح، نزود دعواته +1
      if (referrer && !isNaN(parseInt(referrer))) {
        await users.updateOne(
          { user_id: parseInt(referrer) },
          { $inc: { invites: 1 } }
        );
      }
    }

    return res.status(200).json({ message: "User registered or updated successfully" });
  } catch (err) {
    console.error("💥 Internal error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
