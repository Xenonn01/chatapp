const supabaseUrl = 'https://frzqpavvsskrwtpwutjs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyenFwYXZ2c3Nrcnd0cHd1dGpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI2MjQ4MiwiZXhwIjoyMDYzODM4NDgyfQ.McWoGggHqsQTfMfLuiJKToqsT3Gjum-3o_ERxDGp7D4';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

let currentUser = null;
let selectedUser = null;
let messageSubscription = null;

// Function to display logged in user's name and get current user
async function initializeUser() {
    try {
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        
        if (userError) throw userError;

        if (user) {
            // Get user details from public.users table
            const { data: userData, error: profileError } = await supabaseClient
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;

            currentUser = userData;
            document.getElementById('username').textContent = userData.name;
            loadUsers();
        } else {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error fetching user:', error.message);
        window.location.href = 'login.html';
    }
}

// Function to load and display users
async function loadUsers(searchTerm = '') {
    try {
        const { data: users, error } = await supabaseClient
            .from('users')
            .select('*')
            .neq('id', currentUser.id)
            .ilike('name', `%${searchTerm}%`)
            .order('name');

        if (error) throw error;

        const userListContainer = document.getElementById('user-list-container');
        userListContainer.innerHTML = '';

        if (users.length === 0) {
            userListContainer.innerHTML = `
                <div class="p-3 text-center text-muted">
                    <p>No users found</p>
                </div>
            `;
            return;
        }

        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'list-group-item user-item';
            if (selectedUser && selectedUser.id === user.id) {
                userDiv.classList.add('selected');
            }

            userDiv.innerHTML = `
                <div class="d-flex flex-column">
                    <strong>${user.name}</strong>
                    <small class="text-muted">${user.email}</small>
                </div>
            `;

            // Add click event to start chat with user
            userDiv.addEventListener('click', () => {
                // Remove selected class from all users
                document.querySelectorAll('.user-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // Add selected class to clicked user
                userDiv.classList.add('selected');
                
                // Start chat with selected user
                selectUser(user);
            });

            userListContainer.appendChild(userDiv);
        });
    } catch (error) {
        console.error('Error loading users:', error.message);
        userListContainer.innerHTML = `
            <div class="p-3 text-center text-danger">
                <p>Error loading users</p>
            </div>
        `;
    }
}

// Function to select a user and start chat
async function selectUser(user) {
    try {
        // Update selected user
        selectedUser = user;
        
        // Update chat header with selected user's name
        const selectedUserHeader = document.getElementById('selected-user');
        selectedUserHeader.textContent = `Chat with ${user.name}`;
        selectedUserHeader.classList.remove('no-user-selected');
        selectedUserHeader.classList.add('selected-user-name');
        
        // Enable message input and button
        const messageInput = document.getElementById('message-input');
        const sendButton = document.querySelector('#send-form button');
        messageInput.disabled = false;
        sendButton.disabled = false;
        
        // Clear current messages
        const messagesContainer = document.getElementById('messages');
        messagesContainer.innerHTML = '';
        
        // Hide initial message
        const initialMessage = document.getElementById('initial-message');
        if (initialMessage) {
            initialMessage.style.display = 'none';
        }
        
        // Load existing messages
        await loadMessages();
        
        // Subscribe to new messages
        subscribeToMessages();
        
        // Focus on message input
        messageInput.focus();
    } catch (error) {
        console.error('Error selecting user:', error);
        alert('Error starting chat. Please try again.');
    }
}

// Function to load messages
async function loadMessages() {
    if (!selectedUser) return;

    try {
        const { data: messages, error } = await supabaseClient
            .from('messages')
            .select('*, sender:sender_id(*), receiver:receiver_id(*)')
            .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`)
            .order('created_at');

        if (error) throw error;

        const messagesContainer = document.getElementById('messages');
        messagesContainer.innerHTML = '';

        if (messages.length === 0) {
            // Show empty state message
            messagesContainer.innerHTML = `
                <div class="text-center text-muted p-3">
                    <p>No messages yet. Start the conversation!</p>
                </div>
            `;
        } else {
            // Display messages
            messages.forEach(message => {
                appendMessage(message);
            });
        }

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.error('Error loading messages:', error.message);
    }
}

// Function to append a message
function appendMessage(message) {
    const messagesContainer = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    if (message.sender_id === currentUser.id) {
        messageDiv.classList.add('you');
    }

    const time = new Date(message.created_at).toLocaleTimeString();
    messageDiv.innerHTML = `
        <div class="message-content">${message.message}</div>
        <div class="message-time">${time}</div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Function to subscribe to new messages
function subscribeToMessages() {
    if (messageSubscription) {
        supabaseClient.removeChannel(messageSubscription);
    }

    messageSubscription = supabaseClient
        .channel('public:messages')
        .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'messages' },
            payload => {
                const message = payload.new;
                if ((message.sender_id === currentUser.id && message.receiver_id === selectedUser.id) ||
                    (message.sender_id === selectedUser.id && message.receiver_id === currentUser.id)) {
                    appendMessage({
                        ...message,
                        sender: { id: message.sender_id },
                        receiver: { id: message.receiver_id }
                    });
                }
            }
        )
        .subscribe();
}

// Event Listeners
document.getElementById('search-user').addEventListener('input', (e) => {
    loadUsers(e.target.value.trim());
});

// Handle sending messages
document.getElementById('send-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!message || !selectedUser) return;

    try {
        const { error } = await supabaseClient
            .from('messages')
            .insert([{
                sender_id: currentUser.id,
                receiver_id: selectedUser.id,
                message: message
            }]);

        if (error) throw error;
        
        // Clear input after successful send
        input.value = '';
        input.focus();
    } catch (error) {
        console.error('Error sending message:', error.message);
        alert('Failed to send message');
    }
});

// Handle logout
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error signing out:', error.message);
    }
});

// Initialize the chat
initializeUser();

// Initialize Bootstrap dropdown
document.addEventListener('DOMContentLoaded', function() {
    var dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
    var dropdownList = dropdownElementList.map(function(dropdownToggleEl) {
        return new bootstrap.Dropdown(dropdownToggleEl);
    });
});

const searchInput = document.getElementById("search-user");
const resultsContainer = document.getElementById("user-results-list");

searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim();

  if (query.length === 0) {
    resultsContainer.innerHTML = "";
    return;
  }

  try {
    const { data, error } = await supabase.rpc("search_users", { query });

    if (error) throw error;

    resultsContainer.innerHTML = data
      .map(
        (user) => `
        <a href="#" class="list-group-item list-group-item-action">
          <strong>${user.name}</strong><br>
          <small>${user.email}</small>
        </a>`
      )
      .join("");
  } catch (err) {
    console.error("Search error:", err.message);
    resultsContainer.innerHTML = "<div class='text-danger'>Something went wrong.</div>";
  }
});

async function displayusersearchresults(query) {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('id, name, email')
            .ilike('name', `%${query}%`)
            .order('name');

        if (error) throw error;

        return data;
    } catch (err) {
        console.error('Search error:', err.message);
        return [];
    }
}



