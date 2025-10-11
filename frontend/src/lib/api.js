// API client for PastPort backend
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const prodUrl = 'https://pastport-3xaq.onrender.com';
  const devUrl = 'http://localhost:5000';
  
  // Use environment variable if set
  if (envUrl) {
    // Ensure it ends with /api
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  
  // Use production or development URL
  return import.meta.env.PROD ? `${prodUrl}/api` : `${devUrl}/api`;
};

const API_BASE_URL = getBaseURL();

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
    
    // Debug logging
    console.log('API Client initialized with baseURL:', this.baseURL);
    console.log('Environment:', {
      PROD: import.meta.env.PROD,
      VITE_API_URL: import.meta.env.VITE_API_URL
    });
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Get authentication headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      // Always get the latest token from localStorage
      const currentToken = localStorage.getItem('token') || this.token;
      if (currentToken) {
        headers.Authorization = `Bearer ${currentToken}`;
      }
    }

    return headers;
  }

  // Make HTTP request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };
    
    // Debug logging in development
    if (import.meta.env.DEV) {
      console.log('API Request:', { url, endpoint, baseURL: this.baseURL });
    }

    try {
      const response = await fetch(url, config);
      let data;
      try {
        data = await response.json();
      } catch (_) {
        data = null;
      }

      if (!response.ok) {
        const message = (data && (data.message || data.error || data.errors)) ? JSON.stringify(data) : 'Request failed';
        const err = new Error(message);
        err.status = response.status;
        err.data = data;
        throw err;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      includeAuth: false,
    });

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      includeAuth: false,
    });

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout() {
    this.setToken(null);
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updatePreferences(preferences) {
    return this.request('/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  async changePassword(passwordData) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async searchUsers(query, limit = 10) {
    return this.request(`/auth/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  // Capsule endpoints
  async getCapsules(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    return this.request(`/capsules${queryString ? `?${queryString}` : ''}`);
  }

  async getCapsule(id) {
    return this.request(`/capsules/${id}`);
  }

  async createCapsule(capsuleData) {
    const formData = new FormData();
    
    // Add text fields
    Object.entries(capsuleData).forEach(([key, value]) => {
      if (key !== 'media' && value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    });

    // Add media file if present
    if (capsuleData.media) {
      formData.append('media', capsuleData.media);
    }

    // Always get the latest token from localStorage
    const currentToken = localStorage.getItem('token') || this.token;
    return this.request('/capsules', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${currentToken}`,
        // Don't set Content-Type for FormData, let browser set it
      },
      body: formData,
    });
  }

  async updateCapsule(id, capsuleData) {
    return this.request(`/capsules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(capsuleData),
    });
  }

  async deleteCapsule(id) {
    return this.request(`/capsules/${id}`, {
      method: 'DELETE',
    });
  }

  async unlockCapsule(id, answer = null) {
    return this.request(`/capsules/${id}/unlock`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
  }

  async addReaction(capsuleId, emoji) {
    return this.request(`/capsules/${capsuleId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    });
  }

  async addComment(capsuleId, text) {
    return this.request(`/capsules/${capsuleId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async getCapsuleStats() {
    return this.request('/capsules/stats');
  }

  // User endpoints
  async getUserProfile(userId) {
    return this.request(`/users/${userId}`);
  }

  async getUserFriends(userId) {
    return this.request(`/users/${userId}/friends`);
  }

  async getUserBadges(userId) {
    return this.request(`/users/${userId}/badges`);
  }

  async getUserCapsules(userId, filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    return this.request(`/users/${userId}/capsules${queryString ? `?${queryString}` : ''}`);
  }

  async sendFriendRequest(userId) {
    return this.request(`/users/${userId}/friend-request`, {
      method: 'POST',
    });
  }

  async respondToFriendRequest(requestId, action) {
    return this.request(`/users/friend-requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify({ action }),
    });
  }

  async removeFriend(userId) {
    return this.request(`/users/${userId}/friends`, {
      method: 'DELETE',
    });
  }

  async getFriendRequests() {
    return this.request('/users/friend-requests');
  }

  // Notification endpoints
  async getNotifications(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    return this.request(`/notifications${queryString ? `?${queryString}` : ''}`);
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotification(notificationId) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }

  // Streak endpoints
  async getUserStreak(userId) {
    return this.request(`/users/${userId}/streak`);
  }

  // Lottery endpoints
  async getLotteryCapsule() {
    return this.request('/lottery');
  }

  async unlockLotteryCapsule(id) {
    return this.request(`/lottery/${id}/unlock`, {
      method: 'PATCH',
    });
  }

  async getLotteryHistory(page = 1, limit = 10) {
    return this.request(`/lottery/history?page=${page}&limit=${limit}`);
  }

  // Riddle endpoints
  async attemptRiddle(capsuleId, answer) {
    return this.request(`/capsules/${capsuleId}/attempt`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
  }

  // Journal endpoints
  async getJournalStreak() {
    return this.request('/journal/streak');
  }

  async getMonthEntries(userId, year, month) {
    return this.request(`/journal/${userId}/month/${year}/${month}`);
  }

  async createJournalEntry(entryData) {
    return this.request('/journal', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  }

  async updateJournalEntry(id, entryData) {
    return this.request(`/journal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entryData),
    });
  }

  async deleteJournalEntry(id) {
    return this.request(`/journal/${id}`, {
      method: 'DELETE',
    });
  }

  async unlockJournalEntry(id, answer = '') {
    return this.request(`/journal/${id}/unlock`, {
      method: 'PATCH',
      body: JSON.stringify({ answer }),
    });
  }

  // Memory API methods
  async getMemories() {
    return this.request('/memories', 'GET');
  }

  async getMemory(id) {
    return this.request(`/memories/${id}`, 'GET');
  }

  async createMemory(memoryData) {
    return this.request('/memories', 'POST', memoryData);
  }

  async updateMemory(id, memoryData) {
    return this.request(`/memories/${id}`, 'PUT', memoryData);
  }

  async deleteMemory(id) {
    return this.request(`/memories/${id}`, 'DELETE');
  }

  async getRelatedMemories(id) {
    return this.request(`/memories/${id}/related`, 'GET');
  }

  async getMemoriesByCategory(category) {
    return this.request(`/memories/category/${category}`, 'GET');
  }

  // Media endpoints
  async uploadMedia(formData) {
    const url = `${this.baseURL}/media/upload`;
    // Always get the latest token from localStorage
    const currentToken = localStorage.getItem('token') || this.token;
    const config = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${currentToken}`,
        // Don't set Content-Type - let browser set it with boundary for FormData
      },
      body: formData
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }
      
      return data;
    } catch (error) {
      console.error('Media upload failed:', error);
      throw error;
    }
  }

  async getEntryMedia(entryType, entryId) {
    return this.request(`/media/${entryType}/${entryId}`);
  }

  async deleteMedia(mediaId) {
    return this.request(`/media/${mediaId}`, {
      method: 'DELETE'
    });
  }

  async getUserMedia(userId) {
    return this.request(`/media/user/${userId}`);
  }

  // Notification endpoints
  async getNotifications(page = 1, limit = 20, unreadOnly = false) {
    return this.request(`/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`);
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotification(notificationId) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();

// Initialize token from localStorage on app start
const savedToken = localStorage.getItem('token');
if (savedToken) {
  apiClient.setToken(savedToken);
}

export default apiClient;
