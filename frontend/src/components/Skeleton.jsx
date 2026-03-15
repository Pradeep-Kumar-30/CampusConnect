import React from "react";

export const Skeleton = ({ width = "100%", height = "1rem", className = "" }) => (
  <div
    style={{
      width,
      height,
      background: "linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%)",
      backgroundSize: "200% 100%",
      animation: "loading 1.5s infinite",
      borderRadius: "0.375rem",
    }}
    className={className}
  />
);

export const SkeletonList = ({ count = 3, height = "2rem" }) => (
  <>
    <style>{`
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ marginBottom: "0.75rem" }}>
        <Skeleton height={height} />
      </div>
    ))}
  </>
);

export const CardSkeleton = () => (
  <>
    <style>{`
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
    <div className="card">
      <Skeleton width="60%" height="1.5rem" />
      <div style={{ marginTop: "1rem" }}>
        <Skeleton height="1rem" />
        <Skeleton width="90%" height="1rem" style={{ marginTop: "0.5rem" }} />
        <Skeleton width="70%" height="1rem" style={{ marginTop: "0.5rem" }} />
      </div>
    </div>
  </>
);

export default Skeleton;
