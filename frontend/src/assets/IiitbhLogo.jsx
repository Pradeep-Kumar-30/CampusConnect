import React from "react";

// Lightweight custom logo inspired by IIIT Bhagalpur branding.
// You can replace this with an <img> using the official logo file later.
const IiitbhLogo = ({ size = 40 }) => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="iiitbh-grad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        <rect
          x="4"
          y="4"
          width="56"
          height="56"
          rx="14"
          fill="#020617"
          stroke="url(#iiitbh-grad)"
          strokeWidth="2.5"
        />
        <path
          d="M20 42L28 20L36 36L44 22"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="42" r="2.4" fill="#22c55e" />
        <circle cx="28" cy="20" r="2.4" fill="#38bdf8" />
        <circle cx="36" cy="36" r="2.4" fill="#22c55e" />
        <circle cx="44" cy="22" r="2.4" fill="#38bdf8" />
      </svg>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          lineHeight: 1.1,
        }}
      >
        <span
          style={{
            fontSize: "0.9rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          IIIT Bhagalpur
        </span>
        <span
          style={{
            fontSize: "0.7rem",
            color: "#9ca3af",
          }}
        >
          Campus Intranet
        </span>
      </div>
    </div>
  );
};

export default IiitbhLogo;

