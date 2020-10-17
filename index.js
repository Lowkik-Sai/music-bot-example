const { Client, Util, MessageEmbed} = require("discord.js");
const { Permissions } = require('discord.js');
const util = require('util');
const YouTube = require("simple-youtube-api");
const ytdl = require("ytdl-core");
const db = require("quick.db");
const ms = require("ms");
const fs = require("fs");
const Canvas = require('canvas');
var jimp = require('jimp');
const Discord = require("discord.js");
require("dotenv").config();
require("./server.js");

const bot = new Client({
    disableMentions: "everyone"
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

bot.on("ready", () => {
    console.log("GuessTheNumber is Ready!");
});

let limit = 2000; // You can change it through /limit command
let number = Math.floor(Math.random()* Math.floor(limit)); // You can custom it through /number command and reroll it through /reroll
let ownerID = '654669770549100575';
let channelID = '763233532797124649';

bot.on('message', async message => {
    if(message.content == "+restart") {
        if(message.author.id !== ownerID) return message.reply(`You don't have the permission to run this command.`);
        message.react('✅');
        setTimeout(function() {
        	process.exit(0);
        }, 1000);
    }
    if(message.content == "+viewnumber") {
        if(message.author.id !== ownerID) return message.reply(`You don't have the permission to run this command.`);
        message.author.send({embed: {
   color: 3066993,
   description:`The current number is ${number}`
}});
        message.reply({embed: {
   color: 3066993,
   description:`The current number is ${number}`
}});
    }
    if(message.content == "+viewlimit") {
        if(message.author.id !== ownerID) return message.reply(`You don't have the permission to run this command.`);
        message.author.send({embed: {
   color: 3066993,
   description:`The current limit is ${limit}`
}});
        message.reply({embed: {
   color: 3066993,
   description:`The current limit is ${limit}`
}});
    }
    if(message.content == "+reroll") {
        if(message.author.id !== ownerID) return message.reply(`You don't have the permission to run this command.`);
        number = Math.floor(Math.random()* Math.floor(limit));
        message.author.send({embed: {
   color: 3066993,
   description:`The new number is ${number}`
}});
        message.reply({embed: {
   color: 3066993,
   description:`The new number is ${number}`
}});
    }
    if(message.content.startsWith("+number")) {
        if(message.author.id !== ownerID) return message.reply(`You don't have the permission to run this command.`);
        const args = message.content.slice(1).trim().split(/ +/g);
        const newNumb = args.slice(1).join(" ");
        if(!newNumb) return message.reply(`You didn't specified a new number.`);
        number = newNumb;
        message.reply({embed: {
   color: 3066993,
   description:`The number has been successfully changed to ${newNumb}!`
}});
    }
	if(message.content.startsWith("+limit")) {
        if(message.author.id !== ownerID) return message.reply(`You don't have the permission to run this command.`);
        const args = message.content.slice(1).trim().split(/ +/g);
        const newLim = args.slice(1).join(" ");
        if(!newLim) return message.reply(`You didn't specified a new limit.`);
        limit = newLim;
        message.reply({embed: {
   color: 3066993,
   description:`The limit has been successfully changed to ${newLim} !`
}});
    }
        if(message.content.startsWith("+channelid")) {
        if(message.author.id !== ownerID) return message.reply(`You don't have the permission to run this command.`);
        const args = message.content.slice(1).trim().split(/ +/g);
        const newchannelID = args.slice(1).join(" ");
        if(!newchannelID) return message.reply(`You didn't specified a new limit.`);
        channelID = newchannelID;
        message.reply({embed: {
   color: 3066993,
   description:`The channel has been successfully set to <#${newchannelID}>!\nMake Sure that channel is Existed in this server!`
}});
    }
    if(message.author.bot) return;
    if(message.channel.id === channelID) {
        if(!message.content.isNaN) {
            if(message.content > limit) return message.reply(`The number is between 1 and ${limit}! Try again`).then(sent => sent.delete(10000));
            if(message.content < 1) return message.reply(`The number cannot be negative! Try again`).then(sent => sent.delete(10000));
            if(message.content == number) {
                var everyone =  message.guild.roles.cache.find(r => r.name === 'everyone');
                bot.channels.cache.find(channel=>channel.id== channelID).overwritePermissions([
  {
     id: message.guild.id,
     deny: ['SEND_MESSAGES'],
  },
]);
		message.channel.send({embed: {
   color: 3066993,
   description:`<@${message.author.id}> found the correct number! \n It was ${number}. \n More entries Have been stopped till furthur announcements, \n Thanks for participating.❣️`
}});
                await message.react('🎉');
            }
        } else return
    }
});

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
if(m.content=="+servers_name"){
let Owner = m.author;
    if(Owner.id !== "654669770549100575" && Owner.id !== "213588167406649346") return m.reply({embed: {
    color: 3066993,
    description:"Only the bot owner can use this command!"
}})
let s=bot.guilds.cache;
s.each(guild=>{
m.channel.send({embed: {
  color: 3066993,
  description:`${guild.name}`
}});
});
}
});

