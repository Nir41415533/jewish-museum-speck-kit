const express = require('express');
const CountryModel = require('../models/country.model');
const { notFound } = require('../config/errors');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await CountryModel.listInteractive();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const country = await CountryModel.findById(req.params.id);
    if (!country) return next(notFound(`Country ${req.params.id}`));
    res.json({ data: country });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/soldiers', async (req, res, next) => {
  try {
    const country = await CountryModel.findById(req.params.id);
    if (!country) return next(notFound(`Country ${req.params.id}`));
    const result = await CountryModel.getSoldiers(req.params.id, {
      limit: req.query.limit,
      after: req.query.after,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/events', async (req, res, next) => {
  try {
    const country = await CountryModel.findById(req.params.id);
    if (!country) return next(notFound(`Country ${req.params.id}`));
    const data = await CountryModel.getEvents(req.params.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
