// Global variables
const candidates = ["BJP", "Congress", "AAP", "Nota"];
let votes = { BJP: 0, Congress: 0, AAP: 0, Nota: 0 };
let currentUser = null;
let hasVoted = false;
let isAdminLoggedIn = false;
let isVotingActive = localStorage.getItem("isVotingActive") === "true" || false;
let currentWinner = localStorage.getItem("currentWinner") || null;

// Predefined admin credentials
const ADMIN_CREDENTIALS = {
    id: "admin123",
    password: "admin@2024"
};

// DOM elements
const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");
const adminPanel = document.getElementById("adminPanel");
const adminDashboard = document.getElementById("adminDashboard");
const votingSystem = document.getElementById("votingSystem");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const adminLoginForm = document.getElementById("adminLoginForm");
const userName = document.getElementById("userName");
const form = document.getElementById("votingForm");
const resultsDiv = document.getElementById("results");
const resultsList = document.getElementById("resultsList");
const winnerPage = document.getElementById("winnerPage");
const winnerText = document.getElementById("winnerText");
const lastWinnerSpan = document.getElementById("lastWinner");
const historyList = document.getElementById("historyList");
const winnersList = document.getElementById("winnersList");
const imagePreview = document.getElementById("imagePreview");

// Load data from localStorage
let lastWinner = localStorage.getItem("lastWinner") || "None";
let winners = JSON.parse(localStorage.getItem("winners") || "[]");
let history = JSON.parse(localStorage.getItem("history") || "[]");
let users = JSON.parse(localStorage.getItem("users") || "[]");
let votedUsers = JSON.parse(localStorage.getItem("votedUsers") || "[]");

// Check if user is already logged in
function checkLoggedInUser() {
    const loggedInUser = localStorage.getItem("currentUser");
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
        checkVotingStatus();
    }
}

// Check if current user has already voted
function checkVotingStatus() {
    if (currentUser) {
        hasVoted = votedUsers.includes(currentUser.mobile);
        
        // Check if voting has ended and show winner
        if (!isVotingActive && currentWinner) {
            alert(`Voting has ended! The winner is: ${currentWinner} 🏆`);
            logout();
            return;
        }
        
        if (hasVoted) {
            alert("You have already voted in this round. Please wait for the winner to be announced.");
            logout();
            return;
        }
        
        if (!isVotingActive) {
            alert("Voting is currently inactive. Please wait for the admin to start voting.");
            logout();
            return;
        }
        
        showVotingSystem();
    }
}

// Initialize the app
checkLoggedInUser();
updateLastWinner();
updateWinnersList();
updateHistory();

// Event Listeners
loginForm.addEventListener("submit", handleLogin);
registerForm.addEventListener("submit", handleRegister);
adminLoginForm.addEventListener("submit", handleAdminLogin);

// Image preview functionality
document.getElementById("regImage").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 150px; max-height: 150px; border-radius: 8px;">`;
        };
        reader.readAsDataURL(file);
    }
});

// Authentication Functions
function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const mobile = formData.get("mobile");
    const password = formData.get("password");

    const user = users.find(u => 
        u.mobile === mobile && 
        u.password === password
    );

    if (user) {
        currentUser = user;
        localStorage.setItem("currentUser", JSON.stringify(user));
        checkVotingStatus();
        alert("Login successful!");
    } else {
        alert("Invalid credentials. Please check your mobile number and password.");
    }
}

function handleAdminLogin(event) {
    event.preventDefault();
    const formData = new FormData(adminLoginForm);
    const adminId = formData.get("adminId");
    const adminPassword = formData.get("adminPassword");

    if (adminId === ADMIN_CREDENTIALS.id && adminPassword === ADMIN_CREDENTIALS.password) {
        isAdminLoggedIn = true;
        showAdminDashboard();
        updateAdminStats();
        alert("Admin login successful!");
    } else {
        alert("Invalid admin credentials!");
    }
}

function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const name = formData.get("name");
    const mobile = formData.get("mobile");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");
    const imageFile = formData.get("image");

    // Validation
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    if (users.some(u => u.mobile === mobile)) {
        alert("Mobile number already registered!");
        return;
    }

    // Convert image to base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        const newUser = {
            name: name,
            mobile: mobile,
            password: password,
            role: "voter", // Default role as voter
            image: imageData,
            registeredAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        
        alert("Registration successful! Please login.");
        showLogin();
    };
    reader.readAsDataURL(imageFile);
}

// UI Functions
function showLogin() {
    loginSection.classList.remove("hidden");
    registerSection.classList.add("hidden");
    adminPanel.classList.add("hidden");
    adminDashboard.classList.add("hidden");
    votingSystem.classList.add("hidden");
}

function showRegister() {
    loginSection.classList.add("hidden");
    registerSection.classList.remove("hidden");
    adminPanel.classList.add("hidden");
    adminDashboard.classList.add("hidden");
    votingSystem.classList.add("hidden");
}

