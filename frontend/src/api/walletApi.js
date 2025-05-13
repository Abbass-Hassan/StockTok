import axios from 'axios';
import {getToken} from '../utils/tokenStorage';

const API_URL = 'http://13.37.224.245:8000/api';

// Get wallet details
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

// Deposit funds
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

// Withdraw funds
export const withdrawFunds = async amount => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.post(
      `${API_URL}/wallet/withdraw`,
      {amount},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error('Withdraw error:', error.response?.data || error);
    throw new Error(
      error.response?.data?.message || 'Failed to withdraw funds',
    );
  }
};

// Get transaction history
export const getTransactionHistory = async (perPage = 15) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(`${API_URL}/wallet/transactions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        per_page: perPage,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Get transactions error:', error.response?.data || error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch transactions',
    );
  }
};
