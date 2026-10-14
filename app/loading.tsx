import { SpinningBall } from "./components/SpinningBall";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3" role="status">
      <div className="relative flex flex-col items-center" style={{ height: "84px" }}>
        <div className="sb-bounce">
          <SpinningBall size={48} />
        </div>
        <div className="sb-shadow absolute bottom-0 w-10 h-2 rounded-full" aria-hidden="true" />
      </div>
      <p className="text-xs text-[#9fb0da] tracking-[0.2em] uppercase">Loading</p>
    </div>
  );
}
