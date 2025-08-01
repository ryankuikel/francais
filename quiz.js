// assets/js/quiz.js

function runQuizPage() {
    const defaultVocabulary = [ { english: "to speak", french: ["parler"] }, { english: "I speak", french: ["je parle"] }, { english: "I don't speak", french: ["je ne parle pas"] } ];
    const defaultQuotes = [ { quote: "On ne voit bien qu'avec le cœur. L'essentiel est invisible pour les yeux.", author: "Antoine de Saint-Exupéry" } ];
    const frenchChars = ['à', 'â', 'ç', 'é', 'è', 'ê', 'î', 'ô', 'û'];

    const [englishPhraseEl, answerInputEl, submitBtn, feedbackEl, progressTextEl, progressBarEl, specialCharsContainer, quizContentEl, finalScreenEl, restartBtn, quoteFrenchEl, quoteAuthorEl, aiTutorNoteEl, aiTtsButton, aiTutorResponseTextEl, aiExampleFrenchEl, aiExampleEnglishEl, repetitionGoalTextEl] = [ 'english-phrase', 'answer-input', 'submit-btn', 'feedback', 'progress-text', 'progress-bar', 'special-chars', 'quiz-content', 'final-screen', 'restart-btn', 'quote-french', 'quote-author', 'ai-tutor-note', 'ai-tts-button', 'ai-tutor-response-text', 'ai-example-french', 'ai-example-english', 'repetition-goal-text'].map(id => document.getElementById(id));

    let quizQueue = [];
    let frenchVoice = null;
    let isAITurn = false;

    function loadVoices() {
        const voices = window.speechSynthesis.getVoices();
        frenchVoice = voices.find(voice => voice.lang === 'fr-FR' || voice.lang.startsWith('fr-'));
    }
    function speak(text) {
        if (!('speechSynthesis' in window)) return;
        const utterance = new SpeechSynthesisUtterance(text);
        if (frenchVoice) utterance.voice = frenchVoice;
        else utterance.lang = 'fr-FR';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) window.speechSynthesis.onvoiceschanged = loadVoices;

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array;
    }

    function displayRandomQuote() {
        let quoteSource = defaultQuotes;
        const savedQuotes = localStorage.getItem('customQuotesData');
        if (savedQuotes) { try { const parsedQuotes = JSON.parse(savedQuotes); if (Array.isArray(parsedQuotes) && parsedQuotes.length > 0) quoteSource = parsedQuotes; } catch (e) { console.error("Could not parse saved quotes.", e); } }
        const randomQuote = quoteSource[Math.floor(Math.random() * quoteSource.length)];
        quoteFrenchEl.textContent = `« ${randomQuote.quote} »`;
        quoteAuthorEl.textContent = `— ${randomQuote.author}`;
    }

    function initQuiz() {
        displayRandomQuote();
        let dataToLoad = defaultVocabulary;
        const savedData = localStorage.getItem('customQuizData');
        if (savedData) { try { const parsedData = JSON.parse(savedData); if (Array.isArray(parsedData) && parsedData.length > 0) dataToLoad = parsedData; } catch (e) { console.error("Could not parse saved vocab.", e); } }

        quizQueue = shuffle(dataToLoad.map(item => ({
            ...item,
            state: 'learning',
            targetCorrect: 5,
            consecutiveCorrect: 0
        })));

        quizContentEl.style.display = 'block';
        finalScreenEl.style.display = 'none';
        loadQuestion();
    }

    function resetUIForNextAttempt() {
        answerInputEl.value = '';
        answerInputEl.focus();
        submitBtn.disabled = false;
        isAITurn = false;
    }

    function loadQuestion() {
        if (quizQueue.length === 0) { showFinalScreen(); return; }
        const currentQuestion = quizQueue[0];
        englishPhraseEl.textContent = currentQuestion.english;
        feedbackEl.classList.remove('visible', 'correct', 'incorrect');
        aiTutorNoteEl.classList.remove('visible');
        aiTtsButton.style.display = 'none';
        aiTutorResponseTextEl.innerHTML = '';
        aiExampleFrenchEl.textContent = '';
        aiExampleEnglishEl.textContent = '';
        resetUIForNextAttempt();
        updateProgress();
    }

    function updateProgress() {
        if (quizQueue.length === 0) {
            progressTextEl.textContent = "All words mastered!";
            progressBarEl.style.width = '100%';
            repetitionGoalTextEl.textContent = '';
            return;
        }
        const currentQuestion = quizQueue[0];
        progressTextEl.textContent = `${quizQueue.length} words remaining in practice session.`;
        const progressPercent = (currentQuestion.consecutiveCorrect / currentQuestion.targetCorrect) * 100;
        progressBarEl.style.width = `${progressPercent}%`;

        if (currentQuestion.state === 'learning') {
            repetitionGoalTextEl.textContent = `(${currentQuestion.targetCorrect} in a row to learn)`;
        } else if (currentQuestion.state === 'reviewing_3' || currentQuestion.state === 'reviewing_2') {
            repetitionGoalTextEl.textContent = `(${currentQuestion.targetCorrect} in a row to review)`;
        }
    }

    async function checkAnswer(mode = 'quick') {
        if (isAITurn) return;

        const userAnswer = answerInputEl.value.trim();
        if (userAnswer === '') return;

        submitBtn.disabled = true;
        let currentWord = quizQueue[0];

        aiTutorResponseTextEl.innerHTML = '';
        aiExampleFrenchEl.textContent = '';
        aiExampleEnglishEl.textContent = '';

        let isCorrect;
        if (mode === 'ai') {
            isAITurn = true;
            aiTutorNoteEl.classList.add('visible');
            aiTutorResponseTextEl.innerHTML = 'Thinking...';
            const aiResponse = await performFullAICoaching(currentWord, userAnswer);
            if (!aiResponse) { submitBtn.disabled = false; isAITurn = false; return; }

            aiTutorResponseTextEl.innerHTML = aiResponse.responseText;
            aiTtsButton.dataset.textToSpeak = currentWord.french[0];
            aiTtsButton.style.display = 'inline-block';

            isCorrect = aiResponse.evaluation === 'correct';
            feedbackEl.innerHTML = isCorrect ? '✅' : (aiResponse.evaluation === 'incorrect' ? '❌' : '💡');
            feedbackEl.className = `feedback visible ${isCorrect ? 'correct' : (aiResponse.evaluation === 'incorrect' ? 'incorrect' : '')}`;
        } else {
            const correctAnswers = currentWord.french;
            isCorrect = correctAnswers.some(ans => ans.toLowerCase() === userAnswer.toLowerCase());
            feedbackEl.classList.add('visible');
            feedbackEl.innerHTML = isCorrect ? '✅' : '❌';
            feedbackEl.className = isCorrect ? 'feedback visible correct' : 'feedback visible incorrect';
        }

        if (isCorrect) {
            currentWord.consecutiveCorrect++;
            updateProgress();

            if (mode === 'quick') {
                aiTutorNoteEl.classList.add('visible');
                aiTutorResponseTextEl.innerHTML = "Correct! Here's an example:";
                aiTtsButton.style.display = 'inline-block';
                aiTtsButton.dataset.textToSpeak = currentWord.french[0];
                const sentence = await getExampleSentence(currentWord.french[0]);
                if(sentence) {
                    aiExampleFrenchEl.textContent = sentence.french;
                    aiExampleEnglishEl.textContent = `(${sentence.english})`;
                }
            }

            if (currentWord.consecutiveCorrect >= currentWord.targetCorrect) {
                const completedWord = quizQueue.shift();

                if (completedWord.state === 'learning') {
                    completedWord.state = 'reviewing_3'; completedWord.targetCorrect = 3; completedWord.consecutiveCorrect = 0;
                    quizQueue.splice(Math.min(4, quizQueue.length), 0, completedWord);
                } else if (completedWord.state === 'reviewing_3') {
                    completedWord.state = 'reviewing_2'; completedWord.targetCorrect = 2; completedWord.consecutiveCorrect = 0;
                    quizQueue.splice(Math.min(5, quizQueue.length), 0, completedWord);
                } else if (completedWord.state === 'reviewing_2') {
                    completedWord.state = 'mastered';
                }

                feedbackEl.innerHTML = '🏆';
                setTimeout(() => { loadQuestion(); }, 2000);

            } else {
                setTimeout(() => {
                    resetUIForNextAttempt();
                    updateProgress();
                }, 1200);
            }
        } else { // Incorrect answer
            currentWord.consecutiveCorrect = 0;
            updateProgress();

            if (currentWord.state === 'reviewing_2') {
                currentWord.state = 'reviewing_3';
                currentWord.targetCorrect = 3;
            }

            if (mode !== 'ai') {
                aiTutorNoteEl.classList.add('visible');
                aiTutorResponseTextEl.innerHTML = `Not quite. The correct answer is: <strong>${currentWord.french[0]}</strong>`;
            }

            // Stay on the same question, just re-enable controls
            submitBtn.disabled = false;
            isAITurn = false;
        }
    }

    function populateSpecialChars() {
        specialCharsContainer.innerHTML = '';
        frenchChars.forEach(char => { const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'char-btn'; btn.textContent = char; specialCharsContainer.appendChild(btn); });
    }

    function showFinalScreen() {
        quizContentEl.style.display = 'none';
        finalScreenEl.style.display = 'block';
    }

    submitBtn.addEventListener('click', () => checkAnswer('quick'));
    answerInputEl.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (event.shiftKey) { checkAnswer('ai'); } else { checkAnswer('quick'); }
        }
    });

    specialCharsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('char-btn')) { const char = event.target.textContent; const { value, selectionStart } = answerInputEl; answerInputEl.value = value.slice(0, selectionStart) + char + value.slice(selectionStart); answerInputEl.selectionStart = answerInputEl.selectionEnd = selectionStart + 1; answerInputEl.focus(); }
    });
    aiTtsButton.addEventListener('click', () => { if (aiTtsButton.dataset.textToSpeak) speak(aiTtsButton.dataset.textToSpeak); });
    restartBtn.addEventListener('click', initQuiz);

    populateSpecialChars();
    initQuiz();
}