// ═════════════════════════════════════════════════════════════
// Admin Dashboard Script
// ═════════════════════════════════════════════════════════════

// API Configuration
const BASE_URL = 'https://openlibrary.org/search.json?q=';
const API_OPTIONS = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
};

// ═════════════════════════════════════════════════════════════
// IMAGE UPLOAD FUNCTIONS
// ═════════════════════════════════════════════════════════════

// Function to handle image file upload and convert to base64
function handleImageUpload(input, urlFieldId, previewId) {
    const file = input.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showNotification('Please select a valid image file (JPEG, PNG, GIF, or WebP)', 'error');
        return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        showNotification('Image file is too large. Maximum size is 5MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Image = e.target.result;
        // Set the URL field value to the base64 image
        const urlField = document.getElementById(urlFieldId);
        if (urlField) {
            urlField.value = base64Image;
        }
        // Show preview
        showImagePreview(base64Image, previewId);
    };
    reader.onerror = function() {
        showNotification('Failed to read image file', 'error');
    };
    reader.readAsDataURL(file);
}

// Function to show image preview
function showImagePreview(imageSrc, previewId) {
    const preview = document.getElementById(previewId);
    if (preview) {
        preview.innerHTML = `<img src="${imageSrc}" alt="Image Preview">`;
    }
}

// Function to preview image from URL
function previewImage(input, previewId) {
    const url = input.value.trim();
    if (url && isValidCoverUrl(url)) {
        showImagePreview(url, previewId);
    } else if (!url) {
        clearImageUpload(input.id, previewId);
    }
}

// Function to clear image upload
function clearImageUpload(urlFieldId, previewId) {
    const urlField = document.getElementById(urlFieldId);
    const preview = document.getElementById(previewId);
    const fileInput = document.getElementById(urlFieldId + '-file');
    
    if (urlField) {
        urlField.value = '';
    }
    if (preview) {
        preview.innerHTML = '';
    }
    if (fileInput) {
        fileInput.value = '';
    }
}

// Demo data - will be replaced with Firebase data
// Load books from localStorage if available, otherwise use default data
let books = JSON.parse(localStorage.getItem('adminBooks')) || [
    { id: 1, title: "The Name of the Wind", author: "Patrick Rothfuss", genre: "Fantasy", pages: 662, status: "published", image: "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80" },
    { id: 2, title: "The Wise Man's Fear", author: "Patrick Rothfuss", genre: "Fantasy", pages: 994, status: "published", image: "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80" },
    { id: 3, title: "The Slow Regard of Silent Things", author: "Patrick Rothfuss", genre: "Fantasy", pages: 176, status: "draft", image: "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80" },
    { id: 4, title: "A Court of Thorns and Roses", author: "Sarah J. Maas", genre: "Fantasy", pages: 419, status: "published", image: "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80" },
    { id: 5, title: "Atomic Habits", author: "James Clear", genre: "Self-Help", pages: 320, status: "draft", image: "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80" }
];

// Function to save books to localStorage
function saveBooksToStorage() {
    localStorage.setItem('adminBooks', JSON.stringify(books));
}

// ═════════════════════════════════════════════════════════════
// BOOK COVER LOCALSTORAGE MANAGEMENT
// ═════════════════════════════════════════════════════════════

// Default cover images for fallback
const DEFAULT_COVERS = [
    "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80",
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80",
    "https://images.unsplash.com/photo-1476275466078-4007374efbbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80"
];

// Get default cover image
function getDefaultCover() {
    return DEFAULT_COVERS[0];
}

// Get random default cover
function getRandomDefaultCover() {
    return DEFAULT_COVERS[Math.floor(Math.random() * DEFAULT_COVERS.length)];
}

// Validate if URL is valid (also accepts base64 data URLs)
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

// Get book cover from localStorage
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

// Save book cover to localStorage
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

// Get all book covers from localStorage (returns array of cover URLs)
function getAllBookCovers() {
    const storedBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
    return storedBooks.map(book => ({
        id: book.id,
        title: book.title,
        image: isValidCoverUrl(book.image) ? book.image : getDefaultCover()
    }));
}

// Function to add a new edition input row
function addEditionRow() {
    const container = document.getElementById('edition-container');
    const row = document.createElement('div');
    row.className = 'edition-input-row';
    row.innerHTML = `
        <input type="text" class="edition-title" placeholder="Edition Title">
        <input type="url" class="edition-image" placeholder="Edition Image URL (optional)">
        <button type="button" class="btn-remove-edition" onclick="removeEditionRow(this)">
            <i class='bx bx-trash'></i>
        </button>
    `;
    container.appendChild(row);
}

// Function to toggle edition section visibility (Add Book modal)
function toggleEditionSection() {
    const checkbox = document.getElementById('has-editions');
    const container = document.getElementById('edition-container');
    const addBtn = document.getElementById('btn-add-edition');
    
    if (checkbox.checked) {
        container.style.display = 'block';
        addBtn.style.display = 'block';
    } else {
        container.style.display = 'none';
        addBtn.style.display = 'none';
        // Clear any editions when toggled off
        clearEditionsForm();
    }
}

// Function to remove a edition input row
function removeEditionRow(button) {
    const container = document.getElementById('edition-container');
    const rows = container.querySelectorAll('.edition-input-row');
    if (rows.length > 1) {
        button.parentElement.remove();
    } else {
        // Since editions are optional, just clear the row instead of showing error
        const row = button.parentElement;
        row.querySelector('.edition-title').value = '';
        row.querySelector('.edition-image').value = '';
    }
}

