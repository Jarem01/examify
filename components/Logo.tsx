import { useId } from 'react';

interface LogoMarkProps {
  size?: number;
  className?: string;
  title?: string;
  decorative?: boolean;
}

/** Two overlapping cards — the Examify mark. */
export function LogoMark({ size = 34, className, title = 'Examify', decorative = false }: LogoMarkProps) {
  const uid = useId().replace(/:/g, '');
  const back = `${uid}-back`;
  const front = `${uid}-front`;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative || undefined}
    >
      <defs>
        <linearGradient id={back} x1="10" y1="12" x2="40" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5ecbff" />
          <stop offset="1" stopColor="#2f6bff" />
        </linearGradient>
        <linearGradient id={front} x1="20" y1="12" x2="48" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5aa6ff" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect x="11" y="13" width="28" height="38" rx="7" fill="none" stroke={`url(#${back})`} strokeWidth="5.5" />
      <g transform="rotate(28 32 32)">
        <rect x="20" y="13" width="28" height="38" rx="7" fill="none" stroke="#060a16" strokeWidth="9.5" />
        <rect x="20" y="13" width="28" height="38" rx="7" fill="none" stroke={`url(#${front})`} strokeWidth="5.5" />
      </g>
    </svg>
  );
}

/** Mark plus the “Examify” wordmark. */
export function Logo({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <span className={`logo${className ? ` ${className}` : ''}`}>
      <LogoMark size={size} />
      <span className="logo-word">
        Exam<span className="logo-word-accent">ify</span>
      </span>
    </span>
  );
}
