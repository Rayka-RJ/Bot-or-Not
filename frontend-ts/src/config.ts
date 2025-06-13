const config = {
  apiUrl: process.env.NODE_ENV === 'production'
    ? 'https://bot-or-not-jz7o.onrender.com'
    : 'http://localhost:5000'
};

export default config;