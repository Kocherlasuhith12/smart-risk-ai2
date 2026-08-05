export default function Logo({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield shape */}
      <path
        d="M24 4L6 12v12c0 11.1 7.7 21.5 18 24 10.3-2.5 18-12.9 18-24V12L24 4z"
        fill="url(#shield-gradient)"
        stroke="url(#shield-stroke)"
        strokeWidth="1.5"
      />
      {/* Brain/circuit lines */}
      <path
        d="M18 20c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M15 24h18"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="24" cy="20" r="2.5" fill="#fff" />
      <circle cx="18" cy="24" r="1.5" fill="#fff" opacity="0.8" />
      <circle cx="30" cy="24" r="1.5" fill="#fff" opacity="0.8" />
      <path
        d="M20 28l4 6 4-6"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="24" cy="34" r="1.5" fill="#10b981" />
      <defs>
        <linearGradient id="shield-gradient" x1="6" y1="4" x2="42" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="shield-stroke" x1="6" y1="4" x2="42" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
    </svg>
  )
}
