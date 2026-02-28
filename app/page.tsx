"use client";
import { useState } from "react";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [stats, setStats] = useState<any>(null); 
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!nickname.trim()) return alert("닉네임을 입력하세요!");
    setLoading(true);

    // 1.2초 뒤에 결과가 나오는 시뮬레이션 (자잘한 데이터 추가)
    setTimeout(() => {
      setStats({
        kd: "3.42",
        avgDamage: "452",
        winRate: "15.4%",
        top10: "42.8%",
        matches: "128",
        headshot: "24.5%"
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>
      <div style={styles.content}>
        <h1 style={styles.title}>PHOENIX<span style={styles.red}>STATS</span></h1>
        <p style={styles.subtitle}>VER 1.0 // TRACK YOUR VICTORY</p>

        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="ENTER PLAYER NICKNAME..."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={styles.input}
          />
          <button 
            onClick={handleSearch} 
            style={styles.button}
            onMouseOver={(e: any) => e.target.style.backgroundColor = "#ff1a1a"}
            onMouseOut={(e: any) => e.target.style.backgroundColor = "#ff4d4d"}
          >
            {loading ? "SEARCHING..." : "SEARCH"}
          </button>
        </div>

        {stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <span style={styles.label}>K/D RATIO</span>
              <p style={styles.value}>{stats.kd}</p>
            </div>
            <div style={styles.statItem}>
              <span style={styles.label}>AVG DAMAGE</span>
              <p style={styles.value}>{stats.avgDamage}</p>
            </div>
            <div style={styles.statItem}>
              <span style={styles.label}>WIN RATE</span>
              <p style={styles.value}>{stats.winRate}</p>
            </div>
            <div style={styles.statItem}>
              <span style={styles.label}>HEADSHOT</span>
              <p style={styles.value}>{stats.headshot}</p>
            </div>
            <div style={styles.statItem}>
              <span style={styles.label}>TOP 10 %</span>
              <p style={styles.value}>{stats.top10}</p>
            </div>
            <div style={styles.statItem}>
              <span style={styles.label}>TOTAL MATCHES</span>
              <p style={styles.value}>{stats.matches}</p>
            </div>
          </div>
        )}
      </div>
      <div style={styles.footer}>© 2026 PHOENIX STATS. NOT AFFILIATED WITH KRAFTON.</div>
    </div>
  );
}

const styles: any = {
  container: {
    height: "100vh", display: "flex", justifyContent: "center", alignItems: "center",
    background: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070') no-repeat center center/cover",
    position: "relative", color: "#fff", fontFamily: "'Inter', sans-serif", overflow: "hidden",
  },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(10, 5, 5, 0.9)" },
  content: { position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: "700px", padding: "20px" },
  title: { fontSize: "4rem", fontWeight: "900", letterSpacing: "-2px", marginBottom: "5px", textShadow: "0 0 30px rgba(255, 77, 77, 0.3)" },
  red: { color: "#ff4d4d" },
  subtitle: { color: "#555", marginBottom: "40px", fontSize: "0.8rem", fontWeight: "bold", letterSpacing: "3px" },
  searchBox: { display: "flex", gap: "10px", marginBottom: "50px", background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px" },
  input: { flex: 1, padding: "15px", borderRadius: "8px", border: "1px solid #333", backgroundColor: "transparent", color: "#fff", fontSize: "1rem", outline: "none" },
  button: { padding: "15px 35px", borderRadius: "8px", border: "none", backgroundColor: "#ff4d4d", color: "#fff", fontWeight: "900", cursor: "pointer", transition: "0.3s" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" },
  statItem: { background: "linear-gradient(145deg, #1a1a1a, #111)", padding: "20px", borderRadius: "12px", border: "1px solid #222", textAlign: "center" },
  label: { fontSize: "0.7rem", color: "#777", fontWeight: "bold", display: "block", marginBottom: "10px" },
  value: { fontSize: "1.8rem", fontWeight: "900", color: "#fff" },
  footer: { position: "absolute", bottom: "20px", color: "#444", fontSize: "0.7rem", zIndex: 1 }
};