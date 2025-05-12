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
