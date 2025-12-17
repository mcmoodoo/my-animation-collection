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
  // Each bill has a value for accounting
  const billValue = 100; // Each bill is worth $100
  const moneyBills = [
    { delay: 0, offsetX: 0, offsetY: 0, rotation: 0, scale: 0.6, value: billValue },
    { delay: 8, offsetX: 15, offsetY: -10, rotation: 5, scale: 0.65, value: billValue },
    { delay: 16, offsetX: -10, offsetY: -5, rotation: -8, scale: 0.6, value: billValue },
    { delay: 24, offsetX: 20, offsetY: -15, rotation: 10, scale: 0.7, value: billValue },
    { delay: 32, offsetX: -5, offsetY: -8, rotation: -5, scale: 0.65, value: billValue },
    { delay: 40, offsetX: 10, offsetY: -12, rotation: 8, scale: 0.6, value: billValue },
    { delay: 48, offsetX: -15, offsetY: -3, rotation: -10, scale: 0.65, value: billValue },
    { delay: 56, offsetX: 5, offsetY: -18, rotation: 3, scale: 0.6, value: billValue },
  ];

  const totalWalletValue = moneyBills.length * billValue; // Starting wallet balance

  // Calculate safe scale and balances based on bills that have arrived/left
  // Each bill arrival triggers safe growth, each bill departure triggers wallet shrinkage
  const safeScaleBase = 0.3; // Start small
  const walletScaleBase = 1.0; // Start at full size
  const scalePerBill = (1.1 - safeScaleBase) / moneyBills.length; // Distribute growth across all bills
  
  // Calculate balances and safe scale
  let safeBalance = 0;
  
  // Calculate safe scale and balance based on bills that have arrived
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
    
    // Calculate how much of this bill's value has transferred
    // Transfer happens gradually as bill moves (0% at wallet, 100% at safe)
    const transferProgress = interpolate(
      billProgress,
      [0, 1],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );
    
    // Accumulate balance (this runs for each bill)
    safeBalance += bill.value * transferProgress;
    
    // When bill reaches destination (progress >= 0.8), trigger safe growth
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
  const walletBalance = totalWalletValue - safeBalance;

  // Wallet shrinks as bills leave (opposite of safe growth)
  const walletScale = interpolate(
    safeScale,
    [safeScaleBase, 1.1],
    [walletScaleBase, 0.5],
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
      {/* Wallet - shrinks as money flows out */}
      <div
        style={{
          opacity,
          transform: `scale(${scale * walletScale}) rotate(${rotation}deg)`,
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
        {/* Wallet Balance Display */}
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
          Safe: ${Math.round(safeBalance).toLocaleString()}
        </div>
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
