import axios from 'axios';
import {getToken} from '../utils/tokenStorage';

const API_URL = 'http://35.181.171.137:8000/api';
export const videoApi = {};
uploadVideo: async (videoData, videoFile, thumbnailFile = null) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    const formData = new FormData();
    formData.append('video_file', {
      uri: videoFile.uri,
      type: videoFile.type,
      name: videoFile.fileName || 'video.mp4',
    });
    ...
    const response = await axios.post(`${API_URL}/creator/videos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    ...
  }
