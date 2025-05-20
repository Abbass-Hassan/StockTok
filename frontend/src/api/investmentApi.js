import axios from 'axios';
import {getToken} from '../utils/tokenStorage';

const API_URL = 'http://35.181.171.137:8000/api';
export const investmentApi = {};
investInVideo: async (videoId, amount) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      const response = await axios.post(
        `${API_URL}/regular/investments`,
        { video_id: videoId, amount: parseFloat(amount) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      ...
    }
    getMyInvestments: async (perPage = 15) => {
        try {
          const token = await getToken();
          if (!token) {
            throw new Error('Authentication required');
          }
          const response = await axios.get(
            `${API_URL}/regular/investments?per_page=${perPage}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          return response.data;
        } catch (error) {
          ...
        }
        getInvestmentDetails: async investmentId => {
            try {
              const token = await getToken();
              if (!token) {
                throw new Error('Authentication required');
              }
              const response = await axios.get(
                `${API_URL}/regular/investments/${investmentId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              return response.data;
            } catch (error) {
              ...
            }
            getPortfolioOverview: async () => {
                try {
                  const token = await getToken();
                  if (!token) {
                    throw new Error('Authentication required');
                  }
                  const response = await axios.get(
                    `${API_URL}/regular/investments/portfolio/overview`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    },
                  );
                  return response.data;
                } catch (error) {
                  ...
                }
                testApiConnection: async () => {
                    try {
                      const token = await getToken();
                      if (!token) {
                        throw new Error('Authentication required');
                      }
                      const testResponse = await axios.get(`${API_URL}/profile/me`, {
                        headers: {
                          Authorization: `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                      });
                      return testResponse.data;
                    } catch (error) {
                      ...
                    }
                  