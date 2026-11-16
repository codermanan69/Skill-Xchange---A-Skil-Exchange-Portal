// ═══════════════════════════════════════════════
// Skill Xchange — Centralized API Client
// ═══════════════════════════════════════════════

export const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';
export const TOKEN_KEY = 'skillxchange_token';
export const USER_KEY = 'skillxchange_user';

/**
 * Builds request headers, automatically appending Authorization Bearer token if present
 */
function getHeaders(customHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Centralized fetch wrapper with automatic JSON parsing and error handling
 */
async function request(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const config = {
    ...options,
    headers: getHeaders(options.headers),
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    throw new Error('Unable to connect to the backend server. Please verify the backend is running.');
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    // If unauthorized / token expired, clear client tokens
    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    const message = data?.message || data?.error || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body = {}, options = {}) {
    return request(endpoint, { ...options, method: 'POST', body });
  },

  patch(endpoint, body = {}, options = {}) {
    return request(endpoint, { ...options, method: 'PATCH', body });
  },

  put(endpoint, body = {}, options = {}) {
    return request(endpoint, { ...options, method: 'PUT', body });
  },

  delete(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'DELETE' });
  },
};

export default api;
