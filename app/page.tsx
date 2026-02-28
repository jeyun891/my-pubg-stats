"use client";

import { useState } from "react";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [allMatchIds, setAllMatchIds] = useState<any[]>([]); 
  const [displayCount, setDisplayCount] = useState(0);

  const handleSearch = async () => {
    if (!nickname) return alert("닉네임을 입력하세요!");
    setLoading(true);
    setMatchHistory([]);
    setDisplayCount(0);

    try {
      const apiKey = process.env.NEXT_PUBLIC_PUBG_API_KEY;
      const cleanName = nickname.trim();

      const pRes = await fetch(`https://api.pubg.com/shards/steam/players?filter[playerNames]=${cleanName}`, {
        headers: { "Authorization": `Bearer ${apiKey}`, "Accept": "application/vnd.api+json" }
      });
      if (!pRes.ok) throw new Error("플레이어를 찾을 수 없습니다.");
      const pData = await pRes.json();
      
      const ids = pData.data[0].relationships.matches.data;
      setAllMatchIds(ids);

      // 처음 10개 로드
      await loadMatches(ids.slice(0, 10), cleanName);
      setDisplayCount(10);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async (targetIds: any[], name: string) => {
    const apiKey = process.env.NEXT_PUBLIC_PUBG_API_KEY;
    const matchPromises = targetIds.map(async (m: any) => {
      try {
        const mRes = await fetch(`https://api.pubg.com/shards/steam/matches/${m.id}`, {
          headers: { "Authorization": `Bearer ${apiKey}`, "Accept": "application/vnd.api+json" }
        });
        const mData = await mRes.json();
        const myPart = mData.included?.find((i: any) => i.type === "participant" && i.attributes.stats.name === name);
        if (!myPart) return null;

        const myTeamId = myPart.relationships?.team?.data?.id;
        const teammates = myTeamId 
          ? mData.included
              .filter((i: any) => i.type === "participant" && i.relationships?.team?.data?.id === myTeamId && i.attributes.stats.name !== name)
              .map((i: any) => i.attributes.stats.name)
          : [];

        return {
          id: m.id,
          map: mData.data.attributes.mapName,
          mode: mData.data.attributes.gameMode,
          stats: myPart.attributes.stats,
          teammates: teammates,
          date: new Date(mData.data.attributes.createdAt).toLocaleDateString()
        };
      } catch (e) { return null; }
    });

    const results = (await Promise.all(matchPromises)).filter(r => r !== null);
    setMatchHistory(prev => [...prev, ...results]);
  };

  const handleLoadMore = async () => {
    setLoading(true);
    const nextIds = allMatchIds.slice(displayCount, displayCount + 10);
    if (nextIds.length > 0) {
      await loadMatches(nextIds, nickname.trim());
      setDisplayCount(prev => prev + 10);
    }
    setLoading(false);
  };

  // 계산된 승률 (현재 불러온 매치 기준)
  const winRate = matchHistory.length > 0 
    ? (matchHistory.filter(m => m.stats.winPlace === 1).length / matchHistory.length * 100).toFixed(1) 
    : 0;

  return (
    <main className="min-h-screen bg-[#0b0e14] text-white p-6">
      <div className="max-w-5xl mx-auto pb-20">
        <div className="text-center py-10">
          <h1 className="text-6xl font-black text-yellow-500 italic tracking-tighter">PUBG.GG</h1>
        </div>

        <div className="sticky top-4 z-50 flex bg-[#1a1f29]/90 backdrop-blur-md p-3 rounded-3xl border border-white/10 shadow-2xl mb-8 gap-4">
          <input 
            type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
            placeholder="NICKNAME" className="flex-1 bg-transparent px-6 py-2 outline-none font-black text-lg"
          />
          <button onClick={handleSearch} disabled={loading} className="bg-yellow-500 text-black px-10 py-3 rounded-2xl font-black hover:bg-yellow-400">
            {loading ? "..." : "SEARCH"}
          </button>
        </div>

        {matchHistory.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-3xl text-black mb-8 flex justify-between items-center shadow-lg">
            <div>
              <p className="text-[10px] font-black uppercase opacity-70">Loaded Stats ({matchHistory.length} Games)</p>
              <p className="text-4xl font-black">{winRate}% WIN RATE</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase opacity-70">Total Kills</p>
              <p className="text-4xl font-black">{matchHistory.reduce((acc, cur) => acc + cur.stats.kills, 0)}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {matchHistory.map((match, idx) => (
            <div key={`${match.id}-${idx}`} className={`bg-[#1a1f29] rounded-3xl border-l-[10px] p-6 shadow-xl ${match.stats.winPlace === 1 ? 'border-l-yellow-500' : 'border-l-gray-800'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className={`text-4xl font-black ${match.stats.winPlace === 1 ? 'text-yellow-500' : 'text-white'}`}>#{match.stats.winPlace}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase text-gray-500">{match.mode.replace("-", " ")}</span>
                    <span className="text-[10px] text-gray-600 font-bold">{match.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-black uppercase">MAP</p>
                  <p className="text-sm font-bold">{match.map.split('_')[0]}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 bg-black/20 p-4 rounded-2xl items-center">
                <div><p className="text-[9px] text-gray-500 font-black uppercase">KILLS</p><p className="font-black text-xl text-yellow-500">{match.stats.kills}</p></div>
                <div><p className="text-[9px] text-gray-500 font-black uppercase">DAMAGE</p><p className="font-bold text-lg">{Math.floor(match.stats.damageDealt)}</p></div>
                <div><p className="text-[9px] text-gray-500 font-black uppercase">LONGEST</p><p className="font-bold text-sm">{Math.floor(match.stats.longestKill)}m</p></div>
                <div><p className="text-[9px] text-gray-500 font-black uppercase">HEADSHOT</p><p className="font-bold text-sm text-red-500">{match.stats.headshotKills}</p></div>
              </div>

              <div className="mt-4 px-2">
                <p className="text-[9px] text-gray-600 font-black uppercase">SQUAD MEMBERS</p>
                <p className="text-[10px] text-gray-400 truncate">{match.teammates.join(", ") || "SOLO PLAYER"}</p>
              </div>
            </div>
          ))}

          {allMatchIds.length > displayCount && (
            <button 
              onClick={handleLoadMore} 
              disabled={loading}
              className="mt-6 w-full py-5 rounded-3xl bg-[#1a1f29] border-2 border-dashed border-gray-800 text-yellow-500 font-black text-xl hover:bg-[#252b38] transition-all"
            >
              {loading ? "LOAD MORE..." : "LOAD NEXT 10 MATCHES"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}