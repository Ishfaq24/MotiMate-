// /public/js/theme.js

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="theme-toggle"]'); // Selects #theme-toggle, #theme-toggle-sidebar etc.
    // Or use a common class: const themeToggleCheckboxes = document.querySelectorAll('.theme-toggle-input');
    const body = document.body;
    const storageKey = 'themePreference';
    const darkClassName = 'dark-mode';

    // Function to apply the theme and update checkboxes
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add(darkClassName);
        } else {
            body.classList.remove(darkClassName);
        }

        // Update all checkboxes to reflect the current theme
        themeToggleCheckboxes.forEach(checkbox => {
            checkbox.checked = (theme === 'dark');
        });

        // Save preference to localStorage
        try {
            localStorage.setItem(storageKey, theme);
        } catch (e) {
            console.error("LocalStorage is unavailable. Theme preference not saved.", e);
        }
    };

    // Function to determine the initial theme
    const getInitialTheme = () => {
        let storedTheme = null;
        try {
             storedTheme = localStorage.getItem(storageKey);
        } catch (e) {
            console.warn("Could not read localStorage for theme preference.", e);
        }

        if (storedTheme) {
            return storedTheme; // Use saved preference
        }

        // If no stored theme, check if body already has dark-mode class (from server-side rendering)
        if (body.classList.contains(darkClassName)) {
            return 'dark';
        }

        // If not set by server, check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        // Default to light
        return 'light';
    };

    // --- Initialize ---
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme); // Apply the determined theme on load

    // --- Event Listener ---
    themeToggleCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            const newTheme = event.target.checked ? 'dark' : 'light';
            applyTheme(newTheme);
        });
    });

    // Optional: Listen for changes in system preference while the page is open
    try {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            // Only apply if there's no explicit user choice saved
             if (!localStorage.getItem(storageKey)) {
                const newSystemTheme = event.matches ? 'dark' : 'light';
                applyTheme(newSystemTheme);
            }
        });
    } catch (e) {
        console.warn("System theme preference change listener not supported or failed.", e)
    }

});