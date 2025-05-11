import axios from 'axios';
import {getToken} from '../utils/tokenStorage';
const API_URL = 'http://13.37.224.245:8000/api';
export const getWalletDetails = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(`${API_URL}/wallet`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Get wallet details error:', error.response?.data || error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch wallet details',
    );
  }
};
export const depositFunds = async amount => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.post(
      `${API_URL}/wallet/deposit`,
      {amount},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error('Deposit error:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Failed to deposit funds');
  }
};
