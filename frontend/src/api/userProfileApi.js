import axios from 'axios';
import {getToken} from '../utils/tokenStorage';

const API_URL = 'http://35.181.171.137:8000/api';

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

// Search for users by username - with extensive logging
export const searchUsers = async (query, perPage = 15) => {
  console.log('searchUsers called with query:', query);

  await debugTokenStorage();

  try {
    const token = await getToken();
    console.log(
      'Token retrieved (first 10 chars):',
      token ? token.substring(0, 10) + '...' : 'NO TOKEN',
    );

    if (!token) {
      console.error('Authentication required - no token found');
      throw new Error('Authentication required');
    }

    const encodedUsername = encodeURIComponent(query);
    console.log('Encoded username:', encodedUsername);

    const url = `${API_URL}/profile/username/${encodedUsername}`;
    console.log('Requesting URL:', url);

    console.log('Making GET request with Authorization header');

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    console.log('API Response status:', response.status);
    console.log(
      'Full API Response data:',
      JSON.stringify(response.data).substring(0, 300),
    );

    if (response.data?.data?.profile) {
      console.log('Profile found in data.data.profile');
      return {
        data: {
          users: [response.data.data.profile],
        },
      };
    } else if (response.data?.profile) {
      console.log('Profile found in data.profile');
      return {
        data: {
          users: [response.data.profile],
        },
      };
    } else {
      console.log(
        'No profile found in response, structure:',
        Object.keys(response.data || {}),
      );

      console.log('Full response body:', JSON.stringify(response.data));

      return {data: {users: []}};
    }
  } catch (error) {
    console.error('Search error details:', error.message);

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error(
        'Response data:',
        JSON.stringify(error.response.data || {}),
      );
    }

    return {data: {users: []}};
  }
};

// Get user profile by username
export const getUserByUsername = async username => {
  console.log('getUserByUsername called with:', username);

  try {
    const token = await getToken();
    console.log(
      'Token for profile:',
      token ? token.substring(0, 10) + '...' : 'NO TOKEN',
    );

    if (!token) {
      console.error('Authentication required - no token found');
      throw new Error('Authentication required');
    }

    const encodedUsername = encodeURIComponent(username);

    const url = `${API_URL}/profile/username/${encodedUsername}`;
    console.log('Profile URL:', url);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    console.log('Profile API status:', response.status);
    console.log(
      'Full response data:',
      JSON.stringify(response.data).substring(0, 300),
    );

    if (response.data?.data?.profile) {
      return {
        profile: response.data.data.profile,
      };
    } else if (response.data?.profile) {
      return {
        profile: response.data.profile,
      };
    } else {
      console.error(
        'Unexpected response structure:',
        Object.keys(response.data || {}),
      );
      throw new Error('Invalid response structure');
    }
  } catch (error) {
    console.error('Error fetching user profile:', error.message);

    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error(
        'Response data:',
        JSON.stringify(error.response.data).substring(0, 200),
      );
    }

    throw error;
  }
};

