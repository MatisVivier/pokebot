// commands/creerquipe.js
const { SlashCommandBuilder } = require('discord.js');
const { addTeam, getTeamByCreator } = require('../utils/team');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('creerquipe')
    .setDescription("Créer une équipe avec un rôle associé")
    .addStringOption(option =>
      option.setName('nom')
        .setDescription("Nom de l'équipe")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('couleur')
        .setDescription("Couleur de l'équipe en hexadécimal (#RRGGBB)")
        .setRequired(true)
    ),
  async execute(interaction) {
    const creatorId = interaction.user.id;
    // Vérifie si l'utilisateur a déjà créé une équipe.
    if (getTeamByCreator(creatorId)) {
      return interaction.reply({ content: "Vous avez déjà créé une équipe. Vous ne pouvez pas en créer une autre.", ephemeral: true });
    }
    
    const teamName = interaction.options.getString('nom');
    let teamColor = interaction.options.getString('couleur');
    
    // Vérification du format de la couleur
    if (!/^#?[0-9A-Fa-f]{6}$/.test(teamColor)) {
      return interaction.reply({ content: "La couleur fournie n'est pas valide. Utilisez le format hexadécimal (ex: #FF0000).", ephemeral: true });
    }
    if (teamColor.startsWith('#')) {
      teamColor = teamColor.slice(1);
    }
    
    // Vérifie si un rôle avec ce nom existe déjà
    const existingRole = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === teamName.toLowerCase());
    if (existingRole) {
      return interaction.reply({ content: `Une équipe avec le nom **${teamName}** existe déjà. Utilisez /joindrequipe pour la rejoindre.`, ephemeral: true });
    }
    
    try {
      // Création du rôle avec la couleur, hoist (démarquage) et mentionnable.
      const newRole = await interaction.guild.roles.create({
        name: teamName,
        color: parseInt(teamColor, 16),
        hoist: true,
        mentionable: true,
        reason: `Équipe créée par ${interaction.user.tag}`
      });
      
      // Ajoute l'équipe dans le mapping (vérifie qu'aucune équipe n'existe déjà pour le créateur)
      const added = addTeam(newRole.id, creatorId);
      if (!added) {
        return interaction.reply({ content: "Vous avez déjà créé une équipe.", ephemeral: true });
      }
      
      // Attribution du rôle à l'utilisateur
      await interaction.member.roles.add(newRole);
      return interaction.reply({ content: `L'équipe **${teamName}** a été créée avec la couleur #${teamColor} et vous avez été ajouté(e) au rôle !`, ephemeral: false });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: "Une erreur est survenue lors de la création de l'équipe.", ephemeral: true });
    }
  }
};
