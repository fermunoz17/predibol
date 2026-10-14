"use client";

import { useEffect, useRef } from "react";

export function HeroLogoReveal() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current!;
    if (!stage) return;

    const NS = "http://www.w3.org/2000/svg";
    const measure = stage.querySelector<SVGTextElement>("#measure")!;
    const word    = stage.querySelector<SVGGElement>("#word")!;
    const clip    = stage.querySelector<SVGClipPathElement>("#wordClip")!;
    const streaks = stage.querySelector<SVGGElement>("#streaks")!;
    const roll    = stage.querySelector<SVGGElement>("#roll")!;

    const WORD = "Predibol";
    const CX = 700, CY = 150, R = 130;

    const bursts = [
      { color: "#7BE33B", t: 0.75 },
      { color: "#2457E6", t: 1.35 },
      { color: "#8DB1FF", t: 1.95 },
    ];
    const lanes: [number, number, string][] = [
      [-95, 6, "r"], [-40, 10, "l"], [15, 5, "r"],
      [70, 8, "l"], [-65, 4, "l"], [45, 7, "r"],
    ];

    bursts.forEach((b, bi) => {
      lanes.forEach((lane, li) => {
        const y = CY + lane[0] + (bi - 1) * 9;
        const right = lane[2] === "r";
        const len = 560 - li * 30;
        const r = document.createElementNS(NS, "rect");
        r.setAttribute("x", String(right ? CX + R * 0.6 : CX - R * 0.6 - len));
        r.setAttribute("y", String(y - lane[1] / 2));
        r.setAttribute("width", String(len));
        r.setAttribute("height", String(lane[1]));
        r.setAttribute("rx", String(lane[1] / 2));
        r.setAttribute("fill", b.color);
        r.setAttribute("class", "streak " + lane[2]);
        r.style.setProperty("--d", (b.t + li * 0.045).toFixed(3) + "s");
        r.style.setProperty("--off", right ? "60%" : "-60%");
        streaks.appendChild(r);
      });
    });

    function letterText(ch: string, x: number, styled: boolean) {
      const t = document.createElementNS(NS, "text");
      t.setAttribute("font-family", "Kanit, 'Arial Black', sans-serif");
      t.setAttribute("font-style", "italic");
      t.setAttribute("font-weight", "900");
      t.setAttribute("font-size", "208");
      t.setAttribute("x", String(x));
      t.setAttribute("y", "290");
      if (styled) {
        t.setAttribute("fill", "#FFFFFF");
        t.setAttribute("stroke", "#0B1E5B");
        t.setAttribute("stroke-width", "16");
        t.setAttribute("stroke-linejoin", "round");
        t.setAttribute("paint-order", "stroke");
      }
      t.textContent = ch;
      return t;
    }

    const PERIOD = 280, TURNS = 9, ROLL_MS = 3300;
    let rafId = 0;
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    function easeOut(p: number) { return 1 - Math.pow(1 - p, 3); }

    // Spin axis: the surface strip runs along the tilted axis, and each copy of the artwork is
    // counter-rotated so the ball's resting pattern looks the same in both modes. At offset 0 the
    // two modes render identically (copy B sits outside the ball), so switching is invisible.
    const tilt = stage.querySelector<SVGGElement>("#roll-tilt")!;
    const copyA = stage.querySelector<SVGUseElement>("#roll-a")!;
    const copyB = stage.querySelector<SVGUseElement>("#roll-b")!;
    function setAxis(deg: number) {
      tilt.setAttribute("transform", deg ? `rotate(${-deg})` : "");
      copyA.setAttribute("transform", deg ? `rotate(${deg})` : "");
      copyB.setAttribute("transform", deg ? `translate(-${PERIOD} 0) rotate(${deg})` : `translate(-${PERIOD} 0)`);
    }

    const IDLE_TILT = -45;        // degrees (negative = pattern moves toward the lower right)
    const IDLE_SPEED = PERIOD / 2.6; // px per second along the axis: one full turn every 2.6s
    const IDLE_RAMP_MS = 900;     // ease into the idle spin after the landing

    function startIdleSpin() {
      setAxis(IDLE_TILT);
      let x = 0;
      let last = performance.now();
      const t0 = last;
      function frame(now: number) {
        const dt = (now - last) / 1000;
        last = now;
        const ramp = Math.min(1, (now - t0) / IDLE_RAMP_MS);
        x = (x + IDLE_SPEED * dt * ramp * ramp) % PERIOD;
        roll.setAttribute("transform", `translate(${x.toFixed(2)} 0)`);
        rafId = requestAnimationFrame(frame);
      }
      rafId = requestAnimationFrame(frame);
    }

    function startRoll() {
      cancelAnimationFrame(rafId);
      setAxis(0);
      if (still) { roll.setAttribute("transform", ""); return; }
      const t0 = performance.now();
      function frame(now: number) {
        const p = Math.min(1, (now - t0) / ROLL_MS);
        const x = (easeOut(p) * TURNS * PERIOD) % PERIOD;
        roll.setAttribute("transform", `translate(${x.toFixed(2)} 0)`);
        if (p < 1) rafId = requestAnimationFrame(frame);
        else startIdleSpin();
      }
      rafId = requestAnimationFrame(frame);
    }

    function replay() {
      stage.classList.remove("play");
      void stage.getBoundingClientRect();
      stage.classList.add("play");
      startRoll();
      document.dispatchEvent(new Event("predibol:replay"));
    }

    function build() {
      measure.style.display = "";
      word.textContent = "";
      clip.textContent = "";
      for (let i = 0; i < WORD.length; i++) {
        const x = measure.getStartPositionOfChar(i).x;
        const t = letterText(WORD[i], x, true);
        t.setAttribute("class", "letter");
        t.style.setProperty("--d", (3.3 + i * 0.08).toFixed(2) + "s");
        word.appendChild(t);
        clip.appendChild(letterText(WORD[i], x, false));
      }
      measure.style.display = "none";
      replay();
    }


    const ready = document.fonts?.load
      ? document.fonts.load("italic 900 208px Kanit").catch(() => {})
      : Promise.resolve();
    (ready as Promise<unknown>).then(build, build);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={stageRef} className="logo-stage">
      <svg viewBox="0 0 1400 420" role="img" aria-label="Predibol">

        {/* Single defs block — matches reference exactly */}
        <defs>
          <clipPath id="above"><rect x="0" y="-200" width="1400" height="490" /></clipPath>
          <clipPath id="ballClip"><circle r="137" /></clipPath>
          <radialGradient id="shade" cx="0.38" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.7" stopColor="#F1F4FA" />
            <stop offset="1" stopColor="#C9D2E3" />
          </radialGradient>
          <radialGradient id="halo" cx="0.5" cy="1" r="0.6">
            <stop offset="0" stopColor="#7BE33B" stopOpacity="0.55" />
            <stop offset="1" stopColor="#7BE33B" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="shineGrad" x1="0" x2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="sphere" cx="0.42" cy="0.38" r="0.7">
            <stop offset="0.55" stopColor="#0B1E5B" stopOpacity="0" />
            <stop offset="1" stopColor="#0B1E5B" stopOpacity="0.38" />
          </radialGradient>
          <clipPath id="wordClip"></clipPath>
          <g id="art">
            <g fill="none" stroke="#B7C2D8" strokeWidth="2.5">
              <path d="M-138,-10 C-96,-14 -60,-6 -40,0" />
              <path d="M-40,0 C-30,-40 -10,-70 24,-86 C56,-100 92,-102 120,-92" />
              <path d="M24,-86 C10,-104 4,-122 6,-140" />
              <path d="M-40,0 C-62,-30 -96,-44 -132,-46" />
              <path d="M-40,0 C-20,40 10,70 40,90 M40,90 C70,80 100,60 120,40 M-40,0 C-80,30 -110,60 -120,72" />
            </g>
            <g fill="#7BE33B">
              <path d="M-26,0 C10,-48 66,-82 134,-62 L139,-34 C86,-56 40,-30 14,0 Z" />
              <path d="M-110,40 C-60,70 -10,110 20,138 L-12,139 C-40,110 -80,80 -126,60 Z" />
            </g>
            <g>
              <path d="M-136,-48 C-80,-62 -30,-100 -4,-139 L36,-135 C6,-96 -52,-46 -128,-22 Z" fill="#2457E6" />
              <path d="M60,-118 C70,-92 96,-78 124,-76" fill="none" stroke="#2457E6" strokeWidth="10" strokeLinecap="round" />
              <path d="M60,20 C90,40 110,70 120,90 L104,104 C96,80 80,54 52,34 Z" fill="#2457E6" />
            </g>
            <g fill="#0B1E5B">
              <path d="M-120,-66 C-70,-78 -40,-104 -24,-128 L-12,-130 C-30,-100 -64,-72 -116,-56 Z" />
              <path d="M30,-6 C56,-38 92,-56 138,-50 L139,-42 C96,-48 64,-32 42,-4 Z" />
              <path d="M-70,90 C-40,100 -20,118 -10,134 L-22,136 C-34,120 -52,106 -76,98 Z" />
            </g>
          </g>
        </defs>

        <ellipse className="glow" clipPath="url(#above)" cx="205" cy="290" rx="230" ry="190" fill="url(#halo)" />

        <g id="streaks"></g>

        <line className="horizon" x1="0" y1="290" x2="1400" y2="290"
          stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="2" />

        <g clipPath="url(#above)">
          <g className="travel">
            <g className="pop">
              <circle r="140" fill="url(#shade)" />
              <g clipPath="url(#ballClip)">
                <g id="roll-tilt">
                  <g id="roll">
                    <use id="roll-a" href="#art" />
                    <use id="roll-b" href="#art" transform="translate(-280 0)" />
                  </g>
                </g>
                <circle r="140" fill="url(#sphere)" />
                <ellipse cx="-45" cy="-60" rx="55" ry="32" fill="#FFFFFF"
                  opacity="0.18" transform="rotate(-30 -45 -60)" />
              </g>
              <circle r="140" fill="none" stroke="#0B1E5B" strokeWidth="8" />
            </g>
          </g>
        </g>

        <g id="word"></g>

        <g clipPath="url(#wordClip)">
          <rect className="shine" x="0" y="40" width="160" height="280"
            fill="url(#shineGrad)" transform="skewX(-20)" />
        </g>

        <rect className="flash" x="0" y="0" width="1400" height="420" fill="#FFFFFF" />

        <text
          id="measure"
          x="300" y="290"
          fontFamily="Kanit, 'Arial Black', sans-serif"
          fontStyle="italic"
          fontWeight="900"
          fontSize="208"
          letterSpacing="-4"
          fill="#FFFFFF"
          stroke="#0B1E5B"
          strokeWidth="16"
          strokeLinejoin="round"
          paintOrder="stroke"
        >Predibol</text>
      </svg>

    </div>
  );
}
