require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder().setName('combat').setDescription("Lance un combat (ADMIN seulement)"),
  new SlashCommandBuilder().setName('inscription').setDescription("S'inscrire au combat en cours"),
  new SlashCommandBuilder().setName('classement').setDescription("Affiche le classement des joueurs")
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Enregistrement des commandes...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('Commandes enregistrées avec succès !');
  } catch (error) {
    console.error(error);
  }
})();
