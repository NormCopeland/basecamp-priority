function createPriorityButton(taskElement) {
    console.log('Creating priority button for task:', taskElement);
    // Get the recording ID from the task element
    const recordingId = taskElement.getAttribute('data-recording-id');
    console.log('Recording ID:', recordingId);
    if (!recordingId) {
        console.log('No recording ID found, returning');
        return;
    }
  
    // Get the CSRF token from the page
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    console.log('CSRF Token:', csrfToken ? 'Found' : 'Not found');
    if (!csrfToken) {
        console.log('No CSRF token found, returning');
        return;
    }
  
    // Create the prioritize form
    const form = document.createElement('form');
    form.className = 'button_to priority-form';
    form.method = 'post';
    form.action = '/5913269/my/priorities?group_by=bucket';
    
    // Create the button
    const button = document.createElement('button');
    button.type = 'submit';
    button.title = 'Prioritize';
    button.className = 'btn btn--small btn--small-icon btn--borderless btn--arrow-top-icon my-assignments__prioritize priority-button';
    button.innerHTML = '↑';
    
    // Add the authenticity token
    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = 'authenticity_token';
    tokenInput.value = csrfToken;
    
    // Add the recording ID
    const recordingInput = document.createElement('input');
    recordingInput.type = 'hidden';
    recordingInput.name = 'id';
    recordingInput.value = recordingId;
    recordingInput.autocomplete = 'off';
  
    // Assemble the form
    form.appendChild(button);
    form.appendChild(tokenInput);
    form.appendChild(recordingInput);
    
    // Add the form to a container
    const container = document.createElement('div');
    container.className = 'priority-container';
    container.appendChild(form);
    
    console.log('Priority button container created:', container);
    return container;
}
  
function addPriorityButtons() {
    console.log('Running addPriorityButtons');
    const todos = document.querySelectorAll('.recording.todo:not(.has-priority-button)');
    console.log('Found todos:', todos.length);
    
    todos.forEach(todo => {
        console.log('Processing todo:', todo);
        const priorityContainer = createPriorityButton(todo);
        if (priorityContainer) {
            todo.classList.add('has-priority-button');
            
            // Look for the indent div
            const indentDiv = todo.querySelector('.indent');
            if (indentDiv) {
                // Insert at the beginning of the indent div
                indentDiv.insertBefore(priorityContainer, indentDiv.firstChild);
                console.log('Priority button added to indent div');
            } else {
                console.log('No indent div found');
            }
        } else {
            console.log('No priority container created for todo');
        }
    });
}

// Watch for DOM changes
const observer = new MutationObserver(mutations => {
    console.log('DOM mutation observed');
    mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
            console.log('New nodes added, running addPriorityButtons');
            addPriorityButtons();
        }
    });
});
  
observer.observe(document.body, { 
    childList: true, 
    subtree: true 
});
  
// Initial run
console.log('Initial extension run');
addPriorityButtons();
