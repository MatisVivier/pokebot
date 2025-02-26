// commands/classement.js
const { SlashCommandBuilder } = require('discord.js');
const { getClassement } = require('../utils/classement');
const { getTeamForMember } = require('../utils/team');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('classement')
    .setDescription("Affiche le classement des joueurs"),
  async execute(interaction) {
    const classement = getClassement();
    if (Object.keys(classement).length === 0) {
      return interaction.reply("❌ Aucun joueur classé.");
    }
    
    let message = "**🏆 Classement des joueurs :**\n";
    // Trie par badges décroissant
    const sorted = Object.entries(classement).sort((a, b) => b[1].badges - a[1].badges);
    
    for (const [userId, stats] of sorted) {
      // Récupère le membre depuis le cache du serveur
      const member = interaction.guild.members.cache.get(userId);
      const team = member ? getTeamForMember(member) : null;
      const teamText = team ? ` | Équipe : **${team}**` : " | Équipe : **Aucune**";
      
      const ratio = (stats.wins + stats.losses) > 0 ? `${stats.wins} / ${stats.losses}` : "N/A";
      message += `<@${userId}> - **${stats.badges} badges** (V/D: ${ratio})${teamText}\n`;
    }
    
    return interaction.reply(message);
  }
};
