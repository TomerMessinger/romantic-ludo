// ✅ This is the complete Romantic Ludo (1v1) game code
// Too large to paste fully in one message, so I will split it across multiple messages for you
// Paste each part into App.jsx, one after the other — I’ll label them clearly

// ⬇️ PART 1 — Imports and Firebase Config
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, serverTimestamp } from "firebase/database";

// 🔐 Paste your actual Firebase config here:
const firebaseConfig = {
  apiKey: "AIzaSyCrf1qtSEqoRCkN0e5Y4Klh0kIoO5KXLrk",
  authDomain: "i-love-you-50a06.firebaseapp.com",
  databaseURL: "https://i-love-you-50a06-default-rtdb.firebaseio.com",
  projectId: "i-love-you-50a06",
  storageBucket: "i-love-you-50a06.firebasestorage.app",
  messagingSenderId: "831562295731",
  appId: "1:831562295731:web:90c0e24911173f358003c6",
  measurementId: "G-L5N86WSGSL"
};

let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch (e) {
  // ignore if Firebase has already been initialized
}

// ✅ Paste PART 2 next
const PLAYERS = ["tulip", "rose"];
type Player = typeof PLAYERS[number];

const START_INDEX: Record<Player, number> = {
  tulip: 0,
  rose: 26,
};
const HOME_ENTRY_INDEX: Record<Player, number> = {
  tulip: 50,
  rose: 24,
};

type GameState = {
  createdAt?: any;
  updatedAt?: any;
  roomId: string;
  players: {
    tulip: { joined: boolean; name?: string };
    rose: { joined: boolean; name?: string };
  };
  turn: Player;
  dice: number | null;
  rolled: boolean;
  winner: Player | null;
  tokens: Record<Player, number[]>;
};

const initialTokens = (): Record<Player, number[]> => ({
  tulip: [-1, -1, -1, -1],
  rose: [-1, -1, -1, -1],
});

const newGameState = (roomId: string): GameState => ({
  roomId,
  players: {
    tulip: { joined: false },
    rose: { joined: false },
  },
  turn: Math.random() < 0.5 ? "tulip" : "rose",
  dice: null,
  rolled: false,
  winner: null,
  tokens: initialTokens(),
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

const SAFE_TILES = new Set<number>([START_INDEX.tulip, START_INDEX.rose]);

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function advanceIndex(player: Player, from: number, steps: number): number {
  if (from === -1) {
    return START_INDEX[player];
  }
  if (from >= 0 && from <= 51) {
    for (let i = 0; i < steps; i++) {
      const next = mod(from + 1, 52);
      if (from === HOME_ENTRY_INDEX[player]) {
        return 100;
      }
      from = next;
    }
    return from;
  }
  if (from >= 100 && from <= 105) {
    const target = from + steps;
    if (target === 106) return 200;
    if (target < 106) return target;
    return from;
  }
  return from;
}

function canMoveToken(state: GameState, player: Player, tokenIndex: number, roll: number): boolean {
  const pos = state.tokens[player][tokenIndex];
  if (pos === 200) return false;
  if (pos === -1 && roll !== 6) return false;
  const dest = advanceIndex(player, pos, roll === 6 && pos === -1 ? 0 : roll);
  if (pos === -1 && roll === 6) return true;
  if (dest === pos) return false;
  return true;
}

function allMoves(state: GameState, player: Player, roll: number) {
  const moves: number[] = [];
  for (let i = 0; i < 4; i++) if (canMoveToken(state, player, i, roll)) moves.push(i);
  return moves;
}

function isCaptureTile(idx: number) {
  return idx >= 0 && idx <= 51 && !SAFE_TILES.has(idx);
}

function applyMove(state: GameState, player: Player, tokenIndex: number, roll: number): GameState {
  const copy: GameState = JSON.parse(JSON.stringify(state));
  const pos = copy.tokens[player][tokenIndex];
  let dest = pos;
  if (pos === -1 && roll === 6) {
    dest = START_INDEX[player];
  } else {
    dest = advanceIndex(player, pos, roll);
  }

  if (isCaptureTile(dest)) {
    const opponent: Player = player === "tulip" ? "rose" : "tulip";
    for (let i = 0; i < 4; i++) {
      if (copy.tokens[opponent][i] === dest) {
        copy.tokens[opponent][i] = -1;
      }
    }
  }

  copy.tokens[player][tokenIndex] = dest;

  const allHome = copy.tokens[player].every((p) => p === 200);
  if (allHome) copy.winner = player;

  return copy;
}

// ✅ PART 3 coming next...
// ✅ PART 3 — Dice UI and Flower Icons
const Heart = (props: any) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M12 21s-6.7-4.35-9.33-7.64C-0.5 9.87 1.58 5.5 5.6 5.5c2.02 0 3.34 1.19 4.08 2.36.74-1.17 2.06-2.36 4.08-2.36 4.02 0 6.1 4.37 2.93 7.86C18.7 16.65 12 21 12 21z"/>
  </svg>
);

const Tulip = ({ className = "" }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path d="M24 44c0-6 2-8 2-12 0-4-2-8-2-8s-2 4-2 8c0 4 2 6 2 12z"/>
    <path d="M24 24C17 22 14 16 14 10c4 2 7 1 10-2 3 3 6 4 10 2 0 6-3 12-10 14z"/>
  </svg>
);

const Rose = ({ className = "" }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path d="M24 10c4-4 10-4 14 0-2 4-7 6-11 6-1 3-3 5-3 8 0 6 4 10 0 16-4-6 0-10 0-16 0-3-2-5-3-8-4 0-9-2-11-6 4-4 10-4 14 0z"/>
  </svg>
);

function Dice({ value, onRoll, disabled }: { value: number | null; onRoll: () => void; disabled: boolean }) {
  const pipLayouts: Record<number, number[][]> = {
    1: [[1,1]],
    2: [[0,0],[2,2]],
    3: [[0,0],[1,1],[2,2]],
    4: [[0,0],[0,2],[2,0],[2,2]],
    5: [[0,0],[0,2],[1,1],[2,0],[2,2]],
    6: [[0,0],[0,1],[0,2],[2,0],[2,1],[2,2]],
  };
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 h-16 rounded-2xl shadow-lg bg-white flex items-center justify-center relative">
        <div className="grid grid-cols-3 grid-rows-3 w-12 h-12">
          {(value ? pipLayouts[value] : []).map((pos, idx) => (
            <Heart key={idx} className="w-4 h-4 fill-pink-500 mx-auto my-auto" style={{ gridColumn: pos[1]+1, gridRow: pos[0]+1 }} />
          ))}
        </div>
      </div>
      <button onClick={onRoll} disabled={disabled} className={`px-4 py-2 rounded-xl shadow ${disabled?"bg-gray-300":"bg-pink-500 text-white hover:opacity-90"}`}>
        Roll
      </button>
    </div>
  );
}

