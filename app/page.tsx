"use client";
import { useState } from "react";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!nickname.trim()) return alert("닉네임을 정확히 입력하세요!");
    setLoading(true);
    setError("");
    setStats(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_PUBG_API_KEY;
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/vnd.api+json"
      };

      // 1. 최신 시즌 ID 자동 조회
      const seasonsRes = await fetch(`https://api.pubg.com/shards/steam/seasons`, { headers });
      const seasonsData = await seasonsRes.json();
      const currentSeason = seasonsData.data.find((s: any) => s.attributes.isCurrentSeason);
      if (!currentSeason) throw new Error("시즌 정보를 가져올 수 없습니다.");
      const currentSeasonId = currentSeason.id;

      // 2. 플레이어 ID 조회 (대소문자 구분 필수)
      const playerRes = await fetch(
        `https://api.pubg.com/shards/steam/players?filter[playerNames]=${nickname}`,
        { headers }
      );
      if (!playerRes.ok) throw new Error("유저를 찾을 수 없습니다. (대소문자 확인)");
      const playerData = await playerRes.json();
      const accountId = playerData.data[0].id;

      // 3. 전적 데이터 조회
      const statsRes = await fetch(
        `https://api.pubg.com/shards/steam/players/${accountId}/seasons/${currentSeasonId}`,
        { headers }
      );
      const statsData = await statsRes.json();
      const allModes = statsData.data.attributes.gameModeStats;

      // 4. 모든 모드(솔로, 듀오, 스쿼드 / TPP, FPP) 데이터 통합 합산
      let totalKills = 0, totalWins = 0, totalDamage = 0, totalMatches = 0, totalLosses = 0, totalTop10s = 0;

      Object.keys(allModes).forEach(mode => {
        const m = allModes[mode];
        totalKills += m.kills;
        totalWins += m.wins;
        totalDamage += m.damageDealt;
        totalMatches += m.roundsPlayed;
        totalLosses += m.losses;
        totalTop10s += m.top10s;
      });

      if (totalMatches === 0) throw new Error("이번 시즌 플레이 기록이 전혀 없습니다.");

      setStats({
        kd: (totalKills / (totalLosses || 1)).toFixed(2),
        wins: totalWins,
        kills: totalKills,
        damage: Math.floor(totalDamage / totalMatches),
        top10: totalTop10s,
        matches: totalMatches
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
        <p style={styles.subtitle}>ALL MODES COMBINED // LIVE DATA</p>
        
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="STEAM NICKNAME..."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleSearch} style={styles.button} disabled={loading}>
            {loading ? "..." : "SEARCH"}
          </button>
        </div>

        {error && <p style={styles.errorText}>{error}</p>}

        {stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statItem}><span style={styles.label}>TOTAL K/D</span><p style={styles.value}>{stats.kd}</p></div>
            <div style={styles.statItem}><span style={styles.label}>TOTAL WINS</span><p style={styles.value}>{stats.wins}</p></div>
            <div style={styles.statItem}><span style={styles.label}>TOTAL KILLS</span><p style={styles.value}>{stats.kills}</p></div>
            <div style={styles.statItem}><span style={styles.label}>AVG DAMAGE</span><p style={styles.value}>{stats.damage}</p></div>
            <div style={styles.statItem}><span style={styles.label}>TOP 10</span><p style={styles.value}>{stats.top10}</p></div>
            <div style={styles.statItem}><span style={styles.label}>MATCHES</span><p style={styles.value}>{stats.matches}</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: any = {
  container: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070') no-repeat center center/cover", position: "relative", color: "#fff", fontFamily: "sans-serif" },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.9)" },
  content: { position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: "800px", padding: "20px" },
  title: { fontSize: "4rem", fontWeight: "900", letterSpacing: "5px", marginBottom: "10px", textShadow: "0 0 20px rgba(255, 77, 77, 0.4)" },
  red: { color: "#ff4d4d" },
  subtitle: { color: "#555", fontSize: "0.8rem", letterSpacing: "3px", marginBottom: "40px", fontWeight: "bold" },
  searchBox: { display: "flex", gap: "10px", marginBottom: "50px", background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px" },
  input: { flex: 1, padding: "18px", borderRadius: "8px", border: "1px solid #333", backgroundColor: "#000", color: "#fff", outline: "none", fontSize: "1.1rem" },
  button: { padding: "0 40px", borderRadius: "8px", border: "none", backgroundColor: "#ff4d4d", color: "#fff", fontWeight: "bold", cursor: "pointer", fontSize: "1.1rem" },
  errorText: { color: "#ff4d4d", marginBottom: "20px", fontWeight: "bold" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" },
  statItem: { background: "rgba(20, 20, 20, 0.8)", padding: "25px", borderRadius: "10px", borderLeft: "4px solid #ff4d4d", textAlign: "center" },
  label: { fontSize: "0.75rem", color: "#888", display: "block", marginBottom: "8px", fontWeight: "bold" },
  value: { fontSize: "1.8rem", fontWeight: "900" }
};