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
    
    // Generate HTML for slides
    slider.innerHTML = allSlides.map((imgSrc, index) => `
        <div class="slide" onclick="navigateToBookFromCarousel(${index % carouselImages.length})">
            <img src="${imgSrc}" class="w-full h-full object-cover rounded-xl" alt="slide${index + 1}">
        </div>
    `).join('');
}

// Function to navigate to book from carousel
function navigateToBookFromCarousel(index) {
    const storedBooks = localStorage.getItem('adminBooks');
    if (storedBooks) {
        const books = JSON.parse(storedBooks);
        const shuffledBooks = [...books].sort(() => 0.5 - Math.random());
        const selectedBook = shuffledBooks[index % shuffledBooks.length];
        
        if (selectedBook) {
            localStorage.setItem('currentBook', JSON.stringify(selectedBook));
            // Navigate with book ID for reliable cover lookup
            window.location.href = '../detail/index-acc.html?id=' + selectedBook.id;
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
    
    itemsGrid.innerHTML = books.map(book => {
        const bookType = getBookType(book.tags);
        
        // Calculate rating based on views (more views = higher rating)
        const views = book.views || 0;
        const rating = Math.min(5, Math.ceil(views / 100)); // 0-99 views = 1 star, 100-199 = 2 stars, etc., max 5 stars
        
        // Generate stars HTML
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starsHtml += '<i class=\'bx bxs-star text-yellow-400\'></i>';
            } else {
                starsHtml += '<i class=\'bx bx-star text-gray-300\'></i>';
            }
        }
        
        // Store book data as JSON string in data attribute for reliable passing
        const bookData = encodeURIComponent(JSON.stringify(book));
        
        return `
        <div class="item-card" data-category="${book.genre.toLowerCase()}" data-rating="5" data-year="${new Date().getFullYear()}" data-book-id="${book.id}" data-book='${bookData}'>
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
        const book = books.find(b => b.id === bookId);
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
        const book = books.find(b => b.id === bookId);
        if (book) {
            book.views = (book.views || 0) + 1;
            localStorage.setItem('adminBooks', JSON.stringify(books));
        }
    }
}

// ═════════════════════════════════════════════════════════════
// SEARCH FUNCTIONALITY
// ═════════════════════════════════════════════════════════════

// Search functionality with instant dropdown
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('main-search-input');
    const searchDropdown = document.getElementById('search-dropdown');
    const searchResults = document.getElementById('search-results');
    const searchClearBtn = document.getElementById('search-clear-btn');
    const searchWrapper = document.getElementById('search-wrapper');
    
    if (!searchInput) return;
    
    let searchTimeout;
    
    // Search on input with debounce
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        // Show/hide clear button
        if (query.length > 0) {
            searchClearBtn.classList.remove('hidden');
        } else {
            searchClearBtn.classList.add('hidden');
            searchDropdown.classList.add('hidden');
            return;
        }
        
        // Debounce search
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });
    
    // Clear search
    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', function() {
            searchInput.value = '';
            searchClearBtn.classList.add('hidden');
            searchDropdown.classList.add('hidden');
            searchInput.focus();
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (searchWrapper && !searchWrapper.contains(e.target)) {
            searchDropdown.classList.add('hidden');
        }
    });
    
    // Show dropdown when input is focused and has value
    searchInput.addEventListener('focus', function() {
        if (this.value.trim().length > 0) {
            searchDropdown.classList.remove('hidden');
        }
    });
    
    // Perform search
    function performSearch(query) {
        // Get all books from localStorage
        const storedBooks = localStorage.getItem('adminBooks');
        let books = [];
        
        if (storedBooks) {
            books = JSON.parse(storedBooks);
        }
        
        // Only search published books (exclude drafts)
        books = books.filter(book => book.status === 'published');
        
        // Filter books by title and author (case-insensitive)
        const queryLower = query.toLowerCase();
        const filteredBooks = books.filter(book => {
            const titleMatch = book.title && book.title.toLowerCase().includes(queryLower);
            const authorMatch = book.author && book.author.toLowerCase().includes(queryLower);
            return titleMatch || authorMatch;
        }).slice(0, 8); // Limit to 8 results
        
        // Display results
        if (filteredBooks.length === 0) {
            searchResults.innerHTML = `
                <div class="px-4 py-3 text-sm text-black text-center">
                    <i class='bx bx-search'></i> No books found for "${query}"
                </div>
            `;
        } else {
            const defaultImage = "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80";
            
            searchResults.innerHTML = filteredBooks.map(book => `
                <div class="search-result-item px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-100" onclick="viewSearchedBook(${book.id})">
                    <img src="${book.image || defaultImage}" alt="${book.title}" class="w-12 h-16 object-cover rounded">
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-black truncate">${book.title}</p>
                        <p class="text-xs text-gray-500">${book.author || 'Unknown Author'}</p>
                        <span class="text-xs text-blue-600">${book.genre || ''}</span>
                    </div>
                    <i class='bx bx-chevron-right text-gray-400'></i>
                </div>
            `).join('');
        }
        
        searchDropdown.classList.remove('hidden');
    }
});

// Function to view searched book
function viewSearchedBook(bookId) {
    const storedBooks = localStorage.getItem('adminBooks');
    if (storedBooks) {
        const books = JSON.parse(storedBooks);
        const book = books.find(b => b.id === bookId);
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
            
            // Find the book to get its cover image
            const book = allBooks.find(b => b.id === notif.bookId);
            const bookImage = book && book.image ? book.image : defaultImage;
            
            return `
            <div class="notification-item px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100" onclick="viewNotificationBook(${notif.bookId})">
                <div class="flex items-start gap-3">
                    <div class="flex-shrink-0">
                        <img src="${bookImage}" alt="${notif.title}" class="w-12 h-16 object-cover rounded">
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-black truncate">New book published!</p>
                        <p class="text-sm text-black truncate">${notif.title}</p>
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
// Only shortens if username is 8+ characters
function shortenEmail(email) {
    if (!email) return '';
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const user = parts[0];
    const domain = parts[1];
    
    // If username is less than 8 characters, show full email
    if (user.length < 8) {
        return email;
    }
    
    // If username is 8+ characters, shorten it
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

