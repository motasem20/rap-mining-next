import { useEffect, useState } from "react";

const API_BASE = "/api";

// دالة بسيطة تحسب الرتبة بناءً على الرصيد
function getRank(balance) {
  if (balance < 50) return "Newbie";
  if (balance < 300) return "Bronze";
  if (balance < 1000) return "Silver";
  if (balance < 2000) return "Gold";
  return "Platinum";
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState("en");
  const [balance, setBalance] = useState(0);
  const [wallet, setWallet] = useState("");
  const [invites, setInvites] = useState(0);
  const [showProfile, setShowProfile] = useState(false);

  const [referrer, setReferrer] = useState(null);

  // جلب الرصيد
  const fetchBalance = (userId) => {
    fetch(`${API_BASE}/balance?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.balance !== undefined) {
          setBalance(data.balance);
        }
      })
      .catch((err) => console.error(err));
  };

  // جلب بيانات المستخدم (wallet, invites) من الـAPI
  const fetchUserData = (userId) => {
    fetch(`${API_BASE}/getUser?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setInvites(data.user.invites || 0);
          setWallet(data.user.wallet || "");
        }
      })
      .catch((err) => console.error(err));
  };

  // تسجيل المستخدم أول مرة
  const registerUser = (userData, refParam) => {
    fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userData.id,
        username: userData.username,
        referrer: refParam
      }),
    })
    .then(() => {
      fetchBalance(userData.id);
      fetchUserData(userData.id);
    });
  };

  useEffect(() => {
    // لو فيه رابط إحالة ?ref=123456
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get("ref");
    if (refParam) setReferrer(refParam);

    // هنا نحاول نقرأ سياق Telegram
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.expand();
      const initData = tg.initDataUnsafe;
      const userData = initData.user;
      if (!userData) {
        console.log("❌ لا يوجد userData من Telegram");
        return;
      }
      setUser(userData);
      setLang(userData.language_code || "en");
      registerUser(userData, refParam);
    } else {
      console.warn("❗ أنت غالبًا تفتح الصفحة من المتصفح العادي وليس من Telegram WebApp");
      // وضع اختبار للمحلي (اختياري): يمكنك إضافة userId وهمي لتجاربك
      /*
      const fakeUser = { id: 123456789, username: "local_test", language_code: "en" };
      setUser(fakeUser);
      registerUser(fakeUser, refParam);
      */
    }
  }, []);

  const handleMine = () => {
    if (!user) {
      alert("No Telegram user found!");
      return;
    }
    fetch(`${API_BASE}/mine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id }),
    })
    .then(() => {
      fetchBalance(user.id);
    });
  };

  const handleAirdrop = () => {
    if (!user) {
      alert("No Telegram user found!");
      return;
    }
    fetch(`${API_BASE}/airdrop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id }),
    })
    .then(() => {
      fetchBalance(user.id);
    });
  };

  const handleConnectWallet = () => {
    if (!user || !wallet) {
      alert("No user or no wallet input!");
      return;
    }
    fetch(`${API_BASE}/connectWallet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, walletAddress: wallet }),
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Wallet connected!");
    })
    .catch(err => console.error(err));
  };

  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  const rank = getRank(balance);

  return (
    <div
      style={{
        background: "#111",
        color: "#fff",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        position: "relative"
      }}
    >
      <h1 style={{ fontSize: "2.5rem", color: "#FFD700", margin: "10px 0" }}>
        {lang === "ar" ? "منجم RAP" : "RAP Mining"}
      </h1>

      {user && (
        <p style={{ fontSize: "1.2rem" }}>
          👤 {user.first_name} @{user.username}
        </p>
      )}

      <div style={{ marginTop: "10px" }}>
        <p style={{ fontSize: "1.1rem", margin: "5px 0" }}>
          {lang === "ar" ? "رصيدك:" : "Balance:"}{" "}
          <strong style={{ color: "#00FFAB", fontSize: "1.2rem" }}>{balance} RAP 🪙</strong>
        </p>
        <p style={{ fontSize: "1.1rem", margin: "5px 0", color: "#ccc" }}>
          {lang === "ar" ? "رتبتك:" : "Rank:"} <strong>{rank}</strong>
        </p>
        <p style={{ fontSize: "1.1rem", margin: "5px 0", color: "#ccc" }}>
          {lang === "ar" ? "الدعوات:" : "Invites:"} <strong>{invites}</strong>
        </p>
      </div>

      {/* زر التعدين بصورة (غوريلا من GitHub) */}
      <div
        onClick={handleMine}
        style={{
          cursor: "pointer",
          margin: "20px auto",
          width: "150px",
          height: "150px",
          border: "3px solid #FFD700",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#333"
        }}
      >
        <img
          src="https://github.com/motasem20/rap-mining-next/blob/main/APE.png?raw=true"
          alt="Mine Coin"
          style={{ width: "100px", height: "100px" }}
        />
      </div>
      <p style={{ marginBottom: "30px", color: "#fff" }}>
        {lang === "ar" ? "اضغط على الصورة لتعدين 10 عملة" : "Tap the image to Mine +10 RAP"}
      </p>

      {/* سطر الأزرار أسفل الصفحة */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "0",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: "20px"
        }}
      >
        {/* زر Airdrop */}
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

        {/* حقل المحفظة + زر Wallet */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <input
            type="text"
            placeholder={lang === "ar" ? "محفظتك" : "Your Wallet"}
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            style={{
              width: "130px",
              padding: "5px",
              borderRadius: "5px",
              border: "1px solid #ccc"
            }}
          />
          <button
            onClick={handleConnectWallet}
            style={{
              background: "#555",
              color: "#fff",
              padding: "8px 15px",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            {lang === "ar" ? "محفظة" : "Wallet"}
          </button>
        </div>

        {/* زر الملف الشخصي */}
        <button
          onClick={toggleProfile}
          style={{
            background: "#333",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "12px",
            cursor: "pointer",
            border: "2px solid #FFD700"
          }}
        >
          {lang === "ar" ? "الملف الشخصي" : "Profile"}
        </button>
      </div>

      {/* نافذة الملف الشخصي */}
      {showProfile && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            right: "10px",
            background: "#222",
            padding: "20px",
            borderRadius: "12px",
            border: "2px solid #FFD700"
          }}
        >
          <h3 style={{ margin: "0 0 10px", color: "#FFD700" }}>
            {lang === "ar" ? "ملفك الشخصي" : "Your Profile"}
          </h3>
          {user && (
            <>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Username:</strong> {user.username}</p>
            </>
          )}
          <p><strong>Balance:</strong> {balance} RAP</p>
          <p><strong>Rank:</strong> {rank}</p>
          <p><strong>Invites:</strong> {invites}</p>
          <p><strong>Wallet:</strong> {wallet || "Not connected"}</p>
          <button
            onClick={toggleProfile}
            style={{
              marginTop: "10px",
              background: "#FFD700",
              color: "#111",
              fontWeight: "bold",
              padding: "5px 15px",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            {lang === "ar" ? "إغلاق" : "Close"}
          </button>
        </div>
      )}

      {/* رابط الإحالة في أعلى اليمين */}
      {user && (
        <div style={{ position: "absolute", top: "10px", right: "10px", textAlign: "right" }}>
          <p style={{ color: "#FFD700", fontSize: "0.9rem", margin: 0 }}>
            {lang === "ar" ? "رابط إحالتك:" : "Referral Link:"}
          </p>
          <p style={{ fontSize: "0.7rem", margin: "2px 0 0", color: "#ddd" }}>
            {`${window.location.origin}?ref=${user.id}`}
          </p>
        </div>
      )}
    </div>
  );
}
