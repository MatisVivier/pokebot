// commands/quitterequipe.js
const { SlashCommandBuilder } = require('discord.js');
const { getTeamByCreator, removeTeam } = require('../utils/team');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('supprimerequipe')
    .setDescription("Supprime votre équipe (seul le créateur peut le faire)"),
  async execute(interaction) {
    const creatorId = interaction.user.id;
    const teamRoleId = getTeamByCreator(creatorId);
    if (!teamRoleId) {
      return interaction.reply({ content: "Vous n'êtes pas le créateur d'une équipe.", ephemeral: true });
    }
    // Récupération du rôle
    const role = interaction.guild.roles.cache.get(teamRoleId);
    if (!role) {
      // Si le rôle n'existe plus, on retire l'équipe du mapping.
      removeTeam(teamRoleId);
      return interaction.reply({ content: "L'équipe n'existe plus.", ephemeral: true });
    }
    // Supprime le rôle de tous ses membres
    const membersWithRole = role.members;
    membersWithRole.forEach(member => {
      member.roles.remove(role).catch(console.error);
    });
    // Supprime le rôle du serveur
    role.delete("Équipe supprimé par le créateur").catch(console.error);
    // Retire l'équipe du mapping
    removeTeam(teamRoleId);
    return interaction.reply({ content: "Votre équipe a été supprimé avec succès.", ephemeral: false });
  }
};
