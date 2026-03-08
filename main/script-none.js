// ═════════════════════════════════════════════════════════════
// CAROUSEL NAVIGATION FUNCTIONALITY
// ═════════════════════════════════════════════════════════════

// Carousel state
let carouselPosition = 0;
const slideWidth = 265; // 250px + 1.5rem gap

function moveCarousel(direction) {
    const slider = document.querySelector('.slider');
    if (!slider) return;
    
    const totalSlides = slider.children.length;
    const visibleSlides = Math.floor(window.innerWidth / slideWidth) || 4;
    const maxPosition = totalSlides - visibleSlides;
    
    // Update position
    carouselPosition += direction;
    
    // Clamp position
    if (carouselPosition < 0) carouselPosition = 0;
    if (carouselPosition > maxPosition) carouselPosition = maxPosition;
    
    // Apply transform
    slider.style.transform = `translateX(-${carouselPosition * slideWidth}px)`;
    slider.style.transition = 'transform 0.5s ease';
}

// Auto-scroll carousel
let autoScrollInterval;

function startAutoScroll() {
    const slider = document.querySelector('.slider');
    if (!slider) return;
    
    autoScrollInterval = setInterval(() => {
        const totalSlides = slider.children.length;
        const currentTransform = slider.style.transform;
        const currentX = currentTransform ? parseInt(currentTransform.replace(/[^\d-]/g, '')) || 0 : 0;
        const currentPosition = Math.abs(currentX) / slideWidth;
        
        // If we've reached the end, reset to beginning
        if (currentPosition >= totalSlides / 2) {
            slider.style.transition = 'none';
            slider.style.transform = 'translateX(0)';
            carouselPosition = 0;
            setTimeout(() => {
                slider.style.transition = 'transform 0.5s ease';
            }, 50);
        } else {
            // Move one slide
            carouselPosition++;
            slider.style.transform = `translateX(-${carouselPosition * slideWidth}px)`;
        }
    }, 3000);
}

function stopAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
    }
}

// Start auto-scroll when page loads
document.addEventListener('DOMContentLoaded', function() {
    startAutoScroll();
    
    // Stop auto-scroll on hover
    const carousel = document.querySelector('.carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoScroll);
        carousel.addEventListener('mouseleave', startAutoScroll);
    }
});

// Pagination State
let currentPage = 1;
const itemsPerPage = 8;
let allBooks = [];

// Category Filter Functionality
document.addEventListener('DOMContentLoaded', function() {
    const categoryFilter = document.getElementById('category-filter');
    const itemsGrid = document.getElementById('items-grid');
    
    // Load published books from localStorage (admin panel data)
    allBooks = loadPublishedBooks();
    
    // Render books to the grid with pagination
    renderBooksWithPagination();

    // attach listeners to any card (static or newly rendered)
    setupCardHandlers('../detail/index-none.html');
    
    // Setup pagination buttons
    setupPagination();
    
    if (categoryFilter && itemsGrid) {
        categoryFilter.addEventListener('change', function() {
            const selectedCategory = this.value;
            const cards = itemsGrid.querySelectorAll('.item-card');
            
            cards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});

// generic helper to wire any .item-card elements to navigate to the given detail page
// this now defers to viewBookDetail so that the full book object is stored
function setupCardHandlers(detailPage) {
    document.querySelectorAll('.item-card').forEach(card => {
        if (card.dataset.wired === 'true') return;
        card.dataset.wired = 'true';
        card.addEventListener('click', () => {
            const bookId = card.dataset.bookId || card.dataset.id;
            if (bookId) {
                // reuse the global helper that already handles storing the complete book
                viewBookDetail(bookId);
            } else {
                // fallback: just navigate, no storage
                window.location.href = detailPage;
            }
        });
    });
}

// Function to load published books from localStorage
function loadPublishedBooks() {
    const storedBooks = localStorage.getItem('adminBooks');
    if (storedBooks) {
        const books = JSON.parse(storedBooks);
        // Only return published books, sorted by views (trending) - most views first
        return books.filter(book => book.status === 'published')
            .sort((a, b) => {
                const viewsA = a.views || 0;
                const viewsB = b.views || 0;
                return viewsB - viewsA; // Descending order (highest views first)
            });
    }
    return [];
}

// Pagination Setup
function setupPagination() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderBooksWithPagination();
            }
        });
        
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(allBooks.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderBooksWithPagination();
            }
        });
    }
}

// Render books with pagination
function renderBooksWithPagination() {
    const itemsGrid = document.getElementById('items-grid');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');
    const paginationContainer = document.getElementById('pagination-container');
    
    if (!itemsGrid) return;
    
    // Hide pagination if no books or only one page
    if (paginationContainer) {
        if (allBooks.length <= itemsPerPage) {
            paginationContainer.style.display = 'none';
        } else {
            paginationContainer.style.display = 'flex';
        }
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(allBooks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBooks = allBooks.slice(startIndex, endIndex);
    
    // Update page info
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }
    
    // Update button states
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    }
    
    // Render the current page's books
    renderBooks(currentBooks);
    
    // Re-attach click handlers to newly rendered cards
    setupCardHandlers('../detail/index-none.html');
}

