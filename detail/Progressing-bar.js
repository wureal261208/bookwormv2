const bookId = new URLSearchParams(window.location.search).get("id") || "default-book";
const chapterList = document.getElementById("chapter-list");
const continueBtn = document.getElementById("continue-btn");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

const totalChapters = 50;

function loadProgress() {
    const progressData = JSON.parse(localStorage.getItem("readingProgress")) || {};
    const currentChapter = progressData[bookId] || 0;

    if (currentChapter > 0) {
        continueBtn.classList.remove("hidden");
        continueBtn.href = `../reading/index-read-novel.html?book=${bookId}&chapter=${currentChapter}`;
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
            <a href="../reading/index-read-novel.html?book=${bookId}&chapter=${i}"
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
        window.location.href = `../reading/index-read-img.html?book=${bookId}&chapter=${chapterNumber}`;
    }
});
