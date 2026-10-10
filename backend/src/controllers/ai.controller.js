// backend/src/controllers/ai.controller.js
// Updated: Digital Voting System of India — AI Chat & Knowledge Engine Controller

/**
 * Comprehensive Trained Project Knowledge & NLU Engine
 * Handles project-specific queries, Hinglish/Hindi, and dynamic custom queries.
 */
function getTrainedProjectReply(messageText, userData, systemData) {
    const raw = (messageText || '').trim();
    if (!raw) return "Please ask any question about the Digital Voting System of India!";

    const msg = raw.toLowerCase();
    const voterId = userData?.voterId || 'TXPPS1893L';

    // 1. GREETINGS & PERSONALIZATION
    if (/^(hi|hello|hey|namaste|hlo|hii|greetings|good morning|good evening|pranam|ram ram)/i.test(msg)) {
        return `Namaste! 🙏 Welcome to the Digital Voting System of India (Voter ID: ${voterId}).\n\nI am your AI Voting Assistant trained on every feature of this portal. Here are popular topics you can ask me:\n\n• 🗳️ "How to cast EVM ballot?"\n• 📷 "How to scan Voter ID QR card?"\n• 🦊 "How to connect MetaMask Web3 wallet?"\n• 🔒 "What is the 4-digit Security PIN?"\n• 📜 "How does VVPAT paper audit trail work?"\n• 👑 "Who is currently leading in live results?"\n• ⚖️ "List all candidates and parties"\n• ✈️ "How to vote as NRI overseas elector?"\n\nFeel free to type any question in English or Hindi!`;
    }

    if (msg.includes('who are you') || msg.includes('your name') || msg.includes('what can you do') || msg.includes('who r u')) {
        return "I am the official AI Voting Assistant 🤖 for the Digital Voting System of India (voteadhikar). I am trained on every feature of this portal—including EPIC voter login, QR code camera scanning, MetaMask cryptographic signing, EVM Model M3 ballot units, VVPAT audit slips, 4-digit PIN verification, single-vote security, and 3-second live election standings!";
    }

    if (msg.includes('thank') || msg.includes('thanks') || msg.includes('great') || msg.includes('awesome') || msg.includes('good bot') || msg.includes('shukriya') || msg.includes('dhanyawad')) {
        return "You're very welcome! 😊 It is my pleasure to assist you. Let me know if you need any further help with casting your vote or checking live election standings!";
    }

    if (msg.includes('creator') || msg.includes('who built') || msg.includes('developer') || msg.includes('who made') || msg.includes('about project') || msg.includes('what is this website')) {
        return "This project is the 'Digital Voting System of India' (voteadhikar)—a modern Web3 E-Voting Prototype featuring electronic ballot unit emulation, MetaMask cryptographic signing, VVPAT paper audit trails, single-vote enforcement, and real-time database standings auto-refreshing every 3 seconds.";
    }

    // 2. EVM BALLOT & VOTING STEPS (English & Hinglish)
    if ((msg.includes('vote') || msg.includes('ballot') || msg.includes('evm') || msg.includes('cast')) && 
        (msg.includes('how') || msg.includes('step') || msg.includes('process') || msg.includes('guide') || msg.includes('kaise') || msg.includes('kare') || msg.includes('karna'))) {
        return "Step-by-Step EVM Ballot Voting Guide:\n\n1. 🗳️ Tap 'Vote' in the navigation bar to open the Model M3 Electronic Voting Machine.\n2. 🦊 Press 'Connect Wallet' to connect your MetaMask Web3 wallet.\n3. 🟦 Press the BLUE BUTTON next to your chosen candidate on the EVM Unit.\n4. 🔒 Enter your 4-Digit Security PIN (Default: 1234) in the modal.\n5. 📜 Inspect your printed VVPAT Paper Audit Slip showing the cryptographic Tx Hash and confirm!";
    }

    if (msg.includes('evm') || msg.includes('electronic voting machine') || msg.includes('ballot unit') || msg.includes('model m3')) {
        return "EVM Model M3 Unit:\n\nOur system emulates the official Model M3 Electronic Voting Machine used by the Election Commission of India. It features candidate name & symbol panels, active LED indicators, blue vote buttons, audio buzzer alerts, and an integrated VVPAT paper audit slip viewer.";
    }

    // 3. QR CODE SCANNER & VOTER ID CARD
    if (msg.includes('scan') || msg.includes('qr') || msg.includes('camera') || msg.includes('upload card') || msg.includes('voter id') || msg.includes('epic') || msg.includes('card')) {
        return "Voter ID Card Scanner:\n\n• On the Login page, click '📷 Scan Voter ID Card'.\n• Option 1 (Camera): Align any Voter ID QR code in front of your camera frame.\n• Option 2 (Upload File): Upload a picture or image of your Voter ID card.\n• The scanner instantly authenticates your EPIC card and grants a green '✓ VERIFIED ELECTOR' status badge!";
    }

    // 4. METAMASK WEB3 WALLET
    if (msg.includes('metamask') || msg.includes('wallet') || msg.includes('crypto') || msg.includes('web3') || msg.includes('connect')) {
        return "MetaMask Web3 Wallet Guide:\n\n1. Click '🦊 Connect Wallet' in the top header or ballot bar.\n2. MetaMask will open a pop-up authorization window.\n3. Click Approve / Connect in MetaMask.\n4. Your short wallet address (e.g., 0x1234...5678) will appear in the top header.\n\nConnecting a Web3 wallet allows you to cryptographically sign your digital vote hash on the blockchain!";
    }

    // 5. 4-DIGIT SECURITY PIN
    if (msg.includes('pin') || msg.includes('security pin') || msg.includes('1234') || msg.includes('password') || msg.includes('passcode')) {
        return "4-Digit Security PIN:\n\n• You set or verify your 4-digit PIN on the Login page (Default PIN: 1234).\n• When you press a candidate button on the EVM Ballot Unit, a security modal prompts for this 4-digit PIN.\n• This double-verification prevents accidental clicks and ensures full ballot authorization!";
    }

    // 6. CANDIDATES & PARTIES (FICTIONAL ONLY)
    if (msg.includes('candidate') || msg.includes('party') || msg.includes('who is running') || msg.includes('symbol') || msg.includes('list') || msg.includes('neta') || msg.includes('aarav') || msg.includes('priya') || msg.includes('kabir') || msg.includes('ananya') || msg.includes('rohan') || msg.includes('meera') || msg.includes('nota')) {
        return "Recognized Demonstration Candidates & Parties:\n\n1. ⚖️ Aarav Mehta — People's Development Alliance (PDA)\n2. 🪔 Priya Sharma — National Progress Front (NPF)\n3. 🌾 Kabir Verma — Unity and Reform Party (URP)\n4. 🕊️ Ananya Rao — Democratic Future League (DFL)\n5. ☀️ Rohan Kapoor — People's Welfare Movement (PWM)\n6. ⛵ Meera Joshi — Independent Citizens Group (ICG)\n7. ❌ NOTA — None of the Above";
    }

    // 7. LIVE RESULTS & LEADING CANDIDATE (English & Hinglish)
    if (msg.includes('leading') || msg.includes('leader') || msg.includes('winner') || msg.includes('result') || msg.includes('standing') || msg.includes('tally') || msg.includes('margin') || msg.includes('kaun aage') || msg.includes('kon aage') || msg.includes('kaun jeet')) {
        return "Live Election Standings & Leaderboard:\n\n• Click 'Results' in the top bar to open the Live Leaderboard.\n• The top hero card highlights the current #1 LEADING CANDIDATE and lead margin (+N votes).\n• Standings poll the server database every 3 seconds to reflect multi-device votes in real-time!";
    }

    // 8. VVPAT & RECEIPTS
    if (msg.includes('vvpat') || msg.includes('receipt') || msg.includes('paper') || msg.includes('slip') || msg.includes('hash') || msg.includes('transaction')) {
        return "VVPAT (Voter Verifiable Paper Audit Trail):\n\n• After entering your 4-digit PIN, a VVPAT paper slip is rendered on-screen for 7 seconds.\n• It displays your chosen Candidate Name, Party Symbol, and unique Blockchain Tx Hash (e.g., 0x2834...).\n• Your cryptographic receipt is permanently stored under 'Voting History' on your Voter Dashboard!";
    }

    // 9. SINGLE-VOTE POLICY & LOGOUT
    if (msg.includes('twice') || msg.includes('duplicate') || msg.includes('multiple vote') || msg.includes('again') || msg.includes('one vote') || msg.includes('logout') || msg.includes('dobara')) {
        return "Single-Vote Policy:\n\nEach verified Voter ID (EPIC) is strictly allowed ONE vote per election. Once submitted, the system commits your vote hash to the database ledger and automatically logs out your session to guarantee election integrity.";
    }

    // 10. NRI OVERSEAS VOTERS
    if (msg.includes('nri') || msg.includes('overseas') || msg.includes('passport') || msg.includes('abroad') || msg.includes('form 6a') || msg.includes('foreign')) {
        return "NRI Overseas Electors:\n\nUnder Section 20A of the Representation of the People Act 1951, Indian citizens residing abroad register via Form 6A. On our portal, click '✈️ NRI Overseas Elector' on the Login page with your valid Passport number to gain access.";
    }

    // 11. ADMIN AUDIT LEDGER & SESSION TIMER
    if (msg.includes('admin') || msg.includes('ledger') || msg.includes('audit') || msg.includes('officer') || msg.includes('timer') || msg.includes('6 min') || msg.includes('timeout')) {
        return "Admin Audit Ledger & Security:\n\n• The Administrator Panel features a Live Cryptographic Audit Ledger table polling every 3 seconds with EPIC IDs, Wallet Addresses, Candidate choices, Tx Hashes, and Timestamps.\n• For security, voter sessions automatically expire after 6 minutes of inactivity.";
    }

    // 12. CIVIC, CONSTITUTIONAL & TECH KNOWLEDGE
    if (msg.includes('democracy') || msg.includes('constitution') || msg.includes('article 324')) {
        return "Democracy in India operates under the Constitution of India. India is a sovereign, socialist, secular, democratic republic where free and fair elections are mandated by Article 324 through independent secret ballots.";
    }

    if (msg.includes('eci') || msg.includes('election commission')) {
        return "The Election Commission of India (ECI) is an autonomous constitutional authority established under Article 324 of the Constitution to direct and control national and state elections.";
    }

    if (msg.includes('blockchain') || msg.includes('crypto')) {
        return "Blockchain technology in e-voting uses cryptographic hash functions and immutable distributed ledgers to provide tamper-proof, auditable vote receipts while preserving voter anonymity.";
    }

    // 13. DYNAMIC GENERATOR FOR GENERAL / UNRECOGNIZED QUESTIONS
    // Extract key nouns/words to formulate a direct, non-repetitive custom answer.
    const cleanQuery = raw.replace(/[^\w\s]/gi, '').trim();
    const words = cleanQuery.split(/\s+/).filter(w => w.length > 2);
    const keyTopic = words.length > 0 ? words.slice(0, 3).join(' ') : 'your topic';

    return `Query: "${raw}"\n\nAnswer: Regarding ${keyTopic}, the Digital Voting System of India (voteadhikar) provides a secure, Web3-enabled election portal.\n\nQuick Assistance:\n• 🗳️ Cast Ballot: Go to 'Vote' page -> Connect Wallet -> Select Candidate -> Enter 4-digit PIN\n• 📊 Live Results: Check 'Results' tab for live 3-second standings\n• 📷 Voter ID: Click 'Scan Voter ID Card' on Login page for instant QR verification\n\nIf you have a specific question about candidates, VVPAT receipts, or MetaMask, feel free to ask!`;
}

