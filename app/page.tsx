import { useState } from "react";

const API_KEY = "YOUR_PUBG_API_KEY";

export default function App() {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const [seasonStats, setSeasonStats] = useState<any>(null);

  const [allMatchIds, setAllMatchIds] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  const MATCH_PER_PAGE = 5;

  const headers = {
    Authorization: `Bearer ${API_KEY}`,
    Accept: "application/vnd.api+json",
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setMatches([]);
      setPage(1);

      // 1️⃣ 플레이어 조회
      const playerRes = await fetch(
        `https://api.pubg.com/shards/steam/players?filter[playerNames]=${nickname}`,
        { headers }
      );
      const playerData = await playerRes.json();
      const playerInfo = playerData.data[0];
      setPlayer(playerInfo);

      const accountId = playerInfo.id;

      // 2️⃣ 시즌 조회
      const seasonRes = await fetch(
        `https://api.pubg.com/shards/steam/seasons`,
        { headers }
      );
      const seasonData = await seasonRes.json();
      const currentSeason = seasonData.data.find((s: any) => s.attributes.isCurrentSeason);

      // 3️⃣ 시즌 스탯
      const statRes = await fetch(
        `https://api.pubg.com/shards/steam/seasons/${currentSeason.id}/players/${accountId}`,
        { headers }
      );
      const statData = await statRes.json();
      setSeasonStats(statData.data.attributes.gameModeStats.squad);

      // 4️⃣ 매치 ID 전체 저장
      const matchIds = playerInfo.relationships.matches.data;
      setAllMatchIds(matchIds);

      await loadMatches(matchIds, accountId, 1);

    } catch (e) {
      alert("플레이어를 찾을 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async (
    matchIdList: any[],
    accountId: string,
    pageNumber: number
  ) => {
    const start = (pageNumber - 1) * MATCH_PER_PAGE;
    const end = pageNumber * MATCH_PER_PAGE;
    const target = matchIdList.slice(start, end);

    const results = await Promise.all(
      target.map(async (m: any) => {
        try {
          const res = await fetch(
            `https://api.pubg.com/shards/steam/matches/${m.id}`,
            { headers }
          );
          const data = await res.json();

          const participant = data.included.find(
            (i: any) =>
              i.type === "participant" &&
              i.attributes.stats.playerId === accountId
          );

          const stats = participant?.attributes.stats;

          // 텔레메트리에서 무기 + 헤드샷
          const telemetryUrl = data.included.find(
            (i: any) => i.type === "asset"
          )?.attributes.URL;

          let weaponMap: any = {};
          let headshots = 0;

          if (telemetryUrl) {
            const teleRes = await fetch(telemetryUrl);
            const teleData = await teleRes.json();

            teleData.forEach((event: any) => {
              if (
                event._T === "LogPlayerKillV2" &&
                event.killer?.accountId === accountId
              ) {
                const weapon = event.damageCauserName;
                weaponMap[weapon] = (weaponMap[weapon] || 0) + 1;

                if (event.damageReason === "HeadShot") {
                  headshots++;
                }
              }
            });
          }

          const kills = stats?.kills || 0;

          return {
            id: m.id,
            map: data.data.attributes.mapName,
            date: new Date(data.data.attributes.createdAt).toLocaleDateString(),
            place: stats?.winPlace || "-",
            kills,
            assists: stats?.assists || 0,
            damage: stats?.damageDealt?.toFixed(0) || 0,
            headshotRate:
              kills > 0 ? ((headshots / kills) * 100).toFixed(1) + "%" : "0%",
            weapons: Object.entries(weaponMap)
              .map(([name, count]) => `${name}(${count})`)
              .join(", "),
          };
        } catch {
          return {
            id: m.id,
            map: "Unknown",
            date: "-",
            place: "-",
            kills: 0,
            assists: 0,
            damage: 0,
            headshotRate: "0%",
            weapons: "-",
          };
        }
      })
    );

    setMatches((prev) => [...prev, ...results]);
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await loadMatches(allMatchIds, player.id, nextPage);
  };

  return (
    <div style={{ padding: 40, background: "#0f0f0f", color: "white" }}>
      <h1>PUBG 전적 검색</h1>

      <input
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="닉네임 입력"
        style={{ padding: 10, width: 250 }}
      />
      <button onClick={handleSearch} style={{ padding: 10, marginLeft: 10 }}>
        검색
      </button>

      {loading && <p>로딩중...</p>}

      {seasonStats && (
        <div style={{ marginTop: 30 }}>
          <h2>시즌 스탯 (Squad)</h2>
          <p>KD: {seasonStats.kills / seasonStats.losses || 0}</p>
          <p>평균 데미지: {seasonStats.damageDealt?.toFixed(0)}</p>
          <p>승률: {((seasonStats.wins / seasonStats.roundsPlayed) * 100).toFixed(1)}%</p>
        </div>
      )}

      {matches.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h2>최근 매치</h2>

          {matches.map((m, idx) => (
            <div
              key={idx}
              style={{
                background: "#1c1c1c",
                padding: 15,
                marginBottom: 10,
                borderRadius: 8,
              }}
            >
              <p>맵: {m.map}</p>
              <p>날짜: {m.date}</p>
              <p>순위: #{m.place}</p>
              <p>킬: {m.kills} (헤드샷비율 {m.headshotRate})</p>
              <p>어시스트: {m.assists}</p>
              <p>데미지: {m.damage}</p>
              <p>사용무기: {m.weapons}</p>
            </div>
          ))}

          {allMatchIds.length > matches.length && (
            <button
              onClick={handleLoadMore}
              style={{
                width: "100%",
                padding: 12,
                background: "#ff4d00",
                color: "white",
                border: "none",
                borderRadius: 6,
              }}
            >
              더보기
            </button>
          )}
        </div>
      )}
    </div>
  );
}