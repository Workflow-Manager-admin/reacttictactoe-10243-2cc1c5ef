import React, { useState, useEffect } from 'react';
import './App.css';

// THEME COLORS (custom)
// Primary: #1976D2, Accent: #FFC107, Secondary: #424242

const COLORS = {
  primary: '#1976D2',
  accent: '#FFC107',
  secondary: '#424242',
};

const BOARD_BG = 'var(--bg-secondary)';
const TILE_BG = '#fff';
const TILE_BORDER = '2px solid var(--border-color)';
const TILE_WIN = COLORS.primary;
const X_COLOR = COLORS.primary;
const O_COLOR = COLORS.accent;
const CURRENT_PLAYER_BG = '#e3f0fd';

// All possible win lines by indices
const WIN_PATTERNS = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]          // diags
];

// PUBLIC_INTERFACE
function App() {
  // State management
  const [theme, setTheme] = useState('light');
  const [board, setBoard] = useState(Array(9).fill(''));
  const [xIsNext, setXIsNext] = useState(true);
  const [winnerInfo, setWinnerInfo] = useState({ winner: '', line: [] });
  const [isDraw, setIsDraw] = useState(false);
  const [score, setScore] = useState({ X: 0, O: 0 });

  // Effect: Apply current theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Effect: Win/draw/score calculation
  useEffect(() => {
    for (const pattern of WIN_PATTERNS) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        if (!winnerInfo.winner) {
          setScore((s) => ({
            ...s,
            [board[a]]: s[board[a]] + 1,
          }));
        }
        setWinnerInfo({ winner: board[a], line: pattern });
        setIsDraw(false);
        return;
      }
    }
    if (!winnerInfo.winner) {
      // Draw: all filled, no winner
      if (board.every((x) => x)) {
        setIsDraw(true);
        setWinnerInfo({ winner: '', line: [] });
      }
    }
    // eslint-disable-next-line
    // (otherwise, useEffect infinite loop on setScore)
    // winnerInfo is a dep (update it after winner set, not before)
    // We want score only update once per winning
    // So that is handled above
    // end
    // eslint-enable-next-line
  // board is only dependency
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board]);

  // Reset just the board/game, keep scores (PUBLIC_INTERFACE)
  const handleRestart = () => {
    setBoard(Array(9).fill(''));
    setXIsNext(true);
    setWinnerInfo({ winner: '', line: [] });
    setIsDraw(false);
  };

  // Reset everything including scores (PUBLIC_INTERFACE)
  const handleFullReset = () => {
    setScore({ X: 0, O: 0 });
    handleRestart();
  };

  // Handle tile click (PUBLIC_INTERFACE)
  const handleTileClick = (i) => {
    if (board[i] || winnerInfo.winner) return;
    const nextBoard = board.slice();
    nextBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(nextBoard);
    setXIsNext(!xIsNext);
  };

  // Switch theme (PUBLIC_INTERFACE)
  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  // UI status below the title
  let status;
  if (winnerInfo.winner) {
    status = (
      <span>
        <span
          style={{
            color: winnerInfo.winner === 'X' ? X_COLOR : O_COLOR,
            fontWeight: 'bold',
            letterSpacing: '0.04em',
          }}
        >
          {winnerInfo.winner}
        </span>{' '}
        wins!
      </span>
    );
  } else if (isDraw) {
    status = <span>Draw! Nobody wins.</span>;
  } else {
    status = (
      <span>
        Next:{' '}
        <span
          style={{
            background: CURRENT_PLAYER_BG,
            color: xIsNext ? X_COLOR : O_COLOR,
            borderRadius: 4,
            padding: '2px 12px',
            fontWeight: 'bold',
            fontSize: '1rem',
          }}
        >
          {xIsNext ? 'X' : 'O'}
        </span>
      </span>
    );
  }

  // Render individual square (PUBLIC_INTERFACE)
  function Square({ value, onClick, highlight }) {
    return (
      <button
        className="ttt-square"
        style={{
          color: value === 'X' ? X_COLOR : value === 'O' ? O_COLOR : COLORS.secondary,
          background: highlight ? '#E3F2FD' : TILE_BG,
          border: highlight ? `2.5px solid ${TILE_WIN}` : TILE_BORDER,
          transition: 'all 0.15s cubic-bezier(.4,0,.2,1)',
          fontWeight: highlight ? '900' : '700',
        }}
        aria-label={value ? value : 'empty'}
        onClick={onClick}
        disabled={!!winnerInfo.winner || !!isDraw || !!value}
        tabIndex={0}
      >
        {value}
      </button>
    );
  }

  // Score component (PUBLIC_INTERFACE)
  function ScoreBoard() {
    return (
      <div
        style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          marginBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            padding: '7px 18px',
            borderRadius: 11,
            background: '#EFF6FC',
            color: X_COLOR,
            fontWeight: 700,
            fontSize: '1.06rem',
            minWidth: 54,
            textAlign: 'center',
            border: '2px solid ' + X_COLOR,
            letterSpacing: '.07em',
          }}
        >
          X: {score.X}
        </div>
        <div
          style={{
            padding: '7px 18px',
            borderRadius: 11,
            background: '#FFFBEA',
            color: O_COLOR,
            fontWeight: 700,
            fontSize: '1.06rem',
            minWidth: 54,
            textAlign: 'center',
            border: '2px solid ' + O_COLOR,
            letterSpacing: '.07em',
          }}
        >
          O: {score.O}
        </div>
      </div>
    );
  }

  // Controls panel (PUBLIC_INTERFACE)
  function Controls() {
    return (
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 2 }}>
        <button className="ttt-reset-btn" onClick={handleRestart} aria-label="Restart game (scores kept)">
          Restart Round
        </button>
        <button
          className="ttt-reset-btn"
          style={{
            borderColor: COLORS.accent,
            color: COLORS.secondary,
            background: '#FFF9EB',
          }}
          onClick={handleFullReset}
          aria-label="Reset all scores and game"
        >
          Reset All
        </button>
        <button
          className="theme-toggle"
          style={{ position: 'static', marginLeft: 6, padding: '7px 16px', borderRadius: 8, background: COLORS.primary, color: '#fff', fontSize: 13.7, border: 'none', boxShadow: 'none' }}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>
    );
  }

  // Main layout: centered, responsive
  return (
    <div
      className="App"
      style={{
        background: 'var(--bg-primary)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <main className="ttt-main-container">
        {/* Title */}
        <h1
          className="ttt-title"
          style={{
            color: X_COLOR,
            marginBottom: 7,
            marginTop: 0,
            fontWeight: 'bold',
            fontSize: '2.03rem',
            letterSpacing: '1px',
            textAlign: 'center',
          }}
        >
          Tic&nbsp;Tac&nbsp;Toe
        </h1>
        {/* Status and score */}
        <div style={{ marginBottom: 6, minHeight: 29, fontSize: '1.07rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span className="ttt-status" style={{ fontWeight: 500, minWidth: 94 }}>{status}</span>
        </div>
        <ScoreBoard />
        <Controls />
        {/* Game board */}
        <div
          className="ttt-board"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            background: BOARD_BG,
            borderRadius: '14px',
            padding: '18px',
            boxShadow: '0 4px 24px rgba(25, 118, 210, 0.08)',
            maxWidth: 380,
            margin: '0 auto 20px auto',
          }}
        >
          {board.map((value, i) => (
            <Square key={i} value={value} onClick={() => handleTileClick(i)} highlight={winnerInfo.line.includes(i)} />
          ))}
        </div>
        {/* Description footer */}
        <div className="ttt-footer" style={{ fontSize: '0.97rem', textAlign: 'center', color: 'var(--border-color)', marginTop: 18, letterSpacing: '.01em', opacity: 0.87 }}>
          <span>Player vs Player mode</span> &bull; <span>Modern, minimal UI</span>
        </div>
      </main>
    </div>
  );
}

export default App;
