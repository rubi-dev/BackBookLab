const booksData = [
    {
        id: 1,
        title: "The Psychology of Programming",
        author: "Gerald Weinberg",
        price: 12.99,
        originalPrice: 19.49,
        category: "technology",
        image: "images/book-1.jpeg",
        rating: 4.5,
        reviews: 234
    },
    {
        id: 2,
        title: "Good Energy",
        author: "Casey Means ",
        price: 15.99,
        originalPrice: 23.99,
        category: "non-fiction",
        image: "images/book-2.jpeg",
        rating: 4.7,
        reviews: 456
    },
    {
        id: 3,
        title: "The Mountain is You",
        author: "Brianna Wiest",
        price: 10.99,
        originalPrice: 16.49,
        category: "fiction",
        image: "images/book-3.png",
        rating: 4.3,
        reviews: 189
    },
    {
        id: 4,
        title: "Atomic Habits",
        author: "James Clear",
        price: 13.99,
        originalPrice: 20.99,
        category: "non-fiction",
        image: "images/book-4.jpeg",
        rating: 4.8,
        reviews: 672
    },
    {
        id: 5,
        title: "The Quantum Universe",
        author: "Brian Cox",
        price: 16.99,
        originalPrice: 25.49,
        category: "science",
        image: "images/book-5.jpeg",
        rating: 4.4,
        reviews: 298
    },
    {
        id: 6,
        title: "Clean Code",
        author: "Robert Martin",
        price: 18.99,
        originalPrice: 28.49,
        category: "technology",
        image: "images/book-6.jpeg",
        rating: 4.6,
        reviews: 387
    },
    {
        id: 7,
        title: "Dune",
        author: "Frank Herbert",
        price: 14.99,
        originalPrice: 22.49,
        category: "fiction",
        image: "images/book-7.jpeg",
        rating: 4.5,
        reviews: 512
    },
    {
        id: 8,
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        price: 11.99,
        originalPrice: 17.99,
        category: "science",
        image: "images/book-8.jpeg",
        rating: 4.2,
        reviews: 345
    }
];

// Application state
let cart = JSON.parse(localStorage.getItem('bbl-cart')) || [];
let rentals = JSON.parse(localStorage.getItem('bbl-rentals')) || [];
let returns = JSON.parse(localStorage.getItem('bbl-returns')) || [];
let filteredBooks = [...booksData];

// Filter states
let currentFilters = {
    search: '',
    category: 'all',
    priceRange: 'all',
    sortBy: 'popularity'
};

// DOM Elements
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const priceFilter = document.getElementById('price-filter');
const sortFilter = document.getElementById('sort-filter');
const clearFiltersBtn = document.getElementById('clear-filters');
const resultsCount = document.getElementById('results-count');
const booksGrid = document.getElementById('books-grid');
const cartCount = document.querySelector('.cart-count');
const modal = document.getElementById('success-modal');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    renderBooks();
    updateCartCount();
    updateStats();
});

function initializeApp() {
    // Set total books count
    document.getElementById('total-books').textContent = booksData.length;
    
    // Show home section by default
    showSection('home');
    
    // Set active navigation
    updateNavigation('home');
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('href').substring(1);
            showSection(section);
            updateNavigation(section);
        });
    });

    // Filters
    searchInput.addEventListener('input', handleSearch);
    categoryFilter.addEventListener('change', handleCategoryFilter);
    priceFilter.addEventListener('change', handlePriceFilter);
    sortFilter.addEventListener('change', handleSortFilter);
    clearFiltersBtn.addEventListener('click', clearFilters);

    // Mobile menu
    document.querySelector('.mobile-menu-btn').addEventListener('click', toggleMobileMenu);
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load section-specific content
        switch(sectionId) {
            case 'books':
                renderBooks();
                break;
            case 'cart':
                renderCart();
                break;
            case 'progress':
                renderProgress();
                break;
            case 'return':
                renderReturnBooks();
                break;
        }
    }
}

