require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 8080;
const ENV = process.env.APP_ENV || 'development';

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend REST API server running in ${ENV} mode on port ${PORT}`);
});
