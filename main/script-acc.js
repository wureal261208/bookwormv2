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
    setupCardHandlers('../detail/index-acc.html');
    
    // Setup pagination buttons
    setupPagination();
    
// Initialize notification system for registered users
    initNotificationSystem();
    
    // Display user email in logout dropdown
    displayUserEmail();
    
    // Populate carousel with random book covers
    populateCarouselWithBooks();
    
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

// Function to populate carousel with random book covers
function populateCarouselWithBooks() {
    const slider = document.querySelector('.slider');
    if (!slider) return;
    
    // Default cover images for fallback
    const defaultImages = [
        "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=250&h=150&q=80",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=250&h=150&q=80",
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=250&h=150&q=80",
        "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=250&h=150&q=80",
        "https://images.unsplash.com/photo-1476275466078-4007374efbbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=250&h=150&q=80"
    ];
    
    // Get all books from localStorage
    const storedBooks = localStorage.getItem('adminBooks');
    let books = [];
    
    if (storedBooks) {
        books = JSON.parse(storedBooks).filter(book => book.status === 'published');
    }
    
    // If no books, use default images
    let carouselImages = [];
    if (books.length === 0) {
        carouselImages = defaultImages;
    } else {
        // Shuffle books and get their images
        const shuffledBooks = [...books].sort(() => 0.5 - Math.random());
        carouselImages = shuffledBooks.slice(0, 6).map(book => book.image || defaultImages[0]);
        
        // Store the shuffled books globally for navigation - this ensures the clicked slide goes to the correct book
        window.carouselBooks = shuffledBooks.slice(0, 6);
        
        // Ensure we have at least 6 images by adding defaults if needed
        while (carouselImages.length < 6) {
            const randomDefault = defaultImages[Math.floor(Math.random() * defaultImages.length)];
            if (!carouselImages.includes(randomDefault)) {
                carouselImages.push(randomDefault);
            }
        }
    }
    
    // Duplicate images for seamless loop (12 slides for continuous effect)
    const allSlides = [...carouselImages, ...carouselImages];
    
    // Generate HTML for slides - use modulo to get correct book index from the shuffled array
    slider.innerHTML = allSlides.map((imgSrc, index) => `
        <div class="slide" onclick="navigateToBookFromCarousel(${index % carouselImages.length})">
            <img src="${imgSrc}" class="w-full h-full object-cover rounded-xl" alt="slide${index + 1}">
        </div>
    `).join('');
}

// Function to navigate to book from carousel
function navigateToBookFromCarousel(index) {
    // Use the globally stored carousel books (already shuffled) instead of re-shuffling
    const books = window.carouselBooks;
    if (books && books.length > 0) {
        const selectedBook = books[index % books.length];
        
        if (selectedBook) {
            localStorage.setItem('currentBook', JSON.stringify(selectedBook));
            // Navigate with book ID for reliable cover lookup
            window.location.href = '../detail/index-acc.html?id=' + selectedBook.id;
        }
    } else {
        // Fallback: if no carousel books, try localStorage
        const storedBooks = localStorage.getItem('adminBooks');
        if (storedBooks) {
            const allBooks = JSON.parse(storedBooks);
            const publishedBooks = allBooks.filter(book => book.status === 'published');
            if (publishedBooks.length > 0) {
                const selectedBook = publishedBooks[index % publishedBooks.length];
                if (selectedBook) {
                    localStorage.setItem('currentBook', JSON.stringify(selectedBook));
                    window.location.href = '../detail/index-acc.html?id=' + selectedBook.id;
                }
            }
        }
    }
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
    setupCardHandlers('../detail/index-acc.html');
}