// Function to collect editions from input fields
function collectEditions() {
    const checkbox = document.getElementById('has-editions');
    const editionInputs = document.querySelectorAll('.edition-title');
    const editionImages = document.querySelectorAll('.edition-image');
    const editions = [];
    
    // If checkbox is not checked, return empty array (no editions)
    if (!checkbox || !checkbox.checked) {
        return editions;
    }
    
    editionInputs.forEach((input, index) => {
        if (input.value.trim()) {
            const imageInput = editionImages[index];
            editions.push({
                number: index + 1,
                title: input.value.trim(),
                image: imageInput && imageInput.value.trim() ? imageInput.value.trim() : ''
            });
        }
    });
    return editions;
}

// Clear editions form when modal closes
function clearEditionsForm() {
    const container = document.getElementById('edition-container');
    const checkbox = document.getElementById('has-editions');
    
    // Reset checkbox
    if (checkbox) {
        checkbox.checked = false;
    }
    
    // Hide edition rows
    container.style.display = 'none';
    const addBtn = document.getElementById('btn-add-edition');
    if (addBtn) {
        addBtn.style.display = 'none';
    }
    
    // Reset the container with one empty row
    container.innerHTML = `
        <div class="edition-input-row">
            <input type="text" class="edition-title" placeholder="Edition Title">
            <input type="url" class="edition-image" placeholder="Edition Image URL (optional)">
            <button type="button" class="btn-remove-edition" onclick="removeEditionRow(this)">
                <i class='bx bx-trash'></i>
            </button>
        </div>
    `;
}

// ═════════════════════════════════════════════════════════════
// FORM VALIDATION FUNCTIONS
// ═════════════════════════════════════════════════════════════

// Validation helper functions
const ValidationUtils = {
    // Validate required field
    required: (value) => {
        if (!value || value.trim() === '') {
            return 'This field is required';
        }
        return null;
    },

    // Validate ISBN (both ISBN-10 and ISBN-13)
    isbn: (value) => {
        if (!value || value.trim() === '') return null; // ISBN is optional
        
        const cleanISBN = value.replace(/[-\s]/g, '');
        
        // ISBN-10 validation
        if (cleanISBN.length === 10) {
            if (!/^\d{9}[\dXx]$/.test(cleanISBN)) {
                return 'Invalid ISBN-10 format';
            }
            return null;
        }
        
        // ISBN-13 validation
        if (cleanISBN.length === 13) {
            if (!/^\d{13}$/.test(cleanISBN)) {
                return 'Invalid ISBN-13 format';
            }
            return null;
        }
        
        return 'ISBN must be 10 or 13 digits';
    },

    // Validate URL
    url: (value) => {
        if (!value || value.trim() === '') return null; // URL is optional
        
        try {
            new URL(value);
            return null;
        } catch (e) {
            return 'Please enter a valid URL (starting with http:// or https://)';
        }
    },

    // Validate page number
    pages: (value) => {
        if (!value || value.trim() === '') {
            return 'Number of pages is required';
        }
        
        const num = parseInt(value);
        if (isNaN(num) || num < 1) {
            return 'Pages must be a positive number';
        }
        
        if (num > 10000) {
            return 'Pages cannot exceed 10,000';
        }
        
        return null;
    },

    // Validate title length
    title: (value) => {
        if (!value || value.trim() === '') {
            return 'Book title is required';
        }
        
        if (value.trim().length < 2) {
            return 'Title must be at least 2 characters';
        }
        
        if (value.trim().length > 200) {
            return 'Title cannot exceed 200 characters';
        }
        
        return null;
    },

    // Validate author name
    author: (value) => {
        if (!value || value.trim() === '') {
            return 'Author name is required';
        }
        
        if (value.trim().length < 2) {
            return 'Author name must be at least 2 characters';
        }
        
        if (value.trim().length > 100) {
            return 'Author name cannot exceed 100 characters';
        }
        
        return null;
    },

    // Validate genre
    genre: (value) => {
        if (!value || value.trim() === '') {
            return 'Genre is required';
        }
        
        if (value.trim().length > 50) {
            return 'Genre cannot exceed 50 characters';
        }
        
        return null;
    },

    // Validate description length
    description: (value) => {
        if (!value) return null;
        
        if (value.length > 2000) {
            return 'Description cannot exceed 2,000 characters';
        }
        
        return null;
    },

    // Validate book type
    bookType: (value) => {
        if (!value || value.trim() === '') {
            return 'Book type is required';
        }
        
        const validTypes = ['img', 'text'];
        if (!validTypes.includes(value.trim())) {
            return 'Book type must be either "img" (Picture Book) or "text" (Chapter Book)';
        }
        
        return null;
    }
};

// Function to show validation error on a field
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    // Remove any existing error message
    removeFieldError(fieldId);
    
    // Add error class
    field.classList.add('error');
    field.classList.remove('success');
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.id = `${fieldId}-error`;
    errorDiv.innerHTML = `<i class='bx bx-error-circle'></i> ${message}`;
    
    // Insert after the field
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
    
    // Add shake animation
    field.style.animation = 'none';
    field.offsetHeight; // Trigger reflow
    field.style.animation = 'shake 0.3s ease';
}

// Function to show field success
function showFieldSuccess(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    // Remove any existing error message
    removeFieldError(fieldId);
    
    // Add success class
    field.classList.remove('error');
    field.classList.add('success');
}

// Function to remove field error
function removeFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    field.classList.remove('error');
    field.classList.remove('success');
    
    const errorDiv = document.getElementById(`${fieldId}-error`);
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Function to validate a single field
function validateField(fieldId, validationFn) {
    const field = document.getElementById(fieldId);
    if (!field) return true;
    
    const value = field.value;
    const error = validationFn(value);
    
    if (error) {
        showFieldError(fieldId, error);
        return false;
    } else if (value && value.trim()) {
        showFieldSuccess(fieldId);
        return true;
    }
    
    return true;
}

// Function to clear all form validation
function clearFormValidation(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        removeFieldError(input.id);
    });
}

