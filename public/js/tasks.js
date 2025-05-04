// --- START OF FILE public/js/tasks.js (Updated) ---
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const taskForm = document.querySelector('.task-form');
    const taskInput = document.getElementById('task-title');
    const taskList = document.querySelector('.task-list');

    // --- Edit Modal Elements ---
    const editModal = document.getElementById('edit-task-modal');
    const editTaskForm = document.getElementById('edit-task-form');
    const editTaskIdInput = document.getElementById('edit-task-id');
    const editTaskTitleInput = document.getElementById('edit-task-title');
    const editTaskDescInput = document.getElementById('edit-task-description');
    const editTaskDueDateInput = document.getElementById('edit-task-dueDate');
    const editTaskPriorityInput = document.getElementById('edit-task-priority');
    const closeModalBtns = document.querySelectorAll('.close-modal-btn'); // Select all close buttons

    // Check if task list elements exist
    if (!taskList) {
        return; // Exit if task list isn't on this page
    }
    // Check if modal elements exist
    if (!editModal || !editTaskForm || !editTaskIdInput || !editTaskTitleInput || !editTaskDescInput || !editTaskDueDateInput || !editTaskPriorityInput) {
        console.warn('Edit task modal elements not found. Edit functionality disabled.');
    }


    // --- Add New Task (Keep existing code) ---
    if (taskForm && taskInput) {
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = taskInput.value.trim();
            if (title) {
                try {
                    const response = await fetch('/tasks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify({ title: title })
                    });
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ message: 'Failed to add task.' }));
                        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                    }
                    const newTask = await response.json();
                    renderTask(newTask);
                    taskInput.value = '';
                } catch (err) {
                    console.error('Error adding task:', err);
                    alert(`Error adding task: ${err.message}`);
                }
            } else {
                alert('Please enter a task title.');
            }
        });
    }


    // --- Handle Clicks on Task List (for Edit/Delete) ---
    taskList.addEventListener('click', async (e) => {
        const taskCard = e.target.closest('.task-card');
        if (!taskCard) return;
        const taskId = taskCard.dataset.id;

        // --- Handle Edit Button Click ---
        if (e.target.classList.contains('edit-task') && editModal) { // Check if modal exists
            try {
                // Fetch current task details from API
                const response = await fetch(`/api/tasks/${taskId}`); // Use the new API route
                if (!response.ok) {
                     const errorData = await response.json().catch(() => ({ message: 'Failed to fetch task details.' }));
                     throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                const task = await response.json();

                // Populate the modal form
                editTaskIdInput.value = task._id;
                editTaskTitleInput.value = task.title || '';
                editTaskDescInput.value = task.description || '';
                editTaskPriorityInput.value = task.priority || 'medium';
                // Format date for input type="date" (YYYY-MM-DD)
                editTaskDueDateInput.value = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';

                // Show the modal
                editModal.style.display = 'block';

            } catch (err) {
                 console.error('Error fetching task for edit:', err);
                 alert(`Error loading task details: ${err.message}`);
            }
        }

        // Handle Delete Button Click (Keep existing code)
        if (e.target.classList.contains('delete-task')) {
            if (confirm('Are you sure you want to delete this task?')) {
                try {
                    const response = await fetch(`/tasks/${taskId}`, { method: 'DELETE', headers: {'Accept': 'application/json'} });
                    if (response.ok) {
                        taskCard.remove();
                    } else {
                         const errorData = await response.json().catch(() => ({ message: 'Failed to delete task.' }));
                         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                    }
                } catch (err) {
                    console.error('Error deleting task:', err);
                    alert(`Error deleting task: ${err.message}`);
                }
            }
        }
    });

    // --- Handle Task Completion Toggle (Keep existing code) ---
     taskList.addEventListener('change', async (e) => {
        const taskCard = e.target.closest('.task-card');
        if (!taskCard) return;
        if (e.target.classList.contains('task-complete')) {
            const taskId = taskCard.dataset.id;
            const isCompleted = e.target.checked;
            try {
                const response = await fetch(`/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ completed: isCompleted })
                });
                 if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Failed to update task status.' }));
                     throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                 }
                 taskCard.classList.toggle('completed', isCompleted);
            } catch (err) {
                 console.error('Error updating task status:', err);
                 alert(`Error updating task: ${err.message}`);
                 e.target.checked = !isCompleted; // Revert checkbox
            }
        }
    });

    // --- Handle Edit Form Submission ---
    if (editTaskForm && editModal) { // Check if modal elements exist
        editTaskForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent default form submission

            const taskId = editTaskIdInput.value;
            const updatedData = {
                title: editTaskTitleInput.value.trim(),
                description: editTaskDescInput.value.trim(),
                dueDate: editTaskDueDateInput.value || null, // Send null if empty
                priority: editTaskPriorityInput.value
            };

            // Basic validation
            if (!updatedData.title) {
                alert('Task title cannot be empty.');
                return;
            }

            try {
                const response = await fetch(`/tasks/${taskId}`, { // Send PUT request to the tasks route
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(updatedData)
                });

                if (!response.ok) {
                     const errorData = await response.json().catch(() => ({ message: 'Failed to save changes.' }));
                     throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                const updatedTask = await response.json(); // Get the full updated task from the backend

                // Update the task card on the page
                updateTaskCard(updatedTask);

                // Hide the modal
                editModal.style.display = 'none';
                alert('Task updated successfully!'); // Optional success feedback

            } catch (err) {
                 console.error('Error saving task changes:', err);
                 alert(`Error saving changes: ${err.message}`);
            }
        });
    }


    // --- Function to Update Task Card Display ---
    function updateTaskCard(task) {
         const taskCard = taskList.querySelector(`.task-card[data-id="${task._id}"]`);
         if (!taskCard) return; // Should not happen normally

         // Find elements within the card to update
         const titleEl = taskCard.querySelector('h3');
         const descriptionEl = taskCard.querySelector('.task-description'); // Assume you add this class in renderTask
         const dueDateEl = taskCard.querySelector('.task-due');
         const priorityBadge = taskCard.querySelector('.priority-badge');
         const completeCheckbox = taskCard.querySelector('.task-complete');

         // Update content
         if (titleEl) titleEl.textContent = task.title;
         taskCard.classList.toggle('completed', task.completed);
         if(completeCheckbox) completeCheckbox.checked = task.completed;

         // Update or add/remove description
         if (task.description) {
             if (descriptionEl) {
                 descriptionEl.textContent = task.description;
             } else {
                  // If description element didn't exist before, create and insert it (adjust placement as needed)
                  const newDesc = document.createElement('p');
                  newDesc.className = 'task-description';
                  newDesc.textContent = task.description;
                  // Insert after header, for example
                  taskCard.querySelector('.task-header').insertAdjacentElement('afterend', newDesc);
             }
         } else if (descriptionEl) {
             descriptionEl.remove(); // Remove description if it's now empty
         }

         // Update or add/remove due date
         if (task.dueDate) {
             const dateString = new Date(task.dueDate).toLocaleDateString();
             if (dueDateEl) {
                 dueDateEl.textContent = `Due: ${dateString}`;
             } else {
                 // Create and insert if it didn't exist
                 const newDueDate = document.createElement('div');
                 newDueDate.className = 'task-due';
                 newDueDate.textContent = `Due: ${dateString}`;
                 // Insert after description (or header if no description)
                 const insertAfter = taskCard.querySelector('.task-description') || taskCard.querySelector('.task-header');
                 insertAfter.insertAdjacentElement('afterend', newDueDate);
             }
         } else if (dueDateEl) {
             dueDateEl.remove(); // Remove due date if now empty
         }

         // Update priority badge
         if (priorityBadge) {
             priorityBadge.className = `priority-badge ${task.priority || 'medium'}`; // Update class for color
             priorityBadge.textContent = task.priority || 'medium';
             taskCard.dataset.priority = task.priority || 'medium'; // Update data attribute if used for sorting
         }
    }


    // --- Close Modal Handlers ---
    if (editModal) { // Check if modal exists
        // Close modal when clicking on any element with class="close-modal-btn"
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                editModal.style.display = 'none';
            });
        });

        // Close modal when clicking outside the modal content
        window.addEventListener('click', (event) => {
            if (event.target === editModal) {
                editModal.style.display = 'none';
            }
        });
    }

    // --- Function to Render a Single Task (Keep existing code, maybe add task-description class) ---
    function renderTask(task) {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.dataset.id = task._id;
        if (task.priority) {
            taskCard.dataset.priority = task.priority;
        }
        if (task.completed) {
             taskCard.classList.add('completed');
        }

        let dueDateHtml = '';
        if (task.dueDate) {
            try {
                 dueDateHtml = `<div class="task-due">Due: ${new Date(task.dueDate).toLocaleDateString()}</div>`;
            } catch (e) { console.error("Invalid date format:", task.dueDate)}
        }

        let descriptionHtml = '';
        if (task.description) {
            // Add class="task-description" here for easier selection later
            descriptionHtml = `<p class="task-description">${escapeHtml(task.description)}</p>`;
        }

        taskCard.innerHTML = `
            <div class="task-header">
                <input type="checkbox" class="task-complete" ${task.completed ? 'checked' : ''} title="Mark as complete/incomplete">
                <h3>${escapeHtml(task.title)}</h3>
                ${task.priority ? `<span class="priority-badge ${task.priority}">${escapeHtml(task.priority)}</span>` : ''}
            </div>
            ${descriptionHtml}
            ${dueDateHtml}
            <div class="task-actions">
                <button class="edit-task">Edit</button>
                <button class="delete-task">Delete</button>
            </div>
        `;
        taskList.prepend(taskCard);
    }

    // Helper function to prevent basic XSS
    function escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return '';
        return unsafe
             .replace(/&/g, "&")
             .replace(/</g, "<")
             .replace(/>/g, ">")
             .replace(/"/g, "")
             .replace(/'/g, "'");
    }

});
// --- END OF FILE public/js/tasks.js ---