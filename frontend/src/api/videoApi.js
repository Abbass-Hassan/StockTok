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
  }getMyVideos: async () => {
    try {
      const token = await getToken();
      ...
      const response = await axios.get(`${API_URL}/creator/videos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      ...
    }
  
    getAllVideos: async (page = 1) => {
      ...
      const response = await axios.get(`${API_URL}/videos/all?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      getTrendingVideos: async (page = 1) => {
        ...
        console.log('Fetching trending videos from:', endpoint);
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        return { data: response.data, token: token };
        getFollowingVideos: async (page = 1) => {
          ...
          console.log('Fetching following videos from:', endpoint);
          const response = await axios.get(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          ...
          if (error.response && error.response.status === 404) {
            return { data: {data: {videos: {data: []}}}, token: token };
          }
          getVideoStreamUrl: videoId => {
            return `${API_URL}/videos/${videoId}/play`;
          },
          getVideoDetails: async videoId => {
            ...
            const response = await axios.get(`${API_URL}/creator/videos/${videoId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            likeVideo: async videoId => {
              ...
              const response = await axios.post(
                `${API_URL}/videos/${videoId}/like`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );
              investInVideo: async (videoId, amount) => {
                ...
                const endpoint = `${API_URL}/regular/investments`;
                const response = await axios.post(
                  endpoint,
                  { video_id: videoId, amount: parseFloat(amount) },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  },
                );
                getVideoEarnings: async videoId => {
                  ...
                  const response = await axios.get(
                    `${API_URL}/creator/earnings/videos/${videoId}`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    },
                  );
                  getCreatorStats: async () => {
                    ...
                    const response = await axios.get(`${API_URL}/creator/stats`, {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    });
                    getDashboard: async () => {
                      ...
                      const response = await axios.get(
                        `${API_URL}/creator/earnings/dashboard`,
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        },
                      );
                      catch (error) {
                        console.error(...);
                        throw new Error(...);
                      }
                      