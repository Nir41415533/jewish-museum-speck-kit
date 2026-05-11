require('dotenv').config();
const express = require('express');
const { applyMiddleware, errorHandler } = require('./config/middleware');

const app = express();
const PORT = process.env.PORT || 3001;

applyMiddleware(app);

// Route registration — each route module is mounted by its own task:
// T023: /api/countries
// T035: /api/soldiers
// T043: /api/events
// T052: /api/search
// T058: /api/ai

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
