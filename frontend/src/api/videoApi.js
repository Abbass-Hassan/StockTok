import axios from 'axios';
import {getToken} from '../utils/tokenStorage';

// Use the same API_URL as in auth.js
const API_URL = 'http://13.37.224.245:8000/api';

// Function to upload a video
export const uploadVideo = async (
  videoData,
  videoFile,
  thumbnailFile = null,
) => {
  try {
    // Get token from storage
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Create FormData object
    const formData = new FormData();

    // Add video file
    formData.append('video_file', {
      uri: videoFile.uri,
      type: videoFile.type,
      name: videoFile.fileName || 'video.mp4',
    });

    // Add thumbnail if provided
    if (thumbnailFile) {
      formData.append('thumbnail', {
        uri: thumbnailFile.uri,
        type: thumbnailFile.type,
        name: thumbnailFile.fileName || 'thumbnail.jpg',
      });
    }

    // Add caption and initial investment
    formData.append('caption', videoData.caption);
    formData.append('initial_investment', videoData.initialInvestment || 0);

    // Make the API call with authorization header
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

// Function to get user's videos
export const getMyVideos = async () => {
  try {
    // Get token from storage
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

// Function to get video streaming URL
export const getVideoStreamUrl = videoId => {
  // This is the URL to your backend's video streaming endpoint for creators
  return `${API_URL}/creator/videos/${videoId}/stream`;
};

// Function to get video details
export const getVideoDetails = async videoId => {
  try {
    // Get token from storage
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
