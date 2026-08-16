import { Html, useProgress } from "@react-three/drei";

const Loader = () => {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="flex flex-col items-center gap-4 select-none">
        <div className="relative flex items-center justify-center w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="27"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="3"
            />
            <circle
              cx="32"
              cy="32"
              r="27"
              fill="none"
              stroke="url(#loader-gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 27}
              strokeDashoffset={
                2 * Math.PI * 27 * (1 - progress / 100)
              }
              style={{ transition: "stroke-dashoffset 0.25s ease-out" }}
            />
            <defs>
              <linearGradient
                id="loader-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#7a57db" />
                <stop offset="50%" stopColor="#5c33cc" />
                <stop offset="100%" stopColor="#33c2cc" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute text-xs font-medium text-white/80">
            {Math.round(progress)}%
          </span>
        </div>
        <p className="text-xs tracking-[0.2em] uppercase text-neutral-400">
          Loading scene
        </p>
      </div>
    </Html>
  );
};

export default Loader;
