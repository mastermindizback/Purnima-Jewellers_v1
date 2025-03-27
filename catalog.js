document.addEventListener('DOMContentLoaded', function() {
    const productGrid = document.getElementById('product-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const whatsappNumber = ''; // Add your WhatsApp number here
    
    // Category mappings
    const categories = {
        'pendant-sets': {
            path: 'PJ%20Jewellery%20Pics/AD%20Settings%20Pendant%20Sets',
            title: 'Pendant Sets'
        },
        'bali': {
            path: 'PJ%20Jewellery%20Pics/Bali%20and%20halfbali%20style%20earrings',
            title: 'Bali Earrings'
        },
        'kundan': {
            path: 'PJ%20Jewellery%20Pics/Kundan%20earrings',
            title: 'Kundan Earrings'
        },
        'sets': {
            path: 'PJ%20Jewellery%20Pics/Sets',
            title: 'Complete Sets'
        }
    };

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
        productGrid.innerHTML = '';
        let imagesToLoad = [];

        if (category === 'all') {
            // Load images from all categories
            Object.entries(categories).forEach(([key, value]) => {
                for (let i = 1; i <= 50; i++) {
                    imagesToLoad.push({
                        path: `${value.path}/${i}.jpeg`,
                        category: value.title
                    });
                }
            });
        } else {
            // Load images from selected category
            const categoryInfo = categories[category];
            for (let i = 1; i <= 50; i++) {
                imagesToLoad.push({
                    path: `${categoryInfo.path}/${i}.jpeg`,
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

    // Modal functionality
    window.openModal = function(imagePath, category) {
        const modal = new bootstrap.Modal(document.getElementById('imageModal'));
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.querySelector('.modal-title');
        const whatsappBtn = document.querySelector('.btn-whatsapp');
        
        modalImage.src = imagePath;
        modalTitle.textContent = category;
        whatsappBtn.href = `https://wa.me/${whatsappNumber}?text=I'm interested in this ${category.toLowerCase()} from Purnima Jewellers: ${imagePath}`;
        modal.show();
    };

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
