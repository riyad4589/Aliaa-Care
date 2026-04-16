import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPacks() {
  const { data, error } = await supabase.from('packs').select('*');
  if (error) {
    console.error("Error fetching packs:", error);
  } else {
    console.log("Packs found:", data.length);
    console.log("Active packs:", data.filter(p => p.active).length);
    data.forEach(p => {
      console.log(`- Pack: ${p.name}, Active: ${p.active}`);
    });
  }
}

checkPacks();
