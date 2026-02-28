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

      // 1. 플레이어 및 최근 매치 ID 조회
      const playerRes = await fetch(`https://api.pubg.com/shards/steam/players?filter[playerNames]=${nickname}`, { headers });
      if (!playerRes.ok) throw new Error("유저를 찾을 수 없습니다.");
      const playerData = await playerRes.json();
      const accountId = playerData.data[0].id;
      const matchData = playerData.data[0].relationships.matches.data.slice(0, 10); // 성능상 최근 10개만 우선 처리

      // 2. 시즌 정보 자동 조회
      const seasonsRes = await fetch(`https://api.pubg.com/shards/steam/seasons`, { headers });
      const seasonsData = await seasonsRes.json();
      const currentSeasonId = seasonsData.data.find((s: any) => s.attributes.isCurrentSeason).id;

      // 3. 시즌 종합 스탯 (헤드샷 포함)
      const statsRes = await fetch(`https://api.pubg.com/shards/steam/players/${accountId}/seasons/${currentSeasonId}`, { headers });
      const statsData = await statsRes.json();
      const s = statsData.data.attributes.gameModeStats["squad-fpp"] || statsData.data.attributes.gameModeStats["squad"];

      if (s && s.roundsPlayed > 0) {
        setStats({
          kd: (s.kills / (s.losses || 1)).toFixed(2),
          headshot: ((s.headshotKills / (s.kills || 1)) * 100).toFixed(1) + "%",
          damage: Math.floor(s.damageDealt / s.roundsPlayed),
          matches: s.roundsPlayed,
          wins: s.wins
        });
      }

      // 4. 최근 매치 상세 정보 가져오기 (이 로직이 추가됨)
      const matchPromises = matchData.map(async (m: any) => {
        const res = await fetch(`https://api.pubg.com/shards/steam/matches/${m.id}`, { headers });
        const data = await res.json();
        // 내 데이터 찾기
        const myStat = data.included.find((i: any) => 
          i.type === "participant" && i.attributes.stats.playerId === accountId
        );
        return {
          id: m.id,
          map: data.data.attributes.mapName,
          mode: data.data.attributes.gameMode,
          kills: myStat?.attributes.stats.kills || 0,
          win: myStat?.attributes.stats.winPlace === 1 ? "WINNER" : `#${myStat?.attributes.stats.winPlace}`,
          date: new Date(data.data.attributes.createdAt).toLocaleDateString()
        };
      });

      const results = await Promise.all(matchPromises);
      setRecentMatches(results);

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
            <div style={styles.grid}>
              <div style={styles.card}><span>K/D</span><strong>{stats.kd}</strong></div>
              <div style={styles.card}><span>HEADSHOT</span><strong style={{color:'#ff4d4d'}}>{stats.headshot}</strong></div>
              <div style={styles.card}><span>AVG DMG</span><strong>{stats.damage}</strong></div>
              <div style={styles.card}><span>MATCHES</span><strong>{stats.matches}</strong></div>
            </div>

            <div style={styles.section}>
              <h2 style={styles.st}>RECENT MATCH DETAILS</h2>
              <div style={styles.list}>
                {recentMatches.map(m => (
                  <div key={m.id} style={{...styles.mi, borderLeft: m.win === "WINNER" ? "5px solid #ff4d4d" : "5px solid #333"}}>
                    <div>
                      <strong style={{fontSize:'1.1rem'}}>{m.win}</strong>
                      <div style={{fontSize:'0.8rem', color:'#555'}}>{m.map} | {m.mode}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontWeight:'bold'}}>{m.kills} KILLS</div>
                      <div style={{fontSize:'0.7rem', color:'#444'}}>{m.date}</div>
                    </div>
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
  container: { minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "sans-serif", padding: "50px 20px" },
  content: { maxWidth: "800px", margin: "0 auto" },
  title: { fontSize: "3rem", fontWeight: "900", textAlign: "center", marginBottom: "40px", letterSpacing: "5px" },
  red: { color: "#ff4d4d" },
  searchBox: { display: "flex", gap: "10px", background: "#111", padding: "10px", borderRadius: "12px", marginBottom: "40px", border: "1px solid #222" },
  input: { flex: 1, background: "none", border: "none", color: "#fff", outline: "none", fontSize: "1.1rem" },
  button: { background: "#ff4d4d", border: "none", color: "#fff", padding: "0 30px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  error: { color: "#ff4d4d", textAlign: "center", marginBottom: "20px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "30px" },
  card: { background: "#111", padding: "20px", borderRadius: "10px", textAlign: "center" },
  section: { background: "#111", padding: "20px", borderRadius: "12px" },
  st: { fontSize: "0.8rem", color: "#666", marginBottom: "20px", letterSpacing: "2px" },
  list: { display: "flex", flexDirection: "column", gap: "10px" },
  mi: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", background: "#000", borderRadius: "8px" }
};