import axios from 'axios';
import {getToken} from '../utils/tokenStorage';
const API_URL = 'http://13.37.224.245:8000/api';
export const debugTokenStorage = async () => {
  try {
    const token = await getToken();
    console.log(
      'Current token (first 10 chars):',
      token ? token.substring(0, 10) + '...' : 'NO TOKEN',
    );
    return token ? true : false;
  } catch (error) {
    console.error('Error accessing token storage:', error);
    return false;
  }
};
export const searchUsers = async (query, perPage = 15) => {
    console.log('searchUsers called with query:', query);
    await debugTokenStorage();
    const token = await getToken();
  if (!token) throw new Error('Authentication required');
  const encodedUsername = encodeURIComponent(query);
  const url = `${API_URL}/profile/username/${encodedUsername}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  if (response.data?.data?.profile) {
    return { data: { users: [response.data.data.profile] } };
  } else if (response.data?.profile) {
    return { data: { users: [response.data.profile] } };
  }
  return {data: {users: []}};
} catch (error) {
    console.error('Search error details:', error.message);
    return {data: {users: []}};
  }export const getUserByUsername = async username => {
    const token = await getToken();
    if (!token) throw new Error('Authentication required');
    const encodedUsername = encodeURIComponent(username);
  
    const url = `${API_URL}/profile/username/${encodedUsername}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  if (response.data?.data?.profile) {
    return { profile: response.data.data.profile };
  } else if (response.data?.profile) {
    return { profile: response.data.profile };
  } else {
    throw new Error('Invalid response structure');
  }
} catch (error) {
    console.error('Error fetching user profile:', error.message);
    throw error;
  }
  export const getUserVideos = async (userId, perPage = 15) => {
    const token = await getToken();
    if (!token) throw new Error('Authentication required');
    const creatorVideosUrl = `${API_URL}/regular/videos/by-creator/${userId}`;
  const creatorResponse = await axios.get(creatorVideosUrl, {
    params: {per_page: perPage},
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  return processVideoResponse(creatorResponse);
  const regularUrl = `${API_URL}/regular/videos/user/${userId}`;
  const regularResponse = await axios.get(regularUrl, {
    params: {per_page: perPage},
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  return processVideoResponse(regularResponse);
  const creatorOwnUrl = `${API_URL}/creator/videos`;
  const creatorOwnResponse = await axios.get(creatorOwnUrl, {
    params: {per_page: perPage},
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  return processVideoResponse(creatorOwnResponse);
  return {videos: {data: []}};
  function processVideoResponse(response) {
    if (response.data?.videos?.data) {
      return {videos: response.data.videos};
    } else if (response.data?.data?.videos) {
      return {videos: response.data.data.videos};
    } else if (Array.isArray(response.data)) {
      return {videos: {data: response.data}};
    }
    return {videos: {data: []}};
  }
  export const followUser = async followingId => {
    const token = await getToken();
    if (!token) throw new Error('Authentication required');
    const response = await axios.post(`${API_URL}/follows`, {
      following_id: followingId,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  };
  export const unfollowUser = async followingId => {
    const token = await getToken();
    if (!token) throw new Error('Authentication required');
    const response = await axios.delete(`${API_URL}/follows/${followingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    return response.data;
  };
  export const checkFollowingStatus = async followingId => {
    const token = await getToken();
    if (!token) throw new Error('Authentication required');
  