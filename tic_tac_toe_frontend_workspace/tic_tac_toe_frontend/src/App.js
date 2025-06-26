import React, { useState, useEffect } from 'react';
import './App.css';

// Color/theme overrides
const BOARD_BG = 'var(--bg-secondary)';
const TILE_BG = '#fff';
const TILE_BORDER = '2px solid var(--border-color)';
const TILE_WIN = '#1976D2';
const X_COLOR = '#1976D2'; // primary
const O_COLOR = '#FFC107'; // accent
const CURRENT_PLAYER_BG = '#e3f0fd'; // light blue tint

// Utility - all possible win lines
const WIN_PATTERNS = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]          // diags
];

// PUBLIC_INTERFACE
function App() {
  // Board is 9 squares (0-8). '' = empty. 'X' or 'O'
  const [board, setBoard] = useState(Array(9).fill(''));
  const [xIsNext, setXIsNext] = useState(true);
  const [winnerInfo, setWinnerInfo] = useState({ winner: '', line: [] });
  const [isDraw, setIsDraw] = useState(false);

  // Reset game (PUBLIC_INTERFACE)
  const handleRestart = () => {
    setBoard(Array(9).fill(''));
    setXIsNext(true);
    setWinnerInfo({ winner: '', line: [] });
    setIsDraw(false);
  };

  // On click tile (PUBLIC_INTERFACE)
  const handleTileClick = i => {
    if (board[i] || winnerInfo.winner) return;
    const nextBoard = board.slice();
    nextBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(nextBoard);
    setXIsNext(!xIsNext);
  };

  // Win/draw calculation effect
  useEffect(() => {
    // Check winner
    for (const pattern of WIN_PATTERNS) {
      const [a,b,c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinnerInfo({ winner: board[a], line: pattern });
        setIsDraw(false);
        return;
      }
    }
    // Draw: All filled, no winner
    if (board.every(x => x)) {
      setIsDraw(true);
      setWinnerInfo({ winner: '', line: [] });
    }
  }, [board]);

  // UI - status
  let status;
  if (winnerInfo.winner) {
    status = (
      <span>
        <span style={{color: winnerInfo.winner === 'X' ? X_COLOR : O_COLOR,fontWeight:'bold'}}>{winnerInfo.winner}</span> wins!
      </span>
    );
  } else if (isDraw) {
    status = <span>Draw! Nobody wins.</span>;
  } else {
    status = (
      <span>
        Next: <span style={{
          background: CURRENT_PLAYER_BG,
          color: xIsNext ? X_COLOR : O_COLOR,
          borderRadius: 4,
          padding: '2px 12px',
          fontWeight:'bold',
          fontSize:'1rem'
        }}>{xIsNext ? 'X' : 'O'}</span>
      </span>
    );
  }

  // Render a single square (PUBLIC_INTERFACE)
  function Square({value, onClick, highlight}) {
    return (
      <button
        className="ttt-square"
        style={{
          color: value === 'X' ? X_COLOR : O_COLOR,
          background: highlight ? '#E3F2FD' : TILE_BG,
          border: highlight ? `2.5px solid ${TILE_WIN}` : TILE_BORDER,
          transition: 'all 0.15s cubic-bezier(.4,0,.2,1)',
          fontWeight: highlight ? '900' : '700'
        }}
        aria-label={value ? value : "empty"}
        onClick={onClick}
        disabled={!!winnerInfo.winner || !!isDraw || !!value}
      >
        {value}
      </button>
    );
  }

  // Layout: Centered, responsive board
  return (
    <div className="App" style={{background: 'var(--bg-primary)', minHeight: '100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div className="ttt-main-container">
        {/* Title */}
        <h1 className="ttt-title" style={{color:X_COLOR, marginBottom:12, marginTop:0, fontWeight:'bold',fontSize:'2rem', letterSpacing: '1px', textAlign:'center'}}>Tic&nbsp;Tac&nbsp;Toe</h1>
        {/* Status and reset */}
        <div style={{marginBottom:16, display:'flex',gap:12,alignItems:'center', justifyContent:'center', flexWrap:'wrap'}}>
          <div className="ttt-status" style={{fontSize:'1.15rem',minWidth:96, textAlign:'center'}}>{status}</div>
          <button className="ttt-reset-btn" onClick={handleRestart} aria-label="Restart game">
            Restart
          </button>
        </div>
        {/* Game Board */}
        <div className="ttt-board" style={{
          display:'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          background: BOARD_BG,
          borderRadius: '14px',
          padding: '18px',
          boxShadow:'0 4px 24px rgba(25, 118, 210, 0.08)',
          maxWidth: 380,
          margin:'0 auto 20px auto',
        }}>
          {board.map((value, i) =>
            <Square
              key={i}
              value={value}
              onClick={() => handleTileClick(i)}
              highlight={winnerInfo.line.includes(i)}
            />)}
        </div>
        {/* Simple footer */}
        <div className="ttt-footer" style={{fontSize:'0.95rem',textAlign:'center',color:'var(--border-color)'}}>
          <span>Player vs Player mode</span> &bull; <span>Modern, minimal UI</span>
        </div>
      </div>
    </div>
  );
}

export default App;
