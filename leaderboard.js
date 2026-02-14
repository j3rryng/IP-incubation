// ===== LEADERBOARD DATA =====
let leaderboardData = [];
let currentUser = null;

// ===== API FUNCTIONS =====
async function generateRandomProfile() {
    try {
        const response = await fetch('https://randomuser.me/api/');
        const data = await response.json();
        const user = data.results[0];
        return {
            name: `${user.name.first} ${user.name.last}`,
            avatar: user.picture.large
        };
    } catch (error) {
        console.error('Error fetching random profile:', error);
        return {
            name: `Player${Math.floor(Math.random() * 1000)}`,
            avatar: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2240%22 fill=%22%23666%22/%3E%3C/svg%3E'
        };
    }
}

function generateRandomXP() {
    // Max XP is 6000
    return Math.floor(Math.random() * 6000);
}

function calculateLevel(xp) {
    // Every 500 XP = 1 level
    return Math.floor(xp / 500) + 1;
}

function getXPForNextLevel(xp) {
    const currentLevel = calculateLevel(xp);
    const xpInCurrentLevel = xp % 500;
    return {
        current: xpInCurrentLevel,
        max: 500,
        level: currentLevel
    };
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async function() {
    await initializeLeaderboard();
});

async function initializeLeaderboard() {
    // Generate leaderboard data from API
    await generateLeaderboardData();
    
    // Update podium
    updatePodium();
    
    // Render rankings
    renderRankings();
    
    // Update user stats
    updateUserStats();
}

async function generateLeaderboardData() {
    const promises = [];
    
    // Generate 20 random players
    for (let i = 0; i < 20; i++) {
        promises.push(generateRandomProfile());
    }
    
    const profiles = await Promise.all(promises);
    
    leaderboardData = profiles.map((profile, index) => {
        const xp = generateRandomXP();
        return {
            rank: index + 1,
            name: profile.name,
            avatar: profile.avatar,
            xp: xp,
            level: calculateLevel(xp),
            credits: Math.floor(Math.random() * 5000) + 500
        };
    });
    
    // Sort by XP (descending)
    leaderboardData.sort((a, b) => b.xp - a.xp);
    
    // Update ranks
    leaderboardData.forEach((player, index) => {
        player.rank = index + 1;
    });
    
    // Generate current user
    const userProfile = await generateRandomProfile();
    const userXP = Math.floor(Math.random() * 4000) + 1000;
    currentUser = {
        name: userProfile.name,
        avatar: userProfile.avatar,
        xp: userXP,
        level: calculateLevel(userXP),
        credits: 1500,
        rank: Math.floor(Math.random() * 15) + 5 // Rank between 5-20
    };
}

// ===== UPDATE PODIUM =====
function updatePodium() {
    // First Place
    const player1 = leaderboardData[0];
    document.getElementById('player1Avatar').src = player1.avatar;
    document.getElementById('player1Name').textContent = player1.name;
    document.getElementById('player1Score').textContent = `${player1.xp.toLocaleString()} XP`;
    
    // Second Place
    const player2 = leaderboardData[1];
    document.getElementById('player2Avatar').src = player2.avatar;
    document.getElementById('player2Name').textContent = player2.name;
    document.getElementById('player2Score').textContent = `${player2.xp.toLocaleString()} XP`;
    
    // Third Place
    const player3 = leaderboardData[2];
    document.getElementById('player3Avatar').src = player3.avatar;
    document.getElementById('player3Name').textContent = player3.name;
    document.getElementById('player3Score').textContent = `${player3.xp.toLocaleString()} XP`;
}

// ===== RENDERING FUNCTIONS =====
function renderRankings() {
    const rankingsList = document.getElementById('rankingsList');
    rankingsList.innerHTML = '';

    leaderboardData.forEach(player => {
        const rankItem = createRankItem(player);
        rankingsList.appendChild(rankItem);
    });
}

function createRankItem(player) {
    const item = document.createElement('div');
    item.className = `rank-item ${player.rank <= 3 ? 'top-3' : ''}`;
    
    item.innerHTML = `
        <div class="rank-number">#${player.rank}</div>
        <img class="rank-avatar" src="${player.avatar}" alt="${player.name}" 
             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2240%22 fill=%22%23666%22/%3E%3C/svg%3E'">
        <div class="rank-player-info">
            <div class="rank-player-name">${player.name} <span style="font-size: 11px; color: rgba(255,255,255,0.5);">Lv.${player.level}</span></div>
            <div class="rank-player-score">${player.xp.toLocaleString()} XP</div>
        </div>
    `;

    return item;
}

// ===== UPDATE USER STATS =====
function updateUserStats() {
    if (!currentUser) return;
    
    // Update rank
    document.getElementById('userRank').textContent = `#${currentUser.rank}`;
    
    // Update XP
    document.getElementById('userXP').textContent = currentUser.xp.toLocaleString();
    
    // Update Credits
    document.getElementById('userCredits').textContent = `${currentUser.credits} CR`;
    
    // Update Level and XP bar
    const xpProgress = getXPForNextLevel(currentUser.xp);
    document.getElementById('userLevel').textContent = xpProgress.level;
    document.getElementById('currentXP').textContent = xpProgress.current;
    document.getElementById('maxXP').textContent = xpProgress.max;
    
    const percentage = (xpProgress.current / xpProgress.max) * 100;
    document.getElementById('xpFill').style.width = `${percentage}%`;
}

// ===== UTILITY FUNCTIONS =====
function goBack() {
    window.history.back();
}

function shareLeaderboard() {
    if (!currentUser) {
        showNotification('Loading user data...', 'info');
        return;
    }
    
    const shareText = `🏆 Leaderboard Update!\n\nMy Rank: #${currentUser.rank}\nXP: ${currentUser.xp.toLocaleString()}\nLevel: ${currentUser.level}\nCredits: ${currentUser.credits} CR\n\nCan you beat my score?`;
    
    // Try Web Share API if available
    if (navigator.share) {
        navigator.share({
            title: 'Leaderboard Stats',
            text: shareText
        }).catch(err => {
            // User cancelled or error - show fallback
            copyToClipboard(shareText);
        });
    } else {
        // Fallback to copy to clipboard
        copyToClipboard(shareText);
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Stats copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Failed to copy', 'error');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showNotification('Stats copied to clipboard!', 'success');
        } catch (err) {
            showNotification('Failed to copy', 'error');
        }
        document.body.removeChild(textArea);
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(127, 176, 105, 0.95)' : 
                      type === 'error' ? 'rgba(220, 53, 69, 0.95)' : 
                      'rgba(100, 100, 100, 0.95)'};
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        font-family: 'Courier New', monospace;
        font-size: 14px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ===== EXPORT FOR EXTERNAL USE =====
window.leaderboardAPI = {
    refreshLeaderboard: async () => {
        await generateLeaderboardData();
        updatePodium();
        renderRankings();
        updateUserStats();
    },
    getLeaderboard: () => leaderboardData,
    getCurrentUser: () => currentUser,
    addXP: (amount) => {
        if (currentUser) {
            currentUser.xp = Math.min(currentUser.xp + amount, 6000); // Cap at 6000
            currentUser.level = calculateLevel(currentUser.xp);
            updateUserStats();
        }
    },
    addCredits: (amount) => {
        if (currentUser) {
            currentUser.credits += amount;
            updateUserStats();
        }
    }
};