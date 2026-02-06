const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-app.onrender.com' 
    : 'http://localhost:8080'
}

export default config
