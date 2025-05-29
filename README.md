# Real-Time Chat Application

A real-time chat application built with Supabase for backend services and vanilla JavaScript for the frontend. This application allows users to register, login, and chat with other users in real-time.

## Features

- User authentication (register/login)
- Real-time messaging
- User search functionality
- Message history
- Real-time message updates
- Clean and responsive UI

## System Architecture

### Database Schema

The application uses two main tables in Supabase:

```sql
-- Users table
create table public.users (
  id uuid not null,
  email text not null,
  password text null,
  name character varying not null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
);

-- Messages table
create table public.messages (
  id bigserial not null,
  sender_id uuid null,
  receiver_id uuid null,
  message text not null,
  created_at timestamp with time zone null default now(),
  constraint messages_pkey primary key (id),
  constraint messages_receiver_id_fkey foreign KEY (receiver_id) references users (id) on delete CASCADE,
  constraint messages_sender_id_fkey foreign KEY (sender_id) references users (id) on delete CASCADE
);
```

## File Structure

```
/
├── register.html      # User registration page
├── login.html        # Login page
├── chat.html         # Main chat interface
└── js/
    ├── supabase.js   # Supabase configuration
    ├── register.js   # Registration logic
    ├── login.js      # Login logic
    └── chat.js       # Chat functionality
```

## Component Details

### 1. Registration System (`register.html`, `js/register.js`)
- User registration form with name, email, and password
- Creates user in Supabase Auth and public users table
- Handles validation and error messages
- Redirects to login after successful registration

### 2. Login System (`login.html`, `js/login.js`)
- Login form with email and password
- Handles authentication through Supabase
- Session management
- Redirects to chat on successful login

### 3. Chat System (`chat.html`, `js/chat.js`)

The chat system is the core component with several key features:

#### User Management
```javascript
// Initialize current user
async function initializeUser() {
    // Gets current user details
    // Sets up the initial state
    // Loads user list
}

// Load and display users
async function loadUsers(searchTerm = '') {
    // Fetches users from database
    // Filters based on search term
    // Displays in the sidebar
}
```

#### Chat Functionality
```javascript
// Select user to chat with
async function selectUser(user) {
    // Updates selected user
    // Loads chat history
    // Sets up real-time subscription
}

// Load message history
async function loadMessages() {
    // Fetches previous messages
    // Displays in chat area
    // Handles empty states
}

// Real-time message handling
function subscribeToMessages() {
    // Sets up real-time subscription
    // Handles incoming messages
    // Updates UI in real-time
}
```

#### Message Handling
```javascript
// Send messages
document.getElementById('send-form').addEventListener('submit', async (e) => {
    // Handles message sending
    // Updates UI
    // Stores in database
});

// Display messages
function appendMessage(message) {
    // Formats message display
    // Handles timestamps
    // Updates scroll position
}
```

## Key Features Explained

### 1. Real-Time Communication
- Uses Supabase's real-time subscriptions
- Instant message delivery
- No need to refresh for updates

### 2. User Interface
- Clean, modern design
- Responsive layout
- Clear visual feedback
- Search functionality

### 3. Message Management
- Persistent message storage
- Message history loading
- Timestamp display
- Read receipts (optional)

## Security Features

1. Authentication
   - Secure password handling
   - Session management
   - Protected routes

2. Data Protection
   - SQL injection prevention
   - XSS protection
   - Input sanitization

## Usage

1. Registration:
   - Navigate to register.html
   - Fill in name, email, and password
   - Submit to create account

2. Login:
   - Navigate to login.html
   - Enter email and password
   - Access chat system

3. Chatting:
   - Select a user from the list
   - Type message in input box
   - Press send or Enter to send message
   - Messages appear in real-time

## Technical Implementation

### Supabase Integration
```javascript
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
```

### Real-Time Subscriptions
```javascript
messageSubscription = supabaseClient
    .channel('public:messages')
    .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        payload => {
            // Handle new messages
        }
    )
    .subscribe();
```

### Database Queries
```javascript
// Example: Fetch messages
const { data: messages } = await supabaseClient
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),
         and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`)
    .order('created_at');
```

## Error Handling

The application includes comprehensive error handling:
- Network errors
- Authentication failures
- Database errors
- Message sending failures
- Real-time connection issues

## Future Improvements

Potential enhancements:
1. Group chat functionality
2. File sharing
3. Message editing/deletion
4. User status (online/offline)
5. Message read receipts
6. Push notifications
7. Message search
8. Emoji support

## Dependencies

- Supabase (Backend as a Service)
- Bootstrap 5 (UI Framework)
- JavaScript (ES6+)
