/**
 * UCL ball orb with image-based sphere + CSS orbital rings.
 *
 * Drop the ball image at /public/ucl-ball.png
 * (PNG with transparent background works best against the dark bg).
 *
 * The 3D ring system uses the same preserve-3d + perspective technique
 * as css.earth/saturn — rotateX establishes a tilted orbital plane so
 * the dots genuinely shrink when far and grow when near.
 */

interface Props {
  src?: string;
}

export function HeroOrb({ src = "/ucl-ball.png" }: Props) {
  return (
    <div
      className="shrink-0 select-none pointer-events-none"
      style={{ position: "relative", width: "460px", height: "460px", perspective: "1400px" }}
      aria-hidden="true"
    >
      {/* Deep nebula glow */}
      <div
        style={{
          position: "absolute",
          inset: "-80px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(3,17,152,0.45) 0%, rgba(74,141,248,0.06) 55%, transparent 75%)",
          filter: "blur(72px)",
        }}
      />

      {/* 3D scene — preserve-3d must not break at any ancestor */}
      <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}>

        {/* ── Sphere ── */}
        <div
          style={{
            position: "absolute",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            left: "50%",
            top: "50%",
            marginLeft: "-140px",
            marginTop: "-140px",
            overflow: "hidden",
            background: "#ffffff",
            perspective: "600px",
            boxShadow:
              "0 0 0 1px rgba(74,141,248,0.18), 0 0 48px rgba(74,141,248,0.2), 0 0 120px rgba(3,17,152,0.4)",
          }}
        >
          {/* Scale wrapper — zooms in to push the white image margin
              outside the circular clip boundary */}
          <div style={{ width: "100%", height: "100%", transform: "scale(1.22)", transformOrigin: "center" }}>
            {/* Ball image — rotates */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="ball-spin"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                mixBlendMode: "multiply",
              }}
            />
          </div>

          {/* Limb darkening — stays fixed, gives the flat image 3D depth */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 36% 33%, transparent 28%, rgba(0,3,24,0.72) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Specular highlight */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 28% 26%, rgba(255,255,255,0.1) 0%, transparent 40%)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* ── Ring 1: inner, tilted 72°, cyan dot orbits in 22 s ── */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            marginLeft: "-185px",
            marginTop: "-185px",
            transformStyle: "preserve-3d",
            transform: "rotateX(72deg)",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "370px",
              height: "370px",
              borderRadius: "50%",
              border: "1.5px solid rgba(69,191,255,0.32)",
              boxShadow: "0 0 12px rgba(69,191,255,0.1)",
            }}
          />
          <div
            className="orbit-dot"
            style={{ position: "absolute", width: "370px", height: "370px", transformStyle: "preserve-3d" }}
          >
            <div
              style={{
                position: "absolute",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#45bfff",
                boxShadow: "0 0 10px 3px rgba(69,191,255,0.7)",
                top: "-3.5px",
                left: "calc(50% - 3.5px)",
              }}
            />
          </div>
        </div>

        {/* ── Ring 2: outer, 68° + 52° offset, blue dot orbits in 40 s ── */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            marginLeft: "-225px",
            marginTop: "-225px",
            transformStyle: "preserve-3d",
            transform: "rotateX(68deg) rotateZ(52deg)",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "450px",
              height: "450px",
              borderRadius: "50%",
              border: "1px solid rgba(74,141,248,0.18)",
            }}
          />
          <div
            className="orbit-dot-slow"
            style={{ position: "absolute", width: "450px", height: "450px", transformStyle: "preserve-3d" }}
          >
            <div
              style={{
                position: "absolute",
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "#4a8df8",
                boxShadow: "0 0 7px 2px rgba(74,141,248,0.65)",
                top: "-2.5px",
                left: "calc(50% - 2.5px)",
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
