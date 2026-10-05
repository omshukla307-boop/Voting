const supabase = require('../config/supabaseClient');

async function testConnection() {
    console.log("Connecting to Supabase API at https://bjpprkuklwfiqqwrpxld.supabase.co...");
    
    // Test basic ping to Supabase service
    const { data, error } = await supabase.from('Users').select('*').limit(1);

    if (error) {
        if (error.code === 'PGRST301' || error.message.includes('does not exist') || error.code === '42P01') {
            console.log("⚡ Supabase API Connected successfully!");
            console.log("ℹ️ Tables (Users, Elections, Candidates, Votes) are ready to be created via SQL schema.");
        } else {
            console.log("Supabase Response:", error.message);
        }
    } else {
        console.log("🎉 SUCCESS! Supabase API and Users table connected successfully!");
        console.log("Data:", data);
    }
}

testConnection();
