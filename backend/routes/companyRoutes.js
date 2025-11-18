const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompanyProfile
} = require('../controllers/companyController');

router.get('/', getCompanies);
router.get('/:id', getCompanyProfile);

module.exports = router;

