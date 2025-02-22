require('dotenv').config();
const { 
  Client, GatewayIntentBits, Events, 
  ActionRowBuilder, ButtonBuilder, ButtonStyle 
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

// Liste des joueurs inscrits
let inscriptions = [];
// Liste des combats
let combats = [];
// État du combat en cours
let combatEnCours = false;

// Fichier pour stocker le classement
const classementFile = './classement.json';
let classement = fs.existsSync(classementFile) ? JSON.parse(fs.readFileSync(classementFile, 'utf8')) : {};

// Sauvegarde du classement
function sauvegarderClassement() {
  fs.writeFileSync(classementFile, JSON.stringify(classement, null, 2));
}

// Initialiser un joueur s'il n'est pas déjà dans le classement
function initialiserJoueur(userId) {
  if (!classement[userId]) {
    classement[userId] = { badges: 5, wins: 0, losses: 0 };
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

    // 🏆 Commande /combat
    if (commandName === 'combat') {
      if (!interaction.member.permissions.has("ADMINISTRATOR")) {
        return interaction.reply({ content: "❌ Seuls les admins peuvent lancer un combat.", ephemeral: true });
      }
      if (combatEnCours) {
        return interaction.reply({ content: "⚠️ Un combat est déjà en cours !", ephemeral: true });
      }

      combatEnCours = true;
      inscriptions = [];
      combats = [];

      await interaction.reply("⚔️ **Un combat va commencer !** Utilisez `/inscription` pour vous inscrire. Vous avez **30 secondes** !");

      // Démarrer le timer
      setTimeout(() => {
        if (inscriptions.length < 2) {
          interaction.channel.send("❌ Pas assez de participants pour un combat.");
          combatEnCours = false;
        } else {
          creerCombats(interaction.channel);
        }
      }, 10000);
    }

    // 📝 Commande /inscription
    if (commandName === 'inscription') {
      if (!combatEnCours) {
        return interaction.reply({ content: "❌ Il n'y a pas de combat en cours.", ephemeral: true });
      }
      if (inscriptions.includes(interaction.user.id)) {
        return interaction.reply({ content: "⚠️ Tu es déjà inscrit !", ephemeral: true });
      }

      inscriptions.push(interaction.user.id);
      interaction.reply({ content: "✅ **Inscription validée !**", ephemeral: true });

      // 🔊 Annonce publique
      interaction.channel.send(`✅ Un utilisateur s'est inscrit au combat !`);
    }

    // 📊 Commande /classement
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
  }

  // 🎭 Gestion des boutons (choix du gagnant)
  if (interaction.isButton()) {
    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      return interaction.reply({ content: "❌ Seuls les administrateurs peuvent choisir le gagnant.", ephemeral: true });
    }

    const [_, combatIndex, gagnantIndex] = interaction.customId.split('_').map(Number);

    if (isNaN(combatIndex) || (gagnantIndex !== 1 && gagnantIndex !== 2)) {
      return interaction.reply({ content: "❌ Erreur dans la sélection du gagnant.", ephemeral: true });
    }

    traiterCombat(combatIndex, gagnantIndex);
    await interaction.update({ content: `🏆 **Victoire attribuée !**`, components: [] });
  }
});

// ------------------------------
// GESTION DES COMBATS
// ------------------------------

// Création des combats
function creerCombats(channel) {
    let shuffled = [...inscriptions].sort(() => 0.5 - Math.random());
  
    while (shuffled.length >= 2) {
      const joueur1 = shuffled.shift();
      const joueur2 = shuffled.shift();
      combats.push({ joueur1, joueur2, channelId: channel.id, processed: false }); // 🔥 Ajout de channelId
  
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`fight_${combats.length - 1}_1`)
            .setLabel("Gagnant 1")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`fight_${combats.length - 1}_2`)
            .setLabel("Gagnant 2")
            .setStyle(ButtonStyle.Danger)
        );
  
      channel.send({
        content: `⚔️ **Combat entre** <@${joueur1}> 🆚 <@${joueur2}> !\n🛑 **L'admin doit choisir le gagnant.**`,
        components: [row]
      });
    }
  }  

// Traitement du combat après choix du gagnant
// Traitement du combat après choix du gagnant
function traiterCombat(index, gagnantIndex) {
    const combat = combats[index];
    if (!combat || combat.processed) {
      return console.error("❌ Combat invalide ou déjà traité.");
    }
  
    combat.processed = true;
    const joueur1 = combat.joueur1;
    const joueur2 = combat.joueur2;
  
    initialiserJoueur(joueur1);
    initialiserJoueur(joueur2);
  
    let gagnant = gagnantIndex === 1 ? joueur1 : joueur2;
    let perdant = gagnantIndex === 1 ? joueur2 : joueur1;
  
    classement[gagnant].wins += 1;
    classement[gagnant].badges += 1;
    classement[perdant].losses += 1;
    classement[perdant].badges = Math.max(0, classement[perdant].badges - 1);
  
    sauvegarderClassement();
  
    // 🔥 Récupérer le bon salon et envoyer l'annonce
    client.channels.fetch(combat.channelId)
      .then(channel => {
        if (channel) {
          channel.send(`🏆 **Victoire de <@${gagnant}> !** 🎉 Il gagne **+1 badge** et **+1 victoire** !`);
        } else {
          console.error("❌ Impossible de trouver le salon du combat.");
        }
      })
      .catch(err => console.error("❌ Erreur lors de la récupération du salon :", err));
  }  

// ------------------------------
// LANCEMENT DU BOT
// ------------------------------
client.login(process.env.TOKEN);
