const pageStyles = {
  screen: {
    minHeight: "100vh",
    background: "#13111e",
    color: "#f3f4f6",
    padding: "3rem 1rem",
    display: "flex",
    justifyContent: "center",
  },
  container: {
    width: "100%",
    maxWidth: 680,
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  card: {
    background: "#1e1b2e",
    border: "1px solid #2d2a42",
    borderRadius: 16,
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    boxShadow: "0 20px 45px rgba(0, 0, 0, 0.25)",
  },
  title: {
    margin: 0,
    fontSize: "2.5rem",
    fontWeight: 800,
  },
  paragraph: {
    margin: 0,
    color: "#d1d5db",
    lineHeight: 1.75,
    fontSize: "1rem",
  },
  link: {
    color: "#a78bfa",
    textDecoration: "none",
    fontWeight: 600,
  },
};

export default function Contact() {
  return (
    <div style={pageStyles.screen}>
      <div style={pageStyles.container}>
        <h1 style={pageStyles.title}>Contact</h1>
        <div style={pageStyles.card}>
          <p style={pageStyles.paragraph}>
            Questions, support requests, bug reports, and general feedback are
            welcome. The fastest way to reach the project is by email:
            {" "}
            <a href="mailto:contact@spygame.win" style={pageStyles.link}>
              contact@spygame.win
            </a>
            .
          </p>
          <p style={pageStyles.paragraph}>
            If you want to support ongoing development, you can also visit the
            Patreon page:
            {" "}
            <a href="https://patreon.com/SpyGame" target="_blank" rel="noreferrer" style={pageStyles.link}>
              patreon.com/SpyGame
            </a>
            .
          </p>
          <p style={pageStyles.paragraph}>
            Clear reproduction steps, screenshots, device details, and browser
            information are especially helpful when reporting a bug.
          </p>
        </div>
      </div>
    </div>
  );
}