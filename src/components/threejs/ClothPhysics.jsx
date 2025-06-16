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
  
  // Add kinetic energy tracking at the top of the physics system
  const kineticEnergy = useRef(0);           // Raw kinetic energy storage
  const energyDecayTimer = useRef(0);        // Timer for energy preservation
  const lastRotationVelocity = useRef(0);    // Track velocity for energy calculation
  const oscillationPhase = useRef(0);        // Track oscillation cycle
  const restoreForce = useRef(0);           // Force pulling back to rest state
  const oscillationVelocity = useRef(0);     // Velocity of oscillation
  
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
    
    // 🌪️ ENHANCED TWIST CALCULATION - Fixed transition and energy preservation
    let targetTwist = 0;

    if (isMoving && Math.abs(speed) > 0.001) {
      activeWind = Math.abs(speed) * 0.4 * intensity;
      
      // �� FIXED TWIST LIMITS
      const speedThreshold = 0.015;
      const maxAllowedSpeed = 0.06;
      const clampedSpeed = Math.min(Math.abs(speed), maxAllowedSpeed);
      const adjustedSpeed = Math.max(0, clampedSpeed - speedThreshold);
      
      const maxTwist = 0.25;
      
      // 🔄 REALISTIC DIRECTION LOGIC
      const realisticDirection = direction;
      const rawTwist = realisticDirection * adjustedSpeed * 0.15;
      targetTwist = Math.sign(rawTwist) * Math.min(Math.abs(rawTwist), maxTwist);
      
      // 🎯 CONTINUOUS ENERGY ACCUMULATION - Build up energy for oscillation
      const currentVelocity = Math.abs(speed);
      
      // ACCUMULATE energy over time instead of overwriting
      const instantEnergy = Math.pow(currentVelocity, 1.4) * 0.8; // INCREASED power and multiplier
      kineticEnergy.current = Math.max(kineticEnergy.current * 0.98, instantEnergy); // BETTER preservation
      
      // 🎯 IMPROVED MOMENTUM CAPTURE - Don't overwrite, accumulate
      const momentumCapture = targetTwist * currentVelocity * 12.0; // INCREASED capture strength
      const newVelocity = momentumCapture * Math.sign(rawTwist);
      
      // BLEND instead of overwrite to build up momentum
      oscillationVelocity.current = oscillationVelocity.current * 0.85 + newVelocity * 0.15;
      
      // 🎯 TRANSITION PREPARATION - Set up for smooth handoff
      energyDecayTimer.current = 0;
      restoreForce.current = 0;
      lastRotationVelocity.current = currentVelocity;
      
      // Store the FINAL twist state for transition
      const finalTwistState = targetTwist;
      
      // Controlled overshoot
      const speedChange = Math.abs(speed - lastSpeed.current);
      if (speedChange > 0.06) {
        overshootAmount.current = Math.abs(targetTwist) * 0.2;
      }
      
      twistDirection.current = realisticDirection;
      lastActiveTime.current = timeRef.current;
      lastSpeed.current = speed;
      
    } else {
      // 🎯 TRANSITION & OSCILLATION SYSTEM - Smooth handoff from rotation
      
      const transitionTime = 0.3; // 300ms transition period
      const timeSinceStop = timeRef.current - lastActiveTime.current;
      const isInTransition = timeSinceStop < transitionTime;
      
      energyDecayTimer.current += finalSmoothDelta;
      
      if (isInTransition) {
        // 🔄 TRANSITION PHASE - Smooth handoff from active rotation to oscillation
        const transitionProgress = timeSinceStop / transitionTime;
        const transitionCurve = 1 - Math.pow(transitionProgress, 2); // Quadratic ease-out
        
        // BOOST initial oscillation energy during transition
        const boostFactor = 1.5 + (1 - transitionProgress) * 2.0; // Extra energy at start
        kineticEnergy.current = Math.max(kineticEnergy.current, 0.4 * boostFactor);
        
        // Initialize oscillation position from current twist
        if (timeSinceStop < finalSmoothDelta * 2) { // First few frames
          oscillationPhase.current = smoothedTwist.current; // Start from current position
        }
      }
      
      // 🌊 ENHANCED OSCILLATION SYSTEM
      const dt = finalSmoothDelta;
      
      // STRONGER spring force for visible oscillation
      const currentTwistPosition = oscillationPhase.current;
      const springConstant = 25.0; // INCREASED: Much stronger spring
      restoreForce.current = -currentTwistPosition * springConstant;
      
      // Apply forces to oscillation velocity
      oscillationVelocity.current += restoreForce.current * dt;
      
      // LESS damping for better oscillation
      const dampingCoefficient = isInTransition ? 0.95 : 0.85; // Less damping during transition
      oscillationVelocity.current *= Math.pow(dampingCoefficient, dt * 60);
      
      // Update oscillation position
      oscillationPhase.current += oscillationVelocity.current * dt;
      
      // MUCH SLOWER energy decay
      const energyDecayRate = isInTransition ? 0.9995 : 0.997; // Almost no decay during transition
      kineticEnergy.current *= Math.pow(energyDecayRate, dt * 60);
      
      // 🎯 VISIBLE OSCILLATION MOTION
      const hasSignificantOscillation = Math.abs(oscillationVelocity.current) > 0.008; // REDUCED threshold
      
      if (hasSignificantOscillation || isInTransition) {
        // DIRECT oscillation effect with AMPLIFICATION
        const energyAmplifier = Math.max(kineticEnergy.current, 0.35); // INCREASED base energy
        targetTwist = oscillationPhase.current * energyAmplifier;
        
        // DIRECT assignment for maximum energy preservation
        smoothedTwist.current = targetTwist;
      } else {
        // Gentle decay when oscillation is done
        targetTwist = oscillationPhase.current * Math.max(kineticEnergy.current, 0.1);
        smoothedTwist.current = THREE.MathUtils.lerp(smoothedTwist.current, targetTwist, 0.12);
      }
      
      // INCREASED oscillation limits
      const maxOscillationTwist = 1.0; // INCREASED: Allow larger visible oscillations
      smoothedTwist.current = Math.max(-maxOscillationTwist, Math.min(maxOscillationTwist, smoothedTwist.current));
      
      // Stop oscillation only when truly minimal
      if (!isInTransition && Math.abs(kineticEnergy.current) < 0.008 && Math.abs(oscillationVelocity.current) < 0.015) {
        kineticEnergy.current = 0;
        oscillationVelocity.current = 0;
        oscillationPhase.current *= 0.92; // Gradual position decay
        smoothedTwist.current *= 0.95;
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

    // 🎯 NO ADDITIONAL SMOOTHING - Let oscillation work directly
    // (Remove all the old smoothing logic that was interfering)

    const totalWind = baseWind + activeWind;
    const positionAttribute = targetMesh.current.geometry.attributes.position;
    const vertices = positionAttribute.array;
    const vertexCount = positionAttribute.count;

    // Apply enhanced fabric movement with AXIS TETHERING for high velocity
    for (let i = 0; i < vertexCount; i++) {
      const i3 = i * 3;
      
      const origX = originalVertices.current[i3];
      const origY = originalVertices.current[i3 + 1];
      const origZ = originalVertices.current[i3 + 2];
      
      // 📐 PRESERVED FABRIC PHYSICS - Top anchored, middle controlled, bottom free
      const heightFactor = Math.max(0, Math.min(1, (origY + 3) / 6));
      
      // 🎯 ENHANCED AXIS TETHERING - Keep high velocity twists centered
      const axisDistance = Math.sqrt(origX * origX + origZ * origZ);
      const maxAxisDistance = 2.0; // Maximum distance from center axis
      const axisTetheringStrength = Math.min(axisDistance / maxAxisDistance, 1.0); // Stronger tethering for outer vertices
      
      // 🎯 CONTROLLED MOVEMENT DISTRIBUTION with AXIS TETHERING
      const topAnchor = Math.pow(heightFactor, 0.6) * 0.995;
      const middleRestriction = heightFactor * 0.75 + axisTetheringStrength * 0.2; // ADD axis tethering
      const bottomFreedom = (1 - heightFactor) * (1 - heightFactor) * 0.8 * (1 - axisTetheringStrength * 0.3); // REDUCE freedom for outer vertices
      
      // AXIS-AWARE movement scales
      const waveScale = (1.0 - topAnchor) * (1.0 + bottomFreedom * 0.8);
      const twistScale = (1.0 - middleRestriction) * (1.0 + bottomFreedom * 1.2) * (1 - axisTetheringStrength * 0.4); // REDUCE twist for outer vertices
      
      // ⏰ ENHANCED WAVE TIMING - More dynamic idle movement
      const stableTime = timeRef.current;
      const time1 = stableTime * 2.0 + origY * 1.2;
      const time2 = stableTime * 1.6 + origZ * 1.0;
      const time3 = stableTime * 1.8 + origX * 0.8;
      
      // Add subtle secondary wave for richer idle animation
      const idleEnhancement = isMoving ? 0 : 0.15;
      const secondaryWave = Math.sin(stableTime * 0.8 + origX * 0.3) * idleEnhancement;
      
      // 🌊 ENHANCED IDLE FABRIC WAVES
      const waveX = Math.sin(time1) * 0.14 * totalWind * waveScale + secondaryWave * waveScale;
      const waveY = Math.sin(time2 + Math.PI/4) * 0.08 * totalWind * waveScale + secondaryWave * 0.5 * waveScale;
      const waveZ = Math.cos(time3) * 0.11 * totalWind * waveScale + secondaryWave * 0.7 * waveScale;
      
      // 🌪️ OSCILLATION-AWARE TWIST PROCESSING - Different rules for oscillation vs active twist
      const rawTwistIntensity = smoothedTwist.current;
      
      // 🎯 DIFFERENTIATE: Active twist vs Oscillation
      const isOscillating = !isMoving && Math.abs(oscillationVelocity.current) > 0.01;
      const isInTransition = !isMoving && (timeRef.current - lastActiveTime.current) < 0.5;
      
      // DIFFERENT LIMITS: Oscillation gets higher limits for visibility
      const maxTwistMagnitude = isOscillating || isInTransition ? 0.8 : 0.4; // HIGHER limit for oscillation
      
      const clampedTwistIntensity = Math.sign(rawTwistIntensity) * Math.min(Math.abs(rawTwistIntensity), maxTwistMagnitude);
      
      let twistX = 0, twistZ = 0;
      
      if (Math.abs(clampedTwistIntensity) > 0.001) {
        const distanceFromCore = Math.sqrt(origX * origX + origZ * origZ);
        
        if (distanceFromCore > 0.001) {
          const twistAngleMultiplier = (1 - heightFactor) * (1 - heightFactor) * 0.8;
          
          // 🎯 OSCILLATION-AWARE SCALING
          const axisTetherFactor = 1 - (axisTetheringStrength * 0.6);
          const baseAngle = clampedTwistIntensity * 0.25 * twistAngleMultiplier * axisTetherFactor;
          
          // BOOST oscillation effect for visibility
          const oscillationMultiplier = isOscillating ? 1.8 : 1.0; // AMPLIFY oscillation
          const maxTwistAngle = baseAngle * oscillationMultiplier;
          
          const currentAngle = Math.atan2(origZ, origX);
          const newAngle = currentAngle + maxTwistAngle;
          
          const targetX = Math.cos(newAngle) * distanceFromCore;
          const targetZ = Math.sin(newAngle) * distanceFromCore;
          
          twistX = (targetX - origX) * twistScale;
          twistZ = (targetZ - origZ) * twistScale;
          
          // 🎯 AXIS TETHERING - Only during active twist, not oscillation
          if (!isOscillating) {
            const highVelocityThreshold = 0.4;
            if (Math.abs(clampedTwistIntensity) > highVelocityThreshold) {
              const pullBackStrength = (Math.abs(clampedTwistIntensity) - highVelocityThreshold) * 2.0;
              const centerPullX = -origX * pullBackStrength * axisTetheringStrength * 0.3;
              const centerPullZ = -origZ * pullBackStrength * axisTetheringStrength * 0.3;
              
              twistX += centerPullX;
              twistZ += centerPullZ;
            }
          }
          
          // 🎯 RELAXED CONSTRAINTS FOR OSCILLATION
          const cameraDistance = 8.5;
          const fovRad = (45 * Math.PI) / 180;
          const baseViewportWidth = cameraDistance * Math.tan(fovRad / 2) * 0.7;
          const baseViewportDepth = cameraDistance * 0.15;
          
          // EXPANDED bounds for oscillation visibility
          const oscillationExpansion = isOscillating ? 1.4 : 1.0; // 40% more room for oscillation
          const viewportHalfWidth = baseViewportWidth * oscillationExpansion;
          const viewportHalfDepth = baseViewportDepth * oscillationExpansion;
          
          const finalX = origX + waveX + twistX;
          const finalZ = origZ + waveZ + twistZ;
          
          const maxXBound = viewportHalfWidth;
          const maxZBound = viewportHalfDepth;
          const minZBound = -viewportHalfDepth;
          
          let constraintFactor = 1.0;
          
          // GENTLE constraints for oscillation
          if (Math.abs(finalX) > maxXBound) {
            constraintFactor = Math.min(constraintFactor, maxXBound / Math.abs(finalX));
          }
          
          if (finalZ > maxZBound) {
            constraintFactor = Math.min(constraintFactor, maxZBound / finalZ);
          } else if (finalZ < minZBound) {
            constraintFactor = Math.min(constraintFactor, Math.abs(minZBound) / Math.abs(finalZ));
          }
          
          // RELAXED constraint application for oscillation
          if (constraintFactor < 1.0) {
            const constraintStrength = isOscillating ? 0.7 : 1.0; // GENTLER constraints during oscillation
            const effectiveConstraint = 1.0 - (1.0 - constraintFactor) * constraintStrength;
            twistX *= effectiveConstraint;
            twistZ *= effectiveConstraint;
          }
          
          // 🎯 RELAXED ANTI-STRETCH for oscillation
          const originalCoreDistance = distanceFromCore;
          const newCoreDistance = Math.sqrt((origX + twistX) * (origX + twistX) + (origZ + twistZ) * (origZ + twistZ));
          
          const stretchTolerance = isOscillating ? 0.03 : 0.015; // DOUBLE tolerance for oscillation
          if (Math.abs(newCoreDistance - originalCoreDistance) > originalCoreDistance * stretchTolerance) {
            const correctionFactor = originalCoreDistance / newCoreDistance;
            const correctionStrength = isOscillating ? 0.6 : 1.0; // GENTLER correction during oscillation
            const effectiveCorrection = 1.0 - (1.0 - correctionFactor) * correctionStrength;
            twistX *= effectiveCorrection;
            twistZ *= effectiveCorrection;
          }
          
          // 🎯 RELAXED DISPLACEMENT LIMITS for oscillation
          const baseMaxDisplacement = distanceFromCore * 0.25;
          const maxDisplacement = isOscillating ? baseMaxDisplacement * 1.6 : baseMaxDisplacement; // 60% more displacement for oscillation
          
          const currentDisplacement = Math.sqrt(twistX * twistX + twistZ * twistZ);
          if (currentDisplacement > maxDisplacement) {
            const limitFactor = maxDisplacement / currentDisplacement;
            const limitStrength = isOscillating ? 0.8 : 1.0; // GENTLER limits during oscillation
            const effectiveLimit = 1.0 - (1.0 - limitFactor) * limitStrength;
            twistX *= effectiveLimit;
            twistZ *= effectiveLimit;
          }
        }
      }
      
      // ⬇️ PRESERVED GRAVITY
      const baseGravity = (1 - heightFactor) * 0.4;
      const twistGravityPull = Math.abs(clampedTwistIntensity) * (1 - heightFactor) * 0.2;
      const totalGravity = baseGravity + twistGravityPull;
      
      // 🎯 FINAL VERTEX POSITIONING
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