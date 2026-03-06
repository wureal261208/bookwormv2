// detail/script-none.js
// Script for non-authenticated users (simpler version without notifications, progress bar, comments)
// This script reads from localStorage: adminBooks, currentBook

document.addEventListener('DOMContentLoaded', () => {
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

        // Set book cover
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
        
        if (totalEditions === 0) {
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
                        <a href="index-none.html?edition=${i + 1}&bookId=${bookId || ''}" class="edition-about px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-100">
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
                        <a href="index-none.html?edition=${i + 1}&bookId=${bookId || ''}" class="edition-about px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-100">
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

