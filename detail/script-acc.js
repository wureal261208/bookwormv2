// detail/script-acc.js
// Script for authenticated users (with notifications, progress bar, comments)
// This script reads from localStorage: adminBooks, currentBook, readingProgress

document.addEventListener('DOMContentLoaded', () => {
    // =====================
    // NOTIFICATION SYSTEM (Authenticated Users) - Hover Style
    // =====================
    const notificationBtn = document.getElementById('notification-btn');
    const notificationDropdown = document.getElementById('notification-list');
    const notificationBadge = document.getElementById('notification-badge');
    const notificationContainer = document.getElementById('notification-btn')?.parentElement;

    // Load and display notifications when hovering
    function loadNotifications() {
        if (!notificationDropdown) return;

        // Get notifications from localStorage
        const notifications = JSON.parse(localStorage.getItem('newBookNotifications')) || [];
        
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

    // Load notifications on hover
    if (notificationBtn && notificationContainer) {
        notificationBtn.addEventListener('mouseenter', () => {
            loadNotifications();
        });
    }

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
        const book = adminBooks.find(b => b.id === bookId);
        if (book) {
            // Mark notification as seen/remove it
            markNotificationAsSeen(bookId);
            
            localStorage.setItem('currentBook', JSON.stringify(book));
            window.location.reload();
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

    const currentBookId = getCurrentBookId();
    if (commentsList) {
        const initialComments = loadComments(currentBookId);
        renderComments(initialComments);
    }

    function addComment(text) {
        if (!text) return;
        
        const savedComment = saveComment(currentBookId, text);
        
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

    function loadBook() {
        const storedBook = localStorage.getItem('currentBook');
        
        let title, author, status, views, rating, ratingCount, description, cover, chapters;
        
        const params = new URLSearchParams(window.location.search);
        const overrideCover = params.get('cover');
        const bookId = params.get('id');

        // Get book from adminBooks (localStorage from admin panel)
        if (bookId) {
            const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
            const adminBook = adminBooks.find(b => b.id == bookId);
            
            if (adminBook) {
                title = adminBook.title || 'Book Title';
                author = adminBook.author || 'Author Name';
                status = adminBook.status || 'Completed';
                views = adminBook.views || 0;
                description = adminBook.description || '';
                chapters = adminBook.pages || 200;
                const publishedAt = adminBook.pubdate || adminBook.publishedAt;
                
                const ratingData = generateRating(views);
                rating = ratingData.stars;
                ratingCount = `(${ratingData.formattedViews} views)`;
                
                const newBadge = document.getElementById('new-badge');
                if (newBadge && isNewBook(publishedAt)) {
                    newBadge.classList.remove('hidden');
                }
                
                const readBtn = document.getElementById('read-btn');
                if (readBtn) {
                    readBtn.href = `../reading/index-read-novel.html?book=${bookId}&chapter=1`;
                }
                
                if (overrideCover && isValidUrl(overrideCover)) {
                    cover = overrideCover;
                } else if (adminBook.image) {
                    cover = adminBook.image;
                } else {
                    cover = '';
                }
            } else if (storedBook) {
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
                
                const readBtn = document.getElementById('read-btn');
                if (readBtn) {
                    readBtn.href = `../reading/index-read-novel.html?book=${book.id || 'default'}&chapter=1`;
                }
                
                cover = overrideCover && isValidUrl(overrideCover) ? overrideCover : (book.image || '');
            } else {
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
            
            cover = overrideCover && isValidUrl(overrideCover) ? overrideCover : (book.image || '');
        } else {
            const params = new URLSearchParams(window.location.search);
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
                readBtn.href = '../reading/index-read-novel.html?book=default&chapter=1';
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
        if (descEl) descEl.textContent = description || 'No summary provided.';

        // Set book cover - get from localStorage of the book
        const defaultCover = "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80";
        const bookCoverEl = document.getElementById('book-cover');
        const bookCoverLink = document.getElementById('book-cover-link');
        
        if (bookCoverEl) {
            bookCoverEl.src = (cover && isValidUrl(cover)) ? cover : defaultCover;
            bookCoverEl.onerror = function() {
                this.src = defaultCover;
            };
        }
        
        if (bookCoverLink) {
            const readBtn = document.getElementById('read-btn');
            bookCoverLink.href = readBtn ? readBtn.href : `../reading/index-read-novel.html?book=${bookId || 'default'}&chapter=1`;
        }
        
        return chapters;
    }

    // =====================
    // CHAPTERS/EDITIONS (from localStorage)
    // =====================
    
    let editions = [];
    let chaptersCount = 200;
    
    try {
        chaptersCount = loadBook();
        
        const storedBook = localStorage.getItem('currentBook');
        if (storedBook) {
            const book = JSON.parse(storedBook);
            editions = book.editions || [];
        }
        
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
    
    const totalEditions = editions.length > 0 ? editions.length : chaptersCount;
    const pageSize = 6;
    let currentPage = 0;
    const editionList = document.getElementById('chapter-list');
    const btnPrev = document.getElementById('chap-prev');
    const btnNext = document.getElementById('chap-next');

    const defaultEditionCover = "https://images.unsplash.com/photo-1543002588-bfa74090ca80?w=80";

    function renderChapters() {
        if (!editionList) return [];
        editionList.innerHTML = '';

        const start = currentPage * pageSize;
        const end = Math.min(editions.length, start + pageSize);
        
        // Show message when no editions
        if (editions.length === 0) {
            editionList.innerHTML = `
                <li class="text-center py-8 text-gray-500">
                    <i class='bx bx-book' style="font-size: 3rem;"></i>
                    <p class="mt-2 font-medium">This edition doesn't have a description yet.</p>
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
                        <a href="../reading/index-read-img.html?edition=${i + 1}&bookId=${bookId || ''}" class="edition-read px-4 py-2 bg-black text-white font-semibold rounded-lg hover:opacity-80 transition">
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
    focusFirstChapter();
});

