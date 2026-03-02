/**
 * Proxmoxer Client Plugin - Main Script
 * Simple Hello World demonstration
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('[Proxmoxer Plugin] Script loaded successfully!');

  // Get DOM elements
  const button = document.getElementById('myButton');
  const messageElement = document.getElementById('message');
  const greetingElement = document.getElementById('greeting');

  let clickCount = 0;

  // Event listener untuk button click
  button.addEventListener('click', function() {
    clickCount++;

    // Change message berdasarkan jumlah klik
    let message = '';

    if (clickCount === 1) {
      message = '✨ Halo! Anda telah mengklik tombol';
    } else if (clickCount === 2) {
      message = '🎉 Dua kali! Terus semangat...';
    } else if (clickCount === 3) {
      message = '🚀 Tiga kali! Anda sudah mahir!';
    } else if (clickCount === 5) {
      message = '⭐ Lima kali! Wow!';
    } else if (clickCount === 10) {
      message = '🏆 Sepuluh kali! Anda adalah Master!';
    } else {
      message = `🎯 Anda telah mengklik ${clickCount} kali`;
    }

    // Update message dengan animasi
    messageElement.textContent = message;
    messageElement.style.animation = 'none';

    // Trigger animation
    setTimeout(() => {
      messageElement.style.animation = 'fadeIn 0.3s ease-out';
    }, 10);

    // Add pulse effect ke button
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 100);

    console.log(`[Proxmoxer Plugin] Button clicked: ${clickCount} times`);

    // Change greeting text setelah 5 klik
    if (clickCount === 5) {
      greetingElement.textContent = '🎊 Plugin Bekerja dengan Sempurna! 🎊';
    }
  });

  // Add hover effect
  button.addEventListener('mouseenter', function() {
    console.log('[Proxmoxer Plugin] Button hovered');
  });

  // Initial console log
  console.log('[Proxmoxer Plugin] Plugin Hello World initialized successfully!');
});

// Optional: Add some keyboard shortcut
document.addEventListener('keydown', function(event) {
  if (event.code === 'Space') {
    event.preventDefault();
    document.getElementById('myButton').click();
  }
});

