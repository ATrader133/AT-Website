// api/chat.js (Serverless Backend)

export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // 2. Grab the Secure API Key from your Environment Variables (NOT hardcoded)
        const apiKey = process.env.AIzaSyBEt5661dwdGIjRK-MMIj28y3Y2loOjcJk;
        
        if (!apiKey) {
            return res.status(500).json({ error: "Missing API Key on server." });
        }

        // 3. Extract the data sent from your frontend
        const { systemInstruction, contents } = req.body;

        // 4. Make the secure request to Google from the server
        const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemInstruction }] },
                contents: contents
            })
        });

        const data = await googleResponse.json();

        // 5. Send the result back to your frontend
        return res.status(200).json(data);

    } catch (error) {
        console.error("Backend Error:", error);
        return res.status(500).json({ error: 'Failed to process chat request' });
    }
}
