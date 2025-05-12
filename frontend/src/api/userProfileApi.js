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
