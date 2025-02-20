function addPriorityMenuItem(taskElement) {
    console.log('Adding priority menu item for task:', taskElement);
    
    // Get the recording ID from the task element
    const recordingId = taskElement.getAttribute('data-recording-id');
    if (!recordingId) return;

    // Get the CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (!csrfToken) return;

    // Watch for the menu to appear
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            const actionList = document.querySelector('.action-list');
            if (actionList && !actionList.querySelector('.priority-menu-item')) {
                // Create the menu item
                const menuItem = document.createElement('li');
                menuItem.className = 'action-list__item todo-edit-menu__item priority-menu-item';
                
                // Create the action link
                const actionLink = document.createElement('a');
                actionLink.className = 'action-list__action';
                actionLink.setAttribute('data-bridge-feature', 'bridge--feature');
                actionLink.setAttribute('data-bridge-feature-incompatible', 'native-modal-web-form');
                actionLink.setAttribute('data-remote', 'true');
                actionLink.setAttribute('data-turbo-prefetch', 'false');
                actionLink.setAttribute('rel', 'nofollow');
                actionLink.href = '#';
                actionLink.textContent = 'Prioritize';

                // Create the hidden form
                const form = document.createElement('form');
                form.style.display = 'none';
                form.method = 'post';
                form.action = `/5913269/my/priorities?group_by=bucket`;

                // Add the hidden inputs
                const tokenInput = document.createElement('input');
                tokenInput.type = 'hidden';
                tokenInput.name = 'authenticity_token';
                tokenInput.value = csrfToken;

                const recordingInput = document.createElement('input');
                recordingInput.type = 'hidden';
                recordingInput.name = 'id';
                recordingInput.value = recordingId;
                recordingInput.autocomplete = 'off';

                // Assemble everything
                form.appendChild(tokenInput);
                form.appendChild(recordingInput);
                menuItem.appendChild(actionLink);
                menuItem.appendChild(form);

                // Add click handler
                actionLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    form.submit();
                });

                // Insert after the first item
                const firstItem = actionList.querySelector('.action-list__item');
                if (firstItem) {
                    firstItem.after(menuItem);
                }
            }
        });
    });

    // Watch for the menu content to appear
    observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
}

// Watch for todos
const todoObserver = new MutationObserver(() => {
    const todos = document.querySelectorAll('.recording.todo:not(.has-priority-menu)');
    todos.forEach(todo => {
        todo.classList.add('has-priority-menu');
        addPriorityMenuItem(todo);
    });
});

todoObserver.observe(document.body, { 
    childList: true, 
    subtree: true 
});

// Initial run
document.querySelectorAll('.recording.todo:not(.has-priority-menu)').forEach(todo => {
    todo.classList.add('has-priority-menu');
    addPriorityMenuItem(todo);
});
