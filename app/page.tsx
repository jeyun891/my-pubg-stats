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
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/vnd.api+json"
      };

      // 1. 현재 활성화된 최신 시즌 아이디 자동 조회
      const seasonsRes = await fetch(`https://api.pubg.com/shards/steam/seasons`, { headers });
      const seasonsData = await seasonsRes.json();
      const currentSeason = seasonsData.data.find((s: any) => s.attributes.isCurrentSeason);
      
      if (!currentSeason) throw new Error("현재 시즌 정보를 불러올 수 없습니다.");
      const currentSeasonId = currentSeason.id;

      // 2. 플레이어 ID(account_id) 조회
      const playerRes = await fetch(
        `https://api.pubg.com/shards/steam/players?filter[playerNames]=${nickname}`,
        { headers }
      );

      if (!playerRes.ok) throw new Error("플레이어를 찾을 수 없습니다. (대소문자 구분 필수)");
      const playerData = await playerRes.json();
      const accountId = playerData.data[0].id;

      // 3. 최신 시즌 아이디를 사용하여 전적 조회
      const statsRes = await fetch(
        `https://api.pubg.com/shards/steam/players/${accountId}/seasons/${currentSeasonId}`,
        { headers }
      );

      const statsData = await statsRes.json();
      // 스쿼드(FPP 또는 일반) 데이터를 우선적으로 가져옵니다.
      const modeStats = statsData.data.attributes.gameModeStats["squad-fpp"] || statsData.data.attributes.gameModeStats["squad"];

      if (!modeStats || modeStats.roundsPlayed === 0) {
        throw new Error("이번 시즌에 해당 모드 플레이 기록이 없습니다.");
      }

      setStats({
        kd: (modeStats.kills / (modeStats.losses || 1)).toFixed(2),
        wins: modeStats.wins,
        kills: modeStats.kills,
        damage: Math.floor(modeStats.damageDealt / (modeStats.roundsPlayed || 1)),
        top10: modeStats.top10s,
        matches: modeStats.roundsPlayed
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
        <p style={styles.subtitle}>REAL-TIME BATTLEGROUNDS STATISTICS</p>
        
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="STEAM NICKNAME (대소문자 구분)..."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleSearch} style={styles.button} disabled={loading}>
            {loading ? "SEARCHING..." : "SEARCH"}
          </button>
        </div>

        {error && <p style={styles.errorText}>{error}</p>}

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
  title: { fontSize: "4rem", fontWeight: "900", letterSpacing: "5px", marginBottom: "10px", textShadow: "0 0 20px rgba(255, 77, 77, 0.4)" },
  red: { color: "#ff4d4d" },
  subtitle: { color: "#555", fontSize: "0.8rem", letterSpacing: "3px", marginBottom: "40px", fontWeight: "bold" },
  searchBox: { display: "flex", gap: "10px", marginBottom: "50px", background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px" },
  input: { flex: 1, padding: "18px", borderRadius: "8px", border: "1px solid #333", backgroundColor: "#000", color: "#fff", outline: "none", fontSize: "1.1rem" },
  button: { padding: "0 40px", borderRadius: "8px", border: "none", backgroundColor: "#ff4d4d", color: "#fff", fontWeight: "bold", cursor: "pointer", fontSize: "1.1rem" },
  errorText: { color: "#ff4d4d", marginBottom: "20px", fontSize: "1.1rem", fontWeight: "bold" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" },
  statItem: { background: "rgba(20, 20, 20, 0.8)", padding: "25px", borderRadius: "10px", borderLeft: "4px solid #ff4d4d", textAlign: "center" },
  label: { fontSize: "0.75rem", color: "#888", display: "block", marginBottom: "8px", fontWeight: "bold" },
  value: { fontSize: "1.8rem", fontWeight: "900" }
};