import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import flowchartSvg from "./assets/flowchart-manual.svg";

export const FlowchartAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation phases (in frames)
  const phaseDuration = 60; // 2 seconds per phase at 30fps
  const pauseBetweenPhases = 20; // pause between phases
  
  // Phase 1: Setup - SourceWallet approves Keeper
  const phase1Start = 0;
  const phase1End = phase1Start + phaseDuration;
  
  // Phase 2: Event trigger fires -> Keeper
  const phase2Start = phase1End + pauseBetweenPhases;
  const phase2End = phase2Start + phaseDuration;
  
  // Phase 3: Keeper -> RPC (check balance)
  const phase3Start = phase2End + pauseBetweenPhases;
  const phase3End = phase3Start + phaseDuration;
  
  // Phase 4: Transfer to Safe + Send transaction (happen together)
  const phase4Start = phase3End + pauseBetweenPhases;
  const phase4End = phase4Start + phaseDuration;

  // Fade in entire flowchart
  const fadeIn = spring({
    frame,
    fps,
    config: {
      damping: 100,
    },
  });

  const opacity = interpolate(
    fadeIn,
    [0, 1],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Calculate path animation progress for each edge
  const getPathProgress = (phaseStart: number, phaseEnd: number) => {
    if (frame < phaseStart) return 0;
    if (frame > phaseEnd) return 1;
    
    return spring({
      frame: frame - phaseStart,
      fps,
      config: {
        damping: 100,
        stiffness: 200,
      },
    });
  };

  // Node highlight animation
  const getNodeHighlight = (phaseStart: number, phaseEnd: number) => {
    if (frame < phaseStart) return 0;
    if (frame > phaseEnd + 30) return 0; // Fade out after phase ends
    
    const highlightProgress = spring({
      frame: frame - phaseStart,
      fps,
      config: {
        damping: 100,
        stiffness: 200,
      },
    });
    
    // Pulse effect - fade in and out
    const pulse = interpolate(
      (frame - phaseStart) % 40,
      [0, 20, 40],
      [0.3, 1, 0.3],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );
    
    return Math.max(highlightProgress, pulse);
  };

  // Edge 1: SourceWallet -> Keeper (approve) - Phase 1
  const edge1Progress = getPathProgress(phase1Start, phase1End);
  
  // Edge 5: Event -> Keeper (trigger) - Phase 2
  const edge5Progress = getPathProgress(phase2Start, phase2End);
  
  // Edge 2: Keeper -> RPC (check balance) - Phase 3
  const edge2Progress = getPathProgress(phase3Start, phase3End);
  
  // Edge 3: Keeper -> SafeWallet (transfer) - Phase 4
  const edge3Progress = getPathProgress(phase4Start, phase4End);
  
  // Edge 4: Keeper -> RPC (send transaction) - Phase 4 (happens with transfer)
  const edge4Progress = getPathProgress(phase4Start, phase4End);

  // Node highlights
  const sourceHighlight = getNodeHighlight(phase1Start, phase1End);
  const eventHighlight = getNodeHighlight(phase2Start, phase2End);
  const keeperHighlight = getNodeHighlight(phase2Start, phase4End); // Keeper stays active from trigger through transfer
  const rpcHighlight = Math.max(
    getNodeHighlight(phase3Start, phase3End), // Check balance
    getNodeHighlight(phase4Start, phase4End)  // Send transaction
  );
  const safeHighlight = getNodeHighlight(phase4Start, phase4End);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F8FAFC",
        padding: "40px",
      }}
    >
      <div
        style={{
          opacity,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* SVG Container */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Img
            src={flowchartSvg}
            alt="Flowchart"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Animated overlays for edges */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 10,
          }}
          viewBox="0.00 0.00 1307.90 332.90"
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform="scale(1 1) rotate(0) translate(4 328.9)">
            {/* Edge 5: Event -> Keeper */}
            <path
              d="M315.54,-97.46C414.64,-116.24 549.69,-141.84 637.48,-158.48"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="4"
              strokeDasharray="8,4"
              strokeDashoffset={interpolate(
                edge5Progress,
                [0, 1],
                [400, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )}
              opacity={edge5Progress > 0 ? Math.min(edge5Progress * 2, 1) : 0}
            />
            {/* Arrowhead for edge 5 */}
            {edge5Progress > 0.8 && (
              <polygon
                points="636.48,-162.56 649.05,-160.67 638.04,-154.31"
                fill="#f59e0b"
                opacity={interpolate(
                  edge5Progress,
                  [0.8, 1],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                )}
              />
            )}
            
            {/* Edge 1: SourceWallet -> Keeper */}
            <path
              d="M259.81,-263.81C357.27,-245.33 531.81,-212.25 637.61,-192.2"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeDasharray="8,4"
              strokeDashoffset={interpolate(
                edge1Progress,
                [0, 1],
                [400, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )}
              opacity={edge1Progress > 0 ? Math.min(edge1Progress * 2, 1) : 0}
            />
            {/* Arrowhead for edge 1 */}
            {edge1Progress > 0.8 && (
              <polygon
                points="638.29,-196.34 649.3,-189.98 636.73,-188.09"
                fill="#3b82f6"
                opacity={interpolate(
                  edge1Progress,
                  [0.8, 1],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                )}
              />
            )}
            
            {/* Edge 2: Keeper -> RPC (check balance) */}
            <path
              d="M802.14,-162.23C890.01,-146.58 1036.74,-120.44 1130.05,-103.81"
              fill="none"
              stroke="#10b981"
              strokeWidth="4"
              strokeDasharray="8,4"
              strokeDashoffset={interpolate(
                edge2Progress,
                [0, 1],
                [400, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )}
              opacity={edge2Progress > 0 ? Math.min(edge2Progress * 2, 1) : 0}
            />
            {/* Arrowhead for edge 2 */}
            {edge2Progress > 0.8 && (
              <polygon
                points="1130.59,-107.98 1141.67,-101.74 1129.12,-99.71"
                fill="#10b981"
                opacity={interpolate(
                  edge2Progress,
                  [0.8, 1],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                )}
              />
            )}
            
            {/* Edge 4: Keeper -> RPC (send transaction) */}
            <path
              d="M773.24,-129.91C795.78,-110.23 824.78,-89.37 855.3,-79.1 945.3,-48.81 1055.15,-57.54 1129.99,-69.75"
              fill="none"
              stroke="#6b7280"
              strokeWidth="4"
              strokeDasharray="5,2"
              strokeDashoffset={interpolate(
                edge4Progress,
                [0, 1],
                [400, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )}
              opacity={edge4Progress > 0 ? Math.min(edge4Progress * 2, 1) : 0}
            />
            {/* Arrowhead for edge 4 */}
            {edge4Progress > 0.8 && (
              <polygon
                points="1129.14,-73.87 1141.67,-71.76 1130.56,-65.59"
                fill="#6b7280"
                opacity={interpolate(
                  edge4Progress,
                  [0.8, 1],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                )}
              />
            )}
            
            {/* Edge 3: Keeper -> SafeWallet */}
            <path
              d="M802.14,-191.18C886.82,-209.39 1026.16,-239.35 1119.68,-259.46"
              fill="none"
              stroke="#ef4444"
              strokeWidth="4"
              strokeDasharray="8,4"
              strokeDashoffset={interpolate(
                edge3Progress,
                [0, 1],
                [400, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )}
              opacity={edge3Progress > 0 ? Math.min(edge3Progress * 2, 1) : 0}
            />
            {/* Arrowhead for edge 3 */}
            {edge3Progress > 0.8 && (
              <polygon
                points="1118.54,-263.51 1131.15,-261.92 1120.3,-255.3"
                fill="#ef4444"
                opacity={interpolate(
                  edge3Progress,
                  [0.8, 1],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                )}
              />
            )}
          </g>
        </svg>

        {/* Node highlight overlays */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 5,
          }}
          viewBox="0.00 0.00 1307.90 332.90"
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform="scale(1 1) rotate(0) translate(4 328.9)">
            {/* Event node highlight */}
            {eventHighlight > 0 && (
              <ellipse
                cx="187.35"
                cy="-67.92"
                rx="180"
                ry="70"
                fill="rgba(245, 158, 11, 0.3)"
                opacity={eventHighlight}
                filter="url(#glow)"
              />
            )}
            
            {/* Source Wallet highlight */}
            {sourceHighlight > 0 && (
              <ellipse
                cx="187.35"
                cy="-277.3"
                rx="80"
                ry="50"
                fill="rgba(99, 102, 241, 0.3)"
                opacity={sourceHighlight}
                filter="url(#glow)"
              />
            )}
            
            {/* Keeper highlight */}
            {keeperHighlight > 0 && (
              <ellipse
                cx="727.5"
                cy="-175.35"
                rx="80"
                ry="50"
                fill="rgba(16, 185, 129, 0.3)"
                opacity={keeperHighlight}
                filter="url(#glow)"
              />
            )}
            
            {/* RPC highlight */}
            {rpcHighlight > 0 && (
              <ellipse
                cx="1217.85"
                cy="-88.35"
                rx="80"
                ry="50"
                fill="rgba(124, 58, 237, 0.3)"
                opacity={rpcHighlight}
                filter="url(#glow)"
              />
            )}
            
            {/* Safe Wallet highlight */}
            {safeHighlight > 0 && (
              <ellipse
                cx="1217.85"
                cy="-280.35"
                rx="80"
                ry="50"
                fill="rgba(5, 150, 105, 0.3)"
                opacity={safeHighlight}
                filter="url(#glow)"
              />
            )}
            
            {/* Glow filter definition */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
          </g>
        </svg>

        {/* Phase labels */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "18px",
            fontWeight: "bold",
            fontFamily: "Arial",
            zIndex: 20,
          }}
        >
          {frame < phase2Start && "Phase 1: Source Wallet approves Keeper"}
          {frame >= phase2Start && frame < phase3Start && "Phase 2: Event triggers Keeper"}
          {frame >= phase3Start && frame < phase4Start && "Phase 3: Keeper checks balance via RPC"}
          {frame >= phase4Start && "Phase 4: Transfer to Safe Wallet (if threshold met)"}
        </div>
      </div>
    </AbsoluteFill>
  );
};