// Function to check for duplicate book title
function checkDuplicateTitle(title) {
    const existingBook = books.find(b => 
        b.title.toLowerCase().trim() === title.toLowerCase().trim()
    );
    
    return existingBook;
}

// Function to show duplicate warning
function showDuplicateWarning(existingBook) {
    // Remove any existing warning
    const existingWarning = document.querySelector('.duplicate-warning');
    if (existingWarning) {
        existingWarning.remove();
    }
    
    const form = document.querySelector('.modal-form');
    const firstFormGroup = form.querySelector('.form-group');
    
    const warningDiv = document.createElement('div');
    warningDiv.className = 'duplicate-warning';
    warningDiv.innerHTML = `
        <i class='bx bx-warning'></i>
        <span>A book with similar title "<strong>${existingBook.title}</strong>" already exists. 
        Consider adding a different edition or verifying the title.</span>
    `;
    
    form.insertBefore(warningDiv, firstFormGroup);
}

// Function to remove duplicate warning
function removeDuplicateWarning() {
    const warning = document.querySelector('.duplicate-warning');
    if (warning) {
        warning.remove();
    }
}

// Add CSS for shake animation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-5px); }
        40%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyle);

// Initialize real-time validation listeners
function initValidationListeners() {
    const fields = [
        { id: 'book-title', validator: ValidationUtils.title },
        { id: 'book-author', validator: ValidationUtils.author },
        { id: 'book-image', validator: ValidationUtils.url },
        { id: 'book-genre', validator: ValidationUtils.genre },
        { id: 'book-pages', validator: ValidationUtils.pages },
        { id: 'book-description', validator: ValidationUtils.description },
        { id: 'book-type', validator: ValidationUtils.bookType },
        { id: 'book-isbn', validator: ValidationUtils.isbn }
    ];
    
    fields.forEach(field => {
        const element = document.getElementById(field.id);
        if (!element) return;
        
        // Validate on blur
        element.addEventListener('blur', () => {
            validateField(field.id, field.validator);
        });
        
        // Validate on input (with debounce for better performance)
        let debounceTimer;
        element.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                validateField(field.id, field.validator);
            }, 500);
        });
        
        // Clear error on focus
        element.addEventListener('focus', () => {
            removeFieldError(field.id);
            removeDuplicateWarning();
        });
    });
}

// Enhanced addBook function with validation
function addBook(event) {
    event.preventDefault();
    
    // Get form values
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const imageUrl = document.getElementById('book-image').value.trim();
    const genre = document.getElementById('book-genre').value.trim();
    const pages = document.getElementById('book-pages').value;
    const description = document.getElementById('book-description').value.trim();
    const bookType = document.getElementById('book-type').value;
    const publisher = document.getElementById('book-publisher').value.trim();
    const pubdate = document.getElementById('book-pubdate').value;
    const isbn = document.getElementById('book-isbn').value.trim();
    const language = document.getElementById('book-language').value;
    const status = document.getElementById('book-status').value;
    
    // Validate all required fields first
    const validations = [
        { id: 'book-title', validator: ValidationUtils.title },
        { id: 'book-author', validator: ValidationUtils.author },
        { id: 'book-genre', validator: ValidationUtils.genre },
        { id: 'book-pages', validator: ValidationUtils.pages },
        { id: 'book-image', validator: ValidationUtils.url },
        { id: 'book-description', validator: ValidationUtils.description },
        { id: 'book-type', validator: ValidationUtils.bookType },
        { id: 'book-isbn', validator: ValidationUtils.isbn }
    ];
    
    let hasErrors = false;
    
    // Validate all fields
    validations.forEach(({ id, validator }) => {
        if (!validateField(id, validator)) {
            hasErrors = true;
        }
    });
    
    // If there are validation errors, stop
    if (hasErrors) {
        showNotification('Please fix the validation errors before submitting', 'error');
        
        // Focus on first error field
        const firstError = document.querySelector('.modal-form input.error');
        if (firstError) {
            firstError.focus();
        }
        return;
    }
    
    // Check for duplicate title
    const duplicateBook = checkDuplicateTitle(title);
    if (duplicateBook) {
        showDuplicateWarning(duplicateBook);
        showNotification('A book with similar title already exists!', 'warning');
        document.getElementById('book-title').focus();
        return;
    }
    
    // Remove duplicate warning if exists
    removeDuplicateWarning();
    
    // Collect editions
    const editions = collectEditions();
    
    // Use localStorage helper functions for cover image management
    const finalImage = isValidCoverUrl(imageUrl) ? imageUrl : getDefaultCover();
    if (imageUrl && finalImage === getDefaultCover()) {
        showNotification('Invalid image URL. Using default cover.', 'warning');
    }
    
    // Add loading state to button
    const saveBtn = document.querySelector('.btn-save');
    if (saveBtn) {
        saveBtn.classList.add('loading');
        saveBtn.disabled = true;
    }
    
    // Simulate a small delay for better UX
    setTimeout(() => {
        const newBook = {
            id: Date.now(),
            title,
            author,
            image: finalImage,
            genre,
            pages: parseInt(pages),
            status,
            editions,
            // Additional fields (optional)
            description: description || '',
            tags: [bookType], // Store book type as single-element array
            publisher: publisher || '',
            pubdate: pubdate || '',
            isbn: isbn || '',
            language: language || 'English',
            // Metadata
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        books.push(newBook);
        saveBooksToStorage();
        renderBooks();
        updateStatsCards();
        closeModal('book');
        event.target.reset();
        clearEditionsForm();
        clearFormValidation('book-modal');
        
        // Remove loading state
        if (saveBtn) {
            saveBtn.classList.remove('loading');
            saveBtn.disabled = false;
        }
        
        showNotification(`Book "${title}" added successfully with ${editions.length} edition(s)!`, 'success');
    }, 500);
}

// Function to shorten email for display
function shortenEmail(email) {
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    
    const username = parts[0];
    const domain = parts[1];
    
    if (username.length <= 3) {
        return username.substring(0, 1) + '...' + '@' + domain;
    }
    return username.substring(0, 3) + '...' + '@' + domain;
}

let currentRole = 'admin';
let currentUser = null;

// ═════════════════════════════════════════════════════════════
// INITIALIZATION
// ═════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadData();
    // Initialize validation listeners
    initValidationListeners();
    // show overview by default
    navigateTo('overview');
});