// Get videos by user ID - optimized for different user types
export const getUserVideos = async (userId, perPage = 15) => {
  console.log('Getting videos for user ID:', userId);
  try {
    const token = await getToken();
    console.log(
      'Token for videos:',
      token ? token.substring(0, 10) + '...' : 'NO TOKEN',
    );

    if (!token) {
      throw new Error('Authentication required');
    }

    const creatorVideosUrl = `${API_URL}/regular/videos/by-creator/${userId}`;
    console.log(
      'Trying creator videos URL for regular user:',
      creatorVideosUrl,
    );

    try {
      const creatorResponse = await axios.get(creatorVideosUrl, {
        params: {per_page: perPage},
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      console.log('Creator videos response status:', creatorResponse.status);

      return processVideoResponse(creatorResponse);
    } catch (creatorError) {
      console.log(
        'Creator videos endpoint failed, trying regular user endpoint...',
      );

      const regularUrl = `${API_URL}/regular/videos/user/${userId}`;
      console.log('Trying regular user videos URL:', regularUrl);

      try {
        const regularResponse = await axios.get(regularUrl, {
          params: {per_page: perPage},
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        console.log('Regular videos response status:', regularResponse.status);
        return processVideoResponse(regularResponse);
      } catch (regularError) {
        console.log(
          'Regular user endpoint failed, trying creator own videos endpoint...',
        );

        const creatorOwnUrl = `${API_URL}/creator/videos`;

        try {
          const creatorOwnResponse = await axios.get(creatorOwnUrl, {
            params: {per_page: perPage},
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          });

          console.log(
            'Creator own videos response status:',
            creatorOwnResponse.status,
          );
          return processVideoResponse(creatorOwnResponse);
        } catch (creatorOwnError) {
          console.error('All video routes failed');
          console.error('Creator videos error:', creatorError.message);
          console.error('Regular route error:', regularError.message);
          console.error('Creator own route error:', creatorOwnError.message);

          return {videos: {data: []}};
        }
      }
    }
  } catch (error) {
    console.error('Error in video fetch wrapper:', error.message);
    return {videos: {data: []}};
  }
};

// Helper function to process video response data consistently
function processVideoResponse(response) {
  console.log(
    'Full videos response:',
    JSON.stringify(response.data).substring(0, 300),
  );

  if (response.data?.videos?.data) {
    console.log('Found videos in data.videos.data');
    return {videos: response.data.videos};
  } else if (response.data?.data?.videos) {
    console.log('Found videos in data.data.videos');
    return {videos: response.data.data.videos};
  } else if (response.data?.videos) {
    console.log('Found videos in data.videos');
    return {videos: response.data.videos};
  } else if (response.data?.data && Array.isArray(response.data.data)) {
    console.log('Found array in data.data');
    return {videos: {data: response.data.data}};
  } else if (Array.isArray(response.data)) {
    console.log('Response is direct array');
    return {videos: {data: response.data}};
  }

  console.log(
    'Unrecognized response structure:',
    JSON.stringify(response.data).substring(0, 300),
  );

  return {videos: {data: []}};
}

// Follow a user
export const followUser = async followingId => {
  console.log('Following user ID:', followingId);
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.post(
      `${API_URL}/follows`,
      {following_id: followingId},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );
    console.log('Follow successful');
    return response.data;
  } catch (error) {
    console.error('Error following user:', error.message);
    throw error;
  }
};

// Unfollow a user
export const unfollowUser = async followingId => {
  console.log('Unfollowing user ID:', followingId);
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.delete(`${API_URL}/follows/${followingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    console.log('Unfollow successful');
    return response.data;
  } catch (error) {
    console.error('Error unfollowing user:', error.message);
    throw error;
  }
};

// Check if following a user
export const checkFollowingStatus = async followingId => {
  console.log('Checking follow status for user ID:', followingId);
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await axios.get(
        `${API_URL}/follows/user/${followingId}/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      console.log('Follow status response:', JSON.stringify(response.data));

      let isFollowing = false;

      if (response.data?.is_following !== undefined) {
        isFollowing = response.data.is_following;
      } else if (response.data?.data?.is_following !== undefined) {
        isFollowing = response.data.data.is_following;
      }

      console.log(
        'Follow status:',
        isFollowing ? 'Following' : 'Not following',
      );

      return {is_following: isFollowing};
    } catch (error) {
      console.log('First follow status endpoint failed, trying fallback...');

      const fallbackResponse = await axios.get(
        `${API_URL}/user/follows/${followingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      let isFollowing = false;

      if (fallbackResponse.data?.is_following !== undefined) {
        isFollowing = fallbackResponse.data.is_following;
      } else if (fallbackResponse.data?.data?.is_following !== undefined) {
        isFollowing = fallbackResponse.data.data.is_following;
      }

      return {is_following: isFollowing};
    }
  } catch (error) {
    console.error('Error checking follow status:', error.message);
    return {is_following: false};
  }
};
