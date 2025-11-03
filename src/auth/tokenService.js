// tiny token service: access token in-memory, refresh token in localStorage
const ACCESS_KEY = 'app_access_token'
const REFRESH_KEY = 'app_refresh_token'

let accessToken = null

export const tokenService = {
  setAccessToken(token) {
    accessToken = token
    try { window.sessionStorage.setItem(ACCESS_KEY, token) } catch (e) { /* ignore */ }
  },
  getAccessToken() {
    // prefer in-memory for security; fallback to sessionStorage for reloads
    if (accessToken) return accessToken
    try {
      accessToken = window.sessionStorage.getItem(ACCESS_KEY)
      return accessToken
    } catch (e) {
      return null
    }
  },
  clearAccessToken() {
    accessToken = null
    try { window.sessionStorage.removeItem(ACCESS_KEY) } catch (e) {}
  },
  setRefreshToken(token) {
    try { localStorage.setItem(REFRESH_KEY, token) } catch (e) {}
  },
  getRefreshToken() {
    try { return localStorage.getItem(REFRESH_KEY) } catch (e) { return null }
  },
  clearRefreshToken() {
    try { localStorage.removeItem(REFRESH_KEY) } catch (e) {}
  },
  clearTokens() {
    this.clearAccessToken()
    this.clearRefreshToken()
  }
}
