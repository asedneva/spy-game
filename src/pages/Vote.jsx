import { useState, useEffect } from "react";
import { ref, onValue, update, onDisconnect } from "firebase/database";
import { db } from "../firebase";
import { calculateVoteResult, allVotesCast } from "../gameUtils";
import heroLogo from "../assets/hero.png";
import { useLanguage } from "../LanguageContext";

export default function Vote({ roomCode, playerName, isHost, onResults }) {
  const [players, setPlayers] = useState([]);
  const [spy, setSpy] = useState("");
  const [votes, setVotes] = useState({});
  const [selected, setSelected] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [status, setStatus] = useState("voting");
  const { t } = useLanguage();

  useEffect(() => {
    const presenceRef = ref(db, `rooms/${roomCode}/players/${playerName}`);
    onDisconnect(presenceRef).remove();

    const unsub = onValue(ref(db, `rooms/${roomCode}`), snap => {
      if (!snap.exists()) return;
      const room = snap.val();
      const playerList = Object.keys(room.players || {});
      setPlayers(playerList);
      setSpy(room.spy || "");
      setVotes(room.votes || {});
      setStatus(room.status);
      if (room.status === "results") onResults();
    });
    return () => unsub();
  }, [roomCode]);

  useEffect(() => {
    if (!spy || players.length === 0) return;
    if (!isHost) return;
    if (allVotesCast(votes, players, spy)) {
      const result = calculateVoteResult(votes, spy, players);
      update(ref(db, `rooms/${roomCode}`), {
        status: "results",
        playersWon: result.playersWon,
        votedOut: result.votedOut,
      });
    }
  }, [votes, players, spy, isHost]);

  const handleVote = async () => {
    if (!selected || hasVoted) return;
    const newVotes = { ...votes, [playerName]: selected };
    await update(ref(db, `rooms/${roomCode}/votes`), { [playerName]: selected });
    setHasVoted(true);
  };

  const isSpy = playerName === spy;
  const votablePlayers = players.filter(p => p !== playerName);
  const votesCast = Object.keys(votes).length;
  const votersTotal = players.filter(p => p !== spy).length;

  return (
    <div style={styles.screen}>
      <div style={styles.container}>
        <div style={styles.header}>
          <img src={heroLogo} alt={t("common.spyLogo")} style={styles.logo} />
          <h2 style={styles.heading}>{t("vote.title")}</h2>
          <p style={styles.sub}>{t("vote.subtitle")}</p>
          <p style={styles.sub2}>{t("vote.majorityRequired")} · {votesCast}/{votersTotal} {t("vote.voted")}</p>
        </div>

        {isSpy ? (
          <div style={styles.spyNotice}>
            <span style={{ fontSize: "2rem" }}>🕵️</span>
            <p style={{ color: "#fca5a5", fontWeight: 600, margin: 0 }}>{t("vote.spyNotice")}</p>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: 0 }}>{t("vote.watchOthers")}</p>
          </div>
        ) : hasVoted ? (
          <div style={styles.votedNotice}>
            <span style={{ fontSize: "2rem" }}>✓</span>
            <p style={{ color: "#86efac", fontWeight: 600, margin: 0 }}>{t("vote.voteCast")} <strong>{selected}</strong></p>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: 0 }}>{t("vote.waiting")}</p>
          </div>
        ) : (
          <>
            <div style={styles.grid}>
              {votablePlayers.map((name, i) => {
                const isSelected = selected === name;
                return (
                  <button
                    key={name}
                    onClick={() => setSelected(name)}
                    style={{
                      ...styles.playerBtn,
                      border: isSelected ? "2px solid #7c3aed" : "2px solid #2d2a42",
                      background: isSelected ? "#4c1d9533" : "#1e1b2e",
                    }}
                  >
                    <div style={{ ...styles.avatar, background: isSelected ? "#7c3aed44" : "#2d2a42" }}>
                      {name[0].toUpperCase()}
                    </div>
                    <span style={styles.playerName}>{name}</span>
                    {isSelected && (
                      <div style={styles.checkBadge}>✓</div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              style={{ ...styles.btnPrimary, opacity: selected ? 1 : 0.4 }}
              onClick={handleVote}
              disabled={!selected}
            >
              {t("vote.confirm")}
            </button>
          </>
        )}

        <div style={styles.voterList}>
          <p style={styles.voterLabel}>{t("vote.votesCast")}</p>
          <div style={styles.voterRow}>
            {players.filter(p => p !== spy).map(p => (
              <div key={p} style={{ ...styles.voterDot, background: votes[p] ? "#7c3aed" : "#2d2a42" }} title={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  screen: { minHeight: "100vh", background: "#13111e", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" },
  container: { width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: "1.5rem" },
  header: { textAlign: "center", display: "flex", flexDirection: "column", gap: "0.25rem" },
  logo: { width: 100, height: 100, objectFit: "contain", alignSelf: "center", marginBottom: "0.25rem" },
  heading: { color: "#f3f4f6", fontSize: "1.75rem", fontWeight: 700, margin: 0 },
  sub: { color: "#9ca3af", fontSize: "0.9rem", margin: 0 },
  sub2: { color: "#7c3aed", fontSize: "0.8rem", fontWeight: 600, margin: 0 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" },
  playerBtn: { position: "relative", padding: "1.25rem 1rem", borderRadius: 12, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", transition: "all 0.15s" },
  avatar: { width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 700, color: "#a78bfa" },
  playerName: { color: "#f3f4f6", fontWeight: 600, fontSize: "0.95rem", textAlign: "center" },
  checkBadge: { position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: "50%", background: "#7c3aed", color: "#fff", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 },
  btnPrimary: { padding: "1rem", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, fontSize: "1rem", fontWeight: 600, cursor: "pointer" },
  spyNotice: { background: "#1a0a0a", border: "2px solid #ef444444", borderRadius: 12, padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", textAlign: "center" },
  votedNotice: { background: "#0a1a0e", border: "2px solid #22c55e44", borderRadius: 12, padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", textAlign: "center" },
  voterList: { display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" },
  voterLabel: { color: "#4b5563", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 },
  voterRow: { display: "flex", gap: "0.5rem" },
  voterDot: { width: 12, height: 12, borderRadius: "50%", transition: "background 0.3s" },
};