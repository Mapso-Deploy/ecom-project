import React from 'react'

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
            <p style = {{ whiteSpace: "pre" }}>{product.name} {'    '} ${product.price}</p>
            <div class="buy-buttons">
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
                    <form class="buy-button" method="POST" action="https://btcpaymerchant.com/apps/32ji79KDmguSoduz9hDnEEgNBSXD/pos">
                    <input type="hidden" name="email" value="customer@example.com" />
                    <input type="hidden" name="orderId" value="CustomOrderId" />
                    <input type="hidden" name="notificationUrl" value="https://example.com/callbacks" />
                    <input type="hidden" name="redirectUrl" value="https://example.com/thanksyou" />
                    <button class="btc-buy-button-new" type="submit" name="choiceKey" value="fuck 12 tee">₿</button>
                    </form>
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


