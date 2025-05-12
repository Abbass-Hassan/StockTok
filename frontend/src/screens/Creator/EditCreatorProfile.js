import axios from 'axios';
import {getToken} from '../utils/tokenStorage';

const API_URL = 'http://13.37.224.245:8000/api';
/**
 * Get creator profile information
 */
export const getCreatorProfile = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(`${API_URL}/creator/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Get creator profile error:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Failed to fetch profile');
  }
};
/**
 * Get creator statistics
 */
export const getCreatorStats = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(`${API_URL}/creator/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Get creator stats error:', error.response?.data || error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch statistics',
    );
  }
};
