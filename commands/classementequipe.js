// commands/classementequipe.js
const { SlashCommandBuilder } = require('discord.js');
const { getClassement } = require('../utils/classement');
const { getTeamForMember } = require('../utils/team');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('classementequipe')
    .setDescription("Affiche le classement des équipes basé sur le total des badges de leurs membres"),
  async execute(interaction) {
    const classement = getClassement();
    const teamTotals = {}; // { teamName: totalBadges }
    const teamMembers = {}; // { teamName: [userId, ...] }

    // Pour chaque joueur du classement
    for (const userId of Object.keys(classement)) {
      // Tente de récupérer le membre depuis le cache du serveur
      const member = interaction.guild.members.cache.get(userId);
      let team = member ? getTeamForMember(member) : null;
      if (!team) {
        team = "Sans équipe";
      }
      
      // Initialise si nécessaire
      if (!teamTotals[team]) {
        teamTotals[team] = 0;
        teamMembers[team] = [];
      }
      
      teamTotals[team] += classement[userId].badges;
      teamMembers[team].push(userId);
    }
    
    // Convertit en tableau, filtre "Sans équipe", puis trie par total des badges décroissant
    const sortedTeams = Object.entries(teamTotals)
      .filter(([teamName]) => teamName !== "Sans équipe")
      .sort((a, b) => b[1] - a[1]);
    
    let message = "**🏆 Classement des équipes :**\n";
    sortedTeams.forEach(([teamName, totalBadges], index) => {
      message += `\`${index + 1}.\` **${teamName}** - Total des badges : **${totalBadges}**\n`;
    });
    
    return interaction.reply(message);
  }
};
