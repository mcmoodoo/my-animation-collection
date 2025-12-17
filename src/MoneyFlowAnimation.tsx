import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import walletSvg from "./assets/wallet.svg";
import moneySvg from "./assets/money.svg";
import safeSvg from "./assets/safe.svg";

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

  // Safe destination location (top-right area)
  const safeDestinationX = 400;
  const safeDestinationY = -250;

  // Create multiple money bills flowing to the safe destination
  // Each bill has slight offset at destination to create a stack/pile effect
  const moneyBills = [
    { delay: 0, offsetX: 0, offsetY: 0, rotation: 0, scale: 0.6 },
    { delay: 8, offsetX: 15, offsetY: -10, rotation: 5, scale: 0.65 },
    { delay: 16, offsetX: -10, offsetY: -5, rotation: -8, scale: 0.6 },
    { delay: 24, offsetX: 20, offsetY: -15, rotation: 10, scale: 0.7 },
    { delay: 32, offsetX: -5, offsetY: -8, rotation: -5, scale: 0.65 },
    { delay: 40, offsetX: 10, offsetY: -12, rotation: 8, scale: 0.6 },
    { delay: 48, offsetX: -15, offsetY: -3, rotation: -10, scale: 0.65 },
    { delay: 56, offsetX: 5, offsetY: -18, rotation: 3, scale: 0.6 },
  ];

  // Calculate safe scale based on bills that have arrived
  // Each bill arrival triggers growth incrementally
  const safeScaleBase = 0.3; // Start small
  const scalePerBill = (1.1 - safeScaleBase) / moneyBills.length; // Distribute growth across all bills
  
  const safeScale = moneyBills.reduce((currentScale, bill) => {
    const billFrame = frame - moneyFlowStart - bill.delay;
    if (billFrame < 0) return currentScale;
    
    const billProgress = spring({
      frame: billFrame,
      fps,
      config: {
        damping: 60,
        stiffness: 120,
      },
    });
    
    // When bill reaches destination (progress >= 0.8), trigger safe growth
    if (billProgress >= 0.8) {
      // Each bill adds growth incrementally as it arrives
      const growthProgress = interpolate(
        billProgress,
        [0.8, 1],
        [0, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }
      );
      
      // Each bill contributes its portion of the total growth
      return currentScale + scalePerBill * growthProgress;
    }
    
    return currentScale;
  }, safeScaleBase);

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

      {/* Safe destination - grows as bills arrive */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(${safeDestinationX}px, ${safeDestinationY}px) scale(${safeScale})`,
          transformOrigin: "center center",
          pointerEvents: "none",
          opacity: interpolate(
            fadeIn,
            [0, 1],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }
          ),
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
      </div>

      {/* Money bills flowing to safe destination */}
      {moneyBills.map((bill, index) => {
        const billFrame = frame - moneyFlowStart - bill.delay;
        const billProgress = spring({
          frame: billFrame,
          fps,
          config: {
            damping: 60,
            stiffness: 120,
          },
        });

        // Position animation - flows from wallet to safe destination
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

        // Rotation animation - settles at destination
        const billRotation = interpolate(
          billProgress,
          [0, 1],
          [0, bill.rotation],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        // Scale animation - starts small, grows to full size, stays at destination
        const billScale = interpolate(
          billProgress,
          [0, 0.4, 1],
          [0.3, bill.scale, bill.scale],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        // Opacity - fades in and stays visible (doesn't fade out)
        const billOpacity = interpolate(
          billProgress,
          [0, 0.3, 1],
          [0, 1, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        // Subtle bounce/settle animation when reaching destination
        const settleBounce = billProgress >= 0.9
          ? interpolate(
              billFrame,
              [moneyFlowStart + bill.delay + 27, moneyFlowStart + bill.delay + 35],
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

        if (billFrame < 0) return null;

        return (
          <div
            key={index}
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
