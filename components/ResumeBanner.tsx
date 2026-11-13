'use client';

interface ResumeBannerProps {
  onStartOver: () => void;
  label?: string;
}

/** Quiet one-liner shown when a mode restores a saved round. */
export default function ResumeBanner({ onStartOver, label = 'round' }: ResumeBannerProps) {
  return (
    <div className="resume-banner" role="status">
      <span className="resume-dot" aria-hidden="true" />
      <span className="resume-text">Resumed your saved {label}.</span>
      <button type="button" className="resume-reset" onClick={onStartOver}>
        Start over
      </button>
    </div>
  );
}
