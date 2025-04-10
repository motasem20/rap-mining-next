import { useEffect, useState } from "react";

const API_BASE = "/api";

export default function Home() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState("en");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.expand();
      const initData = tg.initDataUnsafe;
      const userData = initData.user;
      setUser(userData);
      setLang(userData.language_code || "en");

      // Register user
      fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userData.id,
          username: userData.username,
        }),
      });

      // Get balance
      fetch(`${API_BASE}/balance?user_id=${userData.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.balance !== undefined) {
            setBalance(data.balance);
          }
        });
    }
  }, []);

  const handleMine = () => {
    if (!user) return;
    fetch(`${API_BASE}/mine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id }),
    }).then(() => {
      setBalance((prev) => prev + 10);
    });
  };

  const handleAirdrop = () => {
    if (!user) return;
    fetch(`${API_BASE}/airdrop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id }),
    }).then(() => {
      setBalance((prev) => prev + 100);
    });
  };

  return (
    <div
      style={{
        background: "#111",
        color: "#fff",
        minHeight: "100vh",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", color: "#FFD700" }}>
        {lang === "ar" ? "منجم RAP" : "RAP Mining"}
      </h1>

      {user && (
        <p style={{ fontSize: "1.2rem", marginBottom: "10px" }}>
          👤 {user.first_name} @{user.username}
        </p>
      )}

      <p style={{ fontSize: "1.5rem", margin: "20px 0" }}>
        {lang === "ar" ? "رصيدك الحالي:" : "Your Balance:"}{" "}
        <strong style={{ color: "#00FFAB" }}>{balance} RAP 🪙</strong>
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        <button
          onClick={handleMine}
          style={{
            background: "#333",
            color: "#fff",
            border: "2px solid #FFD700",
            padding: "10px 20px",
            fontSize: "1rem",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          {lang === "ar" ? "تعدين" : "Mine"}
        </button>
        <button
          onClick={handleAirdrop}
          style={{
            background: "#FFD700",
            color: "#111",
            fontWeight: "bold",
            padding: "10px 20px",
            fontSize: "1rem",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          {lang === "ar" ? "استلام Airdrop" : "Claim Airdrop"}
        </button>
      </div>
    </div>
  );
}
