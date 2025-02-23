require('dotenv').config();
const { 
  Client, GatewayIntentBits, Events, 
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  PermissionsBitField, REST, Routes, SlashCommandBuilder
} = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ------------------------------
// DONNÉES GLOBALES
// ------------------------------

let inscriptions = [];
let combats = [];
let combatEnCours = false;
let createurCombat = null;

const classementFile = './classement.json';
let classement = fs.existsSync(classementFile) ? JSON.parse(fs.readFileSync(classementFile, 'utf8')) : {};

function sauvegarderClassement() {
  fs.writeFileSync(classementFile, JSON.stringify(classement, null, 2));
}

function initialiserJoueur(userId) {
  if (!classement[userId]) {
    classement[userId] = { badges: 5, wins: 0, losses: 0, participations: 0 };
  }
}

// ------------------------------
// GESTION DES COMMANDES
// ------------------------------

client.once(Events.ClientReady, () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;

    if (commandName === 'combat') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: "❌ Seuls les admins peuvent lancer un combat.", ephemeral: true });
      }
      if (combatEnCours) {
        return interaction.reply({ content: "⚠️ Un combat est déjà en cours !", ephemeral: true });
      }

      combatEnCours = true;
      createurCombat = interaction.user.id;
      inscriptions = [];
      combats = [];

      await interaction.reply("⚔️ **@here Un combat va commencer !** Utilisez `/inscription` pour vous inscrire. Vous avez **30 secondes** !");

      setTimeout(() => {
        if (inscriptions.length < 2) {
          interaction.channel.send("❌ Pas assez de participants pour un combat.");
          combatEnCours = false;
        } else {
          creerCombats(interaction.channel);
        }
      }, 60000);
    }

    if (commandName === 'inscription') {
      if (!combatEnCours) {
        return interaction.reply({ content: "❌ Il n'y a pas de combat en cours.", ephemeral: true });
      }
      if (inscriptions.includes(interaction.user.id)) {
        return interaction.reply({ content: "⚠️ Tu es déjà inscrit !", ephemeral: true });
      }

      inscriptions.push(interaction.user.id);
      initialiserJoueur(interaction.user.id);
      classement[interaction.user.id].participations += 1;
      sauvegarderClassement();
      
      interaction.reply({ content: "✅ **Inscription validée !**", ephemeral: true });
      interaction.channel.send(`✅ un utilisateur s'est inscrit au combat !`);
    }

    if (commandName === 'classement') {
      if (Object.keys(classement).length === 0) {
        return interaction.reply("❌ Aucun joueur classé.");
      }

      let message = "**🏆 Classement des joueurs :**\n";
      let sorted = Object.entries(classement).sort((a, b) => b[1].badges - a[1].badges);

      sorted.forEach(([userId, stats], index) => {
        const ratio = (stats.wins + stats.losses) > 0 ? `${stats.wins} / ${stats.losses}` : "N/A";
        message += `\`${index + 1}.\` <@${userId}> - **${stats.badges} badges** (V/D: ${ratio})\n`;
      });

      return interaction.reply(message);
    }

    if (commandName === 'info') {
      initialiserJoueur(interaction.user.id);
      const stats = classement[interaction.user.id];
      const ratio = (stats.wins + stats.losses) > 0 ? `${stats.wins} / ${stats.losses}` : "N/A";
      return interaction.reply(`🏅 **Stats de <@${interaction.user.id}>**\n🔹 Badges: **${stats.badges}**\n⚔️ Ratio V/D: **${ratio}**\n📌 Participations: **${stats.participations}**`);
    }
  }
});

function creerCombats(channel) {
  let shuffled = [...inscriptions].sort(() => 0.5 - Math.random());
  while (shuffled.length >= 2) {
    const joueur1 = shuffled.shift();
    const joueur2 = shuffled.shift();
    combats.push({ joueur1, joueur2, channelId: channel.id, processed: false });
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId(`fight_${combats.length - 1}_1`).setLabel("Gagnant 1").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`fight_${combats.length - 1}_2`).setLabel("Gagnant 2").setStyle(ButtonStyle.Danger)
      );
    
    channel.send({
      content: `⚔️ **Combat entre** <@${joueur1}> 🆚 <@${joueur2}> !\n🛑 **Seul le créateur du combat peut choisir le gagnant.**`,
      components: [row]
    });
  }
}

const commands = [
  new SlashCommandBuilder().setName('combat').setDescription("Lance un combat (ADMIN seulement)"),
  new SlashCommandBuilder().setName('inscription').setDescription("S'inscrire au combat en cours"),
  new SlashCommandBuilder().setName('classement').setDescription("Affiche le classement des joueurs"),
  new SlashCommandBuilder().setName('info').setDescription("Affiche vos stats : badges, ratio victoires/défaites et participations")
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

client.login(process.env.TOKEN);
