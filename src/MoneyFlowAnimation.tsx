import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import walletSvg from "./assets/wallet.svg";
import moneySvg from "./assets/money.svg";

export const MoneyFlowAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in animation
  const fadeIn = spring({
    frame,
    fps,
    config: {
      damping: 100,
    },
  });

  // Scale up animation (slightly delayed)
  const scaleUp = spring({
    frame: frame - 5,
    fps,
    config: {
      damping: 80,
      stiffness: 100,
    },
  });

  // Slight rotation for dynamic effect
  const rotation = interpolate(
    scaleUp,
    [0, 1],
    [-5, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Scale from 0.8 to 1
  const scale = interpolate(
    scaleUp,
    [0, 1],
    [0.8, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Opacity from 0 to 1
  const opacity = interpolate(
    fadeIn,
    [0, 1],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Money flow animation - starts after wallet appears
  const moneyFlowStart = 30;

  // Create multiple money bills with different trajectories
  const moneyBills = [
    { delay: 0, x: 200, y: -150, rotation: 15, scale: 0.6 },
    { delay: 5, x: 300, y: -100, rotation: -20, scale: 0.7 },
    { delay: 10, x: 250, y: -200, rotation: 30, scale: 0.65 },
    { delay: 15, x: 350, y: -80, rotation: -15, scale: 0.55 },
    { delay: 20, x: 180, y: -120, rotation: 25, scale: 0.6 },
    { delay: 25, x: 400, y: -150, rotation: -30, scale: 0.65 },
    { delay: 30, x: 280, y: -180, rotation: 20, scale: 0.7 },
    { delay: 35, x: 320, y: -100, rotation: -25, scale: 0.6 },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
      }}
    >
      {/* Wallet */}
      <div
        style={{
          opacity,
          transform: `scale(${scale}) rotate(${rotation}deg)`,
          transition: "transform 0.3s ease-out",
          position: "relative",
          zIndex: 1,
        }}
      >
        <img
          src={walletSvg}
          alt="Wallet"
          style={{
            width: "400px",
            height: "400px",
            display: "block",
          }}
        />
      </div>

      {/* Money bills flowing out */}
      {moneyBills.map((bill, index) => {
        const billFrame = frame - moneyFlowStart - bill.delay;
        const billProgress = spring({
          frame: billFrame,
          fps,
          config: {
            damping: 50,
            stiffness: 100,
          },
        });

        // Position animation - flows out from wallet
        const translateX = interpolate(
          billProgress,
          [0, 1],
          [0, bill.x],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        const translateY = interpolate(
          billProgress,
          [0, 1],
          [0, bill.y],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        // Rotation animation
        const billRotation = interpolate(
          billProgress,
          [0, 1],
          [0, bill.rotation],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        // Scale animation - starts small, grows, then shrinks as it fades
        const billScale = interpolate(
          billProgress,
          [0, 0.3, 1],
          [0.3, bill.scale, bill.scale * 0.8],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        // Opacity - fades in then out
        const billOpacity = interpolate(
          billProgress,
          [0, 0.2, 0.8, 1],
          [0, 1, 1, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        if (billFrame < 0) return null;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(${translateX}px, ${translateY}px) rotate(${billRotation}deg) scale(${billScale})`,
              opacity: billOpacity,
              transformOrigin: "center center",
              pointerEvents: "none",
            }}
          >
            <img
              src={moneySvg}
              alt="Money"
              style={{
                width: "120px",
                height: "120px",
                display: "block",
              }}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
