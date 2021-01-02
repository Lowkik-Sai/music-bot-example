bot.on(//code
db.add(`messages_${message.guild.id}_${message.author.id}`, 1)
  let messagefetch = db.fetch(`messages_${message.guild.id}_${message.author.id}`)

  let messages;
  if (messagefetch == 25) messages = 25; //Level 1
  else if (messagefetch == 65) messages = 65; // Level 2
  else if (messagefetch == 115) messages = 115; // Level 3
  else if (messagefetch == 200) messages = 200; // Level 4
  else if (messagefetch == 300) messages = 300; // Level 5

  if (!isNaN(messages)) {
    db.add(`level_${message.guild.id}_${message.author.id}`, 1)
    let levelfetch = db.fetch(`level_${message.guild.id}_${message.author.id}`)

    let levelembed = new Discord.MessageEmbed()
      .setDescription(`${message.author}, You have leveled up to level ${levelfetch}`)
    message.channel.send(levelembed)
  }
)
