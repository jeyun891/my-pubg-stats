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
      const headers = { Authorization: `Bearer ${apiKey}`, Accept: "application/vnd.api+json" };

      // 1. 플레이어 및 최근 20경기 매치 ID 조회
      const playerRes = await fetch(`https://api.pubg.com/shards/steam/players?filter[playerNames]=${nickname}`, { headers });
      if (!playerRes.ok) throw new Error("유저를 찾을 수 없습니다.");
      const playerData = await playerRes.json();
      const accountId = playerData.data[0].id;
      const matchIds = playerData.data[0].relationships.matches.data.slice(0, 20); // 최근 20개

      // 2. 최신 시즌 정보 조회
      const seasonsRes = await fetch(`https://api.pubg.com/shards/steam/seasons`, { headers });
      const seasonsData = await seasonsRes.json();
      const currentSeasonId = seasonsData.data.find((s: any) => s.attributes.isCurrentSeason).id;

      // 3. 시즌 종합 전적 (헤드샷 포함)
      const statsRes = await fetch(`https://api.pubg.com/shards/steam/players/${accountId}/seasons/${currentSeasonId}`, { headers });
      const statsData = await statsRes.json();
      const s = statsData.data.attributes.gameModeStats["squad-fpp"] || statsData.data.attributes.gameModeStats["squad"];

      if (!s || s.roundsPlayed === 0) throw new Error("이번 시즌 기록이 없습니다.");

      setStats({
        kd: (s.kills / (s.losses || 1)).toFixed(2),
        wins: s.wins,
        damage: Math.floor(s.damageDealt / s.roundsPlayed),
        headshot: ((s.headshotKills / (s.kills || 1)) * 100).toFixed(1) + "%", // 헤드샷 비율
        matches: s.roundsPlayed,
        top10: ((s.top10s / s.roundsPlayed) * 100).toFixed(1) + "%"
      });

      // 4. 최근 매치 목록 셋팅 (간이 리스트)
      setRecentMatches(matchIds.map((m: any, index: number) => ({
        id: m.id,
        title: `MATCH #${index + 1}`,
        date: new Date().toLocaleDateString() // 실제 날짜는 매치 상세조회 필요
      })));

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
          <input type="text" placeholder="STEAM NICKNAME..." value={nickname} onChange={(e) => setNickname(e.target.value)} style={styles.input} />
          <button onClick={handleSearch} style={styles.button}>{loading ? "..." : "SEARCH"}</button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {stats && (
          <div style={styles.dashboard}>
            {/* 상단 요약 카드 (헤드샷 추가) */}
            <div style={styles.grid}>
              <div style={styles.card}><span>K/D</span><strong>{stats.kd}</strong></div>
              <div style={styles.card}><span>HEADSHOT</span><strong style={{color: '#ff4d4d'}}>{stats.headshot}</strong></div>
              <div style={styles.card}><span>WIN RATE</span><strong>{stats.top10}</strong></div>
              <div style={styles.card}><span>AVG DMG</span><strong>{stats.damage}</strong></div>
              <div style={styles.card}><span>WINS</span><strong>{stats.wins}</strong></div>
              <div style={styles.card}><span>MATCHES</span><strong>{stats.matches}</strong></div>
            </div>

            {/* 최근 20경기 기록 섹션 */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>RECENT 20 MATCHES</h2>
              <div style={styles.matchList}>
                {recentMatches.map((m) => (
                  <div key={m.id} style={styles.matchItem}>
                    <span>{m.title}</span>
                    <span style={styles.matchId}>{m.id}</span>
                    <button style={styles.viewBtn}>VIEW DETAILS</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: any = {
  container: { minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "sans-serif", padding: "60px 20px" },
  content: { maxWidth: "900px", margin: "0 auto" },
  title: { fontSize: "3.5rem", fontWeight: "900", textAlign: "center", marginBottom: "40px", letterSpacing: "5px" },
  red: { color: "#ff4d4d" },
  searchBox: { display: "flex", gap: "10px", background: "#151515", padding: "10px", borderRadius: "12px", marginBottom: "50px" },
  input: { flex: 1, background: "none", border: "none", color: "#fff", padding: "10px", fontSize: "1.1rem", outline: "none" },
  button: { background: "#ff4d4d", border: "none", color: "#fff", padding: "0 40px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  error: { color: "#ff4d4d", textAlign: "center", marginBottom: "20px", fontWeight: "bold" },
  dashboard: { display: "flex", flexDirection: "column", gap: "30px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" },
  card: { background: "#151515", padding: "25px", borderRadius: "12px", textAlign: "center", border: "1px solid #222" },
  section: { background: "#151515", padding: "25px", borderRadius: "12px", border: "1px solid #222" },
  sectionTitle: { fontSize: "1rem", color: "#666", marginBottom: "20px", letterSpacing: "2px" },
  matchList: { display: "flex", flexDirection: "column", gap: "10px" },
  matchItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", background: "#050505", borderRadius: "8px", border: "1px solid #1a1a1a" },
  matchId: { fontSize: "0.7rem", color: "#444" },
  viewBtn: { background: "#222", border: "none", color: "#888", padding: "5px 15px", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer" }
};