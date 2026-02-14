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
   External file: profile.js
   ========================= */

const MAX_PROFILES = 5;
const STORAGE_KEY = 'incubation_profiles';
let expandedProfileId = null;

// Initialize profiles
function initProfiles() {
    let profiles = getProfiles();
    
    if (!profiles || profiles.length === 0) {
        console.log('Creating new profile structure...');
        profiles = [];
        for (let i = 1; i <= MAX_PROFILES; i++) {
            profiles.push({
                id: i,
                name: `Profile ${i}`,
                empty: true,
                active: false,
                week: 0,
                experience: 0,
                timeSpent: 0,
                currency: 0,
                level: 0,
                createdAt: null,
                lastPlayed: null,
                settings: {}
            });
        }
        saveProfiles(profiles);
        console.log('Created', MAX_PROFILES, 'empty profile slots');
    }
    
    return profiles;
}

// Get all profiles from localStorage
function getProfiles() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Error loading profiles:', error);
        return null;
    }
}

// Save profiles to localStorage
function saveProfiles(profiles) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
        return true;
    } catch (error) {
        console.error('Error saving profiles:', error);
        return false;
    }
}

// Get a specific profile
function getProfile(profileId) {
    const profiles = getProfiles();
    return profiles ? profiles.find(p => p.id === profileId) : null;
}

// Format time
function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

// Render all profile slots
function renderProfiles() {
    console.log('=== renderProfiles called ===');
    
    const profiles = initProfiles();
    const container = document.getElementById('profilesList');
    
    if (!container) {
        console.error('ERROR: profilesList container not found!');
        return;
    }
    
    console.log('Container found, clearing...');
    container.innerHTML = '';
    console.log('Rendering', profiles.length, 'profiles');

    profiles.forEach((profile, index) => {
        console.log(`Creating slot ${index + 1}:`, profile.empty ? 'EMPTY' : 'FILLED');
        
        const slot = document.createElement('div');
        slot.className = profile.empty 
            ? 'profile-slot empty' 
            : `profile-slot filled color-${index + 1}`;
        
        if (profile.empty) {
            // Empty slot
            slot.textContent = 'empty';
            slot.onclick = () => createProfile(profile.id);
        } else {
            // Filled slot with expandable stats
            const isExpanded = expandedProfileId === profile.id;
            if (isExpanded) {
                slot.classList.add('expanded');
            }

            // Profile header
            const header = document.createElement('div');
            header.className = 'profile-header';
            header.innerHTML = `
                <span class="profile-name">${profile.name}</span>
                <span class="expand-icon">${isExpanded ? '▼' : '▶'}</span>
            `;
            header.onclick = () => toggleExpand(profile.id);
            slot.appendChild(header);

            // Stats section
            const statsDiv = document.createElement('div');
            statsDiv.className = 'profile-stats';
            statsDiv.innerHTML = `
                <div class="stat-row">
                    <span class="stat-label">Week:</span>
                    <span class="stat-value">${profile.week || 0}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Experience:</span>
                    <span class="stat-value">${profile.experience || 0} XP</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Time Spent:</span>
                    <span class="stat-value">${formatTime(profile.timeSpent || 0)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Currency:</span>
                    <span class="stat-value">${profile.currency || 0} CR</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Level:</span>
                    <span class="stat-value">${profile.level || 0}</span>
                </div>
            `;
            slot.appendChild(statsDiv);

            // Continue button
            if (isExpanded) {
                const continueBtn = document.createElement('button');
                continueBtn.className = 'profile-continue-btn';
                continueBtn.textContent = 'Continue Game';
                continueBtn.onclick = (e) => {
                    e.stopPropagation();
                    loadProfile(profile.id);
                };
                statsDiv.appendChild(continueBtn);
            }
        }
        
        container.appendChild(slot);
    });

    console.log('Profiles rendered! Total slots:', container.children.length);
    updateSaveIndicator();
}

// Toggle expand/collapse
function toggleExpand(profileId) {
    console.log('Toggling profile', profileId);
    expandedProfileId = expandedProfileId === profileId ? null : profileId;
    renderProfiles();
}

