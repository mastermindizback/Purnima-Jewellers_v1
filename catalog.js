document.addEventListener('DOMContentLoaded', function() {
    const productGrid = document.getElementById('product-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loadMoreContainer = document.getElementById('load-more-container');
    const PRODUCTS_PER_PAGE = 12;
    let currentPage = 1;
    let currentImages = [];
    let imageIndex = {};
    const whatsappNumber = '919377404477';

    // PythonAnywhere API configuration
    //const API_BASE_URL = 'https://vihar.pythonanywhere.com'; // Replace with your actual PythonAnywhere domain
    const API_BASE_URL = 'https://admin.purnimajewels.in';
    const IMAGE_BASE_URL = 'https://purnimajewels.in/images/catalog'; // Direct image access


    // Category mappings (matching the Flask app)
    const categories = {
        'antitarnish': {
            title: 'Antitarnish Chain, Earrings and Bracelets'
        },
        'bali': {
            title: 'Bali & Half Bali Earrings'
        },
        'bangles': {
            title: 'Bangles'
        },
        'bracelets': {
            title: 'Bracelets'
        },
        'delicate-pendant': {
            title: 'Delicate Pendant Sets'
        },
        'kundan-heavy': {
            title: 'Kundan Heavy Sets'
        },
        'kundan': {
            title: 'Kundan and AD Earrings'
        },
        'ring-nath': {
            title: 'Rings Naths and Tikas'
        },
        'sets': {
            title: 'AD Heavy Sets'
        },
        'silver': {
            title: 'Silver Replicas'
        },
        'studs': {
            title: 'AD and Kundan Studs'
        },
        'temple': {
            title: 'Gold Polish Jewellery'
        }
    };

    // Static Apache directory folder names
    const categoryFolders = {
        'antitarnish': 'Antitarnish Jewellery',
        'bali': 'Bali and halfbali style earrings',
        'bangles': 'Bangles',
        'bracelets': 'Bracelets',
        'delicate-pendant': 'Delicate Pendant Sets',
        'kundan-heavy': 'Kundan Heavy Sets',
        'kundan': 'Kundan earrings',
        'ring-nath': 'RingNath',
        'sets': 'Sets',
        'silver': 'Silver Replicas',
        'studs': 'Studs',
        'temple': 'Temple Jewellery'
    };

    // Clean Vishwakarma WhatsApp inquiry generator
    function generateWhatsAppUrl(phoneNumber, categoryTitle, filename, photoUrl) {
        const designNum = filename ? filename.split('.')[0] : '';
        const shareUrl = `https://catalog.purnimajewels.in/product.html?category=${encodeURIComponent(categoryTitle)}&product=${encodeURIComponent(photoUrl)}`;
        const message = [
            `*Hello Purnima Jewellers!* 👋`,
            `I would like to inquire about this design from your digital catalog:`,
            `• *Collection*: ${categoryTitle}`,
            designNum ? `• *Design / Item*: #${designNum}` : null,
            `• *Photo Link*: ${shareUrl}`,
            ``,
            `Could you please share the wholesale price, availability, and ordering options?`
        ].filter(Boolean).join('\n');

        return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    }

    // Check for product in URL parameters and redirect to product page
    const urlParams = new URLSearchParams(window.location.search);
    const productPath = urlParams.get('product');
    const productCategory = urlParams.get('category');

    if (productPath && productCategory) {
        // Redirect to product page if product parameters are present
        const productURL = `product.html?product=${productPath}&category=${productCategory}`;
        window.location.href = productURL;
        return;
    }

    // Auto-scroll functionality
    function scrollToProducts() {
        const catalogGrid = document.querySelector('.catalog-grid');
        if (catalogGrid) {
            // Add a small delay to ensure content is rendered
            setTimeout(() => {
                catalogGrid.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 300);
        }
    }

    // Alternative scroll method - scroll to first product
    function scrollToFirstProduct() {
        setTimeout(() => {
            const firstProduct = document.querySelector('.product-card');
            if (firstProduct) {
                firstProduct.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            } else {
                // Fallback to catalog grid if no products yet
                scrollToProducts();
            }
        }, 500);
    }

    function setButtonsEnabled(enabled) {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(button => {
            button.disabled = !enabled;
            if (!enabled) {
                button.style.opacity = '0.6';
                button.style.cursor = 'not-allowed';
            } else {
                button.style.opacity = '';
                button.style.cursor = '';
            }
        });
    }

    function updateLoadingProgress(loaded, total, currentCategory) {
        const loadingIndicator = document.getElementById('loading-indicator');
        const progressText = loadingIndicator.querySelector('.loading-progress');
        const loadingText = loadingIndicator.querySelector('.loading-text');

        if (loaded === 0) {
            loadingIndicator.style.display = 'block';
            setButtonsEnabled(false);
        }

        progressText.textContent = `Loading ${loaded} products`;
        loadingText.textContent = `Loading ${currentCategory === 'all' ? 'all categories' : categories[currentCategory].title}...`;

        if (loaded === total) {
            setTimeout(() => {
                loadingIndicator.style.display = 'none';
                setButtonsEnabled(true);
                // Auto-scroll to products after loading is complete
                scrollToFirstProduct();
            }, 500);
        }
    }

    function createProductCard(imageUrl, categoryTitle, filename, categoryKey) {
        const col = document.createElement('div');
        col.className = 'col-6 col-md-4 col-lg-3 mb-4';

        const card = document.createElement('div');
        card.className = 'product-card h-100 d-flex flex-column';
        card.setAttribute('data-category', categoryKey);

        const imgWrapper = document.createElement('div');
        imgWrapper.style.cursor = 'pointer';

        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = 'product-image';
        img.alt = `${categoryTitle} #${filename.split('.')[0]}`;
        img.loading = 'lazy';

        // Auto fallback to Flask API if Apache static file is missing or in dev
        img.onerror = function() {
            if (!this.dataset.fallbackTried) {
                this.dataset.fallbackTried = '1';
                this.src = `${API_BASE_URL}/api/images/${categoryKey}/${filename}`;
            } else {
                console.error('Failed to load image:', imageUrl);
                this.style.display = 'none';
            }
        };

        imgWrapper.onclick = () => openModal(imageUrl, categoryTitle, filename);
        imgWrapper.appendChild(img);

        // 1-Tap WhatsApp & Design # Actions
        const actions = document.createElement('div');
        actions.className = 'product-card-actions';

        const badge = document.createElement('span');
        badge.className = 'product-design-badge';
        badge.textContent = `#${filename.split('.')[0]}`;

        const waBtn = document.createElement('a');
        waBtn.className = 'btn-whatsapp-card';
        waBtn.target = '_blank';
        waBtn.rel = 'noopener noreferrer';
        waBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Inquire';
        waBtn.href = generateWhatsAppUrl(whatsappNumber, categoryTitle, filename, imageUrl);

        actions.appendChild(badge);
        actions.appendChild(waBtn);

        card.appendChild(imgWrapper);
        card.appendChild(actions);
        col.appendChild(card);
        return col;
    }

    function loadMoreProducts() {
        const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const endIdx = Math.min(startIdx + PRODUCTS_PER_PAGE, currentImages.length);
        const batch = currentImages.slice(startIdx, endIdx);

        batch.forEach((img) => {
            productGrid.appendChild(createProductCard(img.url, img.category, img.filename, img.categoryKey));
        });

        currentPage++;
        loadMoreBtn.disabled = endIdx >= currentImages.length;
        if (loadMoreBtn.disabled) {
            loadMoreContainer.style.display = 'none';
        }
    }

    // Load image index from Cloudflare edge first, fallback to API
    async function loadImageIndex() {
        // 1. Try local Cloudflare edge first (fastest, 0ms latency, zero load on server)
        try {
            console.log('Loading image index from Cloudflare edge...');
            const response = await fetch('./images-index.json');

            if (response.ok) {
                const data = await response.json();
                imageIndex = data.images || data.data || {};
                console.log('Edge image index loaded successfully');
                if (data.categories) {
                    Object.keys(data.categories).forEach(folder => {
                        const slug = data.categories[folder];
                        if (categories[slug]) {
                            categories[slug].title = folder;
                        }
                    });
                }
                return;
            }
        } catch (edgeError) {
            console.warn('Edge index not reachable, falling back to API:', edgeError);
        }

        // 2. Fallback to API if edge is not available
        try {
            console.log('Loading image index from Admin API...');
            const response = await fetch(`${API_BASE_URL}/api/images/index`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                imageIndex = data.data || data.images || {};
                console.log('API image index loaded successfully');

                if (data.categories) {
                    Object.keys(data.categories).forEach(key => {
                        if (categories[key]) {
                            categories[key].title = data.categories[key];
                        }
                    });
                }
            } else {
                throw new Error(data.error || 'Failed to load image index');
            }
        } catch (error) {
            console.error('Error loading image index:', error);
            imageIndex = {};
        }
    }

    // Load images with direct Apache static URLs
    async function loadImages(category, shouldAutoScroll = true) {
        productGrid.innerHTML = '';
        currentPage = 1;
        currentImages = [];
        let imagesToLoad = [];
        let loadedCount = 0;

        // Auto-scroll immediately when starting to load (except for initial load)
        if (shouldAutoScroll) {
            scrollToProducts();
        }

        if (category === 'all') {
            // Load images from all categories
            Object.entries(categories).forEach(([key, value]) => {
                const categoryImages = imageIndex[key] || [];
                categoryImages.forEach(filename => {
                    imagesToLoad.push({
                        category: key,
                        filename: filename,
                        categoryTitle: value.title
                    });
                });
            });
        } else {
            // Load images from selected category
            const categoryInfo = categories[category];
            if (!categoryInfo) {
                console.error('Category not found:', category);
                return;
            }

            const categoryImages = imageIndex[category] || [];
            categoryImages.forEach(filename => {
                imagesToLoad.push({
                    category: category,
                    filename: filename,
                    categoryTitle: categoryInfo.title
                });
            });
        }

        if (imagesToLoad.length === 0) {
            console.log('No images found for category:', category);
            updateLoadingProgress(0, 0, category);
            return;
        }

        updateLoadingProgress(0, imagesToLoad.length, category);

        // Process images and create direct Apache static URLs
        imagesToLoad.forEach((img, index) => {
            const folderName = categoryFolders[img.category] || img.category;
            const imageUrl = `${IMAGE_BASE_URL}/${encodeURIComponent(folderName)}/${encodeURIComponent(img.filename)}`;

            currentImages.push({
                url: imageUrl,
                category: img.categoryTitle,
                filename: img.filename,
                categoryKey: img.category
            });

            loadedCount++;
            updateLoadingProgress(loadedCount, imagesToLoad.length, category);
        });

        // Show load more button if needed
        loadMoreContainer.style.display = currentImages.length > PRODUCTS_PER_PAGE ? 'block' : 'none';
        loadMoreBtn.disabled = false;

        // Load first batch
        loadMoreProducts();
    }
    }

    // Redirect to product page instead of opening modal
    window.openModal = function(imageUrl, category, filename = null) {
        console.log('Redirecting to product page for:', category, imageUrl);

        // Create clean URL for product page
        const encodedImageUrl = encodeURIComponent(imageUrl);
        const encodedCategory = encodeURIComponent(category);
        const productURL = `product.html?product=${encodedImageUrl}&category=${encodedCategory}`;

        // Redirect to product page
        window.location.href = productURL;
    };

    loadMoreBtn.addEventListener('click', loadMoreProducts);

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Add visual feedback for button click
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);

            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Load images with auto-scroll enabled
            loadImages(button.dataset.category, true);
        });
    });

    // Initialize the application
    async function init() {
        console.log('Initializing catalog...');
        await loadImageIndex();
        // Don't auto-scroll on initial load
        loadImages('all', false);

        // Handle hash in URL for direct category access
        const hash = window.location.hash.slice(1);
        if (hash && categories[hash]) {
            const button = document.querySelector(`[data-category="${hash}"]`);
            if (button) {
                button.click();
            }
        }
    }

    init();
});