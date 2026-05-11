require('dotenv').config();
const express = require('express');
const { applyMiddleware, errorHandler } = require('./config/middleware');

const app = express();
const PORT = process.env.PORT || 3001;

applyMiddleware(app);

app.use('/api/countries', require('./routes/countries.route'));
app.use('/api/soldiers', require('./routes/soldiers.route'));
app.use('/api/events',   require('./routes/events.route'));
// T049: /api/search
// T062: /api/ai

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
