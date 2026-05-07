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
    maxWidth: 820,
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  title: {
    margin: 0,
    fontSize: "2.5rem",
    fontWeight: 800,
  },
  meta: {
    margin: 0,
    color: "#9ca3af",
    fontSize: "0.95rem",
  },
  card: {
    background: "#1e1b2e",
    border: "1px solid #2d2a42",
    borderRadius: 16,
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    boxShadow: "0 20px 45px rgba(0, 0, 0, 0.25)",
  },
  heading: {
    margin: 0,
    color: "#f3f4f6",
    fontSize: "1.15rem",
    fontWeight: 700,
  },
  paragraph: {
    margin: 0,
    color: "#d1d5db",
    lineHeight: 1.75,
    fontSize: "1rem",
  },
  list: {
    margin: 0,
    paddingLeft: "1.25rem",
    color: "#d1d5db",
    lineHeight: 1.75,
  },
  link: {
    color: "#a78bfa",
    textDecoration: "none",
  },
};

export default function Privacy() {
  return (
    <div style={pageStyles.screen}>
      <div style={pageStyles.container}>
        <h1 style={pageStyles.title}>Privacy Policy</h1>
        <p style={pageStyles.meta}>Last updated: May 2026</p>
        <div style={pageStyles.card}>
          <section>
            <h2 style={pageStyles.heading}>Overview</h2>
            <p style={pageStyles.paragraph}>
              This Privacy Policy explains how Spy Game handles information when
              you use the website. Spy Game is designed to let groups start a game
              quickly without creating accounts or sharing unnecessary personal
              information.
            </p>
          </section>

          <section>
            <h2 style={pageStyles.heading}>Information collected during gameplay</h2>
            <p style={pageStyles.paragraph}>
              To run a multiplayer session, Spy Game temporarily stores room data
              and player names in Firebase while the game is active. This temporary
              data is used only to support live gameplay features such as joining a
              room, displaying players in the lobby, and progressing through rounds.
            </p>
            <ul style={pageStyles.list}>
              <li>Player names entered for the current session.</li>
              <li>Temporary room and game state needed for the match to function.</li>
              <li>No account registration is required to use the game.</li>
            </ul>
            <p style={pageStyles.paragraph}>
              Spy Game does not require users to submit full names, addresses,
              phone numbers, payment details, or other profile information to play.
              Personal data is not retained after the game ends beyond what is
              necessary for short-lived technical operation.
            </p>
          </section>

          <section>
            <h2 style={pageStyles.heading}>Advertising and cookies</h2>
            <p style={pageStyles.paragraph}>
              Spy Game may use Google AdSense to display advertisements. Google
              and its partners may use cookies or similar technologies to serve ads
              based on your visit to this site and other sites on the internet.
              These third-party cookies are managed by the advertising providers,
              not by Spy Game directly.
            </p>
          </section>

          <section>
            <h2 style={pageStyles.heading}>Analytics</h2>
            <p style={pageStyles.paragraph}>
              If Google Analytics or similar analytics tools are enabled, they may
              collect standard usage information such as pages viewed, browser type,
              device information, approximate location derived from IP address, and
              general interaction metrics. This information is used to understand
              site performance and improve the experience. Analytics data is not
              used to create gameplay accounts for users.
            </p>
          </section>

          <section>
            <h2 style={pageStyles.heading}>Data retention</h2>
            <p style={pageStyles.paragraph}>
              Gameplay data stored in Firebase is intended to be temporary and tied
              to the current game session. Player names and room data are not kept
              as a long-term personal profile after the session has ended.
            </p>
          </section>

          <section>
            <h2 style={pageStyles.heading}>Contact</h2>
            <p style={pageStyles.paragraph}>
              If you have privacy questions, contact
              {" "}
              <a href="mailto:contact@spygame.win" style={pageStyles.link}>
                contact@spygame.win
              </a>
              .
            </p>
          </section>

          <section>
            <h2 style={pageStyles.heading}>Policy changes</h2>
            <p style={pageStyles.paragraph}>
              This policy may be updated from time to time to reflect changes to
              the site, legal requirements, or third-party services. The date at
              the top of this page indicates the latest revision.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}