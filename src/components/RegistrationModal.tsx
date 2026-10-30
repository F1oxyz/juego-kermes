import React, { useState, useEffect } from 'react';
import type { Player } from '../types/game';
import { getLastPlayer, saveLastPlayer } from '../utils/storage';
import { soundManager } from '../utils/audio';

interface RegistrationModalProps {
  onStartGame: (player: Player) => void;
  initialError?: string;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  onStartGame,
  initialError,
}) => {
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [error, setError] = useState(initialError || '');

  useEffect(() => {
    const saved = getLastPlayer();
    if (saved) {
      setName(saved.name || '');
      setGroup(saved.group || '');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('¡Debes ingresar tu nombre!');
      return;
    }
    if (!group.trim()) {
      setError('¡Debes ingresar tu grupo!');
      return;
    }

    const player: Player = {
      name: name.trim(),
      group: group.trim(),
    };

    saveLastPlayer(player);
    soundManager.playClick();
    onStartGame(player);
  };

  return (
    <div className="pixel-overlay">
      <div className="pixel-card card-register">
        <div className="card-ribbon">🏆 KERMÉS ESCOLAR 🏆</div>
        
        <h1 className="pixel-title">
          <span className="title-sub">VUELO DEL</span>
          <span className="title-main">HALCÓN</span>
          <span className="title-loc">CERRO DE OAXACA</span>
        </h1>

        <div className="pixel-hawk-preview">
          <div className="hawk-idle-anim"></div>
        </div>

        <form onSubmit={handleSubmit} className="pixel-form">
          <div className="form-group">
            <label htmlFor="student-name">NOMBRE DEL JUGADOR:</label>
            <input
              id="student-name"
              type="text"
              maxLength={25}
              placeholder="Ej. Juan Pérez"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="pixel-input"
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="student-group">GRUPO / SALÓN:</label>
            <input
              id="student-group"
              type="text"
              maxLength={15}
              placeholder="Ej. 5° A / 302"
              value={group}
              onChange={(e) => {
                setGroup(e.target.value);
                setError('');
              }}
              className="pixel-input"
              autoComplete="off"
            />
          </div>

          {error && <div className="pixel-alert alert-danger">{error}</div>}

          <div className="prizes-hint">
            <p className="prize-line">🎯 <strong>5 a 10 pts:</strong> Cupón $5 (Palomitas o Pan)</p>
            <p className="prize-line prize-gold">⭐ <strong>Más de 10 pts:</strong> ¡AMBOS CUPONES!</p>
          </div>

          <button type="submit" className="pixel-btn btn-primary btn-block pulse-btn">
            ▶ ¡A VOLAR!
          </button>
        </form>
      </div>
    </div>
  );
};
