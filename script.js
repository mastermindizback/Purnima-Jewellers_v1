document.addEventListener('DOMContentLoaded', function() {
    const productGrid = document.getElementById('product-grid');
    const categoryButtons = document.querySelectorAll('.category-buttons button');
    const whatsappNumber = '919377404477'; // WhatsApp number with country code (91 for India)
    
    // Category paths and their display names
    const categories = {
        'AD Settings Pendant Sets': 'PJ Jewellery Pics/AD Settings Pendant Sets',
        'Bali and halfbali style earrings': 'PJ Jewellery Pics/Bali and halfbali style earrings',
        'Kundan earrings': 'PJ Jewellery Pics/Kundan earrings',
        'Sets': 'PJ Jewellery Pics/Sets'
    };

    // Function to create product card
    function createProductCard(imagePath, category) {
        const col = document.createElement('div');
        col.className = 'col-6 col-md-4 col-lg-3';
        col.innerHTML = `
            <div class="product-card" data-category="${category}">
                <img src="${imagePath}" class="product-image" alt="Jewellery Item" 
                     onclick="openModal('${imagePath}')">
            </div>
        `;
        return col;
    }

    // Load initial products
    function loadProducts(category = 'all') {
        productGrid.innerHTML = '';
        
        Object.entries(categories).forEach(([categoryName, path]) => {
            if (category === 'all' || category === categoryName) {
                // Here you would typically load images from the directory
                // For demonstration, we'll create some placeholder cards
                for (let i = 1; i <= 8; i++) {
                    const imagePath = `${path}/${i}.jpg`;
                    productGrid.appendChild(createProductCard(imagePath, categoryName));
                }
            }
        });
    }

    // Category filter functionality
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            loadProducts(button.dataset.category);
        });
    });

    // Modal functionality
    window.openModal = function(imagePath) {
        const modal = new bootstrap.Modal(document.getElementById('imageModal'));
        const modalImage = document.getElementById('modalImage');
        const whatsappBtn = document.querySelector('.whatsapp-btn');
        
        modalImage.src = imagePath;
        whatsappBtn.href = `https://wa.me/${whatsappNumber}?text=I'm interested in this product: ${imagePath}`;
        modal.show();
    };

    // Initial load
    loadProducts();
});
