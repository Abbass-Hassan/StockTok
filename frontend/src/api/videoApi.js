import axios from 'axios';
import {getToken} from '../utils/tokenStorage';

const API_URL = 'http://35.181.171.137:8000/api';

export const videoApi = {
  /**
   * Upload a video
   * @param {object} videoData - Video metadata
   * @param {object} videoFile - Video file object
   * @param {object} thumbnailFile - Optional thumbnail file
   * @returns {Promise} - API response
   */
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

      if (thumbnailFile) {
        formData.append('thumbnail', {
          uri: thumbnailFile.uri,
          type: thumbnailFile.type,
          name: thumbnailFile.fileName || 'thumbnail.jpg',
        });
      }

      formData.append('caption', videoData.caption);
      formData.append('initial_investment', videoData.initialInvestment || 0);

      const response = await axios.post(`${API_URL}/creator/videos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Upload error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Video upload failed');
    }
  },

  /**
   * Get videos created by the authenticated user
   * @returns {Promise} - API response
   */
  getMyVideos: async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(`${API_URL}/creator/videos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Get my videos API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get videos error:', error.response?.data || error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch videos',
      );
    }
  },

  /**
   * Get all videos
   * @param {number} page - Page number for pagination
   * @returns {Promise} - API response
   */
  getAllVideos: async (page = 1) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(`${API_URL}/videos/all?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Get all videos error:', error.response?.data || error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch video feed',
      );
    }
  },

  /**
   * Get trending videos feed
   * @param {number} page - Page number for pagination
   * @returns {Promise} - API response with trending videos and auth token
   */
  getTrendingVideos: async (page = 1) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const endpoint = `${API_URL}/regular/videos/trending?page=${page}`;
      console.log('Fetching trending videos from:', endpoint);

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Trending videos API Response status:', response.status);

      return {
        data: response.data,
        token: token, // Return token for video streaming authentication
      };
    } catch (error) {
      console.error('Trending videos API Error:');
      console.error('Error message:', error.message);
      console.error('Status code:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request URL:', error.config?.url);

      throw new Error(error.message || 'Failed to fetch trending videos');
    }
  },

  /**
   * Get following feed videos
   * @param {number} page - Page number for pagination
   * @returns {Promise} - API response with following feed videos and auth token
   */
  getFollowingVideos: async (page = 1) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const endpoint = `${API_URL}/regular/videos/following?page=${page}`;
      console.log('Fetching following videos from:', endpoint);

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Following videos API Response status:', response.status);

      return {
        data: response.data,
        token: token, // Return token for video streaming authentication
      };
    } catch (error) {
      console.error('Following videos API Error:');
      console.error('Error message:', error.message);
      console.error('Status code:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request URL:', error.config?.url);

      if (error.response && error.response.status === 404) {
        // Return empty result for 404 errors on following feed
        return {
          data: {data: {videos: {data: []}}},
          token: token,
        };
      }

      throw new Error(error.message || 'Failed to fetch following videos');
    }
  },

  /**
   * Get video stream URL
   * @param {number} videoId - ID of the video
   * @returns {string} - Video streaming URL
   */
  getVideoStreamUrl: videoId => {
    return `${API_URL}/videos/${videoId}/play`;
  },

  /**
   * Get detailed information about a video
   * @param {number} videoId - ID of the video
   * @returns {Promise} - API response
   */
  getVideoDetails: async videoId => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(`${API_URL}/creator/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Get video details error:', error.response?.data || error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch video details',
      );
    }
  },

  /**
   * Like a video
   * @param {number} videoId - ID of the video to like
   * @returns {Promise} - API response
   */
  likeVideo: async videoId => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        `${API_URL}/videos/${videoId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error('Like video error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to like video');
    }
  },

  /**
   * Invest in a video (alternative like mechanism)
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

      const endpoint = `${API_URL}/regular/investments`;
      console.log('Making video investment request to:', endpoint);

      const response = await axios.post(
        endpoint,
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

      console.log('Video investment API Response status:', response.status);

      return response.data;
    } catch (error) {
      console.error('Video investment API Error:');
      console.error('Error message:', error.message);
      console.error('Status code:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request URL:', error.config?.url);

      throw new Error(error.message || 'Failed to invest in video');
    }
  },

  /**
   * Get earnings for a specific video
   * @param {number} videoId - ID of the video
   * @returns {Promise} - API response
   */
  getVideoEarnings: async videoId => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(
        `${API_URL}/creator/earnings/videos/${videoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error('Get video earnings error:', error.response?.data || error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch video earnings',
      );
    }
  },

  /**
   * Get creator statistics
   * @returns {Promise} - API response
   */
  getCreatorStats: async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(`${API_URL}/creator/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Get creator stats error:', error.response?.data || error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch creator stats',
      );
    }
  },

  /**
   * Get earnings dashboard
   * @returns {Promise} - API response
   */
  getDashboard: async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(
        `${API_URL}/creator/earnings/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error('Get dashboard error:', error.response?.data || error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch dashboard',
      );
    }
  },
};

export default videoApi;