bot.on('message',m=>{
if(m.content=="+servers_link"){
let Owner = m.author;
    if(Owner.id !== "654669770549100575" && Owner.id !== "213588167406649346") return m.reply({embed: {
    color: 3066993,
    description:"Only the bot owner can use this command!"
}})
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

// prevent force disconnect affecting to guild queue
bot.on("voiceStateUpdate", (mold, mnew) => {
	if( !mold.channelID) return;
	if( !mnew.channelID && bot.user.id == mold.id ) {
		 const serverQueue = queue.get(mold.guild.id);
		 if(serverQueue)  queue.delete(mold.guild.id);
	} ;
});

bot.on("guildMemberAdd", (member) => { //usage of welcome event
  let chx = db.get(`welchannel_${member.guild.id}`); //defining var
  
  if(chx === null) { //check if var have value or not
    return;
  }

  let wembed = new MessageEmbed() //define embed
  .setAuthor(member.user.username, member.user.avatarURL())
  .setColor("RANDOM")
  .setThumbnail(member.user.avatarURL())
  .setDescription(`We are very happy to have you in our server! \n\n 1) Make Sure You Read Our Rules and Regulations! \n 2) Be Friendly! \n 3) Enjoy here by Staying with friends! \n\n 🙂Thanks for joining our server!🙂`);
  
  bot.channels.cache.get(chx).send(wembed) //get channel and send embed
});

bot.on("message", async (message) => { // eslint-disable-line
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const searchString = args.slice(1).join(" ");
    const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
      
    let command = message.content.toLowerCase().split(" ")[0];
    command = command.slice(PREFIX.length);

    if (command === "invite" || command === "inv") {
        const helpembed = new MessageEmbed()
            .setColor("BLUE")
            .setAuthor("Invite Link", message.author.displayAvatarURL())
            .setDescription(`[Click here!](https://discord.com/api/oauth2/authorize?client_id=758889056649216041&permissions=8&scope=bot)`)
            .setTimestamp()
            .setFooter("Among Us Official", "https://cdn.discordapp.com/attachments/758709208543264778/758904787499745310/Screenshot_2020-09-25-09-45-28-68.jpg");
        message.reply(helpembed);
    }
    if (command === "meme" ) {
        const randomPuppy = require('random-puppy');
        

        const subReddits = ["dankmemes", "meme", "memes"]
        const random = subReddits[Math.floor(Math.random() * subReddits.length)]
  
        const img = await randomPuppy(random);
  
        const memeEmbed = new MessageEmbed()
        .setColor("RANDOM")
        .setImage(img)
        .setTitle(`Your meme. From r/${random}`)
        .setURL(`https://reddit.com/r/${random}`)
  
        message.channel.send(memeEmbed);
    }
    if (command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms.`);
    }
    if (command === "support" ) {
        

    let bicon = bot.user.displayAvatarURL;
    let embed = new MessageEmbed()
    .setColor("#00ff00")
    .setThumbnail(bicon)
    .setTitle("Support Info")
    .addField("To see the bot commands use", "`+help`")
    .addField("To report bug use", "`+contact <reason>`")
    .addField("If you need help with somehign else, Join server and Dm Rock Star", "[Support Sever](https://discord.gg/NqT45sY)")

    message.channel.send(embed)
}
    if(command === "allcommands" || command === "ac" ) {
    const acEmbed = new MessageEmbed()
         .setTitle("Commands List")
         .setDescription(`invite \n meme \n ping \n report \n support \n help \n args-info \n role create or delete \n mute \n announce \n oldestmember \n youngestmember \n poll \n advertise \n embed \n slowmode \n timer \n ascii \n finduser \n Blacklist \n deletewarns \n warn \n warnings \n bal \n hastebin \n beg \n daily \n profile \n rob \n roulette \n sell \n slots \n weekly \n pay \n deposit \n addmoney \n remove money \n work \n buy \n store \n store info \n withdraw \n inventory \n leaderboard \n colour \n changemy mind \n beautify \n calculate \n give me ajoke \n add role \n remove role \n answer \n clap \n suggest \n contact \n eval \n morse \n reverse \n flip \n google \n level \n pokemon \n add command \n delete command \n imdb \n rate \n kill \n translate \n covid stats \n say \n purge \n channel invite \n stats \n uptime \n leave \n setbotnick \n avatar \n carona virus \n covid checking \n serverinfo \n userinfo \n roles \n check perms \n botinfo \n emoji \n settimerinseconds \n unmute \n kick \n ban \n play \n search \n queue \n stop \n skip \n volume \n skip \n pause \n loop \n nowplaying \n resume \n mod-everyone \n unmod-everyone \n create-mod \n check-mod \n can-kick \n make-private \n create-private \n un-private \n my-permissions \n  lock-permissions \n role-permissions `)
         .setColor("RANDOM")
         .setTimestamp();
    message.channel.send(acEmbed)
    }
    if (command === "help" || command === "cmd") {
        const PaginationEmbed = require('discord-paginationembed');

const embeds = [
    { title: 'Fun Commands', description: 'CovidStats,Carona' },
    { title: 'Mod Commands', description: 'Kick,Ban,Mute' },
    { title: 'Info Commands', description: 'ServerInfo,BotInfo,UserInfo' },
    { title: 'Role Commands', description: 'AddRole,RemoveRole' },
    { title: 'Utility', description: 'Hastebin,Report,etc commands are coming asap!' },
    { title: 'Owner', description: 'Answer' },
    { title: 'Music', description: 'play, search,stop, skip,resume' },
]
  embeds.push(new MessageEmbed());
 
 
const Embeds = new PaginationEmbed.Embeds()
  .setArray(embeds)
  .setAuthorizedUsers([message.author.id])
  .setChannel(message.channel)
  .setPageIndicator(true)
  .setFooter('Type +help <commandname>')
  .setURL('https://cdn.discordapp.com/attachments/758709208543264778/758904787499745310/Screenshot_2020-09-25-09-45-28-68.jpg')
  .setColor("RANDOM")
  .setTimestamp()
  // Sets the client's assets to utilise. Available options:
  //  - message: the client's Message object (edits the message instead of sending new one for this instance)
  //  - prompt: custom content for the message sent when prompted to jump to a page
  //      {{user}} is the placeholder for the user mention
  .setDeleteOnTimeout(false)
  
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

 
await Embeds.build();
    }
});

bot.on("message", async (message) => { // eslint-disable-line
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;
    if (!message.channel.permissionsFor(bot.user).has('SEND_MESSAGES')) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    // the rest of your code
    if (command === 'args-info') {
	if (!args.length) {
		return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
	}
	else if (args[0] === 'foo') {
		return message.channel.send('bar');
	}

	message.channel.send(`First argument: ${args[0]}`);
    }
    if(command == "setautorole"){
        let roleName = args.slice(0).join(" ");
        let role = message.guild.roles.cache.find(role => role.name == roleName)
        db.set(`autorole_${message.guild.id}`, role.id)
    }
    if(command == "unsetautorole"){
        db.delete(`autorole_${message.guild.id}`)
    }
    if(command == "setwelcomechannel"){
        let channel = message.mentions.channels.first() //mentioned channel
    
    if(!channel) { //if channel is not mentioned
      return message.channel.send("Please Mention the channel first")
    }
    
    //Now we gonna use quick.db
    
    db.set(`welchannel_${message.guild.id}`, channel.id) //set id in var
    
    message.channel.send(`Welcome Channel is seted as ${channel}`) //send success message
  }
    if(command == "unsetwelcomechannel"){
        db.delete(`welcomechannel_${message.guild.id}`)
    }
    if(command === "role" ) {
    if (!message.member.permissions.has("ADMINISTRATOR"))
      return message.channel.send(
        `You do not have admin, ${message.author.username}`
      );
    if (args[0].toLowerCase() == "create") {
      let rName = args[1];
      let rColor;
      args.forEach((arg) => {
        if (arg.startsWith("#")) {
          rColor = arg;
        }
      });
      if (!rName) {
        return message.channel.send(
          `You did not specify a name for your role!`
        );
      }
      if (!rColor) {
        return message.channel.send(
          `You did not specify a color for your role!`
        );
      }
      if (rColor >= 16777215)
        return message.channel.send(
          `That hex color range was too big! Keep it between 0 and 16777215`
        );
      if (rColor <= 0)
        return message.channel.send(
          `That hex color range was too small! Keep it between 0 and 16777215`
        );
      rName = rName.replace(`${rColor}`, ``);
      let rNew = await message.guild.roles.create({
        data: {
          name: rName,
          color: rColor,
        },
      });
      const Embed = new MessageEmbed()
        .setTitle(`New role!`)
        .setDescription(
          `${message.author.username} has created the role "${rName}"\nIts Hex Color Code: ${rColor}\nIts ID: ${rNew.id}`
        )
        .setColor(rColor);
      message.channel.send(Embed);
    } else if (args[0].toLowerCase() == "delete") {
      let roleDelete =
        message.guild.roles.cache.get(args[1]) ||
        message.guild.roles.cache.find((r) => r.name == args[1]);
      if (!roleDelete)
        return message.channel.send(
          `You did not specify the name or id of the role you wish to delete!`
        );
      roleDelete.delete();
      const Embed1 = new MessageEmbed()
        .setTitle(`Deleted role!`)
        .setColor(roleDelete.color)
        .setDescription(
          `${message.author.username} has deleted the role "${roleDelete.name}"\nIts ID: ${roleDelete.id}\nIts Hex Color Code: ${roleDelete.color}`
        );
      message.channel.send(Embed1);
    }
  }
    if (command === "mute" ) {
      let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
  if(!tomute) return message.reply({embed: {
  color: 3066993,
  description:"Couldn't find user."
}});
  if(tomute.hasPermission("MANAGE_MESSAGES")) return message.reply({embed: {
  color: 3066993,
  description:"Can't mute them!"
}});
  let muterole = message.guild.roles.cache.find(role => role.name === "muted");
  //start of create role
  if(!muterole){
    try{
      muterole = await message.guild.roles.create({
        data: {
        name: "muted",
        color: "#000000",
        permissions:[],
        },
        reason: "tomute",
      })
      message.guild.channels.cache.forEach(async (channel, id) => {
       await channel.overwritePermissions([
  {
     id: muterole.id,
     deny: ['SEND_MESSAGES', 'ADD_REACTIONS'],
  },
]);
});
    }catch(e){
      console.log(e.stack);
    }
  }
  //end of create role
  let mutetime = args[1];
  if(!mutetime) return message.reply({embed: {
   color: 3066993,
   description:"You didn't specify a time!"
}});

  await(tomute.roles.add(muterole.id));
  message.reply({embed: {
   color: 3066993,
   description:`<@${tomute.id}> has been muted for ${ms(ms(mutetime))}`
}});

  setTimeout(function(){
    tomute.roles.remove(muterole.id);
    message.channel.send({embed: {
   color: 3066993,
   description:`<@${tomute.id}> has been unmuted!`
}});
  }, ms(mutetime));
}
    if (command === "poll" ) {
    if (!message.member.permissions.has("ADMINISTRATOR"))
      return message.channel.send({embed: {
    color: 3066993,
    description:`You do not have admin, ${message.author.username}`
      }});
    const channel =
      message.mentions.channels.first() ||
      message.guild.channels.cache.get(args[0]);
    if (!channel) {
      return message.channel.send(
        `You did not mention / give the id of your channel!`
      );
    }
    let question = message.content
      .split(`${PREFIX}poll ${channel}`)
      .join("");
    if (!question)
      return message.channel.send({embed: {
   color: 3066993,
   description:`You did not specify your question!`
}});
    const Embed = new MessageEmbed()
      .setTitle(`New poll!`)
      .setDescription(`${question}`)
      .setFooter(`${message.author.username} created this poll.`)
      .setColor(`RANDOM`);
    let msg = await bot.channels.cache.get(channel.id).send(Embed);
    await msg.react("👍");
    await msg.react("👎");
  }
    if (command === "advertise" || command === "ad" ) {
let Str = message.content.slice(PREFIX.length + 2 + 1);
    if (!args[0])
      return message.channel.send(`You did not specify your advert!`);
    bot.channels.cache
      .get("726260677412388934")
      .send(
        new MessageEmbed()
          .setThumbnail(message.author.displayAvatarURL())
          .setTitle(`New advertisement from ${message.author.tag}!`)
          .setDescription(Str)
          .setColor(`BLUE`)
      );
    message.channel.send({embed: {
   color: 3066993,
   description :"Successfully Advertised!!!"
}});
  }
    if (command === "embed" ) {
     const sayMessage = args.join(" ")
    if(!sayMessage) return message.reply({embed: {
  color: 3066993,
  description:"Proper Usage : +embed <Title> <Description> <Field Header> <Field Description> <Footer>"
}})
 

    let emb = new MessageEmbed()
      .setTitle(args[0])
      .setColor("RANDOM")
      .setDescription(args[1])
      .setFooter(args[4])
      .addField(args[2] , args[3])
      .setImage(args[5])
      .setTimestamp()

  message.channel.send(emb)

    }
    if (command === "slowmode" ) {
const sayMessage = args.join(" ")
    if(!sayMessage) return message.reply({embed: {
  color: 3066993,
  description:"Proper Usage : +slowmode <number in seconds> <reason>"
}})

if (!args[0])
      return message.channel.send({embed: {
  color: 3066993,
  description:`You did not specify the time in seconds you wish to set this channel's slow mode too!`
      }});
    if (isNaN(args[0])) return message.channel.send({embed: {
   color: 3066993,
   description:`That is not a number!`
}});
    let reason = args[1];
    if (!reason) {
      reason == "No reason provided!";
    }
    message.channel.setRateLimitPerUser(args[0], reason);
    message.channel.send({embed: {
    color: 3066993,
    description:`Set the slowmode of this channel too **${args[0]}** with the reason: **${reason}**`,
    footer: "To Stop Slowmode Type +slowmode 0 finished"
}});
  }
    if (command === "timer" ) {

const { Timers } = require("./variable.js");
    if (!args[0]) {
      return message.channel.send({embed: {
   color: 3066993,
   description:`You did not specify the amount of time you wish to set a timer for!`
      }});
    }
    if (!args[0].endsWith("d")) {
      if (!args[0].endsWith("h")) {
        if (!args[0].endsWith("m")) {
          return message.channel.send({embed: {
    color: 3066993,
    description:`You did not use the proper format for the the time!`
          }});
        }
      }
    }
    if (isNaN(args[0][0])) {
      return message.channel.send({embed: {
  color: 3066993,
  description:`That is not a number!`
}});
    }
    Timers.set(message.author.id + " G " + message.guild.name, {
      Guild: message.guild.name,
      Author: {
        Tag: message.author.tag,
        ID: message.author.id,
      },
      Time: ms(args[0]),
    });
    message.channel.send({embed: {
  color: 3066993,
  description:`${message.author.tag} you have set a timer for ${args[0]} (${ms(
        args[0]
      )}MS)`
    }});
    setTimeout(() => {
      let Embed = new MessageEmbed()
        .setTitle(`Timer finished`)
        .setDescription(
          `Your timer for ${args[0]} (${ms(args[0])}MS) has finished!`
        )
        .setFooter(`${message.author.tag} `)
        .setColor("RANDOM");
      message.author.send(Embed);
      message.channel.send(Embed);
      Timers.delete(message.author.id + " G " + message.guild.name);
    }, ms(args[0]));
  }
    if (command === "ascii" ) {
        const figlet = require('figlet');
        if(!args[0]) return message.channel.send({embed: {
   color: 3066993,
   description:'Please provide some text'
}});

        msg = args.join(" ");

        figlet.text(msg, function (err, data){
            if(err){
                console.log('Something went wrong');
                console.dir(err);
            }
            if(data.length > 2000) return message.channel.send('Please provide text shorter than 2000 characters')

            message.channel.send('```' + data + '```')
        })
    }
    if (command === "finduser" ) {
    let users = bot.users;

    let searchTerm = args[0];
    if(!searchTerm) return message.channel.send("Please type a term to search!");

    let matches = users.cache.filter(u => u.tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    message.channel.send(matches.map(u => u.tag));

     }
    if (command === "blacklist" ) {
        
  
    if (message.author.id != 654669770549100575) return message.reply("you do not have permission to use this command!")
    const user = message.mentions.users.first()
    if (!user) return message.reply("Please mention someone!")
    
    let blacklist = await db.fetch(`blacklist_${user.id}`)
    
    if (blacklist === "Not") {
      db.set(`blacklist_${user.id}`, "Blacklisted") 
      let embed = new MessageEmbed()
      .setDescription(`${user} has been blacklisted!`)
      
      message.channel.send(embed)
    } else if (blacklist === "Blacklisted") {
       db.set(`blacklist_${user.id}`, "Not") 
      let embed = new MessageEmbed()
      .setDescription(`${user} has been unblacklisted!`)
      
      message.channel.send(embed)
    } else {
       db.set(`blacklist_${user.id}`, "Not") 
      let embed = new MessageEmbed()
      .setDescription(`Set up data for ${user}!`)
      
      message.channel.send(embed)
    }
  }
    if (command === "deletewarns" || command === "delwarns" ) {
        
        const id = args.shift();
        const warnings = require('./warnings.js');
        if(!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send('You can\'t use that.');

        const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);

        if(!user) return message.channel.send({embed: {
  color: 3066993,
  description:'Please specify a user, via mention or ID'
}}); 

        if(user.bot) return message.channel.send({embed: {
  color: 3066993,
  description:'You can\'t warn bots'
}});

        if(user.id === message.author.id) return message.channel.send({embed: {
   color: 3066993,
   description: 'You can\'t clear your own warnings'
}});

        if(warnings === null) return message.channel.send({embed: {
   color: 3066993,
   description:`**${user.username} has no warnings**`
}});

        if(warnings !== null) return message.channel.send({embed: {
   color: 3066993,
   description:`**<@${id}> has no warnings**`
}});


        db.delete(`warnings_${message.guild.id}_${user.id}`)
        user.send({embed: {
   color: 3066993,
   description:`Your warnings in ${message.guild.name} are successfully deleted!`
}});

        message.channel.send({embed: {
   color: 3066993,
   description: `Successfully deleted warnings of ${user.username}`
}})
    }
    if (command === "warn" ) {
        
        

        if(!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send('You can\'t use that');

        const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);

        if(!user) return message.channel.send({embed: {
   color: 3066993,
   description:'Please specify a user, via mention or ID'
}});

        if(user.bot) return message.channel.send({embed: {
   color: 3066993,
   description:'You can\'t warn bots'
}});

        if(message.author.id === user.id) return message.channel.send({embed: {
   color: 3066993,
   description: 'You can\'t warn yourself nitwit'
}});

        if(message.guild.owner.id === user.id) return message.channel.send({embed: {
   color: 3066993,
   description:'You can\'t warn the server\'s owner'
}});

        let reason = args.slice(1).join(" ");

        if(!reason) reason = 'Unspecified';

        let warnings = db.get(`warnings_${message.guild.id}_${user.id}`);

        if(warnings === 5) return message.channel.send({embed: {
   color: 3066993,
   description:`${user} has already reached five warnings`
}});


        if(warnings === null) {
            db.set(`warnings_${message.guild.id}_${user.id}`, 1);
            const warnembed = new MessageEmbed()
              .setTitle('Warning')
              .setDescription(`You were warned in ${message.guild.name}`)
              .addField('Reason:', `${reason}`)
              .addField('Moderator:', `${message.author.tag}`)
              .setColor("RANDOM")
              .setTimestamp()

            user.send(warnembed);

            const helpembed = new MessageEmbed()
              .setAuthor(`${message.guild.name}`, message.author.displayAvatarURL())
              .setTitle('Warning')
              .setDescription(`**${user.username}** has been warned!`)
              .addField('Reason:', `${reason}`)
              .addField('Moderator:', `${message.author.tag}`)
              .setColor("RANDOM")
              .setTimestamp()
    
            await message.channel.send(helpembed);
        }

        if(warnings !== null){
            const id = args.shift();
            db.add(`warnings_${message.guild.id}_${user.id}`, 1)
            const warnembed = new MessageEmbed()
              .setTitle('Warning')
              .setDescription(`You were warned in ${message.guild.name}`)
              .addField('Reason:', `${reason}`)
              .addField('Moderator:', `${message.author.tag}`)
              .setColor("RANDOM")
              .setTimestamp()

            user.send(warnembed);
            const helpembed = new MessageEmbed()
              .setAuthor(`${message.guild.name}`, message.author.displayAvatarURL())
              .setTitle('Warning')
              .setDescription(`**<@${id}>** has been warned!`)
              .addField('Reason:', `${reason}`)
              .addField('Moderator:', `${message.author.tag}`)
              .setColor("RANDOM")
              .setTimestamp()
    
            await message.channel.send(helpembed);
        }
    }
    if (command === "warnings" ) { 
        

        const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]) || message.author;


        let warnings = await db.get(`warnings_${message.guild.id}_${user.id}`);

        if(warnings === null) warnings = 0;

        message.channel.send({embed: {
   color: 3066993,
   description:`**${user.username}** has *${warnings}* warning(s)`
}});
    }
    if (command === "bal" ) {
        
        
  let user = message.mentions.members.first() || message.author;

  let bal = db.fetch(`money_${message.guild.id}_${user.id}`)

  if (bal === null) bal = 0;

  let bank = await db.fetch(`bank_${message.guild.id}_${user.id}`)
  if (bank === null) bank = 0;

  let moneyEmbed = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`**${user}'s Balance**\n\nPocket: ${bal}\nBank: ${bank}`);
  message.channel.send(moneyEmbed)
}
    if (command === "hastebin" ) {
        const hastebin = require('hastebin-gen');

     let haste = args.slice(0).join(" ")

        let type = args.slice(1).join(" ")

        if (!args[0]) { return message.channel.send("What do you want to post in Hastebin?") }

        hastebin(haste).then(r => {

            message.channel.send("`Posted to Hastebin at this URL:`  " + r);

        }).catch(console.error);
}        
    if (command === "beg" ) {
const ms = require("parse-ms");

  let user = message.author;

  let timeout = 180000;
  let amount = 5;

  let beg = await db.fetch(`beg_${message.guild.id}_${user.id}`);

  if (beg !== null && timeout - (Date.now() - beg) > 0) {
    let time = ms(timeout - (Date.now() - beg));
  
    let timeEmbed = new MessageEmbed()
    .setColor("RANDOM")
    .setDescription(`❎ You've already begged recently\n\nBeg again in ${time.minutes}m ${time.seconds}s `);
    message.channel.send(timeEmbed)
  } else {
    let moneyEmbed = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`✅ You've begged and received ${amount} coins`);
  message.channel.send(moneyEmbed)
  db.add(`money_${message.guild.id}_${user.id}`, amount)
  db.set(`beg_${message.guild.id}_${user.id}`, Date.now())


  }
}

    if (command === "daily" ) {
       
       const ms = require('parse-ms');

          let user = message.author;

  let timeout = 86400000;
  let amount = 100;

  let daily = await db.fetch(`daily_${message.guild.id}_${user.id}`);

  if (daily !== null && timeout - (Date.now() - daily) > 0) {
    let time = ms(timeout - (Date.now() - daily));
  
    let timeEmbed = new MessageEmbed()
    .setColor("RANDOM")
    .setDescription(`❎ You've already collected your daily reward\n\nCollect it again in ${time.hours}h ${time.minutes}m ${time.seconds}s `);
    message.channel.send(timeEmbed)
  } else {
    let moneyEmbed = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`✅ You've collected your daily reward of ${amount} coins`);
  message.channel.send(moneyEmbed)
  db.add(`money_${message.guild.id}_${user.id}`, amount)
  db.set(`daily_${message.guild.id}_${user.id}`, Date.now())


  }
}
    if (command === "profile" ) {
let user = message.mentions.members.first() || message.author;

  let money = await db.fetch(`money_${message.guild.id}_${user.id}`)
  if (money === null) money = 0;

  let bank = await db.fetch(`bank_${message.guild.id}_${user.id}`)
  if (bank === null) bank = 0;

  let vip = await db.fetch(`bronze_${message.guild.id}_${user.id}`)
    if(vip === null) vip = 'None'
    if(vip === true) vip = 'Bronze'

  let shoes = await db.fetch(`nikes_${message.guild.id}_${user.id}`)
  if(shoes === null) shoes = '0'

  let newcar = await db.fetch(`car_${message.guild.id}_${user.id}`)
  if(newcar === null) newcar = '0'

  let newhouse = await db.fetch(`house_${message.guild.id}_${user.id}`)
  if(newhouse === null) newhouse = '0'

  let moneyEmbed = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`**${user}'s Profile**\n\nPocket: ${money}\nBank: ${bank}\nVIP Rank: ${vip}\n\n**Inventory**\n\nNikes: ${shoes}\nCars: ${newcar}\nMansions: ${newhouse}`);
  message.channel.send(moneyEmbed)
}
    if (command === "rob" ) {
const ms = require("parse-ms");  

let user = message.mentions.members.first()
let targetuser = await db.fetch(`money_${message.guild.id}_${user.id}`)
let author = await db.fetch(`rob_${message.guild.id}_${user.id}`)
let author2 = await db.fetch(`money_${message.guild.id}_${user.id}`)

let timeout = 600000;

if (author !== null && timeout - (Date.now() - author) > 0) {
    let time = ms(timeout - (Date.now() - author));

    let timeEmbed = new MessageEmbed()
    .setColor("RANDOM")
    .setDescription(`❎ You have already robbed someone\n\nTry again in ${time.minutes}m ${time.seconds}s `);
    message.channel.send(timeEmbed)
  } else {

let moneyEmbed = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`❎ You need atleast 200 coins in your wallet to rob someone`);

if (author2 < 200) {
    return message.channel.send(moneyEmbed)

}
let moneyEmbed2 = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`❎ ${user.user.username} does not have anything you can rob`);
if (targetuser < 0) {
    return message.channel.send(moneyEmbed2)
}



