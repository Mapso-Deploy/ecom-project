// ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productData } from '../data/productData'; // Path to your productData
import '@google/model-viewer';
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarComp from "./NavbarComp.js";

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const productDetail = productData.find(p => p.id.toString() === productId);
    setProduct(productDetail);
  }, [productId]);

  if (!product) {
    return <div>Loading...</div>;
  }

    // Updated carousel to use product.images
    const carouselItems = product.images.map((image, index) => (
        <Carousel.Item key={index}>
          <img className="d-block w-100 product-image" src={image} alt={`Product view ${index + 1}`} />
        </Carousel.Item>
      ));

  return (
    
    <div className="product-detail-container-new">
    <NavbarComp/>
    <div className="product-detail-container">
      <div className="product-content">
      <Carousel className="product-carousel" fade={true} style={{height: '100%'}}>
        {carouselItems}
      </Carousel>
        <model-viewer
          src={product.image}
          alt={`3D model of ${product.name}`}
          camera-controls
          interaction-prompt="none"
          auto-rotate
          camera-orbit="-90deg 90deg 7.699m"
          min-camera-orbit="auto 90deg auto"
          max-camera-orbit="auto 90deg 7.699m"
          min-field-of-view="45deg"
          max-field-of-view="45deg"
          style={{ '--poster-color': 'transparent', height: '400px', zIndex: '2'}}
          loading="eager"
          className="product-3d-model"
        ></model-viewer>
        <div className="product-details">
        <h2 className="product-title">{product.name}</h2>
          <p className="product-price">${product.price}</p>
          <p className="product-description">{product.description}</p>
          {/* Other details */}
          <div className="buy-buttons-product-details">
                <span>
                    <button class="buy-button-product-details snipcart-add-item"
                    data-item-id={product.id}
                    data-item-price={product.price}
                    data-item-description={product.description}
                    data-item-image={product.image}
                    data-item-name={product.name}
                    data-item-custom1-name={product.custom1Name}
                    data-item-custom1-options={product.options} >
                    Add to cart
                    </button> 
                   <p class="divider">|</p>
                    </span>
                    <span>
                    <button class="btc-buy-button-new"><a class="buy-with-crypto" href={product.crypto}>₿</a></button>
                    </span>
                </div>
        </div>
      </div>
      <Carousel className="product-carousel-mobile" fade={true} style={{height: '100%'}}>
        {carouselItems}
      </Carousel>
      {/* Your add to cart button and other information */}
    </div>
    </div>
  );
};

export default ProductDetail;
