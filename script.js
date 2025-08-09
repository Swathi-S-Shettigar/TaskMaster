function getItems() {
  return JSON.parse(localStorage.getItem("itemjson")) || [];
}

function saveItems(items) {
  localStorage.setItem("itemjson", JSON.stringify(items));
}

function renderTable(filterType = "all") {
  const items = getItems();
  const table = document.getElementById("myTable");
  const taskCount = document.getElementById("taskCount");
  table.innerHTML = "";

  let filteredItems = [];

  if (filterType === "all") {
    filteredItems = items;
  } else if (filterType === "completed") {
    filteredItems = items.filter((item) => item.completed);
  } else if (filterType === "pending") {
    filteredItems = items.filter((item) => !item.completed);
  }

  if (filteredItems.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td colspan="7" class="text-center py-4">
        <i class="fas fa-tasks fa-3x mb-3" style="color: #6c63ff; opacity: 0.5;"></i>
        <h5>No tasks found</h5>
        <p class="text-muted">${filterType === 'all' ? 'Add your first task above!' : `No ${filterType} tasks`}</p>
      </td>
    `;
    table.appendChild(row);
  } else {
    filteredItems.forEach((item, index) => {
      const checked = item.completed ? "checked" : "";
      const dueDate = item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "-";
      const today = new Date().toISOString().split('T')[0];
      const isOverdue = item.dueDate && !item.completed && item.dueDate < today;
      
      const row = document.createElement("tr");
      row.className = "fade-in";
      row.innerHTML = `
        <td data-label="#">${index + 1}</td>
        <td data-label="Status">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" 
              onchange="toggleComplete(${items.indexOf(item)})" ${checked}>
          </div>
        </td>
        <td data-label="Title" class="${item.completed ? "text-decoration-line-through" : ""}">
          ${item.title}
          ${isOverdue ? '<span class="badge bg-danger ms-2">Overdue</span>' : ''}
        </td>
        <td data-label="Description" class="${item.completed ? "text-decoration-line-through" : ""}">
          ${item.desc}
        </td>
        <td data-label="Due Date">
          ${dueDate}
          ${isOverdue ? '<span class="badge bg-danger ms-2">Overdue</span>' : ''}
        </td>
        <td data-label="Tag">
          <span class="badge ${getTagClass(item.tag)}">${item.tag || "None"}</span>
        </td>
        <td data-label="Actions">
          <div class="action-buttons">
            <button class="btn btn-edit btn-sm" onclick="editItem(${items.indexOf(item)})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-delete btn-sm" onclick="deleteItem(${items.indexOf(item)})">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      `;
      table.appendChild(row);
    });
  }

  taskCount.innerText = items.length;
}

function getTagClass(tag) {
  if (!tag) return "bg-secondary";
  const tagClasses = {
    "Work": "tag-work",
    "Personal": "tag-personal",
    "Urgent": "tag-urgent",
    "Shopping": "tag-shopping",
    "Other": "tag-other"
  };
  return tagClasses[tag] || "bg-secondary";
}

function addItem() {
  const title = document.getElementById("title").value.trim();
  const desc = document.getElementById("description").value.trim();
  const dueDate = document.getElementById("duedate").value;
  const tag = document.getElementById("tag").value.trim();

  if (!title) {
    alert("Please enter a task title.");
    return;
  }

  const items = getItems();
  items.push({
    title: title,
    desc: desc,
    dueDate: dueDate,
    tag: tag,
    completed: false,
  });
  saveItems(items);

  // Clear form
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("duedate").value = "";
  document.getElementById("tag").value = "";
  
  // Re-render table
  renderTable();
  
  // Scroll to the new task
  setTimeout(() => {
    const table = document.getElementById("myTable");
    table.lastElementChild.scrollIntoView({ behavior: 'smooth' });
  }, 300);
}

function deleteItem(index) {
  if (confirm("Are you sure you want to delete this task?")) {
    const items = getItems();
    items.splice(index, 1);
    saveItems(items);
    renderTable();
  }
}

function editItem(index) {
  const items = getItems();
  const item = items[index];

  document.getElementById("title").value = item.title;
  document.getElementById("description").value = item.desc;
  document.getElementById("duedate").value = item.dueDate;
  document.getElementById("tag").value = item.tag;

  items.splice(index, 1);
  saveItems(items);
  renderTable();
  
  // Scroll to the form
  document.getElementById("title").scrollIntoView({ behavior: 'smooth' });
  document.getElementById("title").focus();
}

function toggleComplete(index) {
  const items = getItems();
  items[index].completed = !items[index].completed;
  saveItems(items);
  renderTable();
}

function clearList() {
  if (confirm("Are you sure you want to clear ALL tasks? This cannot be undone.")) {
    localStorage.removeItem("itemjson");
    renderTable();
  }
}

function toggleDark() {
  document.body.classList.toggle("dark-mode");
  const darkModeBtn = document.querySelector('.btn-outline-light');
  if (document.body.classList.contains("dark-mode")) {
    darkModeBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    darkModeBtn.classList.remove('btn-outline-light');
    darkModeBtn.classList.add('btn-outline-warning');
  } else {
    darkModeBtn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    darkModeBtn.classList.remove('btn-outline-warning');
    darkModeBtn.classList.add('btn-outline-light');
  }
}

function filterTasks(type) {
  renderTable(type);
}

// Initialize the app
document.addEventListener("DOMContentLoaded", function() {
  renderTable();
  
  // Add event listener for Enter key in title field
  document.getElementById("title").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      addItem();
    }
  });
  
  // Set today's date as default for due date
  document.getElementById("duedate").min = new Date().toISOString().split('T')[0];
  
  // Add click event for the Add button
  document.getElementById("add").addEventListener("click", addItem);
});