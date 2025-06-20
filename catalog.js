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

    // GitHub API configuration - replace with your actual values
    const GITHUB_API_BASE = 'https://api.github.com/repos/mastermindizback/Purnima-Jewellers_v1/contents';
    const GITHUB_TOKEN = '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'; // Optional, for higher rate limits

    // Cache for loaded images to avoid re-fetching
    const imageCache = new Map();

    // Category mappings
    const categories = {
        'antitarnish': {
            path: 'PJ Jewellery Pics/Antitarnish Jewellery',
            title: 'Antitarnish Jewellery'
        },
        'bali': {
            path: 'PJ Jewellery Pics/Bali and halfbali style earrings',
            title: 'Bali Earrings'
        },
        'bangles': {
            path: 'PJ Jewellery Pics/Bangles',
            title: 'Bangles'
        },
        'bracelets': {
            path: 'PJ Jewellery Pics/Bracelets',
            title: 'Bracelets'
        },
        'delicate-pendant': {
            path: 'PJ Jewellery Pics/Delicate Pendant Sets',
            title: 'Delicate Pendant Sets'
        },
        'kundan-heavy': {
            path: 'PJ Jewellery Pics/Kundan Heavy Sets',
            title: 'Kundan Heavy Sets'
        },
        'kundan': {
            path: 'PJ Jewellery Pics/Kundan earrings',
            title: 'Kundan Earrings'
        },
        'ring-nath': {
            path: 'PJ Jewellery Pics/RingNath',
            title: 'Ring & Nath'
        },
        'sets': {
            path: 'PJ Jewellery Pics/Sets',
            title: 'Complete Sets'
        },
        'silver': {
            path: 'PJ Jewellery Pics/Silver Replicas',
            title: 'Silver Replicas'
        },
        'studs': {
            path: 'PJ Jewellery Pics/Studs',
            title: 'Studs'
        },
        'temple': {
            path: 'PJ Jewellery Pics/Temple Jewellery',
            title: 'Temple Jewellery'
        }
    };

    // Function to fetch binary content from GitHub API and convert to blob URL
    async function fetchImageFromGitHub(filePath) {
        // Check cache first
        if (imageCache.has(filePath)) {
            return imageCache.get(filePath);
        }

        try {
            const headers = {
                'Accept': 'application/vnd.github.v3+json'
            };

            // Add authorization header if token is provided
            if (GITHUB_TOKEN && GITHUB_TOKEN !== 'your-github-token') {
                headers['Authorization'] = `token ${GITHUB_TOKEN}`;
            }

            const response = await fetch(`${GITHUB_API_BASE}/${encodeURIComponent(filePath)}`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // GitHub API returns base64 encoded content for binary files
            if (data.content && data.encoding === 'base64') {
                // Convert base64 to binary
                const binaryString = atob(data.content);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                // Create blob and object URL
                const blob = new Blob([bytes], { type: 'image/jpeg' });
                const objectURL = URL.createObjectURL(blob);

                // Cache the result
                imageCache.set(filePath, objectURL);

                return objectURL;
            } else {
                throw new Error('Invalid content format from GitHub API');
            }
        } catch (error) {
            console.error('Error fetching image from GitHub:', error);
            return null;
        }
    }

    // Load image index from JSON file (also from GitHub API)
    async function loadImageIndex() {
        try {
            const headers = {
                'Accept': 'application/vnd.github.v3+json'
            };

            if (GITHUB_TOKEN && GITHUB_TOKEN !== 'your-github-token') {
                headers['Authorization'] = `token ${GITHUB_TOKEN}`;
            }

            const response = await fetch(`${GITHUB_API_BASE}/images-index.json`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error('Failed to load image index');
            }

            const data = await response.json();

            if (data.content) {
                let jsonString;

                if (data.encoding === 'base64') {
                    // Handle base64 encoded content (binary upload)
                    jsonString = atob(data.content);
                } else {
                    // Handle plain text content (text upload)
                    jsonString = data.content;
                }

                imageIndex = JSON.parse(jsonString);
                console.log('Image index loaded:', imageIndex);
            } else {
                throw new Error('Invalid image index format');
            }
        } catch (error) {
            console.error('Error loading image index:', error);
            console.log('Falling back to default image loading method');
            imageIndex = generateFallbackIndex();
        }
    }

    // Fallback method - generates default numbered images (1-10 for each category)
    function generateFallbackIndex() {
        const fallbackIndex = {};
        Object.keys(categories).forEach(category => {
            fallbackIndex[category] = [];
            for (let i = 1; i <= 10; i++) {
                fallbackIndex[category].push(`${i}.jpeg`);
            }
        });
        return fallbackIndex;
    }

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

    function createProductCard(imageBlobUrl, category, originalPath) {
        const col = document.createElement('div');
        col.className = 'col-6 col-md-4 col-lg-3 mb-4';

        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-category', category);

        const img = document.createElement('img');
        img.src = imageBlobUrl;
        img.className = 'product-image';
        img.alt = category;
        img.loading = 'lazy';

        img.onclick = () => openModal(imageBlobUrl, category);

        card.appendChild(img);
        col.appendChild(card);
        return col;
    }

    function loadMoreProducts() {
        const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const endIdx = Math.min(startIdx + PRODUCTS_PER_PAGE, currentImages.length);
        const batch = currentImages.slice(startIdx, endIdx);

        batch.forEach(async (img) => {
            if (img.blobUrl) {
                productGrid.appendChild(createProductCard(img.blobUrl, img.category, img.originalPath));
            }
        });

        currentPage++;
        loadMoreBtn.disabled = endIdx >= currentImages.length;
        if (loadMoreBtn.disabled) {
            loadMoreContainer.style.display = 'none';
        }
    }

    // Updated function to load images from GitHub API
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
                        path: `${value.path}/${filename}`,
                        category: value.title,
                        filename: filename
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
                    path: `${categoryInfo.path}/${filename}`,
                    category: categoryInfo.title,
                    filename: filename
                });
            });
        }

        if (imagesToLoad.length === 0) {
            console.log('No images found for category:', category);
            return;
        }

        updateLoadingProgress(0, imagesToLoad.length, category);

        // Load images concurrently but with rate limiting to avoid API limits
        const concurrencyLimit = 5; // Process 5 images at a time

        for (let i = 0; i < imagesToLoad.length; i += concurrencyLimit) {
            const batch = imagesToLoad.slice(i, i + concurrencyLimit);

            const batchPromises = batch.map(async (img) => {
                try {
                    const blobUrl = await fetchImageFromGitHub(img.path);
                    if (blobUrl) {
                        currentImages.push({
                            blobUrl: blobUrl,
                            category: img.category,
                            originalPath: img.path,
                            filename: img.filename
                        });
                    }
                    loadedCount++;
                    updateLoadingProgress(loadedCount, imagesToLoad.length, category);
                } catch (error) {
                    console.error('Error loading image:', img.path, error);
                    loadedCount++;
                    updateLoadingProgress(loadedCount, imagesToLoad.length, category);
                }
            });

            await Promise.all(batchPromises);

            // Small delay between batches to be nice to GitHub API
            if (i + concurrencyLimit < imagesToLoad.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        loadMoreContainer.style.display = currentImages.length > PRODUCTS_PER_PAGE ? 'block' : 'none';
        loadMoreBtn.disabled = false;

        loadMoreProducts();
    }

    window.openModal = function(imageBlobUrl, category) {
        // For modal, we can use the blob URL directly
        // You might want to modify this based on your modal implementation
        console.log('Opening modal for:', category, imageBlobUrl);

        // Example: If you have a modal that shows the image
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        if (modal && modalImg) {
            modalImg.src = imageBlobUrl;
            // Show modal using Bootstrap or your preferred method
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

    // Clean up blob URLs when page is about to unload to prevent memory leaks
    window.addEventListener('beforeunload', () => {
        imageCache.forEach(blobUrl => {
            URL.revokeObjectURL(blobUrl);
        });
    });

    // Initialize the application
    async function init() {
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