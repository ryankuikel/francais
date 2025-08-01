// assets/js/quoteEditor.js

function runQuoteEditorPage() {
    const defaultQuotes = [ { quote: "On ne voit bien qu'avec le cœur. L'essentiel est invisible pour les yeux.", author: "Antoine de Saint-Exupéry" } ];
    const tableBody = document.querySelector("#quotes-table tbody");
    const addForm = document.getElementById("add-form");
    const quoteInput = document.getElementById("quote-input");
    const authorInput = document.getElementById("author-input");
    const saveBtn = document.getElementById("save-btn");
    const saveConfirmEl = document.getElementById("save-confirm");
    let quotesData = [];

    function renderTable() {
        tableBody.innerHTML = "";
        quotesData.forEach((item, index) => { const row = document.createElement("tr"); row.innerHTML = `<td>${item.quote}</td><td>${item.author}</td><td><button class="action-btn delete-btn" data-index="${index}">Delete</button></td>`; tableBody.appendChild(row); });
    }

    function loadQuotes() {
        const savedData = localStorage.getItem('customQuotesData');
        quotesData = savedData ? JSON.parse(savedData) : [...defaultQuotes];
        renderTable();
    }

    function saveQuotes() {
        localStorage.setItem('customQuotesData', JSON.stringify(quotesData));
        saveConfirmEl.textContent = "Quotes saved successfully!";
        setTimeout(() => saveConfirmEl.textContent = "", 2000);
    }

    addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newQuote = quoteInput.value.trim();
        const newAuthor = authorInput.value.trim();
        if (newQuote && newAuthor) { quotesData.push({ quote: newQuote, author: newAuthor }); quoteInput.value = ""; authorInput.value = ""; renderTable(); }
    });

    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) { const index = e.target.dataset.index; if (confirm('Are you sure you want to delete this quote?')) { quotesData.splice(index, 1); renderTable(); } }
    });

    saveBtn.addEventListener('click', saveQuotes);
    loadQuotes();
}