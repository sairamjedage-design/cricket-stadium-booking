import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchSeatsForMatch = async (matchId: string) => {
  const response = await axios.get(`${API_URL}/matches/${matchId}/seats`);
  return response.data;
};

export const fetchStadiumSections = async (stadiumId: string) => {
  const response = await axios.get(`${API_URL}/stadiums/${stadiumId}/sections`);
  return response.data;
};

export const updateSeatStatus = async (seatId: string, status: string) => {
  const response = await axios.patch(`${API_URL}/seats/${seatId}`, { status });
  return response.data;
};