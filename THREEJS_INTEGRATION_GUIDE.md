# Three.js Integration Guide - Mapso Cloth Physics Implementation

## 🎯 Overview

This guide outlines the integration of Three.js with realistic cloth physics for your Mapso fashion website. The implementation replaces Google Model Viewer with a custom Three.js solution that provides:

- **Horizontal-only rotation** (360° spin, no zoom)
- **Physics-responsive cloth draping** (dynamic on fast rotation, subtle on slow)
- **Pre-baked drape effects** as default positions
- **Performance optimizations** for mobile and desktop
- **Preserved interaction logic** (click detection, modal functionality)

## 🚀 Quick Test

**Test the implementation immediately:**

1. Start your development server: `npm start`
2. Navigate to: `http://localhost:3000/products-test`
3. You should see the Three.js test mode with cloth physics

## 📁 New Files Created

### Core Components
- `src/components/threejs/ThreeModel.jsx` - Main Three.js component with cloth physics
- `src/components/threejs/threejs.css` - Three.js specific styling
- `src/components/ModelsMappedThree.js` - Updated mapping component
- `src/components/ProductDetailThree.js` - Updated product detail modal

### Test Files
- `src/data/productDataTest.js` - Test data with local 3D asset
- `src/ProductsTest.js` - Test version of Products component
- `public/3_D_Trial_Product_ac19ec0ede.glb` - Test 3D model

## 🔧 Implementation Details

### Cloth Physics Features

**Rotation-Responsive Physics:**
```javascript
// Dynamic movement based on rotation speed
if (physicsIntensity > 0.1) {
  // More dramatic movement during rotation
  const swayX = Math.sin(time * 2 + i * 0.1) * physicsIntensity * 0.03 * verticalFactor;
  const swayZ = Math.cos(time * 1.5 + i * 0.15) * physicsIntensity * 0.02 * verticalFactor;
} else {
  // Subtle idle movement
  const idleSwayX = Math.sin(time * 0.8 + i * 0.05) * 0.008 * verticalFactor;
  const idleSwayZ = Math.cos(time * 0.6 + i * 0.07) * 0.006 * verticalFactor;
}
```

**Performance Optimizations:**
- Frame-on-demand rendering
- Low-end device detection
- Reduced physics calculations on mobile
- Optimized geometry processing

**Controls Configuration:**
```javascript
// Horizontal rotation only - no zoom
minPolarAngle={Math.PI / 2}
maxPolarAngle={Math.PI / 2}
enableZoom={false}
enablePan={false}
```

## 🎨 Asset Preparation

### Recommended Blender Workflow

1. **Create Cloth Simulation:**
   - Set up cloth modifier on garment mesh
   - Configure collision objects (body form)
   - Run simulation to desired drape

2. **Bake Animation:**
   - Bake cloth simulation to keyframes
   - Choose natural hanging pose as default

3. **Optimize for Web:**
   - Reduce polygon count while preserving cloth detail
   - Compress textures to 1024x1024 or smaller
   - Export as .glb with embedded textures

4. **Export Settings:**
   ```
   Format: glTF 2.0 (.glb)
   Include: Selected Objects, Textures
   Compression: Draco (optional for smaller files)
   ```

### File Format Requirements

- **Preferred:** `.glb` (embedded textures)
- **Alternative:** `.gltf` + separate texture files
- **Texture Size:** 1024x1024 max for mobile performance
- **Polygon Count:** 2K-10K vertices depending on complexity

## 🔄 Integration Steps

### Phase 1: Testing (Current)

✅ **Completed:**
- Three.js components created
- Test route established (`/products-test`)
- Local 3D asset integrated
- Cloth physics implemented

### Phase 2: Full Integration

**To replace Google Model Viewer completely:**

1. **Update Products.js:**
   ```javascript
   // Replace this import:
   // import ModelsMapped from "./components/ModelsMapped.js";
   
   // With this:
   import ModelsMappedThree from "./components/ModelsMappedThree.js";
   ```

2. **Update ProductDetail modal:**
   ```javascript
   // Replace ProductDetail import with:
   import ProductDetailThree from './components/ProductDetailThree';
   ```

3. **Update your 3D asset URLs:**
   - Ensure all `.glb` files are accessible via HTTPS
   - Update `productData.js` with optimized models
   - Test loading performance

### Phase 3: Production Deployment

1. **Asset Optimization:**
   - Compress 3D models using Draco
   - Implement progressive loading
   - Set up CDN for asset delivery

2. **Performance Testing:**
   - Test on various devices (mobile, tablet, desktop)
   - Monitor frame rates and loading times
   - Adjust physics parameters as needed

## 🐛 Troubleshooting

### Common Issues

**1. 3D Model Not Loading:**
```
Error: Model failed to load
```
- **Solution:** Check file path and ensure model is in `/public/` directory
- **Verification:** Visit `http://localhost:3000/your-model.glb` directly

**2. Poor Performance:**
```
Low FPS or stuttering
```
- **Solution:** Reduce physics calculations or model complexity
- **Code Fix:** Increase `timeStep` in Physics component or reduce vertex manipulation

**3. Controls Not Working:**
```
Rotation feels sluggish or unresponsive
```
- **Solution:** Adjust damping and rotation speed settings
- **Code Location:** `OrbitControls` configuration in `ThreeModel.jsx`

### Debug Mode

Enable debug mode by adding `debug={true}` to the Physics component:
```javascript
<Physics debug={true} gravity={[0, -0.5, 0]} timeStep={1/30}>
```

## 📊 Performance Metrics

### Target Performance
- **Desktop:** 60 FPS
- **Mobile:** 30+ FPS
- **Loading Time:** < 3 seconds for first model
- **Bundle Size Impact:** ~500KB (Three.js + dependencies)

### Monitoring
```javascript
// Performance monitoring hook included
const { fps, isLowPerformance } = usePerformanceMonitor();
```

## 🔐 Security Considerations

- All 3D assets served over HTTPS
- No sensitive data in model files
- CORS properly configured for asset loading
- Input validation for user interactions

## 🌐 Browser Compatibility

**Supported:**
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 8+)

**WebGL Requirements:**
- WebGL 2.0 preferred
- WebGL 1.0 fallback available

## 📈 Next Steps

### Immediate (After Testing)
1. Test the `/products-test` route thoroughly
2. Verify cloth physics respond to rotation speed
3. Check mobile performance and responsiveness
4. Confirm modal functionality works correctly

### Short Term
1. Optimize your existing 3D assets for cloth physics
2. Prepare production-ready models with pre-baked draping
3. A/B test against current Google Model Viewer implementation

### Long Term
1. Consider advanced features (fabric texture simulation, wind effects)
2. Implement analytics to track user interaction with 3D models
3. Optimize for emerging AR/VR capabilities

## 🤝 Support

**Key Contact Points:**
- Three.js Documentation: https://threejs.org/docs/
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber
- Rapier Physics: https://rapier.rs/docs/

**Implementation Questions:**
- Check existing comments in code
- Refer to performance monitoring hooks
- Test different physics parameters for your specific garments

---

**⚠️ Important:** Always test thoroughly before deploying to production. The cloth physics are calibrated for fashion garments - you may need to adjust parameters based on your specific 3D models and desired visual effects.

**🧪 Current Status:** Test implementation ready at `/products-test` route. 