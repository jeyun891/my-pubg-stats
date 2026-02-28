"use client";
import { useState } from "react";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!nickname.trim()) return alert("닉네임을 입력하세요!");
    setLoading(true);
    setError("");
    setStats(null);
    setRecentMatches([]);

    try {
      const apiKey = process.env.NEXT_PUBLIC_PUBG_API_KEY;
      const headers = { 
        Authorization: `Bearer ${apiKey}`, 
        Accept: "application/vnd.api+json" 
      };

      // 1. 현재 활성화된 최신 시즌 ID 자동으로 가져오기 (이게 핵심!)
      const seasonsRes = await fetch(`https://api.pubg.com/shards/steam/seasons`, { headers });
      const seasonsData = await seasonsRes.json();
      const currentSeason = seasonsData.data.find((s: any) => s.attributes.isCurrentSeason);
      if (!currentSeason) throw new Error("최신 시즌 정보를 불러올 수 없습니다.");
      const currentSeasonId = currentSeason.id;

      // 2. 플레이어 정보 및 최근 매치 ID 조회
      const playerRes = await fetch(`https://api.pubg.com/shards/steam/players?filter[playerNames]=${nickname}`, { headers });
      if (!playerRes.ok) throw new Error("유저를 찾을 수 없습니다. (대소문자 정확히 입력!)");
      const playerData = await playerRes.json();
      const accountId = playerData.data[0].id;
      const matchIds = playerData.data[0].relationships.matches.data.slice(0, 20);

      // 3. 최신 시즌 전적 조회 (모든 모드 합산)
      const statsRes = await fetch(`https://api.pubg.com/shards/steam/players/${accountId}/seasons/${currentSeasonId}`, { headers });
      const statsData = await statsRes.json();
      const allModes = statsData.data.attributes.gameModeStats;

      let tKills = 0, tWins = 0, tDamage = 0, tMatches = 0, tLosses = 0, tHeadshots = 0;
      
      // 모든 게임 모드(솔로, 듀오, 스쿼드 등)의 데이터를 하나로 합칩니다.
      Object.keys(allModes).forEach(mode => {
        const m = allModes[mode];
        tKills += m.kills;
        tWins += m.wins;
        tDamage += m.damageDealt;
        tMatches += m.roundsPlayed;
        tLosses += m.losses;
        tHeadshots += m.headshotKills;
      });

      if (tMatches === 0) throw new Error("이 유저는 이번 시즌에 플레이한 기록이 아예 없습니다.");

      setStats({
        kd: (tKills / (tLosses || 1)).toFixed(2),
        headshot: ((tHeadshots / (tKills || 1)) * 100).toFixed(1) + "%",
        wins: tWins,
        damage: Math.floor(tDamage / tMatches),
        matches: tMatches,
        top10: ((tWins / tMatches) * 100).toFixed(1) + "%"
      });

      setRecentMatches(matchIds.map((m: any, i: number) => ({ id: m.id, title: `MATCH #${i + 1}` })));

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>PHOENIX<span style={styles.red}>STATS</span></h1>
        <div style={styles.searchBox}>
          <input type="text" placeholder="STEAM NICKNAME (대소문자 구분)..." value={nickname} onChange={(e) => setNickname(e.target.value)} style={styles.input} />
          <button onClick={handleSearch} style={styles.button} disabled={loading}>{loading ? "..." : "SEARCH"}</button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
        {stats && (
          <div style={styles.dashboard}>
            <div style={styles.grid}>
              <div style={styles.card}><span>K/D</span><strong>{stats.kd}</strong></div>
              <div style={styles.card}><span>HEADSHOT</span><strong style={{color:'#ff4d4d'}}>{stats.headshot}</strong></div>
              <div style={styles.card}><span>AVG DMG</span><strong>{stats.damage}</strong></div>
              <div style={styles.card}><span>MATCHES</span><strong>{stats.matches}</strong></div>
            </div>
            <div style={styles.section}>
              <h2 style={styles.st}>RECENT 20 MATCHES</h2>
              {recentMatches.map(m => (
                <div key={m.id} style={styles.mi}><span>{m.title}</span><small style={{color:'#444'}}>{m.id}</small></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: any = {
  container: { minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "sans-serif", padding: "50px 20px" },
  content: { maxWidth: "800px", margin: "0 auto" },
  title: { fontSize: "3rem", fontWeight: "900", textAlign: "center", marginBottom: "40px", letterSpacing: "5px" },
  red: { color: "#ff4d4d" },
  searchBox: { display: "flex", gap: "10px", background: "#111", padding: "10px", borderRadius: "12px", marginBottom: "40px" },
  input: { flex: 1, background: "none", border: "none", color: "#fff", outline: "none", fontSize: "1.1rem" },
  button: { background: "#ff4d4d", border: "none", color: "#fff", padding: "0 30px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  error: { color: "#ff4d4d", textAlign: "center", marginBottom: "20px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "30px" },
  card: { background: "#111", padding: "20px", borderRadius: "10px", textAlign: "center", border: "1px solid #222" },
  section: { background: "#111", padding: "20px", borderRadius: "12px" },
  st: { fontSize: "0.8rem", color: "#666", marginBottom: "15px" },
  mi: { display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid #1a1a1a", fontSize: "0.9rem" }
};