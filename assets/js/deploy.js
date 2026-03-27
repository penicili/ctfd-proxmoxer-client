/**
 * deploy.js — Logic untuk tab Deploy Challenge
 */

let pollingInterval = null;
let selectedLevel   = null;   // data level yang dipilih { id, name, category, points, description }
let selectedTeam    = null;   // data team yang dipilih  { id, name }

// ── Populate dropdowns ───────────────────────────────────────────────────────

async function loadLevelsForDeploy() {
    const select = document.getElementById('deploy-level-select');
    select.innerHTML = '<option value="">Loading...</option>';
    try {
        const data = await API.getLevels({ is_active: true });
        select.innerHTML = '<option value="">-- Select Level --</option>' +
            data.levels.map(l =>
                `<option value="${l.id}"
                    data-name="${l.name}"
                    data-category="${l.category}"
                    data-points="${l.points}"
                    data-description="${(l.description || '').replace(/"/g, '&quot;')}">
                    ${l.name} (${l.difficulty}, ${l.points} pts)
                </option>`
            ).join('');
    } catch (e) {
        select.innerHTML = '<option value="">Failed to load levels</option>';
    }
}

async function loadTeamsForDeploy() {
    const select = document.getElementById('deploy-team-select');
    select.innerHTML = '<option value="">Loading...</option>';
    try {
        const data = await API.getTeams();
        if (!data.teams.length) {
            select.innerHTML = '<option value="">No teams registered in CTFd</option>';
            return;
        }
        select.innerHTML = '<option value="">-- Select Team --</option>' +
            data.teams.map(t =>
                `<option value="${t.id}" data-name="${t.name}">${t.name}</option>`
            ).join('');
    } catch (e) {
        select.innerHTML = '<option value="">Failed to load teams</option>';
    }
}

// Simpan data level yang dipilih
document.getElementById('deploy-level-select')?.addEventListener('change', function () {
    const opt = this.options[this.selectedIndex];
    if (this.value) {
        selectedLevel = {
            id:          parseInt(this.value),
            name:        opt.dataset.name,
            category:    opt.dataset.category,
            points:      parseInt(opt.dataset.points),
            description: opt.dataset.description,
        };
        document.getElementById('deploy-level-info').textContent = opt.dataset.description || '';
    } else {
        selectedLevel = null;
        document.getElementById('deploy-level-info').textContent = '';
    }
});

// Simpan data team yang dipilih
document.getElementById('deploy-team-select')?.addEventListener('change', function () {
    const opt = this.options[this.selectedIndex];
    selectedTeam = this.value ? { id: parseInt(this.value), name: opt.dataset.name } : null;
});

// Toggle custom VM config
document.getElementById('toggle-vm-config')?.addEventListener('change', function () {
    document.getElementById('vm-config-fields').classList.toggle('d-none', !this.checked);
});

// ── Deploy Form Submit ────────────────────────────────────────────────────────

document.getElementById('form-deploy')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const alertEl  = document.getElementById('deploy-alert');
    const btnDeploy = document.getElementById('btn-deploy');
    alertEl.className = 'alert d-none';

    if (!selectedLevel || !selectedTeam) {
        alertEl.className = 'alert alert-warning';
        alertEl.textContent = 'Please select both a level and a team.';
        return;
    }

    const payload = {
        level_id:  selectedLevel.id,
        team_name: selectedTeam.name,   // backend pakai nama sebagai identifier
    };

    const useCustomConfig = document.getElementById('toggle-vm-config').checked;
    if (useCustomConfig) {
        const memory = document.querySelector('[name=memory]').value;
        const cores  = document.querySelector('[name=cores]').value;
        if (memory || cores) {
            payload.vm_config = {};
            if (memory) payload.vm_config.memory = parseInt(memory);
            if (cores)  payload.vm_config.cores  = parseInt(cores);
        }
    }

    btnDeploy.disabled = true;
    btnDeploy.textContent = 'Deploying...';

    try {
        const res = await API.deployChallenge(payload);
        showDeployResultCard(res.challenge_id);
    } catch (err) {
        alertEl.className = 'alert alert-danger';
        alertEl.textContent = 'Deploy failed: ' + err.message;
        btnDeploy.disabled = false;
        btnDeploy.textContent = 'Deploy VM';
    }
});

// ── Deploy Result Card ────────────────────────────────────────────────────────

