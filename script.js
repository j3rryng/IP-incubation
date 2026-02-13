// Add click handlers for buttons
document.querySelectorAll('.menu-button, .icon-button').forEach(button => {
    button.addEventListener('click', function() {
        console.log('Button clicked:', this.textContent.trim() || this.title);
        // Add your navigation logic here
    });
});

// Load active profile stats (if any)
window.addEventListener('DOMContentLoaded', () => {
    const activeProfile = GameState.getActiveProfile();
    if (activeProfile) {
        // You can update the stat badges with actual profile data
        console.log('Active profile:', activeProfile.name);
        // Example: Update currency display
        // document.querySelector('.stat-badge').textContent = activeProfile.gameData.currency + ' CR';
    }
});

/* =========================
PROFILE PAGE JAVASCRIPT
With expandable dropdown stats
========================= */

let expandedProfileId = null;

// Format time in minutes to hours and minutes
function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
}

// Render profile slots with expandable stats
function renderProfiles() {
    const profiles = GameState.getProfiles();
    const container = document.getElementById('profilesList');
    container.innerHTML = '';

    profiles.forEach((profile, index) => {
        const slot = document.createElement('div');
        slot.className = profile.empty 
            ? 'profile-slot empty' 
            : `profile-slot filled color-${index + 1}`;
        
        if (profile.empty) {
            // Empty slot - simple display
            slot.textContent = 'empty';
            slot.onclick = () => selectProfile(profile.id);
        } else {
            // Filled slot - expandable with stats
            const isExpanded = expandedProfileId === profile.id;
            if (isExpanded) {
                slot.classList.add('expanded');
            }

            // Profile header (name + expand icon)
            const header = document.createElement('div');
            header.className = 'profile-header';
            header.innerHTML = `
                <span class="profile-name">${profile.name}</span>
                <span class="expand-icon">${isExpanded ? '▼' : '▶'}</span>
            `;
            header.onclick = () => toggleExpand(profile.id);
            slot.appendChild(header);

            // Stats section (expandable)
            const statsDiv = document.createElement('div');
            statsDiv.className = 'profile-stats';
            statsDiv.innerHTML = `
                <div class="stat-row">
                    <span class="stat-label">Week:</span>
                    <span class="stat-value">${profile.gameData.week || 0}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Experience:</span>
                    <span class="stat-value">${profile.gameData.experience || 0} XP</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Time Spent:</span>
                    <span class="stat-value">${formatTime(profile.gameData.timeSpent || 0)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Currency:</span>
                    <span class="stat-value">${profile.gameData.currency || 0} CR</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Level:</span>
                    <span class="stat-value">${profile.gameData.level || 0}</span>
                </div>
            `;
            slot.appendChild(statsDiv);

            // Continue button (only visible when expanded)
            if (isExpanded) {
                const continueBtn = document.createElement('button');
                continueBtn.className = 'profile-continue-btn';
                continueBtn.textContent = 'Continue Game';
                continueBtn.onclick = (e) => {
                    e.stopPropagation();
                    loadProfileAndPlay(profile.id);
                };
                statsDiv.appendChild(continueBtn);
            }
        }
        
        container.appendChild(slot);
    });

    updateSaveIndicator();
}

// Toggle expand/collapse for a profile
function toggleExpand(profileId) {
    if (expandedProfileId === profileId) {
        // Collapse if already expanded
        expandedProfileId = null;
    } else {
        // Expand this profile, collapse others
        expandedProfileId = profileId;
    }
    renderProfiles();
}

// Update save indicator
function updateSaveIndicator() {
    const filledCount = GameState.getFilledProfileCount();
    document.getElementById('saveNumber').textContent = `save - ${filledCount}`;
}

// Select/Create profile (for empty slots)
function selectProfile(profileId) {
    const profile = GameState.getProfile(profileId);

    if (profile.empty) {
        // Create new profile with initial data
        const newProfile = GameState.createProfile(profileId);
        if (newProfile) {
            // Initialize with some starting values
            GameState.updateProfileData(profileId, {
                week: 1,
                level: 1,
                currency: 100,
                experience: 0,
                timeSpent: 0
            });
            
            renderProfiles();
            console.log(`New profile created: ${newProfile.name}`);
            
            // Redirect to game page
            setTimeout(() => {
                window.location.href = 'game.html';
            }, 500);
        }
    }
}

// Load profile and start game (for filled slots)
function loadProfileAndPlay(profileId) {
    const loadedProfile = GameState.loadProfile(profileId);
    if (loadedProfile) {
        console.log(`Loading profile: ${loadedProfile.name}`);
        console.log('Stats:', loadedProfile.gameData);
        
        // Redirect to game page
        setTimeout(() => {
            window.location.href = 'game.html';
        }, 300);
    }
}

// Go back to home page
function goBack() {
    window.location.href = 'home.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    renderProfiles();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (expandedProfileId) {
            // Close expanded profile first
            expandedProfileId = null;
            renderProfiles();
        } else {
            // Then go back
            goBack();
        }
    }
});

// Testing function (browser console)
window.resetProfiles = () => {
    if (confirm('Reset all profiles? This cannot be undone.')) {
        GameState.resetAll();
        expandedProfileId = null;
        renderProfiles();
    }
};

// Add sample data to profile (for testing)
window.addTestData = (profileId) => {
    GameState.updateProfileData(profileId, {
        week: Math.floor(Math.random() * 20) + 1,
        experience: Math.floor(Math.random() * 5000) + 100,
        timeSpent: Math.floor(Math.random() * 600) + 30,
        currency: Math.floor(Math.random() * 10000) + 500,
        level: Math.floor(Math.random() * 50) + 1
    });
    renderProfiles();
    console.log(`Test data added to profile ${profileId}`);
};

