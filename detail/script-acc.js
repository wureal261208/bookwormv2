-// detail/script-acc.js
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

        const params = new URLSearchParams(window.location.search);
        const currentBookId = params.get('id');

        const fromNotificationClick = sessionStorage.getItem('fromNotificationClick') === 'true';

        if (fromNotificationClick) {
            sessionStorage.removeItem('fromNotificationClick');
        }


        function showToastNotification(bookTitle) {
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

            setTimeout(() => {
                toast.classList.remove('translate-x-full', 'opacity-0');
            }, 100);

            setTimeout(() => {
                toast.classList.add('translate-x-full', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }

        function loadNotifications() {
            if (!notificationDropdown) return;

            let notifications = JSON.parse(localStorage.getItem('newBookNotifications')) || [];
            const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
            
            // Get currently reading books
            const currentlyReading = JSON.parse(localStorage.getItem('currentlyReading')) || [];

            const notificationsWithCovers = notifications.map(notif => {
                const book = adminBooks.find(b => String(b.id) === String(notif.bookId));
                return {
                    ...notif,
                    image: book ? book.image : null
                };
            });

            const unreadCount = notificationsWithCovers.filter(n => !n.seen).length;
            
            // Combine currently reading + new notifications for badge count
            const totalUnread = currentlyReading.length + unreadCount;
            
            if (notificationBadge) {
                if (totalUnread > 0) {
                    notificationBadge.textContent = totalUnread > 9 ? '9+' : totalUnread;
                    notificationBadge.classList.remove('hidden');
                } else {
                    notificationBadge.classList.add('hidden');
                }
            }
            
            const defaultCover = "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80";
            
            // Build notification HTML
            let notificationsHtml = '';
            
            // Add "Currently Reading" section if there are books being read
            if (currentlyReading.length > 0) {
                notificationsHtml += `
                    <div class="px-4 py-2 border-b border-gray-200 bg-blue-50">
                        <p class="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                            <i class='bx bx-book-reader'></i> Currently Reading (${currentlyReading.length})
                        </p>
                    </div>
                `;
                
                currentlyReading.forEach(book => {
                    notificationsHtml += `
                    <div class="notification-item flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200" onclick="handleCurrentlyReadingClick('${book.id}')">
                        <img src="${book.cover || defaultCover}" alt="${book.title}" class="w-12 h-16 object-cover rounded">
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-black truncate">Currently Reading</p>
                            <p class="text-sm font-semibold text-black truncate">${book.title}</p>
                            <p class="text-xs text-gray-600">${book.author || 'Unknown Author'}</p>
                        </div>
                        <span class="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></span>
                    </div>
                `;
                });
            }
            
            // Add "New Books" section if there are new notifications
            if (notificationsWithCovers.length > 0) {
                notificationsHtml += `
                    <div class="px-4 py-2 border-b border-gray-200 ${currentlyReading.length > 0 ? '' : 'bg-gray-50'}">
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            <i class='bx bx-bell'></i> New Books (${notificationsWithCovers.length})
                        </p>
                    </div>
                `;
                
                notificationsHtml += notificationsWithCovers.map((notif) => {
                    const coverImage = notif.image || defaultCover;
                    const date = notif.publishedAt ? new Date(notif.publishedAt).toLocaleDateString() : '';

                    return `
                    <div class="notification-item flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200" onclick="handleNotificationClick(${notif.bookId})">
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
            
            // If no notifications at all
            if (currentlyReading.length === 0 && notificationsWithCovers.length === 0) {
                notificationsHtml = '<p class="px-4 py-3 text-sm text-black text-center">No new notifications</p>';
            }
            
            notificationDropdown.innerHTML = notificationsHtml;
        }
        
        // Function to handle currently reading book click
        window.handleCurrentlyReadingClick = function(bookId) {
            viewBookDetail(bookId);
        };

        if (notificationBtn && notificationContainer) {
            notificationBtn.addEventListener('mouseenter', () => {
                loadNotifications();
            });
        }

        window.handleNotificationClick = function (bookId) {
            sessionStorage.setItem('fromNotificationClick', 'true');
            viewBookDetail(bookId);
        };

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

        window.viewBookDetail = function (bookId) {
            const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
            const book = adminBooks.find(b => String(b.id) === String(bookId));
            if (book) {
                markNotificationAsSeen(bookId);
                localStorage.setItem('currentBook', JSON.stringify(book));
                window.location.href = '../detail/index-acc.html?id=' + bookId;
            }
        };

        const markAllReadBtn = document.getElementById('mark-all-read');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                localStorage.removeItem('newBookNotifications');
                loadNotifications();
            });
        }

        loadNotifications();
        // notifications are generated by admin panel and shown on main page only
        // detail view does not create new notifications to avoid false alerts

        // =====================
        // DISPLAY USER EMAIL IN DROPDOWN
        // =====================
        
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

        function displayUserEmail() {
            const userEmailDisplay = document.getElementById('user-email-display');
            if (!userEmailDisplay) return;

            const currentUser = localStorage.getItem('currentUser') || localStorage.getItem('user');

            if (currentUser) {
                try {
                    const userObj = JSON.parse(currentUser);
                    // Get the email from user object
                    let userEmail = userObj.email || userObj.name || '';
                    if (userEmail) {
                        userEmailDisplay.textContent = shortenEmail(userEmail);
                    } else {
                        userEmailDisplay.textContent = 'User';
                    }
                } catch (e) {
                    // If not JSON, it's a plain string (email)
                    if (currentUser.includes('@')) {
                        userEmailDisplay.textContent = shortenEmail(currentUser);
                    } else {
                        userEmailDisplay.textContent = currentUser;
                    }
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
        const readMoreBtn = document.getElementById('detail-read-more-btn');
        const bookDescription = document.getElementById('detail-book-description');

        if (readMoreBtn && bookDescription) {
            function checkDescriptionLength() {
                if (bookDescription.scrollHeight > bookDescription.clientHeight) {
                    readMoreBtn.style.display = 'inline-block';
                } else {
                    readMoreBtn.style.display = 'none';
                }
            }

            readMoreBtn.addEventListener('click', () => {
                bookDescription.classList.toggle('expanded');
                if (bookDescription.classList.contains('expanded')) {
                    readMoreBtn.textContent = 'Show less';
                } else {
                    readMoreBtn.textContent = 'Read more';
                }
            });

            setTimeout(checkDescriptionLength, 100);
        }

        // =====================
        // BOOK LOADING (from localStorage)
        // =====================

        // Helper function to get book type from tags (same as main/ pages)
        function getBookType(tags) {
            if (tags && tags.includes('img')) {
                return { type: 'img', label: 'Picture Book', icon: 'bx-image', class: 'type-img' };
            }
            return { type: 'text', label: 'Chapter Book', icon: 'bx-book-content', class: 'type-text' };
        }

        function isNewBook(publishedAt) {
            if (!publishedAt) return false;
            const publishedDate = new Date(publishedAt);
            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return publishedDate > sevenDaysAgo;
        }

        function generateRating(views) {
            const viewCount = Number(views) || 0;
            // Always show at least 4 stars, 5 stars if views >= 400
            const ratingNum = viewCount >= 400 ? 5 : 4;
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= ratingNum) {
                    starsHtml += "<i class='bx bxs-star text-yellow-400'></i>";
                } else {
                    starsHtml += "<i class='bx bx-star text-gray-300'></i>";
                }
            }
            return starsHtml;
        }

        function isValidUrl(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        }

        function isValidCoverUrl(url) {
            if (!url || typeof url !== 'string') return false;

            if (url.startsWith('data:image/')) {
                return true;
            }

            try {
                new URL(url);
                return url.startsWith('http://') || url.startsWith('https://');
            } catch {
                return false;
            }
        }

        function loadBook() {
            const storedBook = localStorage.getItem('currentBook');

            let title, author, status, views, rating, ratingCount, description, cover, editions, bookType, bookTags, genre, bookEditionsCount;

            const params = new URLSearchParams(window.location.search);
            const overrideCover = params.get('cover');
            const bookId = params.get('id');

            const defaultCover = "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80";

            // Get book from adminBooks (localStorage from admin panel)
            if (bookId) {
                const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
                const adminBook = adminBooks.find(b => String(b.id) === String(bookId));

                if (adminBook) {
                    title = adminBook.title || 'Book Title';
                    author = adminBook.author || 'Author Name';
                    status = adminBook.status || 'Completed';
                    views = adminBook.views || 0;
                    description = adminBook.description || '';
                // Check for editions array first, then fall back to pages count
                let bookEditionsCount = (adminBook.editions && Array.isArray(adminBook.editions) && adminBook.editions.length > 0) ? adminBook.editions.length : (adminBook.pages || 200);
                    genre = adminBook.genre || '';
                    bookTags = adminBook.tags || []; // Get tags array from adminBooks
                    if (genre && !bookTags.includes(genre)) {
                        bookTags.unshift(genre);
                    }

                    // Use getBookType function like main/ pages
                    const bookTypeObj = getBookType(bookTags);
                    bookType = bookTypeObj.type;

                    const publishedAt = adminBook.pubdate || adminBook.publishedAt;

                    // Generate rating stars
                    rating = generateRating(views);

                    // Set Read Now button href based on book type
                    const readBtn = document.getElementById('detail-read-btn');
                    if (readBtn) {
                        if (bookType === 'img') {
                            readBtn.href = `../reading/acc-img.html?book=${bookId}&edition=1`;
                        } else {
                            readBtn.href = `../reading/acc-text.html?book=${bookId}&edition=1`;
                        }
                    }

                    if (overrideCover && isValidCoverUrl(overrideCover)) {
                        cover = overrideCover;
                    } else if (adminBook.image) {
                        cover = adminBook.image;
                    } else {
                        cover = defaultCover;
                    }
                } else if (storedBook) {
                    const book = JSON.parse(storedBook);
                    title = book.title || 'Book Title';
                    author = book.author || 'Author Name';
                    status = book.status || 'Completed';
                    views = book.views || 0;
                    description = book.description || '';
                    // Check for editions array first, then fall back to pages count
                    bookEditionsCount = (book.editions && Array.isArray(book.editions) && book.editions.length > 0) ? book.editions.length : (book.pages || 200);
                    genre = book.genre || '';
                    bookTags = book.tags || [];
                    if (genre && !bookTags.includes(genre)) {
                        bookTags.unshift(genre);
                    }

                    const bookTypeObj = getBookType(bookTags);
                    bookType = bookTypeObj.type;

                    rating = generateRating(views);

                    const readBtn = document.getElementById('detail-read-btn');
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
                    bookEditionsCount = parseInt(params.get('editions')) || 200;
                    bookType = 'text';
                    bookTags = [];

                    const readBtn = document.getElementById('detail-read-btn');
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
                // Check for editions array first, then fall back to pages count
                bookEditionsCount = (book.editions && Array.isArray(book.editions) && book.editions.length > 0) ? book.editions.length : (book.pages || 200);
                bookTags = book.tags || [];

                const bookTypeObj = getBookType(bookTags);
                bookType = bookTypeObj.type;

                rating = generateRating(views);

                const readBtn = document.getElementById('detail-read-btn');
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
                bookEditionsCount = parseInt(params.get('editions')) || 200;
                bookType = 'text';
                bookTags = [];

                const readBtn = document.getElementById('detail-read-btn');
                if (readBtn) {
                    readBtn.href = '../reading/acc-text.html?book=default&edition=1';
                }
            }

            // Update DOM elements
            const titleEl = document.getElementById('detail-book-title');
            const authorEl = document.getElementById('detail-book-author');
            const statusEl = document.getElementById('detail-book-status');
            const viewsEl = document.getElementById('detail-book-views');
            const ratingEl = document.getElementById('detail-book-rating');
            const descEl = document.getElementById('detail-book-description');

            if (titleEl) titleEl.textContent = title;
            if (authorEl) authorEl.textContent = `by ${author}`;
            if (statusEl) statusEl.innerHTML = `Status: <strong>${status}</strong>`;
            if (viewsEl) viewsEl.innerHTML = `<i class='bx bx-eye'></i> ${views || 0} views`;
            if (ratingEl) ratingEl.innerHTML = rating;

            if (descEl) {
                if (description && description.trim() !== '') {
                    descEl.textContent = description;
                } else {
                    descEl.textContent = 'No description available.';
                }
            }
            // render tags in authenticated detail page
            const tagsContainer = document.getElementById('detail-book-tags-container');
            if (tagsContainer) {
                // pull tags from admin storage as well (already done above) and filter type keywords
                let list = (bookTags && bookTags.length) ? bookTags : [];
                list = list.filter(t => t !== 'img' && t !== 'text');
                if (list.length) {
                    tagsContainer.innerHTML = `
                    <span class="tags-label">Tags:</span>` +
                        list.map(t => `<span class="category-tag">${t}</span>`).join('');
                    tagsContainer.style.display = 'flex';
                } else {
                    tagsContainer.style.display = 'none';
                }
            }

            // Set book cover
            const bookCoverEl = document.getElementById('detail-book-cover');
            const bookCoverLink = document.getElementById('detail-book-cover-link');

            if (bookCoverEl) {
                bookCoverEl.classList.add('no-lazy');
                bookCoverEl.src = (cover && isValidCoverUrl(cover)) ? cover : defaultCover;
                bookCoverEl.onerror = function () {
                    this.src = defaultCover;
                };
            }

            if (bookCoverLink) {
                const readBtn = document.getElementById('detail-read-btn');
                bookCoverLink.href = readBtn ? readBtn.href : `../reading/acc-text.html?book=${bookId || 'default'}&edition=1`;
            }

            // BOOK TYPE TAG DISPLAY (txt/img) - using getBookType like main/ pages
            const bookTypeTag = document.getElementById('detail-book-type-tag');
            const bookTypeLabel = document.getElementById('detail-book-type-label');

            if (bookTypeTag && bookTypeLabel) {
                let finalBookType = 'text';
                let finalBookTags = bookTags || [];

                if (bookId) {
                    const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
                    const adminBook = adminBooks.find(b => String(b.id) === String(bookId));
                    if (adminBook && adminBook.tags) {
                        finalBookTags = adminBook.tags;
                    }
                }

                if (!finalBookTags.length && storedBook) {
                    const book = JSON.parse(storedBook);
                    finalBookTags = book.tags || [];
                }

                // Use getBookType function like main/ pages
                const bookTypeObj = getBookType(finalBookTags);
                finalBookType = bookTypeObj.type;

                if (finalBookType === 'img') {
                    bookTypeTag.classList.remove('type-text', 'hidden');
                    bookTypeTag.classList.add('type-img');
                    bookTypeTag.querySelector('i').className = "bx bx-image";
                    bookTypeLabel.textContent = "Picture";
                } else {
                    bookTypeTag.classList.remove('type-img', 'hidden');
                    bookTypeTag.classList.add('type-text');
                    bookTypeTag.querySelector('i').className = "bx bx-book-content";
                    bookTypeLabel.textContent = "Text";
                }
            }

            // ADDITIONAL BOOK METADATA - Load from localStorage (adminBooks)
            loadBookMetadata(bookId, storedBook);

            return bookEditionsCount;
        }

        // =====================
        // EDITIONS (from localStorage)
        // =====================

        let editions = [];
        let editionsCount = 200;

        const bookId = params.get('id');

            // ===== ADD: GET EDITIONS FROM ADMIN =====
            const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
            const adminBook = adminBooks.find(b => String(b.id) === String(bookId));

            if (adminBook && adminBook.editions && Array.isArray(adminBook.editions)) {
                editions = adminBook.editions;
            }
// ===== END ADD =====

        try {
            editionsCount = loadBook();
// First try to get from currentBook (set when clicking on a book in main page)
            const storedBook = localStorage.getItem('currentBook');
            if (storedBook) {
                const book = JSON.parse(storedBook);
                if (book.editions && Array.isArray(book.editions)) {
                    editions = book.editions;
                }
            }
            
            // If no editions from currentBook, try to get from adminBooks using bookId
            // Use loose equality (==) to handle both string and number ID comparisons
            if (!editions.length && bookId) {
                const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
                const adminBook = adminBooks.find(b => String(b.id) === String(bookId));
                if (adminBook && adminBook.editions && Array.isArray(adminBook.editions)) {
                    editions = adminBook.editions;
                }
            }
            
            // Debug log for editions (can be removed in production)
            console.log('Loaded editions:', editions);
            console.log('Book ID from URL:', bookId);
            console.log('currentBook from localStorage:', storedBook ? JSON.parse(storedBook) : null);
            
            // Debug: Also check adminBooks directly
            const adminBooksDebug = JSON.parse(localStorage.getItem('adminBooks')) || [];
            const adminBookDebug = bookId ? adminBooksDebug.find(b => String(b.id) === String(bookId)) : null;
            console.log('Book from adminBooks:', adminBookDebug);
            console.log('Editions in adminBooks:', adminBookDebug ? adminBookDebug.editions : 'N/A');
        } catch (e) {
            console.error('Error loading editions:', e);
        }

        const totalEditions = editions.length > 0 ? editions.length : editionsCount;
        const pageSize = 6;
        let currentPage = 0;
        const chapterList = document.getElementById('detail-edition-list');
        const btnPrev = document.getElementById('detail-prev');
        const btnNext = document.getElementById('detail-next');

        const defaultEditionCover = "https://images.unsplash.com/photo-1543002588-bfa74090ca80?w=80";

        function renderEditions() {
            if (!chapterList) return [];
            chapterList.innerHTML = '';

            const start = currentPage * pageSize;
            const end = Math.min(editions.length, start + pageSize);

            if (editions.length === 0) {
                chapterList.innerHTML = `
                <li class="edition-item text-center py-8 text-gray-500 border rounded-lg">
                    <i class='bx bx-book' style="font-size: 3rem;"></i>
                    <p class="mt-2 font-medium">This book doesn't have editions</p>
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
                        <a href="../reading/acc-img.html?edition=${i + 1}&bookId=${bookId || ''}" class="edition-read px-4 py-2 font-semibold rounded-lg hover:opacity-80 transition" style="background: linear-gradient(135deg, var(--secondary-color), var(--primary-color)); color: var(--white);">
                            Read
                        </a>
                    </div>
                `;
                    chapterList.appendChild(li);
                }
            }

            if (btnPrev) btnPrev.disabled = currentPage === 0;
            if (btnNext) btnNext.disabled = end >= totalEditions;

            return chapterList.querySelectorAll('a');
        }

        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                if (currentPage > 0) {
                    currentPage--;
                    focusFirstEdition();
                }
            });
        }

        if (btnNext) {
            btnNext.addEventListener('click', () => {
                const maxPage = Math.floor((totalEditions - 1) / pageSize);
                if (currentPage < maxPage) {
                    currentPage++;
                    focusFirstEdition();
                }
            });
        }

        function focusFirstEdition() {
            const links = renderEditions();
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

        renderEditions();
        focusFirstEdition();
    });

// =====================
// LOAD BOOK METADATA (genre, publisher, pubdate, isbn, language)
// =====================
function loadBookMetadata(bookId, storedBook) {
    let genre = '', publisher = '', pubdate = '', isbn = '', language = '';

    // Try to get book data from adminBooks first
    if (bookId) {
        const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
        const adminBook = adminBooks.find(b => String(b.id) === String(bookId));

        if (adminBook) {
            genre = adminBook.genre || '';
            publisher = adminBook.publisher || '';
            pubdate = adminBook.pubdate || '';
            isbn = adminBook.isbn || '';
            language = adminBook.language || '';
        }
    }

    // Fallback to currentBook from localStorage
    if (!genre && !publisher && !pubdate && storedBook) {
        const book = JSON.parse(storedBook);
        genre = book.genre || '';
        publisher = book.publisher || '';
        pubdate = book.pubdate || '';
        isbn = book.isbn || '';
        language = book.language || '';
    }

    // Format publication date
    let formattedPubdate = '';
    if (pubdate) {
        try {
            const date = new Date(pubdate);
            formattedPubdate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            formattedPubdate = pubdate;
        }
    }

    // Update Genre
    const genreEl = document.getElementById('detail-book-genre');
    if (genreEl) {
        if (genre && genre.trim() !== '') {
            genreEl.classList.remove('hidden');
            genreEl.querySelector('span').textContent = genre;
        } else {
            genreEl.classList.add('hidden');
        }
    }

    // Update Publisher
    const publisherEl = document.getElementById('detail-book-publisher');
    if (publisherEl) {
        if (publisher && publisher.trim() !== '') {
            publisherEl.classList.remove('hidden');
            publisherEl.querySelector('span').textContent = publisher;
        } else {
            publisherEl.classList.add('hidden');
        }
    }

    // Update Publication Date
    const pubdateEl = document.getElementById('detail-book-pubdate');
    if (pubdateEl) {
        if (formattedPubdate && formattedPubdate.trim() !== '') {
            pubdateEl.classList.remove('hidden');
            pubdateEl.querySelector('span').textContent = formattedPubdate;
        } else {
            pubdateEl.classList.add('hidden');
        }
    }

    // Update ISBN
    const isbnEl = document.getElementById('detail-book-isbn');
    if (isbnEl) {
        if (isbn && isbn.trim() !== '') {
            isbnEl.classList.remove('hidden');
            isbnEl.querySelector('span').textContent = isbn;
        } else {
            isbnEl.classList.add('hidden');
        }
    }

    // Update Language
    const languageEl = document.getElementById('detail-book-language');
    if (languageEl) {
        if (language && language.trim() !== '') {
            languageEl.classList.remove('hidden');
            languageEl.querySelector('span').textContent = language;
        } else {
            languageEl.classList.add('hidden');
        }
    }
}