function showDeployResultCard(challengeId) {
    const card = document.getElementById('deploy-result-card');
    card.style.cssText = '';   // hapus inline display:none

    document.getElementById('deploy-progress').classList.remove('d-none');
    document.getElementById('deploy-success-info').classList.add('d-none');
    document.getElementById('deploy-error-info').classList.add('d-none');
    setStatusBadge('pending');

    stopPolling();
    pollingInterval = setInterval(() => pollDeployStatus(challengeId), 3000);
    pollDeployStatus(challengeId);
}

// ── Polling ───────────────────────────────────────────────────────────────────

async function pollDeployStatus(challengeId) {
    try {
        const data = await API.getChallenge(challengeId);
        const status = data.deployment_status;
        setStatusBadge(status);

        if (status === 'running') {
            stopPolling();
            await finalizeAndShow(data);
            resetDeployForm();
        } else if (status === 'error') {
            stopPolling();
            showDeployError(data.error_message || 'Unknown error');
            resetDeployForm();
        } else {
            // Update progress text sesuai status
            const msgs = { pending: 'Waiting to start...', creating: 'Creating VM on Proxmox...' };
            document.getElementById('deploy-progress-text').textContent =
                msgs[status] || 'Provisioning VM, please wait...';
        }
    } catch (_) {
        // backend sedang sibuk, tunggu polling berikutnya
    }
}

/**
 * Setelah VM running: panggil plugin API untuk buat entri challenge di CTFd,
 * lalu tampilkan hasilnya.
 */
async function finalizeAndShow(deployData) {
    document.getElementById('deploy-progress-text').textContent = 'Creating CTFd challenge entry...';

    try {
        const ctfd = await API.finalizeChallenge({
            team_id:           selectedTeam.id,
            flag:              deployData.flag,
            level_name:        selectedLevel.name,
            level_category:    selectedLevel.category,
            level_points:      selectedLevel.points,
            level_description: selectedLevel.description,
            vm_ip:             deployData.vm_ip,
        });

        showDeploySuccess(deployData, ctfd.ctfd_challenge_id);
    } catch (err) {
        // VM sudah jalan tapi gagal buat CTFd entry — tetap tampilkan info VM
        showDeploySuccess(deployData, null, 'CTFd challenge creation failed: ' + err.message);
    }
}

function showDeploySuccess(data, ctfdId, warning = null) {
    document.getElementById('deploy-progress').classList.add('d-none');
    document.getElementById('deploy-success-info').classList.remove('d-none');

    document.getElementById('result-challenge-id').textContent = data.id;
    document.getElementById('result-ctfd-id').textContent      = ctfdId ?? '—' + (warning ? ' ⚠️' : '');
    document.getElementById('result-team').textContent         = data.team;
    document.getElementById('result-vm-id').textContent        = data.vm_id  || '—';
    document.getElementById('result-vm-ip').textContent        = data.vm_ip  || '—';
    document.getElementById('result-flag').textContent         = data.flag   || '—';

    if (warning) {
        const alertEl = document.getElementById('deploy-alert');
        alertEl.className = 'alert alert-warning mt-2';
        alertEl.textContent = warning;
    }
}

function showDeployError(msg) {
    document.getElementById('deploy-progress').classList.add('d-none');
    document.getElementById('deploy-error-info').classList.remove('d-none');
    document.getElementById('result-error-message').textContent = msg;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function setStatusBadge(status) {
    const el = document.getElementById('deploy-status-badge');
    el.textContent  = status;
    el.className    = `badge badge-${status}`;
}

function stopPolling() {
    if (pollingInterval) { clearInterval(pollingInterval); pollingInterval = null; }
}

function resetDeployForm() {
    const btn = document.getElementById('btn-deploy');
    btn.disabled    = false;
    btn.textContent = 'Deploy VM';
}

// Copy flag
document.getElementById('btn-copy-flag')?.addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('result-flag').textContent).then(() => {
        document.getElementById('btn-copy-flag').textContent = '✓';
        setTimeout(() => { document.getElementById('btn-copy-flag').innerHTML = '&#128203;'; }, 1500);
    });
});

// ── Init ──────────────────────────────────────────────────────────────────────

document.getElementById('deploy-tab')?.addEventListener('shown.bs.tab', () => {
    loadLevelsForDeploy();
    loadTeamsForDeploy();
});
