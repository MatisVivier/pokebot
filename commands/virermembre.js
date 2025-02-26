// commands/virermembre.js
const { SlashCommandBuilder } = require('discord.js');
const { getTeamByCreator } = require('../utils/team');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('virermembre')
    .setDescription("Virer un membre de votre équipe (seul le créateur peut le faire)")
    .addUserOption(option =>
      option.setName('membre')
        .setDescription("Le membre à virer")
        .setRequired(true)
    ),
  async execute(interaction) {
    const creatorId = interaction.user.id;
    const teamRoleId = getTeamByCreator(creatorId);
    if (!teamRoleId) {
      return interaction.reply({ content: "Vous n'êtes pas le créateur d'une équipe.", ephemeral: true });
    }
    const memberToKick = interaction.options.getUser('membre');
    // Récupère l'objet membre
    const guildMember = await interaction.guild.members.fetch(memberToKick.id);
    if (!guildMember.roles.cache.has(teamRoleId)) {
      return interaction.reply({ content: "Ce membre n'appartient pas à votre équipe.", ephemeral: true });
    }
    try {
      await guildMember.roles.remove(teamRoleId);
      return interaction.reply({ content: `<@${memberToKick.id}> a été viré de votre équipe.`, ephemeral: false });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: "Une erreur est survenue lors de la tentative de virer le membre.", ephemeral: true });
    }
  }
};
