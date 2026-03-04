const bookId = new URLSearchParams(window.location.search).get("id") || "default-book";
const chapterList = document.getElementById("chapter-list");
const continueBtn = document.getElementById("continue-btn");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const params = new URLSearchParams(window.location.search);

function loadProgress() {
    const progressData = JSON.parse(localStorage.getItem("readingProgress")) || {};
    const currentChapter = progressData[bookId] || 0;

    if (currentChapter > 0) {
        continueBtn.classList.remove("hidden");
        continueBtn.href = `../detail/Story.html?book=${bookId}&chapter=${currentChapter}`;
    }

    const percent = Math.floor((currentChapter / totalChapters) * 100);
    progressBar.style.width = percent + "%";
    progressText.innerText = percent + "%";
}

function saveProgress(chapterNumber) {
    const progressData = JSON.parse(localStorage.getItem("readingProgress")) || {};
    progressData[bookId] = chapterNumber;
    localStorage.setItem("readingProgress", JSON.stringify(progressData));
}

function renderChapters() {
    chapterList.innerHTML = "";
    for (let i = 1; i <= totalChapters; i++) {
        const li = document.createElement("li");
        li.innerHTML = `
            <a href="../reader/index.html?book=${bookId}&chapter=${i}"
            class="block py-1 hover:text-blue-500">
            Chapter ${i}
            </a>
        `;
        chapterList.appendChild(li);
    }
}

loadProgress();
renderChapters();

continueBtn.addEventListener("click", () => {
    continueBtn.classList.add("hidden");
    saveProgress(1);
    renderChapters();
});

chapterList.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
        const chapterNumber = parseInt(e.target.textContent.split(" ")[1]);
        saveProgress(chapterNumber);
        renderChapters();
    }
});

chapterList.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
        const chapterNumber = parseInt(e.target.textContent.split(" ")[1]);
        window.location.href = `../detail/Story.html?book=${bookId}&chapter=${chapterNumber}`;
    }
});

document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    let currentChapter = parseInt(params.get("chapter")) || 1;

    const prevBtn = document.getElementById("prev-chap");
    const nextBtn = document.getElementById("next-chap");
    const chapLabel = document.getElementById("current-chap");

    chapLabel.textContent = `Chapter ${currentChapter}`;

    // Lấy book hiện tại
    const book = JSON.parse(localStorage.getItem("currentBook")) || {};
    const totalChapters = book.pages || 200;

    function updateNavigation() {
        chapLabel.textContent = `Chapter ${currentChapter}`;

        if (prevBtn) prevBtn.disabled = currentChapter <= 1;
        if (nextBtn) nextBtn.disabled = currentChapter >= totalChapters;
    }

    function goToChapter(chap) {
        const bookType = book.type || (book.tags ? book.tags[0] : "text");

        if (bookType === "img") {
            window.location.href = `index-read-img.html?chapter=${chap}`;
        } else {
            window.location.href = `index-read-novel.html?chapter=${chap}`;
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (currentChapter > 1) {
                goToChapter(currentChapter - 1);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (currentChapter < totalChapters) {
                goToChapter(currentChapter + 1);
            }
        });
    }

    updateNavigation();
});

const totalChapters = 50; // hoặc lấy từ admin

const prevChapBtn = document.getElementById("prevChapterBtn");
const nextChapBtn = document.getElementById("nextChapterBtn");

if (prevChapBtn) {
    prevChapBtn.onclick = () => {
        if (currentChapter > 1) {
            window.location.href =
                `read.html?book=${bookId}&chapter=${currentChapter - 1}`;
        }
    };
}

if (nextChapBtn) {
    nextChapBtn.onclick = () => {
        if (currentChapter < totalChapters) {
            window.location.href =
                `read.html?book=${bookId}&chapter=${currentChapter + 1}`;
        }
    };
}