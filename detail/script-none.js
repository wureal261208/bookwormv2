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

    // Helper functions
    function isNewBook(publishedAt) {
        if (!publishedAt) return false;
        const publishedDate = new Date(publishedAt);
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return publishedDate > sevenDaysAgo;
    }

    // Helper function to get book type from tags (same as main/ pages)
    function getBookType(tags) {
        if (tags && tags.includes('img')) {
            return { type: 'img', label: 'Picture Book', icon: 'bx-image', class: 'type-img' };
        }
        return { type: 'text', label: 'Chapter Book', icon: 'bx-book-content', class: 'type-text' };
    }

    function generateRating(views) {
        const viewCount = Number(views) || 0;
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

        let title, author, status, views, rating, ratingCount, description, cover, editions, bookType, bookTags, genre;

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
                editions = (adminBook.editions && Array.isArray(adminBook.editions) && adminBook.editions.length > 0) ? adminBook.editions : (adminBook.pages || 200);
                genre = adminBook.genre || '';
                bookTags = adminBook.tags || []; // Get tags array from adminBooks
                // include genre as a tag as well (if not already present)
                if (genre && !bookTags.includes(genre)) {
                    bookTags.unshift(genre);
                }

                // Use getBookType function like main/ pages
                const bookTypeObj = getBookType(bookTags);
                bookType = bookTypeObj.type;

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
                editions = (book.editions && Array.isArray(book.editions) && book.editions.length > 0) ? book.editions : (book.pages || 200);
                genre = book.genre || '';
                bookTags = book.tags || [];
                if (genre && !bookTags.includes(genre)) {
                    bookTags.unshift(genre);
                }

                const bookTypeObj = getBookType(bookTags);
                bookType = bookTypeObj.type;

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
                bookTags = [];

                const readBtn = document.getElementById('read-btn');
                if (readBtn) {
                    readBtn.href = '../reading/none-text.html?book=default&edition=1';
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
            editions = (book.editions && Array.isArray(book.editions) && book.editions.length > 0) ? book.editions : (book.pages || 200);
            bookTags = book.tags || [];

            const bookTypeObj = getBookType(bookTags);
            bookType = bookTypeObj.type;

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
            bookTags = [];

            const readBtn = document.getElementById('read-btn');
            if (readBtn) {
                readBtn.href = '../reading/none-text.html?book=default&edition=1';
            }
        }

        const titleEl = document.getElementById('book-title');
        const authorEl = document.getElementById('book-author');
        const statusEl = document.getElementById('book-status');
        const viewsEl = document.getElementById('book-views');
        const ratingEl = document.getElementById('book-rating');
        const descEl = document.getElementById('book-description');

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
        // populate tags list (includes values stored via admin panel)
        const tagsContainer = document.getElementById('book-tags-container');
        if (tagsContainer) {
            let list = (bookTags && bookTags.length) ? bookTags : [];
            // remove type keywords, since type has its own colored badge
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
        const bookCoverEl = document.getElementById('book-cover');
        const bookCoverLink = document.getElementById('book-cover-link');

        if (bookCoverEl) {
            bookCoverEl.classList.add('no-lazy');
            bookCoverEl.src = (cover && isValidCoverUrl(cover)) ? cover : defaultCover;
            bookCoverEl.onerror = function () {
                this.src = defaultCover;
            };
        }

        if (bookCoverLink) {
            const readBtn = document.getElementById('read-btn');
            bookCoverLink.href = readBtn ? readBtn.href : `../reading/none-text.html?book=${bookId || 'default'}&edition=1`;
        }

        // RATING STARS DISPLAY
        const ratingRow = document.getElementById('book-rating-row');
        if (ratingRow && ratingRow.innerHTML.trim() === '') {
            ratingRow.innerHTML = `
                <dt class="sr-only">Rating</dt>
                <dd id="book-rating" class="text-yellow-400">${rating || ''}</dd>
            `;
        }

        // ADDITIONAL BOOK METADATA - Load from localStorage (adminBooks)
        loadBookMetadata(bookId, storedBook);

        // BOOK TYPE TAG DISPLAY (txt/img) - using getBookType like main/ pages
        const bookTypeTag = document.getElementById('book-type-tag');
        const bookTypeLabel = document.getElementById('book-type-label');

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

        return editions;
    }

    // =====================
    // EDITIONS (from localStorage)
    // =====================

    let editions = [];
    let editionsCount = 200;

    try {
        editionsCount = loadBook();

        const params = new URLSearchParams(window.location.search);
        const bookId = params.get('id');
        
        // First try to get from currentBook (set when clicking on a book in main page)
        const storedBook = localStorage.getItem('currentBook');
        if (storedBook) {
            const book = JSON.parse(storedBook);
            if (book.editions && Array.isArray(book.editions)) {
                editions = book.editions;
            }
        }
        
        // If no editions from currentBook, try to get from adminBooks using bookId
        if (!editions.length && bookId) {
            const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
            const adminBook = adminBooks.find(b => String(b.id) === String(bookId));
            if (adminBook && adminBook.editions && Array.isArray(adminBook.editions)) {
                editions = adminBook.editions;
            }
        }
        
        // Debug log for editions (can be removed in production)
        console.log('Loaded editions:', editions);
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
    const genreEl = document.getElementById('book-genre');
    if (genreEl) {
        if (genre && genre.trim() !== '') {
            genreEl.classList.remove('hidden');
            genreEl.querySelector('span').textContent = genre;
        } else {
            genreEl.classList.add('hidden');
        }
    }

    // Update Publisher
    const publisherEl = document.getElementById('book-publisher');
    if (publisherEl) {
        if (publisher && publisher.trim() !== '') {
            publisherEl.classList.remove('hidden');
            publisherEl.querySelector('span').textContent = publisher;
        } else {
            publisherEl.classList.add('hidden');
        }
    }

    // Update Publication Date
    const pubdateEl = document.getElementById('book-pubdate');
    if (pubdateEl) {
        if (formattedPubdate && formattedPubdate.trim() !== '') {
            pubdateEl.classList.remove('hidden');
            pubdateEl.querySelector('span').textContent = formattedPubdate;
        } else {
            pubdateEl.classList.add('hidden');
        }
    }

    // Update ISBN
    const isbnEl = document.getElementById('book-isbn');
    if (isbnEl) {
        if (isbn && isbn.trim() !== '') {
            isbnEl.classList.remove('hidden');
            isbnEl.querySelector('span').textContent = isbn;
        } else {
            isbnEl.classList.add('hidden');
        }
    }

    // Update Language
    const languageEl = document.getElementById('book-language');
    if (languageEl) {
        if (language && language.trim() !== '') {
            languageEl.classList.remove('hidden');
            languageEl.querySelector('span').textContent = language;
        } else {
            languageEl.classList.add('hidden');
        }
    }
}
