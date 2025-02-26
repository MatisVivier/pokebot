// utils/combat.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createCombat(channel) {
  let shuffled = [...global.inscriptions].sort(() => 0.5 - Math.random());
  global.combats = [];
  
  while (shuffled.length >= 2) {
    const joueur1 = shuffled.shift();
    const joueur2 = shuffled.shift();
    global.combats.push({ joueur1, joueur2, channelId: channel.id, processed: false });
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`fight_${global.combats.length - 1}_1`)
          .setLabel("Gagnant 1")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`fight_${global.combats.length - 1}_2`)
          .setLabel("Gagnant 2")
          .setStyle(ButtonStyle.Danger)
      );
    
    channel.send({
      content: `⚔️ **Combat entre** <@${joueur1}> 🆚 <@${joueur2}> !\n🛑 **Seul le créateur du combat peut choisir le gagnant.**`,
      components: [row]
    });
  }
}

module.exports = {
  createCombat
};