// Update save counter
function updateSaveIndicator() {
    const profiles = getProfiles();
    if (!profiles) return;
    
    const filledCount = profiles.filter(p => !p.empty).length;
    const saveNumberEl = document.getElementById('saveNumber');
    if (saveNumberEl) {
        saveNumberEl.textContent = `save - ${filledCount}`;
    }
}

// Create new profile
function createProfile(profileId) {
    console.log('Creating profile', profileId);
    
    const profiles = getProfiles();
    const profile = profiles.find(p => p.id === profileId);
    
    if (!profile || !profile.empty) {
        console.error('Invalid profile or already exists');
        return;
    }

    // Initialize profile with starting values
    profile.empty = false;
    profile.active = true;
    profile.week = 1;
    profile.level = 1;
    profile.currency = 100;
    profile.experience = 0;
    profile.timeSpent = 0;
    profile.createdAt = new Date().toISOString();
    profile.lastPlayed = new Date().toISOString();

    // Deactivate other profiles
    profiles.forEach(p => {
        if (p.id !== profileId) p.active = false;
    });

    saveProfiles(profiles);
    console.log('Profile created:', profile.name);
    
    // Redirect to game
    setTimeout(() => {
        window.location.href = 'game.html';
    }, 500);
}

// Load existing profile
function loadProfile(profileId) {
    console.log('Loading profile', profileId);
    
    const profiles = getProfiles();
    const profile = profiles.find(p => p.id === profileId);
    
    if (!profile || profile.empty) {
        console.error('Profile not found or empty');
        return;
    }

    // Set as active
    profile.active = true;
    profile.lastPlayed = new Date().toISOString();

    // Deactivate others
    profiles.forEach(p => {
        if (p.id !== profileId) p.active = false;
    });

    saveProfiles(profiles);
    console.log('Loading profile:', profile.name);
    
    // Redirect to game
    setTimeout(() => {
        window.location.href = 'game.html';
    }, 300);
}

// Get active profile
function getActiveProfile() {
    const profiles = getProfiles();
    return profiles ? profiles.find(p => p.active === true) : null;
}

// Update profile data
function updateProfileData(profileId, data) {
    const profiles = getProfiles();
    const profile = profiles.find(p => p.id === profileId);
    
    if (!profile || profile.empty) {
        console.error('Profile not found');
        return false;
    }

    // Update profile with new data
    Object.keys(data).forEach(key => {
        profile[key] = data[key];
    });
    
    profile.lastPlayed = new Date().toISOString();
    saveProfiles(profiles);
    return true;
}

// Go back to home
function goBack() {
    window.location.href = 'index.html';
}

// Reset all profiles (for testing)
function resetProfiles() {
    if (confirm('Reset all profiles? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        expandedProfileId = null;
        renderProfiles();
    }
}

// Add test data (for testing)
function addTestData(profileId) {
    updateProfileData(profileId, {
        week: Math.floor(Math.random() * 20) + 1,
        experience: Math.floor(Math.random() * 5000) + 100,
        timeSpent: Math.floor(Math.random() * 600) + 30,
        currency: Math.floor(Math.random() * 10000) + 500,
        level: Math.floor(Math.random() * 50) + 1
    });
    renderProfiles();
    console.log(`Test data added to profile ${profileId}`);
}

// Expose functions to window for global access
window.getActiveProfile = getActiveProfile;
window.updateProfileData = updateProfileData;
window.getProfiles = getProfiles;
window.resetProfiles = resetProfiles;
window.addTestData = addTestData;

// Initialize when DOM is ready
function initialize() {
    console.log('=== PROFILE PAGE INITIALIZED ===');
    console.log('DOM fully loaded');
    
    // Check if container exists
    const container = document.getElementById('profilesList');
    if (container) {
        console.log('Container found:', container);
    } else {
        console.error('Container NOT found!');
    }
    
    // Initialize profiles
    renderProfiles();
}

// Event listeners
document.addEventListener('DOMContentLoaded', initialize);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (expandedProfileId) {
            expandedProfileId = null;
            renderProfiles();
        } else {
            goBack();
        }
    }
});

console.log('profile.js loaded successfully');