import axios from 'axios';
import {getToken} from '../utils/tokenStorage';
const API_URL = 'http://13.37.224.245:8000/api';
export const uploadVideo = async (
  videoData,
  videoFile,
  thumbnailFile = null,
) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