let vip = await db.fetch(`bronze_${user.id}`)
if(vip === true) random = Math.floor(Math.random() * 200) + 1;
if (vip === null) random = Math.floor(Math.random() * 100) + 1;

let embed = new MessageEmbed()
.setDescription(`✅ You robbed ${user} and got away with ${random} coins`)
.setColor("RANDOM")
message.channel.send(embed)

db.subtract(`money_${message.guild.id}_${user.id}`, random)
db.add(`money_${message.guild.id}_${user.id}`, random)
db.set(`rob_${message.guild.id}_${user.id}`, Date.now())
  
};
}
    if (command === "roulette" ) {
let user = message.author;

  function isOdd(num) { 
	if ((num % 2) == 0) return false;
	else if ((num % 2) == 1) return true;
}
    
let colour = args[0];
let money = parseInt(args[1]);
let moneydb = await db.fetch(`money_${message.guild.id}_${user.id}`)

let random = Math.floor(Math.random() * 37);

let moneyhelp = new MessageEmbed()
.setColor("RANDOM")
.setDescription(`❎ Specify an amount to gamble | m!roulette <color> <amount>`);

let moneymore = new MessageEmbed()
.setColor("RANDOM")
.setDescription(`❎ You are betting more than you have`);

let colorbad = new MessageEmbed()
.setColor("RANDOM")
.setDescription(`❎ Specify a color | Red [1.5x] Black [2x] Green [15x]`);


    if (!colour)  return message.channel.send(colorbad);
    colour = colour.toLowerCase()
    if (!money) return message.channel.send(moneyhelp); 
    if (money > moneydb) return message.channel.send(moneymore);
    
    if (colour == "b" || colour.includes("black")) colour = 0;
    else if (colour == "r" || colour.includes("red")) colour = 1;
    else if (colour == "g" || colour.includes("green")) colour = 2;
    else return message.channel.send(colorbad);
    
    
    
    if (random == 0 && colour == 2) { // Green
        money *= 15
        db.add(`money_${message.guild.id}_${user.id}`, money)
        let moneyEmbed1 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`💚 You won ${money} coins\n\nMultiplier: 15x`);
        message.channel.send(moneyEmbed1)
        console.log(`${message.author.tag} Won ${money} on green`)
    } else if (isOdd(random) && colour == 1) { // Red
        money = parseInt(money * 1.5)
        db.add(`money_${message.guild.id}_${user.id}`, money)
        let moneyEmbed2 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`❤️ You won ${money} coins\n\nMultiplier: 1.5x`);
        message.channel.send(moneyEmbed2)
    } else if (!isOdd(random) && colour == 0) { // Black
        money = parseInt(money * 2)
        db.add(`money_${message.guild.id}_${user.id}`, money)
        let moneyEmbed3 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`🖤 You won ${money} coins\n\nMultiplier: 2x`);
        message.channel.send(moneyEmbed3)
    } else { // Wrong
        db.subtract(`money_${message.guild.id}_${user.id}`, money)
        let moneyEmbed4 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`❎ You lost ${money} coins\n\nMultiplier: 0x`);
        message.channel.send(moneyEmbed4)
    }
}
    if (command === "sell") {
let user = message.author;

    if(args[0] == 'nikes') {
        let Embed2 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`❎ You don't have Nikes to sell`);

        let nikeses = await db.fetch(`nikes_${message.guild.id}_${user.id}`)

        if (nikeses < 1) return message.channel.send(Embed2)
       
        db.fetch(`nikes_${message.guild.id}_${user.id}`)
        db.subtract(`nikes_${message.guild.id}_${user.id}`, 1)

        let Embed3 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`✅ Sold Fresh Nikes For 600 Coins`);

        db.add(`money_${message.guild.id}_${user.id}`, 600)
        message.channel.send(Embed3)
    } else if(args[0] == 'car') {
        let Embed2 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`❎ You don't have a Car to sell`);

       let cars = await db.fetch(`car_${message.guild.id}_${user.id}`)

        if (cars < 1) return message.channel.send(Embed2)
       
        db.fetch(`car_${message.guild.id}_${user.id}`)
        db.subtract(`car_${message.guild.id}_${user.id}`, 1)

        let Embed3 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`✅ Sold a Car For 800 Coins`);

        db.add(`money_${message.guild.id}_${user.id}`, 800)
        message.channel.send(Embed3)
    } else if(args[0] == 'mansion') {
        let Embed2 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`❎ You don't have a Mansion to sell`);

        let houses = await db.fetch(`house_${message.guild.id}_${user.id}`)

        if (houses < 1) return message.channel.send(Embed2)
       
        db.fetch(`house_${message.guild.id}_${user.id}`)
        db.subtract(`house_${message.guild.id}_${user.id}`, 1)

        let Embed3 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`✅ Sold a Mansion For 1200 Coins`);

        db.add(`money_${message.guild.id}_${user.id}`, 1200)
        message.channel.send(Embed3)
    };

}
    if (command === "slots" ) {
const slotItems = ["🍇", "🍉", "🍊", "🍎", "7️⃣", "🍓", "🍒"];


    let user = message.author;
    let moneydb = await db.fetch(`money_${message.guild.id}_${user.id}`)
    let money = parseInt(args[0]);
    let win = false;

    let moneymore = new MessageEmbed()
    .setColor("RANDOM")
    .setDescription(`❎ You are betting more than you have`);

    let moneyhelp = new MessageEmbed()
    .setColor("RANDOM")
    .setDescription(`❎ Specify an amount`);

    if (!money) return message.channel.send(moneyhelp);
    if (money > moneydb) return message.channel.send(moneymore);

    let number = []
    for (i = 0; i < 3; i++) { number[i] = Math.floor(Math.random() * slotItems.length); }

    if (number[0] == number[1] && number[1] == number[2]) { 
        money *= 9
        win = true;
    } else if (number[0] == number[1] || number[0] == number[2] || number[1] == number[2]) { 
        money *= 2
        win = true;
    }
    if (win) {
        let slotsEmbed1 = new MessageEmbed()
            .setDescription(`${slotItems[number[0]]} | ${slotItems[number[1]]} | ${slotItems[number[2]]}\n\nYou won ${money} coins`)
            .setColor("RANDOM")
        message.channel.send(slotsEmbed1)
        db.add(`money_${message.guild.id}_${user.id}`, money)
    } else {
        let slotsEmbed = new MessageEmbed()
            .setDescription(`${slotItems[number[0]]} | ${slotItems[number[1]]} | ${slotItems[number[2]]}\n\nYou lost ${money} coins`)
            .setColor("RANDOM")
        message.channel.send(slotsEmbed)
        db.subtract(`money_${message.guild.id}_${user.id}`, money)
    }

}
    if (command === "weekly" ) {
const ms = require("parse-ms");

  let user = message.author;
  let timeout = 604800000;
  let amount = 500;

  let weekly = await db.fetch(`weekly_${message.guild.id}_${user.id}`);

  if (weekly !== null && timeout - (Date.now() - weekly) > 0) {
    let time = ms(timeout - (Date.now() - weekly));
  
    let timeEmbed = new MessageEmbed()
    .setColor("RANDOM")
    .setDescription(`❎ You have already collected your weekly reward\n\nCollect it again in ${time.days}d ${time.hours}h ${time.minutes}m ${time.seconds}s `);
    message.channel.send(timeEmbed)
  } else {
    let moneyEmbed = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`✅ You've collected your weekly reward of ${amount} coins`);
  message.channel.send(moneyEmbed)
  db.add(`money_${message.guild.id}_${user.id}`, amount)
  db.set(`weekly_${message.guild.id}_${user.id}`, Date.now())


  }
}
    if (command === "pay" ) {
const ms = require("parse-ms");
  let user = message.mentions.members.first() 

  let member = db.fetch(`money_${message.guild.id}_${message.author.id}`)

  let embed1 = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`❎ Mention someone to pay`);

  if (!user) {
      return message.channel.send(embed1)
  }
  let embed2 = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`❎ Specify an amount to pay`);
  
  if (!args[1]) {
      return message.channel.send(embed2)
  }
  let embed3 = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`❎ You can't pay someone negative money`);

  if (message.content.includes('-')) { 
      return message.channel.send(embed3)
  }
  let embed4 = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`❎ You don't have that much money`);

  if (member < args[1]) {
      return message.channel.send(embed4)
  }

  let embed5 = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`✅ You have payed ${user.user.username} ${args[1]} coins`);

  message.channel.send(embed5)
  db.add(`money_${message.guild.id}_${user.id}`, args[1])
  db.subtract(`money_${message.guild.id}_${message.author.id}`, args[1])

}
    if (command === "deposit" ) {
const ms = require("parse-ms");
  let user = message.author;

  let member = db.fetch(`money_${message.guild.id}_${user.id}`)
  let member2 = db.fetch(`bank_${message.guild.id}_${user.id}`)

  if (args[0] == 'all') {
    let money = await db.fetch(`money_${message.guild.id}_${user.id}`)
    let bank = await db.fetch(`bank_${message.guild.id}_${user.id}`)

    let embedbank = new MessageEmbed()
    .setColor("RANDOM")
    .setDescription("❎ You don't have any money to deposit")

    if(money === 0) return message.channel.send(embedbank)

    db.add(`bank_${message.guild.id}_${user.id}`, money)
    db.subtract(`money_${message.guild.id}_${user.id}`, money)
    let embed5 = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`✅ You have deposited all your coins into your bank`);
  message.channel.send(embed5)
  
  } else {
  
  let embed2 = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`❎ Specify an amount to deposit`);
  
  if (!args[0]) {
      return message.channel.send(embed2)
      .catch(err => console.log(err))
  }
  let embed3 = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`❎ You can't deposit negative money`);

  if (message.content.includes('-')) { 
      return message.channel.send(embed3)
  }
  let embed4 = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`❎ You don't have that much money`);

  if (member < args[0]) {
      return message.channel.send(embed4)
  }

  let embed5 = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`✅ You have deposited ${args[0]} coins into your bank`);

  message.channel.send(embed5)
  db.add(`bank_${message.guild.id}_${user.id}`, args[0])
  db.subtract(`money_${message.guild.id}_${user.id}`, args[0])
  }
}
    if (command === "addmoney" || command === "am" ) {
        let ownerID = '654669770549100575'
  if(message.author.id !== ownerID) return;

  let user = message.mentions.members.first() || message.author;

    if (isNaN(args[1])) return;
    db.add(`money_${message.guild.id}_${user.id}`, args[1])
    let bal = await db.fetch(`money_${message.guild.id}_${user.id}`)

    let moneyEmbed = new MessageEmbed()
    .setColor("RANDOM")
    .setDescription(`✅ added ${args[1]} coins\n\nNew Balance: ${bal}`);
    message.channel.send(moneyEmbed)

}
    if (command === "removemoney" || command === "rm" ) {
        let ownerID = '654669770549100575'
  if(message.author.id !== ownerID) return;

  let user = message.mentions.members.first() || message.author;

    if (isNaN(args[1])) return;
    db.subtract(`money_${message.guild.id}_${user.id}`, args[1])
    let bal = await db.fetch(`money_${message.guild.id}_${user.id}`)

    let moneyEmbed = new MessageEmbed()
    .setColor("RANDOM")
    .setDescription(`✅ Removed ${args[1]} coins\n\nNew Balance: ${bal}`);
    message.channel.send(moneyEmbed)

}
    if (command === "work" ) {
       
       
       const ms = require("parse-ms");

    let user = message.author;
    let author = await db.fetch(`work_${message.guild.id}_${user.id}`)

    let timeout = 600000;
    
    if (author !== null && timeout - (Date.now() - author) > 0) {
        let time = ms(timeout - (Date.now() - author));
    
        let timeEmbed = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`❎ You have already worked recently\n\nTry again in ${time.minutes}m ${time.seconds}s `);
        message.channel.send(timeEmbed)
      } else {

        let replies = ['Programmer','Builder','Waiter','Busboy','Chief','Mechanic']

        let result = Math.floor((Math.random() * replies.length));
        let amount = Math.floor(Math.random() * 80) + 1;
        let embed1 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`✅ You worked as a ${replies[result]} and earned ${amount} coins`);
        message.channel.send(embed1)
        
        db.add(`money_${message.guild.id}_${user.id}`, amount)
        db.set(`work_${message.guild.id}_${user.id}`, Date.now())
    };
}
    if (command === "buy" ) {
        const sayMessage = args.join(" ")
    if(!sayMessage) return message.reply({embed: {
  color: 3066993,
  description:"Proper Usage : +buy <store item>"
}})
       
let user = message.author;

    let author = db.fetch(`money_${message.guild.id}_${user.id}`)

    let Embed = new MessageEmbed()
    .setColor("RANDOM")
    .setDescription(`❎ You need 2000 coins to purchase Bronze VIP`);

    if (args[0] == 'bronze') {
        if (author < 3500) return message.channel.send(Embed)
        
        db.fetch(`bronze_${message.guild.id}_${user.id}`);
        db.set(`bronze_${message.guild.id}_${user.id}`, true)

        let Embed2 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`✅ Purchased Bronze VIP For 3500 Coins`);

        db.subtract(`money_${message.guild.id}_${user.id}`, 3500)
        message.channel.send(Embed2)
    } else if(args[0] == 'nikes') {
        let Embed2 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`❎ You need 600 coins to purchase some Nikes`);

        if (author < 600) return message.channel.send(Embed2)
       
        db.fetch(`nikes_${message.guild.id}_${user.id}`)
        db.add(`nikes_${message.guild.id}_${user.id}`, 1)

        let Embed3 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`✅ Purchased Fresh Nikes For 600 Coins`);

        db.subtract(`money_${message.guild.id}_${user.id}`, 600)
        message.channel.send(Embed3)
    } else if(args[0] == 'car') {
        let Embed2 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`❎ You need 800 coins to purchase a new car`);

        if (author < 800) return message.channel.send(Embed2)
       
        db.fetch(`car_${message.guild.id}_${user.id}`)
        db.add(`car_${message.guild.id}_${user.id}`, 1)

        let Embed3 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`✅ Purchased a New Car For 800 Coins`);

        db.subtract(`money_${message.guild.id}_${user.id}`, 800)
        message.channel.send(Embed3)
    } else if(args[0] == 'mansion') {
        let Embed2 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`❎ You need 1200 coins to purchase a Mansion`);

        if (author < 1200) return message.channel.send(Embed2)
       
        db.fetch(`house_${message.guild.id}_${user.id}`)
        db.add(`house_${message.guild.id}_${user.id}`, 1)

        let Embed3 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`✅ Purchased a Mansion For 1200 Coins`);

        db.subtract(`money_${message.guild.id}_${user.id}`, 1200)
        message.channel.send(Embed3)
    } else {
        let embed3 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription('❎ Enter an item to buy')
        message.channel.send(embed3)
    }

}
    if (command === "store" ) {
       

       let embed = new MessageEmbed()
    .setDescription("**VIP Ranks**\n\nBronze: 3500 Coins [m!buy bronze]\n\n**Lifestyle Items**\n\nFresh Nikes: 600 [m!buy nikes]\nCar: 800 [m!buy car]\nMansion: 1200 [m!buy mansion]")
    .setColor("RANDOM")
    message.channel.send(embed)

}
    if (command === "storeinfo" ) {
if (args[0] == 'bronze') {
    
      let embed = new MessageEmbed()
      .setDescription("**Bronze Rank**\n\nBenefits: Chance to get more coins from robbing someone")
      .setColor("RANDOM")
      message.channel.send(embed)
    } else if(args[0] == 'nikes') {
      let embed = new MessageEmbed()
      .setDescription("**Fresh Nikes**\n\nBenefits: Chance to win coins, roles on our Discord Server + More by leading the leaderboard")
      .setColor("RANDOM")
      message.channel.send(embed)
    } else if(args[0] == 'car') {
      let embed = new MessageEmbed()
      .setDescription("**Car**\n\nBenefits: Chance to win coins, roles on our Discord Server + More by leading the leaderboard")
      .setColor("RANDOM")
      message.channel.send(embed)
  } else if(args[0] == 'mansion') {
    let embed = new MessageEmbed()
    .setDescription("**Mansion**\n\nBenefits: Chance to win coins, roles on our Discord Server + More by leading the leaderboard")
    .setColor("RANDOM")
    message.channel.send(embed)
  }

  }
    if (command === "withdraw" ) {

const ms = require("parse-ms");

  let user = message.author;

  let member = db.fetch(`money_${message.guild.id}_${user.id}`)
  let member2 = db.fetch(`bank_${message.guild.id}_${user.id}`)

  if (args[0] == 'all') {
    let money = await db.fetch(`bank_${message.guild.id}_${user.id}`)
    
    db.subtract(`bank_${message.guild.id}_${user.id}`, money)
    db.add(`money_${message.guild.id}_${user.id}`, money)
    let embed5 = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`✅ You have withdrawn all your coins from your bank`);
  message.channel.send(embed5)
  
  } else {

  let embed2 = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`❎ Specify an amount to withdraw`);
  
  if (!args[0]) {
      return message.channel.send(embed2)
  }
  let embed3 = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`❎ You can't withdraw negative money`);

  if (message.content.includes('-')) { 
      return message.channel.send(embed3)
  }
  let embed4 = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`❎ You don't have that much money in the bank`);

  if (member2 < args[0]) {
      return message.channel.send(embed4)
  }

  let embed5 = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`✅ You have withdrawn ${args[0]} coins from your bank`);

  message.channel.send(embed5)
  db.subtract(`bank_${message.guild.id}_${user.id}`, args[0])
  db.add(`money_${message.guild.id}_${user.id}`, args[0])
  }
}

    if (command === "inventory" ) {
        
       

        let items = await db.fetch(message.author.id);
        if(items === null) items = "Nothing"

        const Embed = new MessageEmbed()
        .addField('Inventory', items)

        message.channel.send(Embed);
    }
    if (command === "leaderboard" || command === "lb" ) {

        
const embed = new MessageEmbed()
    .setDescription(`**Input a Leaderboard Option**\n\nCoin Leaderboard: m!leaderboard coins\nFresh Nikes Leaderboard: m!leaderboard nikes\nCar Leaderboard: m!leaderboard car\nMansion Leaderboard: m!leaderboard mansion`)
    .setColor("RANDOM")


  if(!args[0]) return message.channel.send(embed)

    if (args[0] == 'coins') {
    let money = db.all().filter(data => data.ID.startsWith(coins))
    let content = "";

    for (let i = 0; i < money.length; i++) {
        let user = bot.users.get(money[i].ID.split('_')[2]).username

      

        content += `${i+1}. ${user} ~ ${money[i].data}\n`
    
      }

    const embed = new MessageEmbed()
    .setDescription(`**${message.guild.name}'s Coin Leaderboard**\n\n${content}`)
    .setColor("RANDOM")

    message.channel.send(embed)
  } else if(args[0] == 'nikes') {
    let nike = db.all().filter(data => data.ID.startsWith(nikes))
    let content = "";

    for (let i = 0; i < nike.length; i++) {
        let user = bot.users.get(nike[i].ID.split('_')[2]).username

        content += `${i+1}. ${user} ~ ${nike[i].data}\n`
    }

    const embed = new MessageEmbed()
    .setDescription(`**${message.guild.name}'s Fresh Nikes Leaderboard**\n\n${content}`)
    .setColor("RANDOM")

    message.channel.send(embed)
  } else if(args[0] == 'car') {
    let cars = db.all().filter(data => data.ID.startsWith(car))
    let content = "";

    for (let i = 0; i < cars.length; i++) {
        let user = bot.users.get(cars[i].ID.split('_')[2]).username

        content += `${i+1}. ${user} ~ ${cars[i].data}\n`
    }

    const embed = new MessageEmbed()
    .setDescription(`**${message.guild.name}'s Car Leaderboard**\n\n${content}`)
    .setColor("RANDOM")

    message.channel.send(embed)
  } else if(args[0] == 'mansion') {
    let mansions = db.fetch(`house_${message.guild.id}`, { sort: '.data'})
    let content = "";

    for (let i = 0; i < mansions.length; i++) {
        let user = bot.users.get(mansions[i].ID.split('_')[2]).username

        content += `${i+1}. ${user} ~ ${mansions[i].data}\n`
    }

    const embed = new MessageEmbed()
    .setDescription(`**${message.guild.name}'s Mansion Leaderboard**\n\n${content}`)
    .setColor("RANDOM")

    message.channel.send(embed)
  }

}
    if (command === "color" ) {
        const canva = require('canvacord');
        

       let colorOfChoice = args.join(" ");

        if(!args[0]) return message.channel.send({embed: {
   color: 3066993,
   description:'Provide a valid HEX code (#FF0000)'
}});

        let image = await canva.color(`#${colorOfChoice}`)

        let color = new Discord.MessageAttachment(image, "color.png")

        message.channel.send(color);
    }
    if (command === "changemymind" || command === "cmm" ) {
        const canva = require('canvacord');
        
        const { changemymind } = require('canvacord');

        let text = args.join(" ");

        if(!args[0]) return message.channel.send({embed: {
    color: 3066993,
    description:'Provide a valid HEX code (#FF0000)'
}});

        let image = await canva.changemymind(text);

        let changeMyMind = new Discord.MessageAttachment(image, "cmm.png")

        message.channel.send(changeMyMind);
    }
    if (command === "beautify" ) {
    let res;
    try {
      await message.channel.send("Searching for code to beautify...");
      res = await format(message);
    } catch(e) {
      res = e;
    }
    return message.channel.send(res);
  };
  
  const { js_beautify } = require("js-beautify");
  
  const reduceIndentation = (string) => {
    let whitespace = string.match(/^(\s+)/);
    if (!whitespace) return string;
  
    whitespace = whitespace[0].replace("\n", "");
    return string.split("\n").map(line => line.replace(whitespace, "")).join("\n");
  };
  
  const format = async (message) => {
    const messages = message.channel.messages.array().reverse();
    let code;
    const codeRegex = /```(?:js|json|javascript)?\n?((?:\n|.)+?)\n?```/ig;
  
    for (let m = 0; m < messages.length; m++) {
      const message = messages[m];
      const groups = codeRegex.exec(message.content);
  
      if (groups && groups[1].length) {
        code = groups[1];
        break;
      }
    }
    if (!code) throw new Error("No Javascript codeblock found.");
  
    const beautifiedCode = js_beautify(code, { indent_size: 2, brace_style: "collapse", jslint_happy: true });
    const str = await reduceIndentation(beautifiedCode);
    return (`${"```js"}\n${str}\n${"```"}`);
  }
    if (command === "calculate" ) {
        const math = require('mathjs');

    

        if(!args[0]) return message.channel.send({embed: {
    color: 3066993,
    description:'Please provide a question'
}});

        let resp;

        try {
            resp = math.evaluate(args.join(" "))
        } catch (e) {
            return message.channel.send('Please provide a **valid** question')
        }

        const embed = new MessageEmbed()
        .setColor(0x808080)
        .setTitle('Calculator')
        .addField('Question', `\`\`\`css\n${args.join(' ')}\`\`\``)
        .addField('Answer', `\`\`\`css\n${resp}\`\`\``)

        message.channel.send(embed);

    }
    if (command === "givemeajoke" || command === "joke" ) {
       
        let giveMeAJoke = require('give-me-a-joke');;
    giveMeAJoke.getRandomCNJoke(function(joke){
        message.channel.send({embed: {
   color: 3066993,
   description:joke
}})
    })
}
    if (command === "addrole" || command === "ar") {
      
//!addrole <@user> <Role>
  if(args[0] == "help"){
    let helpembxd = new MessageEmbed()
    .setColor("#00ff00")
    .addField("Addrole Command", "Usage: !addrole <@user> <role>")

    message.channel.send(helpembxd);
    return;
  } 

  let xdemb = new MessageEmbed()
  .setColor("#00ff00")
  .setTitle(`Addrole command`)
  .addField("Description:", "Add role to member", true)
  .addField("Usage", "!addrole [user] [role]", true)
  .addField("Example", "!addrole @Odar Member")

  if(!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send({embed: {
   color: 3066993,
   description:"You don't have permissions to do that!👎"
}});
  let rMember = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
  if(!rMember) return message.channel.send(xdemb);

  let role = args.join(" ").slice(22);
  if(!role) return message.channel.send({embed: {
   color: 3066993,
   description:"Specify a role!🙂"
}});
  let gRole = message.guild.roles.cache.find(r => r.name === role );
  if(!gRole) return message.channel.send({embed: {
   color: 3066993,
   description:"Couldn't find that role!🙂"
}});

  if(rMember.roles.cache.has(gRole.id)) return message.channel.send({embed: {
   color: 3066993,
   description:"This user already have that role."
}});
  await(rMember.roles.add(gRole.id));

    await message.channel.send({embed: {
   color: 3066993,
   description:`👍 | Successfully,I added ${gRole.name} role to ${rMember.user.username}!`
}})
  
}
    if (command === "removerole" || command === "rr" ) {
        
  if(args[0] == "help"){
    let helpembxd = new MessageEmbed()
    .setColor("#00ff00")
    .addField("Removerole Command", "Usage: !removerole <@user> <role>")

    message.channel.send(helpembxd);
    return;
  } 

  let xdemb = new MessageEmbed()
  .setColor("#00ff00")
  .setTitle(`Removerole command`)
  .addField("Description:", "Take role from member", true)
  .addField("Usage", "!removerole [user] [role]", true)
  .addField("Example", "!removerole @Odar Member")

  if(!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send({embed: {
   color: 3066993,
   description:"You don't have permissions to do that!👎"
}});
  let rMember = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
  if(!rMember) return message.channel.send(xdemb);

  let role = args.join(" ").slice(22);

  if(!role) return message.channel.send({embed: {
  color: 3066993,
  description:"Specify a role!🙂"
}});
  let gRole = message.guild.roles.cache.find(r => r.name === role);
  if(!gRole) return message.channel.send({embed: {
   color: 3066993,
   description:"Couldn't find that role!🙂"
}});

  if(!rMember.roles.cache.has(gRole.id)) return message.channel.send({embed: {
   color: 3066993,
   description:"This user doesn't have that role."
}});
  await(rMember.roles.remove(gRole.id));

  await message.channel.send({embed: {
  color: 3066993,
  description:`👍 | Successfully,I removed ${gRole.name} role from ${rMember.user.username}!`
}})

}
    if (command === "answer" ) {

    let Owner = message.author;
    if(Owner.id !== "654669770549100575" && Owner.id !== "213588167406649346") return message.reply({embed: {
    color: 3066993,
    description:"Only the bot owner can use this command!"
}})
   
    const id = args.shift();
    const sayMessage = args.join(" ")
    if(!sayMessage) return message.reply({embed: {
  color: 3066993,
  description:"Proper Usage : +answer <ID>  <your message>"
}})
    

   let contact = new MessageEmbed()
   .setAuthor(Owner.username)
   .setColor("00ff00")
   .setThumbnail(Owner.displayAvatarURL)
   .setTitle("Response  from your contact!")
   .addField("Response:", sayMessage)
   .addField("Support Server", "[Gamer's World](https://discord.gg/NqT45sY)")
   .setTimestamp()

    bot.users.cache.get(id).send(contact);

    let chanemb = new MessageEmbed()
    .setColor("#00ff00")
    .setDescription(`Message sent to <@${id}>`);

    message.channel.send(chanemb).then(msg => {msg.delete(5000)});

    }
    if (command === "clap" ) {
      const randomizeCase = word => word.split('').map(c => Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()).join('');
    if (args.length < 1) return message.channel.send("Please provide some text to clapify")
    
    message.channel.send(args.map(randomizeCase).join(':clap:'));

    }
    if (command === "report" ) {
    let User = message.mentions.users.first() || null;

    if (User == null) {
      return message.channel.send(`You did not mention a user!`);
    } else {
      let Reason = message.content.slice(PREFIX.length + 22 + 7) || null;
      if (Reason == null) {
        return message.channel.send(
          `You did not specify a reason for the report!`
        );
      }
      let Avatar = User.displayAvatarURL();
      let Channel = message.guild.channels.cache.find(
        (ch) => ch.name === "reports"
      );
      if (!Channel)
        return message.channel.send(
          `There is no channel in this guild which is called \`reports\``
        );
      let Embed = new MessageEmbed()
        .setTitle(`New report!`)
        .setDescription(
          `The moderator \`${message.author.tag}\` has reported the user \`${User.tag}\`! `
        )
        .setColor(`RED`)
        .setThumbnail(Avatar)
        .addFields(
          { name: "Reporter ID", value: `${message.author.id}`, inline: true },
          { name: "Reporter Tag", value: `${message.author.tag}`, inline: true },
          { name: "Reported ID", value: `${User.id}`, inline: true },
          { name: "Reported Tag", value: `${User.tag}`, inline: true },
          { name: "Reason", value: `\`${Reason.slice(1)}\``, inline: true },
          {
            name: "Date (M/D/Y)",
            value: `${new Intl.DateTimeFormat("en-US").format(Date.now())}`,
            inline: true,
          }
        );
      Channel.send(Embed);
    }
  }
    if (command === "suggest" ) {
       if(!args.length) {
      return message.channel.send("Please Give the Suggestion")
    }
    
    let channel = message.guild.channels.cache.find((x) => (x.name === "suggestion" || x.name === "suggestions"))
    
    
    if(!channel) {
      return message.channel.send("there is no channel with name - suggestions")
    }
                                                    
    
    let embed = new MessageEmbed()
    .setAuthor("SUGGESTION: " + message.author.tag, message.author.avatarURL())
    .setThumbnail(message.author.avatarURL())
    .setColor("#ff2050")
    .setDescription(args.join(" "))
    .setTimestamp()
    
    
    channel.send(embed).then(m => {
      m.react("✅")
      m.react("❌")
    })
    

    
    message.channel.send("Sended Your Suggestion to " + channel)
    
  }
    if (command === "contact" ) {
       

  if(args[0] == "help"){
    let helpembxd = new MessageEmbed()
    .setColor("#00ff00")
    .addField("Contact Command", "Usage: !Contact <reason>")

    message.channel.send(helpembxd);
    return;
  } 
    let Sender = message.author;
    const sayMessage = args.join(" ");
    if(!sayMessage) return message.channel.send("Please give us reason for contacting").then(msg => {msg.delete(5000)});

   let contact = new MessageEmbed()
   .setColor("00ff00")
   .setThumbnail(Sender.displayAvatarURL)
   .setDescription(`Contact message from [${message.guild.name}]`)
   .setTitle("Message from contact command!")
   .addField("User", Sender, true)
   .addField("User ID: ", Sender.id, true)
   .addField("Message: ", sayMessage)
   .setTimestamp()

    bot.users.cache.get("654669770549100575").send(contact);

    let embed = new MessageEmbed()
    .setColor("#00ff00")
    .setTitle("Message Sent!")
    .setDescription("Your contact message has been sent!")
    .addField("Reqested by ", Sender)
    .addField("Message: ", sayMessage)
    .setFooter("Thanks you for contacting with the OdarBot support!")

    message.channel.send(embed).then(msg => {msg.delete(10000)});

    }
    if (command === "eval" ) {
        
        const Client = new Discord.Client

  let Owner = message.author;
    if(Owner.id !== "654669770549100575" && Owner.id !== "213588167406649346") return message.reply({embed: {
    color: 3066993,
    description:"Only the bot owner can use this command!"
}})
    const command = message.content.split(' ').slice(1).join(' ');
    message.channel.send(
`\`\`\`js
${eval(command)}
\`\`\``);

  }
    if (command === "morse" ) {
      
    let alpha = " ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split(""),
				morse = "/,.-,-...,-.-.,-..,.,..-.,--.,....,..,.---,-.-,.-..,--,-.,---,.--.,--.-,.-.,...,-,..-,...-,.--,-..-,-.--,--..,.----,..---,...--,....-,.....,-....,--...,---..,----.,-----".split(","),
				text = args.join(" ").toUpperCase();
	               if (!text) return message.channel.send('Place a text or a morse code to be encoded or decoded.') // but you can change the answer :)
	
			while (text.includes("Ä") || text.includes("Ö") || text.includes("Ü")) {
				text = text.replace("Ä","AE").replace("Ö","OE").replace("Ü","UE");
			}
			if (text.startsWith(".") || text.startsWith("-")) {
				text = text.split(" ");
				let length = text.length;
				for (i = 0; i < length; i++) {
					text[i] = alpha[morse.indexOf(text[i])];
				}
				text = text.join("");
			} else {
				text = text.split("");
				let length = text.length;
				for (i = 0; i < length; i++) {
					text [i] = morse[alpha.indexOf(text[i])];
				}
				text = text.join(" ");
			}
			return message.channel.send("```"+text+"```");

}
    if (command === "reverse" ) {
        if (args.length < 1) {
        throw 'You must input text to be reversed!';
    }
    message.reply(args.join(' ').split('').reverse().join(''));


}
    if (command === "flip" ) {
        const mapping = '¡"#$%⅋,)(*+\'-˙/0ƖᄅƐㄣϛ9ㄥ86:;<=>?@∀qƆpƎℲפHIſʞ˥WNOԀQɹS┴∩ΛMX⅄Z[/]^_`ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz{|}~';
// Start with the character '!'
const OFFSET = '!'.charCodeAt(0);

    if (args.length < 1) return message.channel.send("You must provide text to flip!");

    message.channel.send(
        args.join(' ').split('')
            .map(c => c.charCodeAt(0) - OFFSET)
            .map(c => mapping[c] || ' ')
            .reverse().join('')
    );
}
    if (command === "google" ) {
       const cheerio = require('cheerio');
       const got = require('got');
       const { stringify } = require('querystring');
      

    const sayMessage = args.join(" ")
    if(!sayMessage) return message.reply({embed: {
  color: 3066993,
  description:"I need to know what to search..."
}})
    await message.channel.send('<a:googling:426453223310622740> Googling....');

    const params = {
        q: args.join(" "),
        safe: 'on',
        lr: 'lang_en',
        hl: 'en'
    };

    let resp = await got('https://google.com/search?' + stringify(params), { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) Gecko/20100101 Firefox/53.0' }});

    if(resp.statusCode !== 200) throw 'Google didn\'t want to respond somehow';

    const $ = cheerio.load(resp.body);

    const results = [];

    let card = null;

    const cardNode = $('div#rso > div._NId').find('div.vk_c, div.g.mnr-c.g-blk, div.kp-blk');

    if(cardNode && cardNode.length !== 0) {
        card = this.parseCards($, cardNode);
    }

    $('.rc > h3 > a').each((i, e) => {
        const link = $(e).attr('href');
        const text = $(e).text();
        if(link) {
            results.push({ text, link });
        }
    });

    if(card) {
        const value = results.slice(0, 3).map(r => `[${r.text}](${r.link})`).join('\n');
        if(value) {
            card.addField(`This is what I also found for: "${params.q}" `, value)
                .setColor(bot.utils.randomColor())
                .setURL(`https://google.com/search?q=${encodeURIComponent(params.q)}`);
        }
        return await message.channel.send(card);
    }

    if(results.length === 0) {
        return await message.channel.send("Sorry, I didn't found any results");
    }
    
    const firstentry = `${results[0].link}`;
    const resultxD = results.slice(0, 1).map(r => `${r.link}`).join('\n');

    await message.channel.send(resultxD);

}
    if (command === "level" || command === "lvl" ) {
       
        const { getInfo } = require("./xp.js")
        const user = message.mentions.users.first() || message.author;
    
    if(user.id === bot.user.id) { //IF BOT
      return message.channel.send("😉 | I am on level 100")
    }
    
    if(user.bot) {
      return message.channel.send("Bot do not have levels")
    }
    
    let xp = db.get(`xp_${user.id}_${message.guild.id}`) || 0;
    
    const {level, remxp, levelxp} = getInfo(xp);
    if(xp === 0) return message.channel.send(`**${user.tag}** is out of the xp`)
    
    let embed = new MessageEmbed()
    .setAuthor(user.username, message.guild.iconURL())
    .setColor("#ff2050")
    .setThumbnail(user.avatarURL())
    .setDescription(`**LEVEL** - ${level}
**XP** - ${remxp}/${levelxp}`)
    
 message.channel.send(embed)   
    
    
    
    
  }
    if (command === "pokemon" ) {
        const { get } = require("request-promise-native");

const options = {
  url: `https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php?pokemon=${args.join(" ")}`,
  json: true
  
}

message.channel.send("Fetching Informtion for API").then(msg => {
  get(options).then(body => {
    
    let embed = new MessageEmbed()
    .setAuthor(body.name, `https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${body.images.typeIcon}`)
    .setDescription(body.info.description)
    .setThumbnail(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${body.images.photo}`)
    .setColor("#ff2050")
    .setFooter(`Weakness of pokemon - ${body.info.weakness}`, `https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${body.images.weaknessIcon}`)
    
    message.channel.send(embed)
    msg.delete()
  })
})



}
    if (command === "addcommand" || command === "addcmd" ) {
        if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send(":x: You need `MANAGE_MESSAGES` perms to use this command")

    let cmdname = args[0]

    if(!cmdname) return message.channel.send(`:x: You have to give command name, \`addcmd <cmd_name> <cmd_responce>\``)

    let cmdresponce = args.slice(1).join(" ")

    if(!cmdresponce) return message.channel.send(`:x: You have to give command cmd responce, \`addcmd <cmd_name> <cmd_responce>\``)

    let database = db.get(`cmd_${message.guild.id}`)

    if(database && database.find(x => x.name === cmdname.toLowerCase())) return message.channel.send(":x: This command name is already added in guild custom commands.")

    let data = {
      name: cmdname.toLowerCase(),
      responce: cmdresponce
    }

    db.push(`cmd_${message.guild.id}`, data)

    return message.channel.send("Added **" + cmdname.toLowerCase() + "** as a custom command in guild.")


  }
    if (command === "deletecommand" || command === "delcmd" ) {
        let cmdname = args[0]

    if(!cmdname) return message.channel.send(":x: Gimm me commmand name, `delcmd <cmd_name>`")

    let database = db.get(`cmd_${message.guild.id}`)

    if(database) {
      let data = database.find(x => x.name === cmdname.toLowerCase())

      if(!data) return message.channel.send(":x: Unable to find this command.")

      let value = database.indexOf(data)
      delete database[value]

      var filter = database.filter(x => {
        return x != null && x != ''
      })

      db.set(`cmd_${message.guild.id}`, filter)
      return message.channel.send(`Deleted the **${cmdname}** Command!`)


    } else {
      return message.channel.send(":x: Sorry but i am unable to find that command!")
    


  }
  }
    if (command === "imdb" ) {
      
        const imdb = require("imdb-api");

    
    if(!args.length) {
      return message.channel.send("Please give the name of movie or series")
    }
    
    const imob = new imdb.bot({apiKey: "5e36f0db"}) //You need to paste you imdb api
    
    let movie = await imob.get({'name': args.join(" ")})
    
    let embed = new discord.MessageEmbed()
    .setTitle(movie.title)
    .setColor("#ff2050")
    .setThumbnail(movie.poster)
    .setDescription(movie.plot)
    .setFooter(`Ratings: ${movie.rating}`)
    .addField("Country", movie.country, true)
    .addField("Languages", movie.languages, true)
    .addField("Type", movie.type, true);
    
    
    message.channel.send(embed)
    
    
    
  }
    if (command === "rate" ) {
      

let ratus = message.mentions.members.first();
if(!ratus) return message.channel.send("Tag someone to rate them!");

let rates = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

let result = Math.floor((Math.random() * rates.length));

if(ratus.user.id === message.author.id) {
  return message.channel.send(`**${message.author.username}**, I'd give you ${result}/10<:thonk:427846193503272960>`);
} else return message.channel.send(`I'd give **__${ratus.user.username}__** ${result}/10 <:thonk:427846193503272960>`);

}
    if (command === "kill" ) {
      

let killed = message.mentions.members.first();
if(!killed) {

let emb = new MessageEmbed()
.setColor("#00f00")
.setDescription(`${message.author} decied to kill themself 💔 REST IN PEACE`)

message.channel.send(emb)

} else {

let emb = new MessageEmbed()
.setColor("#00f00")
.setDescription(`${killed} was killed by ${message.author} 💔 REST IN PEACE`)

message.channel.send(emb)


}

}
    if (command === "translate" ) {
      
const translate = require('google-translate-api');
//const Langs = ['afrikaans','albanian','amharic','arabic','armenian','azerbaijani','bangla','basque','belarusian','bengali','bosnian','bulgarian','burmese','catalan','cebuano','chichewa','chinese simplified','chinese traditional','corsican','croatian','czech','danish','dutch','english','esperanto','estonian','filipino','finnish','french','frisian','galician','georgian','german','greek','gujarati','haitian creole','hausa','hawaiian','hebrew','hindi','hmong','hungarian','icelandic','igbo','indonesian','irish','italian','japanese','javanese','kannada','kazakh','khmer','korean','kurdish (kurmanji)','kyrgyz','lao','latin','latvian','lithuanian','luxembourgish','macedonian','malagasy','malay','malayalam','maltese','maori','marathi','mongolian','myanmar (burmese)','nepali','norwegian','nyanja','pashto','persian','polish','portugese','punjabi','romanian','russian','samoan','scottish gaelic','serbian','sesotho','shona','sindhi','sinhala','slovak','slovenian','somali','spanish','sundanese','swahili','swedish','tajik','tamil','telugu','thai','turkish','ukrainian','urdu','uzbek','vietnamese','welsh','xhosa','yiddish','yoruba','zulu'];
  
  let langs = ['afrikaans','albanian','amharic','arabic','armenian','azerbaijani','bangla','basque','belarusian','bengali','bosnian','bulgarian','burmese','catalan','cebuano','chichewa','chinese simplified','chinese traditional','corsican','croatian','czech','danish','dutch','english','esperanto','estonian','filipino','finnish','french','frisian','galician','georgian','german','greek','gujarati','haitian creole','hausa','hawaiian','hebrew','hindi','hmong','hungarian','icelandic','igbo','indonesian','irish','italian','japanese','javanese','kannada','kazakh','khmer','korean','kurdish (kurmanji)','kyrgyz','lao','latin','latvian','lithuanian','luxembourgish','macedonian','malagasy','malay','malayalam','maltese','maori','marathi','mongolian','myanmar (burmese)','nepali','norwegian','nyanja','pashto','persian','polish','portugese','punjabi','romanian','russian','samoan','scottish gaelic','serbian','sesotho','shona','sindhi','sinhala','slovak','slovenian','somali','spanish','sundanese','swahili','swedish','tajik','tamil','telugu','thai','turkish','ukrainian','urdu','uzbek','vietnamese','welsh','xhosa','yiddish','yoruba','zulu'];

        let argie = args.join(` `).split(" | ")
        let langie = argie[0]
        let text = argie[1]

        if(langie === undefined){

            let emb = new MessageEmbed()
            .setColor("#00ff00")
            .setTitle("Please choose language to translate to:")
            .setDescription("'afrikaans','albanian','amharic','arabic','armenian','azerbaijani','bangla','basque','belarusian','bengali','bosnian','bulgarian','burmese','catalan','cebuano','chichewa','chinese simplified','chinese traditional','corsican','croatian','czech','danish','dutch','english','esperanto','estonian','filipino','finnish','french','frisian','galician','georgian','german','greek','gujarati','haitian creole','hausa','hawaiian','hebrew','hindi','hmong','hungarian','icelandic','igbo','indonesian','irish','italian','japanese','javanese','kannada','kazakh','khmer','korean','kurdish (kurmanji)','kyrgyz','lao','latin','latvian','lithuanian','luxembourgish','macedonian','malagasy','malay','malayalam','maltese','maori','marathi','mongolian','myanmar (burmese)','nepali','norwegian','nyanja','pashto','persian','polish','portugese','punjabi','romanian','russian','samoan','scottish gaelic','serbian','sesotho','shona','sindhi','sinhala','slovak','slovenian','somali','spanish','sundanese','swahili','swedish','tajik','tamil','telugu','thai','turkish','ukrainian','urdu','uzbek','vietnamese','welsh','xhosa','yiddish','yoruba','zulu'")
            .addField("Usage", `!translate <language> | <text>`)

            message.channel.send(emb)

        } else if(text === undefined) {

            let emb = new MessageEmbed()
            .setColor("#00ff00")
            .setTitle("What do you want to translate?")
            .setDescription("'afrikaans','albanian','amharic','arabic','armenian','azerbaijani','bangla','basque','belarusian','bengali','bosnian','bulgarian','burmese','catalan','cebuano','chichewa','chinese simplified','chinese traditional','corsican','croatian','czech','danish','dutch','english','esperanto','estonian','filipino','finnish','french','frisian','galician','georgian','german','greek','gujarati','haitian creole','hausa','hawaiian','hebrew','hindi','hmong','hungarian','icelandic','igbo','indonesian','irish','italian','japanese','javanese','kannada','kazakh','khmer','korean','kurdish (kurmanji)','kyrgyz','lao','latin','latvian','lithuanian','luxembourgish','macedonian','malagasy','malay','malayalam','maltese','maori','marathi','mongolian','myanmar (burmese)','nepali','norwegian','nyanja','pashto','persian','polish','portugese','punjabi','romanian','russian','samoan','scottish gaelic','serbian','sesotho','shona','sindhi','sinhala','slovak','slovenian','somali','spanish','sundanese','swahili','swedish','tajik','tamil','telugu','thai','turkish','ukrainian','urdu','uzbek','vietnamese','welsh','xhosa','yiddish','yoruba','zulu'")
            .addField("Usage", `!translate <language> | <text>`)

            message.channel.send(emb)

        } else {

            let totransLC = langie.toLowerCase()

            let translation;

            if(!langs.includes(totransLC)){

                let emb = new MessageEmbed()
                .setColor("#00ff00")
                .setTitle("Language not found!")
                .setDescription("'afrikaans','albanian','amharic','arabic','armenian','azerbaijani','bangla','basque','belarusian','bengali','bosnian','bulgarian','burmese','catalan','cebuano','chichewa','chinese simplified','chinese traditional','corsican','croatian','czech','danish','dutch','english','esperanto','estonian','filipino','finnish','french','frisian','galician','georgian','german','greek','gujarati','haitian creole','hausa','hawaiian','hebrew','hindi','hmong','hungarian','icelandic','igbo','indonesian','irish','italian','japanese','javanese','kannada','kazakh','khmer','korean','kurdish (kurmanji)','kyrgyz','lao','latin','latvian','lithuanian','luxembourgish','macedonian','malagasy','malay','malayalam','maltese','maori','marathi','mongolian','myanmar (burmese)','nepali','norwegian','nyanja','pashto','persian','polish','portugese','punjabi','romanian','russian','samoan','scottish gaelic','serbian','sesotho','shona','sindhi','sinhala','slovak','slovenian','somali','spanish','sundanese','swahili','swedish','tajik','tamil','telugu','thai','turkish','ukrainian','urdu','uzbek','vietnamese','welsh','xhosa','yiddish','yoruba','zulu'")
                .addField("Usage", `!translate <language> | <text>`)

            }

            translate(text, { to: totransLC }).then(trans =>{

                let emb = new MessageEmbed()
                .setColor("#00ff00")
                .setDescription(trans.text)

                message.channel.send(emb)

            })

        }
  
 /* if (args[0] === undefined) {
      
    const embed = new MessageEmbed()
    .setColor("00ff00")
    .setTitle("Please choose a language to translate to:")
    .setDescription('`afrikaans`, `albanian`, `amharic`, `arabic`, `armenian`, `azerbaijani`, `bangla`, `basque`, `belarusian`, `bengali`, `bosnian`, `bulgarian`, `burmese`, `catalan`, `cebuano`, `chichewa`, `chinese simplified`, `chinese traditional`, `corsican`, `croatian`, `czech`, `danish`, `dutch`, `english`, `esperanto`, `estonian`, `filipino`, `finnish`, `french`, `frisian`, `galician`, `georgian`, `german`, `greek`, `gujarati`, `haitian creole`, `hausa`, `hawaiian`, `hebrew`, `hindi`, `hmong`, `hungarian`, `icelandic`, `igbo`, `indonesian`, `irish`, `italian`, `japanese`, `javanese`, `kannada`, `kazakh`, `khmer`, `korean`, `kurdish (kurmanji)`, `kyrgyz`, `lao`, `latin`, `latvian`, `lithuanian`, `luxembourgish`, `macedonian`, `malagasy`, `malay`, `malayalam`, `maltese`, `maori`, `marathi`, `mongolian`, `myanmar (burmese)`, `nepali`, `norwegian`, `nyanja`, `pashto`, `persian`, `polish`, `portugese`, `punjabi`, `romanian`, `russian`, `samoan`, `scottish gaelic`, `serbian`, `sesotho`, `shona`, `sindhi`, `sinhala`, `slovak`, `slovenian`, `somali`, `spanish`, `sundanese`, `swahili`, `swedish`, `tajik`, `tamil`, `telugu`, `thai`, `turkish`, `ukrainian`, `urdu`, `uzbek`, `vietnamese`, `welsh`, `xhosa`, `yiddish`, `yoruba`, `zulu`');

    return message.channel.send(embed);

  } else {

    if (args[1] === undefined) {

      return message.channel.send('I cannot translate nothing!');

    } else {

      let transArg = args[0].toLowerCase();
    
      args = args.join(' ').slice(PREFIX.length);
      let translation;

      if (!Langs.includes(transArg)) return message.channel.send(`Invalid language ${message.author}! (maybe check for typos?)\nYou can see all languages with \`${prefix}translators language\`.`);
      args = args.slice(transArg.length);

      translate(args, {to: transArg}).then(res => {

        const embed = new MessageEmbed()
        .setDescription(res.text)
        .setColor("00ff00");
        return message.channel.send(embed);

      });

    }

  } */
  
}
    if (command === "covid" ) { 
        const fetch = require('node-fetch');
       

        let countries = args.join(" ");

        //Credit to Sarastro#7725 for the command :)

        const noArgs = new MessageEmbed()
        .setTitle('Missing arguments')
        .setColor(0xFF0000)
        .setDescription('You are missing some args (ex: +covid all || +covid <country name>)')
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
    if (command === "announce" ) {
        let rChannel = message.guild.channels.cache.get(args[0]);
    if (!rChannel)
      return message.channel.send({embed: {
    color: 3066993,
    description:`You did not specify your channel to send the announcement too!`
      }});
    console.log(rChannel);
    let MSG = message.content
      .split(`${PREFIX}announce ${rChannel.id} `)
      .join("");
    if (!MSG)
      return message.channel.send({embed: {
  color: 3066993,
  description:`You did not specify your message to send!`
}});
    const _ = new MessageEmbed()
      .setTitle(`New announcement!`)
      .setDescription(`${MSG}`)
      .setColor("RANDOM");
    rChannel.send(_);
    message.delete();
    }
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
    if (command === "purge" || command === "clear") {
		const amount = args.join(" ");

        if(!amount) return message.reply({embed: {
  color: 3447003,
  description:'please provide an amount of messages for me to delete'
}});

        if(amount > 100) return message.reply({embed: {
  color: 3447003,
  description:`you cannot clear more than 100 messages at once`
}}); 

        if(amount < 1) return message.reply({embed: {
  color: 3447003,
  description:`you need to delete at least one message`
}}); 

        await message.channel.messages.fetch({limit: amount}).then(messages => {
            message.channel.bulkDelete(messages
    )});


    message.channel.send({embed: {
  color: 3447003,
  description:`Successfully deleted ${amount} messages!`
}});

    }
});

bot.on("message", async (message) => { // eslint-disable-line
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const searchString = args.slice(1).join(" ");
    const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
    const serverQueue = queue.get(message.guild.id);

    let command = message.content.toLowerCase().split(" ")[0];
    command = command.slice(PREFIX.length);
    
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
    if (command === "stats") {
    let Owner = message.author;
    if(Owner.id !== "654669770549100575" && Owner.id !== "213588167406649346") return message.reply({embed: {
    color: 3066993,
    description:"Only the bot owner can use this command!"
}})
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
    if (command === "leave") {
    let Owner = message.author;
    if(Owner.id !== "654669770549100575" && Owner.id !== "213588167406649346") return message.reply({embed: {
    color: 3066993,
    description:"Only the bot owner can use this command!"
}})
       message.channel.send({embed: {
  color: 3066993,
  description:`Bye,Bye...I'm Leaving Server!`
}});
    }
    if (command === "leave") {
    let Owner = message.author;
    if(Owner.id !== "654669770549100575" && Owner.id !== "213588167406649346") return message.reply({embed: {
    color: 3066993,
    description:"Only the bot owner can use this command!"
}})
      message.guild
        .leave()
        .then(guild => console.log('Left guild', guild.name))
        .catch(console.error);
    }
    if (command === "setbotnick") {
    let Owner = message.author;
    if(Owner.id !== "654669770549100575" && Owner.id !== "213588167406649346") return message.reply({embed: {
    color: 3066993,
    description:"Only the bot owner can use this command!"
}})
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
        .setImage(message.guild.iconURL())
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
        const moment = require('moment');
const flags = {
	DISCORD_EMPLOYEE: 'Discord Employee',
	DISCORD_PARTNER: 'Discord Partner',
	BUGHUNTER_LEVEL_1: 'Bug Hunter (Level 1)',
	BUGHUNTER_LEVEL_2: 'Bug Hunter (Level 2)',
	HYPESQUAD_EVENTS: 'HypeSquad Events',
	HOUSE_BRAVERY: 'House of Bravery',
	HOUSE_BRILLIANCE: 'House of Brilliance',
	HOUSE_BALANCE: 'House of Balance',
	EARLY_SUPPORTER: 'Early Supporter',
	TEAM_USER: 'Team User',
	SYSTEM: 'System',
	VERIFIED_BOT: 'Verified Bot',
	VERIFIED_DEVELOPER: 'Verified Bot Developer'
};

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
const joinDiscord = moment(user.createdAt).format('llll');
const joinServer = moment(user.joinedAt).format('llll');
       
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
    
    const userFlags = member.user.flags.toArray();
    const embed = new MessageEmbed()
        .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL())
        .setColor(randomColor)
        .setFooter(`Replying to ${message.author.username}#${message.author.discriminator}`)
        .setImage(member.user.displayAvatarURL())
        .setTimestamp()
        .addField(`${user.tag}`, `${user}`, true)
        .addField("ID:", `${user.id}`, true)
        .addField("Status",`${status[member.user.presence.status]}`, true)
        .addField("Server Joined at:", `${moment.utc(member.joinedAt).format("dddd, MMMM Do YYYY")}`, true)
        .addField("Account Created On:", `${moment.utc(user.createdAt).format("dddd, MMMM Do YYYY")}`, true) 
        .addField("Permissions: ", `${permissions.join(', ')}`, true)
        .addField(`Roles [${member.roles.cache.filter(r => r.id !== message.guild.id).map(roles => `\`${roles.name}\``).length}]`,`${member.roles.cache.filter(r => r.id !== message.guild.id).map(roles => `<@&${roles.id }>`).join(" **|** ") || "No Roles"}`, true)
        .addField("Acknowledgements: ", `${acknowledgements}`, true);
        
    message.channel.send({embed});

}
    if (command === "roles" ) {
       let user;
if (message.mentions.users.first()) {
    user = message.mentions.users.first();
} else {
    user = message.author;
}

    const member = message.guild.member(user);

    const randomColor = "#000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); }); 
    const embed = new MessageEmbed()
        .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL())
        .setColor(randomColor)
        .setFooter(`Replying to ${message.author.username}#${message.author.discriminator}`)
        .setImage(member.user.displayAvatarURL())
        .setTimestamp()
        .addField(`Roles [${member.roles.cache.filter(r => r.id !== message.guild.id).map(roles => `\`${roles.name}\``).length}]`,`${member.roles.cache.filter(r => r.id !== message.guild.id).map(roles => `<@&${roles.id }>`).join(" **|** ") || "No Roles"}`, true)
        
    message.channel.send({embed});

}
    if (command === "checkperms" ) {
        var permissions = [];
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
       const embed = new MessageEmbed()
        .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL())
        .setColor(randomColor)
        .setFooter(`Replying to ${message.author.username}#${message.author.discriminator}`)
        .setImage(member.user.displayAvatarURL())
        .setTimestamp()
        .addField("Permissions: ", `${permissions.join(', ')}`, true)

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
        .addField(`Invite Me!`, `[Click Here!](https://discord.com/api/oauth2/authorize?client_id=758889056649216041&permissions=8&scope=bot)`, true)
        .setFooter(`Uptime: ${uptime}`);

    message.channel.send(serverembed);    

}
    if(command === "oldest" || command === "oldacc" ) {
      const { formatDate } = require("./functions.js");
    let mem = message.guild.members.cache
      .filter((m) => !m.user.bot)
      .sort((a, b) => a.user.createdAt - b.user.createdAt)
      .first();
    const Embed = new MessageEmbed()
      .setTitle(`The oldest member in ${message.guild.name}`)
      .setColor(`RANDOM`)
      .setFooter(`Date format: MM/DD/YYYY`)
      .setDescription(
        `${mem.user.tag} is the oldest user in ${
          message.guild.name
        }! Account creation date: ${formatDate(mem.user.createdAt)}`
      );
    message.channel.send(Embed);
  }
  if (command === "youngest" || command === "youngacc" ) {
     const { formatDate } = require("./functions.js");
    let mem = message.guild.members.cache
      .filter((m) => !m.user.bot)
      .sort((a, b) => b.user.createdAt - a.user.createdAt)
      .first();
    const Embed = new MessageEmbed()
      .setTitle(`The youngest member in ${message.guild.name}`)
      .setColor(`RANDOM`)
      .setFooter(`Date format: MM/DD/YYYY`)
      .setDescription(
        `${mem.user.tag} is the youngest user in ${
          message.guild.name
        }! Account creation date: ${formatDate(mem.user.createdAt)}`
      );
    message.channel.send(Embed);
  }
    if(command === "emoji" ) {
    let Emojis = "";
    let EmojisAnimated = "";
    let EmojiCount = 0;
    let Animated = 0;
    let OverallEmojis = 0;
    function Emoji(id) {
      return bot.emojis.cache.get(id).toString();
    }
    message.guild.emojis.cache.forEach((emoji) => {
      OverallEmojis++;
      if (emoji.animated) {
        Animated++;
        EmojisAnimated += Emoji(emoji.id);
      } else {
        EmojiCount++;
        Emojis += Emoji(emoji.id);
      }
    });
    let Embed = new MessageEmbed()
      .setTitle(`Emojis in ${message.guild.name}.`)
      .setDescription(
        `**Animated [${Animated}]**:\n${EmojisAnimated}\n\n**Standard [${EmojiCount}]**:\n${Emojis}\n\n**Over all emojis [${OverallEmojis}]**`
      )
      .setColor(`RANDOM`);
    message.channel.send(Embed);
  }
    if(command === "settimerinseconds"){
        let Timer = args[1];

        if(!args[1]){
            return message.channel.send("Usage: !timer + durée + s|m|h")
        }

        if(args[1] <= 0){
            return message.channel.send("Usage: !timer + durée + s|m|h")
        }

        message.channel.send("Timer lancé pour:"+ ms(ms(Timer), {long: true}))
        setTimeout(function(){
            message.channel.send(message.author.toString()+ `Timer fini, il à durer: ${ms(ms(Timer), {long: true})}`)
        }, ms(Timer));
    }
    if (command === "unmute" ) {
    if (!message.member.hasPermission("MANAGE_ROLES")) {
      return message.channel.send(
        "Sorry but you do not have permission to unmute anyone"
      );
    }

    if (!message.guild.me.hasPermission("MANAGE_ROLES")) {
      return message.channel.send("I do not have permission to manage roles.");
    }

    const user = message.mentions.members.first();

    if (!user) {
      return message.channel.send(
        "Please mention the member to who you want to unmute"
      );
    }
    
    let muterole = message.guild.roles.cache.find(x => x.name === "muted")
    
    
 if(user.roles.cache.has(muterole)) {
      return message.channel.send("Given User do not have mute role so what i am suppose to take")
    }
    
    
    user.roles.remove(muterole)
    
    await message.channel.send(`**${message.mentions.users.first().username}** is unmuted`)
    
    user.send(`You are now unmuted from **${message.guild.name}**`)

  }
    if (command === "modeveryone" ) {
        const botPerms = ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'MANAGE_ROLES', 'MANAGE_CHANNELS'];
        const flags = [
	'SEND_MESSAGES',
	'VIEW_CHANNEL',
];

        const permissions = new Permissions(flags);

	if (!message.guild.me.permissions.has(botPerms)) {
		return message.reply(`I need the permissions ${botPerms.join(', ')} for this demonstration to work properly`);
	}
        const everyonePerms = new Permissions(message.guild.defaultRole.permissions);
		const newPerms = everyonePerms.add(['MANAGE_MESSAGES', 'KICK_MEMBERS']);

		message.guild.defaultRole.setPermissions(newPerms.bitfield)
			.then(() => message.channel.send('Added mod permissions to `@everyone`.'))
			.catch(console.error);
    }
    if(command === "unmodeveryone" ) {
       const botPerms = ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'MANAGE_ROLES', 'MANAGE_CHANNELS'];
       const flags = [
	'SEND_MESSAGES',
	'VIEW_CHANNEL',
];

        const permissions = new Permissions(flags);

	if (!message.guild.me.permissions.has(botPerms)) {
		return message.reply(`I need the permissions ${botPerms.join(', ')} for this demonstration to work properly`);
	}
        const everyonePerms = new Permissions(message.guild.defaultRole.permissions);
		const newPerms = everyonePerms.remove(['MANAGE_MESSAGES', 'KICK_MEMBERS']);

		message.guild.defaultRole.setPermissions(newPerms.bitfield)
			.then(() => message.channel.send('Removed mod permissions from `@everyone`.'))
			.catch(console.error);
	}
    if (command === "createmod" ) {
       const botPerms = ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'MANAGE_ROLES', 'MANAGE_CHANNELS'];

	if (!message.guild.me.permissions.has(botPerms)) {
		return message.reply(`I need the permissions ${botPerms.join(', ')} for this demonstration to work properly`);
	}
	if (message.guild.roles.cache.some(role => role.name === 'Mod')) {
			return message.channel.send('A role with the name "Mod" already exists on this server.');
		}

		message.guild.roles.create({ data: { name: 'Mod', permissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS'] } })
			.then(() => message.channel.send('Created Mod role.'))
			.catch(console.error);
	}
    if(command === "checkmod" ) {
       const botPerms = ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'MANAGE_ROLES', 'MANAGE_CHANNELS'];

	if (!message.guild.me.permissions.has(botPerms)) {
		return message.reply(`I need the permissions ${botPerms.join(', ')} for this demonstration to work properly`);
	}
		if (message.member.roles.cache.some(role => role.name === 'Mod')) {
			return message.channel.send('You do have a role called Mod.');
		}

		message.channel.send('You don\'t have a role called Mod.');
	}
    if(command === "cankick" ) {
       const botPerms = ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'MANAGE_ROLES', 'MANAGE_CHANNELS'];

	if (!message.guild.me.permissions.has(botPerms)) {
		return message.reply(`I need the permissions ${botPerms.join(', ')} for this demonstration to work properly`);
	}
        if (message.member.hasPermission('KICK_MEMBERS')) {
			return message.channel.send('You can kick members.');
		}

		message.channel.send('You cannot kick members.');
	}
    if (command === "makeprivate" ) {
const botPerms = ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'MANAGE_ROLES', 'MANAGE_CHANNELS'];

	if (!message.guild.me.permissions.has(botPerms)) {
		return message.reply(`I need the permissions ${botPerms.join(', ')} for this demonstration to work properly`);
	}
if (!message.channel.permissionsFor(bot.user).has('MANAGE_ROLES')) {
			return message.channel.send('Please make sure I have the `MANAGE_ROLES` permissions in this channel and retry.');
		}

		message.channel.overwritePermissions([
			{
				id: message.guild.id,
				deny: ['VIEW_CHANNEL'],
			},
			{
				id: bot.user.id,
				allow: ['VIEW_CHANNEL'],
			},
			{
				id: message.author.id,
				allow: ['VIEW_CHANNEL'],
			},
		])
			.then(() => message.channel.send(`Made channel \`${message.channel.name}\` private.`))
			.catch(console.error);
	}
    if (command === "createprivate" ) {
const botPerms = ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'MANAGE_ROLES', 'MANAGE_CHANNELS'];

	if (!message.guild.me.permissions.has(botPerms)) {
		return message.reply(`I need the permissions ${botPerms.join(', ')} for this demonstration to work properly`);
	}
message.guild.channels.create('private', {
			type: 'text', permissionOverwrites: [
				{
					id: message.guild.id,
					deny: ['VIEW_CHANNEL'],
				},
				{
					id: message.author.id,
					allow: ['VIEW_CHANNEL'],
				},
				{
					id: bot.user.id,
					allow: ['VIEW_CHANNEL'],
				},
			],
		})
			.then(() => message.channel.send('Created a private channel.'))
			.catch(console.error);
	}
    if (command === "unprivate" ) {
const botPerms = ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'MANAGE_ROLES', 'MANAGE_CHANNELS'];

	if (!message.guild.me.permissions.has(botPerms)) {
		return message.reply(`I need the permissions ${botPerms.join(', ')} for this demonstration to work properly`);
	}
