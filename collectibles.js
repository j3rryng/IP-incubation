// ===== DATA =====
const badgesData = [
    {
        id: 1,
        name: "Mr Crampleton",
        status: "seen",
        avatars: "img/badge101.png",
        locked: false
    },
    {
        id: 2,
        name: "Little Ms",
        status: "seen",
        avatars: "img/badge102.png",
        locked: false
    }
];

const merchandiseData = [
    {
        id: 101,
        name: "Phantom Model",
        price: 1000,
        description: " airborne virus, highly highly contagious.",
        image: "img/modelPhantom.png"
    },
    {
        id: 102,
        name: "Vandal model",
        price: 1000,
        description: "A magnificent virus created for destruction.",
        image: "img/modelVandal.png"
    }
];

// ===== STATE =====
let userCurrency = 1500;
let selectedItem = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {
    renderBadges();
    renderMerchandise();
    updateCurrencyDisplay();
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
    card.className = 'merch-card';
    
    // Always render as image
    const imageHTML = `<img class="merch-image" src="${item.image}" alt="${item.name}">`;
    
    card.innerHTML = `
        <div class="merch-image-container">
            ${imageHTML}
        </div>
        <div class="merch-info">
            <div class="merch-name">${item.name}</div>
            <div class="merch-price">${item.price} CR</div>
        </div>
    `;

    card.addEventListener('click', () => openPurchaseModal(item));

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
    window.history.back();
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
        updateCurrencyDisplay();
    },
    getCurrency: () => userCurrency,
    unlockBadge: (badgeId) => {
        const badge = badgesData.find(b => b.id === badgeId);
        if (badge) {
            badge.locked = false;
            badge.status = 'Unlocked';
            renderBadges();
            showNotification(`Badge "${badge.name}" unlocked!`, 'success');
        }
    },
    addMerchandise: (merchData) => {
        merchandiseData.push(merchData);
        renderMerchandise();
    }
};