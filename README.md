# 🦅 Halcón del Cerro de Oaxaca - Flappy Kermés 🍿🥖

Juego estilo Flappy Bird en **Pixel Art** ambientado en el majestuoso **Cerro de Oaxaca (Monte Albán / Fortín)**, con obstáculos de palitos de madera rústica ("palitos cafecitos"), un halcón pixelado animado, registro de alumno por nombre y grupo, tabla de posiciones infinita y premios en cupones canjeables para la Kermés escolar.

---

## 🎮 Reglas del Juego y Premios

1. **Registro Obligatorio:** Ingresa tu nombre y tu grupo escolar (ej. *5° B*, *302*).
2. **Controles:**
   - **Toca la pantalla** (en celular/tablet) o presiona la **Barra Espaciadora / Flecha Arriba** para que el Halcón aletee.
   - Esquiva los troncos de madera rústica y evita tocar el suelo.
3. **Sistema de Cupones de la Kermés:**
   - ❌ **Menos de 5 puntos:** "Intenta de nuevo". Se preservan tus datos para que no tengas que reescribirlos.
   - 🎟️ **Entre 5 y 10 puntos:** Puedes elegir **1 cupón** de **$5 pesos de descuento**:
     - Cupón de $5 en Palomitas 🍿
     - O cupón de $5 en Pan 🥖
   - ⭐ **Más de 10 puntos (11+):** ¡Desbloqueas **AMBOS CUPONES** de descuento! ($5 Palomitas Y $5 Pan).
4. **Tabla de Posiciones (Leaderboard):**
   - Registro infinito con búsqueda por nombre y grupo.
   - Guarda tu récord histórico localmente para competir durante toda la Kermés.

---

## 🛠️ Tecnologías

- **React 19 + TypeScript**
- **Vite 6**
- **HTML5 Canvas 2D (60 FPS con física retro)**
- **Web Audio API** (Efectos de sonido 8-bit sintetizados en tiempo real sin dependencias externas)
- **Pixel Art CSS puro** y fuentes arcade *Press Start 2P* y *Silkscreen*
- **Canvas Confetti** para celebraciones de victoria

---

## 🚀 Despliegue en Vercel

Este proyecto está 100% listo para desplegarse en Vercel:

1. Importa este repositorio `juego-kermes` en tu panel de [Vercel](https://vercel.com).
2. Selecciona el preset **Vite**.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. ¡Listo para compartir el enlace o generar un código QR para que los alumnos jueguen desde sus teléfonos!

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Generar bundle de producción
npm run build
```
