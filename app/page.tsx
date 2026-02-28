"use client";
import { useState } from "react";

export default function Home() {
  const [nickname, setNickname] = useState("");
  // TypeScript 에러를 피하기 위해 타입을 'any'로 유연하게 설정했습니다.
  const [stats, setStats] = useState<any>(null); 
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!nickname.trim()) return alert("닉네임을 입력하세요!");
    setLoading(true);

    // 1초 뒤에 결과가 나오는 시뮬레이션
    setTimeout(() => {
      setStats({
        kd: "2.85",
        wins: "120",
        kills: "850",
        top10: "320"
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>
      <div style={styles.content}>
        <h1 style={styles.title}>PHOENIX<span style={styles.red}>STATS</span></h1>
        <p style={styles.subtitle}>RISE FROM THE ASHES. CLAIM YOUR VICTORY.</p>

        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="PLAYER NICKNAME..."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleSearch} style={styles.button}>
            {loading ? "..." : "SEARCH"}
          </button>
        </div>

        {stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statItem}><h3>K/D</h3><p>{stats.kd}</p></div>
            <div style={styles.statItem}><h3>WINS</h3><p>{stats.wins}</p></div>
            <div style={styles.statItem}><h3>KILLS</h3><p>{stats.kills}</p></div>
            <div style={styles.statItem}><h3>TOP 10</h3><p>{stats.top10}</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

// 스타일 정의 (상업용으로 써도 손색없는 세련된 다크 레드 테마)
const styles: any = {
  container: {
    height: "100vh", display: "flex", justifyContent: "center", alignItems: "center",
    background: "url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070') no-repeat center center/cover",
    position: "relative", color: "#fff", fontFamily: "sans-serif", overflow: "hidden",
  },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.85)" },
  content: { position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: "600px", padding: "20px" },
  title: { fontSize: "3.5rem", fontWeight: "900", letterSpacing: "5px", marginBottom: "10px", textShadow: "0 0 20px rgba(255,0,0,0.5)" },
  red: { color: "#ff4d4d" },
  subtitle: { color: "#888", marginBottom: "40px", letterSpacing: "2px", fontSize: "0.9rem" },
  searchBox: { display: "flex", gap: "10px", marginBottom: "40px" },
  input: { flex: 1, padding: "15px", borderRadius: "5px", border: "1px solid #ff4d4d", backgroundColor: "#000", color: "#fff", outline: "none" },
  button: { padding: "15px 30px", borderRadius: "5px", border: "none", backgroundColor: "#ff4d4d", color: "#fff", fontWeight: "bold", cursor: "pointer" },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" },
  statItem: { background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "10px", borderLeft: "4px solid #ff4d4d", textAlign: "left" }
};