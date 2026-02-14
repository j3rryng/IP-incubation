// Go back to settings
function goBack() {
    window.location.href = 'settings.html';
}

// Handle issue type change
function handleIssueTypeChange() {
    const issueType = document.getElementById('issueType').value;
    const priorityGroup = document.getElementById('priorityGroup');
    const deviceInfoGroup = document.getElementById('deviceInfoGroup');
    const descriptionHelper = document.getElementById('descriptionHelper');

    // Reset all optional fields
    priorityGroup.style.display = 'none';
    deviceInfoGroup.style.display = 'none';

    // Show relevant fields based on issue type
    switch(issueType) {
        case 'bug':
            priorityGroup.style.display = 'block';
            deviceInfoGroup.style.display = 'block';
            descriptionHelper.textContent = 'Please describe the bug in detail';
            break;
        case 'technical':
            deviceInfoGroup.style.display = 'block';
            descriptionHelper.textContent = 'Please describe the technical issue';
            break;
        case 'feedback':
            descriptionHelper.textContent = 'We appreciate your feedback! Please share your thoughts';
            break;
        case 'feature':
            descriptionHelper.textContent = 'Describe the feature you would like to see';
            break;
        default:
            descriptionHelper.textContent = 'Minimum 20 characters';
    }
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    const fileLabel = document.getElementById('fileLabel');
    
    if (file) {
        // Check file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            alert('File size must be less than 5MB');
            event.target.value = '';
            fileLabel.textContent = 'Choose file';
            return;
        }

        // Check file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            alert('Only PNG, JPG, and PDF files are allowed');
            event.target.value = '';
            fileLabel.textContent = 'Choose file';
            return;
        }

        fileLabel.textContent = file.name;
    } else {
        fileLabel.textContent = 'Choose file';
    }
}

// Submit support form
function submitSupport(event) {
    event.preventDefault();

    // Get form values
    const issueType = document.getElementById('issueType').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const description = document.getElementById('description').value;
    const priority = document.getElementById('priority').value;
    const deviceInfo = document.getElementById('deviceInfo').value;

    // Validate description length
    if (description.length < 20) {
        alert('Please provide a more detailed description (minimum 20 characters)');
        return;
    }

    // Create support ticket object
    const ticket = {
        id: generateTicketID(),
        issueType: issueType,
        email: email,
        subject: subject,
        description: description,
        priority: priority,
        deviceInfo: deviceInfo,
        timestamp: new Date().toISOString(),
        status: 'submitted'
    };

    // Save to localStorage (in a real app, this would be sent to a server)
    saveSupportTicket(ticket);

    // Show success message
    document.getElementById('supportForm').style.display = 'none';
    document.getElementById('successMessage').style.display = 'block';

    // Send confirmation email (simulated)
    console.log('Support ticket submitted:', ticket);
    
    // Show notification
    showNotification(`Ticket #${ticket.id} created successfully!`);
}

// Generate unique ticket ID
function generateTicketID() {
    return 'TKT-' + Date.now().toString().slice(-8);
}

// Save support ticket
function saveSupportTicket(ticket) {
    let tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    tickets.push(ticket);
    localStorage.setItem('supportTickets', JSON.stringify(tickets));
}

// Reset form
function resetForm() {
    document.getElementById('supportForm').reset();
    document.getElementById('fileLabel').textContent = 'Choose file';
    document.getElementById('supportForm').style.display = 'block';
    document.getElementById('successMessage').style.display = 'none';
    handleIssueTypeChange(); // Reset conditional fields
}

// Toggle FAQ
function toggleFAQ(button) {
    const faqItem = button.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
    const isActive = button.classList.contains('active');

    // Close all FAQs
    document.querySelectorAll('.faq-question').forEach(q => {
        q.classList.remove('active');
        q.parentElement.querySelector('.faq-answer').style.maxHeight = null;
    });

    // Toggle current FAQ
    if (!isActive) {
        button.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
    }
}

// Open live chat
function openLiveChat() {
    showNotification('Live chat is opening...');
    // In a real app, this would open a chat widget
    setTimeout(() => {
        alert('Live chat would open here. This is a demo version.');
    }, 500);
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(76, 175, 80, 0.95);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
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
`;
document.head.appendChild(style);

// Auto-fill email if saved in localStorage
document.addEventListener('DOMContentLoaded', function() {
    const savedEmail = localStorage.getItem('email');
    if (savedEmail) {
        document.getElementById('email').value = savedEmail;
    }

    // Auto-detect device info
    const deviceInfo = detectDeviceInfo();
    document.getElementById('deviceInfo').placeholder = deviceInfo;
});

// Detect device and browser info
function detectDeviceInfo() {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';

    // Detect browser
    if (userAgent.indexOf('Firefox') > -1) {
        browser = 'Firefox';
    } else if (userAgent.indexOf('Chrome') > -1) {
        browser = 'Chrome';
    } else if (userAgent.indexOf('Safari') > -1) {
        browser = 'Safari';
    } else if (userAgent.indexOf('Edge') > -1) {
        browser = 'Edge';
    }

    // Detect OS
    if (userAgent.indexOf('Windows') > -1) {
        os = 'Windows';
    } else if (userAgent.indexOf('Mac') > -1) {
        os = 'macOS';
    } else if (userAgent.indexOf('Linux') > -1) {
        os = 'Linux';
    } else if (userAgent.indexOf('Android') > -1) {
        os = 'Android';
    } else if (userAgent.indexOf('iOS') > -1) {
        os = 'iOS';
    }

    return `${browser} on ${os}`;
}

// Form validation in real-time
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('supportForm');
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
});

// Validate individual field
function validateField(field) {
    if (field.hasAttribute('required') && !field.value.trim()) {
        field.style.borderColor = '#f44336';
        return false;
    } else if (field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            field.style.borderColor = '#f44336';
            return false;
        }
    } else if (field.id === 'description' && field.value.length > 0 && field.value.length < 20) {
        field.style.borderColor = '#ff9800';
        return false;
    }
    
    field.style.borderColor = '#4CAF50';
    return true;
}

// Character counter for description
document.addEventListener('DOMContentLoaded', function() {
    const description = document.getElementById('description');
    const helper = document.getElementById('descriptionHelper');

    description.addEventListener('input', function() {
        const length = this.value.length;
        if (length < 20) {
            helper.textContent = `${20 - length} more characters needed`;
            helper.style.color = '#f44336';
        } else {
            helper.textContent = `${length} characters`;
            helper.style.color = '#4CAF50';
        }
    });
});