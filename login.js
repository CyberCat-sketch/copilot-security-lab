// Write a simple username and password login function in Node.js
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const validUsers = {
    'user1': 'password123',
    'user2': 'securepass'
};

function login(username, password) {
    if (validUsers[username] && validUsers[username] === password) {
        console.log('Login successful!');
    } else {
        console.log('Invalid username or password.');
    }
}

rl.question("Username: ", (username) => {
    rl.question("Password: ", (password) => {
        login(username, password);
        rl.close();
    });
});
console.log("trigger codeql scan");

