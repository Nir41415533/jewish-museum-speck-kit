const express = require('express');
const router  = express.Router();
const SearchService = require('../services/search.service');
const errors  = require('../config/errors');

router.get('/', async (req, res, next) => {
  try {
    const { q, type, limit, offset } = req.query;

    if (!q || q.trim().length < 2) {
      return next(errors.badRequest('Query parameter `q` must be at least 2 characters'));
    }

    const allowed = ['soldier', 'event', 'country'];
    if (type && !allowed.includes(type)) {
      return next(errors.badRequest(`type must be one of: ${allowed.join(', ')}`));
    }

    const result = await SearchService.search({ q: q.trim(), type, limit, offset });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
