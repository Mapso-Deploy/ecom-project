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
  
  // Apply physics every frame
  useFrame((state, delta) => {
    if (!isInitialized.current || !targetMesh.current || !originalVertices.current) return;
    
    // 🎯 ENHANCED FRAME RATE STABILIZATION - Better glitch prevention
    const targetDelta = 1/60; // Target 60fps
    const maxDelta = 1/30; // Never allow below 30fps equivalent
    const minDelta = 1/120; // Never allow above 120fps equivalent

    // Triple-layer delta smoothing
    const clampedDelta = Math.max(minDelta, Math.min(delta, maxDelta));
    const smoothDelta1 = THREE.MathUtils.lerp(clampedDelta, targetDelta, 0.2);
    const smoothDelta2 = THREE.MathUtils.lerp(clampedDelta, smoothDelta1, 0.4);
    const finalSmoothDelta = THREE.MathUtils.lerp(clampedDelta, smoothDelta2, 0.6);

    timeRef.current += finalSmoothDelta;
    const { speed = 0, direction = 0, isMoving = false } = rotationData;
    
    // 🌬️ ENHANCED BASE WIND SYSTEM - Increased idle visibility
    let baseWind = 0.35; // INCREASED from 0.25 to 0.35 for more visible idle waves
    let activeWind = 0;
    
    // 🌪️ ENHANCED TWIST CALCULATION - More twist, no stretching
    let targetTwist = 0;
    
    if (isMoving && Math.abs(speed) > 0.001) {
      activeWind = Math.abs(speed) * 0.6 * intensity;
      
      // 🎯 ENHANCED TWIST LIMITS - More visible twist
      const speedThreshold = 0.015;
      const maxAllowedSpeed = 0.12; // INCREASED from 0.08 to 0.12 for more twist
      const clampedSpeed = Math.min(Math.abs(speed), maxAllowedSpeed);
      const adjustedSpeed = Math.max(0, clampedSpeed - speedThreshold);
      const maxTwist = 0.6; // INCREASED from 0.35 to 0.6 for more visible twist
      
      // 🔄 REALISTIC DIRECTION LOGIC - FIXED: Fabric should be pulled in rotation direction
      const realisticDirection = direction; // FIXED: Remove the negative sign so fabric follows rotation naturally
      const rawTwist = realisticDirection * adjustedSpeed * 0.15;
      targetTwist = Math.sign(rawTwist) * Math.min(Math.abs(rawTwist), maxTwist);
      
      // 🎯 OVERSHOOT DETECTION
      const speedChange = Math.abs(speed - lastSpeed.current);
      if (speedChange > 0.05) {
        overshootAmount.current = Math.abs(targetTwist) * 0.4;
      }
      
      twistDirection.current = realisticDirection;
      lastActiveTime.current = timeRef.current;
      lastSpeed.current = speed;
    } else {
      twistMomentum.current *= 0.96;
      overshootAmount.current *= 0.88;
      
      if (Math.abs(twistMomentum.current) < 0.0008) {
        twistMomentum.current = 0;
      }
      if (Math.abs(overshootAmount.current) < 0.001) {
        overshootAmount.current = 0;
      }
    }
    
    // 🌪️ ULTRA-STABLE INTERPOLATION - Enhanced frame rate dampening
    const targetFrameTime = 1/60;
    const frameRatio = smoothDelta1 / targetFrameTime;

    // 🎯 ADAPTIVE DAMPENING - Much more aggressive during rotation
    const baseDampening = isMoving ? 0.15 : 0.08; // Much slower during rotation
    const rotationIntensityDampening = Math.abs(speed) * 0.5; // Additional dampening based on rotation speed
    const totalDampening = baseDampening - rotationIntensityDampening; // More rotation = more dampening
    const adaptiveDampening = Math.max(totalDampening, 0.02); // Minimum dampening threshold

    const frameAdjustedLerp = Math.min(frameRatio * adaptiveDampening, 0.02); // Much smaller max step

    // 🎯 FIVE-STAGE ULTRA-SMOOTH INTERPOLATION - Eliminates ALL glitches
    const overshootSign = Math.sign(smoothedTwist.current) * -1;
    const overshootEffect = overshootAmount.current * overshootSign;
    const totalTargetTwist = targetTwist + twistMomentum.current + overshootEffect;

    // Five-stage progressive smoothing for absolute stability
    const stage1 = THREE.MathUtils.lerp(smoothedTwist.current, totalTargetTwist, frameAdjustedLerp);
    const stage2 = THREE.MathUtils.lerp(smoothedTwist.current, stage1, 0.3); // Much slower
    const stage3 = THREE.MathUtils.lerp(smoothedTwist.current, stage2, 0.5);
    const stage4 = THREE.MathUtils.lerp(smoothedTwist.current, stage3, 0.7);
    smoothedTwist.current = THREE.MathUtils.lerp(smoothedTwist.current, stage4, 0.85);

    // 🎯 VELOCITY-BASED DAMPENING - Additional smoothing for fast movements
    if (isMoving && Math.abs(speed) > 0.02) {
      // Extra dampening during fast rotation
      const velocityDampening = Math.min(Math.abs(speed) * 2, 0.8); // Higher speed = more dampening
      const dampedTarget = THREE.MathUtils.lerp(smoothedTwist.current, totalTargetTwist, 0.01); // Very slow
      smoothedTwist.current = THREE.MathUtils.lerp(smoothedTwist.current, dampedTarget, 1 - velocityDampening);
    }
    
    // Store momentum when transitioning
    if (!isMoving && Math.abs(targetTwist) < 0.008 && Math.abs(smoothedTwist.current) > 0.015) {
      twistMomentum.current = smoothedTwist.current * 0.5;
    }
    
    const totalWind = baseWind + activeWind;
    const positionAttribute = targetMesh.current.geometry.attributes.position;
    const vertices = positionAttribute.array;
    const vertexCount = positionAttribute.count;
    
    // Apply enhanced fabric movement
    for (let i = 0; i < vertexCount; i++) {
      const i3 = i * 3;
      
      const origX = originalVertices.current[i3];
      const origY = originalVertices.current[i3 + 1];
      const origZ = originalVertices.current[i3 + 2];
      
      // 📐 REAL FABRIC PHYSICS - Top anchored, middle controlled, bottom free
      const heightFactor = Math.max(0, Math.min(1, (origY + 3) / 6));
      
      // 🎯 REALISTIC MOVEMENT DISTRIBUTION - Top < Middle < Bottom
      // Top (heightFactor = 1): Almost no movement
      // Middle (heightFactor = 0.5): Moderate movement  
      // Bottom (heightFactor = 0): Maximum movement
      const topAnchor = Math.pow(heightFactor, 0.5) * 0.99; // Top heavily anchored
      const middleRestriction = heightFactor * 0.7; // Middle has more restriction than bottom
      const bottomFreedom = (1 - heightFactor) * (1 - heightFactor); // Bottom has exponential freedom
      
      // Final movement scales: Top minimal, Middle moderate, Bottom maximum
      const waveScale = (1.0 - topAnchor) * (1.0 + bottomFreedom); // Bottom moves more than middle
      const twistScale = (1.0 - middleRestriction) * (1.0 + bottomFreedom * 1.5); // Bottom twists most
      
      // ⏰ FRAME-STABLE WAVE TIMING
      const stableTime = timeRef.current;
      const time1 = stableTime * 2.0 + origY * 1.2;
      const time2 = stableTime * 1.6 + origZ * 1.0;
      const time3 = stableTime * 1.8 + origX * 0.8;
      
      // 🌊 NATURAL FABRIC WAVES - Bottom extends most
      const waveX = Math.sin(time1) * 0.18 * totalWind * waveScale;
      const waveY = Math.sin(time2 + Math.PI/4) * 0.10 * totalWind * waveScale;
      const waveZ = Math.cos(time3) * 0.14 * totalWind * waveScale;
      
      // 🌪️ RADIAL CORE-BASED TWIST - Like real hanging fabric
      const rawTwistIntensity = smoothedTwist.current;
      const maxTwistMagnitude = 0.5;
      const clampedTwistIntensity = Math.sign(rawTwistIntensity) * Math.min(Math.abs(rawTwistIntensity), maxTwistMagnitude);
      
      let twistX = 0, twistZ = 0;
      
      if (Math.abs(clampedTwistIntensity) > 0.0008) {
        // 🎯 CORE-BASED RADIAL TWIST - Fabric rotates around central Y-axis
        const distanceFromCore = Math.sqrt(origX * origX + origZ * origZ); // Distance from center
        
        if (distanceFromCore > 0.001) { // Avoid division by zero
          // Calculate twist angle - bottom twists more than middle
          const twistAngleMultiplier = (1 - heightFactor) * (1 - heightFactor); // Exponential for bottom
          const maxTwistAngle = clampedTwistIntensity * 0.8 * twistAngleMultiplier; // Bottom gets most twist
          
          // 🎯 RADIAL ROTATION AROUND CENTRAL AXIS
          // Get current angle from center
          const currentAngle = Math.atan2(origZ, origX);
          
          // Apply twist rotation around Y-axis (vertical center line)
          const newAngle = currentAngle + maxTwistAngle;
          
          // 🚫 CORE ANCHORING - Keep distance from center (no stretching)
          const targetX = Math.cos(newAngle) * distanceFromCore;
          const targetZ = Math.sin(newAngle) * distanceFromCore;
          
          // Calculate twist displacement
          twistX = (targetX - origX) * twistScale;
          twistZ = (targetZ - origZ) * twistScale;
          
          // 🎯 ENHANCED CAMERA BOUNDS PROTECTION - Prevent fabric from leaving frame or getting too close
          
          // Calculate final position for X and Z coordinates only
          const finalX = origX + waveX + twistX;
          const finalZ = origZ + waveZ + twistZ;
          
          // Define camera-safe bounds (prevent fabric from getting too close or leaving frame)
          const maxXBound = 2.5;  // Don't let fabric get too far left/right
          const maxZBound = 2.0;  // Don't let fabric get too close to camera (positive Z)
          const minZBound = -1.5; // Don't let fabric get too far from camera (negative Z)
          
          // Check if final position would be outside safe bounds
          let constraintFactor = 1.0;
          
          // X bounds check
          if (Math.abs(finalX) > maxXBound) {
            constraintFactor = Math.min(constraintFactor, maxXBound / Math.abs(finalX));
          }
          
          // Z bounds check (most important for camera distortion)
          if (finalZ > maxZBound) {
            constraintFactor = Math.min(constraintFactor, maxZBound / finalZ);
          } else if (finalZ < minZBound) {
            constraintFactor = Math.min(constraintFactor, Math.abs(minZBound) / Math.abs(finalZ));
          }
          
          // Apply constraints if needed
          if (constraintFactor < 1.0) {
            // Scale back the twist displacement to keep within bounds
            twistX *= constraintFactor;
            twistZ *= constraintFactor;
          }
          
          // 🎯 STRICT ANTI-STRETCH CONTROL - Maintain original distances (existing logic)
          const originalCoreDistance = distanceFromCore;
          const newCoreDistance = Math.sqrt((origX + twistX) * (origX + twistX) + (origZ + twistZ) * (origZ + twistZ));
          
          // If twist would change distance from core, scale it back
          if (Math.abs(newCoreDistance - originalCoreDistance) > originalCoreDistance * 0.02) { // 2% tolerance
            const correctionFactor = originalCoreDistance / newCoreDistance;
            twistX *= correctionFactor;
            twistZ *= correctionFactor;
          }
          
          // 🎯 ADDITIONAL SAFETY - Limit maximum displacement
          const maxDisplacement = distanceFromCore * 0.3; // Max 30% of distance from core
          const currentDisplacement = Math.sqrt(twistX * twistX + twistZ * twistZ);
          if (currentDisplacement > maxDisplacement) {
            const limitFactor = maxDisplacement / currentDisplacement;
            twistX *= limitFactor;
            twistZ *= limitFactor;
          }
        }
      }
      
      // ⬇️ ENHANCED GRAVITY - Heavier fabric
      const baseGravity = (1 - heightFactor) * 0.4;
      const twistGravityPull = Math.abs(clampedTwistIntensity) * (1 - heightFactor) * 0.2;
      const totalGravity = baseGravity + twistGravityPull;
      
      // 🎯 FINAL NATURAL VERTEX POSITIONING
      vertices[i3] = origX + waveX + twistX;
      vertices[i3 + 1] = origY + waveY - totalGravity;
      vertices[i3 + 2] = origZ + waveZ + twistZ;
    }
    
    // Update geometry
    positionAttribute.needsUpdate = true;
    targetMesh.current.geometry.computeVertexNormals();
    
    // Debug logging
    if (debug && timeRef.current % 2 < smoothDelta1) {
      console.log('NATURAL PHYSICS:', {
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