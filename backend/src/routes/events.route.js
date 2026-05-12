const express = require('express');
const router = express.Router();
const EventModel = require('../models/event.model');
const errors = require('../config/errors');

router.get('/', async (req, res, next) => {
  try {
    const { limit, offset, sort, year } = req.query;
    const result = await EventModel.list({ limit, offset, sort, year });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/years', async (req, res, next) => {
  try {
    const years = await EventModel.listYears();
    res.json({ data: years });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return next(errors.notFound(`Event with id ${req.params.id}`));

    const event = await EventModel.findById(id);
    if (!event) return next(errors.notFound(`Event with id ${id}`));

    res.json({ data: event });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
