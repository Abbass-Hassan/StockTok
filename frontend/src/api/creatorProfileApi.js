import axios from 'axios';
import {getToken} from '../utils/tokenStorage';

const API_URL = 'http://35.181.171.137:8000/api';

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

/**
 * Update creator profile
 */
export const updateCreatorProfile = async profileData => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    let data;
    let headers = {
      Authorization: `Bearer ${token}`,
    };

    if (profileData.profile_photo) {
      data = new FormData();
      data.append('profile_photo', {
        uri: profileData.profile_photo.uri,
        type: profileData.profile_photo.type || 'image/jpeg',
        name: profileData.profile_photo.fileName || 'profile.jpg',
      });

      if (profileData.name) data.append('name', profileData.name);
      if (profileData.username) data.append('username', profileData.username);
      if (profileData.bio) data.append('bio', profileData.bio);
      if (profileData.phone) data.append('phone', profileData.phone);

      headers['Content-Type'] = 'multipart/form-data';
    } else {
      data = {
        name: profileData.name,
        username: profileData.username,
        bio: profileData.bio,
        phone: profileData.phone,
      };
    }

    const response = await axios.put(`${API_URL}/creator/profile`, data, {
      headers: headers,
    });

    return response.data;
  } catch (error) {
    console.error('Update profile error:', error.response?.data || error);
    throw new Error(
      error.response?.data?.message || 'Failed to update profile',
    );
  }
};
