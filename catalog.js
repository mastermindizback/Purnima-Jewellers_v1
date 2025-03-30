document.addEventListener('DOMContentLoaded', async function() {
    const productGrid = document.getElementById('product-grid');
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

    // Load categories from JSON
    let categories = {};
    
    // Function to initialize categories
    async function initializeCategories() {
        try {
            const response = await fetch('categories.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Convert array to object format
            categories = data.folders.reduce((acc, folder) => {
                acc[folder.id] = {
                    path: folder.path,  // Don't encode here, encode when using
                    title: folder.title
                };
                return acc;
            }, {});
            
            // Create category buttons
            const filterContainer = document.querySelector('.filter-buttons');
            if (!filterContainer) {
                throw new Error('Filter buttons container not found');
            }
            
            filterContainer.innerHTML = ''; // Clear existing buttons
            
            // Add 'All' button
            const allButton = document.createElement('button');
            allButton.className = 'filter-btn active';
            allButton.setAttribute('data-category', 'all');
            allButton.textContent = 'All';
            filterContainer.appendChild(allButton);
            
            // Add category buttons
            data.folders.forEach(folder => {
                const button = document.createElement('button');
                button.className = 'filter-btn';
                button.setAttribute('data-category', folder.id);
                button.textContent = folder.title;
                filterContainer.appendChild(button);
            });
            
            // Initialize filter functionality
            initializeFilters();
            
            // Load initial images
            loadImages('all');
            
            return true; // Successfully initialized
        } catch (error) {
            console.error('Error loading categories:', error);
            return false;
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

    // Function to load images for a category
    async function loadImages(category) {
        if (!productGrid) {
            console.error('Product grid not found');
            return;
        }

        productGrid.innerHTML = '';
        let imagesToLoad = [];

        if (category === 'all') {
            // Load images from all categories
            Object.entries(categories).forEach(([key, value]) => {
                for (let i = 1; i <= 50; i++) {
                    imagesToLoad.push({
                        path: `${encodeURIComponent(value.path)}/${i}.jpeg`,
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
            for (let i = 1; i <= 50; i++) {
                imagesToLoad.push({
                    path: `${encodeURIComponent(categoryInfo.path)}/${i}.jpeg`,
                    category: categoryInfo.title
                });
            }
        }

        // Load images and handle missing ones
        imagesToLoad.forEach(img => {
            const image = new Image();
            image.onload = () => {
                productGrid.appendChild(createProductCard(img.path, img.category));
            };
            image.src = img.path;
        });
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

    // Filter functionality
    function initializeFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                loadImages(button.dataset.category);
            });
        });
    }

    // Initialize categories when page loads
    await initializeCategories();

    // Handle hash in URL for direct category access
    const hash = window.location.hash.slice(1);
    if (hash && categories[hash]) {
        const button = document.querySelector(`[data-category="${hash}"]`);
        if (button) {
            button.click();
        }
    }
});
