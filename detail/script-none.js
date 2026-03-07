// detail/script-none.js
// Script for non-authenticated users (guest users)
// This script reads from localStorage: adminBooks, currentBook

document.addEventListener('DOMContentLoaded', () => {
    // =====================
    // MOBILE MENU
    // =====================
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
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
        
        // Generate stars HTML using Boxicons (synchronized with main/ pages)
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starsHtml += '<i class=\'bx bxs-star text-yellow-400\'></i>';
            } else {
                starsHtml += '<i class=\'bx bx-star text-gray-300\'></i>';
            }
        }
        
        return starsHtml;
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
                
                // Generate rating stars using Boxicons (synchronized with main/ pages)
                rating = generateRating(views);
                
                // Set Read Now button href based on book type
                const readBtn = document.getElementById('read-btn');
                if (readBtn) {
                    if (bookType === 'img') {
                        readBtn.href = `../reading/none-img.html?book=${bookId}&edition=1`;
                    } else {
                        readBtn.href = `../reading/none-text.html?book=${bookId}&edition=1`;
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
                
                // Generate rating stars using Boxicons (synchronized with main/ pages)
                rating = generateRating(views);
                
                const readBtn = document.getElementById('read-btn');
                if (readBtn) {
                    if (bookType === 'img') {
                        readBtn.href = `../reading/none-img.html?book=${book.id || 'default'}&edition=1`;
                    } else {
                        readBtn.href = `../reading/none-text.html?book=${book.id || 'default'}&edition=1`;
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
                    readBtn.href = `../reading/none-text.html?book=${bookId || 'default'}&edition=1`;
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
            
            // Generate rating stars using Boxicons (synchronized with main/ pages)
            rating = generateRating(views);
            
            const readBtn = document.getElementById('read-btn');
            if (readBtn) {
                if (bookType === 'img') {
                    readBtn.href = `../reading/none-img.html?book=${book.id || 'default'}&edition=1`;
                } else {
                    readBtn.href = `../reading/none-text.html?book=${book.id || 'default'}&edition=1`;
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
                readBtn.href = '../reading/none-text.html?book=default&edition=1';
            }
        }

        // Update DOM elements (no prefix - as in the HTML)
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
        if (viewsEl) viewsEl.innerHTML = `<i class='bx bx-eye'></i> ${views || 0} views`;
        if (ratingEl) ratingEl.textContent = rating;
        
        // Display description - show default message if empty
        if (descEl) {
            if (description && description.trim() !== '') {
                descEl.textContent = description;
            } else {
                descEl.textContent = 'No description available.';
            }
        }

        // Set book cover
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
            bookCoverLink.href = readBtn ? readBtn.href : `../reading/none-text.html?book=${bookId || 'default'}&edition=1`;
        }
        
        return editions;
    }

    // =====================
    // EDITIONS (from localStorage)
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
    const chapterList = document.getElementById('chapter-list');
    const btnPrev = document.getElementById('chap-prev');
    const btnNext = document.getElementById('chap-next');

    const defaultEditionCover = "https://images.unsplash.com/photo-1543002588-bfa74090ca80?w=80";

    function renderEditions() {
        if (!chapterList) return [];
        chapterList.innerHTML = '';

        const start = currentPage * pageSize;
        const end = Math.min(editions.length, start + pageSize);
        
        // Show message when no editions
        if (editions.length === 0) {
            chapterList.innerHTML = `
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
                        <a href="index-none.html?edition=${i + 1}&bookId=${bookId || ''}" class="edition-about px-4 py-2 border-2 border-gray-600 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition">
                            About
                        </a>
                        <a href="../reading/none-img.html?edition=${i + 1}&bookId=${bookId || ''}" class="edition-read px-4 py-2 bg-black text-white font-semibold rounded-lg hover:opacity-80 transition">
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

