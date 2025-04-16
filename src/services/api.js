import axios from 'axios';

// Base URL for the API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost/php_project/Lock Box/LockBox.php';

// API key for authentication
const API_KEY = process.env.REACT_APP_API_KEY || 'lock123';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for cookies
});

// Helper function to format data for PHP backend
const formatData = (data) => {
  return { ...data, api_key: API_KEY };
};

// Authentication services
export const authService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('', formatData({ 
        email, 
        password,
        validate: true 
      }));
      
      if (response.data.code === 1) {
        // Store user data in localStorage
        const userData = {
          email: response.data.data.email,
          name: response.data.data.name,
          id: response.data.data.id
        };
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register new user
  register: async (name, email, mobile, password) => {
    try {
      const response = await api.post('', formatData({
        add_user: true,
        name,
        email,
        mobile,
        password
      }));
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Request password reset
  forgotPassword: async (email) => {
    try {
      const response = await api.post('', formatData({ 
        email,
        send_mail_otp: true 
      }));
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Check session status
  checkSession: async () => {
    try {
      const response = await api.post('', formatData({ 
        check_session: true 
      }));
      
      if (response.data.code === 200) {
        // Update user data in localStorage
        const userData = {
          email: response.data.data.email,
          name: response.data.data.name,
          id: response.data.data.user_id
        };
        localStorage.setItem('user', JSON.stringify(userData));
        return { valid: true, user: userData };
      } else {
        // Clear user data from localStorage
        localStorage.removeItem('user');
        return { valid: false };
      }
    } catch (error) {
      console.error('Session check error:', error);
      localStorage.removeItem('user');
      return { valid: false };
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('', formatData({ 
        logout: true 
      }));
      localStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove user data from localStorage even if API call fails
      localStorage.removeItem('user');
      throw error;
    }
  }
};

// Password management services
export const passwordService = {
  // Add a new password
  addPassword: async (userId, password, platform, email) => {
    try {
      const response = await api.post('', formatData({
        add_pass: true,
        user_id: userId,
        pass: password,
        name: platform,
        email: email
      }));
      
      // Check for session expiration
      if (response.data.code === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
        return { error: 'Session expired. Please login again.' };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error adding password:', error);
      throw error;
    }
  },

  // Get all passwords for a user
  getPasswords: async (email) => {
    try {
      const response = await api.post('', formatData({ 
        email,
        get_pass: true 
      }));
      
      // Check for session expiration
      if (response.data.code === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
        return { error: 'Session expired. Please login again.' };
      }
      
      return response.data;
    } catch (error) {
      console.error('Get passwords error:', error);
      throw error;
    }
  },

  // Update password
  updatePassword: async (passwordData) => {
    try {
      const response = await api.post('', formatData({
        id: passwordData.id,
        name: passwordData.platform,
        password: passwordData.password,
        update_password: true
      }));
      
      // Check for session expiration
      if (response.data.code === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
        return { error: 'Session expired. Please login again.' };
      }
      
      return response.data;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  },

  // Export passwords
  exportPasswords: async (email) => {
    try {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = API_URL;
      form.target = '_blank';
      
      const jsonInput = document.createElement('input');
      jsonInput.type = 'hidden';
      jsonInput.name = 'json';
      jsonInput.value = JSON.stringify({
        api_key: API_KEY,
        export_passwords: true,
        email: email,
        format: 'excel'
      });
      form.appendChild(jsonInput);
      
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      
      return { success: true };
    } catch (error) {
      console.error('Export passwords error:', error);
      throw error;
    }
  },

  // Import passwords
  importPasswords: async (email, csvFile) => {
    try {
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = async (event) => {
          try {
            const csvData = event.target.result;
            
            const response = await api.post('', formatData({
              import_passwords: true,
              email: email,
              csv_data: csvData
            }));
            
            // Check for session expiration
            if (response.data.code === 401) {
              localStorage.removeItem('user');
              window.location.href = '/login';
              resolve({ error: 'Session expired. Please login again.' });
              return;
            }
            
            resolve(response.data);
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read CSV file'));
        };
        
        reader.readAsText(csvFile);
      });
    } catch (error) {
      console.error('Import passwords error:', error);
      throw error;
    }
  },

  // Delete password
  deletePassword: async (passwordId) => {
    try {
      const response = await api.post('', formatData({
        delete_password: true,
        id: passwordId
      }));
      
      // Check for session expiration
      if (response.data.code === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
        return { error: 'Session expired. Please login again.' };
      }
      
      return response.data;
    } catch (error) {
      console.error('Delete password error:', error);
      throw error;
    }
  },

  // Generate password
  generatePassword: async () => {
    try {
      const response = await api.post('', formatData({
        generate_password: true
      }));
      
      // Check for session expiration
      if (response.data.code === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
        return { error: 'Session expired. Please login again.' };
      }
      
      return response.data;
    } catch (error) {
      console.error('Generate password error:', error);
      throw error;
    }
  }
};

export default api; 