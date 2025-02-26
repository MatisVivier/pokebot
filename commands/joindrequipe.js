// commands/joindrequipe.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joindrequipe')
    .setDescription("Rejoindre une équipe existante")
    .addStringOption(option =>
      option.setName('nom')
        .setDescription("Nom de l'équipe à rejoindre")
        .setRequired(true)
    ),
  async execute(interaction) {
    const teamName = interaction.options.getString('nom');
    
    // Recherche le rôle correspondant à l'équipe (insensible à la casse)
    const roleToJoin = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === teamName.toLowerCase());
    if (!roleToJoin) {
      return interaction.reply({ content: `Aucune équipe trouvée avec le nom **${teamName}**.`, ephemeral: true });
    }
    if (interaction.member.roles.cache.has(roleToJoin.id)) {
      return interaction.reply({ content: `Vous faites déjà partie de l'équipe **${teamName}**.`, ephemeral: true });
    }
    
    // Vérifier que l'équipe n'a pas déjà 3 membres
    if (roleToJoin.members.size >= 3) {
      return interaction.reply({ content: `L'équipe **${teamName}** est déjà pleine (3 membres maximum).`, ephemeral: true });
    }
    
    try {
      // Attribution du rôle
      await interaction.member.roles.add(roleToJoin);
      return interaction.reply({ content: `Vous avez rejoint l'équipe **${teamName}** !`, ephemeral: false });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: "Une erreur est survenue lors de la tentative de rejoindre l'équipe.", ephemeral: true });
    }
  }
};
