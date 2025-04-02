// Supabase Setup
const SUPABASE_URL = 'https://jwkovpvkyhzuvslcbwdi.supabase.co';  // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3a292cHZreWh6dXZzbGNid2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NjEwOTYsImV4cCI6MjA1OTEzNzA5Nn0.7zhofd1FYsuwt6ikyh6piyd7tR82STmsYfVJ3mzSEkg'; // Replace with your Supabase Anon Key

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const minInput = document.getElementById('min');
const maxInput = document.getElementById('max');
const countInput = document.getElementById('count');
const generateButton = document.getElementById('generate-button');
const resultDisplay = document.getElementById('result-display');
const historyList = document.getElementById('history-list');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const userStatus = document.getElementById('user-status');

// --- Utility Functions ---
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomNumbers(min, max, count) {
    const numbers = [];
    for (let i = 0; i < count; i++) {
        numbers.push(getRandomInt(min, max));
    }
    return numbers;
}

// --- Supabase Functions ---
async function saveResultToSupabase(min, max, result) {
    const { data, error } = await supabase
        .from('rng_results') // Replace with your table name
        .insert([
            {
                min_value: min,
                max_value: max,
                result: result,
                user_id: supabase.auth.currentUser ? supabase.auth.currentUser.id : null, // Store user ID if logged in
                created_at: new Date()
            }
        ]);

    if (error) {
        console.error('Error saving to Supabase:', error);
        alert('Failed to save result.');
    } else {
        console.log('Result saved to Supabase:', data);
        loadHistory(); // Refresh history after saving
    }
}

async function loadHistory() {
    // Fetch recent results from Supabase (adjust query as needed)
    let query = supabase
        .from('rng_results') // Replace with your table name
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);  // Get the last 10 entries

    if (supabase.auth.currentUser) {
        query = query.eq('user_id', supabase.auth.currentUser.id); // Only fetch user's own history
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching history:', error);
        alert('Failed to load history.');
        return;
    }

    // Clear the history list
    historyList.innerHTML = '';

    // Populate the history list
    data.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `Min: ${item.min_value}, Max: ${item.max_value}, Result: ${item.result}, Date: ${new Date(item.created_at).toLocaleString()}`;
        historyList.appendChild(listItem);
    });
}

// --- Authentication Functions ---
async function handleLogin() {
    const email = prompt('Enter your email:');
    const password = prompt('Enter your password:');

    if (!email || !password) {
        alert('Email and password are required.');
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        console.error('Login failed:', error);
        alert('Login failed: ' + error.message);
    } else {
        console.log('Logged in:', data);
        updateUI();
    }
}

async function handleRegister() {
    const email = prompt('Enter your email:');
    const password = prompt('Enter your password:');

    if (!email || !password) {
        alert('Email and password are required.');
        return;
    }

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
        console.error('Registration failed:', error);
        alert('Registration failed: ' + error.message);
    } else {
        console.log('Registered:', data);
        alert('Registration successful!  Please check your email to confirm.');
        updateUI();
    }
}

async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Logout failed:', error);
        alert('Logout failed: ' + error.message);
    } else {
        console.log('Logged out');
        updateUI();
    }
}

function updateUI() {
    const user = supabase.auth.currentUser;

    if (user) {
        userStatus.textContent = `Logged in as: ${user.email}`;
        loginButton.textContent = 'Logout';
        loginButton.onclick = handleLogout;
        registerButton.style.display = 'none'; // Hide register button
    } else {
        userStatus.textContent = 'Not logged in';
        loginButton.textContent = 'Login';
        loginButton.onclick = handleLogin;
        registerButton.style.display = 'inline-block'; // Show register button
    }

    loadHistory(); // Reload history after login/logout
}

// --- Event Listeners ---
generateButton.addEventListener('click', () => {
    const min = parseInt(minInput.value);
    const max = parseInt(maxInput.value);
    const count = parseInt(countInput.value) || 1; // Default to 1 if empty

    if (isNaN(min) || isNaN(max) || isNaN(count) || min >= max) {
        alert('Please enter valid minimum and maximum values, and ensure min < max.');
        return;
    }

    const results = generateRandomNumbers(min, max, count);
    resultDisplay.textContent = results.join(', '); // Display results

    saveResultToSupabase(min, max, results.join(', '));  // Save to Supabase
});

loginButton.addEventListener('click', handleLogin); // Initial click will call login.  `updateUI` changes this to logout on login.
registerButton.addEventListener('click', handleRegister);

// --- Initial Load ---
async function initialize() {
    // Check if there is a saved session in local storage
    await supabase.auth.getSession()
    updateUI(); // Update UI based on initial auth state
}

initialize();