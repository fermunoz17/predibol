export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2">
      <div className="relative flex flex-col items-center" style={{ height: "88px" }}>
        {/* Soccer ball */}
        <div
          className="ball-bounce text-4xl leading-none select-none"
          style={{ transformOrigin: "center bottom" }}
          aria-hidden="true"
        >
          ⚽
        </div>

        {/* Shadow */}
        <div
          className="shadow-pulse absolute bottom-0 w-8 h-1.5 rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(59,130,246,0.45) 0%, transparent 75%)",
            transformOrigin: "center center",
          }}
          aria-hidden="true"
        />
      </div>

      <p className="text-xs text-[#3a5a7a] tracking-[0.2em] uppercase mt-1">Loading</p>
    </div>
  );
}
