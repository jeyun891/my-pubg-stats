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
      const apiKey = process.env.NEXT_PUBLIC_PUBG_API_KEY;
      
      // 1. 플레이어 정보 조회
      const playerRes = await fetch(
        `https://api.pubg.com/shards/steam/players?filter[playerNames]=${nickname}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/vnd.api+json"
          }
        }
      );

      if (!playerRes.ok) throw new Error("플레이어를 찾을 수 없습니다. (대소문자 구분 확인)");
      const playerData = await playerRes.json();
      const accountId = playerData.data[0].id;

      // 2. 시즌 정보 및 전적 조회 (최신 시즌: division.bro.official.pc-2024-01 등)
      // 시즌 아이디가 맞지 않으면 0으로 나올 수 있으므로 주의가 필요합니다.
      const statsRes = await fetch(
        `https://api.pubg.com/shards/steam/players/${accountId}/seasons/division.bro.official.pc-2024-01`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/vnd.api+json"
          }
        }
      );

      const statsData = await statsRes.json();
      const squadStats = statsData.data.attributes.gameModeStats["squad-fpp"];

      // 데이터가 아예 없는 유저일 경우
      if (squadStats.roundsPlayed === 0) {
        throw new Error("이번 시즌 플레이 기록이 없는 유저입니다.");
      }

      setStats({
        kd: (squadStats.kills / (squadStats.losses || 1)).toFixed(2),
        wins: squadStats.wins,
        kills: squadStats.kills,
        damage: Math.floor(squadStats.damageDealt / (squadStats.roundsPlayed || 1)),
        top10: squadStats.top10s,
        matches: squadStats.roundsPlayed
      });

    } catch (err: any) {
      setError(err.message);
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
            placeholder="정확한 닉네임 입력 (Steam)..."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleSearch} style={styles.button} disabled={loading}>
            {loading ? "검색 중..." : "SEARCH"}
          </button>
        </div>

        {error && <p style={{color: '#ff4d4d', fontSize: '1.1rem', marginBottom: '20px'}}>{error}</p>}

        {stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statItem}><span style={styles.label}>K/D</span><p style={styles.value}>{stats.kd}</p></div>
            <div style={styles.statItem}><span style={styles.label}>WINS</span><p style={styles.value}>{stats.wins}</p></div>
            <div style={styles.statItem}><span style={styles.label}>KILLS</span><p style={styles.value}>{stats.kills}</p></div>
            <div style={styles.statItem}><span style={styles.label}>AVG DMG</span><p style={styles.value}>{stats.damage}</p></div>
            <div style={styles.statItem}><span style={styles.label}>TOP 10</span><p style={styles.value}>{stats.top10}</p></div>
            <div style={styles.statItem}><span style={styles.label}>MATCHES</span><p style={styles.value}>{stats.matches}</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: any = {
  container: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070') no-repeat center center/cover", position: "relative", color: "#fff", fontFamily: "sans-serif", overflow: "hidden" },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.9)" },
  content: { position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: "800px", padding: "20px" },
  title: { fontSize: "4rem", fontWeight: "900", letterSpacing: "5px", marginBottom: "40px", textShadow: "0 0 20px rgba(255, 77, 77, 0.4)" },
  red: { color: "#ff4d4d" },
  searchBox: { display: "flex", gap: "10px", marginBottom: "50px", background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px" },
  input: { flex: 1, padding: "18px", borderRadius: "8px", border: "1px solid #333", backgroundColor: "#000", color: "#fff", outline: "none", fontSize: "1.1rem" },
  button: { padding: "0 40px", borderRadius: "8px", border: "none", backgroundColor: "#ff4d4d", color: "#fff", fontWeight: "bold", cursor: "pointer", fontSize: "1.1rem" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" },
  statItem: { background: "rgba(20, 20, 20, 0.8)", padding: "25px", borderRadius: "10px", borderLeft: "4px solid #ff4d4d", textAlign: "center" },
  label: { fontSize: "0.75rem", color: "#888", display: "block", marginBottom: "8px", fontWeight: "bold" },
  value: { fontSize: "1.8rem", fontWeight: "900" }
};