const { Client, Util, MessageEmbed} = require("discord.js");
const YouTube = require("simple-youtube-api");
const ytdl = require("ytdl-core");
const ms = require("ms");
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
}
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
        const Discord = require('discord.js');

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
        const Discord = require("discord.js");

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

for (let i = 0; i <= 0; ++i)
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
    if (command === "deletewarns" || command === "delwarns" ) {
        const db = require('quick.db');
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
        const Discord = require('discord.js');
        const db = require('quick.db');

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
        const db = require('quick.db');

        const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]) || message.author;


        let warnings = await db.get(`warnings_${message.guild.id}_${user.id}`);

        if(warnings === null) warnings = 0;

        message.channel.send({embed: {
   color: 3066993,
   description:`**${user.username}** has *${warnings}* warning(s)`
}});
    }
    if (command === "bal" ) {
        const db = require('quick.db');
        const Discord = require('discord.js');

        let user = message.mentions.users.first() || message.author;

        let bal = await db.fetch(`money_${message.guild.id}_${user.id}`);
        if(bal === null) bal = 0;

        message.channel.send({embed: {
  color: 3447003,
  description:`${user} currently has ${bal} coins!`
}});
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
    if (command === "daily" ) {
       const db = require('quick.db');
       const ms = require('parse-ms');

        let user = message.author;
        let timeout = 86400000;
        let amount = 100;

        let daily = await db.fetch(`daily_${message.guild.id}_${user.id}`);

        if(daily !== null && timeout - (Date.now() - daily) > 0){
            let time = ms(timeout - (Date.now() - daily));

            return message.channel.send({embed: {
    color: 3066993,
    description:`You've already collected your daily award. Come back in ${time.days}d, ${time.hours}h, ${time.minutes}m, and ${time.seconds}s`
}})
        } else {
            db.add(`money_${message.guild.id}_${user.id}`, amount);
            db.set(`daily_${message.guild.id}_${user.id}`, Date.now());

            message.channel.send({embed: {
    color: 3066993,
    description:`Successfully added ${amount} coins to your account`
}})
        }
    }
    if (command === "work" ) {
       const db = require('quick.db');
       const ms = require('parse-ms');
        let user = message.author;
        let timeout = 600000;
        let author = await db.fetch(`worked_${message.guild.id}_${user.id}`);

        if(author !== null && timeout - (Date.now() - author) > 0){
            let time = ms(timeout - (Date.now() - author));
            return message.channel.send({embed: {
    color: 3066993,
    description: `You cannot work again for ${time.minutes}m and ${time.seconds}s`
}})
        } else {
            let amount = Math.floor(Math.random() * 80) + 1;
            db.add(`money_${message.guild.id}_${user.id}`, amount)
            db.set(`worked_${message.guild.id}_${user.id}`, Date.now())

            message.channel.send({embed: {
    color: 3066993,
    description:`${user}, you worked and earned ${amount} coins`
}})
        }
    }
    if (command === "buy" ) {
        const sayMessage = args.join(" ")
    if(!sayMessage) return message.reply({embed: {
  color: 3066993,
  description:"Proper Usage : +buy <store item>"
}})
       const db = require('quick.db');
       const Discord = require('discord.js');

        let purchase = args.join(" ");
        if(!purchase) return message.channel.send('Please provide an item to buy')
        let items = await db.fetch(message.author.id, { items: [] });
        let amount = await db.fetch(`money_${message.guild.id}_${message.author.id}`)

        if(purchase === 'car' || purchase === 'Car'){
            if(amount < 500) return message.channel.send('You do not have enough money to buy this item. Please try another one');
            db.subtract(`money_${message.guild.id}_${message.author.id}`, 500);
            db.push(message.author.id, "Car");
            message.channel.send({embed: {
    color: 3066993,
    description:'Successfully bought one car'
}})
        }
        if(purchase === 'watch' || purchase === 'Watch'){
            if(amount < 250) return message.channel.send('You do not have enough money to buy this item. Please try another one');
            db.subtract(`money_${message.guild.id}_${message.author.id}`, 250);
            db.push(message.author.id, "Watch");
            message.channel.send({embed: {
   color: 3066993,
   description:'Successfully bought one car'
}})
        }
    }
    if (command === "store" ) {
       const Discord = require('discord.js');

        const embed = new Discord.MessageEmbed()
        .setTitle('Store')
        .setDescription(`Car - 500 coins \n Watch - 250 coins`)
        .setTimestamp();

        message.channel.send(embed);
    }
    if (command === "inventory" ) {
        const db = require('quick.db');
        const Discord = require('discord.js');

        let items = await db.fetch(message.author.id);
        if(items === null) items = "Nothing"

        const Embed = new Discord.MessageEmbed()
        .addField('Inventory', items)

        message.channel.send(Embed);
    }
    if (command === "leaderboard" || command === "lb" ) {

        const db = require('quick.db');
        const Discord = require('discord.js');

        let bal = db.fetch(`money_${message.guild.id}`, { sort: '.data' })
        if(bal === null) money = 0
        console.log(bal)

        let content = "";

        for (let i = 0; i < bal.length; i++){
            let user = client.users.cache.get(money[i].ID.split('_')[2]).username

            content += `${i+1}. ${user} - ${money[i].data} \n`;

            const embed = new MessageEmbed()
            .setTitle(`${message.guild.name}'s Leaderboard`)
            .setDescription(`${content}`)
            .setColor("RANDOM")
            .setTimestamp()

            message.channel.send(embed);
        }
    }
    if (command === "color" ) {
        const canva = require('canvacord');
        const Discord = require('discord.js')

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
        const Discord = require('discord.js');
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

        const Discord = require('discord.js');

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

        const embed = new Discord.MessageEmbed()
        .setColor(0x808080)
        .setTitle('Calculator')
        .addField('Question', `\`\`\`css\n${args.join(' ')}\`\`\``)
        .addField('Answer', `\`\`\`css\n${resp}\`\`\``)

        message.channel.send(embed);

    }
    if (command === "givemeajoke" || command === "joke" ) {
        const Discord = require("discord.js");
        let giveMeAJoke = require('give-me-a-joke');;
    giveMeAJoke.getRandomCNJoke(function(joke){
        message.channel.send({embed: {
   color: 3066993,
   description:joke
}})
    })
}
    if (command === "addrole" || command === "ar") {
       const Discord = require("discord.js");
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
        const Discord = require("discord.js");
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
    const Discord = require("discord.js");
    let Owner = message.author;
    if(Owner.id !== "654669770549100575" && Owner.id !== "213588167406649346") return message.reply("Only the bot owner can use this command!")
   
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
    if (command === "contact" ) {
        const Discord = require("discord.js");

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
        const Discord = require("discord.js")
        const Client = new Discord.Client

  if(message.author.id !== "654669770549100575") return;

    const command = message.content.split(' ').slice(1).join(' ');
    message.channel.send(
`\`\`\`js
${eval(command)}
\`\`\``);

  }
    if (command === "morse" ) {
       const Discord = require("discord.js");
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
       const Discord = require("discord.js");

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
    if (command === "imdb" ) {
      const Discord = require("discord.js");
      const chalk = require('chalk');
      const {Command} = require('sylphy');
      const imdb = require('imdb-api');

    if (!args.join(" ")) return message.channel.send({embed: {
   color: 3066993,
   description:'Oh no, you didn\'t give a movie or serie to search for.'
}});
    let movie;
    try {
        movie = await imdb.get(args.join(" "), {apiKey: "6fb3a82"});
    } catch (e) {
        return console.log(e)
    }

    let imdbemb = new MessageEmbed()
    .setColor("#00ff00")
    .setTitle(movie.title)
    .setURL(movie.imdburl)
    .setDescription(movie.plot)
    .setThumbnail(movie.poster)
    .addField("Rate", movie.rating, true)
    .addField("Time", movie.runtime, true)
    .addField("Awards", movie.awards, true)
    .addField("Langueages", movie.languages, true)
    .addField("Genres", movie.genres, true)
    .addField("PG", movie.rated, true)
    .addField("Coutry", movie.country, true)
    .addField("Released", movie.released)
    .setFooter('All information is provided by IMDB')
    
    message.channel.send(imdbemb)

    console.log(movie)

}
    if (command === "rate" ) {
       const Discord = require("discord.js")

let ratus = message.mentions.members.first();
if(!ratus) return message.channel.send("Tag someone to rate them!");

let rates = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

let result = Math.floor((Math.random() * rates.length));

if(ratus.user.id === message.author.id) {
  return message.channel.send(`**${message.author.username}**, I'd give you ${result}/10<:thonk:427846193503272960>`);
} else return message.channel.send(`I'd give **__${ratus.user.username}__** ${result}/10 <:thonk:427846193503272960>`);

}
    if (command === "kill" ) {
       const Discord = require("discord.js")

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
        const Discord = require('discord.js');
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
    
      args = args.join(' ').slice(prefix.length);
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
        const Discord = require('discord.js');

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
    if(command === "mute" ) {
       const Discord = require("discord.js");
       const ms = require("ms");
  //!mute @user 1s/m/h/d

  let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
  if(!tomute) return message.channel.send("Please tag user to mute!");
  if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("Sorry, you don't have permissions to use this!");
  if(tomute.hasPermission("MANAGE_MESSAGES")) return message.channel.send("I cant mute this user");
  if (tomute.id === message.author.id) return message.channel.send("You cannot mute yourself!");
  let muterole = message.guild.roles.cache.find(r => r.name === 'MuTeD');

  if(!muterole){
    try{
      muterole = await message.guild.roles.create({
        name: "MuTeD",
        color: "#000000",
        permissions:[]
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

  let mutetime = args[1];
  if(!mutetime) return message.channel.send("You didn't specify a time!");

  await(tomute.roles.add(muterole.id));
  message.channel.send(`<@${tomute.id}> has been muted for ${ms(mutetime)}!`);

  setTimeout(function(){
    tomute.roles.remove(muterole.id);
    message.channel.send(`<@${tomute.id}> has been unmuted!`);
  }, ms(mutetime));

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
