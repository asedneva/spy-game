import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "../firebase";
import { translateLocation } from "../locations";
import heroLogo from "../assets/hero.png";
import { useLanguage } from "../LanguageContext";

function CircularTimer({ totalSeconds, timerStartedAt, t }) {
  const getSecondsLeft = () => {
    const elapsed = timerStartedAt ? Math.floor((Date.now() - timerStartedAt) / 1000) : 0;
    return Math.max(0, totalSeconds - elapsed);
  };

  const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft);

  useEffect(() => {
    setSecondsLeft(getSecondsLeft());
    const id = setInterval(() => setSecondsLeft(getSecondsLeft()), 1000);
    return () => clearInterval(id);
  }, [totalSeconds, timerStartedAt]);

  const pct = secondsLeft / totalSeconds;
  const r = 58;
  const circ = 2 * Math.PI * r;
  const offset = circ - pct * circ;
  const color = secondsLeft <= 60 ? "#ef4444" : secondsLeft <= 180 ? "#f97316" : "#7c3aed";
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 150, height: 150 }}>
        <svg width="150" height="150" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="75" cy="75" r={r} stroke="#2d2a42" strokeWidth="12" fill="none" />
          <circle cx="75" cy="75" r={r} stroke={color} strokeWidth="12" fill="none"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s", filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "1.75rem", fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>
            {mins}:{secs}
          </span>
        </div>
      </div>
      <span style={{ color: "#6b7280", fontSize: "0.8rem" }}>{t("game.timeRemaining")}</span>
    </div>
  );
}

function CardReveal({ isSpy, location, t }) {
  const [revealed, setRevealed] = useState(false);

  if (!revealed) {
    return (
      <div onClick={() => setRevealed(true)} style={styles.cardUnrevealed}>
        <div style={styles.eyeCircle}>
          <span style={{ fontSize: "2.5rem" }}>👁</span>
        </div>
        <p style={styles.cardRevealTitle}>{t("game.tapReveal")}</p>
        <p style={styles.cardRevealSub}>{t("game.nobodySee")}</p>
      </div>
    );
  }

  if (isSpy) {
    return (
      <div onClick={() => setRevealed(false)} style={styles.spyCard}>
        <div style={{ ...styles.eyeCircle, background: "#7f1d1d44" }}>
          <span style={{ fontSize: "2.5rem" }}>🕵️</span>
        </div>
        <p style={{ color: "#fca5a5", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", margin: 0 }}>{t("game.youAreSpy")}</p>
        <p style={{ color: "#ef4444", fontSize: "4rem", fontWeight: 900, margin: "0.25rem 0", lineHeight: 1 }}>{t("game.spy")}</p>
        <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: 0, textAlign: "center" }}>
          {t("game.spyHint")}
        </p>
        <p style={{ color: "#4b5563", fontSize: "0.75rem", marginTop: "1rem" }}>{t("game.tapHide")}</p>
      </div>
    );
  }

  return (
    <div onClick={() => setRevealed(false)} style={styles.civilianCard}>
      <div style={{ ...styles.eyeCircle, background: "#14532d44" }}>
        <span style={{ fontSize: "2.5rem" }}>📍</span>
      </div>
      <p style={{ color: "#86efac", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", margin: 0 }}>{t("game.location")}</p>
      <p style={{ color: "#f3f4f6", fontSize: "2rem", fontWeight: 800, margin: "0.5rem 0", textAlign: "center" }}>{location}</p>
      <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: 0, textAlign: "center" }}>
        {t("game.civilianHint")}
      </p>
      <p style={{ color: "#4b5563", fontSize: "0.75rem", marginTop: "1rem" }}>{t("game.tapHide")}</p>
    </div>
  );
}

