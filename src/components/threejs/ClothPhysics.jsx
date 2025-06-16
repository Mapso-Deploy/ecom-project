import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// FIXED REALISTIC Cloth Physics - With Visible Oscillation
const ClothPhysics = ({ 
  meshRef, 
  rotationData = { speed: 0, direction: 0, isMoving: false },
  intensity = 1.0,
  debug = false 
}) => {
  const targetMesh = useRef();
  const originalVertices = useRef();
  const isInitialized = useRef(false);
  const time = useRef(0);
  
  // Physics State
  const smoothedTwist = useRef(0);
  const lastRotationSpeed = useRef(0);
  
  // --- OSCILLATION SYSTEM ---
  const oscillation = useRef({
    energy: 0,          // Current energy driving the oscillation
    initialEnergy: 1,   // Energy captured at the start of oscillation (to calculate 'relax')
    velocity: 0,        // How fast the cloth is swinging back and forth
    position: 0,        // Current position in the swing (-1 to 1)
    isOscillating: false
  });

  useEffect(() => {
    if (!meshRef?.current || isInitialized.current) return;
    
    let mesh;
    meshRef.current.traverse((child) => {
      if (child.isMesh && !mesh) mesh = child;
    });
    
    if (!mesh) return;

    targetMesh.current = mesh;
    originalVertices.current = new Float32Array(mesh.geometry.attributes.position.array);
    mesh.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    isInitialized.current = true;
    console.log('CLOTH PHYSICS: Initialized with dynamic constraints.');
  }, [meshRef]);
  
  useFrame((state, delta) => {
    if (!isInitialized.current) return;

    // Use a stable delta time to prevent physics explosions
    const dt = Math.min(delta, 1 / 30);
    time.current += dt;
    
    const { speed = 0, direction = 0, isMoving = false } = rotationData;
    const osc = oscillation.current;

    // --- PHASE 1: ACTIVE ROTATION ---
    if (isMoving && Math.abs(speed) > 0.001) {
      osc.isOscillating = false;

      // Calculate the target twist based on rotation speed
      const maxTwist = 0.35;
      const targetTwist = Math.sign(direction) * Math.min(Math.abs(speed * 0.18), maxTwist);

      // Smoothly approach the target twist
      smoothedTwist.current = THREE.MathUtils.lerp(smoothedTwist.current, targetTwist, dt * 8.0);
      
      // Store the final rotation speed for the transition to oscillation
      lastRotationSpeed.current = speed;

    } 
    // --- PHASE 2: TRANSITION & OSCILLATION ---
    else {
      // On the VERY FIRST frame after rotation stops, capture the energy and initialize oscillation.
      if (!osc.isOscillating) {
        osc.isOscillating = true;
        
        // 1. Capture Kinetic Energy: Based on how fast the model was spinning.
        // The power of 1.5 makes faster spins disproportionately more energetic.
        const capturedEnergy = Math.pow(Math.abs(lastRotationSpeed.current), 1.5) * 0.5;
        osc.energy = Math.max(capturedEnergy, 0.01); // Ensure there's at least a little energy
        osc.initialEnergy = osc.energy; // Store this for the 'relax' calculation
        
        // 2. Seed Initial Velocity: Give the oscillation a "push" based on the last twist amount.
        osc.velocity = smoothedTwist.current * 20.0; // The '20.0' is a tunable "kick" factor.
        
        // 3. Set Initial Position: The swing starts from wherever the cloth was.
        osc.position = smoothedTwist.current;

        lastRotationSpeed.current = 0; // Reset for next time
      }

      // If there's energy, run the physics simulation
      if (osc.energy > 0.001) {
        // A. Spring-Damper Physics (The engine of the oscillation)
        const springConstant = 200.0; // Strong force pulling back to center
        const dampingFactor = 0.96;   // How quickly it loses velocity (frame-rate independent)

        // Calculate the force pulling the cloth back to its resting state (0)
        const restoringForce = -osc.position * springConstant;
        
        // Apply the force to the velocity
        osc.velocity += restoringForce * dt;
        
        // Apply damping to slow the velocity over time
        osc.velocity *= Math.pow(dampingFactor, dt * 60);

        // Update the position based on the new velocity
        osc.position += osc.velocity * dt;
        
        // B. Energy Decay
        const energyDecayFactor = 0.985; // How quickly the overall energy fades
        osc.energy *= Math.pow(energyDecayFactor, dt * 60);
        
        // The current twist is now directly driven by the oscillation position and its energy
        smoothedTwist.current = osc.position * osc.energy * 2.5; // The '2.5' amplifies the swing visually

      } else {
        // Once energy is depleted, gently return to rest
        osc.energy = 0;
        osc.position = THREE.MathUtils.lerp(osc.position, 0, dt * 5);
        smoothedTwist.current = THREE.MathUtils.lerp(smoothedTwist.current, 0, dt * 5);
      }
    }

    // --- PER-VERTEX MANIPULATION (The "Visual" part) ---
    const positionAttribute = targetMesh.current.geometry.attributes.position;
    const vertices = positionAttribute.array;
    
    // The "Relax Factor": 0 = max energy (wild), 1 = zero energy (calm)
    // This is the KEY to dynamically adjusting constraints.
    const relax = THREE.MathUtils.clamp(1 - osc.energy / osc.initialEnergy, 0, 1);

    for (let i = 0; i < vertices.length / 3; i++) {
      const i3 = i * 3;
      const origX = originalVertices.current[i3];
      const origY = originalVertices.current[i3 + 1];
      const origZ = originalVertices.current[i3 + 2];
      
      const heightFactor = Math.max(0, (origY + 3) / 6); // Normalized height (0=bottom, 1=top)
      const distanceFromCore = Math.sqrt(origX * origX + origZ * origZ);

      // --- 1. Idle Waves ---
      const wind = 0.32; // Base idle movement
      const waveScale = (1 - heightFactor);
      const waveX = Math.sin(time.current * 2.0 + origY * 1.2) * 0.14 * wind * waveScale;
      const waveZ = Math.cos(time.current * 1.8 + origX * 0.8) * 0.11 * wind * waveScale;
      const waveY = Math.sin(time.current * 1.6 + origZ * 1.0) * 0.08 * wind * waveScale;

      // --- 2. Twist Calculation ---
      let twistX = 0, twistZ = 0;
      if (Math.abs(smoothedTwist.current) > 0.001) {
          const twistAngle = smoothedTwist.current * Math.pow(1 - heightFactor, 2) * 2.5;
          const currentAngle = Math.atan2(origZ, origX);
          const newAngle = currentAngle + twistAngle;
          
          const targetX = Math.cos(newAngle) * distanceFromCore;
          const targetZ = Math.sin(newAngle) * distanceFromCore;
          
          twistX = (targetX - origX);
          twistZ = (targetZ - origZ);
      }
      
      let finalX = origX + waveX + twistX;
      let finalY = origY + waveY;
      let finalZ = origZ + waveZ + twistZ;

      // --- 3. DYNAMIC CONSTRAINT SYSTEM ---
      if (osc.isOscillating) {
        // ⭐ SOLUTION: Define loose "budgets" when energy is high, and tight budgets when calm.
        // We use the 'relax' factor to interpolate between these states.
        
        // A. Dynamic Displacement Limit: How far a vertex can move from its origin.
        const maxDisplacement = distanceFromCore * THREE.MathUtils.lerp(0.8, 0.25, relax); // Wild: 80% of core dist, Calm: 25%
        
        // B. Dynamic Anti-Stretch: How much a vertex can stretch away from the center axis.
        const stretchTolerance = THREE.MathUtils.lerp(1.5, 1.05, relax); // Wild: Allow 50% stretch, Calm: Allow 5%
        
        // --- Apply Constraints ---
        const displacement = Math.sqrt(twistX * twistX + twistZ * twistZ);
        if (displacement > maxDisplacement) {
            const limitFactor = maxDisplacement / displacement;
            twistX *= limitFactor;
            twistZ *= limitFactor;
        }

        const newCoreDistance = Math.sqrt(Math.pow(origX + twistX, 2) + Math.pow(origZ + twistZ, 2));
        if (newCoreDistance > distanceFromCore * stretchTolerance) {
            const stretchFactor = (distanceFromCore * stretchTolerance) / newCoreDistance;
            twistX *= stretchFactor;
            twistZ *= stretchFactor;
        }
        
        // Re-calculate final positions after constraint application
        finalX = origX + waveX + twistX;
        finalZ = origZ + waveZ + twistZ;
      }
      
      // --- 4. Final Position & Gravity ---
      const gravity = (1 - heightFactor) * 0.4;
      vertices[i3] = finalX;
      vertices[i3 + 1] = finalY - gravity;
      vertices[i3 + 2] = finalZ;
    }
    
    positionAttribute.needsUpdate = true;
    targetMesh.current.geometry.computeVertexNormals();
  });
  
  return null;
};

export default ClothPhysics;