// detail/script.js
// DOMContentLoaded to ensure elements exist

document.addEventListener('DOMContentLoaded', () => {
    // =====================
    // NOTIFICATION SYSTEM
    // =====================
    const notificationBtn = document.getElementById('notification-btn');
    const notificationDropdown = document.getElementById('notification-dropdown');
    const notificationList = document.getElementById('notification-list');
    const notificationBadge = document.getElementById('notification-badge');
    const clearNotificationsBtn = document.getElementById('clear-notifications');

    // Toggle notification dropdown
    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = !notificationDropdown.classList.contains('opacity-0');
            if (isVisible) {
                notificationDropdown.classList.add('opacity-0', 'invisible');
                notificationDropdown.classList.remove('opacity-100', 'visible');
            } else {
                notificationDropdown.classList.remove('opacity-0', 'invisible');
                notificationDropdown.classList.add('opacity-100', 'visible');
                loadNotifications();
            }
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (notificationDropdown && !notificationDropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
            notificationDropdown.classList.add('opacity-0', 'invisible');
            notificationDropdown.classList.remove('opacity-100', 'visible');
        }
    });

    // Load and display notifications
    function loadNotifications() {
        if (!notificationList) return;

        // Get notifications from localStorage
        const notifications = JSON.parse(localStorage.getItem('newBookNotifications')) || [];
        
        // Get books from admin to get cover images
        const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
        
        // Get book data for each notification
        const notificationsWithCovers = notifications.map(notif => {
            const book = adminBooks.find(b => b.id === notif.bookId);
            return {
                ...notif,
                image: book ? book.image : null
            };
        });

        // Update badge count
        const unreadCount = notificationsWithCovers.filter(n => !n.seen).length;
        if (notificationBadge) {
            if (unreadCount > 0) {
                notificationBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                notificationBadge.classList.remove('hidden');
            } else {
                notificationBadge.classList.add('hidden');
            }
        }

        // Render notifications
        if (notificationsWithCovers.length === 0) {
            notificationList.innerHTML = '<p class="px-4 py-4 text-gray-500 text-center text-sm">No new notifications</p>';
            return;
        }

        notificationList.innerHTML = notificationsWithCovers.map((notif, index) => {
            const defaultCover = "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80";
            const coverImage = notif.image || defaultCover;
            const date = notif.publishedAt ? new Date(notif.publishedAt).toLocaleDateString() : '';
            
            return `
                <div class="notification-item flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b" onclick="viewBookDetail(${notif.bookId})">
                    <img src="${coverImage}" alt="${notif.title}" class="w-12 h-16 object-cover rounded">
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-black truncate">${notif.title}</p>
                        <p class="text-xs text-gray-600">New book published! ${date ? '- ' + date : ''}</p>
                    </div>
                    ${!notif.seen ? '<span class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>' : ''}
                </div>
            `;
        }).join('');
    }

    // Mark notifications as seen
    function markNotificationsAsSeen() {
        const notifications = JSON.parse(localStorage.getItem('newBookNotifications')) || [];
        notifications.forEach(n => n.seen = true);
        localStorage.setItem('newBookNotifications', JSON.stringify(notifications));
        if (notificationBadge) {
            notificationBadge.classList.add('hidden');
        }
    }

    // Clear all notifications
    if (clearNotificationsBtn) {
        clearNotificationsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            localStorage.removeItem('newBookNotifications');
            loadNotifications();
        });
    }

    // Mark as seen when dropdown opens
    if (notificationDropdown) {
        const observer = new MutationObserver(() => {
            if (notificationDropdown.classList.contains('opacity-100')) {
                markNotificationsAsSeen();
            }
        });
        observer.observe(notificationDropdown, { attributes: true, attributeFilter: ['class'] });
    }

    // Make viewBookDetail available globally
    window.viewBookDetail = function(bookId) {
        const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
        const book = adminBooks.find(b => b.id === bookId);
        if (book) {
            localStorage.setItem('currentBook', JSON.stringify(book));
            // Reload current page with book data
            window.location.reload();
        }
    };

    // Load notifications on page load
    loadNotifications();

    // =====================
    // MOBILE MENU
    // =====================
    // mobile menu toggle + accessibility
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            const expanded = mobileBtn.getAttribute('aria-expanded') === 'true';
            mobileBtn.setAttribute('aria-expanded', String(!expanded));
            mobileMenu.classList.toggle('hidden');
        });
        // close when a link is chosen
        mobileMenu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                mobileBtn.setAttribute('aria-expanded', 'false');
                mobileMenu.classList.add('hidden');
            });
        });
    }

    // =====================
    // COMMENT SYSTEM (linked with main page)
    // =====================
    const commentForm = document.getElementById('comment-form');
    const commentInput = document.getElementById('comment-input');
    const commentsList = document.getElementById('comments-list');

    // Get current book ID for comments storage
    function getCurrentBookId() {
        const params = new URLSearchParams(window.location.search);
        const bookId = params.get('id');
        if (bookId) return bookId;
        
        const storedBook = localStorage.getItem('currentBook');
        if (storedBook) {
            const book = JSON.parse(storedBook);
            return book.id || 'default';
        }
        return 'default';
    }

    // Save comment to localStorage
    function saveComment(bookId, text) {
        const commentsKey = `bookComments_${bookId}`;
        const existingComments = JSON.parse(localStorage.getItem(commentsKey)) || [];
        
        const newComment = {
            id: Date.now(),
            text: text,
            timestamp: new Date().toISOString(),
            user: 'Anonymous User'
        };
        
        existingComments.push(newComment);
        localStorage.setItem(commentsKey, JSON.stringify(existingComments));
        
        return newComment;
    }

    // Load comments from localStorage
    function loadComments(bookId) {
        const commentsKey = `bookComments_${bookId}`;
        return JSON.parse(localStorage.getItem(commentsKey)) || [];
    }

    // Render comments to the list
    function renderComments(comments) {
        if (!commentsList) return;
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="text-gray-500">No comments yet. Be the first to share your thoughts!</p>';
            return;
        }

        commentsList.innerHTML = comments.map(comment => {
            const date = new Date(comment.timestamp);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return `
                <div class="p-3 mb-2 border rounded bg-gray-50 comment-item">
                    <div class="flex justify-between items-start mb-1">
                        <span class="font-semibold text-sm">${comment.user}</span>
                        <span class="text-xs text-gray-500">${formattedDate}</span>
                    </div>
                    <p class="text-sm">${comment.text}</p>
                </div>
            `;
        }).join('');
        
        // Scroll to bottom
        commentsList.scrollTop = commentsList.scrollHeight;
    }

    // Initialize comments on page load
    const currentBookId = getCurrentBookId();
    if (commentsList) {
        const initialComments = loadComments(currentBookId);
        renderComments(initialComments);
    }

    function addComment(text) {
        if (!text) return;
        
        // Save to localStorage
        const savedComment = saveComment(currentBookId, text);
        
        // Clear empty state message if present
        if (commentsList.children.length === 1 && commentsList.children[0].classList.contains('text-gray-500')) {
            commentsList.innerHTML = '';
        }
        
        // Add comment to display
        const date = new Date(savedComment.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const div = document.createElement('div');
        div.className = 'p-3 mb-2 border rounded bg-gray-50 comment-item';
        div.innerHTML = `
            <div class="flex justify-between items-start mb-1">
                <span class="font-semibold text-sm">${savedComment.user}</span>
                <span class="text-xs text-gray-500">${formattedDate}</span>
            </div>
            <p class="text-sm">${savedComment.text}</p>
        `;
        commentsList.appendChild(div);
        commentsList.scrollTop = commentsList.scrollHeight;
    }

    if (commentForm && commentInput && commentsList) {
        commentForm.addEventListener('submit', e => {
            e.preventDefault();
            const txt = commentInput.value.trim();
            if (txt) {
                addComment(txt);
                commentInput.value = '';
                commentInput.focus();
            }
        });
    }

    // Helper function to check if book is new (published within last 7 days)
    function isNewBook(publishedAt) {
        if (!publishedAt) return false;
        const publishedDate = new Date(publishedAt);
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return publishedDate > sevenDaysAgo;
    }

    // Helper function to generate star rating based on views
    function generateRating(views) {
        const viewCount = typeof views === 'number' ? views : parseInt(views) || 0;
        // 0-99 views = 1 star, 100-199 = 2 stars, etc., max 5 stars
        const rating = Math.min(5, Math.ceil(viewCount / 100));
        
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starsHtml += '★';
            } else {
                starsHtml += '☆';
            }
        }
        
        // Format views count
        let formattedViews;
        if (viewCount >= 1000) {
            formattedViews = (viewCount / 1000).toFixed(1) + 'k';
        } else {
            formattedViews = viewCount.toString();
        }
        
        return { stars: starsHtml, formattedViews: formattedViews };
    }

    // simple data loader (would normally be async fetch)
    function loadBook() {
        // First, try to get book data from localStorage (set by main page)
        const storedBook = localStorage.getItem('currentBook');
        
        let title, author, status, views, rating, ratingCount, description, cover, chapters;
        
        function isValidUrl(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        }

        // give priority to any cover provided via query string
        const params = new URLSearchParams(window.location.search);
        const overrideCover = params.get('cover');
        const bookId = params.get('id');

        // ALWAYS look up the book from adminBooks when ID is provided to get the latest cover
        if (bookId) {
            const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
            const adminBook = adminBooks.find(b => b.id == bookId);
            
            if (adminBook) {
                // Use admin book data - this ensures we get the correct cover from admin
                title = adminBook.title || 'Book Title';
                author = adminBook.author || 'Author Name';
                status = adminBook.status || 'Completed';
                views = adminBook.views || 0;
                description = adminBook.description || '';
                chapters = adminBook.pages || 200;
                const publishedAt = adminBook.pubdate || adminBook.publishedAt;
                
                // Generate dynamic rating based on views
                const ratingData = generateRating(views);
                rating = ratingData.stars;
                ratingCount = `(${ratingData.formattedViews} views)`;
                
                // Check and display NEW badge
                const newBadge = document.getElementById('new-badge');
                if (newBadge && isNewBook(publishedAt)) {
                    newBadge.classList.remove('hidden');
                }
                
                // Set the main Read button href
                const readBtn = document.getElementById('read-btn');
                if (readBtn) {
                    readBtn.href = `../reading/index-read-novel.html?book=${bookId}&chapter=1`;
                }
                
                // Use overrideCover if provided and valid, otherwise use adminBook's image
                if (overrideCover && isValidUrl(overrideCover)) {
                    cover = overrideCover;
                } else if (adminBook.image) {
                    cover = adminBook.image;
                } else {
                    cover = '';
                }
            } else if (storedBook) {
                // Fallback to storedBook if not found in adminBooks
                const book = JSON.parse(storedBook);
                title = book.title || 'Book Title';
                author = book.author || 'Author Name';
                status = book.status || 'Completed';
                views = book.views || 0;
                description = book.description || '';
                chapters = book.pages || 200;
                const publishedAt = book.pubdate || book.publishedAt;
                
                const ratingData = generateRating(views);
                rating = ratingData.stars;
                ratingCount = `(${ratingData.formattedViews} views)`;
                
                const newBadge = document.getElementById('new-badge');
                if (newBadge && isNewBook(publishedAt)) {
                    newBadge.classList.remove('hidden');
                }
                
                const readBtn = document.getElementById('read-btn');
                if (readBtn) {
                    readBtn.href = `../reading/index-read-novel.html?book=${book.id || 'default'}&chapter=1`;
                }
                
                if (overrideCover && isValidUrl(overrideCover)) {
                    cover = overrideCover;
                } else if (book.image) {
                    cover = book.image;
                } else {
                    cover = '';
                }
            } else {
                // Fall back to URL query parameters
                title = params.get('title') || 'Book Title';
                author = params.get('author') || 'Author Name';
                status = params.get('status') || 'Completed';
                views = params.get('views') || '12.3k';
                rating = params.get('rating') || '★★★★★';
                ratingCount = params.get('ratingCount') || '(1234 reviews)';
                description = params.get('desc') || '';
                cover = overrideCover || params.get('cover');
                chapters = parseInt(params.get('chapters')) || 200;
                
                const readBtn = document.getElementById('read-btn');
                if (readBtn) {
                    readBtn.href = `../reading/index-read-novel.html?book=${bookId || 'default'}&chapter=1`;
                }
            }
        } else if (storedBook) {
            // Use data from localStorage
            const book = JSON.parse(storedBook);
            title = book.title || 'Book Title';
            author = book.author || 'Author Name';
            status = book.status || 'Completed';
            views = book.views || 0;
            description = book.description || '';
            chapters = book.pages || 200;
            const publishedAt = book.pubdate || book.publishedAt;
            
            // Generate dynamic rating based on views
            const ratingData = generateRating(views);
            rating = ratingData.stars;
            ratingCount = `(${ratingData.formattedViews} views)`;
            
            // Check and display NEW badge
            const newBadge = document.getElementById('new-badge');
            if (newBadge && isNewBook(publishedAt)) {
                newBadge.classList.remove('hidden');
            }
            
            // Set the main Read button href
            const readBtn = document.getElementById('read-btn');
            if (readBtn) {
                readBtn.href = `../reading/index-read-novel.html?book=${book.id || 'default'}&chapter=1`;
            }
            
            if (overrideCover && isValidUrl(overrideCover)) {
                cover = overrideCover;
            } else if (book.image) {
                if (isValidUrl(book.image)) {
                    cover = book.image;
                } else {
                    console.warn('Stored cover URL is invalid, falling back to default:', book.image);
                    cover = '';
                }
            } else {
                cover = '';
            }
        } else {
            // Fall back to URL query parameters
            const params = new URLSearchParams(window.location.search);
            title = params.get('title') || 'Book Title';
            author = params.get('author') || 'Author Name';
            status = params.get('status') || 'Completed';
            views = params.get('views') || '12.3k';
            rating = params.get('rating') || '★★★★★';
            ratingCount = params.get('ratingCount') || '(1234 reviews)';
            description = params.get('desc') || '';
            // if we reach here without localStorage data use query params (including cover override)
            cover = overrideCover || params.get('cover');
            chapters = parseInt(params.get('chapters')) || 200;
            
            // Set the main Read button href (default)
            const readBtn = document.getElementById('read-btn');
            if (readBtn) {
                readBtn.href = '../reading/index-read-novel.html?book=default&chapter=1';
            }
        }

        document.getElementById()
        document.getElementById('book-title').textContent = title;
        document.getElementById('book-author').textContent = `by ${author}`;
        document.getElementById('book-status').innerHTML = `Status: <strong>${status}</strong>`;
        document.getElementById('book-views').textContent = `Views: ${views}`;
        document.getElementById('book-rating').textContent = rating;
        document.getElementById('book-rating-count').textContent = ratingCount;
        document.getElementById('book-description').textContent = description ||
            'No summary provided.';
    // Set book cover image - use book image or fallback to default
        const defaultCover = "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80";
        const bookCoverEl = document.getElementById('book-cover');
        const bookCoverLink = document.getElementById('book-cover-link');
        if (bookCoverEl) {
            if (cover && isValidUrl(cover)) {
                bookCoverEl.src = cover;
            } else {
                bookCoverEl.src = defaultCover;
            }
            // Add error handling for image loading
            bookCoverEl.onerror = function() {
                this.src = defaultCover;
            };
        }
        // Set the book cover link href (same as read button)
        if (bookCoverLink) {
            bookCoverLink.href = readBtn ? readBtn.href : `../reading/index-read-novel.html?book=${bookId || 'default'}&chapter=1`;
        }
        return chapters;
    }

    function isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    function getBookCover(bookId) {
        const storedBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
        const book = storedBooks.find(b => b.id === bookId);
        if (book && book.image) {
            if (isValidCoverUrl(book.image)) {
                return book.image;
            }
        }
        return getDefaultCover();
    }

    function saveBookCover(bookId, coverUrl) {
        const storedBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
        const bookIndex = storedBooks.findIndex(b => b.id === bookId);
        if (bookIndex !== -1) {
            // Validate URL or use default
            const validCover = isValidCoverUrl(coverUrl) ? coverUrl : getDefaultCover();
            storedBooks[bookIndex].image = validCover;
            storedBooks[bookIndex].updatedAt = new Date().toISOString();
            localStorage.setItem('adminBooks', JSON.stringify(storedBooks));
            
            // Update in-memory books array
            const localBookIndex = books.findIndex(b => b.id === bookId);
            if (localBookIndex !== -1) {
                books[localBookIndex].image = validCover;
            }
            return validCover;
        }
        return getDefaultCover();
    }

    function getAllBookCovers() {
        const storedBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
        return storedBooks.map(book => ({
            id: book.id,
            image: book.image || getDefaultCover()
        }));
    }

    // chapters pagination - display actual editions from book data
    let editions = [];
    let chaptersCount = 200; // default fallback
    
    try {
        // First load the book data
        chaptersCount = loadBook();
        
        const storedBook = localStorage.getItem('currentBook');
        if (storedBook) {
            const book = JSON.parse(storedBook);
            editions = book.editions || [];
        }
        
        // Try to get from URL parameter as fallback
        const params = new URLSearchParams(window.location.search);
        const bookId = params.get('id');
        if (!editions.length && bookId) {
            const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
            const adminBook = adminBooks.find(b => b.id == bookId);
            if (adminBook) {
                editions = adminBook.editions || [];
            }
        }
    } catch (e) {
        console.error('Error loading editions:', e);
    }
    
    // If no editions in book data, use page count as fallback
    const totalEditions = editions.length > 0 ? editions.length : chaptersCount;
    const pageSize = 6;
    let currentPage = 0;
    const editionList = document.getElementById('chapter-list');
    const btnPrev = document.getElementById('chap-prev');
    const btnNext = document.getElementById('chap-next');

    // Default cover for editions without images
    const defaultEditionCover = "https://images.unsplash.com/photo-1543002588-bfa74090ca80?w=80";

    function renderChapters() {
        if (!editionList) return [];
        editionList.innerHTML = '';

        const start = currentPage * pageSize;
        const end = Math.min(editions.length, start + pageSize);
        
        // If no editions available at all, show a message
        if (totalEditions === 0) {
            editionList.innerHTML = `
                <li class="text-center py-8 text-gray-500">
                    <i class='bx bx-book' style="font-size: 3rem;"></i>
                    <p class="mt-2">No editions available for this book.</p>
                    <p class="text-sm text-gray-400">Check back later for updates.</p>
                </li>
            `;
            if (btnPrev) btnPrev.disabled = true;
            if (btnNext) btnNext.disabled = true;
            return [];
        }
        
        // If we have actual editions, display them
        if (editions.length > 0) {
            for (let i = start; i < end; i++) {
                const edition = editions[i];
                const li = document.createElement('li');
                li.className = "edition-item flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50";
                
                // Get edition image or use default
                const editionImage = edition.image || defaultEditionCover;
                // Get edition title or generate default
                const editionTitle = edition.title || `Edition ${i + 1}`;
                // Get edition language or default to English
                const editionLanguage = edition.language || 'English';

                li.innerHTML = `
                    <div class="flex items-center gap-3">
                        <img src="${editionImage}" alt="${editionTitle}" class="w-10 h-14 object-cover rounded">
                        <div class="edition-info">
                            <p class="font-semibold">${editionTitle}</p>
                            <p class="text-sm text-gray-500">Language: ${editionLanguage}</p>
                        </div>
                    </div>
                    <div class="edition-actions flex gap-2">
                        <a href="index-${localStorage.getItem('isLoggedIn') ? 'acc' : 'none'}.html?edition=${i + 1}&bookId=${bookId || ''}" class="edition-about px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-100">
                            About
                        </a>
                        <a href="../reading/index-read-img.html?edition=${i + 1}&bookId=${bookId || ''}" class="edition-read px-3 py-1.5 bg-black text-white text-sm rounded hover:opacity-80">
                            Read
                        </a>
                    </div>
                `;
                editionList.appendChild(li);
            }
        } else {
            // Fallback: generate placeholder editions based on page count
            for (let i = start; i < end; i++) {
                const li = document.createElement('li');
                li.className = "edition-item flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50";
                li.innerHTML = `
                    <div class="flex items-center gap-3">
                        <img src="${defaultEditionCover}" alt="Edition ${i + 1}" class="w-10 h-14 object-cover rounded">
                        <div class="edition-info">
                            <p class="font-semibold">Edition ${i + 1}</p>
                            <p class="text-sm text-gray-500">Language: English</p>
                        </div>
                    </div>
                    <div class="edition-actions flex gap-2">
                        <a href="index-${localStorage.getItem('isLoggedIn') ? 'acc' : 'none'}.html?edition=${i + 1}&bookId=${bookId || ''}" class="edition-about px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-100">
                            About
                        </a>
                        <a href="../reading/index-read-img.html?edition=${i + 1}" class="edition-read px-3 py-1.5 bg-black text-white text-sm rounded hover:opacity-80">
                            Read
                        </a>
                    </div>
                `;
                editionList.appendChild(li);
            }
        }

        // Update pagination buttons
        if (btnPrev) btnPrev.disabled = currentPage === 0;
        if (btnNext) btnNext.disabled = end >= totalEditions;

        return editionList.querySelectorAll('a');
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                focusFirstChapter();
            }
        });
    }
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            const maxPage = Math.floor((totalEditions - 1) / pageSize);
            if (currentPage < maxPage) {
                currentPage++;
                focusFirstChapter();
            }
        });
    }

    function focusFirstChapter() {
        const links = renderChapters();
        if (links.length) links[0].focus();
    }

    // keyboard shortcuts for chapters
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'ArrowRight' && btnNext && !btnNext.disabled) {
            btnNext.click();
            e.preventDefault();
        } else if (e.key === 'ArrowLeft' && btnPrev && !btnPrev.disabled) {
            btnPrev.click();
            e.preventDefault();
        }
    });

    renderChapters();
    // set initial focus for accessibility
    focusFirstChapter();
});


