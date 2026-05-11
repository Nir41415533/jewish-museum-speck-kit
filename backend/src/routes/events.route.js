const express = require('express');
const router = express.Router();
const EventModel = require('../models/event.model');
const errors = require('../config/errors');

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
