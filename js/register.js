const supabaseUrl = 'https://frzqpavvsskrwtpwutjs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyenFwYXZ2c3Nrcnd0cHd1dGpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI2MjQ4MiwiZXhwIjoyMDYzODM4NDgyfQ.McWoGggHqsQTfMfLuiJKToqsT3Gjum-3o_ERxDGp7D4';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        // First, create the auth user
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email,
            password,
        });

        if (authError) throw authError;

        // Then, insert the user's name into the public.users table
        const { error: profileError } = await supabaseClient
            .from('users')
            .insert([
                {
                    id: authData.user.id,
                    email: email,
                    name: name,
                    password: password,
                }
            ]);

        if (profileError) throw profileError;

        alert('Registration successful! Please check your email for verification.');
        window.location.href = 'login.html';
    } catch (error) {
        alert('Error during registration: ' + error.message);
    }
}); 