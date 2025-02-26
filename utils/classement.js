// utils/classement.js
const fs = require('fs');
const classementFile = './classement.json';
let classement = fs.existsSync(classementFile)
  ? JSON.parse(fs.readFileSync(classementFile, 'utf8'))
  : {};

function sauvegarderClassement() {
  fs.writeFileSync(classementFile, JSON.stringify(classement, null, 2));
}

function initialiserJoueur(userId) {
  if (!classement[userId]) {
    classement[userId] = { badges: 5, wins: 0, losses: 0, participations: 0 };
  }
}

function getClassement() {
  return classement;
}

module.exports = {
  sauvegarderClassement,
  initialiserJoueur,
  getClassement
};
