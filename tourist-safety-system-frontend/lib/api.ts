// Central API URL configuration
// This reads from the environment variable set in Netlify (or .env.local for local dev)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default API_BASE_URL;
