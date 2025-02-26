// commands/inscription.js
const { SlashCommandBuilder } = require('discord.js');
const { initialiserJoueur, sauvegarderClassement, getClassement } = require('../utils/classement');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inscription')
    .setDescription("S'inscrire au combat en cours"),
  async execute(interaction) {
    if (!global.combatEnCours) {
      return interaction.reply({ content: "❌ Il n'y a pas de combat en cours.", ephemeral: true });
    }
    if (global.inscriptions.includes(interaction.user.id)) {
      return interaction.reply({ content: "⚠️ Tu es déjà inscrit !", ephemeral: true });
    }
    
    global.inscriptions.push(interaction.user.id);
    initialiserJoueur(interaction.user.id);
    
    // Mise à jour du classement
    const classement = getClassement();
    classement[interaction.user.id].participations += 1;
    sauvegarderClassement();
    
    interaction.reply({ content: "✅ **Inscription validée !**", ephemeral: true });
    interaction.channel.send(`✅ un utilisateur s'est inscrit au combat !`);
  }
};
