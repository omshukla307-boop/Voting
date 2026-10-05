// Supabase Client Config
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://bjpprkuklwfiqqwrpxld.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn("Warning: SUPABASE_URL or SUPABASE_KEY missing in environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
