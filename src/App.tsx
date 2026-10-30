import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import type { Player, ScreenState } from './types/game';
import { GameEngine } from './game/GameEngine';
import { RegistrationModal } from './components/RegistrationModal';
import { GameOverModal } from './components/GameOverModal';
import { getLastPlayer } from './utils/storage';
import { soundManager } from './utils/audio';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>('REGISTER');
  const [player, setPlayer] = useState<Player | null>(null);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.isMuted());

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Initialize player from localStorage if present
  useEffect(() => {
    const saved = getLastPlayer();
    if (saved) {
      setPlayer(saved);
    }
  }, []);

  // Initialize Canvas Game Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, {
      onScoreUpdate: (score) => {
        setCurrentScore(score);
      },
      onGameOver: (finalScore) => {
        setCurrentScore(finalScore);
        setScreen('GAME_OVER');
      },
    });

    engineRef.current = engine;
    // Render initial static background and falcon
    engine.render();

    return () => {
      engine.stop();
    };
  }, []);

  // Keyboard controls for jumping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        if (screen === 'PLAYING') {
          e.preventDefault();
          engineRef.current?.flap();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen]);

  const handleStartGame = (chosenPlayer: Player) => {
    setPlayer(chosenPlayer);
    setScreen('PLAYING');
    setCurrentScore(0);
    // Slight tick to ensure modal has faded, then enter ready/waiting state
    setTimeout(() => {
      engineRef.current?.prepare();
    }, 50);
  };

  const handleCanvasClick = (e: React.PointerEvent) => {
    e.preventDefault();
    if (screen === 'PLAYING') {
      engineRef.current?.flap();
    }
  };

  const toggleSound = () => {
    const next = soundManager.toggleMute();
    setIsMuted(next);
  };

  return (
    <div className="arcade-app-container">
      {/* Top Arcade Marquee */}
      <header className="arcade-marquee">
        <div className="marquee-left">
          <span className="marquee-badge">🦅 KERMÉS 2026</span>
          <span className="marquee-loc">CERRO DE OAXACA</span>
        </div>

        {player && (
          <div className="marquee-player-pill" title="Jugador activo">
            <span className="pill-dot"></span>
            <span className="pill-name">{player.name}</span>
            <span className="pill-group">({player.group})</span>
          </div>
        )}

        <div className="marquee-right">
          <button
            type="button"
            className="sound-toggle-btn"
            onClick={toggleSound}
            aria-label="Silenciar sonido"
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </header>

      {/* Main Game Screen Viewport */}
      <main className="game-viewport">
        <div className="canvas-wrapper" onPointerDown={handleCanvasClick}>
          <canvas
            ref={canvasRef}
            width={400}
            height={640}
            className="game-canvas"
          />

          {/* Floating In-Game Tap Hint for mobile/touch */}
          {screen === 'PLAYING' && (
            <div className="touch-helper-layer">
              <span className="touch-hint">TOCA LA PANTALLA O ESPACIO PARA VOLAR</span>
            </div>
          )}
        </div>

        {/* Modal: Registration Screen */}
        {screen === 'REGISTER' && (
          <RegistrationModal
            onStartGame={handleStartGame}
          />
        )}

        {/* Modal: Game Over Screen with rewards */}
        {screen === 'GAME_OVER' && player && (
          <GameOverModal
            score={currentScore}
            player={player}
            onPlayAgain={() => {
              setScreen('PLAYING');
              engineRef.current?.prepare();
            }}
            onChangePlayer={() => setScreen('REGISTER')}
          />
        )}
      </main>

      {/* Retro Arcade Bottom Frame */}
      <footer className="arcade-footer">
        <div className="footer-credits">
          <span>Hecho para la Kermés • Esquiva los palitos • ¡Gana cupones de $5!</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
