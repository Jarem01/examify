import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    ...props,
  };
}

export const HomeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5.5 9.5V20h13V9.5" />
    <path d="M10 20v-5h4v5" />
  </svg>
);

export const SearchIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m16.5 16.5 4 4" />
  </svg>
);

export const CardsIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="6" width="13" height="15" rx="2.5" />
    <path d="M7.5 3.5h9A4 4 0 0 1 20.5 7.5v9" />
  </svg>
);

export const LearnIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />
    <path d="M12 7.5V12l3 2" />
    <path d="M16.5 3.5H21V8" />
  </svg>
);

export const TestIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 3h9l4 4v14H6z" />
    <path d="M14.5 3v4.5H19" />
    <path d="m8.5 14 2 2 4-4" />
  </svg>
);

export const BlocksIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.8" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.8" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.8" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.8" />
  </svg>
);

export const BlastIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M13.5 3.5c3.5 2 5.5 5.5 5.5 9.5 0 2-.5 3.8-1.4 5.4l-4.6-2.2-4.6 2.2A11 11 0 0 1 7 13c0-4 2-7.5 6.5-9.5Z" />
    <circle cx="12" cy="10" r="2" />
    <path d="m9.5 18.5-1.5 3 3-1" />
    <path d="m14.5 18.5 1.5 3-3-1" />
  </svg>
);

export const MatchIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 8h13l-3-3" />
    <path d="M21 16H8l3 3" />
  </svg>
);

export const CharmsIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 2.8 16 9l7 1.2-5.2 4.9 1.4 7L12 18.8 4.8 22l1.4-7L1 10.2 8 9z" />
  </svg>
);

export const SettingsIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2.4" />
    <circle cx="8" cy="17" r="2.4" />
  </svg>
);

export const PlusIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const CloseIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const TrashIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 7h16M9.5 7V4.5h5V7" />
    <path d="M6.5 7 7.5 20h9L17.5 7" />
    <path d="M10.5 11v5M13.5 11v5" />
  </svg>
);

export const VolumeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
    <path d="M15.5 9a4 4 0 0 1 0 6" />
    <path d="M18 6.5a8 8 0 0 1 0 11" />
  </svg>
);

export const ShuffleIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M17 4h4v4" />
    <path d="M21 4 13.5 11.5" />
    <path d="M3 20 21 4" />
    <path d="M17 20h4v-4" />
    <path d="m21 20-6-6" />
    <path d="M3 4h3" />
  </svg>
);

export const CheckIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);

export const ArrowLeftIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M19 12H5" />
    <path d="m11 6-6 6 6 6" />
  </svg>
);

export const ChevronLeftIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m14 6-6 6 6 6" />
  </svg>
);

export const ChevronRightIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m10 6 6 6-6 6" />
  </svg>
);

export const UploadIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 16V4" />
    <path d="m7 9 5-5 5 5" />
    <path d="M4 16v3.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V16" />
  </svg>
);

export const TrophyIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
    <path d="M8 5.5H4.5V8a3.5 3.5 0 0 0 3.5 3.5" />
    <path d="M16 5.5h3.5V8A3.5 3.5 0 0 1 16 11.5" />
    <path d="M12 13v4" />
    <path d="M8.5 21h7" />
    <path d="M10 21v-2h4v2" />
  </svg>
);

export const TimerIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="13" r="7.5" />
    <path d="M12 9.5V13l2.5 1.5" />
    <path d="M9.5 2.5h5" />
  </svg>
);

export const FlameIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3c3.5 3.5 6 6 6 9.5A6 6 0 0 1 6 12.5C6 9 8.5 6.5 12 3Z" />
    <path d="M12 20a2.8 2.8 0 0 0 2.8-2.8c0-1.6-1-2.7-2.8-4.7-1.8 2-2.8 3.1-2.8 4.7A2.8 2.8 0 0 0 12 20Z" />
  </svg>
);

export const SparkIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
    <path d="M18.5 16.5 19 18l1.5.5L19 19l-.5 1.5L18 19l-1.5-.5L18 18z" />
  </svg>
);
