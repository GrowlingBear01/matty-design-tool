// client/src/config.js
const isProduction = import.meta.env.MODE === 'production';

export const API_URL = isProduction 
  ? 'https://matty-backend-jp8t.onrender.com/api' // You will get this URL later
  : 'http://localhost:4000/api';