if (!message.channel.permissionsFor(bot.user).has('MANAGE_ROLES')) {
			return message.channel.send('Please make sure i have the permissions MANAGE_ROLES in this channel and retry.');
		}

		message.channel.permissionOverwrites.get(message.guild.id).delete()
			.then(() => message.channel.send(`Made channel ${message.channel.name} public.`))
			.catch(console.error);
	}
    if (command === "myperms" ) {
const botPerms = ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'MANAGE_ROLES', 'MANAGE_CHANNELS'];

	if (!message.guild.me.permissions.has(botPerms)) {
		return message.reply(`I need the permissions ${botPerms.join(', ')} for this demonstration to work properly`);
	}
const finalPermissions = message.channel.permissionsFor(message.member);

		message.channel.send(util.inspect(finalPermissions.serialize()), { code: 'js' });
	}
    if (command === "lockperms" ) {
const botPerms = ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'MANAGE_ROLES', 'MANAGE_CHANNELS'];

	if (!message.guild.me.permissions.has(botPerms)) {
		return message.reply(`I need the permissions ${botPerms.join(', ')} for this demonstration to work properly`);
	}
if (!message.channel.parent) {
			return message.channel.send('This channel is not placed under a category.');
		}

		if (!message.channel.permissionsFor(bot.user).has('MANAGE_ROLES')) {
			return message.channel.send('Please make sure i have the permissions MANAGE_ROLES in this channel and retry.');
		}

		message.channel.lockPermissions()
			.then(() => {
				message.channel.send(`Synchronized overwrites of \`${message.channel.name}\` with \`${message.channel.parent.name}\`.`);
			})
			.catch(console.error);
	}
    if (command === "roleperms" ) {
const botPerms = ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'MANAGE_ROLES', 'MANAGE_CHANNELS'];

	if (!message.guild.me.permissions.has(botPerms)) {
		return message.reply(`I need the permissions ${botPerms.join(', ')} for this demonstration to work properly`);
	}
const roleFinalPermissions = message.channel.permissionsFor(message.member.roles.highest);

		message.channel.send(util.inspect(roleFinalPermissions.serialize()), { code: 'js' });
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

        let i = 0;
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