export default function Game({ roomCode, playerName, isHost, onEndGame, onVote }) {
  const [room, setRoom] = useState(null);
  const [showSpyGuessConfirm, setShowSpyGuessConfirm] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    const unsub = onValue(ref(db, `rooms/${roomCode}`), snap => {
      if (!snap.exists()) return;
      const r = snap.val();
      setRoom(r);

      // All players transition on status change
      if (r.status === "voting") onVote();
      if (r.status === "results") onVote();
      if (r.status === "ended") onEndGame();
    });
    return () => unsub();
  }, [roomCode]);

  const handleEndRound = async () => {
    await update(ref(db, `rooms/${roomCode}`), { status: "voting" });
  };

  const handleSpyGuessedYes = async () => {
    await update(ref(db, `rooms/${roomCode}`), {
      status: "results",
      playersWon: false,
      spyGuessedCorrect: true,
    });
    setShowSpyGuessConfirm(false);
  };

  const handleSpyGuessedNo = () => {
    setShowSpyGuessConfirm(false);
  };

  if (!room) return (
    <div style={{ minHeight: "100vh", background: "#13111e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#9ca3af" }}>{t("common.loading")}</p>
    </div>
  );

  const isSpy = room.spy === playerName;
  const displayedLocation = translateLocation(room.location, language);

  return (
    <div style={styles.screen}>
      <div style={styles.container}>
        <p style={styles.roomLabel}>{t("game.room")} · {roomCode}</p>
        <img src={heroLogo} alt={t("common.spyLogo")} style={styles.logo} />

        <CircularTimer
          totalSeconds={room.timerDuration || 420}
          timerStartedAt={room.timerStartedAt || Date.now()}
          t={t}
        />

        <CardReveal isSpy={isSpy} location={displayedLocation} t={t} />

        {isHost && (
          <>
            <button style={styles.btnEnd} onClick={handleEndRound}>
              {t("game.endRound")}
            </button>
            <button style={styles.btnSpyGuessed} onClick={() => setShowSpyGuessConfirm(true)}>
              {t("game.spyGuessed")}
            </button>

            {showSpyGuessConfirm && (
              <div style={styles.spyGuessConfirmBox}>
                <p style={styles.spyGuessConfirmText}>{t("game.spyGuessPrompt")}</p>
                <div style={styles.spyGuessConfirmActions}>
                  <button style={styles.spyGuessYesBtn} onClick={handleSpyGuessedYes}>{t("game.spyGuessYes")}</button>
                  <button style={styles.spyGuessNoBtn} onClick={handleSpyGuessedNo}>{t("game.spyGuessNo")}</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  screen: { minHeight: "100vh", background: "#13111e", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" },
  container: { width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center" },
  roomLabel: { color: "#6b7280", fontSize: "0.75rem", letterSpacing: "0.12em" },
  logo: { width: 100, height: 100, objectFit: "contain" },
  cardUnrevealed: { width: "100%", maxWidth: 320, minHeight: 340, background: "#1e1b2e", border: "2px dashed #4c1d95", borderRadius: 20, padding: "2.5rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", cursor: "pointer" },
  spyCard: { width: "100%", maxWidth: 320, minHeight: 340, background: "#1a0a0a", border: "2px solid #ef4444", borderRadius: 20, padding: "2.5rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer" },
  civilianCard: { width: "100%", maxWidth: 320, minHeight: 340, background: "#0a1a0e", border: "2px solid #22c55e", borderRadius: 20, padding: "2.5rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer" },
  eyeCircle: { width: 80, height: 80, borderRadius: "50%", background: "#4c1d9544", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.5rem" },
  cardRevealTitle: { color: "#a78bfa", fontSize: "1.2rem", fontWeight: 700, margin: 0, textAlign: "center" },
  cardRevealSub: { color: "#6b7280", fontSize: "0.85rem", margin: 0, textAlign: "center" },
  btnEnd: { padding: "0.85rem 2rem", background: "transparent", color: "#9ca3af", border: "1px solid #374151", borderRadius: 10, fontSize: "0.95rem", cursor: "pointer" },
  btnSpyGuessed: { padding: "0.85rem 2rem", background: "#1e1b2e", color: "#fbbf24", border: "1px solid #374151", borderRadius: 10, fontSize: "0.95rem", cursor: "pointer" },
  spyGuessConfirmBox: { width: "100%", maxWidth: 360, background: "#1e1b2e", border: "1px solid #7c3aed", borderRadius: 12, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" },
  spyGuessConfirmText: { color: "#f3f4f6", fontSize: "0.95rem", margin: 0, textAlign: "center" },
  spyGuessConfirmActions: { display: "flex", gap: "0.75rem", width: "100%" },
  spyGuessYesBtn: { flex: 1, padding: "0.75rem 0.85rem", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, fontSize: "0.9rem", cursor: "pointer" },
  spyGuessNoBtn: { flex: 1, padding: "0.75rem 0.85rem", background: "transparent", color: "#f3f4f6", border: "1px solid #374151", borderRadius: 10, fontSize: "0.9rem", cursor: "pointer" },
};