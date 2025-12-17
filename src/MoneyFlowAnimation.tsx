import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import walletSvg from "./assets/wallet.svg";
import usdcSvg from "./assets/usdc.svg";
import safeSvg from "./assets/safe.svg";

export const MoneyFlowAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Constants
  const flowThreshold = 100; // $100 threshold
  const billValue = 100; // Each token/bill is worth $100
  const accumulationStart = 20; // When tokens start flowing IN
  const safeDestinationX = 400; // Safe position (right side)
  const safeDestinationY = -250;
  const tokenSourceX = -500; // Source position (left side, off-screen)

  // Wallet starts small, no rotation
  const walletScaleBase = 0.5;
  const walletScaleMax = 1.0;

  // Incoming tokens configuration
  const incomingTokens = [
    { delay: 0, rotation: 10, scale: 0.6 },
    { delay: 12, rotation: -15, scale: 0.65 },
    { delay: 24, rotation: 20, scale: 0.6 },
    { delay: 36, rotation: -10, scale: 0.7 },
    { delay: 48, rotation: 15, scale: 0.65 },
    { delay: 60, rotation: -20, scale: 0.6 },
    { delay: 72, rotation: 8, scale: 0.65 },
    { delay: 84, rotation: -12, scale: 0.6 },
  ];

  // Outgoing bills configuration
  const outgoingBills = [
    { delay: 0, offsetX: 0, offsetY: 0, rotation: 0, scale: 0.6 },
    { delay: 8, offsetX: 15, offsetY: -10, rotation: 5, scale: 0.65 },
    { delay: 16, offsetX: -10, offsetY: -5, rotation: -8, scale: 0.6 },
    { delay: 24, offsetX: 20, offsetY: -15, rotation: 10, scale: 0.7 },
    { delay: 32, offsetX: -5, offsetY: -8, rotation: -5, scale: 0.65 },
    { delay: 40, offsetX: 10, offsetY: -12, rotation: 8, scale: 0.6 },
    { delay: 48, offsetX: -15, offsetY: -3, rotation: -10, scale: 0.65 },
    { delay: 56, offsetX: 5, offsetY: -18, rotation: 3, scale: 0.6 },
  ];

  // ===== PHASE 1: ACCUMULATION =====
  // Calculate accumulated balance from incoming tokens
  let accumulatedBalance = 0;
  let thresholdReachedFrame = 0;

  incomingTokens.forEach((token) => {
    const tokenFrame = frame - accumulationStart - token.delay;
    if (tokenFrame < 0) return;

    const tokenProgress = spring({
      frame: tokenFrame,
      fps,
      config: {
        damping: 60,
        stiffness: 120,
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

    const previousBalance = accumulatedBalance;
    accumulatedBalance += billValue * arrivalProgress;

    // Record the exact frame when threshold is first reached
    if (previousBalance < flowThreshold && accumulatedBalance >= flowThreshold && thresholdReachedFrame === 0) {
      thresholdReachedFrame = frame;
    }
  });

  // Determine if we're in accumulation or transfer phase
  const isTransferPhase = thresholdReachedFrame > 0 && frame >= thresholdReachedFrame;
  
  // Calculate the balance at the moment threshold was reached (freeze it)
  let frozenBalanceAtThreshold = 0;
  if (thresholdReachedFrame > 0) {
    incomingTokens.forEach((token) => {
      const tokenFrame = thresholdReachedFrame - accumulationStart - token.delay;
      if (tokenFrame < 0) return;
      const tokenProgress = spring({
        frame: tokenFrame,
        fps,
        config: { damping: 60, stiffness: 120 },
      });
      const arrivalProgress = interpolate(tokenProgress, [0, 1], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      frozenBalanceAtThreshold += billValue * arrivalProgress;
    });
  }

  // ===== PHASE 2: TRANSFER =====
  // Calculate safe balance from outgoing bills
  let safeBalance = 0;
  const transferStartFrame = thresholdReachedFrame;

  if (isTransferPhase) {
    const transferFrame = frame - transferStartFrame;
    const numBillsToTransfer = Math.ceil(frozenBalanceAtThreshold / billValue);

    outgoingBills.slice(0, numBillsToTransfer).forEach((bill) => {
      const billFrame = transferFrame - bill.delay;
      if (billFrame < 0) return;

      const billProgress = spring({
        frame: billFrame,
        fps,
        config: {
          damping: 60,
          stiffness: 120,
        },
      });

      const transferProgress = interpolate(
        billProgress,
        [0, 1],
        [0, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }
      );

      const remainingToTransfer = frozenBalanceAtThreshold - safeBalance;
      const thisBillTransfer = Math.min(billValue * transferProgress, remainingToTransfer);
      safeBalance += thisBillTransfer;
    });
  }

  // ===== WALLET BALANCE =====
  // During accumulation: use accumulatedBalance
  // During transfer: use frozenBalanceAtThreshold - safeBalance (decreases to 0)
  const walletBalance = isTransferPhase 
    ? Math.max(0, frozenBalanceAtThreshold - safeBalance)
    : accumulatedBalance;

  // ===== WALLET SCALE =====
  // Grows during accumulation, shrinks during transfer
  let walletScale = walletScaleBase;
  
  if (isTransferPhase) {
    // Shrink during transfer (from max to base as money flows out)
    const shrinkProgress = frozenBalanceAtThreshold > 0 
      ? safeBalance / frozenBalanceAtThreshold 
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
    // Grow during accumulation (from base to max as balance increases)
    const growthProgress = Math.min(accumulatedBalance / flowThreshold, 1);
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
  // Safe grows as bills arrive
  const safeScaleBase = 0.3;
  const safeScaleMax = 1.1;
  const scalePerBill = (safeScaleMax - safeScaleBase) / outgoingBills.length;
  
  let safeScale = safeScaleBase;
  if (isTransferPhase) {
    const numBillsToTransferForScale = Math.ceil(frozenBalanceAtThreshold / billValue);
    safeScale = outgoingBills.slice(0, numBillsToTransferForScale).reduce((currentScale, bill) => {
      const billFrame = (frame - transferStartFrame) - bill.delay;
      if (billFrame < 0) return currentScale;

      const billProgress = spring({
        frame: billFrame,
        fps,
        config: {
          damping: 60,
          stiffness: 120,
        },
      });

      if (billProgress >= 0.8) {
        const growthProgress = interpolate(
          billProgress,
          [0.8, 1],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );
        return currentScale + scalePerBill * growthProgress;
      }

      return currentScale;
    }, safeScaleBase);
  }

  // ===== THRESHOLD STATUS =====
  const thresholdReached = walletBalance >= flowThreshold;

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
          opacity: 1,
          transform: `scale(${walletScale})`,
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
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "20px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            fontFamily: "monospace",
          }}
        >
          Wallet: ${Math.round(walletBalance).toLocaleString()}
        </div>
      </div>

      {/* Safe - appears when threshold is reached */}
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
            Safe: ${Math.round(safeBalance).toLocaleString()}
          </div>
        </div>
      )}

      {/* Threshold Banner */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: thresholdReached ? "rgba(76, 175, 80, 0.9)" : "rgba(255, 152, 0, 0.9)",
          color: "white",
          padding: "12px 24px",
          borderRadius: "8px",
          fontSize: "24px",
          fontWeight: "bold",
          whiteSpace: "nowrap",
          fontFamily: "monospace",
          zIndex: 10,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
        }}
      >
        Threshold: ${flowThreshold.toLocaleString()}
        {thresholdReached && (
          <span style={{ marginLeft: "12px", fontSize: "18px" }}>✓ Transferring...</span>
        )}
      </div>

      {/* Incoming tokens - only show during accumulation phase */}
      {!isTransferPhase && incomingTokens.map((token, index) => {
        const tokenFrame = frame - accumulationStart - token.delay;
        if (tokenFrame < 0) return null;

        // Stop showing tokens once threshold is reached
        if (thresholdReachedFrame > 0 && frame >= thresholdReachedFrame) {
          return null;
        }

        const tokenProgress = spring({
          frame: tokenFrame,
          fps,
          config: {
            damping: 60,
            stiffness: 120,
          },
        });

        const translateX = interpolate(
          tokenProgress,
          [0, 1],
          [tokenSourceX, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        const translateY = interpolate(
          tokenProgress,
          [0, 1],
          [0, 0],
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
          [0, 0.2, 0.9, 1],
          [0, 1, 1, 0],
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

      {/* Outgoing bills - only show during transfer phase */}
      {isTransferPhase && (() => {
        const numBillsToTransfer = Math.ceil(frozenBalanceAtThreshold / billValue);
        return outgoingBills.slice(0, numBillsToTransfer).map((bill, index) => {
          const billFrame = (frame - transferStartFrame) - bill.delay;
          if (billFrame < 0) return null;

          const billProgress = spring({
            frame: billFrame,
            fps,
            config: {
              damping: 60,
              stiffness: 120,
            },
          });

          const translateX = interpolate(
            billProgress,
            [0, 1],
            [0, safeDestinationX + bill.offsetX],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }
          );

          const translateY = interpolate(
            billProgress,
            [0, 1],
            [0, safeDestinationY + bill.offsetY],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }
          );

          const billRotation = interpolate(
            billProgress,
            [0, 1],
            [0, bill.rotation],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }
          );

          const billScale = interpolate(
            billProgress,
            [0, 0.4, 1],
            [0.3, bill.scale, bill.scale],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }
          );

          const billOpacity = interpolate(
            billProgress,
            [0, 0.3, 1],
            [0, 1, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }
          );

          const settleBounce = billProgress >= 0.9
            ? interpolate(
                billFrame,
                [bill.delay + 27, bill.delay + 35],
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
                transform: `translate(${translateX}px, ${translateY + settleY}px) rotate(${billRotation}deg) scale(${billScale})`,
                opacity: billOpacity,
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
        });
      })()}
    </AbsoluteFill>
  );
};
