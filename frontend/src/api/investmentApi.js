// src/api/investmentApi.js
import axios from 'axios';
import {getToken} from '../utils/tokenStorage'; // Make sure this path is correct

const API_URL = 'http://35.181.171.137:8000/api';

// Investment API functions
export const investmentApi = {
  /**
   * Invest in a video
   * @param {number} videoId - ID of the video to invest in
   * @param {number} amount - Amount to invest
   * @returns {Promise} - API response
   */
  investInVideo: async (videoId, amount) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log(
        'Making investment request to:',
        `${API_URL}/regular/investments`,
      );

      const response = await axios.post(
        `${API_URL}/regular/investments`,
        {
          video_id: videoId,
          amount: parseFloat(amount),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Investment API Response status:', response.status);
      console.log(
        'Investment API Response data:',
        JSON.stringify(response.data).substring(0, 100),
      );

      return response.data;
    } catch (error) {
      console.error('Investment API Error Full Details:');
      console.error('Error message:', error.message);
      console.error('Status code:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request URL:', error.config?.url);

      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to make investment';
      throw new Error(errorMsg);
    }
  },

  /**
   * Get all investments made by the authenticated user
   * @param {number} perPage - Number of items per page
   * @returns {Promise} - API response
   */
  getMyInvestments: async (perPage = 15) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log(
        'Making get investments request to:',
        `${API_URL}/regular/investments?per_page=${perPage}`,
      );

      const response = await axios.get(
        `${API_URL}/regular/investments?per_page=${perPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Investments API Response status:', response.status);
      console.log(
        'Investments API Response data:',
        JSON.stringify(response.data).substring(0, 100),
      );

      // Return the data directly instead of expecting success property
      return response.data;
    } catch (error) {
      console.error('Investment API Error Full Details:');
      console.error('Error message:', error.message);
      console.error('Status code:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request URL:', error.config?.url);

      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch investments';
      throw new Error(errorMsg);
    }
  },

  /**
   * Get detailed information about a specific investment
   * @param {number} investmentId - ID of the investment to get details for
   * @returns {Promise} - API response
   */
  getInvestmentDetails: async investmentId => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log(
        'Making get investment details request to:',
        `${API_URL}/regular/investments/${investmentId}`,
      );

      const response = await axios.get(
        `${API_URL}/regular/investments/${investmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Investment Details API Response status:', response.status);
      console.log(
        'Investment Details API Response data:',
        JSON.stringify(response.data).substring(0, 100),
      );

      // Return the data directly instead of expecting success property
      return response.data;
    } catch (error) {
      console.error('Investment API Error Full Details:');
      console.error('Error message:', error.message);
      console.error('Status code:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request URL:', error.config?.url);

      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch investment details';
      throw new Error(errorMsg);
    }
  },

  /**
   * Get portfolio overview for the authenticated user
   * @returns {Promise} - API response
   */
  getPortfolioOverview: async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log(
        'Token obtained for portfolio request:',
        token ? `${token.substring(0, 10)}...` : 'No token',
      );
      console.log(
        'Making portfolio overview request to:',
        `${API_URL}/regular/investments/portfolio/overview`,
      );

      const response = await axios.get(
        `${API_URL}/regular/investments/portfolio/overview`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Portfolio API Response status:', response.status);
      console.log(
        'Portfolio API Response data preview:',
        JSON.stringify(response.data).substring(0, 100),
      );

      // Return the data directly instead of expecting success property
      return response.data;
    } catch (error) {
      console.error('Investment API Error Full Details:');
      console.error('Error message:', error.message);
      console.error('Status code:', error.response?.status);
      console.error('Response data:', JSON.stringify(error.response?.data));
      console.error('Request URL:', error.config?.url);
      console.error('Request headers:', JSON.stringify(error.config?.headers));

      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch portfolio overview';
      throw new Error(errorMsg);
    }
  },
};

export default investmentApi;