// generic helper to wire any .item-card elements to navigate to the given detail page
function setupCardHandlers(detailPage) {
    document.querySelectorAll('.item-card').forEach(card => {
        if (card.dataset.wired === 'true') return;
        card.dataset.wired = 'true';
        card.addEventListener('click', () => {
            let book;
            
            // First try to get full book data from data-book attribute
            if (card.dataset.book) {
                try {
                    book = JSON.parse(decodeURIComponent(card.dataset.book));
                } catch (e) {
                    console.error('Error parsing book data:', e);
                }
            }
            
            // Fallback to building from DOM elements
            if (!book) {
                const imgEl = card.querySelector('img');
                const imgSrc = imgEl ? imgEl.src : '';
                const titleEl = card.querySelector('h3');
                const authorEl = card.querySelector('.author');
                
                book = {
                    id: card.dataset.id || Date.now(),
                    title: titleEl ? titleEl.textContent : '',
                    author: authorEl ? authorEl.textContent : '',
                    image: imgSrc,
                    genre: card.dataset.category || '',
                    pages: parseInt(card.dataset.pages) || 0,
                    status: 'published'
                };
            }
            
            // Update views count when clicking on a book
            if (book.id) {
                updateViews(book.id);
            }
            
            // Store the complete book data in localStorage for the detail page
            localStorage.setItem('currentBook', JSON.stringify(book));
            
            // Navigate to detail page with book ID for reliable cover lookup
            const target = detailPage + '?id=' + book.id;
            window.location.href = target;
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
    
    // Helper to check if book is new (published within last 7 days)
    function isNewBook(publishedAt) {
        if (!publishedAt) return false;
        const publishedDate = new Date(publishedAt);
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return publishedDate > sevenDaysAgo;
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
        
        // Store book data as JSON string in data attribute for reliable passing
        const bookData = encodeURIComponent(JSON.stringify(book));
        
        return `
        <div class="item-card" data-book-id="${book.id}" data-category="${book.genre.toLowerCase()}" data-rating="5" data-year="${new Date().getFullYear()}" data-book='${bookData}'>
            <div class="card-image">
                <img src="${book.image || defaultImage}" alt="${book.title}">
                <span class="book-type-tag ${bookType.class}"><i class='bx ${bookType.icon}'></i> ${bookType.label}</span>
            </div>
            <div class="card-content">
                <h3>${book.title}</h3>
                <p class="author">${book.author}</p>
                <p class="card-description">${book.description || 'A wonderful book in the ' + book.genre + ' genre.'}</p>
                <div class="card-meta">
                    <span><i class='bx bx-book-open'></i> ${book.pages} pages</span>
                    <span><i class='bx bx-calendar'></i> ${book.pubdate ? new Date(book.pubdate).getFullYear() : new Date().getFullYear()}</span>
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

// helper for validating URLs
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
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
            let target = '../detail/index-acc.html?id=' + bookId;
            window.location.href = target;
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
                    window.location.href = 'index-acc.html';
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
            window.location.href = '../detail/index-acc.html?id=' + bookId;
        }
    }
}

// ═════════════════════════════════════════════════════════════
// NOTIFICATION SYSTEM (Registered Users Only)
// ═════════════════════════════════════════════════════════════

function initNotificationSystem() {
    // Check if user is logged in (registered user)
    const currentUser = localStorage.getItem('currentUser') || localStorage.getItem('user');
    
    // If no user is logged in, hide the notification button
    if (!currentUser) {
        const notifContainer = document.getElementById('notification-container');
        if (notifContainer) {
            notifContainer.style.display = 'none';
        }
        return;
    }
    
    // User is logged in - show notifications
    loadAndDisplayNotifications();
    
    // Setup mark all as read button
    const markAllReadBtn = document.getElementById('mark-all-read');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllNotificationsAsRead);
    }
}

function loadAndDisplayNotifications() {
    const notifications = JSON.parse(localStorage.getItem('newBookNotifications')) || [];
    const notificationList = document.getElementById('notification-list');
    const notificationBadge = document.getElementById('notification-badge');
    
    if (!notificationList) return;
    
    // Get user's seen notifications from localStorage
    const currentUser = localStorage.getItem('currentUser') || localStorage.getItem('user');
    const seenKey = `seenNotifications_${currentUser}`;
    const seenNotifications = JSON.parse(localStorage.getItem(seenKey)) || [];
    
    // Filter out seen notifications and sort by newest first
    const unseenNotifications = notifications
        .filter(n => !seenNotifications.includes(n.bookId))
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    
    // Update badge count
    if (notificationBadge) {
        if (unseenNotifications.length > 0) {
            notificationBadge.textContent = unseenNotifications.length > 9 ? '9+' : unseenNotifications.length;
            notificationBadge.classList.remove('hidden');
            // Add pulse animation for visibility
            notificationBadge.classList.add('animate-pulse');
        } else {
            notificationBadge.classList.add('hidden');
            notificationBadge.classList.remove('animate-pulse');
        }
    }
    
    // Render notifications
    if (unseenNotifications.length === 0) {
        notificationList.innerHTML = `
            <p class="px-4 py-3 text-sm text-black text-center">No new notifications</p>
        `;
    } else {
        // Default cover image
        const defaultImage = "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80";
        
        // Get all books to find the cover image
        const storedBooks = localStorage.getItem('adminBooks');
        const allBooks = storedBooks ? JSON.parse(storedBooks) : [];
        
        notificationList.innerHTML = unseenNotifications.map(notif => {
            const publishedDate = new Date(notif.publishedAt);
            const timeAgo = getTimeAgo(publishedDate);
            
            // Find the book to get its cover image - handle type mismatch (string vs number)
            const book = allBooks.find(b => String(b.id) === String(notif.bookId));
            // Try to get image from notification first, then from localStorage
            let bookImage = defaultImage;
            if (notif.image) {
                bookImage = notif.image;
            } else if (book && book.image) {
                bookImage = book.image;
            }
            
            // Get author from notification or from localStorage book
            const bookAuthor = notif.author || (book ? book.author : '');
            
            return `
            <div class="notification-item px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100" onclick="viewNotificationBook(${notif.bookId})">
                <div class="flex items-start gap-3">
                    <div class="flex-shrink-0">
                        <img src="${bookImage}" alt="${notif.title}" class="w-12 h-16 object-cover rounded">
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-black truncate">New book published!</p>
                        <p class="text-sm font-medium text-black truncate">${notif.title}</p>
                        <p class="text-xs text-gray-500 truncate">${bookAuthor}</p>
                        <p class="text-xs text-gray-500 mt-1">${timeAgo}</p>
                    </div>
                    <div class="flex-shrink-0">
                        <span class="w-2 h-2 bg-blue-600 rounded-full"></span>
                    </div>
                </div>
            </div>
        `;
        }).join('');
    }
}

function viewNotificationBook(bookId) {
    // Mark this notification as seen
    const currentUser = localStorage.getItem('currentUser') || localStorage.getItem('user');
    const seenKey = `seenNotifications_${currentUser}`;
    const seenNotifications = JSON.parse(localStorage.getItem(seenKey)) || [];
    
    if (!seenNotifications.includes(bookId)) {
        seenNotifications.push(bookId);
        localStorage.setItem(seenKey, JSON.stringify(seenNotifications));
    }
    
    // Navigate to the book
    viewBookDetail(bookId);
}

function markAllNotificationsAsRead() {
    const currentUser = localStorage.getItem('currentUser') || localStorage.getItem('user');
    const notifications = JSON.parse(localStorage.getItem('newBookNotifications')) || [];
    
    // Mark all as seen
    const seenKey = `seenNotifications_${currentUser}`;
    const seenNotifications = notifications.map(n => n.bookId);
    localStorage.setItem(seenKey, JSON.stringify(seenNotifications));
    
    // Reload notifications
    loadAndDisplayNotifications();
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

// Helper to shorten an email address for display (sniptext)
// Shortens if domain (letters after @) has MORE than 10 characters
function shortenEmail(email) {
    if (!email) return '';
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const user = parts[0];
    const domain = parts[1];
    
    // If domain is 10 characters or less, show full email
    if (domain.length <= 10) {
        return email;
    }
    
    // If domain has MORE than 10 characters, shorten the username part
    return user.substring(0, 5) + '...' + '@' + domain;
}

// Function to display user email in logout dropdown
function displayUserEmail() {
    const userEmailDisplay = document.getElementById('user-email-display');
    if (!userEmailDisplay) return;
    
    // Get current user - first try 'user' key (just email), then 'currentUser' (object)
    let userEmail = localStorage.getItem('user') || localStorage.getItem('currentUser');
    
    if (userEmail) {
        // Check if it's a JSON string (object) and extract email
        try {
            const userObj = JSON.parse(userEmail);
            if (userObj && userObj.email) {
                userEmail = userObj.email;
            }
        } catch (e) {
            // It's already just a string (email), keep it as is
        }
        
        // Display shortened email for long addresses
        userEmailDisplay.textContent = shortenEmail(userEmail);
    } else {
        userEmailDisplay.textContent = 'Guest';
    }
}

// ═════════════════════════════════════════════════════════════
// NOTIFICATION DROPDOWN TOGGLE
// ═════════════════════════════════════════════════════════====

document.addEventListener('DOMContentLoaded', function() {
    const notifBtn = document.getElementById('notification-btn');
    const notifDropdown = document.getElementById('notification-dropdown');
    const container = document.getElementById('notification-container');

    if (notifBtn && notifDropdown && container) {
        notifBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            // Toggle dropdown with animation
            notifDropdown.classList.toggle('opacity-0');
            notifDropdown.classList.toggle('scale-95');
            notifDropdown.classList.toggle('invisible');
            notifDropdown.classList.toggle('opacity-100');
            notifDropdown.classList.toggle('scale-100');
        });

        document.addEventListener('click', function(e) {
            if (!container.contains(e.target)) {
                notifDropdown.classList.add('opacity-0', 'scale-95');
                notifDropdown.classList.remove('opacity-100', 'scale-100');
                notifDropdown.classList.add('invisible');
            }
        });
        
        // Also setup mark all read button
        const markAllReadBtn = document.getElementById('mark-all-read');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                markAllNotificationsAsRead();
            });
        }
    }
});

