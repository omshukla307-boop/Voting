// backend/src/controllers/ai.controller.js

// Comprehensive Smart Conversational Engine & Knowledge Base
function getSmartFallbackReply(message, userData, systemData) {
    const rawMsg = (message || '').trim();
    const msg = rawMsg.toLowerCase();

    // 1. Greetings & Conversational Intents
    if (/^(hi|hello|hey|namaste|hlo|hii|greetings)/i.test(msg)) {
        const voterText = userData?.voterId ? ` for EPIC ID ${userData.voterId}` : '';
        return `Namaste! 🙏 Welcome to the Digital Voting System of India${voterText}.\n\nI am your AI Voting Assistant. You can ask me:\n• How to cast your vote on EVM\n• How to scan your Voter ID Card QR\n• Connecting your MetaMask Web3 Wallet\n• 4-Digit Security PIN & VVPAT Audit Trail\n• Who is leading in live results\n\nWhat would you like assistance with?`;
    }

    if (msg.includes('who are you') || msg.includes('your name') || msg.includes('what can you do')) {
        return "I am the VoteAdhikar AI Assistant 🤖, your intelligent guide for the Digital Voting System of India. I can assist you step-by-step with voter login, QR code scanning, MetaMask Web3 wallet connection, EVM ballot voting, VVPAT receipts, and live election result tallies!";
    }

    if (msg.includes('thank') || msg.includes('thanks') || msg.includes('great') || msg.includes('awesome') || msg.includes('good bot')) {
        return "You're very welcome! 😊 It is my pleasure to assist you. If you have any further questions about voting or checking election results, feel free to ask!";
    }

    if (msg.includes('creator') || msg.includes('who built') || msg.includes('developer') || msg.includes('who made')) {
        return "This Digital Voting System of India portal (voteadhikar) was designed as a modern Web3 E-Voting Prototype featuring electronic ballot unit emulation, MetaMask cryptographic signing, VVPAT paper audit trails, and real-time database tallying.";
    }

    // 2. EVM Voting Process
    if (msg.includes('vote') && (msg.includes('how') || msg.includes('step') || msg.includes('cast') || msg.includes('process') || msg.includes('guide'))) {
        return "To cast your official ballot on this portal:\n\n1. Go to the 'Vote' page from the top navigation bar.\n2. Tap '🦊 Connect Wallet' to link your MetaMask Web3 wallet.\n3. Press the BLUE BUTTON next to your chosen candidate on the EVM Unit.\n4. Re-enter your 4-digit Security PIN (Default: 1234) in the modal.\n5. Review your printed VVPAT Paper Audit Slip with transaction hash and confirm!";
    }

    // 3. QR Code Voter ID Scanner
    if (msg.includes('scan') || msg.includes('qr') || msg.includes('camera') || msg.includes('upload card') || msg.includes('barcode')) {
        return "Voter ID Card Scanner:\n\n• On the Login page, click '📷 Scan Voter ID Card'.\n• Option 1: Align your Voter ID card QR code inside the camera frame.\n• Option 2: Upload a photo of your Voter ID card image file.\n• Once scanned, your Voter ID will be automatically verified with a green tick ✓ badge!";
    }

    // 4. MetaMask Web3 Wallet
    if (msg.includes('metamask') || msg.includes('wallet') || msg.includes('connect') || msg.includes('web3')) {
        return "MetaMask Web3 Wallet Integration:\n\n1. Tap '🦊 Connect Wallet' in the top header or ballot bar.\n2. A MetaMask pop-up window will request connection authorization.\n3. Approve the connection request in MetaMask.\n4. Your short wallet address will show on the header badge (e.g., 0x1234...5678).\n\nConnecting a Web3 wallet is required to cryptographically sign your ballot!";
    }

    // 5. 4-Digit Security PIN
    if (msg.includes('pin') || msg.includes('security') || msg.includes('password') || msg.includes('1234')) {
        return "4-Digit Security PIN:\n\n• You set your 4-digit Security PIN during Elector Authentication on the Login page (Default PIN: 1234).\n• When you press a candidate button on the EVM Ballot Unit, a security modal will ask for this 4-digit PIN.\n• This prevents unauthorized voting on your active session.";
    }

    // 6. Candidates & Parties
    if (msg.includes('candidate') || msg.includes('party') || msg.includes('who is running') || msg.includes('symbol') || msg.includes('list')) {
        return "Recognized Demonstration Candidates:\n\n1. ⚖️ Aarav Mehta — People's Development Alliance (PDA)\n2. 🪔 Priya Sharma — National Progress Front (NPF)\n3. 🌾 Kabir Verma — Unity and Reform Party (URP)\n4. 🕊️ Ananya Rao — Democratic Future League (DFL)\n5. ☀️ Rohan Kapoor — People's Welfare Movement (PWM)\n6. ⛵ Meera Joshi — Independent Citizens Group (ICG)\n7. ❌ NOTA — None of the Above";
    }

    // 7. Live Results & Leading Candidate
    if (msg.includes('leading') || msg.includes('leader') || msg.includes('winner') || msg.includes('result') || msg.includes('standing') || msg.includes('tally') || msg.includes('margin')) {
        return "Live Election Standings & Leaderboard:\n\n• Click 'Results' in the navigation bar to view the Live Leaderboard.\n• The top hero banner displays the current #1 LEADING CANDIDATE and lead margin (+N votes).\n• The live tally auto-refreshes every 3 seconds from the database across all devices!";
    }

    // 8. VVPAT & Cryptographic Audit Receipts
    if (msg.includes('vvpat') || msg.includes('receipt') || msg.includes('paper') || msg.includes('slip') || msg.includes('hash')) {
        return "VVPAT (Voter Verifiable Paper Audit Trail):\n\n• Immediately after entering your 4-digit Security PIN, a VVPAT paper slip appears on screen.\n• It displays your chosen Candidate Name, Party Symbol, and unique Blockchain Tx Hash (e.g. 0x2834...).\n• This receipt is saved in your Elector Dashboard under 'Voting History'.";
    }

    // 9. Single-Vote Policy & Double Voting
    if (msg.includes('twice') || msg.includes('duplicate') || msg.includes('multiple vote') || msg.includes('again') || msg.includes('one vote')) {
        return "Single-Vote Policy:\n\nEach verified Voter ID (EPIC) is allowed to cast exactly ONE ballot per election window. Once your ballot is submitted, the system commits your vote to the database ledger and logs out your session automatically to prevent double-voting.";
    }

    // 10. Overseas / NRI Voting
    if (msg.includes('nri') || msg.includes('overseas') || msg.includes('passport') || msg.includes('abroad') || msg.includes('form 6a')) {
        return "NRI Overseas Electors:\n\nUnder Section 20A of the Representation of the People Act 1951, Indian citizens living abroad register using Form 6A. On our portal, tap '✈️ NRI Overseas Elector' on the Login page with your valid Indian Passport number to log in.";
    }

    // 11. General Civic & Technical Questions
    if (msg.includes('democracy') || msg.includes('constitution') || msg.includes('eci') || msg.includes('election commission')) {
        return "India is the world's largest democracy. The Election Commission of India (ECI) is an autonomous constitutional authority established under Article 324 of the Constitution to conduct free and fair elections.";
    }

    if (msg.includes('blockchain') || msg.includes('crypto')) {
        return "Blockchain technology in e-voting uses cryptographic hash functions and distributed ledgers. Every vote creates an immutable transaction hash, allowing electors to independently verify their ballot without exposing secret vote privacy.";
    }

    // 12. Smart Dynamic Fallback for Arbitrary / Random Questions
    if (rawMsg.length > 0) {
        return `Regarding "${rawMsg}":\n\nI am configured to guide you through the Digital Voting System of India portal! You can ask me about:\n• 🗳️ EVM Ballot Voting Instructions\n• 📷 Scanning Voter ID QR Cards\n• 🦊 MetaMask Web3 Wallet Connection\n• 🔒 4-Digit Security PIN & VVPAT Receipts\n• 📊 Real-Time Candidate Standings & Leaderboard`;
    }

    return "How can I assist you with the Digital Voting System today? Feel free to ask any question about voting, wallets, VVPAT receipts, or live standings!";
}

