import React from 'react'
import { Link } from 'react-router-dom'; // Import Link

export default function Model(props) {
    console.log('model props',props)
    return (
        <>
        <div className="models-mapped-container">
        <div className="models-mapped">
        {props.products.map(product =>
        <div className="Title" key={product.id}>
            {/* <h6>{props.item.name}</h6> */}
            <div className="Center">
            <model-viewer class="model" interaction-prompt="none" data-js-focus-visible src= "https://cdn.glitch.com/f341fe61-4868-4d79-bad9-1a5804bea407%2Fproduct.glb?v=1627186147544" camera-controls min-camera-orbit="auto 90deg auto" max-camera-orbit="auto 90deg 7.699m" min-field-of-view="45deg" max-field-of-view="45deg" camera-orbit="-90deg 90deg 7.699m" poster="https://cdn.glitch.com/f341fe61-4868-4d79-bad9-1a5804bea407%2Fposter.png?v=1627186159279" style={{ '--poster-color': 'transparent' }}
          loading="eager" auto-rotate>
                <div class="progress-bar hide" slot="progress-bar">
                <div class="update-bar"></div>
                </div>
            </model-viewer>
            <Link to={`/products/${product.id}`} className="product-info-link"> {/* Wrap product name with Link */}
            <p className="product-info" style = {{ whiteSpace: "pre" }}>{product.name} {'    '} ${product.price}</p>
            </Link>
            <div className="buy-buttons">
                <span>
                    <button class="buy-button-new snipcart-add-item"
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
                )}
        </div>
        </div>
        </>
    )
}




