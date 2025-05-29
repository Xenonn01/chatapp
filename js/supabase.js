import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = 'https://frzqpavvsskrwtpwutjs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyenFwYXZ2c3Nrcnd0cHd1dGpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI2MjQ4MiwiZXhwIjoyMDYzODM4NDgyfQ.McWoGggHqsQTfMfLuiJKToqsT3Gjum-3o_ERxDGp7D4';

// Create Supabase client
const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);

// Export the client for use in other files
window.supabaseClient = supabaseClient;