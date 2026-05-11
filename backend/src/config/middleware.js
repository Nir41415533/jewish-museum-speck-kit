const cors = require('cors');
const express = require('express');

function applyMiddleware(app) {
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET'],
  }));
  app.use(express.json());
}

// Matches the { error: { code, message } } shape defined in T017/api.md
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
    },
  });
}

module.exports = { applyMiddleware, errorHandler };
