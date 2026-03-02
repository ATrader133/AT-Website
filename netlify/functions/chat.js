// netlify/functions/chat.js

exports.handler = async function(event, context) {
    // 1. SECURITY CHECK: Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        // 2. GET THE SECRET KEY: This pulls the key from your Netlify dashboard vault
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            return { statusCode: 500, body: JSON.stringify({ error: "API Key missing in Netlify" }) };
        }

        // 3. READ FRONTEND DATA: What did the user type in the chat window?
        const body = JSON.parse(event.body);
        const { systemInstruction, contents } = body;

        // 4. CALL GOOGLE SECURELY: Your server talks to Google, the user never sees this happen.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemInstruction }] },
                contents: contents
            })
        });

        const data = await response.json();

        // 5. SEND BACK TO WEBSITE: Extract just the AI's text and send it to your website
        const replyText = data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: replyText })
        };

    } catch (error) {
        console.error("Backend Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to process chat request" })
        };
    }
};
