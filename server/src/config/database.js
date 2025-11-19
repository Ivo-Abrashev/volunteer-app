// server/src/config/database.js
const { createClient } = require('@supabase/supabase-js');

// Взима credentials от .env файла
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Проверява дали credentials са налични
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Липсват Supabase credentials в .env файла!');
  process.exit(1);
}

// Създава Supabase клиент
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase клиент създаден успешно!');

module.exports = supabase;