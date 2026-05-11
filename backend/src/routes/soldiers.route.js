const express = require('express');
const router = express.Router();
const SoldierModel = require('../models/soldier.model');
const errors = require('../config/errors');

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return next(errors.notFound(`Soldier with id ${req.params.id}`));

    const soldier = await SoldierModel.findById(id);
    if (!soldier) return next(errors.notFound(`Soldier with id ${id}`));

    res.json({ data: soldier });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
