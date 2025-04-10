import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  console.log("📡 BALANCE API CALLED");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user_id } = req.query;

  console.log("🔍 USER ID:", user_id);

  if (!user_id) {
    return res.status(400).json({ error: "Missing user_id" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("rap_mining");
    const users = db.collection("users");

    const user = await users.findOne({ user_id: parseInt(user_id) });

    console.log("📦 USER DATA:", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ balance: user.balance || 0 });
  } catch (err) {
    console.error("💥 ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
