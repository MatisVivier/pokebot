// commands/info.js
const { SlashCommandBuilder } = require('discord.js');
const { initialiserJoueur, getClassement } = require('../utils/classement');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription("Affiche vos stats : badges, ratio victoires/défaites et participations"),
  async execute(interaction) {
    initialiserJoueur(interaction.user.id);
    const classement = getClassement();
    const stats = classement[interaction.user.id];
    const ratio = (stats.wins + stats.losses) > 0 ? `${stats.wins} / ${stats.losses}` : "N/A";
    return interaction.reply(`🏅 **Stats de <@${interaction.user.id}>**\n🔹 Badges: **${stats.badges}**\n⚔️ Ratio V/D: **${ratio}**\n📌 Participations: **${stats.participations}**`);
  }
};
