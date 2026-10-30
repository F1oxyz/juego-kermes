import type { CouponType, Player } from '../types/game';

interface CouponTicketProps {
  type: CouponType;
  player: Player;
  score: number;
}

export const CouponTicket: React.FC<CouponTicketProps> = ({ type, player, score }) => {
  const isPopcorn = type === 'popcorn';
  const ticketId = isPopcorn
    ? `KERMES-POP-${Math.abs(score * 137 + 512).toString().padStart(4, '0')}`
    : `KERMES-PAN-${Math.abs(score * 219 + 784).toString().padStart(4, '0')}`;

  const copyCode = () => {
    navigator.clipboard.writeText(ticketId);
    alert(`¡Código ${ticketId} copiado! Muestra esto en el puesto.`);
  };

  return (
    <div className={`pixel-coupon ${isPopcorn ? 'coupon-popcorn' : 'coupon-bread'}`}>
      {/* Perforation holes on left and right */}
      <div className="ticket-notch notch-left"></div>
      <div className="ticket-notch notch-right"></div>

      <div className="ticket-header">
        <span className="ticket-badge">★ KERMÉS ESCOLAR ★</span>
        <span className="ticket-serial">NO. {ticketId}</span>
      </div>

      <div className="ticket-body">
        <div className="ticket-icon-box">
          {isPopcorn ? (
            <div className="pixel-icon pixel-popcorn">
              {/* Pixel Popcorn Box */}
              <div className="pop-flakes">🍿</div>
            </div>
          ) : (
            <div className="pixel-icon pixel-bread">
              {/* Pixel Bread / Concha */}
              <div className="bread-concha">🥖</div>
            </div>
          )}
        </div>

        <div className="ticket-info">
          <div className="ticket-discount">-$5 PESOS</div>
          <div className="ticket-product">
            {isPopcorn ? 'DE DESCUENTO EN PALOMITAS' : 'DE DESCUENTO EN PAN'}
          </div>
          <div className="ticket-non-cumulative">
            ⚠️ NO ACUMULABLE • 1 SOLO USO
          </div>
          <div className="ticket-meta">
            <p><strong>ALUMNO:</strong> {player.name.toUpperCase()}</p>
            <p><strong>GRUPO:</strong> {player.group.toUpperCase()}</p>
            <p><strong>PUNTUACIÓN:</strong> {score} PTS</p>
          </div>
        </div>
      </div>

      <div className="ticket-footer">
        {/* Pixel simulated barcode */}
        <div className="pixel-barcode">
          <span className="b-w1"></span>
          <span className="b-w3"></span>
          <span className="b-w2"></span>
          <span className="b-w1"></span>
          <span className="b-w4"></span>
          <span className="b-w2"></span>
          <span className="b-w3"></span>
          <span className="b-w1"></span>
          <span className="b-w2"></span>
          <span className="b-w4"></span>
          <span className="b-w1"></span>
        </div>
        <div className="ticket-actions">
          <button type="button" className="pixel-btn btn-sm" onClick={copyCode}>
            COPIAR CÓDIGO
          </button>
        </div>
      </div>
      <div className="ticket-watermark">⚠️ CUPÓN NO ACUMULABLE • VÁLIDO POR 1 SOLO PRODUCTO</div>
    </div>
  );
};
