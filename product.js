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

    // Handle the enforced encoding format from catalog.js
    const decodedPath = productPath
        .replace(/%252520/g, ' ')  // Replace %252520 with space
        .replace(/%2F/g, '/');     // Replace %2F with /
    
    const productImage = document.getElementById('productImage');
    const productCategoryTitle = document.getElementById('productCategory');
    const categoryBreadcrumb = document.getElementById('categoryBreadcrumb');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const debugShareUrl = document.getElementById('debugShareUrl');

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
    
    // Create share URL with the exact same format as catalog.js
    const path = decodedPath.replace(/ /g, '%20');
    const encodedPath = path.replace(/%20/g, '%252520').replace(/\//g, '%2F');
    const shareURL = `https://purnimajewellers.pages.dev/product?product=${encodedPath}&category=${productCategory}`;
    
    // Update WhatsApp button and debug info
    whatsappBtn.href = `https://wa.me/${whatsappNumber}?text=Inquiry on this ${productCategory.toLowerCase()} from Purnima Jewellers: ${shareURL}`;
    debugShareUrl.textContent = shareURL;
    
    // Add event listener for back button
    document.querySelector('a[href="catalog.html"]').addEventListener('click', function(e) {
        e.preventDefault();
        history.back();
    });
});
