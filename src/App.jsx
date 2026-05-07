import { useState, useEffect } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import Host from "./pages/Host";
import Join from "./pages/Join";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Vote from "./pages/Vote";
import Results from "./pages/Results";
import LanguageSwitcher from "./components/LanguageSwitcher";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isHost, setIsHost] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (path === "/about") { setScreen("about"); return; }
    if (path === "/privacy") { setScreen("privacy"); return; }
    if (path === "/contact") { setScreen("contact"); return; }
    if (code) { setIsHost(false); setScreen("join"); }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const nav = (s) => setScreen(s);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <LanguageSwitcher />
      {screen === "home" && (
        <Home
          onHost={() => { setIsHost(true); nav("host"); }}
          onJoin={() => { setIsHost(false); nav("join"); }}
        />
      )}
      {screen === "about" && <About />}
      {screen === "privacy" && <Privacy />}
      {screen === "contact" && <Contact />}
      {screen === "host" && (
        <Host
          playerName={playerName}
          setPlayerName={setPlayerName}
          setRoomCode={setRoomCode}
          onEnterLobby={() => nav("lobby")}
        />
      )}
      {screen === "join" && (
        <Join
          playerName={playerName}
          setPlayerName={setPlayerName}
          roomCode={roomCode}
          setRoomCode={setRoomCode}
          onEnterLobby={() => nav("lobby")}
        />
      )}
      {screen === "lobby" && (
        <Lobby
          roomCode={roomCode}
          playerName={playerName}
          isHost={isHost}
          onStartGame={() => nav("game")}
        />
      )}
      {screen === "game" && (
        <Game
          roomCode={roomCode}
          playerName={playerName}
          isHost={isHost}
          onEndGame={() => nav("home")}
          onVote={() => nav("vote")}
        />
      )}
      {screen === "vote" && (
        <Vote
          roomCode={roomCode}
          playerName={playerName}
          isHost={isHost}
          onResults={() => nav("results")}
        />
      )}
      {screen === "results" && (
        <Results
          roomCode={roomCode}
          playerName={playerName}
          isHost={isHost}
          onNewRound={() => nav("game")}
          onEndGame={() => nav("home")}
        />
      )}
    </div>
  );
}