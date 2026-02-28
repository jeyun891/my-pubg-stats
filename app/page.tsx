"use client";
import { useState } from "react";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!nickname) return alert("닉네임을 입력하세요!");
    setLoading(true);
    // 여기에 기존에 작성했던 API 호출 로직을 그대로 넣으시면 됩니다.
    // 임시로 로딩 효과만 보여주기 위해 작성되었습니다.
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={styles.container}>
      {/* 배경 오버레이 */}
      <div style={styles.overlay}></div>

      <div style={styles.content}>
        <h1 style={styles.title}>PUBG<span style={styles.gold}>.GG</span></h1>
        
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="PLAYER NICKNAME..."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleSearch} style={styles.button}>
            {loading ? "SEARCHING..." : "SEARCH"}
          </button>
        </div>

        {stats && (
          <div style={styles.resultCard}>
            <h2 style={styles.playerTitle}>{nickname} Stats</h2>
            {/* 전적 세부 정보 레이아웃 */}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop') no-repeat center center/cover",
    position: "relative",
    color: "#fff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  content: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    width: "100%",
    maxWidth: "500px",
    padding: "20px",
  },
  title: {
    fontSize: "4rem",
    fontWeight: "900",
    letterSpacing: "5px",
    marginBottom: "30px",
    textShadow: "2px 2px 10px rgba(0,0,0,0.5)",
  },
  gold: {
    color: "#F2A900", // 배그 황금색 포인트
  },
  searchBox: {
    display: "flex",
    gap: "10px",
    background: "rgba(255, 255, 255, 0.1)",
    padding: "15px",
    borderRadius: "15px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "#fff",
    fontSize: "1rem",
    outline: "none",
  },
  button: {
    padding: "12px 25px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#F2A900",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
};