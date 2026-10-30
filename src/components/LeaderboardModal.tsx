import React, { useState, useEffect } from 'react';
import type { LeaderboardEntry } from '../types/game';
import { getLeaderboard, clearLeaderboard } from '../utils/storage';
import { soundManager } from '../utils/audio';

interface LeaderboardModalProps {
  onClose: () => void;
  onPlayAgain: () => void;
  currentPlayerName?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  onClose,
  onPlayAgain,
  currentPlayerName,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setEntries(getLeaderboard());
  }, []);

  const filtered = entries.filter((item) => {
    const q = search.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.group.toLowerCase().includes(q);
  });

  const handleReset = () => {
    if (confirm('¿Seguro que deseas reiniciar la tabla de posiciones de la kermés?')) {
      clearLeaderboard();
      setEntries([]);
    }
  };

  return (
    <div className="pixel-overlay">
      <div className="pixel-card card-leaderboard">
        <div className="leaderboard-header">
          <div className="card-ribbon">🏆 SALÓN DE LA FAMA 🏆</div>
          <h2 className="pixel-title-small">TABLA DE POSICIONES INFINITA</h2>
          <p className="leaderboard-subtitle">Mejores pilotos del Halcón en el Cerro de Oaxaca</p>
        </div>

        <div className="search-box">
          <input
            type="text"
            className="pixel-input"
            placeholder="🔍 Buscar por nombre o grupo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Endless scroll container */}
        <div className="leaderboard-scroll-area">
          <table className="pixel-table">
            <thead>
              <tr>
                <th className="th-rank">POS</th>
                <th className="th-player">JUGADOR</th>
                <th className="th-group">GRUPO</th>
                <th className="th-score">PTS</th>
                <th className="th-prize">PREMIO</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-message">
                    No se encontraron registros. ¡Sé el primero en jugar!
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => {
                  const isCurrent = currentPlayerName && item.name.toLowerCase() === currentPlayerName.toLowerCase();
                  let rankBadge = `#${index + 1}`;
                  if (index === 0) rankBadge = '🥇 #1';
                  else if (index === 1) rankBadge = '🥈 #2';
                  else if (index === 2) rankBadge = '🥉 #3';

                  let prizeIcon = '—';
                  if (item.unlockedReward === 'both') {
                    prizeIcon = '🍿+🥖 AMBOS';
                  } else if (item.unlockedReward === 'popcorn') {
                    prizeIcon = '🍿 Palomitas';
                  } else if (item.unlockedReward === 'bread') {
                    prizeIcon = '🥖 Pan';
                  }

                  return (
                    <tr
                      key={item.id}
                      className={`row-item ${index < 3 ? 'top-three' : ''} ${isCurrent ? 'current-player-row' : ''}`}
                    >
                      <td className="td-rank">
                        <span className={`rank-tag rank-${index + 1}`}>{rankBadge}</span>
                      </td>
                      <td className="td-player">
                        <div className="player-name-text">{item.name}</div>
                        {isCurrent && <span className="you-badge">TÚ</span>}
                      </td>
                      <td className="td-group">{item.group}</td>
                      <td className="td-score">
                        <span className="score-badge">{item.score}</span>
                      </td>
                      <td className="td-prize">
                        <span className="prize-chip">{prizeIcon}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="leaderboard-footer">
          <div className="footer-stats">
            Total de registros: <strong>{entries.length}</strong>
          </div>
          <div className="leaderboard-actions">
            <button
              type="button"
              className="pixel-btn btn-primary"
              onClick={() => {
                soundManager.playClick();
                onPlayAgain();
              }}
            >
              🎮 JUGAR AHORA
            </button>
            <button
              type="button"
              className="pixel-btn btn-secondary"
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
            >
              ✕ CERRAR
            </button>
            <button
              type="button"
              className="pixel-btn btn-danger btn-xs"
              onClick={handleReset}
              title="Borrar registros"
            >
              🗑️ REINICIAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
