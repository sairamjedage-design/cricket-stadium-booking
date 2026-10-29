import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchMatches = async () => {
  const response = await axios.get(`${API_URL}/matches`);
  return response.data;
};

export const fetchMatchById = async (matchId: string) => {
  const response = await axios.get(`${API_URL}/matches/${matchId}`);
  return response.data;
};

export const fetchStadiumById = async (stadiumId: string) => {
  const response = await axios.get(`${API_URL}/stadiums/${stadiumId}`);
  return response.data;
};