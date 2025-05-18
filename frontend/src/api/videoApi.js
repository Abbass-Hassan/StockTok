import axios from 'axios';
import {getToken} from '../utils/tokenStorage';

const API_URL = 'http://35.181.171.137:8000/api';

// Function to upload a video
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
};

export const getMyVideos = async () => {
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

    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get videos error:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Failed to fetch videos');
  }
};

export const getAllVideos = async (page = 1) => {
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
};

export const getVideoStreamUrl = videoId => {
  return `${API_URL}/videos/${videoId}/play`;
};

export const getVideoDetails = async videoId => {
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
};

export const likeVideo = async videoId => {
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
};

// Function to get earnings for specific video
export const getVideoEarnings = async videoId => {
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
};

// Get creator statistics
export const getCreatorStats = async () => {
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
};

// Get earnings dashboard
export const getDashboard = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(`${API_URL}/creator/earnings/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Get dashboard error:', error.response?.data || error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch dashboard',
    );
  }
};
