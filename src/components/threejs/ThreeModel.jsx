import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Custom hook for cloth physics (currently disabled)
// const useClothPhysics = (meshRef, rotationSpeed = 0) => {
//   // Implementation disabled to prevent distortion
// };

// Model component with proper centering and scaling
const Model = ({ url, rotationSpeed, onPointerDown, onPointerUp, onPointerMove }) => {
  const meshRef = useRef();
  const groupRef = useRef();
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Always call hooks at the top level - no conditionals
  const gltf = useGLTF(url);
  // Temporarily disable cloth physics to fix distortion
  // useClothPhysics(meshRef, rotationSpeed);
  
  useEffect(() => {
    if (gltf && gltf.scene && groupRef.current && !modelLoaded) {
      try {
        // Clone the scene to avoid conflicts when multiple components use the same GLB
        const scene = gltf.scene.clone();
        
        // Calculate bounding box to center and scale the model properly
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Center the model
        scene.position.copy(center).multiplyScalar(-1);
        
        // Scale the model to fit nicely in view
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4.5 / maxDim; // Increased from 3 to 4.5 to make models bigger
        groupRef.current.scale.setScalar(scale);
        
        // Clear any existing children and add the cloned scene
        while (groupRef.current.children.length > 0) {
          groupRef.current.remove(groupRef.current.children[0]);
        }
        groupRef.current.add(scene);
        
        // Store mesh reference for potential future physics
        scene.traverse((child) => {
          if (child.isMesh) {
            meshRef.current = child;
          }
        });
        
        setModelLoaded(true);
      } catch (error) {
        console.error('Error setting up 3D model:', error);
      }
    }
  }, [gltf, modelLoaded]);
  
  // Handle error state after all hooks are called
  if (!gltf || !gltf.scene) {
    return <mesh><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="red" /></mesh>;
  }
  
  return (
    <group 
      ref={groupRef}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
    />
  );
};

// Controls component for horizontal-only rotation
const HorizontalControls = ({ controlsRef, onRotationChange }) => {
  const { camera, gl } = useThree();
  
  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableZoom={false}
      enablePan={false}
      minPolarAngle={Math.PI / 2}
      maxPolarAngle={Math.PI / 2}
      rotateSpeed={1}
      onChange={onRotationChange}
    />
  );
};

const ThreeModel = ({ 
  src, 
  alt = "3D Model", 
  onModelClick,
  onMouseDown,
  onMouseUp,
  onClick,
  ...props 
}) => {
  const controlsRef = useRef();
  const [rotationSpeed, setRotationSpeed] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [clickStartTime, setClickStartTime] = useState(0);
  const [lastRotation, setLastRotation] = useState(0);
  
  // Track rotation speed for physics
  const handleRotationChange = useCallback(() => {
    if (!controlsRef.current) return;
    
    const currentRotation = controlsRef.current.getAzimuthalAngle();
    const rotationDiff = Math.abs(currentRotation - lastRotation);
    setRotationSpeed(rotationDiff * 10); // Amplify for visible effect
    setLastRotation(currentRotation);
    
    // Decay rotation speed
    setTimeout(() => setRotationSpeed(prev => prev * 0.8), 16);
  }, [lastRotation]);
  
  const handlePointerDown = useCallback((event) => {
    setIsDragging(true);
    setClickStartTime(Date.now());
    event.stopPropagation();
    if (onMouseDown) onMouseDown(event);
  }, [onMouseDown]);
  
  const handlePointerUp = useCallback((event) => {
    const clickDuration = Date.now() - clickStartTime;
    
    if (!isDragging || clickDuration < 200) {
      // Short click - trigger modal
      if (onModelClick) {
        onModelClick();
      } else if (onClick) {
        onClick();
      }
    }
    
    setIsDragging(false);
    event.stopPropagation();
    if (onMouseUp) onMouseUp(event);
  }, [isDragging, clickStartTime, onModelClick, onClick, onMouseUp]);
  
  const handlePointerMove = useCallback((event) => {
    if (isDragging) {
      event.stopPropagation();
    }
  }, [isDragging]);
  
  return (
    <div style={{ width: '100%', height: '400px', ...props.style }}>
      <Canvas
        camera={{ 
          position: [0, 0, 6], 
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: false
        }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <directionalLight position={[-5, -5, 5]} intensity={0.8} />
        <pointLight position={[0, 0, 10]} intensity={0.5} />
        
        <Model
          url={src}
          rotationSpeed={rotationSpeed}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
        />
        
        <HorizontalControls
          controlsRef={controlsRef}
          onRotationChange={handleRotationChange}
        />
      </Canvas>
    </div>
  );
};

export default ThreeModel; 