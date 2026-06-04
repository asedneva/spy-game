import { useEffect, useState, useRef } from "react";
import { ref, onValue, update, get, onDisconnect, remove } from "firebase/database";
import { db } from "../firebase";
import { pickLocation, pickSpy } from "../gameUtils";
import heroLogo from "../assets/hero.png";
import { useLanguage } from "../LanguageContext";

export default function Lobby({ roomCode, playerName, isHost, onStartGame }) {
  const [players, setPlayers] = useState([]);
  const [status, setStatus] = useState("waiting");
  const [timerMinutes, setTimerMinutes] = useState(7);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [notification, setNotification] = useState("");
  const prevPlayersRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    const presenceRef = ref(db, `rooms/${roomCode}/players/${playerName}`);
    onDisconnect(presenceRef).remove();

    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsub = onValue(roomRef, snap => {
      if (!snap.exists()) return;
      const room = snap.val();
      const playerList = Object.entries(room.players || {}).map(([name, data]) => ({
        name,
        color: data.color,
        isHost: data.isHost,
      }));
      setPlayers(playerList);
      setStatus(room.status);
      if (room.timerDuration) setTimerMinutes(Math.round(room.timerDuration / 60));

      if (isHost && prevPlayersRef.current !== null) {
        const currentNames = new Set(playerList.map(p => p.name));
        const missing = prevPlayersRef.current.filter(n => !currentNames.has(n));
        if (missing.length > 0) {
          const msg = `${missing[0]} has left the game.`;
          setNotification(msg);
          setTimeout(() => setNotification(""), 4000);
        }
      }
      prevPlayersRef.current = playerList.map(p => p.name);
    });
    return () => unsub();
  }, [roomCode]);

  useEffect(() => {
    if (status === "playing") onStartGame();
  }, [status]);

  const handleTimerChange = async (e) => {
    const mins = Number(e.target.value);
    setTimerMinutes(mins);
    await update(ref(db, `rooms/${roomCode}`), { timerDuration: mins * 60 });
  };

  const handleStart = async () => {
    const playerNames = players.map(p => p.name);
    const spy = pickSpy(playerNames);
    const snap = await get(ref(db, `rooms/${roomCode}/usedLocations`));
    const usedLocations = snap.exists() ? Object.values(snap.val()) : [];
    const location = pickLocation(usedLocations);
    await update(ref(db, `rooms/${roomCode}`), {
      status: "playing",
      spy,
      location,
      usedLocations: [...usedLocations, location],
      votes: {},
      timerStartedAt: Date.now(),
      timerDuration: timerMinutes * 60,
    });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const copyLink = () => {
    const url = `${window.location.origin}?code=${roomCode}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const canStart = players.length >= 3;

  return (
    <div style={styles.screen}>
      <div style={styles.container}>
        <img src={heroLogo} alt={t("common.spyLogo")} style={styles.logo} />

        <h1 style={styles.heading}>{t("lobby.title")}</h1>

        <div style={styles.codeSection}>
          <p style={styles.codeLabel}>{t("lobby.gameCode")}</p>
          <div style={styles.codeRow}>
            <p style={styles.code}>{roomCode}</p>
            <button style={styles.iconBtn} onClick={copyCode} title={t("lobby.copyCode")}>
              {codeCopied ? "✓" : "⧉"}
            </button>
            <button style={styles.iconBtn} onClick={copyLink} title={t("lobby.copyInviteLink")}>
              {linkCopied ? "✓" : "🔗"}
            </button>
          </div>
          <p style={styles.codeSub}>
            {linkCopied ? t("lobby.inviteLinkCopied") : codeCopied ? t("lobby.codeCopied") : t("lobby.shareCode")}
          </p>
        </div>

        {isHost && (
          <div style={styles.sliderCard}>
            <div style={styles.sliderHeader}>
              <span>🕐</span>
              <span style={styles.sliderTitle}>{t("lobby.roundDuration")}</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={timerMinutes}
              onChange={handleTimerChange}
              style={styles.slider}
            />
            <div style={styles.sliderLabels}>
              <span>1 {t("lobby.minutes")}</span>
              <span style={styles.sliderValue}>{timerMinutes} {t("lobby.minutes")}</span>
              <span>30 {t("lobby.minutes")}</span>
            </div>
          </div>
        )}

        <div style={{ width: "100%" }}>
          {notification ? (
            <div style={{ background: "#7f1d1d", border: "1px solid #ef4444", borderRadius: 8, padding: "0.625rem 1rem", marginBottom: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#fca5a5", fontSize: "0.875rem" }}>{notification}</span>
              <button onClick={() => setNotification("")} style={{ background: "none", border: "none", color: "#fca5a5", cursor: "pointer", fontSize: "1rem", padding: 0 }}>✕</button>
            </div>
          ) : null}
          <div style={styles.playersHeader}>
            <div style={styles.playersTitle}>
              <span>👥</span>
              <span>{t("lobby.players")} ({players.length}/12)</span>
            </div>
            {!canStart && <span style={styles.minLabel}>{t("lobby.minimum")}</span>}
          </div>
          <div style={styles.playerList}>
            {players.map((p) => (
              <div key={p.name} style={styles.playerRow}>
                <div style={{ ...styles.avatar, background: (p.color || "#7c3aed") + "55", color: p.color || "#a78bfa" }}>
                  {p.name[0].toUpperCase()}
                </div>
                <span style={styles.playerName}>{p.name}</span>
                {p.isHost && <span style={styles.hostBadge}>{t("common.host")}</span>}
                {p.name === playerName && !p.isHost && <span style={styles.youBadge}>{t("common.you")}</span>}
                <span style={styles.onlineDot} />
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <button
            style={{ ...styles.btnStart, opacity: canStart ? 1 : 0.6 }}
            onClick={handleStart}
            disabled={!canStart}
          >
            ▷ {t("lobby.startGame")}
          </button>
        ) : (
          <button style={{ ...styles.btnStart, opacity: 0.5, cursor: "default" }} disabled>
            ▷ {t("lobby.startGame")}
          </button>
        )}

        {!canStart && <p style={styles.waitHint}>{t("lobby.waiting")}</p>}

      </div>
    </div>
  );
}

const styles = {
  screen: { minHeight: "100vh", background: "#13111e", display: "flex", justifyContent: "center", padding: "2rem 1rem" },
  container: { width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center" },
  logo: { width: 100, height: 100, objectFit: "contain" },
  heading: { color: "#f3f4f6", fontSize: "2rem", fontWeight: 700, margin: 0 },
  codeSection: { textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" },
  codeLabel: { color: "#9ca3af", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 },
  codeRow: { display: "flex", alignItems: "center", gap: "0.75rem" },
  code: { color: "#7c3aed", fontSize: "3rem", fontWeight: 900, margin: 0, letterSpacing: "0.12em", fontFamily: "'Exo 2', system-ui, sans-serif" },
  iconBtn: { background: "#1e1b2e", border: "1px solid #2d2a42", borderRadius: 8, color: "#9ca3af", fontSize: "1rem", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  codeSub: { color: "#6b7280", fontSize: "0.85rem", margin: 0 },
  sliderCard: { width: "100%", background: "#1e1b2e", border: "1px solid #2d2a42", borderRadius: 12, padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" },
  sliderHeader: { display: "flex", alignItems: "center", gap: "0.5rem" },
  sliderTitle: { color: "#f3f4f6", fontWeight: 600, fontSize: "1rem" },
  slider: { width: "100%", accentColor: "#7c3aed", cursor: "pointer" },
  sliderLabels: { display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: "0.8rem" },
  sliderValue: { color: "#7c3aed", fontWeight: 700, fontSize: "1rem" },
  playersHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" },
  playersTitle: { display: "flex", alignItems: "center", gap: "0.5rem", color: "#f3f4f6", fontWeight: 700, fontSize: "1.1rem" },
  minLabel: { color: "#9ca3af", fontSize: "0.85rem" },
  playerList: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  playerRow: { display: "flex", alignItems: "center", gap: "0.75rem", background: "#1e1b2e", borderRadius: 10, padding: "0.75rem 1rem" },
  avatar: { width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1rem", flexShrink: 0 },
  playerName: { color: "#f3f4f6", fontSize: "0.95rem", flex: 1, fontWeight: 500 },
  hostBadge: { background: "#4c1d9544", color: "#a78bfa", fontSize: "0.75rem", padding: "2px 10px", borderRadius: 99, border: "1px solid #4c1d95", fontWeight: 600 },
  youBadge: { background: "#1e3a2f", color: "#6ee7b7", fontSize: "0.75rem", padding: "2px 10px", borderRadius: 99, border: "1px solid #065f46" },
  onlineDot: { width: 10, height: 10, borderRadius: "50%", background: "#22c55e", flexShrink: 0 },
  btnStart: { width: "100%", maxWidth: 320, padding: "1rem", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 12, fontSize: "1.1rem", fontWeight: 700, cursor: "pointer" },
  waitHint: { color: "#6b7280", fontSize: "0.875rem", margin: 0 },
};