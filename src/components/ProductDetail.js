// ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
//import { productData } from "./data/productData.js"; // Assume you have a file with product data or an API call
import { productData } from '../data/productData';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Assuming you have productData available
    const product = productData.find(p => p.id.toString() === productId);
    setProduct(product);
  }, [productId]);

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>${product.price}</p>
      {/* Display more product details as needed */}
    </div>
  );
};

export default ProductDetail;
