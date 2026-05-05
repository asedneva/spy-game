import { useState } from "react";
import heroLogo from "../assets/hero.png";
import { useLanguage } from "../LanguageContext";

export default function Home({ onHost, onJoin }) {
  const [showJoin, setShowJoin] = useState(false);
  const [isPatreonHovered, setIsPatreonHovered] = useState(false);
  const [isEmailHovered, setIsEmailHovered] = useState(false);
  const { t } = useLanguage();

  return (
    <div style={styles.screen}>
      <div style={styles.container}>
        <div style={styles.hero}>
          <div style={styles.iconWrap}>
            <img src={heroLogo} alt={t("home.title")} style={styles.logo} />
          </div>
          <h1 style={styles.title}>{t("home.title")}</h1>
          <p style={styles.subtitle}>{t("home.subtitle")}</p>
        </div>

        <div style={styles.form}>
          {!showJoin ? (
            <>
              <button style={styles.btnPrimary} onClick={onHost}>
                <span style={styles.btnIcon}>+</span> {t("home.createGame")}
              </button>
              <button style={styles.btnOutline} onClick={() => setShowJoin(true)}>
                <span style={styles.btnIcon}>→</span> {t("home.joinGame")}
              </button>
            </>
          ) : (
            <div style={styles.card}>
              <p style={styles.cardTitle}>{t("home.joinCardTitle")}</p>
              <button style={styles.btnPrimary} onClick={onJoin}>{t("home.enterRoomCode")}</button>
              <button style={styles.btnGhost} onClick={() => setShowJoin(false)}>{t("common.cancel")}</button>
            </div>
          )}
        </div>

        <div style={styles.rules}>
          <p style={styles.rulesTitle}>{t("home.howToPlay")}</p>
          <ul style={styles.rulesList}>
            {[
              t("home.rule1"),
              t("home.rule2"),
              t("home.rule3"),
              t("home.rule4"),
              t("home.rule5"),
              t("home.rule6"),
            ].map((r, i) => <li key={i} style={styles.ruleItem}>• {r}</li>)}
          </ul>
          <p style={styles.rulesTitle}>{t("home.winConditions")}</p>
          <ul style={styles.rulesList}>
            <li style={styles.ruleItem}>• {t("home.winPlayers")}</li>
            <li style={styles.ruleItem}>• {t("home.winSpy")}</li>
          </ul>
        </div>

        <div style={styles.footer}>
          <a
            href="https://www.patreon.com/"
            target="_blank"
            style={{ ...styles.footerLink, textDecoration: isPatreonHovered ? "underline" : "none" }}
            onMouseEnter={() => setIsPatreonHovered(true)}
            onMouseLeave={() => setIsPatreonHovered(false)}
          >
            {t("home.patreon")}
          </a>
          <span style={styles.footerText}>·</span>
          <a
            href="mailto:contact@spygame.win"
            style={{ ...styles.footerLink, textDecoration: isEmailHovered ? "underline" : "none" }}
            onMouseEnter={() => setIsEmailHovered(true)}
            onMouseLeave={() => setIsEmailHovered(false)}
          >
            contact@spygame.win
          </a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  screen: { minHeight: "100vh", background: "#13111e", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" },
  container: { width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: "2rem" },
  hero: { textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" },
  iconWrap: { marginBottom: "0.25rem" },
  logo: { width: 116, height: 116, objectFit: "contain" },
  title: { fontSize: "4rem", fontWeight: 900, color: "#7c3aed", margin: 0, letterSpacing: "-1px", fontFamily: "system-ui, sans-serif" },
  subtitle: { color: "#9ca3af", fontSize: "1rem", margin: 0 },
  form: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  btnPrimary: { width: "100%", padding: "1rem", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, fontSize: "1.1rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  btnOutline: { width: "100%", padding: "1rem", background: "transparent", color: "#f3f4f6", border: "1.5px solid #374151", borderRadius: 10, fontSize: "1.1rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  btnGhost: { width: "100%", padding: "0.75rem", background: "transparent", color: "#6b7280", border: "none", borderRadius: 10, fontSize: "1rem", cursor: "pointer" },
  btnIcon: { fontSize: "1.2rem" },
  card: { background: "#1e1b2e", border: "1px solid #2d2a42", borderRadius: 12, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" },
  cardTitle: { color: "#f3f4f6", fontWeight: 600, fontSize: "1rem", margin: 0 },
  rules: { borderTop: "1px solid #1f1d30", paddingTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" },
  rulesTitle: { color: "#f3f4f6", fontWeight: 600, fontSize: "0.95rem", margin: 0 },
  rulesList: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.4rem" },
  ruleItem: { color: "#9ca3af", fontSize: "0.875rem", lineHeight: 1.5 },
  footer: { borderTop: "1px solid #1f1d30", paddingTop: "1rem", color: "#6b7280", fontSize: "0.8rem", textAlign: "center", display: "flex", justifyContent: "center", gap: "0.75rem", alignItems: "center" },
  footerText: { color: "#6b7280", fontSize: "0.8rem" },
  footerLink: { color: "#a78bfa", textDecoration: "none" },
};