// Function to render books to the grid
function renderBooks(books) {
    const itemsGrid = document.getElementById('items-grid');
    if (!itemsGrid) return;
    
    // Default cover image if none provided
    const defaultImage = "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80";
    
    // Helper function to get book type from tags
    function getBookType(tags) {
        if (tags && tags.includes('img')) {
            return { type: 'img', label: 'Picture Book', icon: 'bx-image', class: 'type-img' };
        }
        return { type: 'text', label: 'Chapter Book', icon: 'bx-book-content', class: 'type-text' };
    }
    
    if (books.length === 0) {
        itemsGrid.innerHTML = `
            <div class="no-books" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class='bx bx-book' style="font-size: 3rem; color: var(--muted);"></i>
                <p style="color: var(--muted); margin-top: 10px;">No books available yet. Check back later!</p>
            </div>
        `;
        return;
    }
    
    // Helper function to generate rating stars - always 4-5 stars for good performance appearance
    function generateRatingFromViews(views) {
        const viewCount = Number(views) || 0;
        // Always show at least 4 stars, 5 stars if views >= 400
        const ratingNum = viewCount >= 400 ? 5 : 4;
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= ratingNum) {
                starsHtml += '<i class=\'bx bxs-star text-yellow-400\'></i>';
            } else {
                starsHtml += '<i class=\'bx bx-star text-gray-300\'></i>';
            }
        }
        return starsHtml;
    }

    itemsGrid.innerHTML = books.map(book => {
        const bookType = getBookType(book.tags);
        
        // Generate rating stars from localStorage data (views) - same as detail pages
        const starsHtml = generateRatingFromViews(book.views);
        
        return `
        <div class="item-card" data-book-id="${book.id}" data-category="${book.genre.toLowerCase()}" data-rating="5" data-year="${new Date().getFullYear()}" onclick="viewBookDetail(${book.id})">
            <div class="card-image">
                <img src="${book.image || defaultImage}" alt="${book.title}">
                <span class="book-type-tag ${bookType.class}"><i class='bx ${bookType.icon}'></i> ${bookType.label}</span>
            </div>
            <div class="card-content">
                <h3>${book.title}</h3>
                <p class="author">${book.author}</p>
                <p class="card-description">A wonderful book in the ${book.genre} genre.</p>
                <div class="card-meta">
                    <span><i class='bx bx-book-open'></i> ${book.pages} pages</span>
                    <span><i class='bx bx-calendar'></i> ${new Date().getFullYear()}</span>
                    <span><i class='bx bx-eye'></i> ${book.views || 0} views</span>
                </div>
                <div class="card-footer">
                    <span class="category-tag">${book.genre}</span>
                    <div class="rating">
                        <span class="rating-stars">${starsHtml}</span>
                    </div>
                </div>
            </div>
        </div>
    `}).join('');
}

// Function to navigate to detail page with book data
function viewBookDetail(bookId) {
    const storedBooks = localStorage.getItem('adminBooks');
    if (storedBooks) {
        const books = JSON.parse(storedBooks);
        // Use String comparison to handle both number and string IDs
        const book = books.find(b => String(b.id) === String(bookId));
        if (book) {
            // Update views count when clicking on a book
            updateViews(bookId);
            
            // Store the book data in localStorage for the detail page
            localStorage.setItem('currentBook', JSON.stringify(book));
            // Navigate to detail page with book ID for reliable cover lookup
            window.location.href = '../detail/index-none.html?id=' + bookId;
        }
    }
}

// Function to update views count for a book
function updateViews(bookId) {
    const storedBooks = localStorage.getItem('adminBooks');
    if (storedBooks) {
        const books = JSON.parse(storedBooks);
        // Use String comparison to handle both number and string IDs
        const book = books.find(b => String(b.id) === String(bookId));
        if (book) {
            book.views = (book.views || 0) + 1;
            localStorage.setItem('adminBooks', JSON.stringify(books));
        }
    }
}

// helper for validating URLs
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// ═════════════════════════════════════════════════════════════
// SEARCH FUNCTIONALITY - Enhanced Version
// ═════════════════════════════════════════════════════════════

