document.addEventListener("DOMContentLoaded", function () {
  // === GLOBAL VARIABLES ===
  const cartCountElement = document.getElementById("cart-count");

  // === INITIALIZE ALL FEATURES ON PAGE LOAD ===
  updateCartIcon();
  setupPageControls();
  setupNavSearch();
  setupSideCart();
  setupCarousel();
  setupPopup();
  setupProductThumbnails();

  // === LOGIKA SIDE CART ===
  function setupSideCart() {
    const toggleBtn = document.getElementById('side-cart-toggle');
    const closeBtn = document.getElementById('close-side-cart');
    const overlay = document.getElementById('side-cart-overlay');
    const container = document.getElementById('side-cart-container');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openSideCart();
      });
    }
    if (closeBtn) closeBtn.addEventListener('click', closeSideCart);
    if (overlay) overlay.addEventListener('click', closeSideCart);
    
    function openSideCart() {
        populateSideCart();
        if(overlay && container){
            overlay.classList.add('active');
            container.classList.add('active');
        }
    }
    function closeSideCart() {
        if(overlay && container){
            overlay.classList.remove('active');
            container.classList.remove('active');
        }
    }
  }

  function populateSideCart() {
    const itemsContainer = document.getElementById('side-cart-items');
    if (!itemsContainer) return;

    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    itemsContainer.innerHTML = cart.length === 0 ? '<p>Your cart is empty.</p>' : '';
    
    cart.forEach(item => {
      // === PERUBAHAN DI SINI: Membuat URL untuk tautan ===
      const productDetailUrl = `detail-product.html?name=${encodeURIComponent(item.name)}&price=${encodeURIComponent(item.price)}&image=${encodeURIComponent(item.image)}`;

      const itemHTML = `
        <div class="side-cart-item" data-id="${item.id}">
          <a href="${productDetailUrl}">
            <img src="${item.image}" alt="${item.name}">
          </a>
          <div class="side-cart-item-info">
            <h4><a href="${productDetailUrl}" style="text-decoration:none; color:inherit;">${item.name}</a></h4>
            <p>SIZE: ${item.size}</p>
            <div class="quantity-adjuster">
              <button class="qty-decrease">-</button>
              <input type="number" class="qty-input" value="${item.quantity}" min="1" readonly>
              <button class="qty-increase">+</button>
            </div>
          </div>
          <div class="side-cart-item-pricing">
            <p class="final-price">${item.price}</p>
          </div>
        </div>
      `;
      itemsContainer.insertAdjacentHTML('beforeend', itemHTML);
    });

    updateSideCartSummary(cart);
    addSideCartEventListeners();
  }

  function updateSideCartSummary(cart) {
    const subtotalElement = document.getElementById('side-cart-subtotal');
    const totalElement = document.getElementById('side-cart-total');
    if (!subtotalElement || !totalElement) return;

    let subtotal = 0;
    cart.forEach(item => {
      const priceNumber = parseFloat(item.price.replace('IDR', '').replace(/[,.]/g, ''));
      subtotal += priceNumber * item.quantity;
    });

    const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
    subtotalElement.textContent = formatter.format(subtotal).replace('Rp', 'IDR');
    totalElement.textContent = formatter.format(subtotal).replace('Rp', 'IDR');
  }

  function addSideCartEventListeners() {
    document.querySelectorAll('.qty-decrease').forEach(btn => btn.addEventListener('click', adjustQuantity));
    document.querySelectorAll('.qty-increase').forEach(btn => btn.addEventListener('click', adjustQuantity));
  }

  function adjustQuantity(event) {
    const button = event.target;
    const itemId = button.closest('.side-cart-item').dataset.id;
    const isIncrease = button.classList.contains('qty-increase');
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const itemIndex = cart.findIndex(item => item.id === itemId);

    if (itemIndex > -1) {
      if (isIncrease) {
        cart[itemIndex].quantity++;
      } else {
        cart[itemIndex].quantity--;
      }
      if (cart[itemIndex].quantity === 0) {
        cart.splice(itemIndex, 1);
      }
    }

    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    populateSideCart();
    updateCartIcon();
  }

  // === ADD TO CART LOGIC ===
  const addToCartButton = document.getElementById("add-to-cart-btn");
  if (addToCartButton) {
    addToCartButton.addEventListener("click", function() {
      const name = document.getElementById("product-name").textContent;
      const price = document.getElementById("product-price").textContent;
      const image = document.getElementById("main-product-image").src;
      const size = document.getElementById("size").value;
      const id = name.replace(/\s+/g, '-') + '-' + size;
      let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
      const existingItem = cart.find(item => item.id === id);

      if (existingItem) existingItem.quantity++; else cart.push({ id, name, price, image, size, quantity: 1 });

      localStorage.setItem('shoppingCart', JSON.stringify(cart));
      updateCartIcon();
      
      const sideCartToggle = document.getElementById('side-cart-toggle');
      if (sideCartToggle) sideCartToggle.click();
    });
  }

  // === FUNGSI UTILITAS KERANJANG ===
  function updateCartIcon() {
    if (cartCountElement) {
      const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCountElement.textContent = totalItems;
      cartCountElement.style.display = totalItems > 0 ? 'block' : 'none';
    }
  }

  // === LOGIKA NAVIGASI PENCARIAN ===
  function setupNavSearch() {
    const searchToggleIcon = document.getElementById('search-toggle-icon');
    const closeNavSearchBtn = document.getElementById('close-nav-search');
    const navStandardView = document.getElementById('nav-standard-view');
    const navSearchView = document.getElementById('nav-search-view');
    const navSearchInput = document.getElementById('nav-search-input');

    if (searchToggleIcon) {
      searchToggleIcon.addEventListener('click', (e) => {
        e.preventDefault();
        navStandardView.classList.remove('active');
        navSearchView.classList.add('active');
        navSearchInput.focus();
      });
    }
    if (closeNavSearchBtn) {
      closeNavSearchBtn.addEventListener('click', () => {
        navSearchInput.value = '';
        runFilters();
        navSearchView.classList.remove('active');
        navStandardView.classList.add('active');
      });
    }
  }

  // === LOGIKA FILTER DAN SEARCH DI HALAMAN UTAMA ===
  function setupPageControls() {
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const navSearchInput = document.getElementById('nav-search-input');

    if (categoryFilter && priceFilter) {
      categoryFilter.addEventListener('change', runFilters);
      priceFilter.addEventListener('change', runFilters);
    }
    if (navSearchInput) {
      navSearchInput.addEventListener('keyup', runFilters);
    }
  }
  
  function runFilters() {
    const products = document.querySelectorAll('.product-card');
    if (products.length === 0) return;

    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const navSearchInput = document.getElementById('nav-search-input');

    if (!categoryFilter || !priceFilter || !navSearchInput) return;

    const categoryValue = categoryFilter.value;
    const priceValue = priceFilter.value;
    const searchTerm = navSearchInput.value.toLowerCase();
    const priceRange = priceValue.split('-');

    products.forEach(product => {
      const productCategory = product.dataset.category;
      const productPrice = parseInt(product.dataset.price);
      const productName = product.querySelector('h3').textContent.toLowerCase();

      const categoryMatch = (categoryValue === 'all') || (productCategory === categoryValue);
      const priceMatch = (priceValue === 'all') || (productPrice >= parseInt(priceRange[0]) && productPrice <= parseInt(priceRange[1]));
      const searchMatch = productName.includes(searchTerm);
      
      product.style.display = (categoryMatch && priceMatch && searchMatch) ? 'block' : 'none';
    });
  }

  // === PRODUCT DETAIL PAGE LOGIC ===
  const productNameElement = document.getElementById("product-name");
  if (productNameElement) {
    const params = new URLSearchParams(window.location.search);
    const productName = decodeURIComponent(params.get('name'));
    const productPrice = decodeURIComponent(params.get('price'));
    const productImage = decodeURIComponent(params.get('image'));

    if (productName && productPrice && productImage) {
      document.getElementById("main-product-image").src = productImage;
      document.getElementById("main-thumbnail").src = productImage;
      document.getElementById("product-name").textContent = productName;
      document.getElementById("product-price").textContent = productPrice;
      document.title = productName + " - Geulis";
    }
  }

  function setupProductThumbnails() {
    const mainImage = document.getElementById("main-product-image");
    const thumbnails = document.querySelectorAll(".thumbnail");
    if (!mainImage || thumbnails.length === 0) return;

    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener("click", function () {
        const newImageSrc = this.src.replace("_100x.", "_1024x1024.");
        mainImage.src = newImageSrc;
        
        const activeThumbnail = document.querySelector(".thumbnail.active");
        if(activeThumbnail) activeThumbnail.classList.remove("active");
        this.classList.add("active");
      });
    });
  }

  // === CAROUSEL/SLIDER LOGIC ===
  function setupCarousel() {
    const track = document.getElementById("carousel-track");
    if (!track) return;

    const slides = Array.from(track.children);
    if(slides.length === 0) return;
    let currentIndex = 0;

    function updateSlidePosition() {
      track.style.transform = "translateX(-" + currentIndex * 100 + "%)";
    }

    function moveToNextSlide() {
      currentIndex++;
      if (currentIndex >= slides.length) {
        currentIndex = 0;
      }
      updateSlidePosition();
    }
    
    setInterval(moveToNextSlide, 3000);
    updateSlidePosition();
  }

  // === POP-UP & FLOATING BUTTON LOGIC ===
  function setupPopup() {
    const voucherPopup = document.getElementById("voucherPopup");
    const closePopupButton = document.getElementById("closePopup");
    const continueButton = document.getElementById("continueShopping");
    const floatingBtn = document.getElementById("floatingDiscountButton");

    if (!voucherPopup || !closePopupButton || !continueButton || !floatingBtn) return;

    const showPopup = () => {
      floatingBtn.classList.remove("show");
      voucherPopup.classList.add("show");
    };

    const hidePopup = () => {
      voucherPopup.classList.remove("show");
      floatingBtn.classList.add("show");
    };

    if (!sessionStorage.getItem("popupWasShown")) {
      setTimeout(showPopup, 1500);
      sessionStorage.setItem("popupWasShown", "true");
    } else {
      floatingBtn.classList.add("show");
    }

    closePopupButton.addEventListener("click", hidePopup);
    continueButton.addEventListener("click", hidePopup);
    floatingBtn.addEventListener("click", function(e) {
        e.preventDefault();
        showPopup();
    });
  }
});
