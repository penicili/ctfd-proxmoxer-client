/**
 * api.js — Wrapper HTTP calls ke FastAPI backend
 * Semua fetch ke backend lewat fungsi di sini.
 */

const BACKEND_URL = 'http://localhost:8000/api/v1';

/**
 * Helper fetch dengan error handling standar.
 * Throws error jika response bukan 2xx.
 */
async function apiFetch(path, options = {}) {
    const res = await fetch(BACKEND_URL + path, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `HTTP ${res.status}`);
    }
    // 204 No Content
    if (res.status === 204) return null;
    return res.json();
}

// ── Health ──────────────────────────────────────────────
const API = {
    health: () => apiFetch('/health'),

    // ── Levels ────────────────────────────────────────
    getLevels: (params = {}) => {
        const q = new URLSearchParams(params).toString();
        return apiFetch('/levels' + (q ? '?' + q : ''));
    },
    createLevel: (data) => apiFetch('/levels', { method: 'POST', body: JSON.stringify(data) }),
    updateLevel: (id, data) => apiFetch(`/levels/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteLevel: (id) => apiFetch(`/levels/${id}`, { method: 'DELETE' }),

    // ── Challenges ────────────────────────────────────
    getChallenges: (params = {}) => {
        const q = new URLSearchParams(params).toString();
        return apiFetch('/challenges' + (q ? '?' + q : ''));
    },
    getChallenge: (id) => apiFetch(`/challenges/${id}`),
    deployChallenge: (data) => apiFetch('/challenges', { method: 'POST', body: JSON.stringify(data) }),
    terminateChallenge: (id) => apiFetch(`/challenges/${id}`, { method: 'DELETE' }),
};
