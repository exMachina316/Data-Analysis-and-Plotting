// Smooth page transitions
document.addEventListener('DOMContentLoaded', () => {
    // Add fade-out effect when clicking internal links
    const links = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Skip if it's an anchor link or external
            if (href.startsWith('#') || link.target === '_blank') {
                return;
            }
            
            e.preventDefault();
            
            // Add fade-out class
            document.body.style.opacity = '0';
            document.body.style.transform = 'translateY(-20px)';
            document.body.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            
            // Navigate after animation
            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });
});

// Prevent flash of unstyled content
window.addEventListener('pageshow', (event) => {
    // Reset body styles if user navigates back
    if (event.persisted) {
        document.body.style.opacity = '1';
        document.body.style.transform = 'translateY(0)';
    }
});
