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
  
  // 🎯 NATURAL PHYSICS - Simplified and Realistic System
  const smoothedTwist = useRef(0);              // Current twist effect
  const twistMomentum = useRef(0);              // Momentum after stopping
  const twistDirection = useRef(0);             // Current twist direction
  const lastActiveTime = useRef(0);             // For natural settling
  
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
    
    timeRef.current += delta;
    const { speed = 0, direction = 0, isMoving = false } = rotationData;
    
    // 🌬️ ENHANCED BASE WIND SYSTEM - More visible idle movement  
    let baseWind = 0.25; // INCREASED from 0.12 to 0.25 for visible idle waves
    let activeWind = 0;
    
    // 🌪️ ULTRA-GRADUAL TWIST CALCULATION - Flows from draped state
    let targetTwist = 0;
    
    if (isMoving && Math.abs(speed) > 0.001) {
      // Build twist gradually based on rotation speed
      activeWind = Math.abs(speed) * 0.6 * intensity; // REDUCED from 0.8 to 0.6 for smoother buildup
      
      // 🎯 SUBTLE TWIST BUILDUP - Starts from draped state  
      const speedThreshold = 0.02; // Minimum speed before twist begins
      const adjustedSpeed = Math.max(0, Math.abs(speed) - speedThreshold); // Only twist after threshold
      const maxTwist = 0.8; // REDUCED maximum twist from 1.2 to 0.8
      const rawTwist = direction * adjustedSpeed * 0.15; // MUCH smaller base twist (0.25 → 0.15)
      targetTwist = Math.sign(rawTwist) * Math.min(Math.abs(rawTwist), maxTwist);
      
      twistDirection.current = direction;
      lastActiveTime.current = timeRef.current;
    } else {
      // When stopped, add momentum but decay it
      twistMomentum.current *= 0.92; // SLOWER momentum decay (0.88 → 0.92) for smoother transitions
      if (Math.abs(twistMomentum.current) < 0.002) { // Lower threshold for smoother end
        twistMomentum.current = 0;
      }
    }
    
    // 🌪️ ULTRA-SMOOTH TWIST BUILDUP - Eliminates all glitching
    const buildupSpeed = isMoving ? 0.5 : 0.25; // EVEN SLOWER buildup (0.8 → 0.5) and release (0.4 → 0.25)
    const twistLerp = Math.min(delta * buildupSpeed, 0.15); // MUCH SMALLER max step (0.3 → 0.15)
    
    // Apply momentum when stopping
    const totalTargetTwist = targetTwist + twistMomentum.current;
    
    // Smooth interpolation with natural feel
    smoothedTwist.current = THREE.MathUtils.lerp(
      smoothedTwist.current,
      totalTargetTwist,
      twistLerp
    );
    
    // Store momentum when transitioning from active to idle
    if (!isMoving && Math.abs(targetTwist) < 0.01 && Math.abs(smoothedTwist.current) > 0.02) {
      twistMomentum.current = smoothedTwist.current * 0.4; // Less momentum carryover
    }
    
    // 🎯 FINAL WIND STRENGTH
    const totalWind = baseWind + activeWind;
    
    const positionAttribute = targetMesh.current.geometry.attributes.position;
    const vertices = positionAttribute.array;
    const vertexCount = positionAttribute.count;
    
    // Apply natural fabric movement to all vertices
    for (let i = 0; i < vertexCount; i++) {
      const i3 = i * 3;
      
      const origX = originalVertices.current[i3];
      const origY = originalVertices.current[i3 + 1];
      const origZ = originalVertices.current[i3 + 2];
      
      // 📐 HEIGHT-BASED PHYSICS - Natural hanging behavior
      const heightFactor = Math.max(0, Math.min(1, (origY + 3) / 6));
      
      // 🔒 RIGID ANCHORING - Top stays put, bottom flows
      const anchorStrength = heightFactor * 0.98; // 98% anchoring at top
      const flowScale = 1.0 - anchorStrength; // Bottom has most flow
      
      // ⏰ WAVE TIMING - Synchronized with twist
      const time1 = timeRef.current * 2.0 + origY * 1.2; 
      const time2 = timeRef.current * 1.6 + origZ * 1.0;
      const time3 = timeRef.current * 1.8 + origX * 0.8;
      
      // 🌊 ENHANCED FABRIC WAVES - More visible idle movement
      const waveX = Math.sin(time1) * 0.15 * totalWind * flowScale; // INCREASED from 0.08 to 0.15
      const waveY = Math.sin(time2 + Math.PI/4) * 0.08 * totalWind * flowScale; // INCREASED from 0.04 to 0.08
      const waveZ = Math.cos(time3) * 0.12 * totalWind * flowScale; // INCREASED from 0.06 to 0.12
      
      // 🌪️ NATURAL TWIST BLENDING - Flows with idle waves  
      const twistDelay = (1 - heightFactor) * 0.3;
      const twistPhase = timeRef.current * 1.2 - twistDelay;
      
      // 🎯 FIXED DIRECTION LOGIC - Keep sign through entire calculation
      const rawTwistIntensity = smoothedTwist.current; // Keep the sign!
      const maxTwistMagnitude = 0.6; 
      const clampedTwistIntensity = Math.sign(rawTwistIntensity) * Math.min(Math.abs(rawTwistIntensity), maxTwistMagnitude);
      
      // 🎯 NATURAL TWIST RESISTANCE - Gravity affects lower parts more
      const twistGravity = (1 - heightFactor) * 0.6;
      const twistResistance = 1.0 - twistGravity;
      
      // 🌪️ CORRECTED NATURAL TWIST - Proper directional behavior
      const twistMagnitude = Math.abs(clampedTwistIntensity);
      const twistSign = Math.sign(clampedTwistIntensity);
      
      // Simplified, natural twist calculation
      let twistX, twistZ;
      
      // Natural fabric twist - bottom follows top rotation direction
      if (twistMagnitude > 0.001) {
        // Use simple, predictable trigonometry
        const rotationAngle = twistPhase + (clampedTwistIntensity * 3.0); // Natural rotation progression
        
        // Right rotation (positive direction)
        if (twistSign > 0) {
          twistX = Math.cos(rotationAngle) * twistMagnitude * 0.03 * flowScale * twistResistance;
          twistZ = Math.sin(rotationAngle) * twistMagnitude * 0.03 * flowScale * twistResistance;
        } 
        // Left rotation (negative direction) - naturally opposite
        else {
          twistX = Math.cos(-rotationAngle + Math.PI) * twistMagnitude * 0.03 * flowScale * twistResistance;
          twistZ = Math.sin(-rotationAngle + Math.PI) * twistMagnitude * 0.03 * flowScale * twistResistance;
        }
      } else {
        // No twist when intensity is near zero
        twistX = 0;
        twistZ = 0;
      }
      
      // ⬇️ ENHANCED GRAVITY - Much heavier fabric
      const baseGravity = (1 - heightFactor) * 0.4; // Strong base gravity
      const twistGravityPull = Math.abs(clampedTwistIntensity) * (1 - heightFactor) * 0.2; // Extra gravity during twist
      const totalGravity = baseGravity + twistGravityPull;
      
      // 🎯 FINAL VERTEX POSITIONING - Natural and controlled
      vertices[i3] = origX + waveX + twistX;
      vertices[i3 + 1] = origY + waveY - totalGravity; // Heavy fabric draping
      vertices[i3 + 2] = origZ + waveZ + twistZ;
    }
    
    // Update the geometry
    positionAttribute.needsUpdate = true;
    targetMesh.current.geometry.computeVertexNormals();
    
    // Debug logging
    if (debug && timeRef.current % 2 < delta) {
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