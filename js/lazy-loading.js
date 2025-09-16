/**
 * Lazy Loading Utility
 * Provides fallback support for browsers that don't support native lazy loading
 */

(function() {
    'use strict';

    // Check if browser supports native lazy loading
    const supportsLazyLoading = 'loading' in HTMLImageElement.prototype;

    if (supportsLazyLoading) {
        // Browser supports native lazy loading, no need for polyfill
        return;
    }

    // Polyfill for browsers that don't support lazy loading
    let imageObserver;

    function loadImage(img) {
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
        img.classList.remove('lazy');
        img.classList.add('lazy-loaded');
    }

    function handleIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadImage(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }

    function initLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if (images.length === 0) {
            return;
        }

        // Use Intersection Observer if available
        if ('IntersectionObserver' in window) {
            imageObserver = new IntersectionObserver(handleIntersection, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            images.forEach(img => {
                // Move src to data-src for lazy loading
                if (img.src && !img.dataset.src) {
                    img.dataset.src = img.src;
                    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
                }
                img.classList.add('lazy');
                imageObserver.observe(img);
            });
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                loadImage(img);
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLazyLoading);
    } else {
        initLazyLoading();
    }

    // Add CSS for lazy loading states
    const style = document.createElement('style');
    style.textContent = `
        img.lazy {
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        }
        img.lazy-loaded {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
})();
