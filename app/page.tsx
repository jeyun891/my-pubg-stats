"use client";
import { useState } from "react";
import Head from "next/head"; // Head 컴포넌트 추가

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [stats, setStats] = useState(null); // 실제 전적 데이터를 받아올 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }
    setError("");
    setLoading(true);
    setStats(null); // 새 검색 시작 시 이전 결과 초기화

    try {
      // 여기에 실제 PUBG API 호출 로직을 구현해야 합니다.
      // NEXT_PUBLIC_PUBG_API_KEY를 사용하여 데이터 가져오기

      // 예시: 1.5초 후 가상 데이터 표시
      setTimeout(() => {
        setStats({
          k_d: "2.8",
          wins: "150",
          kills: "800",
          top10s: "350",
          headshots: "20%",
          accuracy: "25%",
          longestKill: "550m",
          damageDealt: "1200",
        });
        setLoading(false);
      }, 1500);

    } catch (err) {
      console.error("API 호출 오류:", err);
      setError("전적을 불러오는 데 실패했습니다. 닉네임을 다시 확인해주세요.");
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Head>
        <title>Phoenix Stats - 전적 검색</title>
        <meta name="description" content="Phoenix Stats에서 전적을 검색하세요." />
        {/* 구글 폰트 Link */}
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </Head>

      <div style={styles.overlay}></div>
      <div style={styles.content}>
        <h1 style={styles.title}>
          PHOENIX<span style={styles.red}>STATS</span>
        </h1>
        <p style={styles.subtitle}>
          RISE FROM THE ASHES. CLAIM YOUR VICTORY.
        </p>

        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="PLAYER NICKNAME..."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={styles.input}
            disabled={loading}
          />
          <button onClick={handleSearch} style={styles.button} disabled={loading}>
            {loading ? "SEARCHING..." : "SEARCH"}
          </button>
        </div>

        {error && <p style={styles.errorMessage}>{error}</p>}

        {loading && <p style={styles.loadingMessage}>불사조가 전적을 찾고 있습니다...</p>}

        {stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <h3>K/D</h3>
              <p>{stats.k_d}</p>
            </div>
            <div style={styles.statItem}>
              <h3>WINS</h3>
              <p>{stats.wins}</p>
            </div>
            <div style={styles.statItem}>
              <h3>KILLS</h3>
              <p>{stats.kills}</p>
            </div>
            <div style={styles.statItem}>
              <h3>TOP 10S</h3>
              <p>{stats.top10s}</p>
            </div>
            <div style={styles.statItem}>
              <h3>HEADSHOTS</h3>
              <p>{stats.headshots}</p>
            </div>
            <div style={styles.statItem}>
              <h3>ACCURACY</h3>
              <p>{stats.accuracy}</p>
            </div>
            <div style={styles.statItem}>
              <h3>LONGEST KILL</h3>
              <p>{stats.longestKill}</p>
            </div>
            <div style={styles.statItem}>
              <h3>DAMAGE DEALT</h3>
              <p>{stats.damageDealt}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "url('https://images.unsplash.com/photo-1616447883395-5f5f4c5c2d3a?q=80&w=2070&auto=format&fit=crop') no-repeat center center/cover",
    position: "relative",
    color: "#fff",
    fontFamily: "'Orbitron', sans-serif", // Orbitron 폰트 적용
    padding: "20px",
  },
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)", // 더 어둡고 강렬한 오버레이
    zIndex: 0,
  },
  content: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    width: "100%",
    maxWidth: "800px",
    padding: "40px 20px",
    background: "rgba(20, 20, 20, 0.7)", // 반투명한 어두운 컨테이너
    borderRadius: "15px",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(5px)",
  },
  title: {
    fontSize: "3.5rem",
    fontWeight: "900",
    letterSpacing: "8px",
    marginBottom: "10px",
    textShadow: "0 0 15px rgba(255, 0, 0, 0.7)", // 붉은색 그림자
  },
  red: {
    color: "#E50000", // 강렬한 붉은색 포인트
  },
  subtitle: {
    fontSize: "1rem",
    fontWeight: "400",
    marginBottom: "40px",
    letterSpacing: "2px",
    color: "#bbb",
  },
  searchBox: {
    display: "flex",
    gap: "15px",
    marginBottom: "30px",
    flexWrap: "wrap", // 반응형을 위한 줄바꿈
    justifyContent: "center",
  },
  input: {
    flex: 1,
    minWidth: "250px",
    padding: "15px 20px",
    borderRadius: "8px",
    border: "2px solid #E50000", // 붉은색 테두리
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    fontSize: "1.1rem",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  button: {
    padding: "15px 30px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#E50000", // 붉은색 버튼
    color: "#fff",
    fontWeight: "bold",
    fontSize: "1.1rem",
    cursor: "pointer",
    transition: "background-color 0.3s ease, transform 0.2s ease",
  },
  errorMessage: {
    color: "#FFD700", // 경고색
    marginTop: "20px",
    fontSize: "1rem",
  },
  loadingMessage: {
    color: "#E50000",
    marginTop: "20px",
    fontSize: "1.2rem",
    animation: "pulse 1.5s infinite", // 로딩 애니메이션
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", // 반응형 그리드
    gap: "15px",
    marginTop: "40px",
    padding: "20px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  statItem: {
    background: "rgba(0, 0, 0, 0.4)",
    padding: "15px",
    borderRadius: "8px",
    borderLeft: "3px solid #E50000", // 붉은색 강조 라인
    textAlign: "left",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  },
  "@keyframes pulse": {
    "0%": { opacity: 1 },
    "50%": { opacity: 0.5 },
    "100%": { opacity: 1 },
  },
};