// backend/src/controllers/ai.controller.js

// Smart fallback engine for voting portal guidance
function getSmartFallbackReply(message, userData, systemData) {
    const msg = (message || '').toLowerCase();

    if (msg.includes('vote') && (msg.includes('how') || msg.includes('step') || msg.includes('cast'))) {
        return "To cast your official ballot:\n1. Click on 'Vote' in the top navigation bar.\n2. Tap '🦊 Connect Wallet' to link your MetaMask Web3 wallet.\n3. Press the BLUE BUTTON next to your chosen candidate on the EVM Unit.\n4. Enter your 4-digit Security PIN (Default: 1234).\n5. Review your VVPAT Paper Audit Slip and confirm!";
    }

    if (msg.includes('metamask') || msg.includes('wallet') || msg.includes('connect')) {
        return "MetaMask Web3 Wallet Connection:\n1. Click the '🦊 Connect Wallet' button in the header or ballot page.\n2. MetaMask will open a pop-up window.\n3. Approve the connection request.\n4. Your connected wallet address will display in the header badge!";
    }

    if (msg.includes('pin') || msg.includes('security')) {
        return "The 4-digit Security PIN is configured during Elector Authentication on the Login page (Default: 1234). Re-enter this PIN when pressing the EVM candidate button to authorize your vote.";
    }

    if (msg.includes('result') || msg.includes('leading') || msg.includes('standings') || msg.includes('winner')) {
        return "You can check real-time candidate standings on the 'Results' page! The live leaderboard auto-refreshes every 3 seconds from the database, showing vote counts, vote shares (%), and the current leading candidate.";
    }

    if (msg.includes('vvpat') || msg.includes('receipt') || msg.includes('slip')) {
        return "VVPAT (Voter Verifiable Paper Audit Trail) prints a cryptographic paper audit slip showing your chosen Candidate Name, Party Symbol, and Transaction Hash immediately after PIN verification.";
    }

    if (msg.includes('nri') || msg.includes('overseas')) {
        return "Overseas Electors (NRIs) can register under Section 20A of the Representation of the People Act 1951 using Form 6A. On our portal, tap '✈️ NRI Overseas Elector' on the Login page with your valid Indian Passport number.";
    }

    if (userData && userData.voterId) {
        return `Hello Elector (${userData.voterId})! I am your AI Voting Assistant. You can ask me how to cast your vote, connect MetaMask, verify your VVPAT receipt, or check live election standings!`;
    }

    return "Welcome to the Digital Voting System of India! I am your AI Assistant. How can I help you today? You can ask about: How to Vote, Connecting MetaMask, Security PIN, VVPAT Receipts, or Live Election Standings.";
}

exports.handleChat = async (req, res) => {
    try {
        const { message, userData, systemData } = req.body || {};

        if (!message) {
            return res.status(400).json({ reply: "Message is required" });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            const fallbackReply = getSmartFallbackReply(message, userData, systemData);
            return res.json({ reply: fallbackReply, source: "smart-engine" });
        }

        const systemPrompt = `
You are an AI assistant for the Digital Voting System of India (voteadhikar).

User Info:
- Voter ID: ${userData?.voterId || 'Guest'}
- Has Wallet: ${userData?.hasWallet || false}
- Has Voted: ${userData?.hasVoted || false}

System Info:
- Election State: ${systemData?.state || 'Live'}

Rules:
- Guide step-by-step politely
- Keep answers short and clear (max 3-4 sentences)
- Provide helpful instructions for EVM Ballot, MetaMask wallet, VVPAT receipts, 4-digit PIN, or live results
`;

        const models = [
            "meta-llama/llama-3-8b-instruct",
            "mistralai/mistral-7b-instruct",
            "openchat/openchat-3.5-0106"
        ];

        let reply = null;

        for (let model of models) {
            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://voting-navy-pi.vercel.app",
                        "X-Title": "AI Voting System"
                    },
                    body: JSON.stringify({
                        model,
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: message }
                        ]
                    })
                });

                const data = await response.json();
                if (response.ok && data?.choices?.[0]?.message?.content) {
                    reply = data.choices[0].message.content;
                    break;
                }
            } catch (mErr) {
                console.warn(`Model ${model} fetch notice:`, mErr.message);
            }
        }

        if (!reply) {
            reply = getSmartFallbackReply(message, userData, systemData);
        }

        return res.json({ reply, success: true });

    } catch (err) {
        console.error("AI Chatbot Controller error:", err);
        const fallback = getSmartFallbackReply(req.body?.message, req.body?.userData, req.body?.systemData);
        return res.json({ reply: fallback });
    }
};
