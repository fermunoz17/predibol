import { SpinningBall } from "./SpinningBall";

// Navbar version of the Predibol logo: the half ball on the horizon line + the italic wordmark,
// drawn in the same 1400×420 coordinates as the landing reveal and cropped to the logo.
// The ball turns (same 45° tilted spin) only while the logo is hovered.

const NAV_BG = "#04091e"; // letter outline = navbar background, so the "P" cuts into the ball

export function NavLogo({ height = 28 }: { height?: number }) {
  const vb = { x: 60, y: 132, w: 1120, h: 168 };
  return (
    <svg
      className="nav-logo"
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      height={height}
      width={(height * vb.w) / vb.h}
      role="img"
      aria-label="Predibol"
    >
      <defs>
        <clipPath id="nav-logo-above">
          <rect x={vb.x} y={vb.y} width={vb.w} height={290 - vb.y} />
        </clipPath>
      </defs>
      <line x1={vb.x} y1="290" x2={vb.x + vb.w} y2="290" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="5" />
      <g clipPath="url(#nav-logo-above)">
        <SpinningBall size={292} x={205 - 146} y={290 - 146} />
      </g>
      <text
        x="300"
        y="290"
        fontFamily="var(--font-kanit), 'Arial Black', sans-serif"
        fontStyle="italic"
        fontWeight="900"
        fontSize="208"
        letterSpacing="-4"
        fill="#FFFFFF"
        stroke={NAV_BG}
        strokeWidth="16"
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        Predibol
      </text>
    </svg>
  );
}
