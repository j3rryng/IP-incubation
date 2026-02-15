// ===== LEADERBOARD DATA =====
let leaderboardData = [];
let currentUser = null;

// ===== FIREBASE INTEGRATION =====
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyAQB89Td3YGWMlokZ4C6oPpn2j91y6uQsM",
    authDomain: "iplogininc.firebaseapp.com",
    projectId: "iplogininc",
    storageBucket: "iplogininc.firebasestorage.app",
    messagingSenderId: "600493251801",
    appId: "1:600493251801:web:22adeb0f992cfb7fbd32c8",
    measurementId: "G-6YQ5RH84N9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUserId = null;

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
    // Generate very high XP for top players (10,000 - 50,000 range)
    // This pushes normal players into the thousands in ranking
    return Math.floor(Math.random() * 40000) + 10000;
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
    // Wait for Firebase auth to initialize
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUserId = user.uid;
            console.log('✓ User logged in:', user.email);
            await initializeLeaderboard();
        } else {
            console.log('⚠ No user logged in, using guest mode');
            await initializeLeaderboard();
        }
    });
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
    
    // ===== GET CURRENT USER FROM FIREBASE =====
    if (currentUserId) {
        try {
            const userRef = doc(db, 'users', currentUserId);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const userXP = userData.xp || 0;
                const userCredits = userData.credits || 0;
                const userEmail = auth.currentUser?.email || 'User';
                
                // Get profile picture if available
                let userAvatar = localStorage.getItem('profilePicture');
                if (!userAvatar) {
                    const userProfile = await generateRandomProfile();
                    userAvatar = userProfile.avatar;
                }
                
                currentUser = {
                    userId: currentUserId,
                    name: userEmail.split('@')[0], // Use email username as name
                    email: userEmail,
                    avatar: userAvatar,
                    xp: userXP,
                    level: calculateLevel(userXP),
                    credits: userCredits,
                    rank: calculateUserRank(userXP)
                };
                
                console.log('✓ Loaded user from Firebase:', {
                    email: currentUser.email,
                    xp: currentUser.xp,
                    credits: currentUser.credits,
                    level: currentUser.level
                });
            } else {
                console.log('⚠ User document not found in Firestore');
                createGuestUser();
            }
        } catch (error) {
            console.error('Error loading user from Firebase:', error);
            createGuestUser();
        }
    } else {
        createGuestUser();
    }
}

function createGuestUser() {
    const guestProfile = {
        name: 'Guest',
        avatar: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2240%22 fill=%22%23666%22/%3E%3C/svg%3E'
    };
    
    currentUser = {
        userId: null,
        name: guestProfile.name,
        avatar: guestProfile.avatar,
        xp: 0,
        level: 1,
        credits: 0,
        rank: leaderboardData.length + 1
    };
    
    console.log('⚠ Guest mode activated');
}

// Calculate user's rank based on their XP compared to leaderboard
function calculateUserRank(userXP) {
    // Count how many of the top 20 have more XP than user
    let rank = 1;
    for (let i = 0; i < leaderboardData.length; i++) {
        if (leaderboardData[i].xp > userXP) {
            rank++;
        }
    }
    
    // Simulate thousands of players between top 20 and the user
    // Add additional rank based on XP deficit
    // For every 100 XP difference from rank 20, add ~50 more players
    if (rank > 20 && leaderboardData.length > 0) {
        const rank20XP = leaderboardData[19].xp; // 20th place XP
        const xpDifference = rank20XP - userXP;
        const additionalPlayers = Math.floor(xpDifference / 100) * 50;
        rank = 20 + Math.max(1, additionalPlayers);
    }
    
    return rank;
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
    window.location.href = 'index.html';
}

function shareLeaderboard() {
    if (!currentUser) {
        showNotification('Loading user data...', 'info');
        return;
    }
    
    const shareText = `🏆 INCubation Leaderboard\n\nMy Rank: #${currentUser.rank.toLocaleString()}\nXP: ${currentUser.xp.toLocaleString()}\nLevel: ${currentUser.level}\nCredits: ${currentUser.credits} CR\n\nCan you beat my score?`;
    
    // Try Web Share API if available (works on mobile)
    if (navigator.share) {
        navigator.share({
            title: 'INCubation Leaderboard',
            text: shareText,
            url: window.location.href
        }).then(() => {
            showNotification('Shared successfully!', 'success');
        }).catch(err => {
            // User cancelled or error - show fallback
            if (err.name !== 'AbortError') {
                copyToClipboard(shareText);
            }
        });
    } else {
        // Fallback to copy to clipboard for desktop
        copyToClipboard(shareText);
    }
}

// Expose functions to window so they can be called from HTML
window.goBack = goBack;
window.shareLeaderboard = shareLeaderboard;

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
    addXP: async (amount) => {
        if (currentUser) {
            const oldXP = currentUser.xp;
            currentUser.xp = Math.min(currentUser.xp + amount, 100000); // Cap at 100,000
            currentUser.level = calculateLevel(currentUser.xp);
            currentUser.rank = calculateUserRank(currentUser.xp);
            
            // Update in Firebase if user is logged in
            if (currentUser.userId) {
                try {
                    const userRef = doc(db, 'users', currentUser.userId);
                    await updateDoc(userRef, {
                        xp: currentUser.xp
                    });
                    console.log(`✓ Added ${amount} XP in Firebase: ${oldXP} → ${currentUser.xp}`);
                } catch (error) {
                    console.error('Error updating XP in Firebase:', error);
                }
            }
            
            updateUserStats();
            showNotification(`+${amount} XP earned!`, 'success');
        }
    },
    addCredits: async (amount) => {
        if (currentUser) {
            const oldCredits = currentUser.credits;
            currentUser.credits += amount;
            
            // Update in Firebase if user is logged in
            if (currentUser.userId) {
                try {
                    const userRef = doc(db, 'users', currentUser.userId);
                    await updateDoc(userRef, {
                        credits: currentUser.credits
                    });
                    console.log(`✓ Added ${amount} CR in Firebase: ${oldCredits} → ${currentUser.credits}`);
                } catch (error) {
                    console.error('Error updating credits in Firebase:', error);
                }
            }
            
            updateUserStats();
            showNotification(`+${amount} CR earned!`, 'success');
        }
    },
    syncWithFirebase: async () => {
        // Force sync current user stats with Firebase
        if (currentUser && currentUser.userId) {
            try {
                const userRef = doc(db, 'users', currentUser.userId);
                await updateDoc(userRef, {
                    xp: currentUser.xp,
                    credits: currentUser.credits
                });
                console.log('✓ Synced leaderboard data with Firebase');
            } catch (error) {
                console.error('Error syncing with Firebase:', error);
            }
        }
    }
};

// Auto-save every 30 seconds if user is logged in
setInterval(() => {
    if (currentUser && currentUser.userId) {
        window.leaderboardAPI.syncWithFirebase();
    }
}, 30000);

console.log('leaderboard.js loaded and connected to Firebase');