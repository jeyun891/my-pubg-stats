"use client";
import { useState } from "react";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!nickname.trim()) return alert("닉네임을 입력하세요!");
    
    setLoading(true);
    setError("");
    setStats(null);

    try {
      // 1. 플레이어 ID(account_id) 가져오기
      const playerRes = await fetch(
        `https://api.pubg.com/shards/steam/players?filter[playerNames]=${nickname}`,
        {
          headers: {
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_PUBG_API_KEY}`,
            "Accept": "application/vnd.api+json"
          }
        }
      );

      if (!playerRes.ok) throw new Error("플레이어를 찾을 수 없습니다.");
      const playerData = await playerRes.json();
      const accountId = playerData.data[0].id;

      // 2. 해당 플레이어의 시즌 전적 가져오기 (현재 시즌 기준)
      const statsRes = await fetch(
        `https://api.pubg.com/shards/steam/players/${accountId}/seasons/division.bro.official.pc-2024-01`, 
        {
          headers: {
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_PUBG_API_KEY}`,
            "Accept": "application/vnd.api+json"
          }
        }
      );

      const statsData = await statsRes.json();
      const s = statsData.data.attributes.gameModeStats["squad-fpp"]; // 스쿼드 FPP 기준 예시

      setStats({
        kd: (s.kills / (s.losses || 1)).toFixed(2),
        wins: s.wins,
        kills: s.kills,
        top10s: s.top10s,
        damage: Math.floor(s.damageDealt / (s.roundsPlayed || 1)),
        matches: s.roundsPlayed
      });
    } catch (err: any) {
      setError(err.message || "에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>
      <div style={styles.content}>
        <h1 style={styles.title}>PHOENIX<span style={styles.red}>STATS</span></h1>
        
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="STEAM NICKNAME..."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleSearch} style={styles.button} disabled={loading}>
            {loading ? "SEARCHING..." : "SEARCH"}
          </button>
        </div>

        {error && <p style={{color: '#ff4d4d', marginBottom: '20px'}}>{error}</p>}

        {stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statItem}><span style={styles.label}>K/D</span><p style={styles.value}>{stats.kd}</p></div>
            <div style={styles.statItem}><span style={styles.label}>WINS</span><p style={styles.value}>{stats.wins}</p></div>
            <div style={styles.statItem}><span style={styles.label}>KILLS</span><p style={styles.value}>{stats.kills}</p></div>
            <div style={styles.statItem}><span style={styles.label}>AVG DMG</span><p style={styles.value}>{stats.damage}</p></div>
            <div style={styles.statItem}><span style={styles.label}>TOP 10</span><p style={styles.value}>{stats.top10s}</p></div>
            <div style={styles.statItem}><span style={styles.label}>MATCHES</span><p style={styles.value}>{stats.matches}</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: any = {
  container: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070') no-repeat center center/cover", position: "relative", color: "#fff", fontFamily: "sans-serif", overflow: "hidden" },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.85)" },
  content: { position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: "700px", padding: "20px" },
  title: { fontSize: "3.5rem", fontWeight: "900", letterSpacing: "5px", marginBottom: "40px" },
  red: { color: "#ff4d4d" },
  searchBox: { display: "flex", gap: "10px", marginBottom: "50px", background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px" },
  input: { flex: 1, padding: "15px", borderRadius: "8px", border: "1px solid #333", backgroundColor: "#000", color: "#fff", outline: "none" },
  button: { padding: "15px 35px", borderRadius: "8px", border: "none", backgroundColor: "#ff4d4d", color: "#fff", fontWeight: "bold", cursor: "pointer" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" },
  statItem: { background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "10px", borderLeft: "4px solid #ff4d4d", textAlign: "center" },
  label: { fontSize: "0.7rem", color: "#888", display: "block", marginBottom: "5px" },
  value: { fontSize: "1.5rem", fontWeight: "900" }
};