// detail/Progressing-bar.js
// Reading progress tracking - works with localStorage from admin/books

const bookId = new URLSearchParams(window.location.search).get("id") || "default-book";
const chapterList = document.getElementById("chapter-list");
const continueBtn = document.getElementById("continue-btn");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

// Get total chapters from localStorage (adminBooks) or default to 200
function getTotalChapters() {
    const params = new URLSearchParams(window.location.search);
    const urlBookId = params.get('id');
    
    if (urlBookId) {
        const adminBooks = JSON.parse(localStorage.getItem('adminBooks')) || [];
        const book = adminBooks.find(b => b.id == urlBookId);
        if (book && book.pages) {
            return book.pages;
        }
    }
    
    // Try to get from currentBook in localStorage
    const storedBook = localStorage.getItem('currentBook');
    if (storedBook) {
        const book = JSON.parse(storedBook);
        if (book.pages) {
            return book.pages;
        }
    }
    
    return 50; // Default fallback
}

const totalChapters = getTotalChapters();

function loadProgress() {
    const progressData = JSON.parse(localStorage.getItem("readingProgress")) || {};
    const currentChapter = progressData[bookId] || 0;

    if (currentChapter > 0 && continueBtn) {
        continueBtn.classList.remove("hidden");
        continueBtn.href = `../reading/index-read-novel.html?book=${bookId}&chapter=${currentChapter}`;
    }

    const percent = Math.floor((currentChapter / totalChapters) * 100);
    if (progressBar) {
        progressBar.style.width = percent + "%";
    }
    if (progressText) {
        progressText.innerText = percent + "%";
    }
}

function saveProgress(chapterNumber) {
    const progressData = JSON.parse(localStorage.getItem("readingProgress")) || {};
    progressData[bookId] = chapterNumber;
    localStorage.setItem("readingProgress", JSON.stringify(progressData));
}

function renderChapters() {
    if (!chapterList) return;
    
    chapterList.innerHTML = "";
    for (let i = 1; i <= totalChapters; i++) {
        const li = document.createElement("li");
        li.innerHTML = `
            <a href="../reading/index-read-novel.html?book=${bookId}&chapter=${i}"
            class="block py-1 hover:text-blue-500">
            Chapter ${i}
            </a>
        `;
        chapterList.appendChild(li);
    }
}

// Initialize
loadProgress();
renderChapters();

// Event listeners
if (continueBtn) {
    continueBtn.addEventListener("click", () => {
        continueBtn.classList.add("hidden");
        saveProgress(1);
        renderChapters();
    });
}

if (chapterList) {
    chapterList.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
            const chapterNumber = parseInt(e.target.textContent.split(" ")[1]);
            if (!isNaN(chapterNumber)) {
                saveProgress(chapterNumber);
            }
        }
    });
}
