// assets/js/api.js

const YOUR_API_KEY = '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';

async function performFullAICoaching(currentQuestion, userAnswer) {
    if (!YOUR_API_KEY || YOUR_API_KEY.includes('PASTE_YOUR')) {
        return { evaluation: 'error', responseText: 'AI Tutor is disabled. Add a valid Groq API key in script.js.' };
    }
    const safeEnglish = currentQuestion.english.replace(/"/g, "'");
    const safeCorrectAnswer = currentQuestion.french[0].replace(/"/g, "'");
    const safeUserAnswer = userAnswer.replace(/"/g, "'");
    const masterPrompt = `You are "Alix", an AI French tutor. The current task is to translate "${safeEnglish}". The correct answer is "${safeCorrectAnswer}". The student wrote: "${safeUserAnswer}". Analyze their input to determine the intent (correct, incorrect, hint request, question, or small talk) and then respond. Use <strong> tags to emphasize key words or corrections. Your entire response must be a single, valid JSON object with two keys: "evaluation" (a single word: "correct", "incorrect", "hint", or "clarification") and "responseText" (your friendly, tutor-like reply as a string).`;
    try {
        const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${YOUR_API_KEY}` }, body: JSON.stringify({ model: "llama3-8b-8192", messages: [ { "role": "system", "content": "You are an AI assistant that only ever responds with a valid JSON object." }, { "role": "user", "content": masterPrompt } ], temperature: 0.5, stream: false }) });
        if (!response.ok) throw new Error(`API Response Failed with status: ${response.status}`);
        const data = await response.json();
        const responseText = data.choices[0].message.content;
        const cleanedJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedJsonString);
    } catch (error) {
        console.error("AI Coach Failed:", error);
        return { evaluation: 'error', responseText: 'AI Tutor error. Please check your API key.' };
    }
}

async function getExampleSentence(word) {
    if (!YOUR_API_KEY || YOUR_API_KEY.includes('PASTE_YOUR')) return;
    const prompt = `You are an AI assistant. For the French word or phrase "${word}", generate one simple, A1-level example sentence and its English translation. Your entire response must be a single, valid JSON object with two keys: "french" and "english".`;
    try {
        const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${YOUR_API_KEY}` }, body: JSON.stringify({ model: "llama3-8b-8192", messages: [ { "role": "system", "content": "You are an AI assistant that only ever responds with a valid JSON object." }, { "role": "user", "content": prompt } ], temperature: 0.7, stream: false }) });
        if (!response.ok) throw new Error('Sentence generation failed');
        const data = await response.json();
        const responseText = data.choices[0].message.content;
        const cleanedJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedJsonString);
    } catch (error) {
        console.error("AI Sentence Generation Failed:", error);
        return null;
    }
}

async function generateVocabularyWithAI(userInput) {
    if (!userInput) {
        alert("Please enter a topic or paste a list into the AI prompt box.");
        return null;
    }
    if (!YOUR_API_KEY || YOUR_API_KEY.includes('PASTE_YOUR')) {
        alert("To use this feature, please add your Groq API key to the script.js file.");
        return null;
    }

    const prompt = `You are an AI assistant that helps a student create a vocabulary list. The user input is: "${userInput}". Please generate a list of English to French vocabulary words based on this input. Your entire response must be a single, valid JSON array of objects. Each object should have two keys: "english" (a string) and "french" (an array of strings).`;
    try {
        const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${YOUR_API_KEY}` }, body: JSON.stringify({ model: "llama3-8b-8192", messages: [ { "role": "system", "content": "You are an AI assistant that only ever responds with a valid JSON array." }, { "role": "user", "content": prompt } ], stream: false }) });
        if (!response.ok) throw new Error(`API Response Failed`);
        const data = await response.json();
        const responseText = data.choices[0].message.content;
        const cleanedJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedJsonString);
    } catch (error) {
        console.error("AI Generation Failed:", error);
        alert("Sorry, the AI could not generate the vocabulary list.");
        return null;
    }
}