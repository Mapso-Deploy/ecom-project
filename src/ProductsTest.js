import React, { useState, useEffect } from 'react'
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarComp from "./components/NavbarComp.js";
import ModelsMappedThree from "./components/ModelsMappedThree.js";
import { productDataTest } from "./data/productDataTest.js";
import Modal from './components/Modal';
import ProductDetailThree from './components/ProductDetailThree';

export default function ProductsTest() {
const showCount = (window.screen.width >= 1280) ? 8 : 2;

const [startIndex, setStartIndex] = useState(0);
const [disablePrev, setDisablePrev] = useState(true);
const [disableNext, setDisableNext] = useState(false);

const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedProduct, setSelectedProduct] = useState(null);

const handleOpenModal = (product) => {
  setSelectedProduct(product);
  setIsModalOpen(true);
  // Attempt to notify Snipcart that content has changed when modal opens
  if (window.Snipcart && typeof window.Snipcart.events.trigger === 'function') {
    try {
      window.Snipcart.events.trigger('content.changed');
      console.log('Snipcart content.changed triggered');
    } catch (e) {
      console.error("Error triggering Snipcart content.changed event:", e);
    }
  }
};

const handleCloseModal = () => {
  setIsModalOpen(false);
  setSelectedProduct(null);
};

useEffect(() => {
    console.log("useEffect", productDataTest.length, startIndex, productDataTest.length < startIndex + showCount);
    if(productDataTest.length < startIndex + showCount) {
        setDisableNext(true); 
    } else {
        setDisableNext(false); 
    }
    if (startIndex <= 0) {
        setStartIndex(0);
        setDisablePrev(true);
    } else {
        setDisablePrev(false);
    }
}, [startIndex]);  // eslint-disable-line react-hooks/exhaustive-deps

function handleNext() {
    setStartIndex(startIndex + showCount);
}
function handlePrevious() {
    setStartIndex(startIndex - showCount);
}

    return (
        <>
        <NavbarComp/>
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2 style={{ color: '#333', marginBottom: '20px' }}>
                🧪 Three.js Test Mode - Cloth Physics Enabled
            </h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Testing new Three.js implementation with realistic cloth draping and physics.
                <br />
                Horizontal rotation only, no zoom. Physics respond to rotation speed.
            </p>
        </div>
        <ModelsMappedThree 
            products={productDataTest.slice(startIndex, startIndex + showCount)} 
            onProductClick={handleOpenModal} 
        />
        <div className="row">
            <div className="col-md-12 text-center p-4">
                <button className="btn" disabled={disablePrev} onClick={() => handlePrevious()} style={{'--hover-color':'#4cffa0', display:'none'}}>Previous</button>
                <button className="btn" disabled={disableNext} onClick={() => handleNext()} style={{'--hover-color':'#4cffa0', display:'none'}}>Next</button>
            </div>
        </div>

        {selectedProduct && (
          <Modal show={isModalOpen} onClose={handleCloseModal}>
            <ProductDetailThree key={selectedProduct.id} product={selectedProduct} />
          </Modal>
        )}
        </>
    )
} 