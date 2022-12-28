export const ENDPOINTS = {
  API: API_URL === '/' ? '/api' : `${API_SECURE ? 'https' : 'http'}://${API_URL}/api`,
  WS:
    API_URL === '/'
      ? `${location.protocol === 'https' ? 'wss' : 'ws'}://${location.host}/ws`
      : `${API_SECURE ? 'wss' : 'ws'}://${API_URL}/ws`,
};