// ═════════════════════════════════════════════════════════════
// AUTHENTICATION - Hardcoded Credentials
// ═════════════════════════════════════════════════════════════

// Admin credentials
const ADMIN_CREDENTIALS = {
    username: 'admin@bookworm.com',
    password: 'Admin123'
};

// Function to authenticate user
function authenticateUser(username, password) {
    // Check admin credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        return { user: ADMIN_CREDENTIALS.username, role: 'admin' };
    }
    // Check users from localStorage
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === username.toLowerCase() && u.password === password);
    if (user) {
        return { user: user.email, role: user.role };
    }
    // Invalid credentials
    return null;
}

// Function to show login prompt
function showLoginPrompt() {
    const username = prompt('Enter your username/email:');
    if (!username) {
        alert('Username is required!');
        window.location.href = '../login/index.html';
        return null;
    }
    
    const password = prompt('Enter your password:');
    if (!password) {
        alert('Password is required!');
        window.location.href = '../login/index.html';
        return null;
    }
    
    const authResult = authenticateUser(username, password);
    
    if (authResult) {
        // Save to localStorage
        localStorage.setItem('user', authResult.user);
        localStorage.setItem('userRole', authResult.role);
        // Mark as first login to ensure dashboard is shown
        localStorage.setItem('firstLogin', 'true');
        showNotification('Login successful! Welcome ' + username.split('@')[0], 'success');
        return authResult;
    } else {
        alert('Invalid username or password!');
        window.location.href = '../login/index.html';
        return null;
    }
}

// Check authentication
function checkAuth() {
    let user = localStorage.getItem('user');
    let role = localStorage.getItem('userRole');
    
    // If no user in localStorage, show login prompt
    if (!user) {
        const authResult = showLoginPrompt();
        if (!authResult) {
            return; // Redirect happened in showLoginPrompt
        }
        user = authResult.user;
        role = authResult.role;
    }
    
    currentUser = user;
    currentRole = role || 'admin';
    
    document.getElementById('user-name').textContent = user.split('@')[0];
    document.getElementById('user-role').textContent = currentRole === 'admin' ? 'Administrator' : 'Editor';
    
    updateRoleToggle();
}

// Load initial data
function loadData() {
    // refresh books array from localStorage so that covers and other fields persist
    const stored = JSON.parse(localStorage.getItem('adminBooks'));
    if (stored && Array.isArray(stored)) {
        books = stored;
    }

    renderBooks();
    renderEditors();
    renderStats();
    renderUsers();
    updateStatsCards();
}

// ═════════════════════════════════════════════════════════════
// ROLE SWITCHING
// ═════════════════════════════════════════════════════════════

function switchRole(role) {
    currentRole = role;
    updateRoleToggle();
    loadData();
}

// responsive sidebar toggle for mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    sidebar.classList.toggle('open');
}

// close sidebar when clicking outside on small screens
document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.admin-sidebar');
    const toggle = document.querySelector('.sidebar-toggle');
    if (sidebar && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    }
});

function updateRoleToggle() {
    const adminBtn = document.getElementById('btn-admin');
    if (adminBtn) {
        adminBtn.classList.add('active');
    }
}

// ═════════════════════════════════════════════════════════════
// BOOKS MANAGEMENT
// ═════════════════════════════════════════════════════════════

// Search state
let currentSearchQuery = '';
let filteredBooks = [];

