// Romantic Ludo (1v1) – JavaScript-only refined version
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, serverTimestamp } from "firebase/database";
import "./style.css";

const firebaseConfig = {
  apiKey: "AIzaSyCrf1qtSEqoRCkN0e5Y4Klh0kIoO5KXLrk",
  authDomain: "i-love-you-50a06.firebaseapp.com",
  databaseURL: "https://i-love-you-50a06-default-rtdb.firebaseio.com",
  projectId: "i-love-you-50a06",
  storageBucket: "i-love-you-50a06.appspot.com",
  messagingSenderId: "831562295731",
  appId: "1:831562295731:web:90c0e24911173f358003c6",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const PLAYERS = ["tulip", "rose"];
const START_INDEX = { tulip: 0, rose: 13 };
const HOME_ENTRY_INDEX = { tulip: 50, rose: 24 };
const COLORS = { tulip: "#FFC0CB", rose: "#FF5E78" };
const EMOJIS = { tulip: "🌷", rose: "🌹" };
const HEART = "❤️";

function generateBoard() {
  return Array(52).fill(null);
}

export default function App() {
  const [player, setPlayer] = useState(null);
  const [dice, setDice] = useState(1);
  const [positions, setPositions] = useState({ tulip: 0, rose: 0 });
  const [turn, setTurn] = useState("tulip");

  const isMyTurn = player === turn;

  useEffect(() => {
    const posRef = ref(db, "positions");
    const turnRef = ref(db, "turn");

    onValue(posRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setPositions(data);
    });

    onValue(turnRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setTurn(data);
    });
  }, []);

  function rollDice() {
    if (!isMyTurn) return;
    const result = Math.floor(Math.random() * 6) + 1;
    setDice(result);
  }

  function move() {
    if (!isMyTurn) return;
    const newPos = (positions[player] + dice) % 52;
    const updated = { ...positions, [player]: newPos };
    set(ref(db, "positions"), updated);
    set(ref(db, "turn"), player === "tulip" ? "rose" : "tulip");
  }

  const board = useMemo(() => generateBoard(), []);

  return (
    <div className="game">
      <h1>Romantic Ludo 🌷🌹</h1>
      <h2>Since 23.03.2025 💘</h2>

      {!player && (
        <div className="choose-player">
          <button onClick={() => setPlayer("tulip")}>Play as 🌷 Tulip</button>
          <button onClick={() => setPlayer("rose")}>Play as 🌹 Rose</button>
        </div>
      )}

      {player && (
        <>
          <div className="board">
            {board.map((_, i) => (
              <div key={i} className="tile">
                {Object.entries(positions).map(([p, pos]) =>
                  pos === i ? (
                    <motion.div
                      key={p}
                      className="piece"
                      style={{ backgroundColor: COLORS[p] }}
                    >
                      {EMOJIS[p]}
                    </motion.div>
                  ) : null
                )}
              </div>
            ))}
          </div>

          <div className="dice-area">
            <div className="dice" onClick={rollDice}>
              {Array.from({ length: dice }).map((_, i) => (
                <span key={i}>{HEART}</span>
              ))}
            </div>
            {isMyTurn && (
              <button className="move-btn" onClick={move}>
                Move {EMOJIS[player]}
              </button>
            )}
            {!isMyTurn && <p>Waiting for your lover's turn... 💕</p>}
          </div>
        </>
      )}

      <footer>
        💖 Made for 23.03.2025 — Tulip & Rose forever.
      </footer>
    </div>
  );
}
