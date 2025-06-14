document.addEventListener('DOMContentLoaded', function() {
    const productGrid = document.getElementById('product-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loadMoreContainer = document.getElementById('load-more-container');
    const PRODUCTS_PER_PAGE = 12;
    let currentPage = 1;
    let currentImages = [];
    const whatsappNumber = '919377404477'; // WhatsApp number with country code (91 for India)
    
    // Check for product in URL parameters when page loads
    const urlParams = new URLSearchParams(window.location.search);
    const productPath = urlParams.get('product');
    const productCategory = urlParams.get('category');
    
    // Function to try opening modal
    function tryOpenModal() {
        if (typeof bootstrap !== 'undefined' && productPath && productCategory) {
            const decodedPath = decodeURIComponent(productPath);
            openModal(decodedPath, productCategory);
        }
    }

    // Try opening modal after a short delay to ensure Bootstrap is loaded
    if (productPath && productCategory) {
        // First attempt immediately
        tryOpenModal();
        // Second attempt after a delay as fallback
        setTimeout(tryOpenModal, 1000);
    }

    // Category mappings
    const categories = {
        'antitarnish': {
            path: 'PJ%20Jewellery%20Pics/Antitarnish%20Jewellery',
            title: 'Antitarnish Jewellery'
        },
        'bali': {
            path: 'PJ%20Jewellery%20Pics/Bali%20and%20halfbali%20style%20earrings',
            title: 'Bali Earrings'
        },
        'bangles': {
            path: 'PJ%20Jewellery%20Pics/Bangles',
            title: 'Bangles'
        },
        'bracelets': {
            path: 'PJ%20Jewellery%20Pics/Bracelets',
            title: 'Bracelets'
        },
        'delicate-pendant': {
            path: 'PJ%20Jewellery%20Pics/Delicate%20Pendant%20Sets',
            title: 'Delicate Pendant Sets'
        },
        'kundan-heavy': {
            path: 'PJ%20Jewellery%20Pics/Kundan%20Heavy%20Sets',
            title: 'Kundan Heavy Sets'
        },
        'kundan': {
            path: 'PJ%20Jewellery%20Pics/Kundan%20earrings',
            title: 'Kundan Earrings'
        },
        'ring-nath': {
            path: 'PJ%20Jewellery%20Pics/RingNath',
            title: 'Ring & Nath'
        },
        'sets': {
            path: 'PJ%20Jewellery%20Pics/Sets',
            title: 'Complete Sets'
        },
        'silver': {
            path: 'PJ%20Jewellery%20Pics/Silver%20Replicas',
            title: 'Silver Replicas'
        },
        'studs': {
            path: 'PJ%20Jewellery%20Pics/Studs',
            title: 'Studs'
        },
        'temple': {
            path: 'PJ%20Jewellery%20Pics/Temple%20Jewellery',
            title: 'Temple Jewellery'
        }
    };
    // Function to disable/enable category buttons
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

    // Function to update loading progress
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
            }, 500); // Short delay to show completion
        }
    }

    // Function to create product card
    function createProductCard(imagePath, category) {
        const col = document.createElement('div');
        col.className = 'col-6 col-md-4 col-lg-3 mb-4';
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-category', category);
        
        const img = document.createElement('img');
        img.src = imagePath;
        img.className = 'product-image';
        img.alt = category;
        img.loading = 'lazy';
        
        img.onclick = () => openModal(imagePath, category);
        
        card.appendChild(img);
        col.appendChild(card);
        return col;
    }

    // Function to load more products
    function loadMoreProducts() {
        const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const endIdx = Math.min(startIdx + PRODUCTS_PER_PAGE, currentImages.length);
        const batch = currentImages.slice(startIdx, endIdx);

        batch.forEach(img => {
            const image = new Image();
            image.onload = () => {
                productGrid.appendChild(createProductCard(img.path, img.category));
            };
            image.onerror = () => {}; // Skip errors silently for pagination
            image.src = img.path;
        });

        currentPage++;
        loadMoreBtn.disabled = endIdx >= currentImages.length;
        if (loadMoreBtn.disabled) {
            loadMoreContainer.style.display = 'none';
        }
    }

    // Function to load images for a category
    async function loadImages(category) {
        productGrid.innerHTML = '';
        currentPage = 1;
        currentImages = [];
        let imagesToLoad = [];
        let loadedCount = 0;

        if (category === 'all') {
            // Load images from all categories
            Object.entries(categories).forEach(([key, value]) => {
                for (let i = 1; i <= 200; i++) {
                    imagesToLoad.push({
                        path: `${value.path}/${i}.jpeg`,
                        category: value.title
                    });
                }
            });
        } else {
            // Load images from selected category
            const categoryInfo = categories[category];
            if (!categoryInfo) {
                console.error('Category not found:', category);
                return;
            }
            for (let i = 1; i <= 200; i++) {
                imagesToLoad.push({
                    path: `${categoryInfo.path}/${i}.jpeg`,
                    category: categoryInfo.title
                });
            }
        }

        // Initialize loading state
        updateLoadingProgress(0, imagesToLoad.length, category);

        // Preload all images first
        const preloadPromises = imagesToLoad.map(img => {
            return new Promise((resolve) => {
                const image = new Image();
                image.onload = () => {
                    currentImages.push(img);
                    loadedCount++;
                    updateLoadingProgress(loadedCount, imagesToLoad.length, category);
                    resolve();
                };
                image.onerror = () => {
                    loadedCount++;
                    updateLoadingProgress(loadedCount, imagesToLoad.length, category);
                    resolve();
                };
                image.src = img.path;
            });
        });

        // Wait for all images to preload
        await Promise.all(preloadPromises);

        // Show load more button if there are more images
        loadMoreContainer.style.display = currentImages.length > PRODUCTS_PER_PAGE ? 'block' : 'none';
        loadMoreBtn.disabled = false;

        // Load first batch
        loadMoreProducts();
    }

    // Function to open product page
    window.openModal = function(imagePath, category) {
        // Replace spaces with %20 and encode it again
        const path = imagePath.replace(/ /g, '%20');
        const encodedPath = path.replace(/%20/g, '%252520').replace(/\//g, '%2F');
        
        // Construct the full URL with both parameters
        const url = `https://purnimajewellers.pages.dev/product?product=${encodedPath}&category=${category}`;
        
        // Navigate to the product page
        window.location.href = url;
    };

    // Load more button click handler
    loadMoreBtn.addEventListener('click', loadMoreProducts);

    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            loadImages(button.dataset.category);
        });
    });

    // Load all images initially
    loadImages('all');

    // Handle hash in URL for direct category access
    const hash = window.location.hash.slice(1);
    if (hash && categories[hash]) {
        const button = document.querySelector(`[data-category="${hash}"]`);
        if (button) {
            button.click();
        }
    }
});
