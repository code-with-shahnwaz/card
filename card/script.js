 // Product data
        const products = [
            {
                id: 1,
                name: 'Classic T-Shirt',
                price: 25.99,
                imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
                variants: [
                    { color: 'Black', size: 'M', price: 25.99, stock: 10 },
                    { color: 'White', size: 'M', price: 24.99, stock: 5 },
                    { color: 'Navy', size: 'L', price: 26.99, stock: 0 },
                ]
            },
            {
                id: 2,
                name: 'Running Shoes',
                price: 89.99,
                imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
                variants: [
                    { color: 'Blue', size: '10', price: 89.99, stock: 3 },
                    { color: 'Red', size: '9', stock: 7 },
                ]
            },
            {
                id: 3,
                name: 'Wireless Headphones',
                price: 129.99,
                imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
                variants: [
                    { color: 'Black', stock: 15 },
                    { color: 'Silver', stock: 0 },
                ]
            },
            {
                id: 4,
                name: 'Smart Watch',
                price: 199.99,
                imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
                variants: [
                    { color: 'Midnight Black', stock: 8 },
                    { color: 'Rose Gold', stock: 4 },
                ]
            }
        ];

        // Cart state
        let cartItems = [];
        let cartOpen = false;

        // DOM Elements
        const cartIcon = document.getElementById('cartIcon');
        const cartPreview = document.getElementById('cartPreview');
        const closeCart = document.getElementById('closeCart');
        const overlay = document.getElementById('overlay');
        const productListing = document.getElementById('productListing');
        const cartItemsContainer = document.getElementById('cartItems');
        const cartItemCount = document.querySelector('.cart-count');
        const cartTotalElement = document.getElementById('cartTotal');
        const cartItemCountElement = document.getElementById('cartItemCount');

        // Initialize the app
        function init() {
            renderProducts();
            setupEventListeners();
            updateCartUI();
        }

        // Render products
        function renderProducts() {
            productListing.innerHTML = '';
            
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                
                const variantOptions = product.variants.map((variant, index) => {
                    return `
                        <option value="${index}">
                            ${variant.color} ${variant.size ? `- ${variant.size}` : ''}
                        </option>
                    `;
                }).join('');
                
                productCard.innerHTML = `
                    <div class="image-container">
                        <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                    </div>
                    <div class="product-details">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-price">$${product.price}</p>
                        
                        <div class="variant-selector">
                            <label for="variant-${product.id}">Options:</label>
                            <select id="variant-${product.id}" class="variant-select">
                                ${variantOptions}
                            </select>
                        </div>
                        
                        <div class="stock-status">
                            <span class="in-stock">${product.variants[0].stock} in stock</span>
                        </div>
                        
                        <button class="add-to-cart" data-id="${product.id}">
                            Add to Cart
                        </button>
                        
                        <div class="cart-message" style="display:none"></div>
                    </div>
                `;
                
                productListing.appendChild(productCard);
                
                // Set up event listeners for this product
                const variantSelect = productCard.querySelector(`#variant-${product.id}`);
                const stockStatus = productCard.querySelector('.stock-status');
                const addButton = productCard.querySelector('.add-to-cart');
                const cartMessage = productCard.querySelector('.cart-message');
                
                variantSelect.addEventListener('change', (e) => {
                    const variantIndex = parseInt(e.target.value);
                    const variant = product.variants[variantIndex];
                    
                    // Update price if variant has specific price
                    const priceElement = productCard.querySelector('.product-price');
                    priceElement.textContent = `$${variant.price || product.price}`;
                    
                    // Update stock status
                    stockStatus.innerHTML = variant.stock === 0 ?
                        '<span class="out-of-stock">Out of Stock</span>' :
                        `<span class="in-stock">${variant.stock} in stock</span>`;
                    
                    // Update button state
                    if (variant.stock === 0) {
                        addButton.classList.add('disabled');
                        addButton.disabled = true;
                        addButton.textContent = 'Out of Stock';
                    } else {
                        addButton.classList.remove('disabled');
                        addButton.disabled = false;
                        addButton.textContent = 'Add to Cart';
                    }
                });
                
                addButton.addEventListener('click', () => {
                    const variantIndex = parseInt(variantSelect.value);
                    const variant = product.variants[variantIndex];
                    
                    if (variant.stock === 0) return;
                    
                    addToCart(product, variantIndex);
                    
                    // Show success message
                    cartMessage.textContent = `Added ${variant.color} to cart!`;
                    cartMessage.style.display = 'block';
                    
                    setTimeout(() => {
                        cartMessage.style.display = 'none';
                    }, 2000);
                });
            });
        }

        // Add to cart
        function addToCart(product, variantIndex) {
            const variant = product.variants[variantIndex];
            
            const item = {
                id: `${product.id}-${variantIndex}`,
                productId: product.id,
                name: product.name,
                variant: variant.color + (variant.size ? ` - ${variant.size}` : ''),
                price: variant.price || product.price,
                imageUrl: product.imageUrl
            };
            
            cartItems.push(item);
            updateCartUI();
        }

        // Remove from cart
        function removeFromCart(itemId) {
            cartItems = cartItems.filter(item => item.id !== itemId);
            updateCartUI();
        }

        // Update cart UI
        function updateCartUI() {
            // Update cart count
            cartItemCount.textContent = cartItems.length;
            cartItemCountElement.textContent = cartItems.length;
            
            // Update cart items
            cartItemsContainer.innerHTML = '';
            
            if (cartItems.length === 0) {
                cartItemsContainer.innerHTML = `
                    <div class="empty-cart">
                        <p>Your cart is empty</p>
                        <button class="continue-shopping" id="continueShopping">
                            Continue Shopping
                        </button>
                    </div>
                `;
                
                document.getElementById('continueShopping').addEventListener('click', () => {
                    cartPreview.classList.remove('open');
                    overlay.classList.remove('active');
                });
            } else {
                cartItems.forEach(item => {
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-image">
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <p>${item.variant}</p>
                            <p>$${item.price.toFixed(2)}</p>
                        </div>
                        <button class="remove-item" data-id="${item.id}">&times;</button>
                    `;
                    cartItemsContainer.appendChild(cartItem);
                    
                    // Add event listener to remove button
                    cartItem.querySelector('.remove-item').addEventListener('click', (e) => {
                        removeFromCart(e.target.dataset.id);
                    });
                });
                
                // Update total
                const total = cartItems.reduce((sum, item) => sum + item.price, 0);
                cartTotalElement.textContent = total.toFixed(2);
            }
        }

        // Set up event listeners
        function setupEventListeners() {
            // Cart toggle
            cartIcon.addEventListener('click', () => {
                cartPreview.classList.add('open');
                overlay.classList.add('active');
            });
            
            closeCart.addEventListener('click', () => {
                cartPreview.classList.remove('open');
                overlay.classList.remove('active');
            });
            
            overlay.addEventListener('click', () => {
                cartPreview.classList.remove('open');
                overlay.classList.remove('active');
            });
        }

        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', init);
 
