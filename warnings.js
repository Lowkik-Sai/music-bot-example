const db = require('quick.db');

module.exports = {
    name: "warnings",
    description: "Check a users warnings",

    async run (client, message, args){
        const id = args[0];
        const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.author;


        let warnings = await db.get(`warnings_${message.guild.id}_${user.id}`);

        if(warnings === null) warnings = 0;

        message.channel.send({embed: {
   color: 3066993,
   description:`**${user.username}** has *${warnings}* warning(s)`
}});

        if(warnings !== null) warnings = 0;

        message.channel.send({embed: {
   color: 3066993,
   description:`**<@${id}>** has *${warnings}* warning(s)`
}});
    }
}