function renderBooks() {
    const container = document.getElementById('books-list');
    if (!container) return;
    
    // Use filtered books if there's a search query, otherwise use all books
    const booksToRender = currentSearchQuery ? filteredBooks : books;
    
    if (booksToRender.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-book'></i>
                <p>${currentSearchQuery ? 'No books match your search.' : 'No books yet. Add your first book!'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = booksToRender.map(book => `
        <div class="book-item">
            <!-- cover URL comes from localStorage using getBookCover helper -->
            <img src="${getBookCover(book.id)}" alt="${book.title}">
            <div class="book-info">
                <div class="book-title">${highlightMatch(book.title, currentSearchQuery)}</div>
                <div class="book-author">${highlightMatch(book.author, currentSearchQuery)}</div>
            </div>
            <span class="book-status ${book.status}">${book.status === 'published' ? 'Published' : 'Draft'}</span>
            <div class="book-actions">
                <button class="btn-edit" onclick="openEditModal(${book.id})" title="Edit">
                    <i class='bx bx-edit'></i>
                </button>
                ${currentRole === 'admin' ? `
                    <button class="btn-publish" onclick="toggleBookStatus(${book.id})" title="${book.status === 'published' ? 'Unpublish' : 'Publish'}">
                        <i class='bx ${book.status === 'published' ? 'bx-bookmark-minus' : 'bx-bookmark-plus'}'></i>
                    </button>
                    <button class="btn-remove" onclick="removeBook(${book.id})" title="Remove">
                        <i class='bx bx-trash'></i>
                    </button>
                ` : `
                    <button class="btn-publish" onclick="toggleBookStatus(${book.id})" title="Publish">
                        <i class='bx bx-bookmark-plus'></i>
                    </button>
                `}
            </div>
        </div>
    `).join('');
}

// Function to highlight matching text
function highlightMatch(text, query) {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    return text.replace(regex, '<match>$1</match>');
}

// Function to escape special regex characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Search books function
function searchBooks(query) {
    currentSearchQuery = query.trim().toLowerCase();
    
    const searchContainer = document.querySelector('.search-container');
    const searchResultsInfo = document.getElementById('search-results-info');
    
    // Toggle clear button visibility
    if (currentSearchQuery) {
        searchContainer.classList.add('has-value');
    } else {
        searchContainer.classList.remove('has-value');
    }
    
    if (!currentSearchQuery) {
        // Clear search - show all books
        filteredBooks = [];
        searchResultsInfo.classList.remove('show');
        renderBooks();
        return;
    }
    
    // Filter books by title, author, or genre
    filteredBooks = books.filter(book => {
        const titleMatch = book.title && book.title.toLowerCase().includes(currentSearchQuery);
        const authorMatch = book.author && book.author.toLowerCase().includes(currentSearchQuery);
        const genreMatch = book.genre && book.genre.toLowerCase().includes(currentSearchQuery);
        
        return titleMatch || authorMatch || genreMatch;
    });
    
    // Update search results info
    searchResultsInfo.innerHTML = `Found <span>${filteredBooks.length}</span> book(s) matching "${query}"`;
    searchResultsInfo.classList.add('show');
    
    renderBooks();
}

// Clear search function
function clearSearch() {
    const searchInput = document.getElementById('book-search');
    searchInput.value = '';
    searchBooks('');
    searchInput.focus();
}

function openModal(type) {
    if (type === 'book') {
        document.getElementById('book-modal').classList.add('active');
        // Clear validation when opening modal
        clearFormValidation('book-modal');
        removeDuplicateWarning();
        // Clear image fields and preview
        document.getElementById('book-image').value = '';
        document.getElementById('book-image-preview').innerHTML = '';
    }
}

function closeModal(type) {
    if (type === 'book') {
        document.getElementById('book-modal').classList.remove('active');
        clearEditionsForm(); // Clear editions when modal closes
        clearFormValidation('book-modal'); // Clear validation when modal closes
        removeDuplicateWarning(); // Remove duplicate warning if exists
        // Clear image preview
        document.getElementById('book-image-preview').innerHTML = '';
    }
    if (type === 'edit-book') {
        document.getElementById('edit-book-modal').classList.remove('active');
        clearEditEditionsForm(); // Clear editions when edit modal closes
        clearFormValidation('edit-book-modal'); // Clear validation when modal closes
        // Clear image preview
        document.getElementById('edit-book-image-preview').innerHTML = '';
    }
}

function addBook(event) {
    event.preventDefault();
    
    // Get form values
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const imageUrl = document.getElementById('book-image').value.trim();
    const genre = document.getElementById('book-genre').value.trim();
    const pages = document.getElementById('book-pages').value;
    const description = document.getElementById('book-description').value.trim();
    const bookType = document.getElementById('book-type').value;
    const publisher = document.getElementById('book-publisher').value.trim();
    const pubdate = document.getElementById('book-pubdate').value;
    const isbn = document.getElementById('book-isbn').value.trim();
    const language = document.getElementById('book-language').value;
    const status = document.getElementById('book-status').value;
    
    // Collect editions
    const editions = collectEditions();
    
    // Use localStorage helper functions for cover image management
    const finalImage = isValidCoverUrl(imageUrl) ? imageUrl : getDefaultCover();
    if (imageUrl && finalImage === getDefaultCover()) {
        showNotification('Invalid image URL. Using default cover.', 'warning');
    }

    const newBook = {
        id: Date.now(),
        title,
        author,
        image: finalImage,
        genre,
        pages: parseInt(pages),
        status,
        editions,
        // Additional fields (optional)
        description: description || '',
        tags: [bookType], // Store book type as single-element array
        publisher: publisher || '',
        pubdate: pubdate || '',
        isbn: isbn || '',
        language: language || 'English',
        // Metadata
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    books.push(newBook);
    saveBooksToStorage();
    renderBooks();
    updateStatsCards();
    closeModal('book');
    event.target.reset();
    clearEditionsForm();
    showNotification(`Book "${title}" added successfully with ${editions.length} edition(s)!`, 'success');
}

// ═════════════════════════════════════════════════════════════
// EDIT BOOK FUNCTIONS
// ═════════════════════════════════════════════════════════════

// Function to open edit modal and populate form with book data
function openEditModal(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) {
        showNotification('Book not found!', 'error');
        return;
    }
    
    // Store book ID in hidden field
    document.getElementById('edit-book-id').value = bookId;
    
    // Populate form fields
    document.getElementById('edit-book-title').value = book.title || '';
    document.getElementById('edit-book-author').value = book.author || '';
    document.getElementById('edit-book-image').value = book.image || '';
    document.getElementById('edit-book-genre').value = book.genre || '';
    document.getElementById('edit-book-pages').value = book.pages || '';
    document.getElementById('edit-book-description').value = book.description || '';
    // Get book type from tags array (first element) or default to 'text'
    const bookType = book.tags && book.tags.length > 0 ? book.tags[0] : 'text';
    document.getElementById('edit-book-type').value = bookType;
    document.getElementById('edit-book-publisher').value = book.publisher || '';
    document.getElementById('edit-book-pubdate').value = book.pubdate || '';
    document.getElementById('edit-book-isbn').value = book.isbn || '';
    document.getElementById('edit-book-language').value = book.language || 'English';
    document.getElementById('edit-book-status').value = book.status || 'draft';
    
    // Show image preview for existing book image
    if (book.image) {
        showImagePreview(book.image, 'edit-book-image-preview');
    } else {
        document.getElementById('edit-book-image-preview').innerHTML = '';
    }
    
    // Populate editions
    populateEditEditions(book.editions || []);
    
    // Show modal
    document.getElementById('edit-book-modal').classList.add('active');
}

// Function to populate editions in edit modal
function populateEditEditions(editions) {
    const container = document.getElementById('edit-edition-container');
    const checkbox = document.getElementById('edit-has-editions');
    const addBtn = document.getElementById('btn-edit-add-edition');
    
    // If there are editions or editions array exists, check the checkbox and show
    if (editions && editions.length > 0) {
        if (checkbox) checkbox.checked = true;
        container.style.display = 'block';
        if (addBtn) addBtn.style.display = 'block';
    } else {
        if (checkbox) checkbox.checked = false;
        container.style.display = 'none';
        if (addBtn) addBtn.style.display = 'none';
    }
    
    if (!editions || editions.length === 0) {
        // Add one empty edition row if no editions exist
        container.innerHTML = `
            <div class="edition-input-row">
                <input type="text" class="edition-title" placeholder="Edition Title">
                <input type="url" class="edition-image" placeholder="Edition Image URL (optional)">
                <button type="button" class="btn-remove-edition" onclick="removeEditEditionRow(this)">
                    <i class='bx bx-trash'></i>
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = editions.map((edition, index) => `
        <div class="edition-input-row">
            <input type="text" class="edition-title" placeholder="Edition Title" value="${edition.title || ''}">
            <input type="url" class="edition-image" placeholder="Edition Image URL (optional)" value="${edition.image || ''}">
            <input type="hidden" class="edition-index" value="${index}">
            <button type="button" class="btn-remove-edition" onclick="deleteExistingEdition(${index})" title="Remove Edition">
                <i class='bx bx-trash'></i>
            </button>
        </div>
    `).join('');
}

// Function to toggle edition section visibility (Edit Book modal)
function toggleEditEditionSection() {
    const checkbox = document.getElementById('edit-has-editions');
    const container = document.getElementById('edit-edition-container');
    const addBtn = document.getElementById('btn-edit-add-edition');
    
    if (checkbox.checked) {
        container.style.display = 'block';
        addBtn.style.display = 'block';
    } else {
        container.style.display = 'none';
        addBtn.style.display = 'none';
        // Clear any editions when toggled off
        clearEditEditionsForm();
    }
}

// Function to delete an existing edition from the book
function deleteExistingEdition(editionIndex) {
    const bookId = parseInt(document.getElementById('edit-book-id').value);
    const book = books.find(b => b.id === bookId);
    
    if (book && book.editions && book.editions[editionIndex]) {
        const editionTitle = book.editions[editionIndex].title;
        if (confirm(`Are you sure you want to remove edition "${editionTitle}"?`)) {
            // Remove the edition from the book's editions array
            book.editions.splice(editionIndex, 1);
            
            // Re-number the remaining editions
            book.editions.forEach((edition, idx) => {
                edition.number = idx + 1;
            });
            
            // Update the book's editions in the books array
            const bookIndex = books.findIndex(b => b.id === bookId);
            if (bookIndex !== -1) {
                books[bookIndex].editions = book.editions;
                saveBooksToStorage();
            }
            
            // Re-populate the editions display
            populateEditEditions(book.editions);
            
            showNotification(`Edition "${editionTitle}" removed successfully!`, 'success');
        }
    }
}

// Function to add edition row in edit modal
function addEditEditionRow() {
    const container = document.getElementById('edit-edition-container');
    const row = document.createElement('div');
    row.className = 'edition-input-row';
    row.innerHTML = `
        <input type="text" class="edition-title" placeholder="Edition Title">
        <input type="url" class="edition-image" placeholder="Edition Image URL (optional)">
        <button type="button" class="btn-remove-edition" onclick="removeEditEditionRow(this)">
            <i class='bx bx-trash'></i>
        </button>
    `;
    container.appendChild(row);
}

// Function to remove edition row in edit modal
function removeEditEditionRow(button) {
    const container = document.getElementById('edit-edition-container');
    const rows = container.querySelectorAll('.edition-input-row');
    if (rows.length > 1) {
        button.parentElement.remove();
    } else {
        // Since editions are optional, just clear the row instead of showing error
        const row = button.parentElement;
        row.querySelector('.edition-title').value = '';
        row.querySelector('.edition-image').value = '';
    }
}

// Function to clear edit editions form
function clearEditEditionsForm() {
    const container = document.getElementById('edit-edition-container');
    const checkbox = document.getElementById('edit-has-editions');
    const addBtn = document.getElementById('btn-edit-add-edition');
    
    // Reset checkbox
    if (checkbox) {
        checkbox.checked = false;
    }
    
    // Hide edition rows
    container.style.display = 'none';
    if (addBtn) {
        addBtn.style.display = 'none';
    }
    
    // Reset the container with one empty row
    container.innerHTML = `
        <div class="edition-input-row">
            <input type="text" class="edition-title" placeholder="Edition Title">
            <input type="url" class="edition-image" placeholder="Edition Image URL (optional)">
            <button type="button" class="btn-remove-edition" onclick="removeEditEditionRow(this)">
                <i class='bx bx-trash'></i>
            </button>
        </div>
    `;
}

// Function to collect editions from edit form
function collectEditEditions() {
    const checkbox = document.getElementById('edit-has-editions');
    const editionInputs = document.querySelectorAll('#edit-edition-container .edition-title');
    const editionImages = document.querySelectorAll('#edit-edition-container .edition-image');
    const editions = [];
    
    // If checkbox is not checked, return empty array (no editions)
    if (!checkbox || !checkbox.checked) {
        return editions;
    }
    
    editionInputs.forEach((input, index) => {
        if (input.value.trim()) {
            const imageInput = editionImages[index];
            editions.push({
                number: index + 1,
                title: input.value.trim(),
                image: imageInput && imageInput.value.trim() ? imageInput.value.trim() : ''
            });
        }
    });
    return editions;
}

// Function to handle edit book form submission
function editBook(event) {
    event.preventDefault();
    
    // Get book ID
    const bookId = parseInt(document.getElementById('edit-book-id').value);
    const bookIndex = books.findIndex(b => b.id === bookId);
    
    if (bookIndex === -1) {
        showNotification('Book not found!', 'error');
        return;
    }
    
    // Get form values
    const title = document.getElementById('edit-book-title').value.trim();
    const author = document.getElementById('edit-book-author').value.trim();
    const imageUrl = document.getElementById('edit-book-image').value.trim();
    const genre = document.getElementById('edit-book-genre').value.trim();
    const pages = document.getElementById('edit-book-pages').value;
    const description = document.getElementById('edit-book-description').value.trim();
    const bookType = document.getElementById('edit-book-type').value;
    const publisher = document.getElementById('edit-book-publisher').value.trim();
    const pubdate = document.getElementById('edit-book-pubdate').value;
    const isbn = document.getElementById('edit-book-isbn').value.trim();
    const language = document.getElementById('edit-book-language').value;
    const status = document.getElementById('edit-book-status').value;
    
    // Collect editions
    const editions = collectEditEditions();
    
    // Use localStorage helper functions for cover image management
    const finalImage = isValidCoverUrl(imageUrl) ? imageUrl : getDefaultCover();
    if (imageUrl && finalImage === getDefaultCover()) {
        showNotification('Invalid image URL. Using default cover.', 'warning');
    }
    
    // Add loading state to button
    const saveBtn = document.querySelector('#edit-book-modal .btn-save');
    if (saveBtn) {
        saveBtn.classList.add('loading');
        saveBtn.disabled = true;
    }
    
    // Simulate a small delay for better UX
    setTimeout(() => {
        // Update book - use saveBookCover to properly store in localStorage
        books[bookIndex] = {
            ...books[bookIndex],
            title,
            author,
            image: saveBookCover(bookId, finalImage),
            genre,
            pages: parseInt(pages),
            status,
            editions,
            description: description || '',
            tags: [bookType], // Store book type as single-element array
            publisher: publisher || '',
            pubdate: pubdate || '',
            isbn: isbn || '',
            language: language || 'English',
            updatedAt: new Date().toISOString()
        };
        
        saveBooksToStorage();
        renderBooks();
        updateStatsCards();
        closeModal('edit-book');
        event.target.reset();
        clearEditEditionsForm();
        
        // Remove loading state
        if (saveBtn) {
            saveBtn.classList.remove('loading');
            saveBtn.disabled = false;
        }
        
        showNotification(`Book "${title}" updated successfully!`, 'success');
    }, 500);
}

function toggleBookStatus(bookId) {
    const book = books.find(b => b.id === bookId);
    if (book) {
        const wasPublished = book.status === 'published';
        book.status = book.status === 'published' ? 'draft' : 'published';
        
        // If publishing a book (not unpublishing), mark it as new
        if (!wasPublished && book.status === 'published') {
            book.publishedAt = new Date().toISOString();
            book.isNew = true;
            
            // Store new book notification for users
            const newBookNotification = {
                bookId: book.id,
                title: book.title,
                publishedAt: book.publishedAt,
                seen: false
            };
            
            // Get existing notifications
            let notifications = JSON.parse(localStorage.getItem('newBookNotifications')) || [];
            notifications.push(newBookNotification);
            localStorage.setItem('newBookNotifications', JSON.stringify(notifications));
        }
        
        saveBooksToStorage();
        renderBooks();
        updateStatsCards();
        showNotification(`Book ${book.status === 'published' ? 'published' : 'unpublished'}!`, 'success');
    }
}

function removeBook(bookId) {
    if (confirm('Are you sure you want to remove this book?')) {
        books = books.filter(b => b.id !== bookId);
        saveBooksToStorage();
        renderBooks();
        updateStatsCards();
        showNotification('Book removed successfully!', 'success');
    }
}

// Fetch books from API
async function fetchBooksFromAPI() {
    showNotification('Fetching books from API...', 'info');
    
    try {
        const response = await fetch(BASE_URL + 'Harry Potter', API_OPTIONS);
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        const bookList = data.docs || [];
        
        let addedCount = 0;
        bookList.slice(0, 10).forEach(apiBook => {
            const exists = books.some(b => b.title.toLowerCase() === apiBook.title?.toLowerCase());
            if (!exists) {
                // compute cover from API if available
        const defaultImageUrl = "https://images.unsplash.com/photo-1543002588-bfa74090ca80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=150&q=80";
        const coverUrl = apiBook.cover_i
            ? `https://covers.openlibrary.org/b/id/${apiBook.cover_i}-M.jpg`
            : defaultImageUrl;

        books.push({
                    id: Date.now() + Math.random(),
                    title: apiBook.title || 'Unknown Title',
                    author: apiBook.author_name ? apiBook.author_name.join(', ') : 'Unknown Author',
                    genre: apiBook.subject ? apiBook.subject[0] : 'Fantasy',
                    pages: apiBook.number_of_pages_median || 0,
                    status: 'draft',
                    image: coverUrl
                });
                addedCount++;
            }
        });
        
        saveBooksToStorage();
        renderBooks();
        updateStatsCards();
        showNotification('Added ' + addedCount + ' books from API!', 'success');
    } catch (error) {
        console.error('API Error:', error);
        showNotification('Failed to fetch books from API', 'error');
    }
}