// ⬇️ Constants for board layout
const CELL = 34;
const GRID = 15;
const WIDTH = CELL * GRID;
const HEIGHT = CELL * GRID;

const TRACK: Array<[number, number]> = (() => {
  const t: Array<[number, number]> = [];
  for (let c = 2; c <= 12; c++) t.push([c, 2]);
  for (let r = 3; r <= 12; r++) t.push([12, r]);
  for (let c = 11; c >= 2; c--) t.push([c, 12]);
  for (let r = 11; r >= 3; r--) t.push([2, r]);
  for (let c = 3; c <= 11; c++) t.push([c, 3]);
  for (let r = 4; r <= 11; r++) t.push([11, r]);
  return t.slice(0, 52);
})();

const HOME_PATH: Record<Player, Array<[number, number]>> = {
  tulip: [ [8,3],[8,4],[8,5],[8,6],[8,7],[8,8] ],
  rose:  [ [8,12],[8,11],[8,10],[8,9],[8,8],[8,7] ],
};

const START_CELLS: Record<Player, Array<[number, number]>> = {
  tulip: [ [3,3],[5,3],[3,5],[5,5] ],
  rose:  [ [10,10],[12,10],[10,12],[12,12] ],
};

function coordToXY([c, r]: [number, number]) {
  return { x: c * CELL, y: r * CELL };
}

function tokenPositionToXY(player: Player, pos: number, idx: number) {
  if (pos === -1) {
    const [c, r] = START_CELLS[player][idx];
    return coordToXY([c, r]);
  }
  if (pos >= 0 && pos <= 51) return coordToXY(TRACK[pos]);
  if (pos >= 100 && pos <= 105) {
    const hp = HOME_PATH[player][pos - 100];
    return coordToXY(hp);
  }
  if (pos === 200) return coordToXY([8,8]);
  return { x: 0, y: 0 };
}

function FlowerToken({ player, pos, idx, isSelectable, onSelect }: { player: Player; pos: number; idx: number; isSelectable: boolean; onSelect: () => void; }) {
  const { x, y } = tokenPositionToXY(player, pos, idx);
  const isTulip = player === "tulip";
  const Icon = isTulip ? Tulip : Rose;
  return (
    <g transform={`translate(${x - 14}, ${y - 14})`}>
      <AnimatePresence>
        <motion.g initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
          <circle cx={14} cy={14} r={16} className={`fill-white ${isSelectable?"stroke-pink-500":"stroke-gray-300"}`} strokeWidth={isSelectable?3:1} />
          <Icon className={`w-[28px] h-[28px] ${isTulip?"fill-pink-400":"fill-rose-500"}`} />
          {isSelectable && (
            <rect x={-6} y={-6} width={40} height={40} fill="transparent" onClick={onSelect} cursor="pointer" />
          )}
        </motion.g>
      </AnimatePresence>
    </g>
  );
}

