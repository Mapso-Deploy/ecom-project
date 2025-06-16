import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// FIXED REALISTIC Cloth Physics - Proper Natural Behavior
const ClothPhysics = ({ 
  meshRef, 
  rotationData = { speed: 0, velocity: 0, acceleration: 0, direction: 0, isMoving: false, intensity: 0 },
  intensity = 1.0,
  debug = false 
}) => {
  const targetMesh = useRef();
  const originalVertices = useRef();
  const isInitialized = useRef(false);
  const timeRef = useRef(0);
  
  // 🎯 ENHANCED PHYSICS SYSTEM - With Overshoot and Realistic Direction
  const smoothedTwist = useRef(0);              // Current twist effect
  const twistMomentum = useRef(0);              // Momentum after stopping
  const twistDirection = useRef(0);             // Current twist direction
  const lastActiveTime = useRef(0);             // For natural settling
  const overshootAmount = useRef(0);            // NEW: Overshoot for realistic inertia
  const lastSpeed = useRef(0);                  // NEW: Track speed changes for overshoot
  
  // Initialize physics when mesh is available
  useEffect(() => {
    if (!meshRef?.current) return;
    
    let mesh = null;
    
    // Find the mesh
    if (meshRef.current.traverse) {
      meshRef.current.traverse((child) => {
        if (child.isMesh && child.geometry && child.geometry.attributes.position && !mesh) {
          mesh = child;
        }
      });
    }
    
    if (!mesh) return;
    
    targetMesh.current = mesh;
    const positionAttribute = mesh.geometry.attributes.position;
    
    // Store original vertices
    originalVertices.current = new Float32Array(positionAttribute.array);
    
    // Set geometry to be dynamic
    mesh.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    
    isInitialized.current = true;
    
    console.log('CLOTH PHYSICS: Initialized successfully with', positionAttribute.count, 'vertices');
  }, [meshRef]);
  
  // Apply physics every frame with GEOMETRIC CAMERA CONSTRAINTS
  useFrame((state, delta) => {
    if (!isInitialized.current || !targetMesh.current || !originalVertices.current) return;
    
    // 🎯 ENHANCED FRAME RATE STABILIZATION - Improved stability
    const targetDelta = 1/60; // Target 60fps
    const maxDelta = 1/30; // Never allow below 30fps equivalent
    const minDelta = 1/120; // Never allow above 120fps equivalent

    // IMPROVED: More conservative delta smoothing for high-speed stability
    const clampedDelta = Math.max(minDelta, Math.min(delta, maxDelta));
    const smoothDelta1 = THREE.MathUtils.lerp(clampedDelta, targetDelta, 0.15); // REDUCED from 0.2
    const smoothDelta2 = THREE.MathUtils.lerp(clampedDelta, smoothDelta1, 0.3); // REDUCED from 0.4
    const finalSmoothDelta = THREE.MathUtils.lerp(clampedDelta, smoothDelta2, 0.5); // REDUCED from 0.6

    timeRef.current += finalSmoothDelta;
    const { speed = 0, direction = 0, isMoving = false } = rotationData;
    
    // 🌬️ ENHANCED IDLE ANIMATION - More prominent base waves
    let baseWind = 0.32; // INCREASED: From 0.25 to 0.32 for more visible idle movement
    let activeWind = 0;
    
    // 🌪️ GEOMETRICALLY CONSTRAINED TWIST CALCULATION
    let targetTwist = 0;
    
    if (isMoving && Math.abs(speed) > 0.001) {
      activeWind = Math.abs(speed) * 0.4 * intensity; // REDUCED: From 0.6 to 0.4
      
      // 🎯 CAMERA-AWARE TWIST LIMITS - Based on viewing frustum geometry
      const speedThreshold = 0.015;
      const maxAllowedSpeed = 0.08; // REDUCED: From 0.12 to 0.08 for stability
      const clampedSpeed = Math.min(Math.abs(speed), maxAllowedSpeed);
      const adjustedSpeed = Math.max(0, clampedSpeed - speedThreshold);
      
      // CALCULATED: Maximum twist that keeps vertices in optimal viewing zone
      // Camera at Z=8.5, FOV=45°, optimal viewing width at model ≈ 3.0
      const maxTwist = 0.35; // REDUCED: From 0.6 to 0.35 for camera-safe bounds
      
      // 🔄 REALISTIC DIRECTION LOGIC (preserved)
      const realisticDirection = direction;
      const rawTwist = realisticDirection * adjustedSpeed * 0.1; // REDUCED: From 0.15 to 0.1
      targetTwist = Math.sign(rawTwist) * Math.min(Math.abs(rawTwist), maxTwist);
      
      // 🎯 CONTROLLED OVERSHOOT - Reduced for stability
      const speedChange = Math.abs(speed - lastSpeed.current);
      if (speedChange > 0.08) { // INCREASED threshold
        overshootAmount.current = Math.abs(targetTwist) * 0.25; // REDUCED from 0.4
      }
      
      twistDirection.current = realisticDirection;
      lastActiveTime.current = timeRef.current;
      lastSpeed.current = speed;
    } else {
      // FASTER settling for better control
      twistMomentum.current *= 0.94; // INCREASED decay from 0.96
      overshootAmount.current *= 0.85; // INCREASED decay from 0.88
      
      if (Math.abs(twistMomentum.current) < 0.001) { // INCREASED threshold
        twistMomentum.current = 0;
      }
      if (Math.abs(overshootAmount.current) < 0.002) { // INCREASED threshold
        overshootAmount.current = 0;
      }
    }
    
    // 🌪️ ENHANCED STABILITY INTERPOLATION
    const targetFrameTime = 1/60;
    const frameRatio = smoothDelta1 / targetFrameTime;

    // 🎯 SPEED-RESPONSIVE DAMPENING - More aggressive at high speeds
    const baseDampening = isMoving ? 0.18 : 0.08; // INCREASED from 0.15
    const speedBasedDampening = Math.abs(speed) * 0.8; // INCREASED from 0.5
    const totalDampening = baseDampening + speedBasedDampening; // CHANGED to addition for stronger effect
    const adaptiveDampening = Math.max(totalDampening, 0.03); // INCREASED minimum

    const frameAdjustedLerp = Math.min(frameRatio * adaptiveDampening, 0.015); // REDUCED max step

    // 🎯 ENHANCED ULTRA-SMOOTH INTERPOLATION
    const overshootSign = Math.sign(smoothedTwist.current) * -1;
    const overshootEffect = overshootAmount.current * overshootSign;
    const totalTargetTwist = targetTwist + twistMomentum.current + overshootEffect;

    // MORE CONSERVATIVE smoothing progression
    const stage1 = THREE.MathUtils.lerp(smoothedTwist.current, totalTargetTwist, frameAdjustedLerp);
    const stage2 = THREE.MathUtils.lerp(smoothedTwist.current, stage1, 0.25); // REDUCED from 0.3
    const stage3 = THREE.MathUtils.lerp(smoothedTwist.current, stage2, 0.4); // REDUCED from 0.5
    const stage4 = THREE.MathUtils.lerp(smoothedTwist.current, stage3, 0.6); // REDUCED from 0.7
    smoothedTwist.current = THREE.MathUtils.lerp(smoothedTwist.current, stage4, 0.8); // REDUCED from 0.85

    // 🎯 ENHANCED VELOCITY-BASED DAMPENING
    if (isMoving && Math.abs(speed) > 0.015) { // REDUCED threshold
      const velocityDampening = Math.min(Math.abs(speed) * 3, 0.9); // INCREASED multiplier
      const dampedTarget = THREE.MathUtils.lerp(smoothedTwist.current, totalTargetTwist, 0.005); // REDUCED from 0.01
      smoothedTwist.current = THREE.MathUtils.lerp(smoothedTwist.current, dampedTarget, 1 - velocityDampening);
    }
    
    // Store momentum when transitioning
    if (!isMoving && Math.abs(targetTwist) < 0.01 && Math.abs(smoothedTwist.current) > 0.02) {
      twistMomentum.current = smoothedTwist.current * 0.4; // REDUCED from 0.5
    }
    
    const totalWind = baseWind + activeWind;
    const positionAttribute = targetMesh.current.geometry.attributes.position;
    const vertices = positionAttribute.array;
    const vertexCount = positionAttribute.count;
    
    // Apply enhanced fabric movement with GEOMETRIC CAMERA CONSTRAINTS
    for (let i = 0; i < vertexCount; i++) {
      const i3 = i * 3;
      
      const origX = originalVertices.current[i3];
      const origY = originalVertices.current[i3 + 1];
      const origZ = originalVertices.current[i3 + 2];
      
      // 📐 PRESERVED FABRIC PHYSICS - Top anchored, middle controlled, bottom free
      const heightFactor = Math.max(0, Math.min(1, (origY + 3) / 6));
      
      // 🎯 CONTROLLED MOVEMENT DISTRIBUTION - Reduced exponential scaling
      const topAnchor = Math.pow(heightFactor, 0.6) * 0.995; // INCREASED exponent for more anchoring
      const middleRestriction = heightFactor * 0.75; // INCREASED restriction
      const bottomFreedom = (1 - heightFactor) * (1 - heightFactor) * 0.8; // REDUCED by 0.8 factor
      
      // REDUCED movement scales for camera stability
      const waveScale = (1.0 - topAnchor) * (1.0 + bottomFreedom * 0.8); // REDUCED multiplier
      const twistScale = (1.0 - middleRestriction) * (1.0 + bottomFreedom * 1.2); // REDUCED from 1.5
      
      // ⏰ ENHANCED WAVE TIMING - More dynamic idle movement
      const stableTime = timeRef.current;
      const time1 = stableTime * 2.0 + origY * 1.2;
      const time2 = stableTime * 1.6 + origZ * 1.0;
      const time3 = stableTime * 1.8 + origX * 0.8;
      
      // Add subtle secondary wave for richer idle animation
      const idleEnhancement = isMoving ? 0 : 0.15; // Only enhance when idle
      const secondaryWave = Math.sin(stableTime * 0.8 + origX * 0.3) * idleEnhancement;
      
      // 🌊 ENHANCED IDLE FABRIC WAVES - More prominent when stationary
      const waveX = Math.sin(time1) * 0.14 * totalWind * waveScale + secondaryWave * waveScale;
      const waveY = Math.sin(time2 + Math.PI/4) * 0.08 * totalWind * waveScale + secondaryWave * 0.5 * waveScale;
      const waveZ = Math.cos(time3) * 0.11 * totalWind * waveScale + secondaryWave * 0.7 * waveScale;
      
      // 🌪️ GEOMETRICALLY CONSTRAINED TWIST
      const rawTwistIntensity = smoothedTwist.current;
      const maxTwistMagnitude = 0.4; // REDUCED from 0.5
      const clampedTwistIntensity = Math.sign(rawTwistIntensity) * Math.min(Math.abs(rawTwistIntensity), maxTwistMagnitude);
      
      let twistX = 0, twistZ = 0;
      
      if (Math.abs(clampedTwistIntensity) > 0.001) { // INCREASED threshold
        const distanceFromCore = Math.sqrt(origX * origX + origZ * origZ);
        
        if (distanceFromCore > 0.001) {
          const twistAngleMultiplier = (1 - heightFactor) * (1 - heightFactor) * 0.8; // REDUCED by 0.8
          const maxTwistAngle = clampedTwistIntensity * 0.6 * twistAngleMultiplier; // REDUCED from 0.8
          
          const currentAngle = Math.atan2(origZ, origX);
          const newAngle = currentAngle + maxTwistAngle;
          
          const targetX = Math.cos(newAngle) * distanceFromCore;
          const targetZ = Math.sin(newAngle) * distanceFromCore;
          
          twistX = (targetX - origX) * twistScale;
          twistZ = (targetZ - origZ) * twistScale;
          
          // 🎯 PRECISE CAMERA FRUSTUM CONSTRAINTS
          // Calculate optimal viewing bounds based on camera setup:
          // Camera: position=[0,0,8.5], FOV=45°, near=0.5
          // At model distance (≈8.5), visible width = 2 * 8.5 * tan(22.5°) ≈ 7.0
          // Safe zone should be smaller to prevent edge distortion
          
          const cameraDistance = 8.5; // Camera Z position
          const fovRad = (45 * Math.PI) / 180; // FOV in radians
          const viewportHalfWidth = cameraDistance * Math.tan(fovRad / 2) * 0.7; // 70% of full width for safety
          const viewportHalfDepth = cameraDistance * 0.15; // 15% depth range for Z movement
          
          // Calculate final position
          const finalX = origX + waveX + twistX;
          const finalZ = origZ + waveZ + twistZ;
          
          // GEOMETRIC CONSTRAINTS based on camera frustum
          const maxXBound = viewportHalfWidth; // ≈ 2.45 (much tighter than previous 2.5)
          const maxZBound = viewportHalfDepth; // ≈ 1.28 (much tighter than previous 2.0)
          const minZBound = -viewportHalfDepth; // ≈ -1.28 (tighter than previous -1.5)
          
          let constraintFactor = 1.0;
          
          // ENHANCED bounds checking with proper geometry
          if (Math.abs(finalX) > maxXBound) {
            constraintFactor = Math.min(constraintFactor, maxXBound / Math.abs(finalX));
          }
          
          if (finalZ > maxZBound) {
            constraintFactor = Math.min(constraintFactor, maxZBound / finalZ);
          } else if (finalZ < minZBound) {
            constraintFactor = Math.min(constraintFactor, Math.abs(minZBound) / Math.abs(finalZ));
          }
          
          // Apply geometric constraints
          if (constraintFactor < 1.0) {
            twistX *= constraintFactor;
            twistZ *= constraintFactor;
          }
          
          // 🎯 PRESERVED ANTI-STRETCH CONTROL (exact same logic)
          const originalCoreDistance = distanceFromCore;
          const newCoreDistance = Math.sqrt((origX + twistX) * (origX + twistX) + (origZ + twistZ) * (origZ + twistZ));
          
          if (Math.abs(newCoreDistance - originalCoreDistance) > originalCoreDistance * 0.015) { // TIGHTENED tolerance
            const correctionFactor = originalCoreDistance / newCoreDistance;
            twistX *= correctionFactor;
            twistZ *= correctionFactor;
          }
          
          // 🎯 ENHANCED DISPLACEMENT LIMITS - More conservative
          const maxDisplacement = distanceFromCore * 0.25; // REDUCED from 0.3
          const currentDisplacement = Math.sqrt(twistX * twistX + twistZ * twistZ);
          if (currentDisplacement > maxDisplacement) {
            const limitFactor = maxDisplacement / currentDisplacement;
            twistX *= limitFactor;
            twistZ *= limitFactor;
          }
        }
      }
      
      // ⬇️ PRESERVED GRAVITY - Heavier fabric
      const baseGravity = (1 - heightFactor) * 0.4;
      const twistGravityPull = Math.abs(clampedTwistIntensity) * (1 - heightFactor) * 0.2;
      const totalGravity = baseGravity + twistGravityPull;
      
      // 🎯 FINAL CONSTRAINED VERTEX POSITIONING
      vertices[i3] = origX + waveX + twistX;
      vertices[i3 + 1] = origY + waveY - totalGravity;
      vertices[i3 + 2] = origZ + waveZ + twistZ;
    }
    
    // Update geometry
    positionAttribute.needsUpdate = true;
    targetMesh.current.geometry.computeVertexNormals();
    
    // Debug logging
    if (debug && timeRef.current % 2 < smoothDelta1) {
      console.log('CAMERA-CONSTRAINED PHYSICS:', {
        target: targetTwist.toFixed(3),
        smoothed: smoothedTwist.current.toFixed(3),
        momentum: twistMomentum.current.toFixed(3),
        wind: totalWind.toFixed(3)
      });
    }
  });
  
  return null;
};

export default ClothPhysics; 