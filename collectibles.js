// ===== DATA =====
const badgesData = [
    {
        id: 1,
        name: "Mr Tanaka",
        status: "seen",
        avatars: "img/badge101.png",
        locked: false
    },
    {
        id: 2,
        name: "Little Ms Haruka",
        status: "seen",
        avatars: "img/badge102.png",
        locked: false
    },
    {
        id: 3,
        name: "The Wanderer",
        status: "locked",
        avatars: "img/locked.png",
        locked: true
    },
    {
        id: 4,
        name: "Night Watcher",
        status: "locked",
        avatars: "img/locked.png",
        locked: true
    },
    {
        id: 5,
        name: "Silent Guardian",
        status: "locked",
        avatars: "img/locked.png",
        locked: true
    },
    {
        id: 6,
        name: "Shadow Walker",
        status: "locked",
        avatars: "img/locked.png",
        locked: true
    },
    {
        id: 7,
        name: "Dawn Keeper",
        status: "locked",
        avatars: "img/locked.png",
        locked: true
    },
    {
        id: 8,
        name: "Storm Caller",
        status: "locked",
        avatars: "img/locked.png",
        locked: true
    }
];

const merchandiseData = [
    {
        id: 101,
        name: "Phantom Model",
        price: 1000,
        description: "Airborne virus, highly highly contagious.",
        image: "img/modelPhantom.png",
        locked: false
    },
    {
        id: 102,
        name: "Vandal Model",
        price: 1000,
        description: "A magnificent virus created for destruction.",
        image: "img/modelVandal.jpg",
        locked: false
    },
    {
        id: 103,
        name: "Clinic Blueprint",
        price: 2500,
        description: "Original architectural plans of the Incubation Clinic.",
        image: "img/locked.png",
        locked: true
    },
    {
        id: 104,
        name: "Lab Equipment Set",
        price: 3000,
        description: "Professional medical equipment replica.",
        image: "img/locked.png",
        locked: true
    },
    {
        id: 105,
        name: "Grandfather's Journal",
        price: 5000,
        description: "Replica of Dr. Yamamoto's research journal.",
        image: "img/locked.png",
        locked: true
    },
    {
        id: 106,
        name: "Hazmat Suit Model",
        price: 1500,
        description: "Miniature protective equipment display.",
        image: "img/locked.png",
        locked: true
    }
];

// ===== STATE =====
let userCurrency = parseInt(localStorage.getItem('gameCredits')) || 0;
let selectedItem = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    // Sync with localStorage periodically
    setInterval(syncCurrency, 1000);
});

function initializePage() {
    renderBadges();
    renderMerchandise();
    updateCurrencyDisplay();
}

// Sync currency with localStorage (from game)
function syncCurrency() {
    const storedCredits = parseInt(localStorage.getItem('gameCredits')) || 0;
    if (storedCredits !== userCurrency) {
        userCurrency = storedCredits;
        updateCurrencyDisplay();
    }
}

// ===== RENDERING FUNCTIONS =====
function renderBadges() {
    const badgesContainer = document.getElementById('badgesGrid');
    badgesContainer.innerHTML = '';

    badgesData.forEach(badge => {
        const badgeCard = createBadgeCard(badge);
        badgesContainer.appendChild(badgeCard);
    });
}

function createBadgeCard(badge) {
    const card = document.createElement('div');
    card.className = `badge-card ${badge.locked ? 'locked' : ''}`;
    
    const avatar = badge.avatars || 'img/default.png';
    
    const avatarHTML = `<img src="${avatar}" alt="Avatar">`;
    
    card.innerHTML = `
        <div class="badge-images">
            <div class="badge-avatar">${avatarHTML}</div>
        </div>
        <div class="badge-info">
            <div class="badge-name">${badge.name}</div>
            <div class="badge-status">${badge.status}</div>
        </div>
    `;

    if (!badge.locked) {
        card.addEventListener('click', () => showBadgeDetails(badge));
    }

    return card;
}

function renderMerchandise() {
    const merchContainer = document.getElementById('merchandiseGrid');
    merchContainer.innerHTML = '';

    merchandiseData.forEach(item => {
        const merchCard = createMerchCard(item);
        merchContainer.appendChild(merchCard);
    });
}

function createMerchCard(item) {
    const card = document.createElement('div');
    card.className = `merch-card ${item.locked ? 'locked' : ''}`;
    
    // Always render as image
    const imageHTML = `<img class="merch-image" src="${item.image}" alt="${item.name}">`;
    
    card.innerHTML = `
        <div class="merch-image-container">
            ${imageHTML}
        </div>
        <div class="merch-info">
            <div class="merch-name">${item.name}</div>
            <div class="merch-price">${item.locked ? 'LOCKED' : item.price + ' CR'}</div>
        </div>
    `;

    if (!item.locked) {
        card.addEventListener('click', () => openPurchaseModal(item));
    } else {
        card.addEventListener('click', () => showNotification('This item is locked. Complete more missions to unlock!', 'info'));
    }

    return card;
}