exports.handleChat = async (req, res) => {
    try {
        const { message, userData, systemData } = req.body || {};

        if (!message || !String(message).trim()) {
            return res.status(400).json({ reply: "Message is required" });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;

        const systemPrompt = `
You are an intelligent AI assistant for the Digital Voting System of India (voteadhikar).

User Context:
- Voter ID: ${userData?.voterId || 'Guest'}
- Has Wallet Connected: ${userData?.hasWallet || false}
- Has Cast Ballot: ${userData?.hasVoted || false}

System Context:
- Portal State: ${systemData?.state || 'Live Election 2026'}

Instructions:
- If the user asks a question about the voting portal (EVM, MetaMask, VVPAT, PIN, candidate standings, QR scanning), provide clear, step-by-step guidance.
- If the user asks a general knowledge, civic, technical, or conversational question, answer it accurately and politely in 2-4 sentences.
- Never repeat a static template when a specific question is asked. Always address the exact question asked by the user.
`;

        const models = [
            "google/gemma-2-9b-it:free",
            "meta-llama/llama-3.1-8b-instruct:free",
            "mistralai/mistral-7b-instruct:free",
            "openchat/openchat-7b:free",
            "meta-llama/llama-3-8b-instruct"
        ];

        let reply = null;

        if (apiKey) {
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
                                { role: "user", content: String(message).trim() }
                            ],
                            max_tokens: 300
                        })
                    });

                    const data = await response.json();
                    if (response.ok && data?.choices?.[0]?.message?.content) {
                        reply = data.choices[0].message.content.trim();
                        break;
                    }
                } catch (mErr) {
                    console.warn(`Model ${model} fetch notice:`, mErr.message);
                }
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