// ═════════════════════════════════════════════════════════════
// EDITORS MANAGEMENT
// ═════════════════════════════════════════════════════════════

function renderEditors() {
    // Editors functionality removed - now only admin and users
    const container = document.getElementById('editors-list');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <i class='bx bx-user'></i>
            <p>Editors have been removed. Only admins manage the system.</p>
        </div>
    `;
}

// ═════════════════════════════════════════════════════════════
// USERS MANAGEMENT (Admin Only)
// ═════════════════════════════════════════════════════════════

function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}


function renderUsers() {
    const container = document.getElementById('users-list');
    if (!container) return;
    
    const users = getUsers();
    
    if (users.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-user'></i>
                <p>No users registered yet.</p>
            </div>
        `;
        return;
    }

    // filter out admins - only show regular users
    const filtered = users.filter(u => u.role !== 'admin' && u.role === 'user');

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-user'></i>
                <p>No users registered yet.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="user-group" data-role="user">
            <h4>Users (${filtered.length})</h4>
            ${filtered.map(user => `
                <div class="user-item">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="${user.email}">
                    <div class="user-info">
                        <div class="user-name">${user.email.split('@')[0]}</div>
                        <div class="user-email">${shortenEmail(user.email)}</div>
                    </div>
                    <span class="user-role-badge user">User</span>
                    <span class="user-password-hidden">••••••••</span>
                    ${currentRole === 'admin' ? `
                        <div class="user-actions">
                            <button class="btn-remove" onclick="removeUser('${user.email}')" title="Remove User">
                                <i class='bx bx-trash'></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
}



function removeUser(email) {
    if (confirm(`Are you sure you want to remove user: ${email}?`)) {
        let users = getUsers();
        users = users.filter(u => u.email !== email);
        localStorage.setItem('users', JSON.stringify(users));
        renderUsers();
        showNotification('User removed successfully!', 'success');
    }
}

// ═════════════════════════════════════════════════════════════
// STATS
// ═════════════════════════════════════════════════════════════

function updateStatsCards() {
    const totalBooks = books.length;
    const published = books.filter(b => b.status === 'published').length;
    const drafts = books.filter(b => b.status === 'draft').length;
    const totalUsers = getUsers().length;
    
    document.getElementById('stat-total-books').textContent = totalBooks;
    document.getElementById('stat-published').textContent = published;
    document.getElementById('stat-drafts').textContent = drafts;
    document.getElementById('stat-users').textContent = totalUsers;
}

function renderStats() {
    const container = document.getElementById('stats-content');
    if (!container) return;
    
    const stats = [
        { icon: 'bx-book', title: 'Total Books', value: books.length, desc: 'All books in library' },
        { icon: 'bx-check-circle', title: 'Published', value: books.filter(b => b.status === 'published').length, desc: 'Available to read' },
        { icon: 'bx-edit', title: 'Drafts', value: books.filter(b => b.status === 'draft').length, desc: 'Work in progress' },
        { icon: 'bx-group', title: 'Total Users', value: getUsers().length, desc: 'Registered users' },
        { icon: 'bx-star', title: 'Top Genre', value: getTopGenre(), desc: 'Most popular category' }
    ];
    
    container.innerHTML = stats.map(stat => `
        <div class="stats-item">
            <div class="stats-info">
                <h4><i class='bx ${stat.icon}'></i> ${stat.title}</h4>
                <p>${stat.desc}</p>
            </div>
            <div class="stats-value">${stat.value}</div>
        </div>
    `).join('');
}

function getTopGenre() {
    const genreCount = {};
    books.forEach(book => {
        genreCount[book.genre] = (genreCount[book.genre] || 0) + 1;
    });
    
    const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0];
    return topGenre ? topGenre[0] : 'N/A';
}

