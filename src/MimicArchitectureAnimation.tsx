import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import planningSvg from "./assets/mimic-planning.svg";
import executionSvg from "./assets/mimic-execution.svg";
import securitySvg from "./assets/mimic-security.svg";

export const MimicArchitectureAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation phases
  const phaseDuration = 90; // 3 seconds per phase at 30fps
  const pauseBetweenPhases = 30; // 1 second pause
  
  // Phase 1: Planning layer
  const phase1Start = 0;
  const phase1End = phase1Start + phaseDuration;
  
  // Phase 2: Execution layer
  const phase2Start = phase1End + pauseBetweenPhases;
  const phase2End = phase2Start + phaseDuration;
  
  // Phase 3: Security layer
  const phase3Start = phase2End + pauseBetweenPhases;
  const phase3End = phase3Start + phaseDuration;
  
  // Phase 4: All layers together
  const phase4Start = phase3End + pauseBetweenPhases;
  const phase4End = phase4Start + phaseDuration * 2;

  // Fade in animation
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

  // Layer opacity animations
  const getLayerOpacity = (phaseStart: number, phaseEnd: number, stayVisible: boolean = false) => {
    if (frame < phaseStart) return 0;
    if (frame > phaseEnd && !stayVisible) {
      // Fade out after phase ends
      return interpolate(
        frame - phaseEnd,
        [0, 20],
        [1, 0],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }
      );
    }
    
    const layerProgress = spring({
      frame: frame - phaseStart,
      fps,
      config: {
        damping: 100,
        stiffness: 200,
      },
    });
    
    return interpolate(
      layerProgress,
      [0, 1],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );
  };

  // Layer scale animations
  const getLayerScale = (phaseStart: number, phaseEnd: number, stayVisible: boolean = false) => {
    if (frame < phaseStart) return 0.8;
    if (frame > phaseEnd && !stayVisible) {
      return interpolate(
        frame - phaseEnd,
        [0, 20],
        [1, 0.8],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }
      );
    }
    
    const scaleProgress = spring({
      frame: frame - phaseStart,
      fps,
      config: {
        damping: 80,
        stiffness: 300,
      },
    });
    
    return interpolate(
      scaleProgress,
      [0, 0.3, 1],
      [0.8, 1.1, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );
  };

  // Planning layer
  const planningOpacity = getLayerOpacity(phase1Start, phase1End, frame >= phase4Start);
  const planningScale = getLayerScale(phase1Start, phase1End, frame >= phase4Start);
  
  // Execution layer
  const executionOpacity = getLayerOpacity(phase2Start, phase2End, frame >= phase4Start);
  const executionScale = getLayerScale(phase2Start, phase2End, frame >= phase4Start);
  
  // Security layer
  const securityOpacity = getLayerOpacity(phase3Start, phase3End, frame >= phase4Start);
  const securityScale = getLayerScale(phase3Start, phase3End, frame >= phase4Start);

  // Background color shift
  const getBgColor = () => {
    if (frame < phase2Start) return "#0A0A0F";
    if (frame < phase3Start) return "#0F0A15";
    if (frame < phase4Start) return "#0A0F15";
    return "#0A0A0F";
  };
  const bgColor = getBgColor();

  // Layer labels
  const getCurrentLabel = () => {
    if (frame < phase2Start) return "Layer 1: Planning";
    if (frame < phase3Start) return "Layer 2: Execution";
    if (frame < phase4Start) return "Layer 3: Security";
    return "Three-Layer Architecture";
  };

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
        {/* Planning Layer */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: planningOpacity,
            transform: `scale(${planningScale})`,
            transition: "all 0.3s ease",
            zIndex: frame >= phase4Start ? 1 : 10,
          }}
        >
          <Img
            src={planningSvg}
            alt="Planning Layer"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: frame >= phase4Start ? "brightness(0.7)" : "brightness(1)",
            }}
          />
        </div>

        {/* Execution Layer */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: executionOpacity,
            transform: `scale(${executionScale})`,
            transition: "all 0.3s ease",
            zIndex: frame >= phase4Start ? 2 : 10,
          }}
        >
          <Img
            src={executionSvg}
            alt="Execution Layer"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: frame >= phase4Start ? "brightness(0.8)" : "brightness(1)",
            }}
          />
        </div>

        {/* Security Layer */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: securityOpacity,
            transform: `scale(${securityScale})`,
            transition: "all 0.3s ease",
            zIndex: frame >= phase4Start ? 3 : 10,
          }}
        >
          <Img
            src={securitySvg}
            alt="Security Layer"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: frame >= phase4Start ? "brightness(1)" : "brightness(1)",
            }}
          />
        </div>

        {/* Layer Label */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "50%",
            transform: `translateX(-50%) scale(${interpolate(
              frame % 60,
              [0, 5, 55, 60],
              [1, 1.05, 1.05, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            )})`,
            backgroundColor: (() => {
              if (frame < phase2Start) return "rgba(188, 248, 91, 0.95)";
              if (frame < phase3Start) return "rgba(139, 121, 253, 0.95)";
              if (frame < phase4Start) return "rgba(120, 83, 255, 0.95)";
              return "rgba(255, 255, 255, 0.95)";
            })(),
            color: frame >= phase4Start ? "#0A0A0F" : "white",
            padding: "20px 40px",
            borderRadius: "16px",
            fontSize: "28px",
            fontWeight: "bold",
            fontFamily: "Arial",
            zIndex: 30,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
            textShadow: frame >= phase4Start ? "none" : "2px 2px 4px rgba(0, 0, 0, 0.5)",
            transition: "all 0.3s ease",
          }}
        >
          {getCurrentLabel()}
        </div>

        {/* Layer indicators when all are visible */}
        {frame >= phase4Start && (
          <div
            style={{
              position: "absolute",
              top: "60px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "20px",
              zIndex: 30,
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(188, 248, 91, 0.9)",
                color: "#0A0A0F",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "18px",
                fontWeight: "bold",
                fontFamily: "Arial",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
              }}
            >
              Planning
            </div>
            <div
              style={{
                backgroundColor: "rgba(139, 121, 253, 0.9)",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "18px",
                fontWeight: "bold",
                fontFamily: "Arial",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
              }}
            >
              Execution
            </div>
            <div
              style={{
                backgroundColor: "rgba(120, 83, 255, 0.9)",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "18px",
                fontWeight: "bold",
                fontFamily: "Arial",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
              }}
            >
              Security
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
