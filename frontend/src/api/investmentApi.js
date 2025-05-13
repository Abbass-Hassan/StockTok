import axios from 'axios';
import {getToken} from '../utils/tokenStorage'; // Make sure this path is correct

const API_URL = 'http://13.37.224.245:8000/api';
export const investmentApi = {
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
    