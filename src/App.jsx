// 🎮 Romantic Ludo – Beautifully Redesigned for Tomer & Ivana 💘

import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { motion } from "framer-motion";
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

initializeApp(firebaseConfig);
const db = getDatabase();

const EMOJIS = { tulip: "🌷", rose: "🌹" };
const COLORS = { tulip: "#ffc6d0", rose: "#ff6f91" };

const TILE_COUNT = 28;

export default function App() {
  const [player, setPlayer] = useState(null);
  const [positions, setPositions] = useState({ tulip: 0, rose: 0 });
  const [turn, setTurn] = useState("tulip");
  const [dice, setDice] = useState(1);

  useEffect(() => {
    const posRef = ref(db, "positions");
    const turnRef = ref(db, "turn");

    onValue(posRef, (snap) => snap.exists() && setPositions(snap.val()));
    onValue(turnRef, (snap) => snap.exists() && setTurn(snap.val()));
  }, []);

  const isMyTurn = player === turn;

  function rollDice() {
    if (!isMyTurn) return;
    const result = Math.floor(Math.random() * 6) + 1;
    setDice(result);
  }

  function move() {
    if (!isMyTurn) return;
    const newPos = (positions[player] + dice) % TILE_COUNT;
    const updated = { ...positions, [player]: newPos };
    set(ref(db, "positions"), updated);
    set(ref(db, "turn"), player === "tulip" ? "rose" : "tulip");
  }

  return (
    <div className="container">
      <header>
        <h1>🌹 Tomer & Ivana's Ludo 🌷</h1>
        <p className="subtitle">Together since 23.03.2025 💘</p>
      </header>

      {!player ? (
        <div className="player-select">
          <button onClick={() => setPlayer("tulip")}>Play as 🌷 Tulip</button>
          <button onClick={() => setPlayer("rose")}>Play as 🌹 Rose</button>
        </div>
      ) : (
        <>
          <div className="board">
            {Array.from({ length: TILE_COUNT }).map((_, idx) => (
              <div className="tile" key={idx}>
                {positions.tulip === idx && (
                  <motion.div layout className="piece" style={{ backgroundColor: COLORS.tulip }}>
                    {EMOJIS.tulip}
                  </motion.div>
                )}
                {positions.rose === idx && (
                  <motion.div layout className="piece" style={{ backgroundColor: COLORS.rose }}>
                    {EMOJIS.rose}
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          <div className="controls">
            <div className="dice" onClick={rollDice}>
              {Array.from({ length: dice }).map((_, i) => (
                <span key={i}>❤️</span>
              ))}
            </div>
            <button className="move-btn" onClick={move} disabled={!isMyTurn}>
              Move {EMOJIS[player]}
            </button>
            <p className="turn-msg">
              {isMyTurn ? "Your turn 💞" : "Waiting for your love..."}
            </p>
          </div>
        </>
      )}

      <footer>
        <p>Made with love for Ivana ❤️ by Tomer</p>
      </footer>
    </div>
  );
}
