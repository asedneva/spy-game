import { useEffect, useState, useRef } from "react";
import { ref, onValue, update, get, onDisconnect } from "firebase/database";
import { db } from "../firebase";
import { pickLocation, pickSpy } from "../gameUtils";
import { translateLocation } from "../locations";
import heroLogo from "../assets/hero.png";
import { useLanguage } from "../LanguageContext";

function getResultMessage(room, votes, voteCounts, spyName, playersWon, t) {
  if (room.spyGuessedCorrect === true) return t("results.spyGuessedRound");

  const totalVotes = Object.keys(votes).length;
  const majority = Math.floor(totalVotes / 2) + 1;

  let mostVotedName = null;
  let maxVotes = 0;
  Object.entries(voteCounts).forEach(([name, count]) => {
    if (count > maxVotes) { maxVotes = count; mostVotedName = name; }
  });

  const hasMajority = maxVotes >= majority;

  if (playersWon) return t("results.playersIdentifiedSpy");
  if (!hasMajority) return t("results.votesSplit");
  if (mostVotedName && mostVotedName !== spyName) return `${t("results.wrongPersonVoted")} (${mostVotedName}). ${t("results.spyEscapes")}`;
  return t("results.spyAvoided");
}

export default function Results({ roomCode, playerName, isHost, onNewRound, onEndGame }) {
  const [room, setRoom] = useState(null);
  const initialLoadDone = useRef(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    const presenceRef = ref(db, `rooms/${roomCode}/players/${playerName}`);
    onDisconnect(presenceRef).remove();

    const unsub = onValue(ref(db, `rooms/${roomCode}`), snap => {
      if (!snap.exists()) return;
      const r = snap.val();

      if (!initialLoadDone.current) {
        // First load — just store the data, never redirect
        setRoom(r);
        initialLoadDone.current = true;
        return;
      }

      // Subsequent updates — react to host-triggered status changes
      setRoom(r);
      if (r.status === "playing") onNewRound();
      if (r.status === "ended") onEndGame();
    });
    return () => unsub();
  }, [roomCode]);

  const handleNewRound = async () => {
    const snap = await get(ref(db, `rooms/${roomCode}/players`));
    const players = snap.exists() ? Object.keys(snap.val()) : [];
    if (players.length === 0) return;
    if (players.length < 3) return;
    const spy = pickSpy(players);
    if (!spy) { console.error("pickSpy returned falsy — aborting new round"); return; }
    const usedLocations = room.usedLocations || [];
    const location = pickLocation(usedLocations);
    await update(ref(db, `rooms/${roomCode}`), {
      status: "playing",
      spy,
      location,
      usedLocations: [...usedLocations, location],
      votes: {},
      playersWon: null,
      votedOut: null,
      spyGuessedCorrect: false,
      timerStartedAt: Date.now(),
    });
  };

  const handleEndGame = async () => {
    await update(ref(db, `rooms/${roomCode}`), { status: "ended" });
  };

  if (!room) return (
    <div style={{ minHeight: "100vh", background: "#13111e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#9ca3af" }}>{t("common.loadingResults")}</p>
    </div>
  );

  const playersWon = room.playersWon;
  const spyName = room.spy || t("common.unknown");
  const displayedLocation = translateLocation(room.location, language);
  const votes = room.votes || {};
  const players = Object.keys(room.players || {});

  const voteCounts = {};
  Object.values(votes).forEach(v => { voteCounts[v] = (voteCounts[v] || 0) + 1; });

  const voteResults = players
    .map(name => ({ name, count: voteCounts[name] || 0 }))
    .sort((a, b) => b.count - a.count);

  const totalVotes = Object.keys(votes).length;
  const majority = Math.floor(totalVotes / 2) + 1;
  const resultMessage = getResultMessage(room, votes, voteCounts, spyName, playersWon, t);

  return (
    <div style={styles.screen}>
      <div style={styles.container}>

        <img src={heroLogo} alt={t("common.spyLogo")} style={styles.logo} />

        <div style={styles.trophyCircle(playersWon)}>
          <span style={{ fontSize: "3.5rem" }}>{playersWon ? "🏆" : "🕵️"}</span>
        </div>

        <div style={{ textAlign: "center" }}>
          <h1 style={{ ...styles.resultTitle, color: playersWon ? "#4ade80" : "#ef4444" }}>
            {playersWon ? t("results.playersWin") : t("results.spyWins")}
          </h1>
          <p style={styles.resultMessage}>{resultMessage}</p>
        </div>

        <div style={styles.cardsRow}>
          <div style={styles.infoCard}>
            <p style={styles.infoLabel}>🎯 {t("results.theSpy")}</p>
            <p style={{ ...styles.infoValue, color: "#a78bfa" }}>{spyName}</p>
          </div>
          <div style={styles.infoCard}>
            <p style={styles.infoLabel}>📍 {t("results.location")}</p>
            <p style={styles.infoValue}>{displayedLocation}</p>
          </div>
        </div>

        <div style={styles.voteTable}>
          <p style={styles.tableTitle}>🗳 {t("results.voteResults")}</p>
          {voteResults.map(({ name, count }) => {
            const isSpy = name === spyName;
            const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
            const hasMajority = count >= majority;
            return (
              <div key={name} style={styles.voteRow}>
                <div style={styles.voteRowTop}>
                  <div style={styles.voteNameRow}>
                    <div style={{ ...styles.voteAvatar, background: isSpy ? "#7c3aed44" : "#2d2a42", color: isSpy ? "#a78bfa" : "#9ca3af" }}>
                      {name[0].toUpperCase()}
                    </div>
                    <span style={{ ...styles.voteName, color: isSpy ? "#a78bfa" : "#f3f4f6", fontWeight: isSpy ? 700 : 400 }}>
                      {name}{isSpy && <span style={styles.spyTag}> 🕵️</span>}
                    </span>
                  </div>
                  <span style={{ ...styles.voteCount, color: hasMajority && count > 0 ? "#f87171" : "#6b7280" }}>
                    {count} {t("results.votes")}
                  </span>
                </div>
                <div style={styles.barBg}>
                  <div style={{
                    ...styles.barFill,
                    width: `${pct}%`,
                    background: isSpy ? "#7c3aed" : hasMajority ? "#ef4444" : "#374151",
                  }} />
                </div>
              </div>
            );
          })}
          <p style={styles.majorityNote}>
            {t("results.majorityThreshold")}: {majority} {t("results.votes")} ({totalVotes} {t("results.total")})
          </p>
        </div>

        {isHost ? (
          <div style={styles.btnRow}>
            {(() => {
              const playerCount = Object.keys(room.players || {}).length;
              const tooFewPlayers = playerCount < 3;
              return (
                <>
                  {tooFewPlayers && (
                    <p style={{ color: "#f87171", fontSize: "0.875rem", margin: 0, textAlign: "center" }}>
                      Not enough players to start a new round (minimum 3). Waiting for players to join.
                    </p>
                  )}
                  <button
                    style={{ ...styles.btnPrimary, opacity: tooFewPlayers ? 0.4 : 1 }}
                    onClick={handleNewRound}
                    disabled={tooFewPlayers}
                  >
                    ▶ {t("results.newRound")}
                  </button>
                </>
              );
            })()}
            <button style={styles.btnOutline} onClick={handleEndGame}>{t("results.endGame")}</button>
          </div>
        ) : (
          <div style={styles.waitBox}>
            <span style={styles.waitDot} />
            <p style={styles.waitHint}>{t("results.waitingHost")}</p>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  screen: { minHeight: "100vh", background: "#13111e", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" },
  container: { width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center" },
  logo: { width: 100, height: 100, objectFit: "contain" },
  trophyCircle: (w) => ({ width: 100, height: 100, borderRadius: "50%", background: w ? "#14532d44" : "#7f1d1d44", border: `2px solid ${w ? "#22c55e55" : "#ef444455"}`, display: "flex", alignItems: "center", justifyContent: "center" }),
  resultTitle: { fontSize: "2.75rem", fontWeight: 900, margin: 0, lineHeight: 1.1, fontFamily: "'Exo 2', system-ui, sans-serif" },
  resultMessage: { color: "#9ca3af", fontSize: "0.95rem", marginTop: "0.5rem", maxWidth: 340, textAlign: "center", lineHeight: 1.5 },
  cardsRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", width: "100%" },
  infoCard: { background: "#1e1b2e", border: "1px solid #2d2a42", borderRadius: 10, padding: "1rem", textAlign: "center" },
  infoLabel: { color: "#6b7280", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 0.4rem" },
  infoValue: { color: "#f3f4f6", fontSize: "1rem", fontWeight: 700, margin: 0 },
  voteTable: { background: "#1e1b2e", border: "1px solid #2d2a42", borderRadius: 12, padding: "1.25rem", width: "100%", display: "flex", flexDirection: "column", gap: "0.75rem" },
  tableTitle: { color: "#d1d5db", fontWeight: 600, fontSize: "0.9rem", margin: 0 },
  voteRow: { display: "flex", flexDirection: "column", gap: "0.35rem" },
  voteRowTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  voteNameRow: { display: "flex", alignItems: "center", gap: "0.6rem" },
  voteAvatar: { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0 },
  voteName: { fontSize: "0.95rem" },
  spyTag: { color: "#7c3aed", fontSize: "0.85rem" },
  voteCount: { fontSize: "0.85rem", fontWeight: 600, flexShrink: 0 },
  barBg: { height: 6, background: "#2d2a42", borderRadius: 99, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 99, transition: "width 0.6s ease" },
  majorityNote: { color: "#4b5563", fontSize: "0.75rem", margin: 0, textAlign: "right" },
  btnRow: { display: "flex", gap: "0.75rem", width: "100%" },
  btnPrimary: { flex: 1, padding: "1rem", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, fontSize: "1rem", fontWeight: 600, cursor: "pointer" },
  btnOutline: { flex: 1, padding: "1rem", background: "transparent", color: "#f3f4f6", border: "1.5px solid #374151", borderRadius: 10, fontSize: "1rem", fontWeight: 600, cursor: "pointer" },
  waitBox: { display: "flex", alignItems: "center", gap: "0.5rem" },
  waitDot: { width: 8, height: 8, borderRadius: "50%", background: "#7c3aed" },
  waitHint: { color: "#6b7280", fontSize: "0.875rem", margin: 0 },
};