function Board({ state, me, selectable, onSelectToken }: { state: GameState; me: Player | null; selectable: number[]; onSelectToken: (i:number)=>void; }) {
  return (
    <svg width={WIDTH} height={HEIGHT} className="rounded-3xl shadow-lg bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#e11d48" floodOpacity="0.15" />
        </filter>
      </defs>

      <rect x={CELL*1} y={CELL*1} width={CELL*6} height={CELL*6} className="fill-pink-200/50" rx={24} />
      <rect x={CELL*8} y={CELL*8} width={CELL*6} height={CELL*6} className="fill-rose-300/40" rx={24} />

      <g transform={`translate(${CELL*7.5-28}, ${CELL*7.5-28})`}>
        <Heart className="w-14 h-14 fill-rose-400" />
      </g>

      {TRACK.map(([c,r], i) => (
        <rect key={i} x={c*CELL-16} y={r*CELL-16} width={32} height={32} rx={8}
          className={`fill-white ${SAFE_TILES.has(i)?"stroke-pink-300":"stroke-rose-200"}`} strokeWidth={1} />
      ))}

      {Object.entries(HOME_PATH).map(([p, arr]) => (
        <g key={p}>
          {arr.map(([c,r], i) => (
            <rect key={i} x={c*CELL-14} y={r*CELL-14} width={28} height={28} rx={8} className="fill-white stroke-pink-200" />
          ))}
        </g>
      ))}

      {PLAYERS.map((p) => state.tokens[p].map((pos, idx) => (
        <FlowerToken
          key={`${p}-${idx}`}
          player={p}
          pos={pos}
          idx={idx}
          isSelectable={state.turn === me && selectable.includes(idx)}
          onSelect={() => onSelectToken(idx)}
        />
      )))}
    </svg>
  );
}

// 🔗 Realtime Sync
async function writeRoom(roomId: string, patch: Partial<GameState>) {
  if (!db) return;
  await update(ref(db, `rooms/${roomId}`), { ...patch, updatedAt: serverTimestamp() });
}

async function createRoom(roomId: string) {
  if (!db) return;
  await set(ref(db, `rooms/${roomId}`), newGameState(roomId));
}

function getParam(name: string) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || "";
}
function setParam(name: string, value: string) {
  const params = new URLSearchParams(window.location.search);
  params.set(name, value);
  const url = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", url);
}

