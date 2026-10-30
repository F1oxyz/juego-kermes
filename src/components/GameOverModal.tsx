import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { Player, CouponType } from '../types/game';
import { CouponTicket } from './CouponTicket';
import { saveScore } from '../utils/storage';
import { soundManager } from '../utils/audio';

interface GameOverModalProps {
  score: number;
  player: Player;
  onPlayAgain: () => void;
  onChangePlayer: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  player,
  onPlayAgain,
  onChangePlayer,
}) => {
  const [selectedCoupon, setSelectedCoupon] = useState<CouponType>('popcorn');

  const isLoser = score < 5;
  const isSingleWinner = score >= 5 && score <= 10;
  const isSuperWinner = score > 10;

  useEffect(() => {
    // Record score
    const rewardType = isSuperWinner ? 'both' : isSingleWinner ? selectedCoupon : 'none';
    saveScore(player.name, player.group, score, rewardType);

    if (isSingleWinner || isSuperWinner) {
      soundManager.playWin();
      confetti({
        particleCount: isSuperWinner ? 120 : 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#d97736', '#10b981', '#ef4444', '#3b82f6'],
      });
    }
  }, [score, player, isSingleWinner, isSuperWinner, selectedCoupon]);

  const handleSelectCoupon = (coupon: CouponType) => {
    soundManager.playClick();
    setSelectedCoupon(coupon);
  };

  return (
    <div className="pixel-overlay">
      <div className="pixel-card card-gameover">
        {/* Header Status */}
        {isLoser && (
          <div className="result-header result-fail">
            <div className="status-stamp stamp-fail">CASI LO LOGRAS</div>
            <h2 className="result-title">¡INTENTA DE NUEVO!</h2>
            <p className="result-sub">
              Obtuviste <strong>{score}</strong> {score === 1 ? 'punto' : 'puntos'}.
            </p>
            <div className="fail-tip-box">
              <p>El mínimo para ganar un cupón de premio es de <strong>5 puntos</strong>.</p>
              <p className="saved-note">Tu nombre y grupo siguen guardados para volver a jugar.</p>
            </div>
          </div>
        )}

        {isSingleWinner && (
          <div className="result-header result-win">
            <div className="status-stamp stamp-win">¡PREMIO GANADO!</div>
            <h2 className="result-title">¡FELICIDADES!</h2>
            <p className="result-score">PUNTUACIÓN: <span className="score-val">{score} PTS</span></p>
            <p className="result-instruction">
              Alcanzaste entre 5 y 10 puntos. Elige cuál de los dos cupones prefieres:
            </p>

            {/* Selector between Popcorn and Bread */}
            <div className="coupon-selector-grid">
              <button
                type="button"
                className={`choice-card ${selectedCoupon === 'popcorn' ? 'selected' : ''}`}
                onClick={() => handleSelectCoupon('popcorn')}
              >
                <div className="choice-icon">🍿</div>
                <div className="choice-title">$5 EN PALOMITAS</div>
                <div className="choice-badge">{selectedCoupon === 'popcorn' ? '✓ ELEGIDO' : 'SELECCIONAR'}</div>
              </button>

              <button
                type="button"
                className={`choice-card ${selectedCoupon === 'bread' ? 'selected' : ''}`}
                onClick={() => handleSelectCoupon('bread')}
              >
                <div className="choice-icon">🥖</div>
                <div className="choice-title">$5 EN PAN</div>
                <div className="choice-badge">{selectedCoupon === 'bread' ? '✓ ELEGIDO' : 'SELECCIONAR'}</div>
              </button>
            </div>

            {/* Display the selected coupon ticket */}
            <div className="tickets-container">
              <CouponTicket type={selectedCoupon} player={player} score={score} />
            </div>
          </div>
        )}

        {isSuperWinner && (
          <div className="result-header result-super">
            <div className="status-stamp stamp-super">★ ¡RÉCORD MAESTRO! ★</div>
            <h2 className="result-title">¡TIENES AMBOS CUPONES!</h2>
            <p className="result-score">PUNTUACIÓN EXTRAORDINARIA: <span className="score-val gold-glow">{score} PTS</span></p>
            <p className="result-instruction">
              ¡Superaste los 10 puntos! Por tu destreza en el Cerro de Oaxaca te llevas el paquete completo:
            </p>

            {/* Display both tickets */}
            <div className="tickets-container tickets-dual">
              <CouponTicket type="popcorn" player={player} score={score} />
              <CouponTicket type="bread" player={player} score={score} />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="modal-actions-grid">
          <button
            type="button"
            className="pixel-btn btn-primary pulse-btn"
            onClick={() => {
              soundManager.playClick();
              onPlayAgain();
            }}
          >
            🔄 JUGAR DE NUEVO
          </button>

          <button
            type="button"
            className="pixel-btn btn-outline"
            onClick={() => {
              soundManager.playClick();
              onChangePlayer();
            }}
          >
            👤 CAMBIAR JUGADOR
          </button>
        </div>
      </div>
    </div>
  );
};
