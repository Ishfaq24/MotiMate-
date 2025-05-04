// /public/js/sidebar.js
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.app-sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle-btn');
    const closeBtn = document.querySelector('.sidebar-close-btn');
    const overlay = document.querySelector('.sidebar-overlay');
    const body = document.body;

    const openSidebar = () => {
        if (sidebar && overlay) {
            sidebar.classList.add('open');
            overlay.classList.add('open');
            body.style.overflow = 'hidden'; // Prevent background scroll
            toggleBtn?.setAttribute('aria-expanded', 'true');
        }
    };

    const closeSidebar = () => {
         if (sidebar && overlay) {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            body.style.overflow = ''; // Restore scroll
            toggleBtn?.setAttribute('aria-expanded', 'false');
        }
    };

    if (toggleBtn) {
        toggleBtn.addEventListener('click', openSidebar);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebar);
    }

    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

    // Optional: Close sidebar on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar?.classList.contains('open')) {
            closeSidebar();
        }
    });

    // -- Inline Add Task Form Toggle --
    const showFormBtn = document.getElementById('show-add-task-form-btn');
    const hideFormBtn = document.getElementById('hide-add-task-form-btn');
    const inlineForm = document.getElementById('add-task-form'); // Assuming the inline form itself has this ID now
    const titleInput = document.getElementById('task-title'); // Assuming title input has this ID

     if(showFormBtn && inlineForm && titleInput) {
        showFormBtn.addEventListener('click', () => {
            inlineForm.style.display = 'flex'; // Or 'block' depending on your layout
            showFormBtn.style.display = 'none';
            titleInput.focus();
        });
    }

    if(hideFormBtn && inlineForm && showFormBtn) {
        hideFormBtn.addEventListener('click', () => {
            inlineForm.style.display = 'none';
            showFormBtn.style.display = 'inline-flex'; // Restore button display
            // Optionally clear the input: titleInput.value = '';
        });
    }
    // Add logic inside tasks.js to hide the form after successful submission too

});