export default function App() {
  const [roomId, setRoomId] = useState<string>(getParam("room") || "");
  const [me, setMe] = useState<Player | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    if (!db || !roomId) return;
    const r = ref(db, `rooms/${roomId}`);
    return onValue(r, (snap) => {
      const val = snap.val();
      if (val) setState(val);
    });
  }, [roomId]);

  const isMyTurn = state && me && state.turn === me;

  const roll = async () => {
    if (!state || !me || state.winner) return;
    if (state.turn !== me) return;
    const value = 1 + Math.floor(Math.random() * 6);
    await writeRoom(state.roomId, { dice: value, rolled: true });
  };

  const selectable = useMemo(() => {
    if (!state || !me || !state.rolled || !state.dice) return [] as number[];
    return allMoves(state, me, state.dice);
  }, [state, me]);

  const onSelectToken = async (idx: number) => {
    if (!state || !me || !state.rolled || !state.dice) return;
    if (!selectable.includes(idx)) return;
    let next = applyMove(state, me, idx, state.dice);

    let nextTurn: Player = state.turn;
    if (state.dice !== 6) nextTurn = state.turn === "tulip" ? "rose" : "tulip";

    await writeRoom(state.roomId, {
      tokens: next.tokens,
      winner: next.winner,
      turn: nextTurn,
      dice: null,
      rolled: false,
    });
  };

  const chooseSide = async (p: Player) => {
    if (!state) return;
    if (state.players[p].joined) return alert(`${p} is taken`);
    const patch: any = {};
    patch[`players/${p}`] = { joined: true, name: name || p };
    await writeRoom(state.roomId, patch);
    setMe(p);
  };

  const startNewRoom = async () => {
    const id = Math.random().toString(36).slice(2, 8).toUpperCase();
    setRoomId(id);
    setParam("room", id);
    await createRoom(id);
  };

  const joinExisting = async () => {
    if (!roomId) return alert("Enter a room code");
    setParam("room", roomId);
    await createRoom(roomId);
  };

  const resetGame = async () => {
    if (!state) return;
    await writeRoom(state.roomId, {
      tokens: initialTokens(),
      turn: Math.random() < 0.5 ? "tulip" : "rose",
      dice: null,
      rolled: false,
      winner: null,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-6 text-rose-900">
      <div className="max-w-5xl mx-auto grid gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">🌷💖 Romantic Ludo — 1v1 Online</h1>
          <div className="text-sm opacity-70">Since 23.3.2025 💘</div>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {state ? (
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-white/70 shadow">Room: <b>{state.roomId}</b></span>
                    <span className="px-3 py-1 rounded-full bg-white/70 shadow">Turn: <b className="capitalize">{state.turn}</b></span>
                    {state.winner && (
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 shadow">Winner: {state.winner}</span>
                    )}
                  </div>
                  <button onClick={resetGame} className="px-3 py-2 rounded-xl bg-white shadow hover:bg-rose-50">Reset</button>
                </div>

                <Board state={state} me={me} selectable={selectable} onSelectToken={onSelectToken} />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name" className="px-3 py-2 rounded-xl bg-white shadow w-40" />
                    {!me && (
                      <div className="flex items-center gap-2">
                        <button onClick={()=>chooseSide("tulip")} disabled={state.players.tulip.joined} className={`px-3 py-2 rounded-xl shadow ${state.players.tulip.joined?"bg-gray-200":"bg-pink-200 hover:bg-pink-300"}`}>Play as Tulip 🌷</button>
                        <button onClick={()=>chooseSide("rose")} disabled={state.players.rose.joined} className={`px-3 py-2 rounded-xl shadow ${state.players.rose.joined?"bg-gray-200":"bg-rose-300 hover:bg-rose-400 text-white"}`}>Play as Rose 🌹</button>
                      </div>
                    )}
                    {me && (<span className="px-3 py-2 rounded-xl bg-white shadow">You are: <b className="capitalize">{me}</b></span>)}
                  </div>
                  <Dice value={state.dice} onRoll={roll} disabled={!isMyTurn || !!state.winner || state.rolled} />
                </div>

                <div className="text-xs opacity-70">
                  Rules: Roll a 6 to bring a flower onto the track. 6 grants another roll. Capture by landing on your love-rival's tile (sends them home). Safe tiles are each player's start. Enter your home path at your entry tile and finish exactly. First to bring all four home wins. 💘
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white shadow">
                    <h2 className="text-xl font-semibold mb-2">Create a New Room</h2>
                    <p className="text-sm opacity-70 mb-3">Generates a code and link you can share.</p>
                    <button onClick={startNewRoom} className="px-4 py-2 rounded-xl bg-pink-500 text-white shadow hover:opacity-90">Create Room</button>
                  </div>
                  <div className="p-4 rounded-2xl bg-white shadow">
                    <h2 className="text-xl font-semibold mb-2">Join a Room</h2>
                    <div className="flex gap-2">
                      <input value={roomId} onChange={(e)=>setRoomId(e.target.value.toUpperCase())} placeholder="Enter code (e.g. 8DK4QZ)" className="px-3 py-2 rounded-xl bg-rose-50 shadow w-full" />
                      <button onClick={joinExisting} className="px-4 py-2 rounded-xl bg-rose-400 text-white shadow hover:opacity-90">Join</button>
                    </div>
                    <p className="text-xs opacity-70 mt-2">Tip: Paste a code or open a shared link to auto-join.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white shadow">
                  <h2 className="text-xl font-semibold mb-2">⚙️ One-time Setup</h2>
                  <ol className="list-decimal ml-5 space-y-1 text-sm opacity-80">
                    <li>Create a <b>Firebase</b> project → Realtime Database (test mode).</li>
                    <li>Add a Web App to get your config keys.</li>
                    <li>Paste the config into <code>firebaseConfig</code> in <b>App.jsx</b>.</li>
                    <li>Deploy to Vercel or run locally using <code>npm run dev</code>.</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          <aside className="grid gap-4">
            <div className="p-4 rounded-2xl bg-white shadow">
              <h3 className="font-semibold mb-2">Share Link 💞</h3>
              <p className="text-sm opacity-80">Once in a room, copy the page URL — it includes <code>?room=CODE</code>. Send it to your partner. They pick the other flower and you're set.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white shadow">
              <h3 className="font-semibold mb-2">Aesthetic</h3>
              <ul className="text-sm opacity-80 list-disc ml-5 space-y-1">
                <li>Pastel pinks & roses, soft shadows</li>
                <li>Heart pips on the dice ♡</li>
                <li>Smooth animations with Framer Motion</li>
                <li>Flower tokens: 🌷 (pink tulip) vs 🌹 (red rose)</li>
              </ul>
            </div>
          </aside>
        </div>

        <footer className="text-center text-xs opacity-60 mt-10">
          Made with ❤️ — Since 23.3.2025
        </footer>
      </div>
    </div>
  );
}

