import axios from 'axios';


export const fetchBooks = async (page = 1) => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/books?page=${page}`);
  return response.data;
};

export const fetchBookById = async (id) => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/books/${id}`);
  return response.data;
};