// ═════════════════════════════════════════════════════════════
// NAVIGATION
// ═════════════════════════════════════════════════════════════

function navigateTo(section) {
    // Remove active class from all nav items
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to the clicked nav item (if event is available)
    if (event && event.target) {
        const clickedItem = event.target.closest('.admin-nav-item');
        if (clickedItem) {
            clickedItem.classList.add('active');
        }
    } else if (section) {
        // If called programmatically, find the nav item that matches the section
        const navItem = document.querySelector(`.admin-nav-item[onclick*="${section}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }
    }
    
    const booksCol = document.getElementById('books-column');
    const usersCol = document.getElementById('users-column');
    const statsCol = document.getElementById('stats-column');
    const dashboardGrid = document.querySelector('.dashboard-grid');
    
    // helper to set visibility
    function showOnly(...cols) {
        [booksCol, usersCol, statsCol].forEach(c => {
            if (c) c.style.display = cols.includes(c) ? 'block' : 'none';
        });
    }

    if (section === 'books') {
        showOnly(booksCol);
    } else if (section === 'users') {
        showOnly(usersCol);
    } else if (section === 'stats') {
        showOnly(statsCol);
    } else {
        // overview / default: show books and stats
        showOnly(booksCol, statsCol);
    }

    // adjust layout width when single card visible
    const visibleCount = [booksCol, usersCol, statsCol].filter(c => c && c.style.display === 'block').length;
    if (dashboardGrid) {
        if (visibleCount === 1) dashboardGrid.classList.add('single');
        else dashboardGrid.classList.remove('single');
    }
}

// ═════════════════════════════════════════════════════════════
// LOGOUT & NAVIGATION
// ═════════════════════════════════════════════════════════════

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        // Clear first login flag so next login is treated as first time
        localStorage.removeItem('firstLogin');
        window.location.href = '../login/index.html';
    }
}

// Function to go back to main/home page
function goToHome() {
    window.location.href = '../main/index-acc.html';
}

// ═════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═════════════════════════════════════════════════════════════

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `<i class='bx ${type === 'success' ? 'bx-check-circle' : type === 'error' ? 'bx-x-circle' : 'bx-info-circle'}'></i> ${message}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Close modals when clicking outside
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});
