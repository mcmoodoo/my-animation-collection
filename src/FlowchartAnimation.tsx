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
        damping: 80,
        stiffness: 300,
      },
    });
  };

  // Node highlight animation with dramatic pulse
  const getNodeHighlight = (phaseStart: number, phaseEnd: number) => {
    if (frame < phaseStart) return 0;
    if (frame > phaseEnd) {
      // Fade out smoothly after phase ends
      const fadeOutProgress = interpolate(
        frame - phaseEnd,
        [0, 20],
        [1, 0],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }
      );
      return fadeOutProgress;
    }
    
    const highlightProgress = spring({
      frame: frame - phaseStart,
      fps,
      config: {
        damping: 80,
        stiffness: 300,
      },
    });
    
    // Strong pulse effect
    const pulse = interpolate(
      (frame - phaseStart) % 30,
      [0, 15, 30],
      [0.5, 1, 0.5],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );
    
    return Math.max(highlightProgress, pulse);
  };

  // Node scale animation - dramatic bounce when activated
  const getNodeScale = (phaseStart: number, phaseEnd: number) => {
    if (frame < phaseStart) return 1;
    if (frame > phaseEnd) {
      // Return to normal scale smoothly after phase ends
      const returnProgress = spring({
        frame: frame - phaseEnd,
        fps,
        config: {
          damping: 100,
          stiffness: 300,
        },
      });
      return interpolate(
        returnProgress,
        [0, 1],
        [1.1, 1], // Start from slightly scaled, return to 1
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }
      );
    }
    
    const phaseFrame = frame - phaseStart;
    const scaleProgress = spring({
      frame: phaseFrame,
      fps,
      config: {
        damping: 60,
        stiffness: 400,
      },
    });
    
    // Bounce effect: scale up then settle
    const bounce = interpolate(
      scaleProgress,
      [0, 0.3, 0.6, 1],
      [1, 1.3, 0.95, 1.1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );
    
    // Continuous pulse while active
    const pulse = interpolate(
      (frame - phaseStart) % 40,
      [0, 20, 40],
      [1, 1.15, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );
    
    return Math.max(bounce, pulse);
  };

  // Particle position along path (0 to 1)
  const getParticlePosition = (progress: number, offset: number = 0) => {
    const particleProgress = (progress + offset) % 1;
    return Math.max(0, Math.min(1, particleProgress));
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

  // Node scales
  const sourceScale = getNodeScale(phase1Start, phase1End);
  const eventScale = getNodeScale(phase2Start, phase2End);
  const keeperScale = getNodeScale(phase2Start, phase4End);
  const rpcScale = Math.max(
    getNodeScale(phase3Start, phase3End),
    getNodeScale(phase4Start, phase4End)
  );
  const safeScale = getNodeScale(phase4Start, phase4End);

  // Background color shift based on active phase
  const getBgColor = () => {
    if (frame < phase2Start) return "#F8FAFC";
    if (frame < phase3Start) return "#FFF7ED";
    if (frame < phase4Start) return "#F0FDF4";
    return "#FEF2F2";
  };
  const bgColor = getBgColor();

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: bgColor,
        padding: "40px",
        transition: "background-color 0.3s ease",
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
            position: "relative",
            zIndex: 1,
          }}
        >
          <Img
            src={flowchartSvg}
            alt="Flowchart"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              position: "relative",
              zIndex: 1,
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
            {/* Glow trail */}
            <path
              d="M315.54,-97.46C414.64,-116.24 549.69,-141.84 637.48,-158.48"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="12"
              strokeDasharray="8,4"
              strokeDashoffset={interpolate(
                edge5Progress,
                [0, 1],
                [400, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )}
              opacity={edge5Progress > 0 ? Math.min(edge5Progress * 2, 1) * 0.4 : 0}
              filter="url(#glow-strong)"
            />
            {/* Main path */}
            <path
              d="M315.54,-97.46C414.64,-116.24 549.69,-141.84 637.48,-158.48"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="6"
              strokeDasharray="8,4"
              strokeDashoffset={interpolate(
                edge5Progress,
                [0, 1],
                [400, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )}
              opacity={edge5Progress > 0 ? Math.min(edge5Progress * 2, 1) : 0}
            />
            {/* Animated particle */}
            {edge5Progress > 0 && edge5Progress < 1 && (() => {
              const particlePos = getParticlePosition(edge5Progress, 0);
              const t = particlePos;
              const x = 315.54 + (637.48 - 315.54) * t;
              const y = -97.46 + (-158.48 - (-97.46)) * t;
              return (
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="#f59e0b"
                  opacity={1}
                  filter="url(#glow-strong)"
                />
              );
            })()}
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
                filter="url(#glow-strong)"
              />
            )}
            
            {/* Edge 1: SourceWallet -> Keeper */}
            {/* Glow trail */}
            <path
              d="M259.81,-263.81C357.27,-245.33 531.81,-212.25 637.61,-192.2"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="12"
              strokeDasharray="8,4"
              strokeDashoffset={interpolate(
                edge1Progress,
                [0, 1],
                [400, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )}
              opacity={edge1Progress > 0 ? Math.min(edge1Progress * 2, 1) * 0.4 : 0}
              filter="url(#glow-strong)"
            />
            {/* Main path */}
            <path
              d="M259.81,-263.81C357.27,-245.33 531.81,-212.25 637.61,-192.2"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="6"
              strokeDasharray="8,4"
              strokeDashoffset={interpolate(
                edge1Progress,
                [0, 1],
                [400, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )}
              opacity={edge1Progress > 0 ? Math.min(edge1Progress * 2, 1) : 0}
            />
            {/* Animated particle */}
            {edge1Progress > 0 && edge1Progress < 1 && (() => {
              const particlePos = getParticlePosition(edge1Progress, 0);
              const t = particlePos;
              const x = 259.81 + (637.61 - 259.81) * t;
              const y = -263.81 + (-192.2 - (-263.81)) * t;
              return (
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="#3b82f6"
                  opacity={1}
                  filter="url(#glow-strong)"
                />
              );
            })()}
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
                filter="url(#glow-strong)"
              />
            )}
            
            {/* Edge 2: Keeper -> RPC (check balance) */}
            {/* Glow trail */}
            <path
              d="M802.14,-162.23C890.01,-146.58 1036.74,-120.44 1130.05,-103.81"
              fill="none"
              stroke="#10b981"
              strokeWidth="12"
              strokeDasharray="8,4"
              strokeDashoffset={interpolate(
                edge2Progress,
                [0, 1],
                [400, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )}
              opacity={edge2Progress > 0 ? Math.min(edge2Progress * 2, 1) * 0.4 : 0}
              filter="url(#glow-strong)"
            />
            {/* Main path */}
            <path
              d="M802.14,-162.23C890.01,-146.58 1036.74,-120.44 1130.05,-103.81"
              fill="none"
              stroke="#10b981"
              strokeWidth="6"
              strokeDasharray="8,4"
              strokeDashoffset={interpolate(
                edge2Progress,
                [0, 1],
                [400, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )}
              opacity={edge2Progress > 0 ? Math.min(edge2Progress * 2, 1) : 0}
            />
            {/* Animated particle */}
            {edge2Progress > 0 && edge2Progress < 1 && (() => {
              const particlePos = getParticlePosition(edge2Progress, 0);
              const t = particlePos;
              const x = 802.14 + (1130.05 - 802.14) * t;
              const y = -162.23 + (-103.81 - (-162.23)) * t;
              return (
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="#10b981"
                  opacity={1}
                  filter="url(#glow-strong)"
                />
              );
            })()}
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
                filter="url(#glow-strong)"
              />
            )}
            
            {/* Edge 4: Keeper -> RPC (send transaction) */}
            {/* Glow trail */}
            <path
              d="M773.24,-129.91C795.78,-110.23 824.78,-89.37 855.3,-79.1 945.3,-48.81 1055.15,-57.54 1129.99,-69.75"
              fill="none"
              stroke="#6b7280"
              strokeWidth="12"
              strokeDasharray="5,2"
              strokeDashoffset={interpolate(
                edge4Progress,
                [0, 1],
                [400, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )}
              opacity={edge4Progress > 0 ? Math.min(edge4Progress * 2, 1) * 0.4 : 0}
              filter="url(#glow-strong)"
            />
            {/* Main path */}
            <path
              d="M773.24,-129.91C795.78,-110.23 824.78,-89.37 855.3,-79.1 945.3,-48.81 1055.15,-57.54 1129.99,-69.75"
              fill="none"
              stroke="#6b7280"
              strokeWidth="6"
              strokeDasharray="5,2"
              strokeDashoffset={interpolate(
                edge4Progress,
                [0, 1],
                [400, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )}
              opacity={edge4Progress > 0 ? Math.min(edge4Progress * 2, 1) : 0}
            />
            {/* Animated particle */}
            {edge4Progress > 0 && edge4Progress < 1 && (() => {
              const particlePos = getParticlePosition(edge4Progress, 0);
              const t = particlePos;
              const x = 773.24 + (1129.99 - 773.24) * t;
              const y = -129.91 + (-69.75 - (-129.91)) * t;
              return (
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="#6b7280"
                  opacity={1}
                  filter="url(#glow-strong)"
                />
              );
            })()}
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
                filter="url(#glow-strong)"
              />
            )}
            
            {/* Edge 3: Keeper -> SafeWallet */}
            {/* Glow trail */}
            <path
              d="M802.14,-191.18C886.82,-209.39 1026.16,-239.35 1119.68,-259.46"
              fill="none"
              stroke="#ef4444"
              strokeWidth="12"
              strokeDasharray="8,4"
              strokeDashoffset={interpolate(
                edge3Progress,
                [0, 1],
                [400, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )}
              opacity={edge3Progress > 0 ? Math.min(edge3Progress * 2, 1) * 0.4 : 0}
              filter="url(#glow-strong)"
            />
            {/* Main path */}
            <path
              d="M802.14,-191.18C886.82,-209.39 1026.16,-239.35 1119.68,-259.46"
              fill="none"
              stroke="#ef4444"
              strokeWidth="6"
              strokeDasharray="8,4"
              strokeDashoffset={interpolate(
                edge3Progress,
                [0, 1],
                [400, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )}
              opacity={edge3Progress > 0 ? Math.min(edge3Progress * 2, 1) : 0}
            />
            {/* Animated particle */}
            {edge3Progress > 0 && edge3Progress < 1 && (() => {
              const particlePos = getParticlePosition(edge3Progress, 0);
              const t = particlePos;
              const x = 802.14 + (1119.68 - 802.14) * t;
              const y = -191.18 + (-259.46 - (-191.18)) * t;
              return (
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="#ef4444"
                  opacity={1}
                  filter="url(#glow-strong)"
                />
              );
            })()}
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
                filter="url(#glow-strong)"
              />
            )}
            
            {/* Filter definitions */}
            <defs>
              <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
          </g>
        </svg>

        {/* Pulsing node overlays - matching actual node shapes, on top */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 20,
          }}
          viewBox="0.00 0.00 1307.90 332.90"
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform="scale(1 1) rotate(0) translate(4 328.9)">
            {/* Event node - diamond shape pulsing */}
            {eventHighlight > 0 && (
              <g transform={`translate(187.35, -67.92) scale(${eventScale}) translate(-187.35, 67.92)`}>
                <path
                  d="M176.18,-142.33C176.18,-142.33 11.17,-77.72 11.17,-77.72 5.59,-75.54 5.59,-71.16 11.17,-68.98 11.17,-68.98 176.18,-4.37 176.18,-4.37 181.76,-2.19 192.94,-2.19 198.52,-4.37 198.52,-4.37 363.53,-68.98 363.53,-68.98 369.11,-71.16 369.11,-75.54 363.53,-77.72 363.53,-77.72 198.52,-142.33 198.52,-142.33 192.94,-144.51 181.76,-144.51 176.18,-142.33"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="5"
                  opacity={eventHighlight}
                  filter="url(#glow-pulse)"
                />
              </g>
            )}
            
            {/* Source Wallet - rounded rectangle pulsing */}
            {sourceHighlight > 0 && (
              <g transform={`translate(187.35, -277.3) scale(${sourceScale}) translate(-187.35, 277.3)`}>
                <path
                  d="M246.9,-321.9C246.9,-321.9 127.8,-321.9 127.8,-321.9 121.8,-321.9 115.8,-315.9 115.8,-309.9 115.8,-309.9 115.8,-244.8 115.8,-244.8 115.8,-238.8 121.8,-232.8 127.8,-232.8 127.8,-232.8 246.9,-232.8 246.9,-232.8 252.9,-232.8 258.9,-238.8 258.9,-244.8 258.9,-244.8 258.9,-309.9 258.9,-309.9 258.9,-315.9 252.9,-321.9 246.9,-321.9"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="5"
                  opacity={sourceHighlight}
                  filter="url(#glow-pulse)"
                />
              </g>
            )}
            
            {/* Keeper - rounded rectangle pulsing */}
            {keeperHighlight > 0 && (
              <g transform={`translate(727.5, -175.35) scale(${keeperScale}) translate(-727.5, 175.35)`}>
                <path
                  d="M789.3,-219.9C789.3,-219.9 665.7,-219.9 665.7,-219.9 659.7,-219.9 653.7,-213.9 653.7,-207.9 653.7,-207.9 653.7,-142.8 653.7,-142.8 653.7,-136.8 659.7,-130.8 665.7,-130.8 665.7,-130.8 789.3,-130.8 789.3,-130.8 795.3,-130.8 801.3,-136.8 801.3,-142.8 801.3,-142.8 801.3,-207.9 801.3,-207.9 801.3,-213.9 795.3,-219.9 789.3,-219.9"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="5"
                  opacity={keeperHighlight}
                  filter="url(#glow-pulse)"
                />
              </g>
            )}
            
            {/* RPC - rounded rectangle pulsing */}
            {rpcHighlight > 0 && (
              <g transform={`translate(1217.85, -88.35) scale(${rpcScale}) translate(-1217.85, 88.35)`}>
                <path
                  d="M1277.4,-132.9C1277.4,-132.9 1158.3,-132.9 1158.3,-132.9 1152.3,-132.9 1146.3,-126.9 1146.3,-120.9 1146.3,-120.9 1146.3,-55.8 1146.3,-55.8 1146.3,-49.8 1152.3,-43.8 1158.3,-43.8 1158.3,-43.8 1277.4,-43.8 1277.4,-43.8 1283.4,-43.8 1289.4,-49.8 1289.4,-55.8 1289.4,-55.8 1289.4,-120.9 1289.4,-120.9 1289.4,-126.9 1283.4,-132.9 1277.4,-132.9"
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="5"
                  opacity={rpcHighlight}
                  filter="url(#glow-pulse)"
                />
              </g>
            )}
            
            {/* Safe Wallet - rounded rectangle pulsing */}
            {safeHighlight > 0 && (
              <g transform={`translate(1217.85, -280.35) scale(${safeScale}) translate(-1217.85, 280.35)`}>
                <path
                  d="M1287.9,-324.9C1287.9,-324.9 1147.8,-324.9 1147.8,-324.9 1141.8,-324.9 1135.8,-318.9 1135.8,-312.9 1135.8,-312.9 1135.8,-247.8 1135.8,-247.8 1135.8,-241.8 1141.8,-235.8 1147.8,-235.8 1147.8,-235.8 1287.9,-235.8 1287.9,-235.8 1293.9,-235.8 1299.9,-241.8 1299.9,-247.8 1299.9,-247.8 1299.9,-312.9 1299.9,-312.9 1299.9,-318.9 1293.9,-324.9 1287.9,-324.9"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="5"
                  opacity={safeHighlight}
                  filter="url(#glow-pulse)"
                />
              </g>
            )}
            
            {/* Glow filter for pulsing effect */}
            <defs>
              <filter id="glow-pulse" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
          </g>
        </svg>

        {/* Phase labels with dramatic styling */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: `translateX(-50%) scale(${interpolate(
              frame % 60,
              [0, 5, 55, 60],
              [1, 1.05, 1.05, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            )})`,
            backgroundColor: (() => {
              if (frame < phase2Start) return "rgba(99, 102, 241, 0.95)";
              if (frame < phase3Start) return "rgba(245, 158, 11, 0.95)";
              if (frame < phase4Start) return "rgba(16, 185, 129, 0.95)";
              return "rgba(239, 68, 68, 0.95)";
            })(),
            color: "white",
            padding: "16px 32px",
            borderRadius: "12px",
            fontSize: "22px",
            fontWeight: "bold",
            fontFamily: "Arial",
            zIndex: 20,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
            transition: "all 0.3s ease",
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