function showAdminPanel() {
    loginSection.classList.add("hidden");
    registerSection.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    adminDashboard.classList.add("hidden");
    votingSystem.classList.add("hidden");
}

function showAdminDashboard() {
    loginSection.classList.add("hidden");
    registerSection.classList.add("hidden");
    adminPanel.classList.add("hidden");
    adminDashboard.classList.remove("hidden");
    votingSystem.classList.add("hidden");
}

function showVotingSystem() {
    loginSection.classList.add("hidden");
    registerSection.classList.add("hidden");
    adminPanel.classList.add("hidden");
    adminDashboard.classList.add("hidden");
    votingSystem.classList.remove("hidden");
    userName.textContent = currentUser.name;
}

function logout() {
    currentUser = null;
    localStorage.removeItem("currentUser");
    showLogin();
}

function adminLogout() {
    isAdminLoggedIn = false;
    showLogin();
}

// Admin Functions
function updateAdminStats() {
    document.getElementById("totalUsers").textContent = users.length;
    document.getElementById("totalVotes").textContent = history.length;
    document.getElementById("currentWinner").textContent = lastWinner;
    document.getElementById("activeRound").textContent = isVotingActive ? "Active" : "Inactive";
}

// Voting Control Functions
function startVoting() {
    if (confirm("Are you sure you want to start the voting system?")) {
        isVotingActive = true;
        localStorage.setItem("isVotingActive", "true");
        updateAdminStats();
        alert("Voting system is now ACTIVE! Voters can now cast their votes.");
    }
}

function endVoting() {
    if (confirm("Are you sure you want to end the voting system?")) {
        isVotingActive = false;
        localStorage.setItem("isVotingActive", "false");
        updateAdminStats();
        alert("Voting system is now INACTIVE! Voters cannot cast votes anymore.");
    }
}

function showVotingResults() {
    if (!isVotingActive && Object.values(votes).some(vote => vote > 0)) {
        // Calculate winner
        const maxVotes = Math.max(...Object.values(votes));
        const winners = Object.keys(votes).filter(candidate => votes[candidate] === maxVotes);
        const winner = winners.length === 1 ? winners[0] : "Tie";
        
        currentWinner = winner;
        localStorage.setItem("currentWinner", winner);
        
        const adminResults = document.getElementById("adminResults");
        const adminResultsContent = document.getElementById("adminResultsContent");
        
        let content = "<h4>Voting Results:</h4>";
        content += "<div class='results-summary'>";
        content += `<h3>🏆 Winner: ${winner}</h3>`;
        content += "<ul>";
        candidates.forEach(candidate => {
            content += `<li><strong>${candidate}:</strong> ${votes[candidate]} vote(s)</li>`;
        });
        content += "</ul>";
        content += "</div>";
        
        adminResultsContent.innerHTML = content;
        adminResults.classList.remove("hidden");
    } else if (isVotingActive) {
        alert("Voting is still active. Please end voting first to see results.");
    } else {
        alert("No votes have been cast yet.");
    }
}

function resetVotingSystem() {
    if (confirm("Are you sure you want to reset the voting system? This will clear all votes and start a new round.")) {
        votes = { BJP: 0, Congress: 0, AAP: 0, Nota: 0 };
        votedUsers = [];
        history = [];
        isVotingActive = false;
        currentWinner = null;
        localStorage.setItem("votedUsers", JSON.stringify(votedUsers));
        localStorage.setItem("history", JSON.stringify(history));
        localStorage.setItem("isVotingActive", "false");
        localStorage.setItem("currentWinner", "");
        updateAdminStats();
        alert("Voting system has been reset!");
    }
}

function viewAllUsers() {
    const adminResults = document.getElementById("adminResults");
    const adminResultsContent = document.getElementById("adminResultsContent");
    
    let content = "<h4>Registered Users:</h4><ul>";
    users.forEach(user => {
        content += `<li><strong>${user.name}</strong> - ${user.mobile} (${user.role}) - Registered: ${new Date(user.registeredAt).toLocaleDateString()}</li>`;
    });
    content += "</ul>";
    
    adminResultsContent.innerHTML = content;
    adminResults.classList.remove("hidden");
}

function viewVotingHistory() {
    const adminResults = document.getElementById("adminResults");
    const adminResultsContent = document.getElementById("adminResultsContent");
    
    let content = "<h4>Voting History:</h4><ul>";
    history.forEach(vote => {
        content += `<li>${vote}</li>`;
    });
    content += "</ul>";
    
    adminResultsContent.innerHTML = content;
    adminResults.classList.remove("hidden");
}

