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
            getInvestmentDetails: async investmentId => {
                try {
                  const token = await getToken();
                  if (!token) {
                    throw new Error('Authentication required');
                  }
            