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
      