// Search functionality with instant dropdown
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('main-search-input');
    const searchDropdown = document.getElementById('search-dropdown');
    const searchResults = document.getElementById('search-results');
    const searchClearBtn = document.getElementById('search-clear-btn');
    const searchWrapper = document.getElementById('search-wrapper');
    const searchViewAll = document.getElementById('search-view-all');
    
    if (!searchInput) return;
    
    let searchTimeout;
    let selectedIndex = -1;
    let currentResults = [];
    
    // Search on input with debounce
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        // Show/hide clear button
        if (query.length > 0) {
            searchClearBtn.classList.remove('hidden');
        } else {
            searchClearBtn.classList.add('hidden');
            searchDropdown.classList.add('hidden');
            searchViewAll.classList.add('hidden');
            return;
        }
        
        // Reset selection
        selectedIndex = -1;
        
        // Debounce search
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 250);
    });
    
    // Clear search
    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', function() {
            searchInput.value = '';
            searchClearBtn.classList.add('hidden');
            searchDropdown.classList.add('hidden');
            searchViewAll.classList.add('hidden');
            searchInput.focus();
            selectedIndex = -1;
            currentResults = [];
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (searchWrapper && !searchWrapper.contains(e.target)) {
            searchDropdown.classList.add('hidden');
            searchViewAll.classList.add('hidden');
        }
    });
    
    // Show dropdown when input is focused and has value
    searchInput.addEventListener('focus', function() {
        if (this.value.trim().length > 0 && currentResults.length > 0) {
            searchDropdown.classList.remove('hidden');
        }
    });
    
    // Keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        const items = document.querySelectorAll('.search-result-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && currentResults[selectedIndex]) {
                viewSearchedBook(currentResults[selectedIndex].id);
            }
        } else if (e.key === 'Escape') {
            searchDropdown.classList.add('hidden');
            searchViewAll.classList.add('hidden');
            selectedIndex = -1;
        }
    });
    
    function updateSelection(items) {
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                item.classList.add('bg-blue-50');
                item.classList.remove('hover:bg-gray-50');
            } else {
                item.classList.remove('bg-blue-50');
                item.classList.add('hover:bg-gray-50');
            }
        });
    }
    
    // Perform search - Enhanced with more fields
    function performSearch(query) {
        // Get all books from localStorage
        const storedBooks = localStorage.getItem('adminBooks');
        let books = [];
        
        if (storedBooks) {
            books = JSON.parse(storedBooks);
        }
        
        // Only search published books (exclude drafts)
        books = books.filter(book => book.status === 'published');
        
        // Filter books by title, author, genre, and description (case-insensitive)
        const queryLower = query.toLowerCase();
        const filteredBooks = books.filter(book => {
            const titleMatch = book.title && book.title.toLowerCase().includes(queryLower);
            const authorMatch = book.author && book.author.toLowerCase().includes(queryLower);
            const genreMatch = book.genre && book.genre.toLowerCase().includes(queryLower);
            const descMatch = book.description && book.description.toLowerCase().includes(queryLower);
            return titleMatch || authorMatch || genreMatch || descMatch;
        }).slice(0, 8); // Show up to 8 results
        
        currentResults = filteredBooks;
        
        // Display results
        if (filteredBooks.length === 0) {
            searchResults.innerHTML = `
                <div class="px-4 py-6 text-sm text-gray-500 text-center">
                    <i class='bx bx-search text-3xl mb-2'></i>
                    <p>No books found for "<span class="font-medium text-gray-700">${query}</span>"</p>
                    <p class="text-xs mt-1">Try searching for title, author, or genre</p>
                </div>
            `;
            searchViewAll.classList.add('hidden');
        } else {
            const defaultImage = "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80";
            
            // Highlight matching text function
            const highlightMatch = (text, query) => {
                if (!text) return '';
                const regex = new RegExp(`(${query})`, 'gi');
                return text.replace(regex, '<mark class="bg-yellow-200 text-gray-900 rounded px-0.5">$1</mark>');
            };
            
            searchResults.innerHTML = filteredBooks.map((book, index) => `
                <div class="search-result-item px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 transition-colors" data-index="${index}" onclick="viewSearchedBook(${book.id})">
                    <img src="${book.image || defaultImage}" alt="${book.title}" class="w-12 h-16 object-cover rounded shadow-sm">
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-gray-800 truncate">${highlightMatch(book.title, query)}</p>
                        <p class="text-xs text-gray-500 truncate">${book.author ? highlightMatch(book.author, query) : 'Unknown Author'}</p>
                        <span class="text-xs text-blue-600 font-medium">${book.genre ? book.genre.split(',')[0].trim() : ''}</span>
                    </div>
                    <i class='bx bx-chevron-right text-gray-400'></i>
                </div>
            `).join('');
            
            // Show "View all" if there are more results
            if (filteredBooks.length >= 8) {
                searchViewAll.classList.remove('hidden');
                searchViewAll.onclick = () => {
                    // Store search query and navigate to browse page with filter
                    localStorage.setItem('searchQuery', query);
                    window.location.href = 'index-none.html';
                };
            } else {
                searchViewAll.classList.add('hidden');
            }
        }
        
        searchDropdown.classList.remove('hidden');
    }
});

// Function to view searched book
function viewSearchedBook(bookId) {
    const storedBooks = localStorage.getItem('adminBooks');
    if (storedBooks) {
        const books = JSON.parse(storedBooks);
        // Use String comparison to handle both number and string IDs
        const book = books.find(b => String(b.id) === String(bookId));
        if (book) {
            // Update views count when clicking on a book
            updateViews(bookId);
            
            // Store book data
            localStorage.setItem('currentBook', JSON.stringify(book));
            // Navigate to detail page with book ID for reliable cover lookup
            window.location.href = '../detail/index-none.html?id=' + bookId;
        }
    }
}