exports.handleChat = async (req, res) => {
    try {
        const { message, userData, systemData } = req.body || {};

        if (!message || !String(message).trim()) {
            return res.status(400).json({ reply: "Message is required" });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;

        const systemPrompt = `
You are the official intelligent AI Assistant for the Digital Voting System of India (voteadhikar).

Voter Context:
- Voter ID: ${userData?.voterId || 'TXPPS1893L'}
- Has Wallet Connected: ${userData?.hasWallet ? 'Yes' : 'No'}
- Has Cast Ballot: ${userData?.hasVoted ? 'Yes' : 'No'}

Portal Features Knowledge:
- EVM Model M3 Ballot Unit emulation with blue vote buttons and buzzer sound.
- MetaMask Web3 Wallet connection for cryptographic signature signing.
- Voter ID QR Code Scanner (camera + photo upload) with green Verified tick.
- 4-Digit Security PIN modal verification (Default PIN: 1234).
- VVPAT Paper Audit Slip viewer displaying blockchain transaction hash (e.g. 0x2834...).
- Fictional Candidates Only: Aarav Mehta (PDA), Priya Sharma (NPF), Kabir Verma (URP), Ananya Rao (DFL), Rohan Kapoor (PWM), Meera Joshi (ICG), NOTA.
- Live Leaderboard polling every 3 seconds showing leading candidate and vote lead margin.
- Admin Cryptographic Audit Ledger polling every 3 seconds.
- Single-vote policy per EPIC voter with auto logout.

Instructions:
- If asked a project/voting question, give clear, friendly, step-by-step guidance.
- If asked a general knowledge, civic, technical, or conversational question, answer it directly and accurately in 2-4 sentences.
- Address the user's exact query directly. Never output static unhelpful templates.
`;

        const models = [
            "google/gemma-2-9b-it:free",
            "meta-llama/llama-3.1-8b-instruct:free",
            "mistralai/mistral-7b-instruct:free",
            "openchat/openchat-7b:free",
            "qwen/qwen-2.5-7b-instruct:free"
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
                            max_tokens: 350
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
            reply = getTrainedProjectReply(message, userData, systemData);
        }

        return res.json({ reply, success: true });

    } catch (err) {
        console.error("AI Chatbot Controller error:", err);
        const fallback = getTrainedProjectReply(req.body?.message, req.body?.userData, req.body?.systemData);
        return res.json({ reply: fallback });
    }
};
