import axios from 'axios';

const api = axios.create({
  baseURL: 'http://35.181.171.137:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} confirmPassword - Password confirmation
 * @returns {Promise} - API response
 */
export const register = async (email, password, confirmPassword) => {
  try {
    const response = await api.post('/register', {
      email: email,
      password: password,
      password_confirmation: confirmPassword,
    });

    console.log(
      'Register API full response:',
      JSON.stringify(response.data, null, 2),
    );

    return response;
  } catch (error) {
    console.error(
      'Registration API error:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Login a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - API response
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/login', {
      email,
      password,
    });

    console.log(
      'Login API full response:',
      JSON.stringify(response.data, null, 2),
    );

    return response;
  } catch (error) {
    console.error('Login API error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Check authenticated user profile
 * @param {string} token - Auth token
 * @returns {Promise} - API response
 */
export const getProfile = async token => {
  try {
    const response = await api.get('/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error('Profile API error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Logout a user
 * @param {string} token - Auth token
 * @returns {Promise} - API response
 */
export const logout = async token => {
  try {
    const response = await api.post(
      '/logout',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response;
  } catch (error) {
    console.error('Logout API error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise} - API response
 */
export const forgotPassword = async email => {
  try {
    const response = await api.post('/forgot-password', {
      email,
    });
    return response;
  } catch (error) {
    console.error(
      'Forgot password API error:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Complete user profile
 * @param {string} token - Auth token
 * @param {object} profileData - User profile data
 * @returns {Promise} - API response
 */
export const completeProfile = async (token, profileData) => {
  try {
    const formData = new FormData();

    if (profileData.profile_photo) {
      const photo = profileData.profile_photo;
      formData.append('profile_photo', {
        uri: photo.uri,
        type: photo.type || 'image/jpeg',
        name: photo.fileName || 'profile_photo.jpg',
      });
    }

    if (profileData.username) formData.append('username', profileData.username);
    if (profileData.name) formData.append('name', profileData.name);
    if (profileData.phone) formData.append('phone', profileData.phone);
    if (profileData.bio) formData.append('bio', profileData.bio);
    if (profileData.gender) formData.append('gender', profileData.gender);

    if (profileData.user_type) {
      const userTypeId = profileData.user_type === 'Creator' ? 2 : 1;
      formData.append('user_type_id', userTypeId);
    }

    const response = await api.post('/complete-profile', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log(
      'Complete Profile API full response:',
      JSON.stringify(response.data, null, 2),
    );

    return response;
  } catch (error) {
    console.error(
      'Complete Profile API error:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  },
);
