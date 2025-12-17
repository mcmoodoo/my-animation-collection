import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import walletSvg from "./assets/retro-wallet.svg";
import usdcSvg from "./assets/usdc.svg";

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

  // Scale up animation - starts immediately at 0.3, grows slowly to 1
  // Use interpolate directly for smooth, predictable growth without overshoot
  const scale = interpolate(
    frame,
    [0, 240], // Grow over 240 frames (8 seconds at 30fps)
    [0.3, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: (t) => {
        // Smooth easing function for gradual growth
        return t * t * (3 - 2 * t); // Smoothstep
      },
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

  // USDC tokens configuration - flow from left into wallet
  const tokenSourceX = -500; // Start position (left side, off-screen)
  const tokensStartFrame = 5; // When tokens start flowing in
  
  const incomingTokens = [
    { delay: 0, rotation: 10, scale: 0.6, offsetX: 0, offsetY: 0 },
    { delay: 15, rotation: -15, scale: 0.65, offsetX: 15, offsetY: -10 },
    { delay: 30, rotation: 20, scale: 0.6, offsetX: -10, offsetY: -5 },
    { delay: 45, rotation: -10, scale: 0.7, offsetX: 20, offsetY: -15 },
    { delay: 60, rotation: 15, scale: 0.65, offsetX: -5, offsetY: -8 },
    { delay: 75, rotation: -20, scale: 0.6, offsetX: 10, offsetY: -12 },
    { delay: 90, rotation: 8, scale: 0.65, offsetX: -15, offsetY: -3 },
    { delay: 105, rotation: -12, scale: 0.6, offsetX: 5, offsetY: -18 },
    { delay: 120, rotation: 18, scale: 0.7, offsetX: -20, offsetY: 5 },
    { delay: 135, rotation: -8, scale: 0.65, offsetX: 12, offsetY: -22 },
    { delay: 150, rotation: 12, scale: 0.6, offsetX: -8, offsetY: -7 },
    { delay: 165, rotation: -18, scale: 0.65, offsetX: 18, offsetY: -14 },
  ];

  // Calculate balance - count tokens that have arrived (based on their progress)
  let tokenBalance = 0;
  incomingTokens.forEach((token) => {
    const tokenFrame = frame - tokensStartFrame - token.delay;
    if (tokenFrame < 0) return;

    const tokenProgress = spring({
      frame: tokenFrame,
      fps,
      config: {
        damping: 60,
        stiffness: 240,
      },
    });

    // Count token as arrived when progress reaches 1
    // Use clamped progress to get smooth counting
    const arrivalProgress = interpolate(
      tokenProgress,
      [0, 1],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );

    tokenBalance += arrivalProgress;
  });

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
          transform: `scale(${scale})`,
          transition: "transform 0.2s ease-out",
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

      {/* Balance Display - positioned above wallet, static size */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, calc(-50% - 250px))",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "8px 16px",
          borderRadius: "8px",
          fontSize: "20px",
          fontWeight: "bold",
          whiteSpace: "nowrap",
          fontFamily: "monospace",
          zIndex: 10,
        }}
      >
        Tokens: {Math.round(tokenBalance)}
      </div>

      {/* USDC tokens flowing into wallet from the left */}
      {incomingTokens.map((token, index) => {
        const tokenFrame = frame - tokensStartFrame - token.delay;
        if (tokenFrame < 0) return null;

        const tokenProgress = spring({
          frame: tokenFrame,
          fps,
          config: {
            damping: 60,
            stiffness: 240, // Doubled stiffness for twice as fast movement
          },
        });

        // Position animation - flows from left (off-screen) to wallet center with offset
        // Once token arrives (progress >= 1), it stays at final position
        const translateX = interpolate(
          tokenProgress,
          [0, 1],
          [tokenSourceX, token.offsetX],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        const translateY = interpolate(
          tokenProgress,
          [0, 1],
          [0, token.offsetY],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        // Rotation animation
        const tokenRotation = interpolate(
          tokenProgress,
          [0, 1],
          [0, token.rotation],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        // Scale animation
        const tokenScale = interpolate(
          tokenProgress,
          [0, 0.4, 1],
          [0.3, token.scale, token.scale],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        // Opacity - fades in from nothing, stays visible once in wallet
        const tokenOpacity = interpolate(
          tokenProgress,
          [0, 0.2, 1],
          [0, 1, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        return (
          <div
            key={`token-${index}`}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(${translateX}px, ${translateY}px) rotate(${tokenRotation}deg) scale(${tokenScale})`,
              opacity: tokenOpacity,
              transformOrigin: "center center",
              pointerEvents: "none",
              zIndex: 2,
            }}
          >
            <img
              src={usdcSvg}
              alt="USDC"
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
