const { check, checkSchema } = require('express-validator');
const sanitize = require('mongo-sanitize');

exports.loginValidator = [
  check('email', 'Username Must Be an Email Address')
    .isByteLength({ min: 6, max: 64 })
    .isEmail()
    .trim()
    .escape()
    .normalizeEmail(),
  check('password')
    .isLength({ min: 8, max: 25 })
    .withMessage('Password Must Be at Least 8 Characters')
    .matches('[0-9]')
    .withMessage('Password Must Contain a Number')
    .matches('[A-Z]')
    .withMessage('Password Must Contain an Uppercase Letter')
    .trim()
    .escape(),
];

exports.bookValidator = [
  check('userId', 'userId field cannot be empty and must be valid')
    .isMongoId()
    .trim()
    .escape(),
  check('title', 'title field cannot be empty and must be valid')
    .isByteLength({ min: 1, max: 100 })
    .trim()
    .escape(),
  check('author', 'author field cannot be empty and must be valid')
    .isByteLength({ min: 1, max: 100 })
    .trim()
    .escape(),
  check('year')
    .isByteLength({ min: 1, max: 4 })
    .withMessage('year should be between 1 and 4 chars long')
    .isInt()
    .withMessage('year should be int. number')
    .trim()
    .escape(),
  check('genre', 'author field cannot be empty and must be valid')
    .isByteLength({ min: 1, max: 100 })
    .trim()
    .escape(),
  check('ratings.*.userId', 'userId field cannot be empty and must be valid')
    .isMongoId()
    .trim()
    .escape(),
  check('ratings.*.grade', 'grade field cannot be empty and must be valid')
    .isByteLength({ min: 1, max: 1 })
    .isInt()
    .trim()
    .escape(),
];

// exports.validatorBookSchema = {
//   userId: {
//     // in: ['body.book'],
//     isEmpty: false,
//     isMongoId: true,
//     errorMessage: 'userId field cannot be empty',
//     // // trim: true,
//     // // escape: true,
//   },
//   title: {
//     // in: ['body.book'],
//     isMongoId: true,
//     isEmpty: false,
//     isLength: {
//       options: { min: 10, max: 100 },
//     },
//     errorMessage: 'title cannot be empty',
//     // trim: true,
//     // escape: true,
//   },
//   author: {
//     // in: ['body'],
//     isEmpty: false,
//     isLength: {
//       options: { min: 1, max: 100 },
//     },
//     errorMessage: 'Charity category cannot be empty',
//     custom: {
//       options: (value) => {
//         console.log(value);
//         // console.log(value.length);
//       },
//     },
//     // trim: true,
//     // escape: true,
//   },
//   imageUrl: {
//     in: ['body'],
//     isEmpty: false,
//     isURL: true,
//     errorMessage: 'Country cannot be empty',
//     custom: {
//       options: (value) => {
//         if (value !== undefined) {
//           value.trim();
//           value.escape();
//         }
//       },
//     },
//   },
//   year: {
//     in: ['body'],
//     isEmpty: false,
//     isInt: true,
//     isLength: {
//       options: { min: 1, max: 4 },
//     },
//     errorMessage: 'Year must be 4 digits max',
//   },
//   genre: {
//     in: ['body'],
//     isEmpty: false,
//     isLength: {
//       options: { min: 1, max: 100 },
//     },
//     errorMessage: 'City cannot be empty',
//   },
//   'ratings.userId': {
//     in: ['body'],
//     isEmpty: false,
//     errorMessage: 'Address line cannot be empty',
//     isMongoId: true,
//     errorMessage: 'Name field cannot be empty',
//     // trim: true,
//     // escape: true,
//   },
//   'ratings.grade': {
//     in: ['body'],
//     isEmpty: false,
//     isInt: true,
//     isLength: {
//       options: { min: 1, max: 1 },
//     },
//     errorMessage: 'Address line cannot be empty',
//     // trim: true,
//     // escape: true,
//   },
// };

// exports.validatorBookSchema = [
//   checkSchema({
//     userId: {
//       isEmpty: true,
//       isMongoId: true,
//       errorMessage: 'userId field cannot be empty',
//       trim: true,
//       escape: true,
//     },
//     title: {
//       isEmpty: false,
//       isLength: {
//         options: { min: 10, max: 100 },
//       },
//       errorMessage: 'title field cannot be empty',
//       trim: true,
//       escape: true,
//     },
//     author: {
//       isEmpty: false,
//       isByteLength: {
//         options: { min: 100, max: 100 },
//       },
//       errorMessage: 'Charity category cannot be empty',
//       custom: {
//         options: (value) => {
//           console.log('console checked author field', value);
//         },
//       },
//       trim: true,
//       escape: true,
//     },
//     // imageUrl: {
//     //   isEmpty: false,
//     //   isURL: true,
//     //   errorMessage: 'Country cannot be empty',
//     //   custom: {
//     //     options: (value) => {
//     //       if (value !== undefined) {
//     //         value.trim();
//     //         value.escape();
//     //       }
//     //     },
//     //   },
//     // },
//     year: {
//       isEmpty: false,
//       isInt: true,
//       isLength: {
//         options: { min: 1, max: 4 },
//       },
//       errorMessage:
//         'year cannot be empty and must be a number with 4 digits max',
//     },
//     genre: {
//       isEmpty: false,
//       isLength: {
//         options: { min: 1, max: 100 },
//       },
//       errorMessage: 'genre cannot be empty',
//     },
//     'ratings.userId': {
//       isEmpty: false,
//       isMongoId: true,
//       errorMessage:
//         'ratings.userId cannot be empty and must be a valid MongoId',
//       trim: true,
//       escape: true,
//     },
//     'ratings.grade': {
//       isEmpty: false,
//       isInt: true,
//       isLength: {
//         options: { min: 1, max: 1 },
//       },
//       errorMessage:
//         'ratings.grade cannot be empty and must be a number of 1 digit',
//       trim: true,
//       escape: true,
//     },
//   }),
// ];
