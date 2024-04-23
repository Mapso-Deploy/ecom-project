import React from 'react'
// import { Link } from 'react-router-dom'; // Import Link
import { Link, useHistory } from 'react-router-dom'; // Import Link


export default function Model(props) {


    const history = useHistory(); // Use history to programmatically navigate
    let clickStart = 0; // Track when the mouse is pressed

    const handleMouseDown = () => {
        clickStart = new Date().getTime(); // Record time when mouse is pressed
    };

    const handleMouseUp = (productId) => {
        const clickDuration = new Date().getTime() - clickStart; // Calculate click duration
        if (clickDuration < 200) { // If the duration is less than 200 milliseconds, treat as a click
            history.push(`/products/${productId}`); // Navigate to product details
        }
    };


    console.log('model props',props)
    return (
        <>
        <div className="models-mapped-container">
        <div className="models-mapped">
        {props.products.map(product =>
        <div className="Title" key={product.id}>
            {/* <h6>{props.item.name}</h6> */}
            <div className="Center">
            <model-viewer class="model" interaction-prompt="none" data-js-focus-visible 
            src={product.image}
            alt={product.name} 
            camera-controls min-camera-orbit="auto 90deg auto" max-camera-orbit="auto 90deg 7.699m" 
            min-field-of-view="45deg" max-field-of-view="45deg" camera-orbit="-90deg 90deg 7.699m" 
            poster={product.poster} 
            style={{ '--poster-color': 'transparent' }}
            loading="eager" auto-rotate
            onMouseDown={handleMouseDown}
            onMouseUp={() => handleMouseUp(product.id)}
            >
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
                    data-item-url={`https://mapso.co/products/`}  // Make sure this is an absolute URL
                    // data-item-image={product.image}
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




