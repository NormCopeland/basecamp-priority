// Track URL changes
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        initializeExtension();
    }
}).observe(document, {subtree: true, childList: true});

function waitForElement(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

async function initializeExtension() {
    await waitForElement('.recording.todo');
    const todos = document.querySelectorAll('.recording.todo:not(.has-priority-menu)');
    todos.forEach(todo => {
        todo.classList.add('has-priority-menu');
        addPriorityMenuItem(todo);
    });
}

function addPriorityMenuItem(taskElement) {
    console.log('Adding priority menu item for task:', taskElement);
    
    // Get the recording ID from the task element
    const recordingId = taskElement.getAttribute('data-recording-id');
    if (!recordingId) return;

    // Get the CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (!csrfToken) return;

    // Watch for either menu to appear
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // Check for either the action list (todo list view) or action sheet content (single todo view)
            const actionList = document.querySelector('.action-list');
            const actionSheet = document.querySelector('.action-sheet__content');
            
            if (actionList && !actionList.querySelector('.priority-menu-item')) {
                addToActionList(actionList, recordingId, csrfToken);
            }
            
            if (actionSheet && !actionSheet.querySelector('.priority-menu-item')) {
                addToActionSheet(actionSheet, recordingId, csrfToken);
            }
        });
    });

    observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
}

function addToActionList(actionList, recordingId, csrfToken) {
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

    // Add form and click handler
    const form = createPriorityForm(recordingId, csrfToken);
    menuItem.appendChild(actionLink);
    menuItem.appendChild(form);
    
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

function addToActionSheet(actionSheet, recordingId, csrfToken) {
    // Create the action sheet item
    const actionItem = document.createElement('a');
    actionItem.className = 'action-sheet__action action-sheet__action--prioritize priority-menu-item';
    actionItem.setAttribute('data-bridge-menu-action', 'true');
    actionItem.setAttribute('data-bridge-action-type', 'prioritize');
    actionItem.setAttribute('data-remote', 'true');
    actionItem.setAttribute('data-turbo-prefetch', 'false');
    actionItem.setAttribute('rel', 'nofollow');
    actionItem.href = '#';
    actionItem.textContent = 'Prioritize';

    // Add form and click handler
    const form = createPriorityForm(recordingId, csrfToken);
    const container = document.createElement('div');
    container.appendChild(actionItem);
    container.appendChild(form);
    
    actionItem.addEventListener('click', (e) => {
        e.preventDefault();
        form.submit();
    });

    // Insert after "Copy"
    const copyAction = actionSheet.querySelector('.action-sheet__action--copy');
    if (copyAction) {
        copyAction.after(container);
    } else {
        actionSheet.appendChild(container);
    }
}

function createPriorityForm(recordingId, csrfToken) {
    const form = document.createElement('form');
    form.style.display = 'none';
    form.method = 'post';
    form.action = `/5913269/my/priorities?group_by=bucket`;

    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = 'authenticity_token';
    tokenInput.value = csrfToken;

    const recordingInput = document.createElement('input');
    recordingInput.type = 'hidden';
    recordingInput.name = 'id';
    recordingInput.value = recordingId;
    recordingInput.autocomplete = 'off';

    form.appendChild(tokenInput);
    form.appendChild(recordingInput);
    
    return form;
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
initializeExtension();
