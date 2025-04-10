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
    }).then(() => setBalance((prev) => prev + 10));
  };

  const handleAirdrop = () => {
    if (!user) return;
    fetch(`${API_BASE}/airdrop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id }),
    }).then(() => setBalance((prev) => prev + 100));
  };

  return (
    <div style={{ textAlign: "center", padding: "50px", fontFamily: "Arial" }}>
      <h1>{lang === "ar" ? "مرحبًا بك في منجم RAP" : "Welcome to RAP Mining"}</h1>
      {user && (
        <p>
          {lang === "ar" ? "المستخدم:" : "User:"} {user.first_name} @{user.username}
        </p>
      )}
      <p>
        {lang === "ar" ? "رصيدك الحالي:" : "Your Balance:"} {balance} RAP 🪙
      </p>
      <button
        onClick={handleMine}
        style={{ padding: "10px 20px", margin: "10px", fontWeight: "bold" }}
      >
        {lang === "ar" ? "تعدين" : "Mine"}
      </button>
      <button
        onClick={handleAirdrop}
        style={{
          padding: "10px 20px",
          backgroundColor: "gold",
          fontWeight: "bold",
        }}
      >
        {lang === "ar" ? "استلام Airdrop" : "Claim Airdrop"}
      </button>
    </div>
  );
}
