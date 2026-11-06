document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productPath = urlParams.get('product');
    const productCategory = urlParams.get('category');
    const whatsappNumber = '919377404477';

    if (!productPath || !productCategory) {
        // Redirect to catalog if no product specified
        window.location.href = 'catalog.html';
        return;
    }

    // First decode the URL-encoded path
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
    
    // Extract filename / design number
    let designNum = '';
    try {
        const parts = decodedPath.split('/');
        const lastPart = parts[parts.length - 1];
        designNum = lastPart.split('.')[0];
    } catch (e) {
        designNum = '';
    }

    // Direct clean share link
    const shareURL = `https://catalog.purnimajewels.in/product.html?category=${encodeURIComponent(productCategory)}&product=${encodeURIComponent(productPath)}`;

    // Build human-friendly Vishwakarma WhatsApp inquiry template
    const messageLines = [
        `*Hello Purnima Jewellers!* 👋`,
        `I would like to inquire about this design from your digital catalog:`,
        `• *Collection*: ${productCategory}`,
        designNum ? `• *Design / Item*: #${designNum}` : null,
        `• *Photo Link*: ${shareURL}`,
        ``,
        `Could you please share the wholesale price, availability, and ordering options?`
    ].filter(Boolean).join('\n');

    // Update WhatsApp button
    whatsappBtn.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageLines)}`;
    
    // Add event listener for back button
    document.querySelector('a[href="catalog.html"]').addEventListener('click', function(e) {
        e.preventDefault();
        history.back();
    });
});
