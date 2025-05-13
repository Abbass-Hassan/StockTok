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
    