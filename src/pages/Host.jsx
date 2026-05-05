import { useState } from "react";
import { ref, set } from "firebase/database";
import { db } from "../firebase";
import { generateRoomCode, playerColor } from "../gameUtils";
import { useLanguage } from "../LanguageContext";

export default function Host({ playerName, setPlayerName, setRoomCode, onEnterLobby }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();

  const handleCreate = async () => {
    if (!playerName.trim()) { setError(t("host.enterNameFirst")); return; }
    setLoading(true);
    setError("");
    const code = generateRoomCode();
    const name = playerName.trim();
    try {
      await set(ref(db, `rooms/${code}`), {
        host: name,
        status: "waiting",
        usedLocations: [],
        players: {
          [name]: { color: playerColor(0), isHost: true }
        },
      });
      setRoomCode(code);
      onEnterLobby();
    } catch (e) {
      setError(t("host.createFailed"));
    }
    setLoading(false);
  };

  return (
    <div style={styles.screen}>
      <div style={styles.container}>
        <h2 style={styles.heading}>{t("host.title")}</h2>
        <p style={styles.sub}>{t("host.subtitle")}</p>

        <div style={styles.field}>
          <label style={styles.label}>{t("home.yourName")}</label>
          <input
            style={styles.input}
            placeholder={t("home.enterName")}
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
          />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1 }} onClick={handleCreate} disabled={loading}>
          {loading ? t("common.creating") : t("host.createRoom")}
        </button>
      </div>
    </div>
  );
}

const styles = {
  screen: { minHeight: "100vh", background: "#13111e", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" },
  container: { width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: "1.25rem" },
  heading: { color: "#f3f4f6", fontSize: "1.75rem", fontWeight: 700, margin: 0 },
  sub: { color: "#9ca3af", fontSize: "0.9rem", margin: 0 },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { color: "#d1d5db", fontSize: "0.875rem", fontWeight: 500 },
  input: { padding: "0.85rem 1rem", background: "#1e1b2e", border: "1px solid #374151", borderRadius: 8, color: "#f3f4f6", fontSize: "1rem", outline: "none" },
  btnPrimary: { padding: "1rem", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, fontSize: "1rem", fontWeight: 600, cursor: "pointer" },
  error: { color: "#f87171", fontSize: "0.875rem", margin: 0 },
};