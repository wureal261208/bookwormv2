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

    // comment system using form
    const commentForm = document.getElementById('comment-form');
    const commentInput = document.getElementById('comment-input');
    const commentsList = document.getElementById('comments-list');

    function addComment(text) {
        if (!text) return;
        if (commentsList.children.length === 1 && commentsList.children[0].classList.contains('text-gray-500')) {
            commentsList.innerHTML = '';
        }
        const div = document.createElement('div');
        div.className = 'p-2 mb-2 border rounded bg-gray-50';
        div.textContent = text;
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

        if (storedBook) {
            // Use data from localStorage
            const book = JSON.parse(storedBook);
            title = book.title || 'Book Title';
            author = book.author || 'Author Name';
            status = book.status || 'Completed';
            views = book.views || '12.3k';
            rating = '★★★★★';
            ratingCount = '(NEW)';
            description = book.description || '';
            chapters = book.pages || 200;
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
        } else if (bookId) {
            // Try to get book from adminBooks in localStorage
            const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
            const adminBook = adminBooks.find(b => b.id == bookId);
            
            if (adminBook) {
                title = adminBook.title || 'Book Title';
                author = adminBook.author || 'Author Name';
                status = adminBook.status || 'Completed';
                views = adminBook.views || '12.3k';
                rating = '★★★★★';
                ratingCount = '(NEW)';
                description = adminBook.description || '';
                chapters = adminBook.pages || 200;
                cover = (adminBook.image && isValidUrl(adminBook.image)) ? adminBook.image : '';
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
        }

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
        document.getElementById('book-cover').src = cover || defaultCover;
        return chapters;
    }

    // chapters pagination - five rows of six columns per page
    const totalChapters = loadBook();   // uses the returned number
    const pageSize = 30; // six columns × five rows
    let currentPage = 0;
    const chapList = document.getElementById('chapter-list');
    const btnPrev = document.getElementById('chap-prev');
    const btnNext = document.getElementById('chap-next');

    function renderChapters() {
        if (!chapList) return [];
        chapList.innerHTML = '';
        const start = currentPage * pageSize + 1;
        const end = Math.min(totalChapters, start + pageSize - 1);
        const links = [];
        for (let i = start; i <= end; i++) {
            const li = document.createElement('li');
            const a = document.createElement('a');
function renderChapters() {
    if (!chapList) return [];
    chapList.innerHTML = '';

    const start = currentPage * pageSize + 1;
    const end = Math.min(totalChapters, start + pageSize - 1);

    const links = [];

    for (let i = start; i <= end; i++) {
        const li = document.createElement('li');
        const a = document.createElement('a');

        // Điều hướng theo chapter
        if (i === 1) {
            a.href = "../reading/index-read-img.html";
        } else if (i === 2) {
            a.href = "../reading/index-read-novel.html";
        } else {
            a.href = `../reading/index-read-novel.html?chapter=${i}`;
        }

        a.textContent = `Chapter ${i}`;
        a.className = 'text-blue-600 hover:underline focus:outline-none focus:ring';

        li.appendChild(a);
        chapList.appendChild(li);
        links.push(a);
    }

    if (btnPrev) btnPrev.disabled = currentPage === 0;
    if (btnNext) btnNext.disabled = end === totalChapters;

    return links;
}

            a.href = `../reading/index-read-img.html?chapter=${i}`;
            a.textContent = `Chapter ${i}`;
            a.className = 'text-blue-600 hover:underline focus:outline-none focus:ring';
            a.setAttribute('tabindex', '0');
            li.appendChild(a);
            chapList.appendChild(li);
            links.push(a);
        }
        if (btnPrev) btnPrev.disabled = currentPage === 0;
        if (btnNext) btnNext.disabled = end === totalChapters;
        return links;
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
            const maxPage = Math.floor((totalChapters - 1) / pageSize);
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


