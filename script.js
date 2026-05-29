(() => {
  const API_URL = "https://resume-analyser-geb4.onrender.com/upload/";

  document.addEventListener("DOMContentLoaded", () => {
    const resumeFile = document.getElementById("resumeFile");
    const resumeLabel = document.getElementById("resumeLabel");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const errorMessage = document.getElementById("errorMessage");
    const resultsSection = document.getElementById("resultsSection");
    const resultsContent = document.getElementById("resultsContent");
    const emptyState = document.getElementById("emptyState");

    if (
      !resumeFile ||
      !resumeLabel ||
      !analyzeBtn ||
      !errorMessage ||
      !resultsSection ||
      !resultsContent ||
      !emptyState
    ) {
      return;
    }

    const setLoading = (state) => {
      analyzeBtn.disabled = state;
      analyzeBtn.classList.toggle("loading", state);
      if (!state) analyzeBtn.textContent = "Analyze Resume";
    };

    const showError = (message) => {
      errorMessage.textContent = message;
      errorMessage.classList.add("show");
      setTimeout(() => errorMessage.classList.remove("show"), 4000);
    };

    const renderResults = (data) => {
      const filename = data.filename || "Unknown file";
      const score = typeof data.score === "number" ? data.score : 0;
      const skills = Array.isArray(data.skills_found) ? data.skills_found : [];
      const warnings = Array.isArray(data.warnings) ? data.warnings : [];

      const skillsHTML =
        skills.length > 0
          ? skills
              .map(
                (skill) =>
                  `<span class="skill-tag">${String(skill)}</span>`
              )
              .join("")
          : `<p class="muted-text">No skills detected</p>`;

      const warningsHTML =
        warnings.length > 0
          ? `
            <div class="info-section warnings-section">
              <h3>Warnings</h3>
              <ul>
                ${warnings
                  .map((w) => `<li>${String(w)}</li>`)
                  .join("")}
              </ul>
            </div>
          `
          : "";

      resultsContent.innerHTML = `
        <div class="result-card">
          <div class="result-header">
            <div class="filename-display">
              <strong>File:</strong> ${filename}
            </div>
            <div class="score-badge">
              ${score}<span>/100</span>
            </div>
          </div>

          <div class="info-section">
            <h3>Skills Found</h3>
            <div class="skills-container">
              ${skillsHTML}
            </div>
          </div>

          ${warningsHTML}
        </div>
      `;

      emptyState.style.display = "none";
      resultsSection.classList.add("show");
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    resumeFile.addEventListener("change", () => {
      if (resumeFile.files && resumeFile.files.length > 0) {
        resumeLabel.textContent = `✓ ${resumeFile.files[0].name}`;
        resumeLabel.classList.add("has-file");
      } else {
        resumeLabel.textContent = "📄 Choose PDF File";
        resumeLabel.classList.remove("has-file");
      }
    });

    analyzeBtn.addEventListener("click", async () => {
      if (!resumeFile.files || resumeFile.files.length === 0) {
        showError("Please upload a resume PDF file.");
        return;
      }

      const formData = new FormData();
      formData.append("file", resumeFile.files[0]);

      setLoading(true);
      emptyState.style.display = "none";
      resultsSection.classList.remove("show");

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Server error (${response.status})`);
        }

        const data = await response.json();
        renderResults(data);
      } catch (error) {
        showError(
          "Unable to analyze resume. Please check your connection and try again."
        );
        emptyState.style.display = "block";
      } finally {
        setLoading(false);
      }
    });
  });
})();