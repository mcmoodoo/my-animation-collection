import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import walletSvg from "./assets/wallet.svg";

export const WalletAnimation: React.FC = () => {
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

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale}) rotate(${rotation}deg)`,
          transition: "transform 0.3s ease-out",
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
    </AbsoluteFill>
  );
};
