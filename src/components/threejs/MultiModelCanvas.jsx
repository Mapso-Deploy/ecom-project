import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Single model component
const SingleModel = ({ url, position, onPointerDown, onPointerUp, onPointerMove }) => {
  const meshRef = useRef();
  const groupRef = useRef();
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Always call hooks at the top level - no conditionals
  const gltf = useGLTF(url);
  
  useEffect(() => {
    if (gltf && gltf.scene && groupRef.current && !modelLoaded) {
      try {
        const scene = gltf.scene.clone();
        
        // Calculate bounding box to center and scale the model properly
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Center the model
        scene.position.copy(center).multiplyScalar(-1);
        
        // Scale the model to fit nicely in view
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        groupRef.current.scale.setScalar(scale);
        
        // Clear any existing children and add the cloned scene
        while (groupRef.current.children.length > 0) {
          groupRef.current.remove(groupRef.current.children[0]);
        }
        groupRef.current.add(scene);
        
        // Store mesh reference
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
    return <mesh position={position}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="red" /></mesh>;
  }
  
  return (
    <group 
      ref={groupRef}
      position={position}
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

const MultiModelCanvas = ({ 
  models = [], // Array of {src, alt, onModelClick, onMouseDown, onMouseUp, onClick}
  ...props 
}) => {
  const controlsRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [clickStartTime, setClickStartTime] = useState(0);
  const [lastRotation, setLastRotation] = useState(0);
  
  // Track rotation speed for physics
  const handleRotationChange = useCallback(() => {
    if (!controlsRef.current) return;
    
    const currentRotation = controlsRef.current.getAzimuthalAngle();
    setLastRotation(currentRotation);
  }, []);
  
  const handlePointerDown = useCallback((event, modelIndex) => {
    setIsDragging(true);
    setClickStartTime(Date.now());
    event.stopPropagation();
    if (models[modelIndex]?.onMouseDown) models[modelIndex].onMouseDown(event);
  }, [models]);
  
  const handlePointerUp = useCallback((event, modelIndex) => {
    const clickDuration = Date.now() - clickStartTime;
    
    if (!isDragging || clickDuration < 200) {
      // Short click - trigger modal
      if (models[modelIndex]?.onModelClick) {
        models[modelIndex].onModelClick();
      } else if (models[modelIndex]?.onClick) {
        models[modelIndex].onClick();
      }
    }
    
    setIsDragging(false);
    event.stopPropagation();
    if (models[modelIndex]?.onMouseUp) models[modelIndex].onMouseUp(event);
  }, [isDragging, clickStartTime, models]);
  
  const handlePointerMove = useCallback((event) => {
    if (isDragging) {
      event.stopPropagation();
    }
  }, [isDragging]);
  
  return (
    <div style={{ width: '100%', height: '400px', ...props.style }}>
      <Canvas
        camera={{ 
          position: [0, 0, 8], 
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
        
        {models.map((model, index) => (
          <SingleModel
            key={`model-${index}`}
            url={model.src}
            position={[index * 4 - (models.length - 1) * 2, 0, 0]} // Space models horizontally
            onPointerDown={(event) => handlePointerDown(event, index)}
            onPointerUp={(event) => handlePointerUp(event, index)}
            onPointerMove={handlePointerMove}
          />
        ))}
        
        <HorizontalControls
          controlsRef={controlsRef}
          onRotationChange={handleRotationChange}
        />
      </Canvas>
    </div>
  );
};

export default MultiModelCanvas; 