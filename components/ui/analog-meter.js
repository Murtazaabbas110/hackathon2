"use client";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function AnalogMeter({
  value = 0,
  label,
  sublabel,
  tone = "emerald",
  className = "",
  size = "md",
}) {
  const numericValue = clamp(Number(value) || 0, 0, 100);

  const toneStyles = {
    emerald: {
      stroke: "#10b981",
      glow: "rgba(16,185,129,0.35)",
    },
    sky: {
      stroke: "#38bdf8",
      glow: "rgba(56,189,248,0.35)",
    },
    amber: {
      stroke: "#f59e0b",
      glow: "rgba(245,158,11,0.35)",
    },
    rose: {
      stroke: "#f43f5e",
      glow: "rgba(244,63,94,0.35)",
    },
  };

  const colors = toneStyles[tone] || toneStyles.emerald;

  const sizeClasses = {
    sm: "w-32",
    md: "w-40",
    lg: "w-48",
  };

  /*
   * Gauge geometry
   *
   * 180° arc:
   * left  = 180°
   * center = 270°
   * right = 360°
   */

  const cx = 100;
  const cy = 100;
  const radius = 72;

  const startAngle = 180;
  const endAngle = 360;

  const valueAngle =
    startAngle + (numericValue / 100) * (endAngle - startAngle);

  function polarToCartesian(angle, r = radius) {
    const radians = (angle * Math.PI) / 180;

    return {
      x: +(
        cx +
        r * Math.cos(radians)
      ).toFixed(3),
      y: +(
        cy +
        r * Math.sin(radians)
      ).toFixed(3),
    };
  }

  function describeArc(start, end, r = radius) {
    const startPoint = polarToCartesian(end, r);
    const endPoint = polarToCartesian(start, r);

    const largeArcFlag = end - start <= 180 ? "0" : "1";

    return [
      "M",
      startPoint.x,
      startPoint.y,
      "A",
      r,
      r,
      0,
      largeArcFlag,
      0,
      endPoint.x,
      endPoint.y,
    ].join(" ");
  }

  const backgroundArc = describeArc(startAngle, endAngle);

  const progressArc =
    numericValue > 0 ? describeArc(startAngle, valueAngle) : "";

  const needleTip = polarToCartesian(valueAngle, 57);

  const needleBase = polarToCartesian(valueAngle + 180, 10);

  return (
    <div
      className={`flex flex-col items-center ${sizeClasses[size]} ${className}`}
    >
      {/* Gauge */}
      <div className="relative w-full aspect-square">
        {/* Outer glass */}
        <div className="absolute inset-0 rounded-full border border-white/[0.08] bg-slate-950/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_20px_50px_rgba(0,0,0,0.25)]" />

        {/* Inner glow */}
        <div
          className="absolute inset-2 rounded-full opacity-30 blur-xl"
          style={{
            background: `radial-gradient(circle, ${colors.glow}, transparent 65%)`,
          }}
        />

        <svg
          viewBox="0 0 200 150"
          className="absolute left-0 top-[5%] w-full h-[75%] overflow-visible"
        >
          <defs>
            <filter id={`meterGlow-${tone}`}>
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient
              id={`needleGradient-${tone}`}
              x1="0"
              y1="1"
              x2="0"
              y2="0"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0.25" />
              <stop offset="50%" stopColor="white" />
              <stop offset="100%" stopColor="white" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <path
            d={backgroundArc}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Subtle inner track */}
          <path
            d={backgroundArc}
            fill="none"
            stroke="rgba(255,255,255,0.025)"
            strokeWidth="2"
          />

          {/* Active progress */}
          {progressArc && (
            <>
              <path
                d={progressArc}
                fill="none"
                stroke={colors.stroke}
                strokeWidth="10"
                strokeLinecap="round"
                opacity="0.25"
                filter={`url(#meterGlow-${tone})`}
              />

              <path
                d={progressArc}
                fill="none"
                stroke={colors.stroke}
                strokeWidth="7"
                strokeLinecap="round"
              />
            </>
          )}

          {/* Tick marks */}
          {Array.from({ length: 11 }).map((_, index) => {
            const tickAngle = startAngle + index * 18;

            const outer = polarToCartesian(tickAngle, 82);
            const inner = polarToCartesian(
              tickAngle,
              index % 5 === 0 ? 73 : 77,
            );

            return (
              <line
                key={index}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={
                  index % 5 === 0
                    ? "rgba(255,255,255,0.35)"
                    : "rgba(255,255,255,0.14)"
                }
                strokeWidth={index % 5 === 0 ? 2 : 1}
                strokeLinecap="round"
              />
            );
          })}

          {/* Needle shadow */}
          <line
            x1={needleBase.x}
            y1={needleBase.y}
            x2={needleTip.x}
            y2={needleTip.y}
            stroke="black"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.45"
          />

          {/* Needle */}
          <line
            x1={needleBase.x}
            y1={needleBase.y}
            x2={needleTip.x}
            y2={needleTip.y}
            stroke={`url(#needleGradient-${tone})`}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Needle tip glow */}
          <circle
            cx={needleTip.x}
            cy={needleTip.y}
            r="2.5"
            fill={colors.stroke}
            opacity="0.8"
          />

          {/* Center pivot */}
          <circle
            cx={cx}
            cy={cy}
            r="10"
            fill="#020617"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="2"
          />

          <circle cx={cx} cy={cy} r="4" fill={colors.stroke} />
        </svg>

        {/* Scale labels */}
        <div className="absolute left-5 right-5 top-[48%] flex justify-between">
          <span className="text-[9px] font-medium tracking-widest text-slate-500">
            0
          </span>

          <span className="text-[9px] font-medium tracking-widest text-slate-500">
            50
          </span>

          <span className="text-[9px] font-medium tracking-widest text-slate-500">
            100
          </span>
        </div>

        {/* Center value */}
        <div className="absolute inset-x-0 bottom-[10%] flex flex-col items-center">
          <div className="flex items-baseline gap-0.5">
            <span className="text-3xl font-semibold tracking-tight text-white">
              {numericValue}
            </span>

            <span
              className="text-sm font-medium"
              style={{ color: colors.stroke }}
            >
              %
            </span>
          </div>

          {label && (
            <span className="mt-1 max-w-[90%] truncate text-[9px] font-medium uppercase tracking-[0.22em] text-slate-400">
              {label}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {sublabel && (
        <p className="mt-2 px-2 text-center text-[10px] leading-relaxed text-slate-500">
          {sublabel}
        </p>
      )}
    </div>
  );
}
