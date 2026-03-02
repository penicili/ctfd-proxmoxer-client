/**
 * Proxmoxer Client Plugin - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Button click handler untuk dashboard
    const myButton = document.getElementById('myButton');
    const messageElement = document.getElementById('message');
    const clickCountElement = document.getElementById('clickCount');

    if (myButton) {
        let clickCount = 0;

        myButton.addEventListener('click', function() {
            clickCount++;

            // Update message
            if (messageElement) {
                messageElement.textContent = `Anda telah klik ${clickCount} kali!`;
                messageElement.classList.remove('fade-in');
                void messageElement.offsetWidth; // Trigger reflow
                messageElement.classList.add('fade-in');
            }

            // Update click count display
            if (clickCountElement) {
                clickCountElement.textContent = clickCount;
            }
        });
    }
});

