// netlify/functions/chat.js
exports.handler = async function(event, context) {
    // 1. Handle CORS Preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '' };
    }

    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: "API Key missing in Netlify" }) };

        const { systemInstruction, contents } = JSON.parse(event.body);

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemInstruction }] },
                contents: contents
            })
        });

        const data = await response.json();

        // FAIL-SAFE PARSING: Prevent crashes if AI returns a safety block or rate limit
        if (data.error) throw new Error(data.error.message);
        
        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
             return { 
                 statusCode: 200, 
                 headers: { 'Access-Control-Allow-Origin': '*' },
                 body: JSON.stringify({ reply: "I apologize, but I cannot process that specific request right now. Could you please rephrase?" }) 
             };
        }

        const replyText = data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ reply: replyText })
        };

    } catch (error) {
        console.error("Backend Error:", error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: "Failed to process chat request due to an internal server error." })
        };
    }
};
