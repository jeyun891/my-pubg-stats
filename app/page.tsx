"use client";
import { useState } from "react";

interface PlayerStats {
  kd: string;
  headshot: string;
  damage: number;
  matches: number;
  winRate: string;
  avgKills: string;
  avgSurvival: string;
}

interface MatchItem {
  id: string;
  map: string;
  kills: number;
  headshots: number;
  headshotRate: string;
  assists: number;
  revives: number;
  damage: number;
  longestKill: number;
  distance: number;
  place: number | string;
  weapons: string[];
  date: string;
}

const MAP_NAMES: Record<string, string> = {
  Baltic_Main: "Erangel",
  Desert_Main: "Miramar",
  Savage_Main: "Sanhok",
  DihorOtok_Main: "Vikendi",
  Tiger_Main: "Taego",
};

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [recentMatches, setRecentMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const headers = {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_PUBG_API_KEY}`,
    Accept: "application/vnd.api+json",
  };

  const handleSearch = async () => {
    if (!nickname.trim()) return alert("닉네임을 입력하세요!");

    setLoading(true);
    setError("");
    setStats(null);
    setRecentMatches([]);

    try {
      // 1. 플레이어 조회
      const playerRes = await fetch(
        `https://api.pubg.com/shards/steam/players?filter[playerNames]=${nickname}`,
        { headers }
      );
      if (!playerRes.ok) throw new Error("유저를 찾을 수 없습니다.");

      const playerData = await playerRes.json();
      const accountId = playerData.data[0].id;
      const matchData = playerData.data[0].relationships.matches.data.slice(0, 5);

      // 2. 현재 시즌
      const seasonsRes = await fetch(
        `https://api.pubg.com/shards/steam/seasons`,
        { headers }
      );
      const seasonsData = await seasonsRes.json();
      const currentSeasonId = seasonsData.data.find(
        (s: any) => s.attributes.isCurrentSeason
      ).id;

      // 3. 시즌 통계
      const statsRes = await fetch(
        `https://api.pubg.com/shards/steam/players/${accountId}/seasons/${currentSeasonId}`,
        { headers }
      );
      const statsData = await statsRes.json();
      const allModes = statsData.data.attributes.gameModeStats;

      let tKills = 0,
        tWins = 0,
        tDamage = 0,
        tMatches = 0,
        tDeaths = 0,
        tHeadshots = 0,
        tSurvival = 0;

      Object.values(allModes).forEach((m: any) => {
        tKills += m.kills;
        tWins += m.wins;
        tDamage += m.damageDealt;
        tMatches += m.roundsPlayed;
        tDeaths += m.losses;
        tHeadshots += m.headshotKills;
        tSurvival += m.timeSurvived;
      });

      if (tMatches > 0) {
        setStats({
          kd: (tKills / (tDeaths || 1)).toFixed(2),
          headshot: ((tHeadshots / (tKills || 1)) * 100).toFixed(1) + "%",
          damage: Math.floor(tDamage / tMatches),
          matches: tMatches,
          winRate: ((tWins / tMatches) * 100).toFixed(1) + "%",
          avgKills: (tKills / tMatches).toFixed(2),
          avgSurvival: Math.floor(tSurvival / tMatches / 60) + "m",
        });
      }

      // 4. 매치 상세 + 무기
      const matchResults = await Promise.all(
        matchData.map(async (m: any) => {
          try {
            const res = await fetch(
              `https://api.pubg.com/shards/steam/matches/${m.id}`,
              { headers }
            );
            const data = await res.json();

            const participant = data.included?.find(
              (i: any) =>
                i.type === "participant" &&
                i.attributes.stats.playerId === accountId
            );

            const stats = participant?.attributes.stats;

            // Telemetry URL
            const asset = data.included.find((i: any) => i.type === "asset");
            const telemetryUrl = asset?.attributes?.URL;

            let weapons: string[] = [];

            if (telemetryUrl) {
              const telemetryRes = await fetch(telemetryUrl);
              const telemetryData = await telemetryRes.json();

              const kills = telemetryData.filter(
                (e: any) =>
                  e._T === "LogPlayerKill" &&
                  e.killer?.accountId === accountId
              );

              weapons = kills.map((k: any) => k.damageCauserName);
            }

            const totalDistance =
              (stats?.walkDistance || 0) +
              (stats?.rideDistance || 0) +
              (stats?.swimDistance || 0);

            return {
              id: m.id,
              map:
                MAP_NAMES[data.data.attributes.mapName] ||
                data.data.attributes.mapName,
              kills: stats?.kills || 0,
              headshots: stats?.headshotKills || 0,
              headshotRate:
                stats?.kills > 0
                  ? ((stats.headshotKills / stats.kills) * 100).toFixed(1) + "%"
                  : "0%",
              assists: stats?.assists || 0,
              revives: stats?.revives || 0,
              damage: Math.floor(stats?.damageDealt || 0),
              longestKill: Math.floor(stats?.longestKill || 0),
              distance: Math.floor(totalDistance / 1000),
              place: stats?.winPlace || "-",
              weapons: [...new Set(weapons)],
              date: new Date(
                data.data.attributes.createdAt
              ).toLocaleDateString(),
            };
          } catch {
            return null;
          }
        })
      );

      setRecentMatches(matchResults.filter(Boolean) as MatchItem[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>
          PHOENIX<span style={styles.red}>STATS</span>
        </h1>

        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="STEAM NICKNAME..."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleSearch} style={styles.button}>
            {loading ? "..." : "SEARCH"}
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {stats && (
          <div style={styles.dashboard}>
            <div style={styles.grid}>
              <div style={styles.card}><span>K/D</span><strong>{stats.kd}</strong></div>
              <div style={styles.card}><span>WIN RATE</span><strong>{stats.winRate}</strong></div>
              <div style={styles.card}><span>AVG KILLS</span><strong>{stats.avgKills}</strong></div>
              <div style={styles.card}><span>HEADSHOT</span><strong>{stats.headshot}</strong></div>
              <div style={styles.card}><span>AVG DMG</span><strong>{stats.damage}</strong></div>
              <div style={styles.card}><span>SURVIVAL</span><strong>{stats.avgSurvival}</strong></div>
            </div>

            <div style={styles.section}>
              <h2 style={styles.st}>RECENT MATCH DETAILS</h2>

              {recentMatches.map((m) => (
                <div key={m.id} style={{ ...styles.mi }}>
                  <div>
                    <strong>
                      {m.place === 1 ? "WINNER" : `#${m.place}`}
                    </strong>
                    <div style={{ fontSize: "0.8rem", color: "#777" }}>
                      {m.map}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#555" }}>
                      {m.weapons.join(" / ")}
                    </div>
                  </div>

                  <div style={{ textAlign: "right", fontSize: "0.8rem" }}>
                    <div>{m.kills}K ({m.headshots} HS / {m.headshotRate})</div>
                    <div>DMG {m.damage}</div>
                    <div>AST {m.assists} / REV {m.revives}</div>
                    <div>LONG {m.longestKill}m</div>
                    <div>DIST {m.distance}km</div>
                    <div style={{ fontSize: "0.7rem", color: "#444" }}>
                      {m.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: any = {
  container: { minHeight: "100vh", background: "#050505", color: "#fff", padding: "50px 20px" },
  content: { maxWidth: "900px", margin: "0 auto" },
  title: { fontSize: "3rem", fontWeight: "900", textAlign: "center", marginBottom: "40px", letterSpacing: "5px" },
  red: { color: "#ff4d4d" },
  searchBox: { display: "flex", gap: "10px", background: "#111", padding: "10px", borderRadius: "12px", marginBottom: "40px" },
  input: { flex: 1, background: "none", border: "none", color: "#fff", outline: "none", fontSize: "1.1rem" },
  button: { background: "#ff4d4d", border: "none", color: "#fff", padding: "0 30px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  error: { color: "#ff4d4d", textAlign: "center", marginBottom: "20px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "30px" },
  card: { background: "#111", padding: "20px", borderRadius: "10px", textAlign: "center" },
  section: { background: "#111", padding: "20px", borderRadius: "12px" },
  st: { fontSize: "0.8rem", color: "#666", marginBottom: "20px" },
  mi: { display: "flex", justifyContent: "space-between", padding: "15px", background: "#000", borderRadius: "8px", marginBottom: "10px" }
};