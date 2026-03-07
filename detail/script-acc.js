// detail/script-acc.js
// Script for authenticated users (with notifications, progress bar, comments)
// This script reads from localStorage: adminBooks, currentBook, readingProgress

document.addEventListener('DOMContentLoaded', () => {
    // =====================
    // NOTIFICATION SYSTEM (Authenticated Users)
    // =====================
    const notificationBtn = document.getElementById('notification-btn');
    const notificationDropdown = document.getElementById('notification-list');
    const notificationBadge = document.getElementById('notification-badge');
    const notificationContainer = document.getElementById('notification-btn')?.parentElement;

    // Get current book ID from URL
    const params = new URLSearchParams(window.location.search);
    const currentBookId = params.get('id');

    // Check if user arrived from a notification click (stored in sessionStorage)
    const fromNotificationClick = sessionStorage.getItem('fromNotificationClick') === 'true';
    
    // Clear the sessionStorage flag after reading
    if (fromNotificationClick) {
        sessionStorage.removeItem('fromNotificationClick');
    }

    // Check if current book is newly published (within 7 days)
    function isNewlyPublishedBook(bookId) {
        const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
        const book = adminBooks.find(b => String(b.id) === String(bookId));
        
        if (!book || !book.pubdate) return false;
        
        const publishedDate = new Date(book.pubdate);
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        return publishedDate > sevenDaysAgo;
    }

    // Show notification for newly published book if not from notification click
    function showNewBookNotification() {
        if (!currentBookId || fromNotificationClick) return;
        
        if (isNewlyPublishedBook(currentBookId)) {
            const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
            const book = adminBooks.find(b => String(b.id) === String(currentBookId));
            
            if (book) {
                // Add to notifications if not already there
                let notifications = JSON.parse(localStorage.getItem('newBookNotifications')) || [];
                const exists = notifications.some(n => String(n.bookId) === String(currentBookId));
                
                if (!exists) {
                    notifications.unshift({
                        bookId: currentBookId,
                        title: book.title,
                        author: book.author,
                        image: book.image,
                        publishedAt: book.pubdate,
                        seen: false
                    });
                    localStorage.setItem('newBookNotifications', JSON.stringify(notifications));
                }
                
                // Show a toast notification to inform user
                showToastNotification(book.title);
            }
        }
    }

    // Show toast notification for new book
    function showToastNotification(bookTitle) {
        // Remove any existing toast
        const existingToast = document.getElementById('new-book-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.id = 'new-book-toast';
        toast.className = 'fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0';
        toast.innerHTML = `
            <div class="flex items-center gap-3">
                <i class='bx bx-bell-ring text-xl'></i>
                <span>New book published: <strong>${bookTitle}</strong></span>
            </div>
        `;
        document.body.appendChild(toast);

        // Show toast with animation
        setTimeout(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        }, 100);

        // Auto hide after 4 seconds
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Load and display notifications when hovering
    function loadNotifications() {
        if (!notificationDropdown) return;

        // Get notifications from localStorage
        let notifications = JSON.parse(localStorage.getItem('newBookNotifications')) || [];
        
        // Get books from admin to get cover images (reads from admin localStorage)
        const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
        
        // Get book data for each notification - handle type mismatch (string vs number)
        const notificationsWithCovers = notifications.map(notif => {
            const book = adminBooks.find(b => String(b.id) === String(notif.bookId));
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
            notificationDropdown.innerHTML = '<p class="px-4 py-3 text-sm text-black text-center">No new notifications</p>';
            return;
        }

        const defaultCover = "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80";
        
        notificationDropdown.innerHTML = notificationsWithCovers.map((notif) => {
            const coverImage = notif.image || defaultCover;
            const date = notif.publishedAt ? new Date(notif.publishedAt).toLocaleDateString() : '';
            
            return `
                <div class="notification-item flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b" onclick="handleNotificationClick(${notif.bookId})">
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

    // Load notifications on hover
    if (notificationBtn && notificationContainer) {
        notificationBtn.addEventListener('mouseenter', () => {
            loadNotifications();
        });
    }

    // Handle notification click - set flag before navigating
    window.handleNotificationClick = function(bookId) {
        sessionStorage.setItem('fromNotificationClick', 'true');
        viewBookDetail(bookId);
    };

    // Mark notifications as seen and remove the clicked one
    function markNotificationAsSeen(bookId) {
        let notifications = JSON.parse(localStorage.getItem('newBookNotifications')) || [];
        notifications = notifications.filter(n => n.bookId !== bookId);
        localStorage.setItem('newBookNotifications', JSON.stringify(notifications));
        if (notificationBadge) {
            const unreadCount = notifications.filter(n => !n.seen).length;
            if (unreadCount > 0) {
                notificationBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            } else {
                notificationBadge.classList.add('hidden');
            }
        }
    }

    // Make viewBookDetail available globally
    window.viewBookDetail = function(bookId) {
        const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
        const book = adminBooks.find(b => String(b.id) === String(bookId));
        if (book) {
            // Mark notification as seen/remove it
            markNotificationAsSeen(bookId);
            
            localStorage.setItem('currentBook', JSON.stringify(book));
            window.location.href = '../detail/index-acc.html?id=' + bookId;
        }
    };

    // Mark all as read button
    const markAllReadBtn = document.getElementById('mark-all-read');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            localStorage.removeItem('newBookNotifications');
            loadNotifications();
        });
    }

    // Load notifications on page load
    loadNotifications();

    // Show notification for new book (only if not from notification click)
    showNewBookNotification();

    // =====================
    // DISPLAY USER EMAIL IN DROPDOWN
    // =====================
    function displayUserEmail() {
        const userEmailDisplay = document.getElementById('user-email-display');
        if (!userEmailDisplay) return;
        
        const currentUser = localStorage.getItem('currentUser') || localStorage.getItem('user');
        
        if (currentUser) {
            try {
                const userObj = JSON.parse(currentUser);
                const displayName = userObj.name || userObj.email || 'User';
                userEmailDisplay.textContent = displayName;
            } catch (e) {
                userEmailDisplay.textContent = currentUser.includes('@') ? currentUser.split('@')[0] : currentUser;
            }
        }
    }
    
    displayUserEmail();

    // =====================
    // MOBILE MENU
    // =====================
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            const expanded = mobileBtn.getAttribute('aria-expanded') === 'true';
            mobileBtn.setAttribute('aria-expanded', String(!expanded));
            mobileMenu.classList.toggle('hidden');
        });
        mobileMenu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                mobileBtn.setAttribute('aria-expanded', 'false');
                mobileMenu.classList.add('hidden');
            });
        });
    }

    // =====================
    // COMMENT SYSTEM
    // =====================
    const commentForm = document.getElementById('comment-form');
    const commentInput = document.getElementById('comment-input');
    const commentsList = document.getElementById('comments-list');

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

    function saveComment(bookId, text) {
        const commentsKey = `bookComments_${bookId}`;
        const existingComments = JSON.parse(localStorage.getItem(commentsKey)) || [];
        
        // Get user info from localStorage
        const currentUser = localStorage.getItem('user') || localStorage.getItem('currentUser') || 'Anonymous User';
        let userName = 'Anonymous User';
        try {
            const userObj = JSON.parse(currentUser);
            userName = userObj.name || userObj.email || 'Anonymous User';
        } catch (e) {
            userName = currentUser.includes('@') ? currentUser.split('@')[0] : 'Anonymous User';
        }
        
        const newComment = {
            id: Date.now(),
            text: text,
            timestamp: new Date().toISOString(),
            user: userName
        };
        
        existingComments.push(newComment);
        localStorage.setItem(commentsKey, JSON.stringify(existingComments));
        
        return newComment;
    }

    function loadComments(bookId) {
        const commentsKey = `bookComments_${bookId}`;
        return JSON.parse(localStorage.getItem(commentsKey)) || [];
    }

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
        
        commentsList.scrollTop = commentsList.scrollHeight;
    }

    // Get book ID for comments
    const commentBookId = getCurrentBookId();
    if (commentsList) {
        const initialComments = loadComments(commentBookId);
        renderComments(initialComments);
    }

    function addComment(text) {
        if (!text) return;
        
        const savedComment = saveComment(commentBookId, text);
        
        if (commentsList.children.length === 1 && commentsList.children[0].classList.contains('text-gray-500')) {
            commentsList.innerHTML = '';
        }
        
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

    // =====================
    // READ MORE BUTTON FOR DESCRIPTION
    // =====================
    const readMoreBtn = document.getElementById('read-more-btn');
    const bookDescription = document.getElementById('book-description');
    
    if (readMoreBtn && bookDescription) {
        // Check if description is long enough to need truncation
        function checkDescriptionLength() {
            if (bookDescription.scrollHeight > bookDescription.clientHeight) {
                readMoreBtn.style.display = 'inline-block';
            } else {
                readMoreBtn.style.display = 'none';
            }
        }
        
        // Toggle expand/collapse
        readMoreBtn.addEventListener('click', () => {
            bookDescription.classList.toggle('expanded');
            if (bookDescription.classList.contains('expanded')) {
                readMoreBtn.textContent = 'Show less';
            } else {
                readMoreBtn.textContent = 'Read more';
            }
        });
        
        // Check on load and after content is set
        setTimeout(checkDescriptionLength, 100);
    }

    // =====================
    // BOOK LOADING (from localStorage)
    // =====================
    
    // Helper functions
    function isNewBook(publishedAt) {
        if (!publishedAt) return false;
        const publishedDate = new Date(publishedAt);
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return publishedDate > sevenDaysAgo;
    }

    function generateRating(views) {
        const viewCount = typeof views === 'number' ? views : parseInt(views) || 0;
        const rating = Math.min(5, Math.ceil(viewCount / 100));
        
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += i <= rating ? '★' : '☆';
        }
        
        let formattedViews;
        if (viewCount >= 1000) {
            formattedViews = (viewCount / 1000).toFixed(1) + 'k';
        } else {
            formattedViews = viewCount.toString();
        }
        
        return { stars: starsHtml, formattedViews: formattedViews };
    }

    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // Validate if URL is valid (also accepts base64 data URLs) - for book covers
    function isValidCoverUrl(url) {
        if (!url || typeof url !== 'string') return false;
        
        // Check if it's a base64 data URL
        if (url.startsWith('data:image/')) {
            return true;
        }
        
        // Check if it's a regular URL
        try {
            new URL(url);
            return url.startsWith('http://') || url.startsWith('https://');
        } catch {
            return false;
        }
    }

    function loadBook() {
        const storedBook = localStorage.getItem('currentBook');
        
        let title, author, status, views, rating, ratingCount, description, cover, editions, bookType;
        
        const params = new URLSearchParams(window.location.search);
        const overrideCover = params.get('cover');
        const bookId = params.get('id');

        // Default cover image for fallback
        const defaultCover = "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80";
        
        // Get book from adminBooks (localStorage from admin panel) - this is the SOURCE OF TRUTH for book covers
        if (bookId) {
            const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
            const adminBook = adminBooks.find(b => String(b.id) === String(bookId));
            
            if (adminBook) {
                // PRIMARY: Get cover from admin dashboard (adminBooks is the source of truth)
                title = adminBook.title || 'Book Title';
                author = adminBook.author || 'Author Name';
                status = adminBook.status || 'Completed';
                views = adminBook.views || 0;
                description = adminBook.description || '';
                editions = adminBook.pages || 200;
                bookType = adminBook.type || 'text'; // Default to text
                const publishedAt = adminBook.pubdate || adminBook.publishedAt;
                
                const ratingData = generateRating(views);
                rating = ratingData.stars;
                ratingCount = `(${ratingData.formattedViews} views)`;
                
                const newBadge = document.getElementById('new-badge');
                if (newBadge && isNewBook(publishedAt)) {
                    newBadge.classList.remove('hidden');
                }
                
                // Set Read Now button href based on book type
                const readBtn = document.getElementById('read-btn');
                if (readBtn) {
                    if (bookType === 'img') {
                        readBtn.href = `../reading/acc-img.html?book=${bookId}&edition=1`;
                    } else {
                        readBtn.href = `../reading/acc-text.html?book=${bookId}&edition=1`;
                    }
                }
                
                // Get cover from admin dashboard - this is the primary source
                // Priority: 1. overrideCover param, 2. adminBook.image (from admin dashboard)
                if (overrideCover && isValidCoverUrl(overrideCover)) {
                    cover = overrideCover;
                } else if (adminBook.image) {
                    cover = adminBook.image;
                } else {
                    cover = defaultCover;
                }
            } else if (storedBook) {
                // Fallback: try currentBook if not found in adminBooks
                const book = JSON.parse(storedBook);
                title = book.title || 'Book Title';
                author = book.author || 'Author Name';
                status = book.status || 'Completed';
                views = book.views || 0;
                description = book.description || '';
                editions = book.pages || 200;
                bookType = book.type || 'text';
                const publishedAt = book.pubdate || book.publishedAt;
                
                const ratingData = generateRating(views);
                rating = ratingData.stars;
                ratingCount = `(${ratingData.formattedViews} views)`;
                
                const readBtn = document.getElementById('read-btn');
                if (readBtn) {
                    if (bookType === 'img') {
                        readBtn.href = `../reading/acc-img.html?book=${book.id || 'default'}&edition=1`;
                    } else {
                        readBtn.href = `../reading/acc-text.html?book=${book.id || 'default'}&edition=1`;
                    }
                }
                
                cover = overrideCover && isValidCoverUrl(overrideCover) ? overrideCover : (book.image || defaultCover);
            } else {
                title = params.get('title') || 'Book Title';
                author = params.get('author') || 'Author Name';
                status = params.get('status') || 'Completed';
                views = params.get('views') || '12.3k';
                rating = params.get('rating') || '★★★★★';
                ratingCount = params.get('ratingCount') || '(1234 reviews)';
                description = params.get('desc') || '';
                cover = overrideCover || params.get('cover') || defaultCover;
                editions = parseInt(params.get('editions')) || 200;
                bookType = 'text';
                
                const readBtn = document.getElementById('read-btn');
                if (readBtn) {
                    readBtn.href = `../reading/acc-text.html?book=${bookId || 'default'}&edition=1`;
                }
            }
        } else if (storedBook) {
            const book = JSON.parse(storedBook);
            title = book.title || 'Book Title';
            author = book.author || 'Author Name';
            status = book.status || 'Completed';
            views = book.views || 0;
            description = book.description || '';
            editions = book.pages || 200;
            bookType = book.type || 'text';
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
                if (bookType === 'img') {
                    readBtn.href = `../reading/acc-img.html?book=${book.id || 'default'}&edition=1`;
                } else {
                    readBtn.href = `../reading/acc-text.html?book=${book.id || 'default'}&edition=1`;
                }
            }
            
            cover = overrideCover && isValidCoverUrl(overrideCover) ? overrideCover : (book.image || defaultCover);
        } else {
            const params = new URLSearchParams(window.location.search);
            title = params.get('title') || 'Book Title';
            author = params.get('author') || 'Author Name';
            status = params.get('status') || 'Completed';
            views = params.get('views') || '12.3k';
            rating = params.get('rating') || '★★★★★';
            ratingCount = params.get('ratingCount') || '(1234 reviews)';
            description = params.get('desc') || '';
            cover = overrideCover || params.get('cover') || defaultCover;
            editions = parseInt(params.get('editions')) || 200;
            bookType = 'text';
            
            const readBtn = document.getElementById('read-btn');
            if (readBtn) {
                readBtn.href = '../reading/acc-text.html?book=default&edition=1';
            }
        }

        // Update DOM elements
        const titleEl = document.getElementById('book-title');
        const authorEl = document.getElementById('book-author');
        const statusEl = document.getElementById('book-status');
        const viewsEl = document.getElementById('book-views');
        const ratingEl = document.getElementById('book-rating');
        const ratingCountEl = document.getElementById('book-rating-count');
        const descEl = document.getElementById('book-description');
        
        if (titleEl) titleEl.textContent = title;
        if (authorEl) authorEl.textContent = `by ${author}`;
        if (statusEl) statusEl.innerHTML = `Status: <strong>${status}</strong>`;
        if (viewsEl) viewsEl.textContent = `Views: ${views}`;
        if (ratingEl) ratingEl.textContent = rating;
        if (ratingCountEl) ratingCountEl.textContent = ratingCount;
        
        // Display description - show default message if empty
        if (descEl) {
            if (description && description.trim() !== '') {
                descEl.textContent = description;
            } else {
                descEl.textContent = 'No description available.';
            }
        }

        // Set book cover - use the defaultCover already defined above
        const bookCoverEl = document.getElementById('book-cover');
        const bookCoverLink = document.getElementById('book-cover-link');
        
        if (bookCoverEl) {
            // Add class to skip lazy loading for this image
            bookCoverEl.classList.add('no-lazy');
            bookCoverEl.src = (cover && isValidCoverUrl(cover)) ? cover : defaultCover;
            bookCoverEl.onerror = function() {
                this.src = defaultCover;
            };
        }
        
        if (bookCoverLink) {
            const readBtn = document.getElementById('read-btn');
            bookCoverLink.href = readBtn ? readBtn.href : `../reading/acc-text.html?book=${bookId || 'default'}&edition=1`;
        }
        
        return editions;
    }

    // =====================
    // editionS/EDITIONS (from localStorage)
    // =====================
    
    let editions = [];
    let editionsCount = 200;
    
    try {
        editionsCount = loadBook();
        
        const storedBook = localStorage.getItem('currentBook');
        if (storedBook) {
            const book = JSON.parse(storedBook);
            editions = book.editions || [];
        }
        
        const params = new URLSearchParams(window.location.search);
        const bookId = params.get('id');
        if (!editions.length && bookId) {
            const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
            const adminBook = adminBooks.find(b => String(b.id) === String(bookId));
            if (adminBook) {
                editions = adminBook.editions || [];
            }
        }
    } catch (e) {
        console.error('Error loading editions:', e);
    }
    
    const totalEditions = editions.length > 0 ? editions.length : editionsCount;
    const pageSize = 6;
    let currentPage = 0;
    const editionList = document.getElementById('edition-list');
    const btnPrev = document.getElementById('chap-prev');
    const btnNext = document.getElementById('chap-next');

    const defaultEditionCover = "https://images.unsplash.com/photo-1543002588-bfa74090ca80?w=80";

    function rendereditions() {
        if (!editionList) return [];
        editionList.innerHTML = '';

        const start = currentPage * pageSize;
        const end = Math.min(editions.length, start + pageSize);
        
        // Show message when no editions
        if (editions.length === 0) {
            editionList.innerHTML = `
                <li class="text-center py-8 text-gray-500">
                    <i class='bx bx-book' style="font-size: 3rem;"></i>
                    <p class="mt-2 font-medium">This book doesn't have any editions</p>
                    <p class="text-sm text-gray-400">Check back later for updates.</p>
                </li>
            `;
            if (btnPrev) btnPrev.disabled = true;
            if (btnNext) btnNext.disabled = true;
            return [];
        }
        
        if (editions.length > 0) {
            for (let i = start; i < end; i++) {
                const edition = editions[i];
                const li = document.createElement('li');
                li.className = "edition-item flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50";
                
                const editionImage = edition.image || defaultEditionCover;
                const editionTitle = edition.title || `Edition ${i + 1}`;
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
                        <a href="index-acc.html?edition=${i + 1}&bookId=${bookId || ''}" class="edition-about px-4 py-2 border-2 border-gray-600 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition">
                            About
                        </a>
                        <a href="../reading/acc-img.html?edition=${i + 1}&bookId=${bookId || ''}" class="edition-read px-4 py-2 bg-black text-white font-semibold rounded-lg hover:opacity-80 transition">
                            Read
                        </a>
                    </div>
                `;
                editionList.appendChild(li);
            }
        }

        if (btnPrev) btnPrev.disabled = currentPage === 0;
        if (btnNext) btnNext.disabled = end >= totalEditions;

        return editionList.querySelectorAll('a');
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                focusFirstedition();
            }
        });
    }
    
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            const maxPage = Math.floor((totalEditions - 1) / pageSize);
            if (currentPage < maxPage) {
                currentPage++;
                focusFirstedition();
            }
        });
    }

    function focusFirstedition() {
        const links = rendereditions();
        if (links.length) links[0].focus();
    }

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

    rendereditions();
    focusFirstedition();
});