// ===== MODEL FUNCTIONS =====
function openBadgeModal() {
    const modal = document.getElementById('badgeModal');
    const modalBody = document.getElementById('modalBadgesGrid');
    
    modalBody.innerHTML = '';
    
    badgesData.forEach(badge => {
        const modalCard = createModalBadgeCard(badge);
        modalBody.appendChild(modalCard);
    });

    modal.classList.add('active');
}

function closeBadgeModal() {
    const modal = document.getElementById('badgeModal');
    modal.classList.remove('active');
}

function createModalBadgeCard(badge) {
    const card = document.createElement('div');
    card.className = `modal-badge-card ${badge.locked ? 'locked' : ''}`;

    const icon = badge.avatars || 'img/default.png';
    
    card.innerHTML = `
        <div class="modal-badge-icon"><img src="${icon}" alt="${badge.name}" style="width: 100%; height: 100%; object-fit: cover;"></div>
        <div class="modal-badge-name">${badge.name}</div>
    `;

    if (!badge.locked) {
        card.addEventListener('click', () => {
            showBadgeDetails(badge);
            closeBadgeModal();
        });
    }

    return card;
}

function openPurchaseModal(item) {
    selectedItem = item;
    const modal = document.getElementById('purchaseModal');
    
    const previewHTML = `<img src="${item.image}" alt="${item.name}" style="max-width: 80%; max-height: 80%; object-fit: contain;">`;
    
    document.getElementById('purchasePreview').innerHTML = previewHTML;
    document.getElementById('purchaseItemName').textContent = item.name;
    document.getElementById('purchaseItemDesc').textContent = item.description;
    document.getElementById('purchasePrice').textContent = `${item.price} CR`;
    
    const confirmBtn = modal.querySelector('.confirm-btn');
    if (userCurrency < item.price) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Insufficient Funds';
    } else {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirm Purchase';
    }

    modal.classList.add('active');
}

function closePurchaseModal() {
    const modal = document.getElementById('purchaseModal');
    modal.classList.remove('active');
    selectedItem = null;
}

function confirmPurchase() {
    if (!selectedItem || userCurrency < selectedItem.price) {
        showNotification('Insufficient currency!', 'error');
        return;
    }

    userCurrency -= selectedItem.price;
    localStorage.setItem('gameCredits', userCurrency);
    updateCurrencyDisplay();
    
    showNotification(`Successfully purchased ${selectedItem.name}!`, 'success');
    closePurchaseModal();
}

function showBadgeDetails(badge) {
    // This could open another modal or show details
    showNotification(`${badge.name} - ${badge.status}`, 'info');
}

// ===== UTILITY FUNCTIONS =====
function updateCurrencyDisplay() {
    const currencyElement = document.getElementById('currencyDisplay');
    if (currencyElement) {
        currencyElement.textContent = `${userCurrency} CR`;
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

function goBack() {
    // Navigate back or to home page
    window.location.href = 'index.html';
}

// ===== MODAL CLOSE ON OUTSIDE CLICK =====
window.addEventListener('click', function(event) {
    const badgeModal = document.getElementById('badgeModal');
    const purchaseModal = document.getElementById('purchaseModal');
    
    if (event.target === badgeModal) {
        closeBadgeModal();
    }
    
    if (event.target === purchaseModal) {
        closePurchaseModal();
    }
});

// ===== ANIMATIONS =====
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
`;
document.head.appendChild(style);

// ===== EXPORT FOR EXTERNAL USE =====
window.collectiblesAPI = {
    addCurrency: (amount) => {
        userCurrency += amount;
        localStorage.setItem('gameCredits', userCurrency);
        updateCurrencyDisplay();
    },
    getCurrency: () => userCurrency,
    unlockBadge: (badgeId) => {
        const badge = badgesData.find(b => b.id === badgeId);
        if (badge) {
            badge.locked = false;
            badge.status = 'Unlocked';
            badge.avatars = badge.avatars.replace('locked.png', `badge${badge.id}.png`);
            renderBadges();
            showNotification(`Badge "${badge.name}" unlocked!`, 'success');
        }
    },
    unlockMerchandise: (merchId) => {
        const merch = merchandiseData.find(m => m.id === merchId);
        if (merch) {
            merch.locked = false;
            merch.image = merch.image.replace('locked.png', `model${merch.id}.png`);
            renderMerchandise();
            showNotification(`"${merch.name}" is now available for purchase!`, 'success');
        }
    },
    addMerchandise: (merchData) => {
        merchandiseData.push(merchData);
        renderMerchandise();
    }
};