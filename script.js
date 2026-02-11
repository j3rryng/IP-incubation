// Add click handlers for buttons
document.querySelectorAll('.menu-button, .icon-button').forEach(button => {
    button.addEventListener('click', function() {
        console.log('Button clicked:', this.textContent.trim() || this.title);
        // Add your navigation logic here
    });
});