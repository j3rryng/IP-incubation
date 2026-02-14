// Audio element for background music
let backgroundMusic = null;

// Initialize settings on page load
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    initializeMusic();
});

// Load saved settings from localStorage
function loadSettings() {
    // Load music toggle state
    const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
    document.getElementById('musicToggle').checked = musicEnabled;
    
    // Load dark mode state
    const darkModeEnabled = localStorage.getItem('darkModeEnabled') === 'true';
    document.getElementById('darkModeToggle').checked = darkModeEnabled;
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
    }
    
    // Load notifications state
    const notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
    document.getElementById('notificationsToggle').checked = notificationsEnabled;
}

// Initialize background music
function initializeMusic() {
    // Create audio element
    backgroundMusic = new Audio();
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
    
    // You can set your music file here
    // backgroundMusic.src = 'background-music.mp3';
    
    // Start music if enabled
    const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
    if (musicEnabled && backgroundMusic.src) {
        playMusic();
    }
}

// Toggle music background
function toggleMusic() {
    const isEnabled = document.getElementById('musicToggle').checked;
    localStorage.setItem('musicEnabled', isEnabled);
    
    if (isEnabled) {
        playMusic();
        showNotification('Music enabled');
    } else {
        pauseMusic();
        showNotification('Music disabled');
    }
}

// Play background music
function playMusic() {
    if (backgroundMusic && backgroundMusic.src) {
        backgroundMusic.play().catch(error => {
            console.log('Music playback failed:', error);
        });
    }
}

// Pause background music
function pauseMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
    }
}

// Toggle dark mode
function toggleDarkMode() {
    const isEnabled = document.getElementById('darkModeToggle').checked;
    localStorage.setItem('darkModeEnabled', isEnabled);
    
    if (isEnabled) {
        document.body.classList.add('dark-mode');
        showNotification('Dark mode enabled');
    } else {
        document.body.classList.remove('dark-mode');
        showNotification('Dark mode disabled');
    }
}

// Toggle notifications
function toggleNotifications() {
    const isEnabled = document.getElementById('notificationsToggle').checked;
    localStorage.setItem('notificationsEnabled', isEnabled);
    
    if (isEnabled) {
        showNotification('Notifications enabled');
        // Request notification permission if not already granted
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    } else {
        showNotification('Notifications disabled');
    }
}

// Navigation functions
function goBack() {
    // Add animation before going back
    document.querySelector('.container').style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 300);
}

function openDataPrivacy() {
    showNotification('Opening Data & Privacy settings...');
    // You can redirect to a data privacy page or open a modal
    // window.location.href = 'data-privacy.html';
}

// Profile editing functions
function editProfile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('profileImg').src = e.target.result;
                localStorage.setItem('profilePicture', e.target.result);
                showNotification('Profile picture updated!');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function editUsername() {
    const currentUsername = localStorage.getItem('username') || 'User';
    const newUsername = prompt('Enter new username:', currentUsername);
    if (newUsername && newUsername.trim() !== '') {
        localStorage.setItem('username', newUsername.trim());
        showNotification('Username updated to: ' + newUsername.trim());
    }
}

function editEmail() {
    const currentEmail = localStorage.getItem('email') || '';
    const newEmail = prompt('Enter new email address:', currentEmail);
    if (newEmail && newEmail.trim() !== '') {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(newEmail.trim())) {
            localStorage.setItem('email', newEmail.trim());
            showNotification('Email updated successfully!');
        } else {
            alert('Please enter a valid email address');
        }
    }
}

function editProfilePicture() {
    editProfile(); // Same as clicking the edit icon
}

// Logout function
function logout() {
    const confirmLogout = confirm('Are you sure you want to log out?');
    if (confirmLogout) {
        // Add logout animation
        document.querySelector('.container').style.animation = 'fadeOut 0.3s ease-out';
        
        // Pause music
        pauseMusic();
        
        // Clear session data (but keep settings)
        // localStorage.clear(); // Uncomment this to clear all data
        
        setTimeout(() => {
            showNotification('Logging out...');
            // Redirect to login page
            window.location.href = 'login.html';
        }, 300);
    }
}

// Show notification function
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.95);
        }
    }
`;
document.head.appendChild(style);

// Load saved profile picture on page load
window.addEventListener('load', function() {
    const savedProfilePicture = localStorage.getItem('profilePicture');
    if (savedProfilePicture) {
        document.getElementById('profileImg').src = savedProfilePicture;
    }
});

// Handle page visibility change (pause music when tab is hidden)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        if (backgroundMusic && !backgroundMusic.paused) {
            backgroundMusic.pause();
        }
    } else {
        const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
        if (musicEnabled) {
            playMusic();
        }
    }
});