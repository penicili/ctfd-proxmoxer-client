/**
 * deploy.js — Logic untuk tab Deploy Challenge
 */

let pollingInterval = null;

// ── Populate level dropdown ──────────────────────────────

async function loadLevelsForDeploy() {
    const select = document.getElementById('deploy-level-select');
    try {
        const data = await API.getLevels({ is_active: true });
        select.innerHTML = '<option value="">-- Select Level --</option>' +
            data.levels.map(l =>
                `<option value="${l.id}" data-difficulty="${l.difficulty}" data-points="${l.points}" data-desc="${l.description || ''}">
                    ${l.name} (${l.difficulty}, ${l.points} pts)
                </option>`
            ).join('');
    } catch (e) {
        select.innerHTML = '<option value="">Failed to load levels</option>';
    }
}

// Tampilkan info level saat dipilih
document.getElementById('deploy-level-select')?.addEventListener('change', function () {
    const opt = this.options[this.selectedIndex];
    const info = document.getElementById('deploy-level-info');
    if (this.value && opt.dataset.desc) {
        info.textContent = opt.dataset.desc;
    } else {
        info.textContent = '';
    }
});

// Toggle custom VM config
document.getElementById('toggle-vm-config')?.addEventListener('change', function () {
    document.getElementById('vm-config-fields').classList.toggle('d-none', !this.checked);
});

// ── Deploy Form Submit ───────────────────────────────────

document.getElementById('form-deploy')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const alertEl = document.getElementById('deploy-alert');
    const btnDeploy = document.getElementById('btn-deploy');

    alertEl.className = 'alert d-none';

    const formData = new FormData(form);
    const payload = {
        level_id: parseInt(formData.get('level_id')),
        team_name: formData.get('team_name'),
    };

    if (document.getElementById('toggle-vm-config').checked) {
        const memory = formData.get('memory');
        const cores = formData.get('cores');
        if (memory || cores) {
            payload.vm_config = {};
            if (memory) payload.vm_config.memory = parseInt(memory);
            if (cores) payload.vm_config.cores = parseInt(cores);
        }
    }

    btnDeploy.disabled = true;
    btnDeploy.textContent = 'Deploying...';

    try {
        const res = await API.deployChallenge(payload);
        showDeployResult(res.challenge_id, formData.get('team_name'));
    } catch (e) {
        alertEl.className = 'alert alert-danger';
        alertEl.textContent = 'Deploy failed: ' + e.message;
        btnDeploy.disabled = false;
        btnDeploy.textContent = 'Deploy VM';
    }
});

// ── Polling Status ───────────────────────────────────────

function showDeployResult(challengeId, teamName) {
    const card = document.getElementById('deploy-result-card');
    card.style.removeProperty('display');
    card.style.display = 'block';

    document.getElementById('deploy-progress').classList.remove('d-none');
    document.getElementById('deploy-success-info').classList.add('d-none');
    document.getElementById('deploy-error-info').classList.add('d-none');
    document.getElementById('deploy-status-badge').textContent = 'pending';
    document.getElementById('deploy-status-badge').className = 'badge badge-pending';

    stopPolling();
    pollingInterval = setInterval(() => pollDeployStatus(challengeId), 3000);
    pollDeployStatus(challengeId); // first call immediately
}

async function pollDeployStatus(challengeId) {
    try {
        const data = await API.getChallenge(challengeId);
        const status = data.deployment_status;

        document.getElementById('deploy-status-badge').textContent = status;
        document.getElementById('deploy-status-badge').className = `badge badge-${status}`;

        if (status === 'running') {
            stopPolling();
            showDeploySuccess(data);
            resetDeployForm();
        } else if (status === 'error') {
            stopPolling();
            showDeployError(data.error_message || 'Unknown error');
            resetDeployForm();
        }
    } catch (e) {
        // keep polling, backend might be momentarily unavailable
    }
}

function showDeploySuccess(data) {
    document.getElementById('deploy-progress').classList.add('d-none');
    document.getElementById('deploy-success-info').classList.remove('d-none');

    document.getElementById('result-challenge-id').textContent = data.id;
    document.getElementById('result-team').textContent = data.team;
    document.getElementById('result-vm-id').textContent = data.vm_id || '—';
    document.getElementById('result-vm-ip').textContent = data.vm_ip || '—';
    document.getElementById('result-flag').textContent = data.flag || '—';
}

function showDeployError(msg) {
    document.getElementById('deploy-progress').classList.add('d-none');
    document.getElementById('deploy-error-info').classList.remove('d-none');
    document.getElementById('result-error-message').textContent = msg;
}

function stopPolling() {
    if (pollingInterval) { clearInterval(pollingInterval); pollingInterval = null; }
}

function resetDeployForm() {
    const btn = document.getElementById('btn-deploy');
    btn.disabled = false;
    btn.textContent = 'Deploy VM';
}

// Copy flag to clipboard
document.getElementById('btn-copy-flag')?.addEventListener('click', () => {
    const flag = document.getElementById('result-flag').textContent;
    navigator.clipboard.writeText(flag).then(() => {
        document.getElementById('btn-copy-flag').textContent = '✓';
        setTimeout(() => { document.getElementById('btn-copy-flag').innerHTML = '&#128203;'; }, 1500);
    });
});

// ── Init ─────────────────────────────────────────────────

// Load levels ketika tab Deploy dibuka
document.getElementById('deploy-tab')?.addEventListener('shown.bs.tab', loadLevelsForDeploy);