function updateNavigation(activeSection) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${activeSection}`) {
            link.classList.add('active');
        }
    });
}

function handleSearch() {
    currentFilters.search = searchInput.value.toLowerCase();
    filterAndRenderBooks();
    updateClearFiltersVisibility();
}

function handleCategoryFilter() {
    currentFilters.category = categoryFilter.value;
    filterAndRenderBooks();
    updateClearFiltersVisibility();
}

function handlePriceFilter() {
    currentFilters.priceRange = priceFilter.value;
    filterAndRenderBooks();
    updateClearFiltersVisibility();
}

function handleSortFilter() {
    currentFilters.sortBy = sortFilter.value;
    filterAndRenderBooks();
}

function clearFilters() {
    currentFilters = {
        search: '',
        category: 'all',
        priceRange: 'all',
        sortBy: 'popularity'
    };
    
    searchInput.value = '';
    categoryFilter.value = 'all';
    priceFilter.value = 'all';
    sortFilter.value = 'popularity';
    
    filterAndRenderBooks();
    updateClearFiltersVisibility();
}

function updateClearFiltersVisibility() {
    const hasFilters = currentFilters.search || 
                      currentFilters.category !== 'all' || 
                      currentFilters.priceRange !== 'all';
    
    clearFiltersBtn.style.display = hasFilters ? 'block' : 'none';
}

function filterAndRenderBooks() {
    // Apply filters
    filteredBooks = booksData.filter(book => {
        // Search filter
        const matchesSearch = !currentFilters.search || 
                             book.title.toLowerCase().includes(currentFilters.search) ||
                             book.author.toLowerCase().includes(currentFilters.search);
        
        // Category filter
        const matchesCategory = currentFilters.category === 'all' || 
                               book.category === currentFilters.category;
        
        // Price filter
        let matchesPrice = true;
        if (currentFilters.priceRange !== 'all') {
            const price = book.price;
            switch(currentFilters.priceRange) {
                case 'under-10':
                    matchesPrice = price < 10;
                    break;
                case '10-15':
                    matchesPrice = price >= 10 && price <= 15;
                    break;
                case '15-20':
                    matchesPrice = price >= 15 && price <= 20;
                    break;
                case 'over-20':
                    matchesPrice = price > 20;
                    break;
            }
        }
        
        return matchesSearch && matchesCategory && matchesPrice;
    });
    
    // Apply sorting
    filteredBooks.sort((a, b) => {
        switch(currentFilters.sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'rating':
                return b.rating - a.rating;
            case 'title':
                return a.title.localeCompare(b.title);
            case 'popularity':
                return b.reviews - a.reviews;
            default:
                return 0;
        }
    });
    
    renderBooks();
    updateResultsCount();
}

function updateResultsCount() {
    resultsCount.textContent = `Showing ${filteredBooks.length} of ${booksData.length} books`;
}

function renderBooks() {
    if (filteredBooks.length === 0) {
        booksGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: #d1d5db; margin-bottom: 1rem;"></i>
                <p style="font-size: 1.25rem; color: #6b7280;">No books found matching your criteria.</p>
                <button onclick="clearFilters()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">Clear Filters</button>
            </div>
        `;
        return;
    }

    booksGrid.innerHTML = filteredBooks.map(book => createBookCard(book)).join('');
    updateResultsCount();
}

function createBookCard(book) {
    const discount = Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100);
    const isInCart = cart.some(item => item.id === book.id);
    const savings = (book.originalPrice - book.price).toFixed(2);
    
    return `
        <div class="book-card fade-in">
            <div class="book-image-container">
                <img src="${book.image}" alt="${book.title}" class="book-image">
                <div class="discount-badge">${discount}% OFF</div>
                <div class="quick-actions">
                    <button class="quick-action-btn" onclick="toggleWishlist(${book.id})">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="quick-action-btn" onclick="previewBook(${book.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
                <div class="quick-add-overlay">
                    <button class="quick-add-btn" onclick="addToCart(${book.id})" ${isInCart ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i>
                        ${isInCart ? 'In Cart' : 'Quick Add'}
                    </button>
                </div>
            </div>
            <div class="book-info">
                <div class="book-category">${book.category}</div>
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <div class="book-rating">
                    <div class="stars">
                        ${generateStars(book.rating)}
                    </div>
                    <span class="rating-text">${book.rating.toFixed(1)} (${book.reviews})</span>
                </div>
                <div class="book-pricing">
                    <div class="price-info">
                        <div class="price-row">
                            <span class="current-price">$${book.price.toFixed(2)}</span>
                            <span class="original-price">$${book.originalPrice.toFixed(2)}</span>
                        </div>
                        <div class="savings">Save $${savings}</div>
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart(${book.id})" ${isInCart ? 'disabled' : ''}>
                        <i class="fas fa-${isInCart ? 'check' : 'plus'}"></i>
                        ${isInCart ? 'Added' : 'Add'}
                    </button>
                </div>
                <div class="availability">✓ Available for instant rental</div>
            </div>
        </div>
    `;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star star filled"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt star filled"></i>';
        } else {
            stars += '<i class="fas fa-star star"></i>';
        }
    }
    
    return stars;
}

