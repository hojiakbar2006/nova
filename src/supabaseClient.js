import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sqgkhhjswwzxtqwdigks.supabase.co'; // Loyiha URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZ2toaGpzd3d6eHRxd2RpZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMTU0NDUsImV4cCI6MjA3NDc5MTQ0NX0.FXs0U_SXjW1t-JaKA0xK3VVeLInLoBBAyLpX5w15_9Q'; // Public anon key (Dashboard > API)
export const supabase = createClient(supabaseUrl, supabaseKey);