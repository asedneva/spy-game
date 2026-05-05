import { useState, useEffect } from "react";
import { ref, get, update } from "firebase/database";
import { db } from "../firebase";
import { playerColor } from "../gameUtils";
import { useLanguage } from "../LanguageContext";

export default function Join({ playerName, setPlayerName, roomCode, setRoomCode, onEnterLobby }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState(false);
  const [codeFromUrl, setCodeFromUrl] = useState(false);
  const { t, language } = useLanguage();

  // Read ?code= from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      setRoomCode(code.toUpperCase());
      setCodeFromUrl(true);
    }
  }, []);

  const handleJoin = async () => {
    if (!roomCode.trim()) { setError(t("join.enterRoomCodeError")); return; }
    if (!playerName.trim()) { setError(t("join.enterNameError")); return; }
    setLoading(true);
    setError("");
    const code = roomCode.trim().toUpperCase();
    try {
      const snap = await get(ref(db, `rooms/${code}`));
      if (!snap.exists()) { setError(t("join.roomNotFound")); setLoading(false); return; }
      const room = snap.val();
      if (room.status !== "waiting") { setError(t("join.gameStarted")); setLoading(false); return; }

      const existingPlayers = Object.keys(room.players || {});
      const normalizedPlayerName = playerName.trim().toLowerCase();
      const isDuplicateName = existingPlayers.some((name) => name.toLowerCase() === normalizedPlayerName);
      if (isDuplicateName) {
        setError(
          language === "ru"
            ? "Это имя уже занято. Пожалуйста, выберите другое."
            : "This name is already taken in this room. Please choose a different name."
        );
        setNameError(true);
        setLoading(false);
        return;
      }
      const colorIndex = existingPlayers.length;

      await update(ref(db, `rooms/${code}/players`), {
        [playerName.trim()]: { color: playerColor(colorIndex), isHost: false }
      });
      setRoomCode(code);
      onEnterLobby();
    } catch (e) {
      setError(t("join.joinFailed"));
    }
    setLoading(false);
  };

  return (
    <div style={styles.screen}>
      <div style={styles.container}>

        <div style={styles.hero}>
          <h2 style={styles.heading}>
            {codeFromUrl ? t("join.invited") : t("join.title")}
          </h2>
          <p style={styles.sub}>
            {codeFromUrl
              ? `${t("join.enterNameToJoin")} ${roomCode}`
              : t("join.sharedByHost")}
          </p>
        </div>

        {/* Room code — hidden if pre-filled from URL, shown as badge instead */}
        {codeFromUrl ? (
          <div style={styles.codeBadge}>
            <span style={styles.codeBadgeLabel}>{t("common.room")}</span>
            <span style={styles.codeBadgeValue}>{roomCode}</span>
          </div>
        ) : (
          <div style={styles.field}>
            <label style={styles.label}>{t("join.roomCode")}</label>
            <input
              style={{ ...styles.input, textAlign: "center", letterSpacing: "0.3em", fontSize: "1.5rem", textTransform: "uppercase" }}
              placeholder={t("join.codePlaceholder")}
              value={roomCode}
              maxLength={6}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
            />
          </div>
        )}

        <div style={styles.field}>
          <label style={styles.label}>{t("home.yourName")}</label>
          <input
            style={{ ...styles.input, border: nameError ? "1px solid #ef4444" : "1px solid #374151" }}
            placeholder={t("home.enterName")}
            value={playerName}
            onChange={e => {
              setPlayerName(e.target.value);
              setNameError(false);
            }}
            onKeyDown={e => e.key === "Enter" && handleJoin()}
            autoFocus={false}
          />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1 }}
          onClick={handleJoin}
          disabled={loading}
        >
          {loading ? t("common.joining") : t("join.joinRoom")}
        </button>

      </div>
    </div>
  );
}

const styles = {
  screen: { minHeight: "100vh", background: "#13111e", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" },
  container: { width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: "1.25rem" },
  hero: { display: "flex", flexDirection: "column", gap: "0.35rem" },
  heading: { color: "#f3f4f6", fontSize: "1.75rem", fontWeight: 700, margin: 0 },
  sub: { color: "#9ca3af", fontSize: "0.9rem", margin: 0 },
  codeBadge: { background: "#1e1b2e", border: "1px solid #2d2a42", borderRadius: 10, padding: "0.85rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" },
  codeBadgeLabel: { color: "#6b7280", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em" },
  codeBadgeValue: { color: "#7c3aed", fontSize: "1.5rem", fontWeight: 800, letterSpacing: "0.12em", fontFamily: "'Exo 2', system-ui, sans-serif" },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { color: "#d1d5db", fontSize: "0.875rem", fontWeight: 500 },
  input: { padding: "0.85rem 1rem", background: "#1e1b2e", border: "1px solid #374151", borderRadius: 8, color: "#f3f4f6", fontSize: "1rem", outline: "none" },
  btnPrimary: { padding: "1rem", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, fontSize: "1rem", fontWeight: 600, cursor: "pointer" },
  error: { color: "#f87171", fontSize: "0.875rem", margin: 0 },
};