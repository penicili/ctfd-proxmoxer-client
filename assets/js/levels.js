/**
 * levels.js — Logic untuk tab Levels
 */

let editingLevelId = null;

// ── Helpers ─────────────────────────────────────────────

function difficultyBadge(d) {
    return `<span class="badge badge-${d}">${d}</span>`;
}

function prepareBadge(status) {
    const map = {
        none: { cls: 'secondary', text: 'Not Prepared' },
        preparing: { cls: 'warning', text: 'Preparing...' },
        ready: { cls: 'success', text: 'Ready' },
        error: { cls: 'danger', text: 'Error' },
    };
    const s = map[status] || map.none;
    return `<span class="badge badge-${s.cls}">${s.text}</span>`;
}

function renderLevelsTable(levels) {
    const tbody = document.getElementById('levels-tbody');
    if (!levels.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">No levels found.</td></tr>';
        return;
    }
    tbody.innerHTML = levels.map(l => {
        const prepareBtn = l.source_url && l.prepare_status !== 'preparing'
            ? `<button class="btn btn-sm btn-outline-info mr-1" onclick="prepareLevel(${l.id})">${l.prepare_status === 'ready' ? 'Re-prepare' : 'Prepare'}</button>`
            : '';
        return `
        <tr>
            <td>${l.id}</td>
            <td>${l.name}</td>
            <td><small>${l.category}</small></td>
            <td>${difficultyBadge(l.difficulty)}</td>
            <td>${l.points}</td>
            <td>${prepareBadge(l.prepare_status)}${l.prepare_status === 'error' ? `<br><small class="text-danger" title="${l.prepare_error || ''}">${(l.prepare_error || '').substring(0, 50)}</small>` : ''}</td>
            <td>
                <span class="badge badge-${l.is_active ? 'success' : 'secondary'}">
                    ${l.is_active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                ${prepareBtn}
                <button class="btn btn-sm btn-outline-secondary mr-1" onclick="openEditLevel(${l.id})">Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteLevel(${l.id}, '${l.name}')">Delete</button>
            </td>
        </tr>`;
    }).join('');
}

async function loadLevels() {
    try {
        const data = await API.getLevels({ is_active: true });
        renderLevelsTable(data.levels);
        // Auto-poll jika ada level yang sedang preparing
        if (data.levels.some(l => l.prepare_status === 'preparing')) {
            startPreparePoll();
        }
    } catch (e) {
        document.getElementById('levels-tbody').innerHTML =
            `<tr><td colspan="8" class="text-center text-danger py-4">${e.message}</td></tr>`;
    }
}

// ── Create Level ─────────────────────────────────────────

document.getElementById('btn-save-level')?.addEventListener('click', async () => {
    const form = document.getElementById('form-create-level');
    const errEl = document.getElementById('create-level-error');
    errEl.classList.add('d-none');

    if (!form.checkValidity()) { form.reportValidity(); return; }

    const data = Object.fromEntries(new FormData(form));
    data.points = parseInt(data.points);

    try {
        await API.createLevel(data);
        $('#modalCreateLevel').modal('hide');
        form.reset();
        loadLevels();
    } catch (e) {
        errEl.textContent = e.message;
        errEl.classList.remove('d-none');
    }
});

// Reset form saat modal ditutup
document.getElementById('modalCreateLevel')?.addEventListener('hidden.bs.modal', () => {
    document.getElementById('form-create-level').reset();
    document.getElementById('create-level-error').classList.add('d-none');
});

// ── Edit Level ───────────────────────────────────────────

async function openEditLevel(id) {
    editingLevelId = id;
    try {
        const level = await API.getLevels({ id }); // fallback: fetch from table data
        // Populate form dari data yang sudah ada di tabel (hindari extra request)
        const row = document.querySelector(`#levels-tbody button[onclick="openEditLevel(${id})"]`)?.closest('tr');
        if (!row) return;

        const form = document.getElementById('form-edit-level');
        form.querySelector('[name=id]').value = id;
        // Ambil data dari API langsung karena tabel tidak menyimpan semua field
        const detail = await apiFetch(`/levels/${id}`);
        form.querySelector('[name=name]').value = detail.name;
        form.querySelector('[name=category]').value = detail.category;
        form.querySelector('[name=difficulty]').value = detail.difficulty;
        form.querySelector('[name=points]').value = detail.points;
        form.querySelector('[name=template_url]').value = detail.template_url || '';
        form.querySelector('[name=source_url]').value = detail.source_url || '';
        form.querySelector('[name=description]').value = detail.description || '';

        $('#modalEditLevel').modal('show');
    } catch (e) {
        alert('Failed to load level: ' + e.message);
    }
}

document.getElementById('btn-update-level')?.addEventListener('click', async () => {
    const form = document.getElementById('form-edit-level');
    const errEl = document.getElementById('edit-level-error');
    errEl.classList.add('d-none');

    if (!form.checkValidity()) { form.reportValidity(); return; }

    const data = Object.fromEntries(new FormData(form));
    const id = data.id;
    delete data.id;
    data.points = parseInt(data.points);

    try {
        await API.updateLevel(id, data);
        $('#modalEditLevel').modal('hide');
        loadLevels();
    } catch (e) {
        errEl.textContent = e.message;
        errEl.classList.remove('d-none');
    }
});

// ── Delete Level ─────────────────────────────────────────

async function confirmDeleteLevel(id, name) {
    if (!confirm(`Deactivate level "${name}"?`)) return;
    try {
        await API.deleteLevel(id);
        loadLevels();
    } catch (e) {
        alert('Failed: ' + e.message);
    }
}

// ── Prepare Level ───────────────────────────────────────

async function prepareLevel(id) {
    if (!confirm('Prepare template for this level? This will clone a VM, build the Docker image, and convert to template.')) return;
    try {
        await API.prepareLevel(id);
        loadLevels();
        startPreparePoll();
    } catch (e) {
        alert('Failed: ' + e.message);
    }
}

let preparePollInterval = null;

function startPreparePoll() {
    if (preparePollInterval) return;
    preparePollInterval = setInterval(async () => {
        const data = await API.getLevels({ is_active: true });
        renderLevelsTable(data.levels);
        const hasPreparing = data.levels.some(l => l.prepare_status === 'preparing');
        if (!hasPreparing) {
            clearInterval(preparePollInterval);
            preparePollInterval = null;
        }
    }, 5000);
}

// ── Init ─────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    loadLevels();
});
