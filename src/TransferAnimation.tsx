import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import walletSvg from "./assets/retro-wallet.svg";
import usdcSvg from "./assets/usdc.svg";
import safeSvg from "./assets/safe.svg";

export const TransferAnimation: React.FC = () => {
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

  // Safe destination location (right side)
  const safeDestinationX = 400;
  const safeDestinationY = -250;

  // Outgoing tokens configuration - flow from wallet to safe
  const outgoingTokens = [
    { delay: 0, offsetX: 0, offsetY: 0, rotation: 0, scale: 0.6 },
    { delay: 8, offsetX: 15, offsetY: -10, rotation: 5, scale: 0.65 },
    { delay: 16, offsetX: -10, offsetY: -5, rotation: -8, scale: 0.6 },
    { delay: 24, offsetX: 20, offsetY: -15, rotation: 10, scale: 0.7 },
    { delay: 32, offsetX: -5, offsetY: -8, rotation: -5, scale: 0.65 },
    { delay: 40, offsetX: 10, offsetY: -12, rotation: 8, scale: 0.6 },
    { delay: 48, offsetX: -15, offsetY: -3, rotation: -10, scale: 0.65 },
    { delay: 56, offsetX: 5, offsetY: -18, rotation: 3, scale: 0.6 },
    { delay: 64, offsetX: -20, offsetY: 5, rotation: -12, scale: 0.65 },
    { delay: 72, offsetX: 12, offsetY: -22, rotation: 8, scale: 0.6 },
    { delay: 80, offsetX: -8, offsetY: -7, rotation: -5, scale: 0.65 },
    { delay: 88, offsetX: 18, offsetY: -14, rotation: 10, scale: 0.6 },
  ];

  // Calculate when accumulation phase ends (when all tokens have arrived)
  // Find the last token's arrival time
  const lastTokenDelay = Math.max(...incomingTokens.map(t => t.delay));
  const accumulationEndFrame = tokensStartFrame + lastTokenDelay + 60; // Add buffer for animation to complete
  const transferStartFrame = accumulationEndFrame + 10; // Small delay before transfer starts
  const isTransferPhase = frame >= transferStartFrame;

  // ===== PHASE 1: ACCUMULATION =====
  // Calculate balance - count tokens that have arrived (based on their progress)
  let walletTokenBalance = 0;
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

    const arrivalProgress = interpolate(
      tokenProgress,
      [0, 1],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );

    walletTokenBalance += arrivalProgress;
  });

  // Freeze wallet balance at end of accumulation
  const frozenWalletBalance = isTransferPhase ? incomingTokens.length : walletTokenBalance;

  // ===== PHASE 2: TRANSFER =====
  // Calculate safe balance from outgoing tokens
  let safeTokenBalance = 0;
  if (isTransferPhase) {
    const transferFrame = frame - transferStartFrame;
    
    outgoingTokens.slice(0, incomingTokens.length).forEach((token) => {
      const tokenFrame = transferFrame - token.delay;
      if (tokenFrame < 0) return;

      const tokenProgress = spring({
        frame: tokenFrame,
        fps,
        config: {
          damping: 60,
          stiffness: 240,
        },
      });

      const transferProgress = interpolate(
        tokenProgress,
        [0, 1],
        [0, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }
      );

      safeTokenBalance += transferProgress;
    });
  }

  // Wallet balance decreases as tokens transfer
  const currentWalletBalance = isTransferPhase 
    ? Math.max(0, frozenWalletBalance - safeTokenBalance)
    : walletTokenBalance;

  // Check if threshold (12 tokens) has been reached
  const thresholdReached = Math.round(currentWalletBalance) >= 12 && !isTransferPhase;

  // Blinking animation for threshold reached
  const blinkOpacity = thresholdReached
    ? interpolate(
        frame % 20, // Blink every 20 frames (faster blink)
        [0, 10, 20],
        [1, 0.2, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }
      )
    : 1;

  // ===== WALLET SCALE =====
  const walletScaleBase = 0.3;
  const walletScaleMax = 1.0;
  
  let walletScale = walletScaleBase;
  if (isTransferPhase) {
    // Shrink during transfer (from max to base as tokens flow out)
    const shrinkProgress = frozenWalletBalance > 0 
      ? safeTokenBalance / frozenWalletBalance 
      : 0;
    walletScale = interpolate(
      shrinkProgress,
      [0, 1],
      [walletScaleMax, walletScaleBase],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );
  } else {
    // Grow during accumulation (from base to max as tokens arrive)
    const growthProgress = Math.min(walletTokenBalance / incomingTokens.length, 1);
    walletScale = interpolate(
      growthProgress,
      [0, 1],
      [walletScaleBase, walletScaleMax],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );
  }

  // ===== SAFE SCALE =====
  // Safe grows as tokens arrive
  const safeScaleBase = 0.3;
  const safeScaleMax = 1.1;
  const scalePerToken = (safeScaleMax - safeScaleBase) / outgoingTokens.length;
  
  let safeScale = safeScaleBase;
  if (isTransferPhase) {
    safeScale = outgoingTokens.slice(0, incomingTokens.length).reduce((currentScale, token) => {
      const tokenFrame = (frame - transferStartFrame) - token.delay;
      if (tokenFrame < 0) return currentScale;

      const tokenProgress = spring({
        frame: tokenFrame,
        fps,
        config: {
          damping: 60,
          stiffness: 240,
        },
      });

      // When token reaches destination (progress >= 0.8), trigger safe growth
      if (tokenProgress >= 0.8) {
        const growthProgress = interpolate(
          tokenProgress,
          [0.8, 1],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );
        return currentScale + scalePerToken * growthProgress;
      }

      return currentScale;
    }, safeScaleBase);
  }

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
      {/* Wallet */}
      <div
        style={{
          opacity,
          transform: `scale(${walletScale})`,
          transition: "transform 0.2s ease-out",
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

      {/* Safe - appears when transfer phase starts */}
      {isTransferPhase && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(${safeDestinationX}px, ${safeDestinationY}px) scale(${safeScale})`,
            transformOrigin: "center center",
            pointerEvents: "none",
            opacity: 1,
            zIndex: 1,
          }}
        >
          <img
            src={safeSvg}
            alt="Safe"
            style={{
              width: "250px",
              height: "250px",
              display: "block",
            }}
          />
          {/* Safe Balance Display */}
          <div
            style={{
              position: "absolute",
              bottom: "-60px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(36, 115, 150, 0.9)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "20px",
              fontWeight: "bold",
              whiteSpace: "nowrap",
              fontFamily: "monospace",
            }}
          >
            Tokens: {Math.round(safeTokenBalance)}
          </div>
        </div>
      )}

      {/* Wallet Balance Display - positioned above wallet, static size */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, calc(-50% - 250px))",
          backgroundColor: thresholdReached ? "rgba(220, 53, 69, 0.9)" : "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "8px 16px",
          borderRadius: "8px",
          fontSize: "20px",
          fontWeight: "bold",
          whiteSpace: "nowrap",
          fontFamily: "monospace",
          zIndex: 10,
          opacity: blinkOpacity,
          transition: "background-color 0.2s ease",
        }}
      >
        Wallet: {Math.round(currentWalletBalance)}
      </div>

      {/* USDC tokens flowing into wallet from the left (accumulation phase) */}
      {!isTransferPhase && incomingTokens.map((token, index) => {
        const tokenFrame = frame - tokensStartFrame - token.delay;
        if (tokenFrame < 0) return null;

        const tokenProgress = spring({
          frame: tokenFrame,
          fps,
          config: {
            damping: 60,
            stiffness: 240,
          },
        });

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

        const tokenRotation = interpolate(
          tokenProgress,
          [0, 1],
          [0, token.rotation],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        const tokenScale = interpolate(
          tokenProgress,
          [0, 0.4, 1],
          [0.3, token.scale, token.scale],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

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
            key={`incoming-${index}`}
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

      {/* USDC tokens flowing from wallet to safe (transfer phase) */}
      {isTransferPhase && outgoingTokens.slice(0, incomingTokens.length).map((token, index) => {
        const tokenFrame = (frame - transferStartFrame) - token.delay;
        if (tokenFrame < 0) return null;

        const tokenProgress = spring({
          frame: tokenFrame,
          fps,
          config: {
            damping: 60,
            stiffness: 240,
          },
        });

        // Position animation - flows from wallet center to safe destination
        const translateX = interpolate(
          tokenProgress,
          [0, 1],
          [0, safeDestinationX + token.offsetX],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        const translateY = interpolate(
          tokenProgress,
          [0, 1],
          [0, safeDestinationY + token.offsetY],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        const tokenRotation = interpolate(
          tokenProgress,
          [0, 1],
          [0, token.rotation],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        const tokenScale = interpolate(
          tokenProgress,
          [0, 0.4, 1],
          [0.3, token.scale, token.scale],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        // Opacity - fades in and stays visible (doesn't fade out)
        const tokenOpacity = interpolate(
          tokenProgress,
          [0, 0.3, 1],
          [0, 1, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        // Subtle bounce/settle animation when reaching destination
        const settleBounce = tokenProgress >= 0.9
          ? interpolate(
              tokenFrame,
              [token.delay + 27, token.delay + 35],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            )
          : 0;

        const settleY = interpolate(
          settleBounce,
          [0, 0.5, 1],
          [0, -5, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        return (
          <div
            key={`outgoing-${index}`}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(${translateX}px, ${translateY + settleY}px) rotate(${tokenRotation}deg) scale(${tokenScale})`,
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
