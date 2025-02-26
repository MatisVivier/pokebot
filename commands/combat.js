// commands/combat.js
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { createCombat } = require('../utils/combat');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('combat')
    .setDescription('Lance un combat (ADMIN seulement)'),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: "❌ Seuls les admins peuvent lancer un combat.", ephemeral: true });
    }
    if (global.combatEnCours) {
      return interaction.reply({ content: "⚠️ Un combat est déjà en cours !", ephemeral: true });
    }

    // Initialisation des variables globales
    global.combatEnCours = true;
    global.createurCombat = interaction.user.id;
    global.inscriptions = [];
    global.combats = [];

    await interaction.reply("⚔️ **@here Un combat va commencer !** Utilisez `/inscription` pour vous inscrire. Vous avez **30 secondes** !");

    setTimeout(() => {
      if (global.inscriptions.length < 2) {
        interaction.channel.send("❌ Pas assez de participants pour un combat.");
        global.combatEnCours = false;
      } else {
        createCombat(interaction.channel);
      }
    }, 60000);
  }
};
