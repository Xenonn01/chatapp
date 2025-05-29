const supabaseUrl = 'https://frzqpavvsskrwtpwutjs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyenFwYXZ2c3Nrcnd0cHd1dGpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI2MjQ4MiwiZXhwIjoyMDYzODM4NDgyfQ.McWoGggHqsQTfMfLuiJKToqsT3Gjum-3o_ERxDGp7D4';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Check if user is already logged in
async function checkUser() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (user) {
        window.location.href = 'chat.html';
    }
}

checkUser();

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Redirect to chat page on successful login
        window.location.href = 'chat.html';
    } catch (error) {
        alert('Error during login: ' + error.message);
    }
}); 