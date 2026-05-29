const API_URL = "https://resume-analyser-geb4.onrender.com";

// Elements
const resumeFile = document.getElementById('resumeFile');
const resumeLabel = document.getElementById('resumeLabel');
const analyzeBtn = document.getElementById('analyzeBtn');
const errorMessage = document.getElementById('errorMessage');
const resultsSection = document.getElementById('resultsSection');
const resultsContent = document.getElementById('resultsContent');
const emptyState = document.getElementById('emptyState');

// File input handler
resumeFile.addEventListener('change', () => {
    if (resumeFile.files.length) {
        resumeLabel.textContent = `✓ ${resumeFile.files[0].name}`;
    } else {
        resumeLabel.textContent = '📄 Choose PDF File';
    }
});

// Error
function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.add('show');
    setTimeout(() => errorMessage.classList.remove('show'), 4000);
}

// Analyze
analyzeBtn.addEventListener('click', async () => {
    if (!resumeFile.files.length) {
        showError("Upload resume first");
        return;
    }

    const formData = new FormData();
    formData.append("file", resumeFile.files[0]);

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";
    emptyState.style.display = "none";

    try {
        const res = await fetch(`${API_URL}/upload/`, {
            method: "POST",
            body: formData
        });

        if (!res.ok) throw new Error("Server error");

        const data = await res.json();
        displayResults(data);

    } catch (err) {
        console.error(err);
        showError("Backend not responding. Try again later.");
        emptyState.style.display = "block";
    }

    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze Resume";
});

// UI
function displayResults(data) {
    resultsContent.innerHTML = `
        <h3>File: ${data.filename}</h3>
        <h2>Score: ${data.score}/100</h2>

        <h4>Skills Found</h4>
        <div>${data.skills_found?.join(", ") || "None"}</div>

        <h4>Warnings</h4>
        <div>${data.warnings?.join("<br>") || "None"}</div>
    `;

    resultsSection.classList.add("show");
}