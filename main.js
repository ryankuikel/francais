// assets/js/main.js

//======================================================================//
//                  GLOBAL LOGIC (Runs on every page)                   //
//======================================================================//
const darkModeToggle = document.getElementById('dark-mode-toggle');

const enableDarkMode = () => {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
    if (darkModeToggle) darkModeToggle.checked = true;
};

const disableDarkMode = () => {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
    if (darkModeToggle) darkModeToggle.checked = false;
};

if (localStorage.getItem('darkMode') === 'enabled') {
    enableDarkMode();
}

if (darkModeToggle) {
    darkModeToggle.addEventListener('change', () => {
        if (localStorage.getItem('darkMode') !== 'enabled') enableDarkMode();
        else disableDarkMode();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const pageId = document.body.id;
    if (pageId === 'quiz-page') runQuizPage();
    else if (pageId === 'quiz-editor-page') runQuizEditorPage();
    else if (pageId === 'quote-editor-page') runQuoteEditorPage();
});