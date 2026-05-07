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
    maxWidth: 780,
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  title: {
    margin: 0,
    fontSize: "2.5rem",
    fontWeight: 800,
    color: "#f3f4f6",
  },
  subtitle: {
    margin: 0,
    color: "#a78bfa",
    fontSize: "1rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
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
  paragraph: {
    margin: 0,
    color: "#d1d5db",
    lineHeight: 1.8,
    fontSize: "1rem",
  },
  link: {
    color: "#a78bfa",
    textDecoration: "none",
    fontWeight: 600,
  },
};

export default function About() {
  return (
    <div style={pageStyles.screen}>
      <div style={pageStyles.container}>
        <p style={pageStyles.subtitle}>About Spy Game</p>
        <h1 style={pageStyles.title}>Social deduction game </h1>
        <div style={pageStyles.card}>
          <p style={pageStyles.paragraph}>
            Spy Game is a browser-based party game built around bluffing, careful
            questions, and reading the room. At the start of each round, most
            players receive the same secret location. One player is the spy and
            does not know where everyone else is supposed to be. From there, the
            group takes turns asking and answering questions that sound natural to
            people who know the location but vague enough that the spy cannot pick
            up the answer too easily. The tension comes from balancing subtlety
            and certainty: honest players need to prove they belong, while the spy
            needs to stay convincing long enough to identify the location or avoid
            suspicion.
          </p>
          <p style={pageStyles.paragraph}>
            The game works best because it is simple to start. One person creates
            a room, shares the room code, and everyone joins from their own device.
            There is nothing to install, no app store step, and no account setup.
            Spy Game runs directly in a modern browser, which makes it convenient
            for living rooms, classrooms, road trips, office breaks, and remote
            calls. It is designed to work on phones, tablets, laptops, and desktop
            computers, so players can mix devices without changing how the game is
            played. If you can open a link, you can join a round.
          </p>
          <p style={pageStyles.paragraph}>
            A typical session supports 3 to 12 players. Smaller groups create a
            tighter, more personal deduction game where every answer matters.
            Larger groups add chaos, misdirection, and more room for the spy to
            hide in plain sight. Each round is short enough to keep the pace moving,
            which makes the game easy to replay with new hosts, rotating spies, and
            different locations. Whether your group prefers quick rounds or a full
            evening of social play, the structure stays light and easy to learn.
          </p>
          <p style={pageStyles.paragraph}>
            Spy Game is free to play. The goal is to keep it accessible so a group
            can open the site and start immediately without subscriptions or locked
            core features. If you are introducing new players to social deduction
            games, it works as a gentle entry point because the rules are easy to
            explain. If your group already loves hidden-role games, it still holds
            up because strong players can push each other with sharper questions,
            smarter traps, and better reads. Every round creates its own little
            story of hesitation, confidence, and the moment someone realizes the
            spy has just said a little too much.
          </p>
          <p style={pageStyles.paragraph}>
            If you want to jump in, return to the home page, create a room, and let
            the questioning begin.
          </p>
          <a href="/" style={pageStyles.link}>Back to home</a>
        </div>
      </div>
    </div>
  );
}