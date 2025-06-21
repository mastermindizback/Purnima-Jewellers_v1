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
    const API_BASE_URL = 'https://vihar.pythonanywhere.com'; // Replace with your actual PythonAnywhere domain

    // Category mappings (matching the Flask app)
    const categories = {
        'antitarnish': {
            title: 'Antitarnish Jewellery'
        },
        'bali': {
            title: 'Bali Earrings'
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
            title: 'Kundan Earrings'
        },
        'ring-nath': {
            title: 'Ring & Nath'
        },
        'sets': {
            title: 'Complete Sets'
        },
        'silver': {
            title: 'Silver Replicas'
        },
        'studs': {
            title: 'Studs'
        },
        'temple': {
            title: 'Temple Jewellery'
        }
    };

    // Check for product in URL parameters when page loads
    const urlParams = new URLSearchParams(window.location.search);
    const productPath = urlParams.get('product');
    const productCategory = urlParams.get('category');

    function tryOpenModal() {
        if (typeof bootstrap !== 'undefined' && productPath && productCategory) {
            const decodedPath = decodeURIComponent(productPath);
            openModal(decodedPath, productCategory);
        }
    }

    if (productPath && productCategory) {
        tryOpenModal();
        setTimeout(tryOpenModal, 1000);
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
            }, 500);
        }
    }

    function createProductCard(imageUrl, category, filename) {
        const col = document.createElement('div');
        col.className = 'col-6 col-md-4 col-lg-3 mb-4';

        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-category', category);

        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = 'product-image';
        img.alt = category;
        img.loading = 'lazy';

        // Add error handling for image loading
        img.onerror = function() {
            console.error('Failed to load image:', imageUrl);
            this.style.display = 'none';
        };

        img.onclick = () => openModal(imageUrl, category);

        card.appendChild(img);
        col.appendChild(card);
        return col;
    }

    function loadMoreProducts() {
        const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const endIdx = Math.min(startIdx + PRODUCTS_PER_PAGE, currentImages.length);
        const batch = currentImages.slice(startIdx, endIdx);

        batch.forEach((img) => {
            productGrid.appendChild(createProductCard(img.url, img.category, img.filename));
        });

        currentPage++;
        loadMoreBtn.disabled = endIdx >= currentImages.length;
        if (loadMoreBtn.disabled) {
            loadMoreContainer.style.display = 'none';
        }
    }

    // Load image index from PythonAnywhere API
    async function loadImageIndex() {
        try {
            console.log('Loading image index from API...');
            const response = await fetch(`${API_BASE_URL}/api/images/index`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                imageIndex = data.data;
                console.log('Image index loaded:', imageIndex);

                // Update categories if provided by API
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
            console.log('Falling back to empty index');
            imageIndex = {};
        }
    }

    // Load images from PythonAnywhere API
    async function loadImages(category) {
        productGrid.innerHTML = '';
        currentPage = 1;
        currentImages = [];
        let imagesToLoad = [];
        let loadedCount = 0;

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

        // Process images and create URLs
        imagesToLoad.forEach((img, index) => {
            const imageUrl = `${API_BASE_URL}/api/images/${img.category}/${img.filename}`;

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

    window.openModal = function(imageUrl, category) {
        console.log('Opening modal for:', category, imageUrl);

        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        if (modal && modalImg) {
            modalImg.src = imageUrl;
            if (typeof bootstrap !== 'undefined') {
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
            }
        }
    };

    loadMoreBtn.addEventListener('click', loadMoreProducts);

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            loadImages(button.dataset.category);
        });
    });

    // Initialize the application
    async function init() {
        console.log('Initializing catalog...');
        await loadImageIndex();
        loadImages('all');

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