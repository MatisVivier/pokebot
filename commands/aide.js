// commands/aide.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aide')
    .setDescription("Affiche l'aide et la liste des commandes disponibles"),
  async execute(interaction) {
    const helpEmbed = new EmbedBuilder()
      .setTitle('Aide - Commandes Disponibles')
      .setColor(0x00AE86)
      .setDescription('Voici la liste des commandes que vous pouvez utiliser avec ce bot :')
      .addFields(
        { name: '/combat', value: 'Lance un combat (ADMIN).' },
        { name: '/inscription', value: "S'inscrire au combat en cours." },
        { name: '/classement', value: 'Affiche le classement individuel des joueurs avec leurs stats et l’équipe à laquelle ils appartiennent.' },
        { name: '/info', value: 'Affiche vos statistiques personnelles (badges, ratio victoires/défaites, participations).' },
        { name: '/creerquipe', value: "Crée une équipe avec un rôle associé (vous ne pouvez créer qu'une seule équipe). Vous pouvez spécifier le nom et la couleur (format hexadécimal). Le rôle sera démarqué." },
        { name: '/joindrequipe', value: "Rejoignez une équipe existante (limite 3 membres par équipe)." },
        { name: '/quitterequipe', value: "Supprimer votre équipe (seul le créateur peut le faire). Cette commande supprime l'équipe pour tous ses membres." },
        { name: '/virermembre', value: "Permet au créateur de l'équipe de virer un membre de son équipe." },
        { name: '/classementequipe', value: 'Affiche le classement des équipes basé sur le total des badges de leurs membres (les joueurs sans équipe sont exclus).' },
      )
      .setFooter({ text: 'PokeBOT - Aide' });

    return interaction.reply({ embeds: [helpEmbed] });
  }
};
