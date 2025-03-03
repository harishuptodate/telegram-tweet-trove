
import axios from 'axios';
import { TelegramResponse, TelegramMessage } from '../types/telegram';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for production logging
api.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle API errors gracefully
    if (error.response) {
      // The request was made and the server responded with a status code outside the range of 2xx
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error: No response received', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Get Telegram messages with pagination
export const getTelegramMessages = async (cursor?: string, category?: string): Promise<TelegramResponse> => {
  try {
    const params: Record<string, string | undefined> = { 
      cursor, 
      limit: '12'
    };
    
    if (category) {
      params.category = category;
    }
    
    const response = await api.get<TelegramResponse>('/telegram/messages', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch Telegram messages:', error);
    throw error;
  }
};

// Get a single Telegram message by ID
export const getTelegramMessageById = async (id: string): Promise<TelegramMessage> => {
  try {
    const response = await api.get(`/telegram/messages/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch Telegram message with ID ${id}:`, error);
    throw error;
  }
};

export default api;
