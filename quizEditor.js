// assets/js/quizEditor.js

function runQuizEditorPage() {
    const defaultVocabulary = [ { english: "to speak", french: ["parler"] }, { english: "I speak", french: ["je parle"] }, { english: "I don't speak", french: ["je ne parle pas"] } ];
    const tableBody = document.querySelector("#vocab-table tbody");
    const addForm = document.getElementById("add-form");
    const englishInput = document.getElementById("english-input");
    const frenchInput = document.getElementById("french-input");
    const saveBtn = document.getElementById("save-btn");
    const saveConfirmEl = document.getElementById("save-confirm");
    const aiPromptInput = document.getElementById("ai-prompt-input");
    const generateBtn = document.getElementById("generate-btn");
    const removeAllBtn = document.getElementById("remove-all-btn");
    let vocabularyData = [];

    async function handleAIGeneration() {
        const userInput = aiPromptInput.value.trim();
        if (!userInput) return;

        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        const generatedWords = await generateVocabularyWithAI(userInput);
        if (generatedWords) {
            vocabularyData.push(...generatedWords);
            renderTable();
            aiPromptInput.value = '';
        }
        generateBtn.disabled = false;
        generateBtn.textContent = '✨ Generate with AI';
    }

    function renderTable() {
        tableBody.innerHTML = "";
        vocabularyData.forEach((item, index) => { const row = document.createElement("tr"); row.innerHTML = `<td>${item.english}</td><td>${item.french.join(', ')}</td><td><button class="action-btn delete-btn" data-index="${index}">Delete</button></td>`; tableBody.appendChild(row); });
    }

    function loadVocabulary() {
        const savedData = localStorage.getItem('customQuizData');
        vocabularyData = savedData ? JSON.parse(savedData) : [...defaultVocabulary];
        renderTable();
    }

    function saveVocabulary() {
        localStorage.setItem('customQuizData', JSON.stringify(vocabularyData));
        saveConfirmEl.textContent = "Vocabulary saved successfully!";
        setTimeout(() => saveConfirmEl.textContent = "", 2000);
    }

    addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newEnglish = englishInput.value.trim();
        const newFrench = frenchInput.value.trim().split(',').map(s => s.trim()).filter(Boolean);
        if (newEnglish && newFrench.length > 0) { vocabularyData.push({ english: newEnglish, french: newFrench }); englishInput.value = ""; frenchInput.value = ""; renderTable(); }
    });

    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) { const index = e.target.dataset.index; if (confirm('Are you sure you want to delete this word?')) { vocabularyData.splice(index, 1); renderTable(); } }
    });

    removeAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete ALL words from your vocabulary list? This action cannot be undone.')) {
            vocabularyData = [];
            renderTable();
        }
    });

    generateBtn.addEventListener('click', handleAIGeneration);
    saveBtn.addEventListener('click', saveVocabulary);
    loadVocabulary();
}