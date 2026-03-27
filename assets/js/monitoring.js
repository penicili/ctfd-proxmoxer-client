/**
 * monitoring.js — Logic untuk tab Monitoring
 */

let selectedChallengeId = null;

// ── Helpers ─────────────────────────────────────────────

function statusBadge(status) {
    return `<span class="badge badge-${status}">${status}</span>`;
}

function formatDate(isoStr) {
    if (!isoStr) return '—';
    return new Date(isoStr).toLocaleString();
}

function renderMonitoringTable(challenges) {
    const tbody = document.getElementById('monitoring-tbody');
    if (!challenges.length) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">No challenges found.</td></tr>';
        return;
    }
    tbody.innerHTML = challenges.map(c => `
        <tr>
            <td>${c.id}</td>
            <td>${c.team}</td>
            <td>${c.level_name || c.level_id}</td>
            <td>${c.vm_id || '—'}</td>
            <td>${c.vm_ip || '—'}</td>
            <td>${statusBadge(c.deployment_status || 'unknown')}</td>
            <td>${c.flag_submitted
                ? '<span class="badge badge-success">Yes</span>'
                : '<span class="badge badge-secondary">No</span>'}
            </td>
            <td><small>${formatDate(c.created_at)}</small></td>
            <td>
                <button class="btn btn-sm btn-outline-info mr-1" onclick="openChallengeDetail(${c.id})">Detail</button>
                <button class="btn btn-sm btn-outline-danger"
                    onclick="openTerminateConfirm(${c.id}, '${c.team}')"
                    ${['terminated','terminating'].includes(c.deployment_status) ? 'disabled' : ''}>
                    Terminate
                </button>
            </td>
        </tr>
    `).join('');
}

async function loadChallenges() {
    const statusFilter = document.getElementById('filter-status').value;
    const params = {};
    if (statusFilter) params.status = statusFilter;

    try {
        const data = await API.getChallenges(params);
        renderMonitoringTable(data.challenges);
    } catch (e) {
        document.getElementById('monitoring-tbody').innerHTML =
            `<tr><td colspan="9" class="text-center text-danger py-4">${e.message}</td></tr>`;
    }
}

// ── Detail Modal ─────────────────────────────────────────

async function openChallengeDetail(id) {
    selectedChallengeId = id;
    try {
        const c = await API.getChallenge(id);

        document.getElementById('detail-id').textContent = c.id;
        document.getElementById('detail-team').textContent = c.team;
        document.getElementById('detail-level').textContent = c.level_name || c.level_id;
        document.getElementById('detail-vm-id').textContent = c.vm_id || '—';
        document.getElementById('detail-vm-name').textContent = c.vm_name || '—';
        document.getElementById('detail-vm-ip').textContent = c.vm_ip || '—';
        document.getElementById('detail-status').innerHTML = statusBadge(c.deployment_status || 'unknown');
        document.getElementById('detail-flag').textContent = c.flag || '—';
        document.getElementById('detail-flag-submitted').textContent = c.flag_submitted ? 'Yes' : 'No';
        document.getElementById('detail-created-at').textContent = formatDate(c.created_at);
        document.getElementById('detail-started-at').textContent = formatDate(c.started_at);

        const errorRow = document.getElementById('detail-error-row');
        if (c.error_message) {
            document.getElementById('detail-error').textContent = c.error_message;
            errorRow.classList.remove('d-none');
        } else {
            errorRow.classList.add('d-none');
        }

        const btnTerminate = document.getElementById('btn-terminate-from-detail');
        btnTerminate.disabled = ['terminated', 'terminating'].includes(c.deployment_status);
        btnTerminate.dataset.challengeId = id;
        btnTerminate.dataset.team = c.team;

        $('#modalChallengeDetail').modal('show');
    } catch (e) {
        alert('Failed to load challenge: ' + e.message);
    }
}

// Terminate dari detail modal
document.getElementById('btn-terminate-from-detail')?.addEventListener('click', function () {
    $('#modalChallengeDetail').modal('hide');
    openTerminateConfirm(this.dataset.challengeId, this.dataset.team);
});

// ── Terminate ────────────────────────────────────────────

function openTerminateConfirm(id, team) {
    selectedChallengeId = id;
    document.getElementById('confirm-team-name').textContent = team;
    $('#modalConfirmTerminate').modal('show');
}

document.getElementById('btn-confirm-terminate')?.addEventListener('click', async () => {
    $('#modalConfirmTerminate').modal('hide');
    try {
        await API.terminateChallenge(selectedChallengeId);
        loadChallenges();
    } catch (e) {
        alert('Terminate failed: ' + e.message);
    }
});

// ── Event listeners ──────────────────────────────────────

document.getElementById('btn-refresh-monitoring')?.addEventListener('click', loadChallenges);
document.getElementById('filter-status')?.addEventListener('change', loadChallenges);

// Load saat tab dibuka
document.getElementById('monitoring-tab')?.addEventListener('shown.bs.tab', loadChallenges);
