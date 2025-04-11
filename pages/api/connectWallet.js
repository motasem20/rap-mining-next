// rap-mining-next/pages/api/connectWallet.js
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user_id, walletAddress } = req.body;
  const numericId = parseInt(user_id);

  if (!numericId || !walletAddress) {
    return res.status(400).json({ error: "Missing user_id or walletAddress" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("rap_mining");
    const users = db.collection("users");

    const result = await users.updateOne(
      { user_id: numericId },
      { $set: { wallet: walletAddress } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ message: "Wallet connected successfully" });
  } catch (err) {
    console.error("💥 ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
