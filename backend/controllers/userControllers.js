const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

//Get .env variables
const dotenv = require('dotenv');
dotenv.config();
const tokenRandomSecret = `${process.env.RANDOM_TOKEN_SECRET}`;

const User = require('../models/UserSchema');
const logger = require('../logger');

// ========== USER CONTROLLERS ========== //

exports.signup = (req, res, next) => {
  //SECURITY : validate, trim, escape and sanitize inputs
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.log(
      'verbose',
      `user : ${req.body.email} submitted a wrong signup form`
    );
    return res.status(403).json({ errors: errors.array() });
  } else {
    let email = req.body.email;
    let password = req.body.password;

    //d'abord, on cherche un potentiel utilisateur déjà inscrit avec le même email
    const oldUser = User.findOne({ email: email })
      .then((oldUser) => {
        if (oldUser) {
          //un utilisateur inscrit avec le même email existe
          //-> on retourne une réponse sans aller plus loin
          logger.log(
            'verbose',
            `user : ${oldUser._id}/${oldUser.email} is trying to signin again`
          );
          return res.status(409).json({ message: 'There was an error' });
        } else {
          //pas d'utilisateur déjà inscrit avec le même email
          //-> on peut inscrire le nouvel utilisateur

          argon2
            .hash(password)
            .then((hash) => {
              const newUser = new User({
                email: email,
                password: hash,
              });
              newUser
                .save()
                .then(() => {
                  res.status(201).json({ message: 'utilisateur créé' });
                })
                .catch((error) => res.status(400).json({ error }));
            })
            .catch((error) => res.status(500).json({ error }));
          // }
        }
      })
      .catch((error) => res.status(500).json({ error }));
  }
};

exports.login = async (req, res, next) => {
  //SECURITY : validate, trim, escape and sanitize inputs
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(req.body);
    logger.log(
      'verbose',
      `user : ${req.body.email} submitted a wrong login form`
    );
    return res.status(403).json({ errors: errors.array() });
  } else {
    let email = req.body.email;
    let password = req.body.password;

    User.findOne({ email: email })
      .then((user) => {
        if (user === null) {
          res.status(401).json({ message: 'Paire identifiant/mdp incorrecte' });
        } else {
          argon2
            .verify(user.password, password)
            .then((valid) => {
              if (!valid) {
                logger.log(
                  'verbose',
                  `user : ${user._id}/${user.email} has used a wrong password`
                );
                res
                  .status(401)
                  .json({ message: 'Paire identifiant/mdp incorrecte' });
              } else {
                res.status(200).json({
                  userId: user._id,
                  token: jwt.sign({ userId: user._id }, tokenRandomSecret, {
                    expiresIn: '24h',
                  }),
                });
              }
            })
            .catch((error) => res.status(501).json({ error }));
        }
      })
      .catch((error) => res.status(500).json({ error }));
  }
};
