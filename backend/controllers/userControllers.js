const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

//Get .env variables
const dotenv = require('dotenv');
dotenv.config();
const tokenRandomSecret = `${process.env.RANDOM_TOKEN_SECRET}`;

const User = require('../models/UserSchema');

// ========== VALIDATE PASSWORD FUNCTION ========== //

function checkPassword(input) {
  var pswdRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;
  if (input.match(pswdRegex)) {
    console.log(true);
    return true;
  } else {
    console.log(false);
    return false;
  }
}

// ========== USER CONTROLLERS ========== //

exports.signup = (req, res, next) => {
  console.log('signup');
  //d'abord, on cherche un potentiel utilisateur déjà inscrit avec le même email
  const oldUser = User.findOne({ email: req.body.email })
    .then((oldUser) => {
      if (oldUser) {
        //un utilisateur inscrit avec le même email existe
        //-> on retourne une réponse sans aller plus loin
        return res.status(409).json({ message: 'There was an error' });
      } else {
        //pas d'utilisateur déjà inscrit avec le même email
        //-> on peut inscrire le nouvel utilisateur

        // on vérifie que le mdp fait bien plus de 8 charactères (max 20) avec minimum une minuscule, une majuscule, un chiffre
        console.log('no old user');
        console.log(checkPassword(req.body.password));
        if (!checkPassword(req.body.password)) {
          // return res.status(403).json({
          //   message:
          //     'Votre mot de passe doit faire entre 8 et 20 charactères, avec au minimum une minuscule, une majuscule, un chiffre',
          // });
          return res.json(
            {
              success: false,
              error:
                'Votre mot de passe doit faire entre 8 et 20 charactères, avec au minimum une minuscule, une majuscule, un chiffre',
            },
            403
          );
        } else {
          argon2
            .hash(req.body.password)
            .then((hash) => {
              const newUser = new User({
                email: req.body.email,
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
        }
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user === null) {
        res.status(401).json({ message: 'Paire identifiant/mdp incorrecte' });
      } else {
        argon2
          .verify(user.password, req.body.password)
          .then((valid) => {
            if (!valid) {
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
};
