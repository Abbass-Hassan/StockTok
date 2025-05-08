import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for AsyncStorage
const AUTH_TOKEN_KEY = 'stocktok_auth_token';
const USER_DATA_KEY = 'stocktok_user_data';

/**
 * Store authentication token in AsyncStorage
 * @param {string} token - Authentication token
 * @returns {Promise<boolean>} - Success status
 */
export const storeToken = async token => {
  try {
    // Check if token is undefined or null
    if (token === undefined || token === null) {
      console.warn('Warning: Attempted to store undefined/null token');
      return false;
    }

    // Ensure token is a string
    const tokenString =
      typeof token === 'string' ? token : JSON.stringify(token);

    await AsyncStorage.setItem(AUTH_TOKEN_KEY, tokenString);
    return true;
  } catch (error) {
    console.error('Error storing token:', error);
    return false;
  }
};

/**
 * Retrieve authentication token from AsyncStorage
 * @returns {Promise<string|null>} - Authentication token or null if not found
 */
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

/**
 * Store user data in AsyncStorage
 * @param {object} userData - User data object
 * @returns {Promise<boolean>} - Success status
 */
export const storeUserData = async userData => {
  try {
    // Check if userData is undefined or null
    if (userData === undefined || userData === null) {
      console.warn('Warning: Attempted to store undefined/null user data');
      return false;
    }

    // Convert userData to string if it's an object
    const userDataString =
      typeof userData === 'string' ? userData : JSON.stringify(userData);

    await AsyncStorage.setItem(USER_DATA_KEY, userDataString);
    return true;
  } catch (error) {
    console.error('Error storing user data:', error);
    return false;
  }
};

/**
 * Retrieve user data from AsyncStorage
 * @returns {Promise<object|null>} - User data object or null if not found
 */
export const getUserData = async () => {
  try {
    const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
    if (!userDataString) return null;

    return JSON.parse(userDataString);
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};

/**
 * Clear authentication data (logout)
 * @returns {Promise<boolean>} - Success status
 */
export const clearAuth = async () => {
  try {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};

/**
 * Check if user is authenticated by checking for token
 * @returns {Promise<boolean>} - Authentication status
 */
export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return token !== null;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};
