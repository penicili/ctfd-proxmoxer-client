/**
 * api.js — Wrapper HTTP calls ke FastAPI backend dan internal plugin API.
 */

const BACKEND_URL = 'http://localhost:8000/api/v1';
const PLUGIN_URL  = '/admin/plugins/proxmoxer/api';

// ── Helper ───────────────────────────────────────────────────────────────────

function getCsrfToken() {
    const el = document.querySelector('meta[name="csrf-token"]');
    return el ? el.getAttribute('content') : '';
}

async function apiFetch(baseUrl, path, options = {}) {
    const res = await fetch(baseUrl + path, {
        headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': getCsrfToken(),
            ...(options.headers || {}),
        },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || err.error || `HTTP ${res.status}`);
    }
    if (res.status === 204) return null;
    return res.json();
}

const backendFetch = (path, opts) => apiFetch(BACKEND_URL, path, opts);
const pluginFetch  = (path, opts) => apiFetch(PLUGIN_URL,  path, opts);

// ── API Object ────────────────────────────────────────────────────────────────

const API = {

    // -- FastAPI Backend --

    health: () => backendFetch('/health'),

    // Levels
    getLevels:   (params = {}) => backendFetch('/levels' + toQuery(params)),
    getLevel:    (id)          => backendFetch(`/levels/${id}`),
    createLevel: (data)        => backendFetch('/levels', { method: 'POST', body: JSON.stringify(data) }),
    updateLevel: (id, data)    => backendFetch(`/levels/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteLevel: (id)          => backendFetch(`/levels/${id}`, { method: 'DELETE' }),
    prepareLevel: (id)         => backendFetch(`/levels/${id}/prepare`, { method: 'POST' }),

    // Challenges
    getChallenges:      (params = {}) => backendFetch('/challenges' + toQuery(params)),
    getChallenge:       (id)          => backendFetch(`/challenges/${id}`),
    deployChallenge:    (data)        => backendFetch('/challenges', { method: 'POST', body: JSON.stringify(data) }),
    terminateChallenge: (id)          => backendFetch(`/challenges/${id}`, { method: 'DELETE' }),

    // -- Internal Plugin API (akses langsung ke CTFd DB) --

    /** Ambil daftar teams dari CTFd */
    getTeams: () => pluginFetch('/teams'),

    /**
     * Buat entri challenge di CTFd setelah VM running.
     * @param {object} data - { team_id, flag, level_name, level_category, level_points, level_description, vm_ip }
     */
    finalizeChallenge: (data) => pluginFetch('/finalize', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Util ──────────────────────────────────────────────────────────────────────

function toQuery(params) {
    const q = new URLSearchParams(params).toString();
    return q ? '?' + q : '';
}
