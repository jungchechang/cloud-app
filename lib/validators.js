const {body} = require("express-validator");
const businesses = require("../data/businesses.json")

const businessValidator = [
  body('ownerId', 'ownerId must not be empty and must be a valid number').isNumeric(),
  body('name', 'Name must not be empty').trim().notEmpty(),
  body('address', 'Address must not be empty').trim().notEmpty(),
  body('city', 'City must not be empty').trim().notEmpty(),
  body('state', 'State must not be empty').trim().notEmpty(),
  body('zip', 'Zip must not be empty').trim().notEmpty(),
  body('phone', 'Phone must not be empty').trim().notEmpty(),
  body('category', 'Category must not be empty').trim().notEmpty(),
  body('subcategory', 'Sbcategory must not be empty').trim().notEmpty(),
  body('website', 'website must not be empty').optional().trim().notEmpty(),
  body('email', 'email must not be empty').optional().trim().notEmpty(),
]

const updateBusinessValidator = [
  body('ownerId', 'ownerId must not be empty and must be a valid number').optional().isNumeric(),
  body('name', 'Name must not be empty').optional().trim().notEmpty(),
  body('address', 'Address must not be empty').optional().trim().notEmpty(),
  body('city', 'City must not be empty').optional().trim().notEmpty(),
  body('state', 'State must not be empty').optional().trim().notEmpty(),
  body('zip', 'Zip must not be empty').optional().trim().notEmpty(),
  body('phone', 'Phone must not be empty').optional().trim().notEmpty(),
  body('category', 'Category must not be empty').optional().trim().notEmpty(),
  body('subcategory', 'Subcategory must not be empty').optional().trim().notEmpty(),
  body('website', 'website must not be empty').optional().trim().notEmpty(),
  body('email', 'email must not be empty').optional().trim().notEmpty(),
]

const reviewValidator = [
  body('userid', 'userid must not be empty').trim().notEmpty(),
  body('businessid').custom(validateBusinessId),
  body('stars', 'stars must not be empty').trim().notEmpty(),
  body('dollars', 'dollars must not be empty').trim().notEmpty(),
  body('review').optional().trim().notEmpty(),
]

const updateReviewValidator = [
  body('userid', 'userid must not be empty').optional().trim().notEmpty(),
  body('businessid').optional().custom(validateBusinessId),
  body('stars', 'stars must not be empty').optional().trim().notEmpty(),
  body('dollars', 'dollars must not be empty').optional().trim().notEmpty(),
  body('review').optional().trim().notEmpty(),
]

const photoValidator = [
  body('userid', 'userid must not be empty and must be a valid number').trim().notEmpty().isNumeric(),
  body('businessid').custom(validateBusinessId),
  body('caption').optional().trim().notEmpty()
];
const updatephotoValidator = [
  body('userid').optional().trim().notEmpty().withMessage('userid is required').isNumeric().withMessage('userid must be a valid number'),
  body('businessid').optional().custom(validateBusinessId),
  body('caption').optional().trim().notEmpty()
];

async function validateBusinessId(businessid) {
  // Ensure businessid is provided and is a number
  if (!businessid || isNaN(parseInt(businessid))) {
      throw new Error('businessid must not be empty and must be a valid number');
  }
  // Find if any business matches the given businessid
  const businessExists = businesses.some(business => parseInt(business.id) == parseInt(businessid));
  if (!businessExists) {
      throw new Error('Business ID does not exist');
  }
  return true; // Validation succeeded
}


module.exports = {businessValidator, updateBusinessValidator, reviewValidator, updateReviewValidator, photoValidator, updatephotoValidator}