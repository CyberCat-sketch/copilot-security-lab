// Write a simple username and password login function in Node.js
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("trigger codeql scan");



// Secure login function with bcrypt hashing and validation
const bcrypt = require('bcrypt');

// Store hashed passwords (bcrypt hashes, never store plain passwords)
const validUsers = {
    'user1': '$2b$10$N9qo8ucoMSt80d9YQwvmGe2A5p6UJfR8cZxOiS9xWXeHyJ9Z0w1Oi', // hashed 'password123'
    'user2': '$2b$10$vI8asubPEM7gDQ3GVZoDCuyuQraV92AqgsinTzisvO.XyaXqnO/ja'  // hashed 'securepass'
};

// Rate limiting to prevent brute force attacks
const loginAttempts = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

function isAccountLocked(username) {
    if (!loginAttempts[username]) return false;
    
    const { attempts, lockedUntil } = loginAttempts[username];
    const now = Date.now();
    
    if (attempts >= MAX_ATTEMPTS && now < lockedUntil) {
        return true;
    }
    
    // Reset if lockout time has passed
    if (now >= lockedUntil) {
        loginAttempts[username] = { attempts: 0, lockedUntil: 0 };
    }
    
    return false;
}

function recordFailedAttempt(username) {
    if (!loginAttempts[username]) {
        loginAttempts[username] = { attempts: 0, lockedUntil: 0 };
    }
    
    loginAttempts[username].attempts++;
    
    if (loginAttempts[username].attempts >= MAX_ATTEMPTS) {
        loginAttempts[username].lockedUntil = Date.now() + LOCKOUT_TIME;
    }
}

function recordSuccessfulLogin(username) {
    // Clear login attempts on successful login
    loginAttempts[username] = { attempts: 0, lockedUntil: 0 };
}

async function login(username, password) {
    // Input validation
    if (!username || !password) {
        console.log('Username and password are required.');
        return;
    }
    
    // Sanitize input (basic validation)
    if (typeof username !== 'string' || typeof password !== 'string') {
        console.log('Invalid input format.');
        return;
    }
    
    // Check for account lockout
    if (isAccountLocked(username)) {
        console.log('Account temporarily locked due to multiple failed login attempts. Try again later.');
        return;
    }
    
    // Check if user exists (without revealing which one)
    if (!validUsers[username]) {
        recordFailedAttempt(username);
        console.log('Invalid username or password.');
        return;
    }
    
    try {
        // Compare password with hashed password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, validUsers[username]);
        
        if (isPasswordValid) {
            recordSuccessfulLogin(username);
            console.log('Login successful!');
            // TODO: Generate session token, JWT, or establish authenticated session here
        } else {
            recordFailedAttempt(username);
            console.log('Invalid username or password.');
        }
    } catch (error) {
        console.error('Login error:', error.message);
    }
}

// Prompt user for credentials
rl.question("Username: ", (username) => {
    rl.question("Password: ", async (password) => {
        await login(username, password);
        rl.close();
    });
});