function clearAllData() {
    if (confirm("WARNING: This will delete ALL data including users, votes, and history. This action cannot be undone. Are you sure?")) {
        users = [];
        votes = { BJP: 0, Congress: 0, AAP: 0, Nota: 0 };
        votedUsers = [];
        history = [];
        winners = [];
        lastWinner = "None";
        isVotingActive = false;
        currentWinner = null;
        
        localStorage.clear();
        localStorage.setItem("lastWinner", "None");
        localStorage.setItem("isVotingActive", "false");
        localStorage.setItem("currentWinner", "");
        
        updateAdminStats();
        alert("All data has been cleared!");
    }
}

function closeResults() {
    document.getElementById("adminResults").classList.add("hidden");
}

// Voting System Functions
form.addEventListener("submit", function(event) {
    event.preventDefault();
    
    // Check if voting is active
    if (!isVotingActive) {
        alert("Voting is currently inactive. Please wait for the admin to start voting.");
        return;
    }
    
    // Check if user has already voted
    if (hasVoted) {
        alert("You have already voted in this round. Please wait for the winner to be announced.");
        logout();
        return;
    }
    
    const formData = new FormData(form);
    const selected = formData.get("candidate");
    if (selected && votes.hasOwnProperty(selected)) {
        votes[selected]++;
        addToHistory(selected);
        
        // Mark user as voted
        votedUsers.push(currentUser.mobile);
        localStorage.setItem("votedUsers", JSON.stringify(votedUsers));
        hasVoted = true;
        
        // Show results and log out user
        showResults();
        setTimeout(() => {
            alert("Thank you for voting! You have been logged out. Please wait for the winner to be announced.");
            logout();
        }, 2000);
        
        if (votes[selected] >= 3) {
            showWinner(selected);
        }
    }
});

function showResults() {
    form.classList.add("hidden");
    resultsDiv.classList.remove("hidden");
    winnerPage.classList.add("hidden");
    resultsList.innerHTML = "";
    candidates.forEach(candidate => {
        const li = document.createElement("li");
        li.textContent = `${candidate}: ${votes[candidate]} vote(s)`;
        resultsList.appendChild(li);
    });
}

function showWinner(winner) {
    form.classList.add("hidden");
    resultsDiv.classList.add("hidden");
    winnerPage.classList.remove("hidden");
    winnerText.textContent = `Winner: ${winner}! 🎉`;
    lastWinner = winner;
    localStorage.setItem("lastWinner", winner);
    
    // Add winner to winners list
    addToWinnersList(winner);
    
    // Reset voted users for new round
    votedUsers = [];
    localStorage.setItem("votedUsers", JSON.stringify(votedUsers));
    
    updateLastWinner();
}

window.resetVote = function() {
    form.reset();
    form.classList.remove("hidden");
    resultsDiv.classList.add("hidden");
    winnerPage.classList.add("hidden");
};

window.resetAll = function() {
    votes = { BJP: 0, Congress: 0, AAP: 0, Nota: 0 };
    // Reset voted users for new round
    votedUsers = [];
    localStorage.setItem("votedUsers", JSON.stringify(votedUsers));
    window.resetVote();
};

function updateLastWinner() {
    lastWinnerSpan.textContent = lastWinner;
}

function addToWinnersList(winner) {
    const now = new Date();
    const winnerEntry = {
        name: winner,
        timestamp: now.toLocaleString(),
        date: now.toISOString()
    };
    winners.unshift(winnerEntry);
    localStorage.setItem("winners", JSON.stringify(winners));
    updateWinnersList();
}

function updateWinnersList() {
    winnersList.innerHTML = "";
    if (winners.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No winners yet.";
        li.className = "no-winners";
        winnersList.appendChild(li);
    } else {
        winners.forEach((winner, index) => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${winner.name}</strong> - ${winner.timestamp}`;
            if (index === 0) {
                li.className = "latest-winner";
            }
            winnersList.appendChild(li);
        });
    }
}

window.clearWinnersList = function() {
    if (confirm("Are you sure you want to clear the winners list?")) {
        winners = [];
        localStorage.setItem("winners", JSON.stringify(winners));
        updateWinnersList();
    }
};

function addToHistory(candidate) {
    const now = new Date();
    const entry = `${candidate} (${now.toLocaleString()})`;
    history.unshift(entry);
    if (history.length > 10) history.pop();
    localStorage.setItem("history", JSON.stringify(history));
    updateHistory();
}

function updateHistory() {
    historyList.innerHTML = "";
    if (history.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No votes yet.";
        historyList.appendChild(li);
    } else {
        history.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            historyList.appendChild(li);
        });
    }
}

// Global functions for HTML onclick
window.showLogin = showLogin;
window.showRegister = showRegister;
window.showAdminPanel = showAdminPanel;
window.logout = logout;
window.adminLogout = adminLogout;
window.resetVotingSystem = resetVotingSystem;
window.viewAllUsers = viewAllUsers;
window.viewVotingHistory = viewVotingHistory;
window.clearAllData = clearAllData;
window.closeResults = closeResults;
window.startVoting = startVoting;
window.endVoting = endVoting;
window.showVotingResults = showVotingResults; 