function addToCart(bookId) {
    const book = booksData.find(b => b.id === bookId);
    if (book && !cart.some(item => item.id === bookId)) {
        cart.push({
            id: book.id,
            title: book.title,
            author: book.author,
            price: book.price,
            image: book.image,
            addedAt: new Date().toISOString()
        });
        
        saveCart();
        updateCartCount();
        renderBooks(); // Re-render to update button states
        showModal('Added to Cart', `${book.title} has been added to your cart.`);
    }
}

function removeFromCart(bookId) {
    cart = cart.filter(item => item.id !== bookId);
    saveCart();
    updateCartCount();
    renderCart();
    renderBooks(); // Re-render to update button states
}

function saveCart() {
    localStorage.setItem('bbl-cart', JSON.stringify(cart));
}

function updateCartCount() {
    cartCount.textContent = cart.length;
    cartCount.style.display = cart.length > 0 ? 'flex' : 'none';
}

function renderCart() {
    const cartContent = document.getElementById('cart-content');
    
    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some books to get started!</p>
                <button class="btn" onclick="showSection('books'); updateNavigation('books');">
                    Browse Books
                </button>
            </div>
        `;
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    cartContent.innerHTML = `
        <div class="cart-items">
            ${cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                    <div class="cart-item-info">
                        <h3 class="cart-item-title">${item.title}</h3>
                        <p class="cart-item-author">by ${item.author}</p>
                    </div>
                    <div class="cart-item-actions">
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i>
                            Remove
                        </button>
                    </div>
                </div>
            `).join('')}
            
            <div class="cart-summary">
                <div class="cart-total">
                    <span>Total:</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
                <button class="confirm-rental-btn" onclick="confirmRental()">
                    Confirm Rental
                </button>
            </div>
        </div>
    `;
}

function confirmRental() {
    if (cart.length === 0) return;
    
    // Move cart items to rentals
    const newRentals = cart.map(item => ({
        ...item,
        rentalId: Date.now() + Math.random(),
        rentedAt: new Date().toISOString(),
        status: 'rented'
    }));
    
    rentals.push(...newRentals);
    cart = [];
    
    saveCart();
    saveRentals();
    updateCartCount();
    updateStats();
    
    showModal('Rental Confirmed', 'Your books have been successfully rented!');
    
    // Redirect to progress page
    setTimeout(() => {
        showSection('progress');
        updateNavigation('progress');
    }, 2000);
}

function saveRentals() {
    localStorage.setItem('bbl-rentals', JSON.stringify(rentals));
}

function renderProgress() {
    updateStats();
    renderCurrentRentals();
}

function updateStats() {
    const totalRented = rentals.length;
    const totalReturned = returns.length;
    const totalCashback = returns.reduce((sum, ret) => sum + ret.cashback, 0);
    
    document.getElementById('total-rented').textContent = totalRented;
    document.getElementById('total-returned').textContent = totalReturned;
    document.getElementById('total-cashback').textContent = `$${totalCashback.toFixed(2)}`;
}

function renderCurrentRentals() {
    const currentRentalsDiv = document.getElementById('current-rentals');
    const currentRentals = rentals.filter(rental => rental.status === 'rented');
    
    if (currentRentals.length === 0) {
        currentRentalsDiv.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <p>No current rentals</p>
                <button class="btn" onclick="showSection('books'); updateNavigation('books');">
                    Browse Books
                </button>
            </div>
        `;
        return;
    }
    
    currentRentalsDiv.innerHTML = currentRentals.map(rental => {
        const rentedDate = new Date(rental.rentedAt);
        const daysSince = Math.floor((new Date() - rentedDate) / (1000 * 60 * 60 * 24));
        const progress = Math.min(daysSince * 10, 100); // 10% per day, max 100%
        
        return `
            <div class="rental-item">
                <img src="${rental.image}" alt="${rental.title}" class="rental-image">
                <div class="rental-info">
                    <h3 class="rental-title">${rental.title}</h3>
                    <p class="rental-date">Rented ${daysSince} days ago</p>
                    <div class="progress-bar-container">
                        <div class="progress-label">
                            <span>Reading Progress</span>
                            <span>${progress}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderReturnBooks() {
    const returnBooksDiv = document.getElementById('return-books');
    const currentRentals = rentals.filter(rental => rental.status === 'rented');
    
    if (currentRentals.length === 0) {
        returnBooksDiv.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-undo"></i>
                <h3>No books to return</h3>
                <p>Rent some books first to see them here!</p>
                <button class="btn" onclick="showSection('books'); updateNavigation('books');">
                    Browse Books
                </button>
            </div>
        `;
        return;
    }
    
    returnBooksDiv.innerHTML = currentRentals.map(rental => {
        const cashback = (rental.price * 0.5).toFixed(2);
        const rentedDate = new Date(rental.rentedAt).toLocaleDateString();
        
        return `
            <div class="return-item">
                <img src="${rental.image}" alt="${rental.title}" class="return-image">
                <div class="return-info">
                    <h3 class="return-title">${rental.title}</h3>
                    <p class="return-author">by ${rental.author}</p>
                    <p class="return-date">
                        <i class="fas fa-calendar"></i>
                        Rented: ${rentedDate}
                    </p>
                </div>
                <div class="return-pricing">
                    <p class="rental-price">Rental: $${rental.price.toFixed(2)}</p>
                    <p class="cashback-amount">Cashback: $${cashback}</p>
                    <button class="return-btn" onclick="returnBook(${rental.rentalId})">
                        <i class="fas fa-undo"></i>
                        Return Book
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function returnBook(rentalId) {
    const rental = rentals.find(r => r.rentalId === rentalId);
    if (!rental) return;
    
    const cashback = rental.price * 0.5;
    
    // Create return record
    const returnRecord = {
        returnId: Date.now() + Math.random(),
        rentalId: rentalId,
        bookId: rental.id,
        title: rental.title,
        author: rental.author,
        image: rental.image,
        originalPrice: rental.price,
        cashback: cashback,
        returnedAt: new Date().toISOString()
    };
    
    returns.push(returnRecord);
    
    // Update rental status
    rental.status = 'returned';
    
    saveReturns();
    saveRentals();
    updateStats();
    
    showModal('Book Returned', `You received $${cashback.toFixed(2)} cashback for returning "${rental.title}"`);
    
    // Re-render return books
    renderReturnBooks();
}

function saveReturns() {
    localStorage.setItem('bbl-returns', JSON.stringify(returns));
}

function toggleWishlist(bookId) {
    // Placeholder for wishlist functionality
    showModal('Wishlist', 'Wishlist feature coming soon!');
}

function previewBook(bookId) {
    // Placeholder for book preview
    showModal('Preview', 'Book preview feature coming soon!');
}

function showModal(title, message) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

function toggleMobileMenu() {
    // Placeholder for mobile menu functionality
    console.log('Mobile menu toggled');
}

// Close modal when clicking outside
modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModal();
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading states for better UX
function addLoadingState(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    button.disabled = true;
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
    }, 1000);
}

// Add animation delays for staggered effects
function addStaggeredAnimation() {
    const cards = document.querySelectorAll('.book-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

// Initialize animations when books are rendered
const originalRenderBooks = renderBooks;
renderBooks = function() {
    originalRenderBooks();
    setTimeout(addStaggeredAnimation, 100);
};

// Export functions for HTML onclick handlers
window.showSection = showSection;
window.updateNavigation = updateNavigation;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.confirmRental = confirmRental;
window.returnBook = returnBook;
window.toggleWishlist = toggleWishlist;
window.previewBook = previewBook;
window.clearFilters = clearFilters;
window.closeModal = closeModal;