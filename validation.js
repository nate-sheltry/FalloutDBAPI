const { body, check, param, query } = require('express-validator');
const illegalCharacters = /.*/;
const mustBeDigit = /\d+/;
const mustBeDie = /^\d+[dD]\d+$/;
const ammoCategories = /^(handguns|other|big guns|rifles)$/;
const img = /^.*\.(webp|jpe?g|png|gif|bmp|svg)$/;

//Add Ammo
exports.postAmmoValidation = [
    check('name', 'name failed to validate, try replacing spaces with hyphens(-) and periods with underscores(_)').notEmpty(),
    check('value', 'value must be a digit.').matches(mustBeDigit),
    check('ac', 'ac must be a valid digit.').matches(mustBeDigit),
    check('dr', 'dr must be a valid digit.').matches(mustBeDigit),
    check('vol', 'vol must be a valid digit.').matches(mustBeDigit),
    check('dmg', 'dmg must be a valid die. Example: 1d6, 12d4, 1d100').matches(mustBeDie),
    check('img', 'img must be an image format. Example: picture.webp | https://hosting.net/image.png | for no image enter: no_image.png').matches(img),
    check('category').custom(arr => {
        const isValid = arr.every(input => ammoCategories.test(input))
        if(!isValid){
            throw new Error('Invalid category, please enter a valid category.')
        }
        return true
    })
]

exports.deleteValidation = [
    param('id').isMongoId().withMessage('Invalid ID format'),
]

exports.putAmmoValidation = [
    param('id').isMongoId(),
    check('value').matches(mustBeDigit).withMessage('value must be a digit.').matches(mustBeDigit),
    check('ac').optional().matches(mustBeDigit).withMessage('ac must be a valid digit.'),
    check('dr').optional().matches(mustBeDigit).withMessage('dr must be a valid digit.'),
    check('vol').optional().matches(mustBeDigit).withMessage('vol must be a valid digit.'),
    check('dmg').optional().matches(mustBeDie).withMessage('dmg must be a valid die. Example: 1d6, 12d4, 1d100'),
    check('img').optional().matches(img).withMessage('img must be an image format. Example: picture.webp | https://hosting.net/image.png | for no image enter: no_image.png'),
    check('category').optional().custom(arr => {
        const isValid = arr.every(input => ammoCategories.test(input));
        if(!isValid){
            throw new Error('Invalid category, please enter a valid category.')
        }
        return true
    })
]


//Armor

exports.postArmorValidation = [
    check('name', 'name failed to validate, try replacing spaces with hyphens(-) and periods with underscores(_)').notEmpty(),
    check('value', 'value must be a valid integer').isInt(),
    check('ac', 'ac must be valid integer').isInt(),
    check('elecRes', 'elecRes must be valid integer').isInt(),
    check('poisRes', 'poisRes must be valid integer').isInt(),
    check('radRes', 'radRes must be valid integer').isInt(),
    check('weight', 'weight must be valid integer').isInt(),
    check('otherBonuses', 'otherBonuses must not be empty').notEmpty(),
    check('dr').custom(dict => {
        const arr = [
            dict.normal.isInt(),
            dict.fire.isInt(),
            dict.plasma.isInt(),
            dict.laser.isInt(),
            dict.explosion.isInt()
        ]
        if(arr.includes(false)){
            throw new Error('dr contained an invalid value. Please enter an integer')
        }
        return true
    }),
    check('dt').custom(dict => {
        const arr = [
            dict.normal.isInt(),
            dict.fire.isInt(),
            dict.plasma.isInt(),
            dict.laser.isInt(),
            dict.explosion.isInt()
        ]
        if(arr.includes(false)){
            throw new Error('dt contained an invalid value. Please enter an integer')
        }
        return true
    })
]

exports.putArmorValidation = [
    param('id').isMongoId(),
    check('value').optional().isInt().withMessage('value must be a valid integer'),
    check('ac').optional().isInt().withMessage('ac must be valid integer'),
    check('elecRes').optional().isInt().withMessage('elecRes must be valid integer'),
    check('poisRes').optional().isInt().withMessage('poisRes must be valid integer'),
    check('radRes').optional().isInt().withMessage('radRes must be valid integer'),
    check('weight').optional().isInt().withMessage('weight must be valid integer'),
    check('otherBonuses').optional().notEmpty().withMessage('otherBonuses must not be empty'),
    check('dr').optional().custom(dict => {
        const arr = [
            dict.normal.isInt(),
            dict.fire.isInt(),
            dict.plasma.isInt(),
            dict.laser.isInt(),
            dict.explosion.isInt()
        ]
        if(arr.includes(false)){
            throw new Error('dr contained an invalid value. Please enter an integer')
        }
        return true
    }),
    check('dt').optional().custom(dict => {
        const arr = [
            dict.normal.isInt(),
            dict.fire.isInt(),
            dict.plasma.isInt(),
            dict.laser.isInt(),
            dict.explosion.isInt()
        ]
        if(arr.includes(false)){
            throw new Error('dt contained an invalid value. Please enter an integer')
        }
        return true
    })
]
