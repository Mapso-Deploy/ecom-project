// ProductDetailThree.js
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { productData } from '../data/productData';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarComp from "./NavbarComp.js";
import ThreeModel from './threejs/ThreeModel';

const MOBILE_BREAKPOINT = 768;

// Modified to accept product as a prop for modal usage
const ProductDetailThree = ({ product: productProp, isModal = false, onBack }) => {
  const { productId: productIdFromParams } = useParams();
  const [product, setProduct] = useState(null);
  const [isSnipcartReady, setIsSnipcartReady] = useState(false);
  const [buttonText, setButtonText] = useState('Add to Cart');
  const [show3DModel, setShow3DModel] = useState(true);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < MOBILE_BREAKPOINT);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (productProp) {
      setProduct(productProp);
      console.log('[ProductDetailThree] Rendering in MODAL context (productProp is present)');
    } else if (productIdFromParams) {
      const productDetail = productData.find(p => p.id.toString() === productIdFromParams);
      setProduct(productDetail);
      console.log('[ProductDetailThree] Rendering in PAGE context (productIdFromParams is present)');
    }
    console.log('[ProductDetailThree] isModal prop value:', isModal);
  }, [productProp, productIdFromParams, isModal]);

  const checkSnipcartApi = useCallback(() => {
    console.log('[ProductDetailThree] checkSnipcartApi called');
    if (window.Snipcart && window.Snipcart.api && window.Snipcart.api.cart && typeof window.Snipcart.api.cart.items.add === 'function') {
      console.log('[ProductDetailThree] Snipcart API (cart.items.add) is ready.');
      setIsSnipcartReady(true);
      setButtonText('Add to Cart');
      return true;
    }
    console.log('[ProductDetailThree] Snipcart API (cart.items.add) not yet ready. Current window.Snipcart:', window.Snipcart);
    setButtonText('Cart loading... (Snipcart API (cart.items.add) still not found after timeout.)');
    return false;
  }, []);

  useEffect(() => {
    console.log('[ProductDetailThree] useEffect for Snipcart check started.');
    setButtonText('Initializing Cart...');
    if (checkSnipcartApi()) {
      return;
    }
    const handleSnipcartReady = () => {
      console.log('[ProductDetailThree] snipcart.ready event fired!');
      checkSnipcartApi();
    };
    console.log('[ProductDetailThree] Waiting for snipcart.ready event... Attaching listener.');
    document.addEventListener('snipcart.ready', handleSnipcartReady);
    const timeoutId = setTimeout(() => {
      console.log('[ProductDetailThree] Snipcart ready event timeout. Checking API directly.');
      if (!checkSnipcartApi()) {
        setButtonText('Cart loading... (Snipcart API (cart.items.add) still not found after timeout.)');
        console.error('[ProductDetailThree] Snipcart API (cart.items.add) still not found after timeout. Current window.Snipcart:', JSON.stringify(window.Snipcart));
      }
    }, 7000);
    return () => {
      console.log('[ProductDetailThree] Cleaning up Snipcart event listener and timeout.');
      document.removeEventListener('snipcart.ready', handleSnipcartReady);
      clearTimeout(timeoutId);
    };
  }, [checkSnipcartApi]);

  if (!product) {
    return <div>Loading...</div>;
  }

  const handleAddToCart = async () => {
    if (!product) {
      console.error("Product data is not available.");
      return;
    }
    if (!isSnipcartReady) {
      console.error("Snipcart API (cart.items.add) is not ready.");
      checkSnipcartApi();
      return;
    }
    setButtonText('Adding to Cart...');
    try {
      console.log(`[ProductDetailThree] Adding item:`, {
        id: product.id.toString(),
        name: product.name,
        price: parseFloat(product.price),
        url: product.url || `${window.location.origin}/products/${product.id}`,
        description: product.description,
        image: product.images && product.images.length > 0 ? product.images[0] : product.image,
        quantity: 1
      });
      await window.Snipcart.api.cart.items.add({
        id: product.id.toString(),
        name: product.name,
        price: parseFloat(product.price),
        url: product.url || `${window.location.origin}/products/${product.id}`,
        description: product.description,
        image: product.images && product.images.length > 0 ? product.images[0] : product.image,
        quantity: 1
      });
      console.log(`[ProductDetailThree] ${product.name} added to cart successfully.`);
      setButtonText('Added!');
      setTimeout(() => setButtonText('Add to Cart'), 2000);
    } catch (error) {
      console.error('[ProductDetailThree] Snipcart.api.cart.items.add error:', error);
      setButtonText('Error Adding');
      setTimeout(() => {
        setButtonText('Add to Cart');
        checkSnipcartApi();
      }, 3000);
    }
  };
  
  const toggleView = () => setShow3DModel(prevShow => !prevShow);

  // Dynamic styles based on isMobileView
  const productContentStyle = {
    display: 'flex',
    flexDirection: isMobileView ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'center', 
    maxWidth: '1000px', 
    margin: productProp ? '0 auto 20px auto' : '150px auto 0',
    padding: '0 20px' 
  };

  const productMediaColumnStyle = {
    height: isMobileView ? '300px' : '400px',
    width: isMobileView ? '100%' : '50%', 
    marginRight: isMobileView ? '0' : (productProp ? '10px' : '40px'),
    marginBottom: isMobileView ? '20px' : '0',
    flexShrink: 0,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const productDetailsStyle = {
    flex: isMobileView ? 'none' : 1,
    width: isMobileView ? '100%' : 'auto',
    textAlign: isMobileView ? 'center' : 'left'
  };

  return (
    <div className="product-detail-container-new" style={{ overflowY: 'auto', height: productProp ? 'auto' : '100vh', paddingTop: productProp ? '0px' : '0' }}>
    { !productProp && <NavbarComp/> }
    <div className="product-detail-container">
      <div className="product-content" style={productContentStyle}>
        <div className="product-media-column" style={productMediaColumnStyle}>
          <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}> 
            {show3DModel ? (
              <Suspense fallback={
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.05)',
                  borderRadius: '8px'
                }}>
                  <div className="progress-bar">
                    <div className="update-bar"></div>
                  </div>
                </div>
              }>
                <ThreeModel
                  src={product.image}
                  alt={`3D model of ${product.name}`}
                  poster={product.poster}
                  autoRotate={true}
                  loading="eager"
                  className="product-3d-model-three"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'block',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    '--poster-color': 'transparent', 
                    zIndex: '1' 
                  }}
                />
              </Suspense>
            ) : (
              <div className="scrollable-gallery" style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
                {product.images.map((image, index) => (
                  <img 
                    key={index} 
                    src={image} 
                    alt={`Product gallery ${index + 1}`} 
                    style={{ 
                        width: '100%', 
                        height: 'auto', 
                        objectFit: 'contain', 
                        marginBottom: '10px'
                    }} 
                  />
                ))}
              </div>
            )}
          </div>
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={toggleView} 
            style={{ 
                position: 'absolute', 
                bottom: '5px',
                right: '5px',
                zIndex: '2',
                fontSize: '0.75rem',
                padding: '0.1rem 0.3rem'
            }}
          >
            {show3DModel ? 'Gallery' : '3D'}
          </Button>
        </div>

        <div className="product-details" style={productDetailsStyle}>
          <h2 className="product-title">{product.name}</h2>
          <p className="product-price">${product.price}</p>
          <p className="product-description">{product.description}</p>
          <div className="buy-buttons-product-details" style={{ justifyContent: isMobileView ? 'center' : 'flex-start'}}>
            <span>
              <button 
                className="buy-button-product-details"
                onClick={handleAddToCart}
                disabled={!isSnipcartReady || buttonText !== 'Add to Cart'}
              >
                {buttonText}
              </button> 
              <p className="divider">|</p>
            </span>
            <span>
              <button className="btc-buy-button-new"><a className="buy-with-crypto" href={product.crypto}>₿</a></button>
            </span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ProductDetailThree; 