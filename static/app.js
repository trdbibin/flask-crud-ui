// static/app.js

const form = document.getElementById('recordForm');
const cancelBtn = document.getElementById('cancelEdit');
const recordIdInput = document.getElementById('recordId');
let isEditMode = false;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const record = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    author: document.getElementById('author').value,
    category: document.getElementById('category').value,
  };

  const id = recordIdInput.value;

  if (isEditMode && id) {
    await fetch(`/api/records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  } else {
    await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  }

  resetForm();
  loadRecords();
});

cancelBtn.addEventListener('click', resetForm);

function resetForm() {
  form.reset();
  recordIdInput.value = '';
  isEditMode = false;
  cancelBtn.classList.add('d-none');
}

async function loadRecords() {
  const res = await fetch('/api/records');
  const records = await res.json();
  const table = document.getElementById('recordsTable');
  table.innerHTML = '';
  records.forEach(r => {
    table.innerHTML += `
      <tr>
        <td>${r.title}</td>
        <td>${r.description}</td>
        <td>${r.author}</td>
        <td>${r.category}</td>
        <td>${new Date(r.created_at).toLocaleString()}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editRecord(${r.id}, '${r.title}', '${r.description}', '${r.author}', '${r.category}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteRecord(${r.id})">Delete</button>
        </td>
      </tr>`;
  });
}

function editRecord(id, title, description, author, category) {
  document.getElementById('title').value = title;
  document.getElementById('description').value = description;
  document.getElementById('author').value = author;
  document.getElementById('category').value = category;
  recordIdInput.value = id;
  isEditMode = true;
  cancelBtn.classList.remove('d-none');
}

async function deleteRecord(id) {
  if (confirm('Delete this record?')) {
    await fetch(`/api/records/${id}`, { method: 'DELETE' });
    loadRecords();
  }
}

window.onload = loadRecords;
