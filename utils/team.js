// utils/team.js
const fs = require('fs');
const path = require('path');

const teamDataFile = path.join(__dirname, '..', 'teamData.json');
let teamMapping = {};
if (fs.existsSync(teamDataFile)) {
  teamMapping = JSON.parse(fs.readFileSync(teamDataFile, 'utf8'));
}

function saveTeamMapping() {
  fs.writeFileSync(teamDataFile, JSON.stringify(teamMapping, null, 2));
}

/**
 * Ajoute une équipe dans le mapping.
 * Retourne false si le créateur a déjà une équipe.
 */
function addTeam(roleId, creatorId) {
  // Vérifie si le créateur a déjà créé une équipe.
  for (const role in teamMapping) {
    if (teamMapping[role] === creatorId) {
      return false;
    }
  }
  teamMapping[roleId] = creatorId;
  saveTeamMapping();
  return true;
}

/**
 * Supprime une équipe du mapping.
 */
function removeTeam(roleId) {
  if (teamMapping[roleId]) {
    delete teamMapping[roleId];
    saveTeamMapping();
  }
}

/**
 * Renvoie l'ID du rôle de l'équipe créée par un utilisateur, ou null si aucune.
 */
function getTeamByCreator(creatorId) {
  for (const role in teamMapping) {
    if (teamMapping[role] === creatorId) {
      return role;
    }
  }
  return null;
}

/**
 * Renvoie l'ID du créateur d'une équipe à partir de l'ID du rôle.
 */
function getTeamCreator(roleId) {
  return teamMapping[roleId] || null;
}

/**
 * Renvoie le nom du rôle d'équipe dont fait partie le membre.
 * Si le membre possède plusieurs rôles d'équipe, on renvoie le premier trouvé.
 */
function getTeamForMember(member) {
  // Parcourt les rôles enregistrés comme équipes (les clés du mapping)
  for (const roleId of Object.keys(teamMapping)) {
    if (member.roles.cache.has(roleId)) {
      const teamRole = member.guild.roles.cache.get(roleId);
      return teamRole ? teamRole.name : null;
    }
  }
  return null;
}

module.exports = {
  addTeam,
  removeTeam,
  getTeamByCreator,
  getTeamCreator,
  getTeamForMember
};
