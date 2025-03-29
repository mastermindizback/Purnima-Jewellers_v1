document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productPath = urlParams.get('product');
    const productCategory = urlParams.get('category');
    const whatsappNumber = '918160922048';

    if (!productPath || !productCategory) {
        // Redirect to catalog if no product specified
        window.location.href = 'catalog.html';
        return;
    }

    const decodedPath = decodeURIComponent(productPath);
    const productImage = document.getElementById('productImage');
    const productCategoryTitle = document.getElementById('productCategory');
    const categoryBreadcrumb = document.getElementById('categoryBreadcrumb');
    const whatsappBtn = document.getElementById('whatsappBtn');

    // Set page title
    document.title = `${productCategory} - Purnima Jewellers`;
    
    // Update content
    productImage.src = decodedPath;
    productImage.alt = productCategory;
    productCategoryTitle.textContent = productCategory;
    categoryBreadcrumb.textContent = productCategory;
    
    // Handle image loading error
    productImage.onerror = function() {
        console.error('Error loading image:', decodedPath);
        window.location.href = 'catalog.html';
    };
    
    // Update WhatsApp sharing link with exact current URL
    const currentURL = window.location.href;
    whatsappBtn.href = `https://wa.me/${whatsappNumber}?text=Inquiry on this ${productCategory.toLowerCase()} from Purnima Jewellers: ${currentURL}`;
    
    // Add event listener for back button
    document.querySelector('a[href="catalog.html"]').addEventListener('click', function(e) {
        e.preventDefault();
        history.back();
    });
});
