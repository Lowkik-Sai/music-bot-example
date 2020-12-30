const { Client, Util, MessageEmbed, GuildAuditLogs, MessageAttachment} = require("discord.js");
const { Permissions } = require('discord.js');
const { Embeds } = require('discord-paginationembed');
const util = require('util');
const YouTube = require("simple-youtube-api");
const ytdl = require("ytdl-core");
const db = require("quick.db");
const Statcord = require("statcord.js");
const ms = require("ms");
const fs = require("fs");
const arraySort = require('array-sort');// This will be used for sorting arrays
const table = require('console.table'); // This will be used for preparing the output to a table
const send = require('quick.hook'); // This will be used for creating & sending webhooks
const fetch = require('node-fetch');
const Message = require("discord.js");
const moment = require("moment");
const cron = require('cron');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const {promisify} = require('util');
const creds = require('./client_secret.json');


const Canvas = require('canvas-constructor');
var jimp = require('jimp');
const Discord = require("discord.js");
const config = require("./config.json");
require("dotenv").config();
require("./server.js");

const newsAPI = process.env.newsAPI;
const PREFIX = process.env.PREFIX;
const youtube = new YouTube(process.env.YTAPI_KEY);
const queue = new Map();
const usersOnCooldown = new Set();

const bot = new Client({
    unknownCommandResponse: false,
    disableMentions: "everyone",
});

const serverStats = {
    guildID: '763233532369567765',
    ticketCategoryID: '771936611063038012'
}

// Define constants
const PRefix = config.prefix;
const prefIX = config.prefIX;
const admins = process.env.ADMINS;
const maxRolls = config.maxRolls;
const userSelectsCard = config.userSelectsCard;
const blacklist = ['722666387386007653', '72266638738600765', '7226663873860076'];
const roleblacklist = ['774101485796851764', '77410148579685176'];

var blockedUsers = [];

// Read predictions from file, remove last prediction if empty string
var predictions = fs.readFileSync('./predictions.txt').toString().split('\n');
if (predictions[predictions.length-1] === "") {
  predictions.splice(-1,1);
}

// Exit if not enough predictions
if (predictions.length < 25) {
  console.log("You don't have enough predictions to generate a card. You need at least 24");
  return;
}

bot.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) { // Setup each command for bot
  const command = require(`./commands/${file}`);
  bot.commands.set(command.name, command);
}

bot.on('message', msg => {
  const content = msg.content;
  const parts = content.split(' ');

  if (parts[0] != prefIX){ return; }
  if (parts.length === 1){ msg.reply("Yes?!!!! I hear thy name calling!"); }

  if (msg.content === 'chev list scores') {
    bot.commands.get('showScores').execute(msg);
  }
  else if (parts[1] === 'add' && parts[2] != null 
    && parts[3] === 'to' && parts[4] != null) {
      bot.commands.get('addScore').execute(msg, parseInt(parts[2]), parts[4]);
  }
  else if (parts[1] === 'subtract' && parts[2] != null 
    && parts[3] === 'to' && parts[4] != null) {
      bot.commands.get('subtractScore').execute(msg, parseInt(parts[2]), parts[4]);
  }
  else if (parts[1] === 'add' && parts[2] === 'member' && parts[3] != null){
    bot.commands.get('addMember').execute(msg, parts[3]);
  }
  else if (parts[1] === 'remove' && parts[2] === 'member' && parts[3] != null){
    bot.commands.get('removeMember').execute(msg, parts[3]);
  }

})

bot.on('message', message => {
    if (message.content === '+forms'){
const doc = new GoogleSpreadsheet('16Xa3O1y9M4d15WkhwFQ0abasZfayg3KUJ_eTEo7ERDc');
   
async function accessSpreadsheet(embed) {
await doc.useServiceAccountAuth({
    client_id: creds.client_id,
    project_id: creds.project_id,
    auth_uri: creds.auth_uri,
    token_uri: creds.token_uri,
    auth_provider_x509_cert_url: creds.auth_provider_x509_cert_url,
    client_secret: creds.client_secret,
    redirect_uris: creds.redirect_uris,
  });

  await doc.loadInfo(); // loads document properties and worksheets
  console.log(doc.title);

  const sheetf = doc.sheetsByIndex[0]; // or use doc.sheetsById[id]
  console.log(sheet.title);
  console.log(sheet.rowCount);

  // Insert the code already being used up to the for loop.
         await promisify(doc.useServiceAccountAuth)(creds);
            const info = await promisify(doc.getInfo)();
            var sheet = info.worksheets[0];

            var cells = await promisify(sheet.getCells)({
                'min-row': 2,
                'max-row': 5,
                'min-col': 3,
                'max-col': 3,
                'return-empty': true,
            })
            for (var cell of cells) {
                message.author.send(cell.value)
            }
  for (let i = 0; i < 25 && cells[i]; i++) embed.addField('Name', `•${cells[i].value}`, true);
}

var embed = new MessageEmbed()
  .setColor('#0099ff')
  .setTitle('**Spreadsheet Info**')
  .setDescription('Showing as many values as possible...');

accessSpreadsheet(embed)
  .then(() => message.author.send(embed))
  .catch(console.error);
}
})

bot.on("message", (message) => {
  // Exit and stop if PRefix missing or from bot
  if (!message.content.startsWith(PRefix) || message.author.bot) return;
  if (blockedUsers.includes(message.author.id)) return message.author.send("You are blocked!");

  // Trim PRefix and sanitize
  var string = message.content.slice(PRefix.length).trim();
  string = string.replace(/[“”]/g, '"');
  // Grab command and arguments
  const regex = /[^\s"]+|"([^"]*)"/gi;
  let args = [];
  do {
    var match = regex.exec(string);
    if (match != null) {
      args.push(match[1] ? match[1] : match[0]);
    }
  } while (match != null);
  // Return if only PRefix is sent
  if (string == "") {
    return;
  }
  const command = args.shift().toLowerCase();

  // Define variables
  let user = message.member;
  let bingoCard = "./cards/" + message.author.username + ".json";
  let enrollable = JSON.parse(fs.readFileSync('./config.json')).enrollable;
  let content, jsonContent, oldCard;
  var rolls;
  if (fs.existsSync(bingoCard)) {
    content = fs.readFileSync(bingoCard);
    jsonContent = JSON.parse(content);
    oldCard = jsonContent.card;
  }

  // Define functions
  function rollCard() {
    // Build unique random indices
    var uniqueRandoms = [];
    while (uniqueRandoms.length < 25) {
      let randomIndex = Math.floor(Math.random() * predictions.length);
      if (uniqueRandoms.indexOf(randomIndex) == -1) {
        uniqueRandoms.push(randomIndex);
      }
    }
    // Generate predictions
    var card = {};
    for (let i = 1; i <= 25; i++) {
      let cellName = "cell-" + i;
      card[cellName] = {};
      if (i === 13) {
        card[cellName]["value"] = "Free Space";
        card[cellName]["confirmed"] = true;
      } else {
        card[cellName]["value"] = predictions[uniqueRandoms[i-1]];
        card[cellName]["confirmed"] = false;
      }
    }
    return card;
  }

  function showPredictions(card) {
    let string = "";
    for (let key of Object.keys(card)) {
      if (card[key]["value"] !== "Free Space") {
        if(card[key]["confirmed"] == true) {
          string += "~~" + card[key]["value"] + "~~ :white_check_mark:\n";
        } else {
          string += card[key]["value"] + "\n";
        }
      }
    }
    return string;
  }

  function saveCard(card) {
    fs.writeFile(bingoCard, JSON.stringify(card), function(err) {
      if (err) throw err;
    });
  }

  // Define commands
  switch (command) {
    case "roll":
      // Check if new users can still enroll
     if (!enrollable) {
        message.channel.send("Enrollments are now closed. See you next time!");
        return;
      }
      // Check if user qualifies for roll
      if (fs.existsSync(bingoCard)) {
        rolls = jsonContent.rolls + 1;
      } else {
        rolls = 1
      }
      if (rolls > maxRolls) {
        message.channel.send("Out of rerolls! Sorry, dood.");
        return;
      }

      // Generating card
      message.channel.send("_Beep boop generating card..._");
      var newCard = rollCard();

      // Display predictions
      let msg = "Done! Here are your predictions:\n";
      msg += showPredictions(newCard);
      message.channel.send(msg);
      // Prompt user to choose card, if enabled
      var cardToSave = {"rolls": rolls};
      if (userSelectsCard && rolls != 1) {
        message.channel.send("Save card? Yes or No");
        const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
        collector.next.then(response => {
          if (response == "Yes" || response == "yes" || response == "y") {
            message.channel.send("OK, saving your new card.");
            cardToSave["card"] = newCard;
            saveCard(cardToSave);
          } else if (response == "No" || response == "no" || response == "n") {
            message.channel.send("Sure, you can keep your old card.");
            cardToSave["card"] = oldCard;
            saveCard(cardToSave);
          }
        }).catch(err => {
          // Time's up
        });
      } else {
        cardToSave["card"] = newCard;
        saveCard(cardToSave);
      }
      break;
    case "mypredictions":
      if (!fs.existsSync(bingoCard)) {
        message.channel.send("You don't have a bingo card! `" + PRefix + "roll` to create one.");
        return;
      }
      message.channel.send(showPredictions(jsonContent.card));
      break;
    case "mycard":
      if (!fs.existsSync(bingoCard)) {
        message.channel.send("You don't have a bingo card! `" + PRefix + "roll` to create one.");
      }
      let cardDisplay = "```|";
      let lineCount = 1;
      for (let i = 1; i <= 25; i++) {
        let cellName = "cell-" + i;
        if (jsonContent["card"][cellName]["confirmed"] == false) {
          cardDisplay += " ✖ |";
        } else if (jsonContent["card"][cellName]["confirmed"] == true){
          cardDisplay += " ◯ |";
        }
        lineCount++;
        if (lineCount == 6 && i != 25) {
          cardDisplay += "\n|";
          lineCount = 1;
        }
      }
      cardDisplay += "```";
      message.channel.send(cardDisplay);
      break;
    case "confirm":
      if (!admins.indexOf(message.author)) {
        message.channel.send("YOU ARE NOT AUTHORIZED TO USE THIS TOOL");
        return;
      }
      if (args.length == 0) {
        message.channel.send("You didn't submit anything to confirm.");
        return;
      }
      if (enrollable) {
        message.author.send("Enrollments are still open. Update `config/config.json` to start confirming.");
        return;
      }
      let confirmed = args.join(" ");
      let cards = [];
      fs.readdirSync("./cards/").forEach(file => {
        cards.push(file);
      });
      cards.forEach(function(card) {
        let pathToCard = "./cards/" + card;
        let newCard = {"rolls": jsonContent.rolls, "card": {}};
        let confirmationMessage = "";
        for (let key of Object.keys(oldCard)) {
          newCard["card"][key] = {};
          newCard["card"][key]["value"] = oldCard[key]["value"];
          if (oldCard[key]["value"].toLowerCase() == confirmed.toLowerCase()) {
            confirmationMessage += oldCard[key]["value"] + " :white_check_mark:"
            newCard["card"][key]["confirmed"] = true;
          } else {
            newCard["card"][key]["confirmed"] = oldCard[key]["confirmed"];
          }
        }
        saveCard(newCard);
        if (confirmationMessage == "") {
          confirmationMessage += "No one with that prediction. Make sure it's not a typo.";
        }
        message.channel.send(confirmationMessage);
      });
      break;
  }
});

let giveawayActive = true;
let giveawayChannel = '763233532797124649';
let lastMessageID = '';
let lastUserID = '';

function CheckWinner(message) {
    if (message.id === lastMessageID) {
        giveawayActive = false;
        message.channel.send({embed: {
  color: 3066993,
  description: `Congratulations ${message.author}, you won the survival contest!`
}});
    db.set(`lms_${message.author.id}`, message.author.id) 
    }
}

function clean(text) {
    if (typeof(text) === "string")
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function FlipCoin()
{
    return Math.floor(Math.random() * 100) % 2;
}

let CHANNELID = '763233532797124649';

function ContestInfo(message) {
    if (giveawayActive) {
       const trueembed = new MessageEmbed()
             
             .setColor("RANDOM")
             .setDescription("Contest is running!")
             .setTimestamp()
        if(message.channel.id === CHANNELID) return message.channel.send(trueembed);
    } else {
        const falseembed = new MessageEmbed()
             .setColor("RANDOM")
             .setDescription("Contest is not running!")
             .setTimestamp()
        if(message.channel.id === CHANNELID) return message.channel.send(falseembed);
    }
}

setInterval(function(){
let st=["What am i supposed to write here!" ,"I'm Ok Now!" ,"+help" ,"+invite" ,"Dm me for help!" ,"Noob Army Official" ,"Type prefix to know my prefix" ,"My Prefix is +" ,"https://discord.gg/noobarmy" ,"With my owner @Aᴋ᭄Abhiᴮᴼˢˢ࿐#9999"];
let sts= st[Math.floor(Math.random()*st.length)];
bot.user.setPresence({ activity: { name: sts }, status: 'online' })
.catch(console.error);
},15000);

const {
    getUpcommingMatch,
    getPlayerStats,
    getLiveData,
} = require('./dataFetch.js');

const request = require('request');
const cheerio = require('cheerio');

const PAGE_URL = 'https://www.iplt20.com/points-table/2020';

sendLiveData = (data, channel) => {
    var title = data['score']
    var score = data['stat']
    if(typeof(title) ===  'undefined' || typeof(score) ==='undefined'){
        title="Oops!! Please try again after sometime"
        score="Perhaps there is no live game!! Or wait a couple of minutes"
    }
    const liveEmbed = new MessageEmbed()
        .setColor("RANDOM")
        .setURL('https://discord.gg/WGtQPBWpT8')
        .setTitle(title)
        .setDescription(score)
        .setThumbnail('https://i.imgur.com/WdkS5wH.jpg')
        .setTimestamp();

    channel.send(liveEmbed);
};

sendStandings = (channel) => {
    let table = [],
        row = [],
        teamNames = [];
    try {
        request(PAGE_URL, (error, response, html) => {
            if (!error && response.statusCode == 200) {
                const $ = cheerio.load(html);
                $('.standings-table__team-name--short').each((i, el) => {
                    const item = $(el).text();
                    teamNames.push(item);
                });

                $('.standings-table td').each((i, el) => {
                    const item = $(el).text();
                    if (i % 12 == 0) {
                        row = [];
                        // row.push(item);
                    } else if (i % 12 == 11) {
                        table.push(row);
                    } else if (
                        i % 12 != 1 &&
                        i % 12 != 6 &&
                        i % 12 != 5 &&
                        i % 12 != 8 &&
                        i % 12 != 9
                    ) {
                        row.push(item.replace(' ', ''));
                    }
                });

                headers = [
                    'Teams',
                    'Played',
                    'Win',
                    'Lose',
                    'Net RR',
                    'Points',
                ];
                const SPACE = 6;
                let msg = '```|';
                for (let i = 0; i < headers.length; i++) {
                    msg +=
                        '  ' +
                        headers[i] +
                        ' '.repeat(SPACE - headers[i].length) +
                        '|';
                }
                msg += '\n';
                for (let i = 0; i < headers.length; i++) {
                    msg += '-'.repeat(SPACE + 3);
                }
                msg += '\n|';
                for (let i = 0; i < 8; i++) {
                    msg +=
                        '  ' +
                        teamNames[i] +
                        ' '.repeat(SPACE - teamNames[i].length) +
                        '|';
                    for (let j = 0; j < table[0].length; j++) {
                        msg +=
                            '  ' +
                            table[i][j] +
                            ' '.repeat(SPACE - table[i][j].length) +
                            '|';
                    }
                    if (i != 7) {
                        msg += '\n|';
                    }
                }
                msg += '```';
                channel.send('**IPL 2020 Standings**\n');
                channel.send(msg);
            }
        });
    } catch (err) {
        console.log(err);
        channel.send('> Something went wrong :(');
    }
};

formatDDMMYY = (date) => {
    let res = '';
    date = new Date(date);
    res +=
        date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
    return 'Date: ' + res;
};

formatTime = (date) => {
    let res = '';
    date = new Date(date);
    mins = date.getMinutes() + 30;
    hour = date.getHours() + Math.floor(mins / 60) + 5;
    mins = mins % 60;
    res += hour + ':' + mins.toString().padStart(2, '0');
    return 'Time: ' + res;
};

sendScheduleMatch = (matches, channel) => {
    let fields = [];
    if (matches.length > 6) {
        matches = matches.slice(0, 6);
    }
    for (match of matches) {
        fields.push({
            name: match['team-1'],
            value: formatDDMMYY(match['dateTimeGMT']),
            inline: true,
        });
        fields.push({
            name: match['team-2'],
            value: formatTime(match['dateTimeGMT']),
            inline: true,
        });
        fields.push({ name: '\u200B', value: '\u200B' });
    }

    const matchEmbed = new MessageEmbed()
        .setColor("RANDOM")
        .setURL('https://discord.gg/WGtQPBWpT8')
        .setTitle('Upcoming Matches')
        .setDescription('Team 1  vs  Team 2')
        .setThumbnail('https://i.imgur.com/WdkS5wH.jpg')
        .addFields(fields)
        .setTimestamp();

    channel.send(matchEmbed);
};

sendPlayerStats = (stats, channel) => {
    try {
        const matchEmbed = new MessageEmbed()
            .setColor("RANDOM")
            .setURL('https://discord.gg/WGtQPBWpT8')
            .setTitle(stats['fullName'])
            .setDescription(stats['country'])
            .setThumbnail(stats['imageURL'])
            .addFields([
                {
                    name: 'Teams',
                    value: stats['majorTeams'].split(','),
                },
                { name: 'Playing Role', value: stats['playingRole'] },
                {
                    name: 'Batting Style',
                    value: stats['battingStyle'],
                    inline: true,
                },
                {
                    name: 'Batting Style',
                    value: stats['battingStyle'],
                    inline: true,
                },
                { name: 'Current Age', value: stats['currentAge'] },
            ])
            .setImage(stats['imageURL'])
            .setTimestamp();
        channel.send(matchEmbed);
    } catch (err) {
        channel.send('> Sorry something went wrong !!');
    }
}

bot.on('message', (message) => {
    if (message.author.bot) return;
    if (blockedUsers.includes(message.author.id)) return message.author.send("You are blocked!");
    if (message.content.startsWith(PREFIX)) {
        const [CMD_NAME, ...args] = message.content
            .trim()
            .substring(PREFIX.length)
            .split(/\s+/);

        if (CMD_NAME == 'upcoming') {
            let upcommingMatch = getUpcommingMatch();
            sendScheduleMatch(upcommingMatch, message.channel);
        } else if (CMD_NAME == 'player') {
            if (args.length === 0) {
                message.channel.send(
                    '```Enter player name\n Correct syntax: $player <player_name> .\nFor more help type $help```'
                );
                return;
            }
            const name = args.join(' ');
            const playerStat = getPlayerStats(name);
            if (playerStat == null) {
                message.channel.send(
                    '```Enter player name\nCorrect syntax: $player <player_name> \nFor more help type $help```'
                );
                return;
            }
            playerStat.then((value) => {
                sendPlayerStats(value, message.channel);
            });
            return;
        } else if (CMD_NAME === 'standings') {
            sendStandings(message.channel);
            return;
        } else if (CMD_NAME === 'live') {
            const liveData = getLiveData();
            liveData.then((val) => {
                sendLiveData(val, message.channel);
            });
            return;
        }
    }
})

bot.on("ready", () => {
    console.log("GuessTheNumber is Ready!");
});

// Abyss reminder in Sky
//CRON_TZ="Asia/Singapore"
let scheduledMessage = new cron.CronJob('30 6,18,21 * * 1-6', test => {
  // This runs every Tue and Sun at 20:00:00
  // 2000 local is 1200 
  let abyss_channel = bot.channels.cache.get(`763233532797124649`)
  abyss_channel.send("Abyss ending today!! " + '<@&769942587666464819>')
  // pings Abyss Ping role
});

// Abyss reminder in 233
let abyssTwothreethree = new cron.CronJob('30 7,19 * * 1-6', test => {
  // This runs every Tue and Sun at 18:00:00
  // 1800 local is 1000 
  let huangwu_zh = bot.channels.cache.get(`763233532797124649`)
  const attachment = new MessageAttachment("https://cdn.discordapp.com/attachments/672091622619480066/715150933297987604/image0.jpg");
  huangwu_zh.send(attachment)
});


/* experimental
let scheduledXdress = new cron.CronJob('* * * * *', test => {
  // This runs every Tue and Sun at 20:00:00
  // 2000 local is 1200 
  let abyss_channel = bot.channels.cache.get(`675356163432513536`)
  abyss_channel.send("crossdress <@" + '471300810194681866' + ">")
  // pings hibiki
});
scheduledXdress.start()
*/

scheduledMessage.start()
abyssTwothreethree.start()

let battlelimit = 100; 
let battlenumber = Math.floor(Math.random()* Math.floor(battlelimit));
let limit = 20000; // You can change it through /limit command
let number = Math.floor(Math.random()* Math.floor(limit)); // You can custom it through /number command and reroll it through /reroll
let ownerID = '688671832068325386';
let channelID = '769473798978142210';

bot.on('message', async message => {
    try {
        if (/^[0-9]*$/.test(message.content) == false) {
            if (message.content == "+contestinfo" || message.author.bot == true || message.channel.type == 'dm' || message.channel.id != "769473798978142210") {
                return;
            }
        
            message.delete();
const guessemb = new MessageEmbed()
     .setURL('https://discord.gg/WGtQPBWpT8')
     .setTitle("Noob Army Guess the Number Contest")
     .setColor("RANDOM")
     .setTimestamp()
     .setDescription(`You can only send numbers in <#${message.channel.id}>!`)

            message.author.send(guessemb)
 }
    }
    catch(e){console.log(e)}
});

bot.on('message', async message => {
    
    if(message.content == "+restart") {
        if(message.author.id !== ownerID) return message.reply(`You don't have the permission to run this command.`);
        message.react('✅');
        setTimeout(function() {
        	process.exit(0);
        }, 1000);
    }
    if(message.content == "+help") {
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
  .setURL('https://cdn.discordapp.com/attachments/688674336240173086/787879241886597131/Screenshot_2020-12-13-07-57-552.jpg')
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
    if(message.content == "+contestinfo" ) {
	 const helpembed = new MessageEmbed()
            .setColor("RANDOM")
            .setAuthor("Noob Army Guess the Number Contest", message.author.displayAvatarURL())
            .setDescription("Hello everyone! Welcome to Guess The Number! Contest Are you feeling lucky today? Well you better be, because this contest will need all your lucky stars to align! \n\n Details: \n - One number in the range of 0 to 20k(+contestinfo for an accurate number) will be the correct number, and whoever guesses this number correctly will be the winner! \n - Just keep guessing the number here and <@758889056649216041> will take care of the rest! \n - Use +contestinfo for more details (Will only work in <#769473798978142210>) \n\n Rules: \n - Do not spam anything apart from your guesses. \n - Use only the <#769473798978142210>: channel to make your gueses.")
            .setTimestamp()
            .setFooter("Noob Army");
	if(message.channel.id === channelID) return message.author.send(helpembed);
    }
    if(message.content == "+viewbattlenumber") {
        if(message.author.id !== ownerID) return message.reply(`You don't have the permission to run this command.`);
        message.author.send({embed: {
   color: 3066993,
   description:`The current number is ${battlenumber}`
}});
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
        if(message.content.startsWith("+winnersgtn")) {
        if(message.author.id !== ownerID)  return message.reply(`You don't have the permission to run this command.`);
        let winner = db.fetch(`winner_${message.author.id}`)
        if (!winner) return message.reply("No Winner yet!");
      let winnerEmbed = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`Winner of this GTN contest is <@${winner}>`);
  message.channel.send(winnerEmbed)
     }
        if(message.content.startsWith("+resetwinnersgtn")) {
        if(message.author.id !== ownerID)  return message.reply(`You don't have the permission to run this command.`);
        db.delete(`winner_${message.author.id}`)
        let winnerEmbed = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`Successfully,Resetted GTN winner! \n Now you can unlock this channel and Start GTN again!`);
  message.channel.send(winnerEmbed)
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
            if(message.content > limit)
              
   return message.author.send({embed: {
   color: 3066993,
   description: `The number is between 1 and ${limit}! Try again`}});
            if(message.content < 1)
               
    return message.author.send({embed: {
   color: 3066993,
   description: `The number cannot be negative! Try again`}});
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
                db.set(`winner_${message.author.id}`, message.author.id) 
                db.add(`realmoney_${message.guild.id}_${message.author.id}`, 50);
		number = Math.floor(Math.random()* Math.floor(limit));
            }
        } else return
    }
});

bot.on("ready", async () => {
   const id = "688671832068325386"; // Discord User IDs look like a long string of random numbers

  const user = await bot.users.fetch(id);

  // Create/access a DM thread between the bot account and the user
  const dms = await user.createDM();
   const sendembed = new MessageEmbed()
    .setColor("RANDOM")
    .setDescription("I'm Online")
    .setTimestamp()
  dms.send(sendembed);

});

bot.on("message", async message => {
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

  if (message.channel.id === giveawayChannel) {
    if (giveawayActive && !message.author.bot && !blacklist.includes(message.author.id)) {
        if (!roleblacklist.some(role => { if(message.member.roles.cache.has(role)) return true; })) {
            if(lastUserID !== message.author.id) {
            lastUserID = message.author.id;
            lastMessageID = message.id;
            setTimeout(CheckWinner, 30000, message);
           }
        }
    }
}

   if(message.content.startsWith("+restartlms")) {
        if(message.author.id !== ownerID)  return message.reply(`You don't have the permission to run this command.`);
        db.delete(`lms_${message.author.id}`)
        let winnerEmbed = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`Successfully,Restarted LMS contest!`);
  message.channel.send(winnerEmbed)
        giveawayActive = true;
     }
     if(message.content.startsWith("+pauselms")) {
        if(message.author.id !== ownerID)  return message.reply(`You don't have the permission to run this command.`);
        const winnerEmbed = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`Successfully,Paused LMS contest!`);
  message.channel.send(winnerEmbed)
         giveawayActive = false;       
     }
     if(message.content.startsWith("+contestinfo")) {
      ContestInfo(message);
     }
     if(message.content.startsWith("+winnerslms")) {
        if(message.author.id !== ownerID)  return message.reply(`You don't have the permission to run this command.`);
        let winner = db.fetch(`lms_${message.author.id}`)
        if (!winner) return message.reply("No Winner yet!");
      let winnerEmbed = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`Winner of this LMS contest is <@${winner}>`);
  message.channel.send(winnerEmbed)
     }
})

bot.on("guildCreate", (guild) => {
  const channel = guild.channels.cache.find(
    (c) => c.type === "text" && c.permissionsFor(guild.me).has("SEND_MESSAGES")
  );
   const embed = new MessageEmbed()
     .setTitle("Noob Army")
     .setURL('https://discord.gg/WGtQPBWpT8')
     .setDescription("Thanks for inviting me into this server!\n My Prefix is \`+\`")
     .setColor("RANDOM")
     .setTimestamp()
     .setFooter("Type +help for more info!");
  if (channel) {
    channel.send(embed);
  } else {
    console.log(`can\`t send welcome message in guild ${guild.name}`);
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
    if(Owner.id !== "688671832068325386" && Owner.id !== "213588167406649346") return m.reply({embed: {
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
    if(Owner.id !== "688671832068325386" && Owner.id !== "213588167406649346") return m.reply({embed: {
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

const invites = {}

    const getInviteCounts = async (guild) => {
        return await new Promise(resolve => {
            guild.fetchInvites().then(invites => {
                const inviteCounter = {}

                invites.forEach(invite => {
                    const { uses, inviter } = invite
                    const { username, discriminator } = inviter

                    const name = `${username}#${discriminator}`

                    inviteCounter[name] = (inviteCounter[name] || 0) + uses


                });

                resolve(inviteCounter)
            })
        })

    }

    bot.guilds.cache.forEach(async (guild) => {
        invites[guild.id] = await getInviteCounts(guild);

    })

    bot.on("guildMemberAdd", (member) => { //usage of welcome event
  let chx = db.get(`welchannel_${member.guild.id}`); //defining var
  var def_chx = guild.channels.cache.filter(chx => chx.type === "text" && chx.permissionsFor(guild.me).has("SEND_MESSAGES")).find(x => x.position === 0);

  if(chx === null) chx = 'def_chx';

  let wembed = new MessageEmbed() //define embed
  .setAuthor(member.user.username, member.user.avatarURL())
  .setColor("RANDOM")
  .setThumbnail(member.user.avatarURL())
  .setDescription(`We are very happy to have you in our server! \n\n 1) Make Sure You Read Our Rules and Regulations! \n 2) Be Friendly! \n 3) Enjoy here by Staying with friends! \n\n 🙂Thanks for joining our server!🙂`);
  
  bot.channels.cache.get(chx).send(wembed) //get channel and send embed
});

bot.on("message", async (message) => { // eslint-disable-line
    if (message.author.bot) return;
    if (blockedUsers.includes(message.author.id)) return message.author.send("You are blocked!");
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
            .setDescription(`[Click here!](https://discord.com/api/oauth2/authorize?client_id=787879524037689355&permissions=8&scope=bot)`)
            .setTimestamp()
            .setFooter("Noob Army Official", "https://cdn.discordapp.com/attachments/688674336240173086/787879241886597131/Screenshot_2020-12-13-07-57-552.jpg");
        message.reply(helpembed);
    }
    if (command === "pornn") {
 const randomPuppy = require('random-puppy')

 if(!message.channel.nsfw) {return message.channel.send(`:underage: **This channel is not marked as NSFW!** :angry: `)}
  else{
  randomPuppy('porn')
            .then(url => {
                const embed = new MessageEmbed()
                .setURL('https://discord.gg/WGtQPBWpT8')
                .setTitle(`PORN`)
                .setFooter(`Command Used by ${message.author.tag}`)
                .setImage(url)
                .setColor("RANDOM")
    return message.channel.send({ embed });
            })
  }
}
    if (command === "meme" ) {
        const randomPuppy = require('random-puppy');
        

        const subReddits = ["dankmemes", "meme", "memes"]
        const random = subReddits[Math.floor(Math.random() * subReddits.length)]
  
        const img = await randomPuppy(random);
  
        const memeEmbed = new MessageEmbed()
        .setColor("RANDOM")
        .setURL('https://discord.gg/WGtQPBWpT8')
        .setImage(img)
        .setTitle(`Your meme. From r/${random}`)
  
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
    .setURL('https://discord.gg/WGtQPBWpT8')
    .setTitle("Support Info")
    .addField("To see the bot commands use", "`+help`")
    .addField("To report bug use", "`+contact <reason>`")
    .addField("If you need help with somehign else, Join server and Dm Aᴋ᭄Abhiᴮᴼˢˢ࿐", "[Support Sever](https://discord.gg/WGtQPBWpT8)")

    message.channel.send(embed)
}
    if(command === "allcommands" || command === "ac" ) {
    const acEmbed = new MessageEmbed()
         .setTitle("Commands List")
         .setURL('https://discord.gg/WGtQPBWpT8')
         .setDescription(`invite \n meme \n ping \n report \n support \n help \n args-info \n role create or delete \n mute \n announce \n oldestmember \n youngestmember \n poll \n advertise \n embed \n slowmode \n timer \n ascii \n finduser \n Blacklist \n deletewarns \n warn \n warnings \n bal \n hastebin \n beg \n daily \n profile \n rob \n roulette \n sell \n slots \n weekly \n pay \n deposit \n addmoney \n remove money \n work \n buy \n store \n store info \n withdraw \n inventory \n leaderboard \n colour \n changemy mind \n beautify \n calculate \n give me ajoke \n add role \n remove role \n answer \n clap \n suggest \n contact \n eval \n morse \n reverse \n flip \n google \n level \n pokemon \n add command \n delete command \n imdb \n rate \n kill \n translate \n covid stats \n say \n purge \n channel invite \n stats \n uptime \n leave \n setbotnick \n avatar \n carona virus \n covid checking \n serverinfo \n userinfo \n roles \n check perms \n botinfo \n emoji \n settimerinseconds \n unmute \n kick \n ban \n play \n search \n queue \n stop \n skip \n volume \n skip \n pause \n loop \n nowplaying \n resume \n mod-everyone \n unmod-everyone \n create-mod \n check-mod \n can-kick \n make-private \n create-private \n un-private \n my-permissions \n  lock-permissions \n role-permissions `)
         .setColor("RANDOM")
         .setTimestamp();
    message.channel.send(acEmbed)
    }
            
    if(command === 'hostingrecords' || command === 'hr') {
       const guildId = '785777717966536724';
        let Owner = message.author;
    if(Owner.id !== "688671832068325386" && Owner.id !== "213588167406649346") return message.reply({embed: {
    color: 3066993,
    description:"Sorry, You can't use this command!"
}})
        //Has to be in DMs
        if(message.channel.type != 'dm') {
            message.channel.send('Use this command in my DMs!');
            return;
        }
        message.author.send('Record Started!');

        //First Question
        await message.author.send(`Tournament Name\n(Ex : NA | FF SOLO 109 || POWERED BY GAME.TV)`);
        let answer = await message.channel.awaitMessages(answer => answer.author.id != bot.user.id,  {max: 1});
        const age = (answer.map(answers => answers.content).join());

        //Second Question
        await message.author.send('Screenshot Link');
        answer = await message.channel.awaitMessages(answer => answer.author.id != bot.user.id,  {max: 1});
        const ss = (answer.map(answers => answers.content).join());

        //Third Question
        await message.author.send(`Winner IGN\n(Ex : Aᴋ᭄Abhiᴮᴼˢˢ࿐)`);
        answer = await message.channel.awaitMessages(answer => answer.author.id != bot.user.id,  {max: 1});
        const ign = (answer.map(answers => answers.content).join());

        //Fourth Question
        await message.author.send(`Room created by\n(Ex : Aᴋ᭄Abhiᴮᴼˢˢ࿐#9999)`);
        answer = await message.channel.awaitMessages(answer => answer.author.id != bot.user.id,  {max: 1});
        const room = (answer.map(answers => answers.content).join());

        //Fifth Question
        await message.author.send('Any Remarks/Issues');
        answer = await message.channel.awaitMessages(answer => answer.author.id != bot.user.id,  {max: 1});
        const location = (answer.map(answers => answers.content).join());

        //Embed
        const winner = new MessageEmbed()
         .addField('*Tournament Name:*', age)
         .addField('*IGN:*', ign)
         .setTimestamp()
         .setFooter(`Updated by ${message.author.tag}`)
         .setColor("RANDOM");

        //Embed
        const created = new MessageEmbed()
         .setTitle(age)
         .addField('*Room Created By*', room)
         .setTimestamp()
         .setColor("RANDOM");

        const embed = new MessageEmbed()        
        .addField('*Tournament Name:*', age)
        .addField('*Winner IGN:*', ign)
        .addField('*Screenshot:*', ss)
        .addField('*Room Created By:*', room)
        .addField('*Remarks:*', location)
        .setImage(ss)
        .setFooter(`Updated by ${message.author.tag}`)
        .setTimestamp()
        .setColor("RANDOM");

        const checkemb = new MessageEmbed()        
        .addField('*Tournament Name:*', age)
        .addField('*Screenshot:*', ss)
        .addField('*IGN:*', ign)
        .addField('*Room Created By:*', room)
        .addField('*Remarks:*', location)
        .setImage(ss)
        .setTimestamp()
        .setColor("RANDOM");

    const emoji1 = '❌'
    const emoji = '✅'
    message.channel.send(`${message.author}*Check Whether You Entered Details Correctly Or Not?*\nReact with ✅ to submit!\nReact with ❌ to cancel!`, checkemb).then(msg => {
        msg.react(emoji).then(r => {
            msg.react(emoji1)
            const yes = (reaction, user) => reaction.emoji.name === emoji && user.id === message.author.id;
            const nopleas = (reaction, user) => reaction.emoji.name === emoji1 && user.id === message.author.id;
            const sure = msg.createReactionCollector(yes, {
                time: 600000,
                errors: ['time'],
            });
            const no = msg.createReactionCollector(nopleas, {
                time: 600000,
                errors: ['time'],
            });
            sure.on('collect', r => {
                msg.delete();
        const guild = bot.guilds.cache.get(guildId);
        const guildu = bot.guilds.cache.get(guildId);
        const roomuu = bot.guilds.cache.get(guildId);
        guild.channels.cache.find(channel => channel.name === '𒃽・ʜᴏꜱᴛɪɴɢ-ʀᴇᴄᴏʀᴅꜱ').send(embed);
        guildu.channels.cache.find(channel => channel.name === '𒃽・ᴡʀɪᴛᴛᴇɴ-ʀᴇᴄᴏʀᴅꜱ').send(winner);
        roomuu.channels.cache.find(channel => channel.name === '𒃽・ᴄᴜꜱᴛᴏᴍ-ʀᴇᴄᴏʀᴅꜱ').send(created);
        message.author.send({embed: {
  color: 3066993,
  description: "Successfully Recorded!"
}});
            })
            no.on('collect', r => {
                  msg.delete();
                  message.author.send({embed: {
  color: 3066993,
  description: "Recorded Cancelled\nTo Record/Submit Details again Type *+hr*!"
}});
            })
        })
    }).catch(() => msg.edit({embed: {
  color: 3066993,
  description: "Recorded Cancelled!\nReason: Time's Up!\nTo Record/Submit Details again Type *+hr*!"
}}));
 }
    if(command === 'hostingtime' || command === 'ht') {
       const guildId = '785777717966536724';
        let Owner = message.author;
    if(Owner.id !== "688671832068325386" && Owner.id !== "213588167406649346") return message.reply({embed: {
    color: 3066993,
    description:"Sorry, You can't use this command!"
}})
        //Has to be in DMs
        if(message.channel.type != 'dm') {
            message.channel.send('Use this command in DMs!');
            return;
        }
        message.author.send('Record Started!');

        //First Question
        await message.author.send(`Date and Month\n(Ex : 10th Feb)`);
        let answer = await message.channel.awaitMessages(answer => answer.author.id != bot.user.id,  {max: 1});
        const age = (answer.map(answers => answers.content).join());

        //Second Question
        await message.author.send('Timings\n(Ex : 11:00 AM\n12:00 PM\netc...)');
        answer = await message.channel.awaitMessages(answer => answer.author.id != bot.user.id,  {max: 1});
        const name = (answer.map(answers => answers.content).join());

        //Embed
        const time = new MessageEmbed()
         .setTitle(age)
         .addField('*Timings:*', name)
         .setTimestamp()
         .setFooter(`Be Ready...`)
         .setColor("RANDOM");
           
        const emoji1 = '❌'
    const emoji = '✅'
    message.channel.send(`${message.author}*Check Whether You Entered Details Correctly Or Not?*\nReact with ✅ to submit!\nReact with ❌ to cancel!`, time).then(msg => {
        msg.react(emoji).then(r => {
            msg.react(emoji1)
            const yes = (reaction, user) => reaction.emoji.name === emoji && user.id === message.author.id;
            const nopleas = (reaction, user) => reaction.emoji.name === emoji1 && user.id === message.author.id;
            const sure = msg.createReactionCollector(yes, {
                time: 600000,
                errors: ['time'],
            });
            const no = msg.createReactionCollector(nopleas, {
                time: 600000,
                errors: ['time'],
            });
            sure.on('collect', r => {
                msg.delete();
        //Sending Embed
        const guildu = bot.guilds.cache.get(guildId);
        guildu.channels.cache.find(channel => channel.name === '𒃽・ʜᴏꜱᴛɪɴɢ-ᴛɪᴍᴇ').send(`<@&785810182797131786>`, time);
        message.author.send({embed: {
  color: 3066993,
  description: "Successfully Recorded!"
}});
            })
            no.on('collect', r => {
                  msg.delete();
                  message.author.send({embed: {
  color: 3066993,
  description: "Recorded Cancelled\nTo Record/Submit Details again Type *+hr*!"
}});
            })
        })
    }).catch((collect) => msg.edit({embed: {
  color: 3066993,
  description: "Recorded Cancelled!\nReason: Time's Up!\nTo Record/Submit Details again Type *+hr*!"
}}));
        
    }
    if(command === 'prizeclaim') {
       const guildId = '785777717966536724';
        let Owner = message.author;
    if(Owner.id !== "688671832068325386" && Owner.id !== "213588167406649346") return message.reply({embed: {
    color: 3066993,
    description:"Sorry, You can't use this command!"
}})
        let useru = message.mentions.users.first();
        const sendu = new MessageEmbed()
              .setTitle("Hey Congratulations on winning tournament in NOOB ARMY || POWERED BY GAME.TV🎉")
              .setColor("RANDOM")
              .setDescription(`[NOOB ARMY(NA)](https://discord.gg/noobarmy)`)
              .addField("Prize Claim Form Process Started:", "Answer for my questions to claim your prize!")
              .setTimestamp()
              .setFooter(`If i am not giving any reply for your answers/any issues found Dm @Aᴋ᭄Abhiᴮᴼˢˢ࿐#9999 from NA server!`)
        useru.send(sendu);
        

        //First Question
        await useru.send(`In which method you wanted to claim your prize?\n\n1)1 Weekly Membership\n2)110 Diamonds\n3)75rs PayTm OR 75rs Redeem Code`);
        let answer = await useru.dmChannel.awaitMessages(answer => answer.author.id != bot.user.id,  {max: 1});
        let processing = await message.channel.send({embed: {
  color: 3066993,
  description: `Prize claim process started with ${useru}'s Dm!`
}});
        const age = (answer.map(answers => answers.content).join());

        //Second Question
        await useru.send(`Your IN-GAME-NAME(IGN)\n(Ex : Aᴋ᭄Abhiᴮᴼˢˢ࿐)`);
        answer = await useru.dmChannel.awaitMessages(answer => answer.author.id != bot.user.id,  {max: 1});
        const ign = (answer.map(answers => answers.content).join());

        //Third Question
        await useru.send(`Your UNIQUE-ID in game(UID)\n(Ex : 1278741067)`);
        answer = await useru.dmChannel.awaitMessages(answer => answer.author.id != bot.user.id,  {max: 1});
        const uid = (answer.map(answers => answers.content).join());

        //Fourth Question
        await useru.send(`If 75rs,Send me your Paytm number & Name associated with your Paytm number(MUST HAVE FULL KYC)!\nIf not,type *none* to skip this question!`);
        answer = await useru.dmChannel.awaitMessages(answer => answer.author.id != bot.user.id,  {max: 1});
        const paytm = (answer.map(answers => answers.content).join());

        //Embed
        const win = new MessageEmbed()
         .setTitle("Noob Army Prize Claim")
         .setURL('https://discord.gg/noobarmy')
         .setColor("RANDOM")
         .addField('*Prize Method:*', age)
         .addField('*IGN:*', ign)
         .addField('*UID:*', uid)
         .addField('*Paytm Number & Name Associated with Paytm:*', paytm)
         .setTimestamp()
         .setFooter(`From : ${useru.tag}`);
                   
    const emoji1 = '❌'
    const emoji = '✅'
    useru.send(`${useru}*Check Whether You Entered Details Correctly Or Not?*\nReact with ✅ to submit!\nReact with ❌ to cancel!`, win).then(msg => {
        msg.react(emoji).then(r => {
            msg.react(emoji1)
            const yes = (reaction, user) => reaction.emoji.name === emoji && user.id === useru.id;
            const nopleas = (reaction, user) => reaction.emoji.name === emoji1 && user.id === useru.id;
            const sure = msg.createReactionCollector(yes, {
                time: 600000,
                errors: ['time'],
            });
            const no = msg.createReactionCollector(nopleas, {
                time: 600000,
                errors: ['time'],
            });
            sure.on('collect', r => {
                msg.delete();
        //Sending Embed
        const guildu = bot.guilds.cache.get(guildId);
        guildu.channels.cache.find(channel => channel.name === '𒃽・ᴘʀɪᴢᴇ-ʀᴇᴄᴏʀᴅꜱ').send(win);
        useru.send({embed: {
  color: 3066993,
  description: "Successfully Form Recorded!"
}});
            })
            no.on('collect', r => {
                  msg.delete();
                  useru.send({embed: {
  color: 3066993,
  description: "Form Claim Process Cancelled\nTo Fill Form Again DM Aᴋ᭄Abhiᴮᴼˢˢ࿐#9999 in https://discord.gg/noobarmy server!"
}});
            })
        })
    }).catch((collect) => msg.edit({embed: {
  color: 3066993,
  description: "Recorded Cancelled!\nReason: Time's Up!\nTo Record/Submit Details again Type *+hr*!"
}}));
        
    }
    if (command === "ff") {
    message.channel.send("UID : 1278741067\nIGN : Aᴋ᭄Abhiᴮᴼˢˢ࿐")
    }
    if (command === "seizure") {
    const emoji1 = '🇳'
    const emoji = '🇾'
    message.channel.send('Attention: This command could give you a mini seizure.. Do you want to continue?\nBy accepting you are responsible for giving other people seizures.').then(msg => {
        msg.react(emoji).then(r => {
            msg.react(emoji1)
            const yes = (reaction, user) => reaction.emoji.name === emoji && user.id === message.author.id;
            const nopleas = (reaction, user) => reaction.emoji.name === emoji1 && user.id === message.author.id;
            const sure = msg.createReactionCollector(yes, {
                time: 1000000
            });
            const no = msg.createReactionCollector(nopleas, {
                time: 1000000
            });
            sure.on('collect', r => {
                msg.delete();
                const emb = new MessageEmbed()
                    .setColor(0xFFFF00)
                    .setImage('https://cdn.glitch.com/ce500e3d-b500-47a8-a6a8-c0b5657d808c%2FWebp.net-gifmaker.gif')
                    .setFooter(`Command Used by : ${message.author.tag}`);
                message.channel.send({
                    embed: emb
                })
            })
            no.on('collect', r => {
                msg.delete();
            })
        })
    })
}
    if (command === "pages" ) {
    
let pages = ['Page one!', 'Second page', 'Third page']
let page = 1 

const embed = new Discord.MessageEmbed() // Define a new embed
.setColor(0xffffff) // Set the color
.setFooter(`Page ${page} of ${pages.length}`)
.setDescription(pages[page-1])

message.channel.send({embed}).then(msg => {
  msg.react('⬅').then( r => {
    msg.react('➡')

    // Filters
    const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅' && user.id === message.author.id
    const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡' && user.id === message.author.id

    const backwards = msg.createReactionCollector(backwardsFilter, {timer: 6000})
    const forwards = msg.createReactionCollector(forwardsFilter, {timer: 6000})

    backwards.on('collect', (r, u) => {
        if (page === 1) return r.users.remove(r.users.cache.filter(u => u === message.author).first())
        page--
        embed.setDescription(pages[page-1])
        embed.setFooter(`Page ${page} of ${pages.length}`)
        msg.edit(embed)
        r.users.remove(r.users.cache.filter(u => u === message.author).first())
    })

    forwards.on('collect', (r, u) => {
        if (page === pages.length) return r.users.remove(r.users.cache.filter(u => u === message.author).first())
        page++
        embed.setDescription(pages[page-1])
        embed.setFooter(`Page ${page} of ${pages.length}`)
        msg.edit(embed)
        r.users.remove(r.users.cache.filter(u => u === message.author).first())
    })
  })
})

}
});

bot.on("message", async (message) => { // eslint-disable-line
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;
    if (blockedUsers.includes(message.author.id)) return message.author.send("You are blocked!");
    if (!message.channel.permissionsFor(bot.user).has('SEND_MESSAGES')) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    // the rest of your code
    if (command === "ticket") {
const reason = message.content.split(" ").slice(1).join(" ");
    if (!message.guild.roles.cache.find(role => role.name === "support")) {
    const embed0 = new MessageEmbed()
    .setColor("RANDOM")
    .setTimestamp()
    .setDescription(`This server doesn't have a \`Support\` role made, so the ticket won't be opened.\nIf you are an administrator, make one with that name exactly and give it to users that should be able to see tickets.`)
    message.channel.send(embed0);
    return
    }
    if (message.guild.channels.cache.find((ch) => ch.name === "ticket-" + message.author.username)) {
    const embed1 = new MessageEmbed()
    .setColor("RANDOM")
    .addField(`Ticket Bot`, `You already have a ticket open.`)
    message.channel.send(embed1);
    return
    }
    let role = message.guild.roles.cache.find(role => role.name === "support");        
    message.guild.channels.create(`ticket-${message.author.username}`, {
			type: 'text', permissionOverwrites: [
				{
					id: message.guild.id,
					deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
				},
				{
					id: message.author.id,
					allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
				},
				{
					id: role.id,
					allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
				},
			],
    }).then(c => {
       const embed3 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`Hey ${message.author.username}! \n Our **Support Team** will be with you shortly. Please explain your reason for opening the ticket in as much detail as possible.`)
        .setTimestamp();
        c.send(embed3)
   
       const embed2 = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`Your ticket has been created in ` + c.toString())
        .setTimestamp();
        message.channel.send(embed2);
    }).catch(console.error);
  }
   if (command === "add") {
   if (!message.channel.name.startsWith(`ticket-`)) {
    const embed4 = new MessageEmbed()
    .setColor("RANDOM")
    .setDescription(`You can't use the this outside of a ticket channel.`)
    message.channel.send(embed4);
    return
    }
    addedmember = message.mentions.members.first();
    message.channel.overwritePermissions([
  {
     id: addedmember.id,
     allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
  },
]);
    const embed5 = new MessageEmbed()
    .setColor("RANDOM")
    .setDescription('**' + addedmember + `** has been added to the ticket. To Remove type +member`)
    message.channel.send(embed5);

  }
  if (command === "remove") {
  if (!message.channel.name.startsWith(`ticket-`)) {
    const embed6 = new MessageEmbed()
    .setColor("RANDOM")
    .setDescription(`You can't use the this outside of a ticket channel.`)
    message.channel.send(embed6);
    return
    }
    removedmember = message.mentions.members.first();
    message.channel.overwritePermissions([
  {
     id: removedmember.id,
     deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
  },
]);
    const embed7 = new MessageEmbed()
    .setColor("RANDOM")
    .setDescription('**' + removedmember + '** has been removed from the ticket.')
    message.channel.send(embed7);
  }
   if (command === "close") {
   if (!message.channel.name.startsWith(`ticket-`)) {
    const embed8 = new MessageEmbed()
    .setColor("RANDOM")
    .setDescription(`You can't use the this outside of a ticket channel.`)
    message.channel.send(embed8);
    return
    }   

    const embed9 = new MessageEmbed()
    .setColor("RANDOM")
    .setDescription('Are you sure? Once confirmed, you cannot reverse this action!\nTo confirm, type \`+confirm\`. This will time out in 10 seconds and be cancelled.')
    message.channel.send(embed9)
    .then((m) => {
      message.channel.awaitMessages(response => response.content === '+confirm', {
        max: 1,
        time: 10000,
        errors: ['time'],
      })
      .then((collected) => {
          message.channel.delete();
        })
        .catch(() => {
          m.edit('Ticket close timed out, the ticket was not closed.').then(m2 => {
              m2.delete();
          }, 3000);
        });
    });
  }
    if (command === 'args-info') {
	if (!args.length) {
		return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
	}
	else if (args[0] === 'foo') {
		return message.channel.send('bar');
	}

	message.channel.send(`First argument: ${args[0]}`);
    }
    if (command === "quiz" ) {
const quiz = [
  { q: "What color is the sky?", a: ["no color", "invisible"] },
  { q: "Name a soft drink brand.", a: ["pepsi", "coke", "rc", "7up", "sprite", "mountain dew"] },
  { q: "Name a programming language.", a: ["actionscript", "coffeescript", "c", "c++", "basic", "python", "perl", "javascript", "dotnet", "lua", "crystal", "go", "d", "php", "ruby", "rust", "dart", "java", "javascript"] },
  { q: "Who's a good boy?", a: ["you are", "whirl"] },
  { q: "Who created me?", a: ["whirl", "Whirl#9077"] },
  { q: "What programming language am I made in?", a: ["javascript",] },
  { q: "Name the seventh planet from the Sun.", a: ["uranus"] },
  { q: "Name the World's biggest island.", a: ["greenland",] },
  { q: "What's the World's longest river?", a: ["amazon", "amazon river"] },
  { q: "Name the World's largest ocean.", a: ["pacific", "pacific ocean"] },
  { q: "Name one of the three primary colors.", a: ["blue", "red", "yellow"] },
  { q: "How many colors are there in a rainbow?", a: ["7", "seven"] },
  { q: "What do you call a time span of one thousand years?", a: ["millennium"] },
  { q: "How many squares are there on a chess board?", a: ["64", "sixty four"] },
  { q: "How many degrees are found in a circle?", a: ["360", "360 degrees", "three hundred sixty"] },
  { q: "The Dewey Decimal system is used to categorize what?", a: ["books"] },
  { q: "How many points does a compass have?", a: ["32", "thirty two"] },
  { q: "How many strings does a cello have?", a: ["4", "four"] },
  { q: "How many symphonies did Beethoven compose?", a: ["9", "nine"] },
  { q: "How many lines should a limerick have?", a: ["5", "five"] },
  { q: "What is the most basic language Microsoft made?", a: ["visual basic"] },
  { q: "What is the most complicated language?", a: ["binary"] },
  { q: "'OS' computer abbreviation usually means?", a: ["operating system"] }
];
const options = {
  max: 1,
  time: 60000,
  errors: ["time"],
};

  const item = quiz[Math.floor(Math.random() * quiz.length)];
   const quizembed = new MessageEmbed()
     .setTitle("QUIZ")
     .setURL('https://discord.gg/WGtQPBWpT8')
     .setDescription(item.q)
     .setColor("RANDOM")
     .setFooter("Guess the correcr answer within 60seconds and Get Coins")
     .setTimestamp()
  await message.channel.send(quizembed);
  try {
    const collected = await message.channel.awaitMessages(answer => item.a.includes(answer.content.toLowerCase()), options);
    const winnerMessage = collected.first();
    return message.channel.send({embed: new MessageEmbed()
                                 .setAuthor(`Winner: ${winnerMessage.author.tag}`, winnerMessage.author.displayAvatarURL)
                                 .setURL('https://discord.gg/WGtQPBWpT8')
                                 .setTitle(`Correct Answer: \`${winnerMessage.content}\``)
                                 .setFooter(`Question: ${item.q}`)
                                 .setColor("RANDOM")
                                })
  } catch (e) {
    console.log(e)
    return message.channel.send({embed: new MessageEmbed()
                                 .setAuthor('No one got the answer in time!')
                                 .setTitle(`Correct Answer(s): \`${word}\``)
                                 .setColor("RANDOM")
                                 .setURL('https://discord.gg/WGtQPBWpT8')
                                })
  }
}
    if (command === "triquiz") {
const request = require('request-promise');
const { decodeHTMLEntities } = require('./util.js');

    const timeChoice = 60000;
    const timeBoolean = 10000;
    const parameters = [];

    let noOfQuestions = args[0];
    if(!args[0]) return message.channel.send("Please mention No.of Questions!");
    
    parameters.push(
      noOfQuestions ? `amount=${noOfQuestions}` : 'amount=10'
    );

    const query = parameters.join('&');

    const author = 'OpenTDB';
    const thumbnail = 'https://opentdb.com/images/logo-banner.png';
    const url = 'https://opentdb.com/api.php?';
    const footer = '© OpenTDB.com';
    const display = new MessageEmbed()
      .setAuthor(author)
      .setColor("RANDOM")
      .setThumbnail(thumbnail)
      .setFooter(footer);

    const stats = [];
    const leaderboard = [];

    await request(url + query)
      .then(questions => JSON.parse(questions).results)
      .then(async quiz => {
        for (let question = 0; question < quiz.length; question++) {
          let questionTime = 30000;
          let title = `**${quiz[question].category}**`;
          let questionToAsk = decodeHTMLEntities(quiz[question].question.toString());
          let type = `**${quiz[question].type
            .replace('boolean', 'True or False?')
            .replace('multiple', 'Multiple Choice:')}**`;

          if (quiz[question].type == 'boolean') questionTime = timeBoolean;
          if (quiz[question].type == 'multiple') questionTime = timeChoice;

          display
            .setTitle(title)
            .setURL('https://discord.gg/WGtQPBWpT8')
            .setDescription([
              type,
              questionToAsk
            ]);

          message.channel.send(display);

          await message.channel.awaitMessages(reply =>
            decodeHTMLEntities(quiz[question].correct_answer.toLowerCase())
              .includes(reply.content.toLowerCase()) && !reply.author.bot,
            {
              max: 1,
              time: questionTime,
              errors: ['time']
            })
            .then(winnerFound => {
              let winner = winnerFound.first();
              let position = stats.findIndex((player => player.name == winner.author));

              if (position != -1) stats[position].score += 1;
              else {
                let playerStats = {
                  name: winner.author,
                  score: 1
                }

                stats.push(playerStats);
              }

              message.channel.send({embed: {
  color: 3066993,
  description: `✅ ${winner.author} got the right answer with '${winner.content}' ✅.`
}});
            })
            .catch(() => message.channel.send({embed: {
  color: 3066993,
  description: '❌ Nobody answered correctly in time ❌.'
}}));
        }
      })
      .catch(error => {
        if (error.statusCode === 403) throw message.channel.send('OpenTDB is down, try again later.');

        throw message.channel.send(message.language.get('COMMAND_ERROR_UPDATE', message));
      });

    stats.sort((a, b) => a.score - b.score);

    for (let player = 0; player < stats.length; player++) {
      leaderboard.push(
        `**${player + 1}.** **${stats[player].name.username}** (${stats[player].score}/${noOfQuestions ? noOfQuestions : 10} questions correct)\n`
      );
    }

    if (leaderboard.length < 1) {
      leaderboard.push('No-one answered any questions correctly.');
    }

    message.channel.send('The quiz is over, here are the results.');

    return message.channel.send(new MessageEmbed()
      .setTitle('Results:')
      .setURL('https://discord.gg/WGtQPBWpT8')
      .setThumbnail(thumbnail)
      .setColor("RANDOM")
      .setDescription(leaderboard));
  }
    if (command === "help" ) {
    if (args[0] === 'ipl') {
   const iplembed = new MessageEmbed()
    .setTitle("IPL")
    .setURL('https://discord.gg/WGtQPBWpT8')
    .setDescription('1)**UpComing:**  \tSchedule of all upcoming IPL matches(at most 6)\n2)**Live:**  \t\tLive Score\n3)**Standings:** \tCurrent Standings\n4)**Player:**    \tPlayer Info e.g +player Patt Cummins')
    .setColor("RANDOM")
    .setTimestamp()
    .setFooter(`Command Used by : ${message.author.tag}`)
message.channel.send(iplembed)
   }
  message.react('✅');
    }
    if (command === "trivia" ) {
const sayMessage = args.join(" ")
const embed = new MessageEmbed()
    .setColor("RANDOM")
    .setURL('https://discord.gg/WGtQPBWpT8')
    .setTitle("TRIVIA")
    .setDescription("  1)INFO - ABOUT TRIVIA \n 2)SUGGEST - SUGGESTIONS FOR TRIVIA \n 3)BET - BETTING ON THE TRIVIA")
    .setFooter("Proper Usage : +trivia <©ommand> or +trivia <index number>")
    .setTimestamp()
    if(!sayMessage) return message.reply(embed)
 
let questions = [
        {
          title: "Best programming language",
          options: ["JavaScript/TypeScript", "Python", "Ruby", "Rust"],
          correct: 1,
        },
        {
          title: "Best NPM package",
          options: ["int.engine", "ms", "ws", "discord.js"],
          correct: 3,
        },
        {
          title: "What is the rarest M&M color?",
          options: ["Blue", "Green", "Brown", "Yellow"],
          correct: 3,
        },
        {
          title: "In what year was the first AIR Jordan sneakers released?",
          options: ["1983", "1984", "1979", "1990"],
          correct: 2,
        },
        {
          title: "In a game of bingo, which number is represented by the phrase “two little ducks”?",
          options: ["2", "12", "20", "22"], 
          correct: 4,
        },
        {
          title: "Which African country was formerly known as Abyssinia?",
          options: ["Algeria", "Ethiopia", "Burkina Faso", "Chad"],
          correct: 2,
        },
        {
          title: "Which turn-of-the-century NBA great's middle name is \"Bean\"?",
          options: ["Micheal Jordan", "Kyrie Irving", "JaVale McGee", "Kobe Bryant"],
          correct: 4,
        },
        {
          title: "Champion NBA point guard Kyrie Irving was born in which country?", 
          options: ["Denmark", "USA", "Australia", "Congo"],
          correct: 3,
        },
        {
          title: "Which country consumes the most chocolate per capita?",
          options: ["Switzerland", "Sweden", "USA", "Columbia"],
          correct: 1,
        },
        {
          title: "What was the first toy to be advertised on television?",
          options: ["Lego", "Army Men", "Slinky", "Mr.Potato Head"],
          correct: 4,
        },
        {
          title: "What is the tiny piece at the end of a shoelace called?",
          options: ["An aglet", "The tip", "The lace", "Lace tip"],
          correct: 1,
        },
        {
          title:"What is the tallest breed of dog in the world?",
          options: ["The Great Dane", "Dachshund", "Dobermann", "Irish Wolfhound"],
          correct: 1,
        },
        {
          title: "How many ribs are in a human body?",
          options: ["30", "24", "32", "16"],
          correct: 2,
        },
        {
          title: "What is the world’s biggest island?",
          options: ["New Guinea", "Madagascar", "Greenland", "Baffin Island"],
          correct: 3,
        },
        {
          title: "What color eyes do most humans have?",
          options: ["Black", "Brown", "Blue", "Green"],
          correct: 2,
        },
        {
          title: "In which city was Anne Frank’s hiding place?",
          options: ["Frankfurt", "Echternach", "Amsterdam", "Antwerp"],
          correct: 3,
        },
        {
          title: "When Michael Jordan played for the Chicago Bulls, how many NBA Championships did he win?",
          options: ["5", "4", "6", "7"],
          correct: 3,
        },
        {
          title: "What country won the very first FIFA World Cup in 1930?",
          options: ["Germany", "Netherlands", "Argentina", "Uruguay"],
          correct: 4,
        },
        {
          title: "In what year was the first ever Wimbledon Championship held?",
          options: ["1877", "1876", "1867","1866"],
          correct: 1,
        },
        {
          title: "Which country produces the most coffee in the world?",
          options: ["USA", "Canada", "Brazil", "France"],
          correct: 3,
        },
        {
          title: "How many hearts does an octopus have?",
          options: ["1", "2", "3", "4"],
          correct: 3,
        },
        {
          title: "How many eyes does a bee have?",
          options: ["2", "3", "4", "5"],
          correct: 4,
        },
        {
          title: "Who was the first person to win a Nobel Prize?",
          options: ["Henry Dunat", "Marie Curie", "Jacobus H. van‘t Hoff", "Sully Prudhomme"],
          correct: 1,
        },
        {
          title: "Which mammal has no vocal cords?",
          options: ["Hippos", "Elephants", "Rats", "Girrafes"],
          correct: 4,
        },
        {
          title: "What type of music has been shown to help plants grow better and faster?",
          options: ["R&B", "Rock", "Jazz", "Classical"],
          correct: 4,
        },
        {
          title: "Power outages in the US are mostly caused by what?",
          options: ["Rats", "Bad Communication", "Squirrels", "Malfunctions"],
          correct: 3,
        },
        {
          title: "What’s the hardest rock?",
          options: ["A boulder", "A diamond", "A ruby", "A pebble"],
          correct: 2
        },
        {
          title: "The Statue of Liberty was given to the US by which country?",
          options: ["Germany", "Canada", "Russia", "France"],
          correct: 4
        },
        {
          title: "Kyrie Irving, one of the best point guards in the league, signed with what team for a 5 year contract?",
          options: ["Lakers", "Cavaliers", "Celtics", "Nets"],
          correct: 2
        },
        {
          title: "What team did Carmelo Anthony and Chauncey Billups go to?",
          options: ["Knicks", "Lakers", "Wizards", "Mavericks"],
          correct: 1
        }
      ];
        if(args[0] === 'info' || args[0] === '1'){
          message.channel.send({embed: {
   color: 3066993,
   description: `Currently,There is nearly ${questions.length} questions, if you have any suggestions/ideas for questions please use '${PREFIX}trivia suggest <question, 4 possible answers, and correct answer>'.`
}})
        }else if(args[0] === 'suggest' || args[0] === '2'){         
          bot.users.cache.get('688671832068325386').send(message.author.tag + `\n ${args.join(" ").slice(8)}`)
          console.log(message.content.length)
        }else if(args[0] === 'bet' || args[0] === '3'){
let user = message.author;
let money = await db.fetch(`money_${message.guild.id}_${user.id}`);

    let amout = args[1];
    if (!amout) return message.channel.send({embed: {
  color: 3066993,
  description: "You have to specify the coins!"
}});
    if (money < amout)
      return message.channel.send({embed: {
  color: 3066993,
  description: "You do not have enough Coins!"
}});
    if (amout.includes("-"))
      return message.channel.send({embed: {
   color: 3066993,
   description: "Looks like your try to Gamble with Minus Numbers, that won't work"
}});
          
   if (isNaN(args[1])){
            message.reply({embed: {
   color: 3066993,
   description: "There where invalid charectors for the bet! Please make sure the bet is only numbers!"}}).then(message => {
				message.delete({timeout: 10000});
            });
            return;
        }
        if (!amout) return message.reply(':warning: You must bet atleast 100coins to use this command!').then(message => {
			message.delete({timeout: 10000});
		});
        if (amout < 100)return message.channel.send({embed: {
   color: 3066993,
   description: `I'm sorry ${message.author}, you have to bet **100coins** or more to use this command!`
}});
        
          let q = questions[Math.floor(Math.random() * questions.length)];
          let i = 0;
          db.subtract(`money_${message.guild.id}_${user.id}`, amout);
          const Embed = new MessageEmbed()
            .setTitle(q.title)
            .setURL('https://discord.gg/WGtQPBWpT8')
            .setDescription(
              q.options.map((opt) => {
                i++;
                return `${i} - ${opt}\n`;
              })
            )
            .setColor("RANDOM")
            .setFooter(
              `Reply to this message with the correct answer number! You have 30 seconds.`
            );
          message.channel.send(Embed)
          // console.log(questions.length)
          try {
            // console.log(questions.length)
            // console.log(q.options[q.correct])
            let msgs = await message.channel.awaitMessages(
              (u2) => u2.author.id === message.author.id,
              { time: 30000, max: 1, errors: ["time"] }
            );
            if (parseInt(msgs.first().content) == q.correct) {
              db.add(`money_${message.guild.id}_${user.id}`, 2 * amout);
              return message.channel.send({embed: {
  color: 3066993,
  description: `You got it correct and Won 2 * ${amout}!`
}});
              } else {
              return message.channel.send({embed: {
   color: 3066993,
   description: `You got it incorrect. The correct answer was: ${q.correct}`
}});
            }
          } catch (e) {
            db.add(`money_${message.guild.id}_${user.id}`, amout);
            return message.channel.send({embed: {
  color: 3066993,
  description: `You did not answer! The correct answer was: ${q.correct}`
}});
          }
        }
        
 
        }
    if (command == "settnumber" ) {
        let min = parseInt(args[0]);
        let max = parseInt(args[1]);

        if(min > max){
            let temp = max;
            max = min;
            min = temp;
        }

        var Result = Math.floor(Math.random() * (max - min + 1)) + min;

        if(isNaN(Result)){
            return message.channel.send("Please enter a min and a max number")
        }else{
            message.channel.send(Result);
        }
      
}
    if (command == "rate" ) {
       if(!args[0]) return message.channel.send("**Ask me to rate someone or something** `?rate <someone/something>`");
   let ratings = ["0", "⭐ - 1", "⭐⭐ - 2", "⭐⭐⭐ - 3", "⭐⭐⭐⭐- 4", "⭐⭐⭐⭐⭐ - 5", "⭐⭐⭐⭐⭐⭐ - 6",  "⭐⭐⭐⭐⭐⭐ - 7", "⭐⭐⭐⭐⭐⭐⭐⭐ - 8", "⭐⭐⭐⭐⭐⭐⭐⭐⭐ - 9", "⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ - 10"];

   let result = Math.floor((Math.random() * ratings.length));
   let user = message.mentions.users.first();

   let rateEmbed = new MessageEmbed()

   .setAuthor(message.author.username)
   .setColor("#000000")
   .addField("Something", args[0])
   .addField("Rating", ratings[result]);

   message.channel.send(rateEmbed)


}
    if (command == "gtnbattle" ) {
    if (args.length != 2)
            return message.reply('Usage: !gtnbattle <@user> <betamount>');
        if (!message.mentions.users.size)
            return message.reply('You have to tag a user in order to battle them');
        let oppo = message.mentions.users.first();
        let amount = args[1];
        let money = db.fetch(`money_${message.guild.id}_${message.author.id}`);
       let oppomoney = db.fetch(`money_${message.guild.id}_${oppo.id}`);

      if (oppo.id == bot.user.id) return message.channel.send("No U!");
      if (oppo.id == message.author.id) return message.channel.send(`${message.author}, you can't battle yourself`);

       if (money < amount)
      return message.channel.send({embed: {
  color: 3066993,
  description: "You do not have enough Coins!"
}});
    if (amount.includes("-"))
      return message.channel.send({embed: {
   color: 3066993,
   description: "Looks like your try to Gamble with Minus Numbers, that won't work"
}});
          
   if (isNaN(args[1])){
            message.reply({embed: {
   color: 3066993,
   description: "There where invalid charectors for the bet! Please make sure the bet is only numbers!"}}).then(message => {
				message.delete({timeout: 10000});
            });
            return;
        }
        if (!amount) return message.reply(':warning: You must bet atleast 100coins to use this command!').then(message => {
			message.delete({timeout: 10000});
		});
        if (amount < 100)return message.channel.send({embed: {
   color: 3066993,
   description: `I'm sorry ${message.author}, you have to bet **100coins** or more to use this command!`
}});

       if (oppomoney < amount)
      return message.channel.send({embed: {
  color: 3066993,
  description: "${oppo} do not have enough Coins!"
}});
    // Since this command results in a lot of spam it would be best to use on separate channel.
    if ((message.channel.id != process.env.BATTLE_CHAT_1) && (message.channel.id != process.env.BATTLE_CHAT_2))
    {
        return message.reply(`You cannot battle outside of <#${process.env.BATTLE_CHAT_1}>, <#${process.env.BATTLE_CHAT_2}> channel.`);
    }
    // Initiate game variables
    var gameRunning = true;

    var firstPlayer = message.author;
    var secondPlayer = message.guild.members.cache.get(oppo);
    var currentPlayer;
    var targetPlayer;
    var turn = true;

    // If the users are not in the cooldown list, continue.
    if (!usersOnCooldown.has(firstPlayer) && !usersOnCooldown.has(secondPlayer))
    {
        // Add users on cooldown until the game finishes.
        usersOnCooldown.add(firstPlayer);
        usersOnCooldown.add(secondPlayer);
        setTimeout(() =>
        {
            usersOnCooldown.delete(firstPlayer);
            usersOnCooldown.delete(secondPlayer);
        }, 5 * 60 * 1000);

   message.channel.send(`<@${oppo.id}>, <@${message.author.id}> has challenged you. Do you accept? Type yes or no.`);
        // Await for tagged user's answer.
        const afilter = m => (m.content.toLowerCase() === 'yes' || m.content.toLowerCase() === 'no') && m.author.id === oppo.id;
        await message.channel.awaitMessages(afilter,
        {
            max: 1,
            time: 30 * 1000,
            errors: ['time']
        }).
        then(async answer =>
        {
            let msg = answer.first().content.toLowerCase();
        if (msg === 'yes')
            {
           var battlenumber = Math.floor(Math.random()* Math.floor(battlelimit));
          const embed = new MessageEmbed()
             .setTitle("Battle")
             .setURL('https://discord.gg/WGtQPBWpT8')
             .setDescription("Successfully,Generated random number between 0-100,You have 30 seconds to guess the correct number!\nYou have 30seconds and 30 guesses")
             .setFooter("If no one won,then bet amount will be refunded back to your account")
             .setTimestamp()
  message.channel.send(embed)
            const mfilter = m => (m.content.toLowerCase() === battlenumber) && m.author.id === message.author.id;
                await message.channel.awaitMessages(mfilter,
                {
                    max: 30,
                    time: 30 * 1000,
                    errors: ['time']
                })
            const ofilter = m => (m.content.toLowerCase() === battlenumber) && m.author.id === oppo.id;
                await message.channel.awaitMessages(ofilter,
                {
                    max: 30,
                    time: 30 * 1000,
                    errors: ['time']
                }).catch(answer =>
                {
                    // Since the request timed out, remove both players from the cooldown list.
                    usersOnCooldown.delete(firstPlayer);
                    usersOnCooldown.delete(secondPlayer);
                })

                // Since the battle is over, remove both players from the cooldown list.
                usersOnCooldown.delete(firstPlayer);
                usersOnCooldown.delete(secondPlayer);
            }
            else if (msg === 'no')
            {
                          // If the tagged user answered no.
                // Since the request was refused, remove both players from the cooldown list.
                usersOnCooldown.delete(firstPlayer);
                usersOnCooldown.delete(secondPlayer);

                message.channel.send(new MessageEmbed()
                    .setTitle(':crossed_swords: | Battle')
                    .setColor(0x00AE86)
                    .setURL('https://discord.gg/WGtQPBWpT8')
                    .setDescription(`Kek, not willing to fight eh. <@!${message.author.id}>`)
                    .setTimestamp());
            }
        }).catch(answer =>
        {
            // Since the request timed out, remove both players from the cooldown list.
            usersOnCooldown.delete(firstPlayer);
            usersOnCooldown.delete(secondPlayer);

            message.channel.send(new MessageEmbed()
                .setTitle(':crossed_swords: | Battle')
                .setColor(0xD11313)
                .setURL('https://discord.gg/WGtQPBWpT8')
                .setDescription(`Time out. ${oppo.tag} did not answer to the request.`)
                .setTimestamp())
        });
    }
    else
    {
        // If the users are in the cooldown list.
        message.channel.send(new MessageEmbed()
            .setTitle(':crossed_swords: | Battle')
            .setColor(0xD11313)
            .setURL('https://discord.gg/WGtQPBWpT8')
            .setDescription(`Your request has already been made. Try again later.`));
    }
 
}
    if (command == "battles" ) {
    if (args.length != 1)
    {
        return message.reply("Incorrect command you have to tag someone first.");
    }

    var mentionedUser = message.mentions.users.firstKey();

    // If tagged user is the same as the author of the message
    if (mentionedUser === message.author.id)
    {
        return message.reply("You cannot battle yourself");
    }

    // If the tagger user is a bot
    if (bot.users.cache.get(mentionedUser).bot)
    {
        return message.reply("You cannot battle a bot.");
    }

    // Since this command results in a lot of spam it would be best to use on separate channel.
    if ((message.channel.id != process.env.BATTLE_CHAT_1) && (message.channel.id != process.env.BATTLE_CHAT_2))
    {
        return message.reply(`You cannot battle outside of <#${process.env.BATTLE_CHAT_1}>, <#${process.env.BATTLE_CHAT_2}> channel.`);
    }


    // Initiate game variables
    var gameRunning = true;

    var firstPlayer = message.author;
    var secondPlayer = message.guild.members.cache.get(mentionedUser);
    var currentPlayer;
    var targetPlayer;
    var turn = true;

    firstPlayer.health = 500;
    firstPlayer.guard = false;
    firstPlayer.missedTurn = 0;

    secondPlayer.health = 500;
    secondPlayer.guard = false;
    secondPlayer.missedTurn = 0;

    // If the users are not in the cooldown list, continue.
    if (!usersOnCooldown.has(firstPlayer) && !usersOnCooldown.has(secondPlayer))
    {
        // Add users on cooldown until the game finishes.
        usersOnCooldown.add(firstPlayer);
        usersOnCooldown.add(secondPlayer);
        setTimeout(() =>
        {
            usersOnCooldown.delete(firstPlayer);
            usersOnCooldown.delete(secondPlayer);
        }, 5 * 60 * 1000);

        message.channel.send(new MessageEmbed().setTitle(':crossed_swords: | Battle')
            .setColor(0x00AE86)
            .setDescription(`<@!${mentionedUser}> if you accept type '**yes**', otherwise type '**no**'. \n\nYou have **30** second(s).`));

        // Await for tagged user's answer.
        const filter = m => (m.content.toLowerCase() === 'yes' || m.content.toLowerCase() === 'no') && m.author.id === mentionedUser;
        await message.channel.awaitMessages(filter,
        {
            max: 1,
            time: 30 * 1000,
            errors: ['time']
        }).
        then(async answer =>
        {
            let msg = answer.first().content.toLowerCase();

            // If the reply from the tagged user is yes, start the game
            if (msg === 'yes')
            {
                // Choose a person to flip coin
                var randomPerson = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
                var personToFlip = randomPerson === 1 ? firstPlayer : secondPlayer;

                await message.channel.send(new MessageEmbed().setTitle(':crossed_swords: | Battle')
                    .setColor(0x00AE86)
                    .setDescription(`We shall have a flip coin to see who starts first!\n${personToFlip} what's your choice '**heads**' or '**tails**'? \n\nYou have **30** second(s).`));

                const filter = m => (m.content.toLowerCase() === 'heads' || m.content.toLowerCase() === 'tails') && m.author.id === personToFlip.id;
                await message.channel.awaitMessages(filter,
                {
                    max: 1,
                    time: 30 * 1000,
                    errors: ['time']
                }).then(async answer =>
                {
                    let choice = answer.first().content.toLowerCase();

                    // Coin randomization
                    var randCoin = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
                    var coinResult = randCoin === 1 ? 'heads' : 'tails';
                    var result = coinResult === choice ? 'yes' : 'no';

                    // If the firstPlayer won or secondPlayer lost, then it's firstPlayer's turn.
                    // If the firstPlayer lost or secondPlayer won, then it's secondPlayer's turn.
                    if ((result === 'yes' && personToFlip === firstPlayer) || (result === 'no' && personToFlip === secondPlayer))
                        turn = true;
                    else
                        turn = false;

                    await message.channel.send(`The coin rolled and landed on: **${coinResult}**`);

                    // That person gets to pick heads or tails.
                    while (gameRunning)
                    {
                        // If turn is true, it's author's turn, otherwise it's tagged user's turn.
                        if (turn)
                        {
                            currentPlayer = firstPlayer;
                            targetPlayer = secondPlayer;
                        }
                        else
                        {
                            currentPlayer = secondPlayer;
                            targetPlayer = firstPlayer;
                        }

                        // Let the users know about moves they can use along with their health stats.
                        await message.channel.send(new MessageEmbed().setTitle(':crossed_swords: | Battle')
                            .setColor(0x00AE86)
                            .setDescription(`${currentPlayer} it's your turn, make your move.\n➾ **Attack** - Attacks the enemy. Damage 20 - 100.\n➾ **Guard** - Blocks the next incoming attack.\n➾ **Special** - Launches a powerful attack but has **15** % chance of landing. Damage 120 - 200.\n➾ **Run** - Runs as fast as you possibly can to escape death. \n\n${firstPlayer} HP : ${firstPlayer.health}\n${secondPlayer} HP : ${secondPlayer.health}\n\nYou have **10** second(s).`));

                        // Await for current player's choice
                        const filter = m => (m.content.toLowerCase() === 'attack' ||
                            m.content.toLowerCase() === 'guard' || m.content.toLowerCase() === 'special' ||
                            m.content.toLowerCase() === 'run') && m.author.id === currentPlayer.id;
                        await message.channel.awaitMessages(filter,
                        {
                            max: 1,
                            time: 10 * 1000,
                            errors: ['time']
                        }).
                        then(async answer =>
                        {
                            let choice = await answer.first().content.toLowerCase();

                            // Check for the player's choice, and execute the appropriate behaviour.
                            switch (choice)
                            {
                                case 'attack':
                                    // Randomize a damage value between 20 - 100.
                                    var damageVal = Math.floor(Math.random() * (100 - 20) + 20);

                                    // If the current player had previously used guard, but did not get attacked remove the guard.
                                    if (currentPlayer.guard)
                                    {
                                        currentPlayer.guard = false;
                                    }

                                    // If the enemy used guard move on previous round, block any incoming attacks.
                                    if (targetPlayer.guard)
                                    {
                                        message.channel.send(`${targetPlayer} was on guard for any incoming attacks on this turn.`);
                                        targetPlayer.guard = false;
                                    }
                                    else
                                    {
                                        // If the enemy didn't use guard move, sap his health.
                                        targetPlayer.health -= damageVal;

                                        // If the enemy's health dropped below 0, the current player has won the game.
                                        if (targetPlayer.health <= 0)
                                        {
                                            targetPlayer.health = 0;
                                            winner = currentPlayer;
                                            gameRunning = false;
                                        }
                                        message.channel.send(`${currentPlayer} attacked and dealt **${damageVal}** damage.`);
                                    }
                                    break;
                                case 'guard':
                                    // If the current player chose to guard, enable the boolean flag for the next turn.
                                    message.channel.send(`${currentPlayer} prepares to block your next attack!`);
                                    currentPlayer.guard = true;
                                    break;
                                case 'special':
                                    // Randomize a chance between 0 - 100.
                                    var chance = Math.random() * 100;

                                    // If the current player had previously used guard, but did not get attacked remove the guard.
                                    currentPlayer.guard = false;

                                    // If the chance is within 0 - 15 % then the special blow succeeded.
                                    if (chance <= 15)
                                    {
                                        // If the enemy used guard move on previous round, block any incoming attacks.
                                        if (targetPlayer.guard)
                                        {
                                            message.channel.send(`${targetPlayer} was on guard for any incoming attacks on this turn.`);
                                            targetPlayer.guard = false;
                                        }
                                        else
                                        {
                                            // Randomize a damage value between 120 - 250.
                                            var damageVal = Math.floor(Math.random() * (250 - 120) + 120);

                                            // If the enemy didn't use guard move, sap his health.
                                            targetPlayer.health -= damageVal;

                                            // If the enemy's health dropped below 0, the current player has won the game.
                                            if (targetPlayer.health <= 0)
                                            {
                                                targetPlayer.health = 0;
                                                winner = currentPlayer;
                                                gameRunning = false;
                                            }
                                            message.channel.send(`${currentPlayer} attacked with his special attack and dealt a whooping **${damageVal}** damage!`);
                                        }
                                    }
                                    else
                                    {
                                        // If the current player's special attack fails but the enemy used guard on previous turn, consume it.
                                        if (targetPlayer.guard)
                                        {
                                            targetPlayer.guard = false;
                                        }

                                        message.channel.send(`Special attack failed!`);
                                    }
                                    break;
                                case 'run':
                                    // Randomize a chance between 0 - 100.
                                    var chance = Math.random() * 100;

                                    // Consume guards of both players.
                                    targetPlayer.guard = false;
                                    currentPlayer.guard = true;

                                    // If the chance is within 0 - 25% then current player fled successfully and declared the opponent player as the winner.
                                    if (chance <= 100)
                                    {
                                        winner = targetPlayer;
                                        gameRunning = false;
                                        message.channel.send(`${currentPlayer} chose to run away with his tails between his legs! Hahaha!!`);
                                    }
                                    else
                                    {
                                        message.channel.send(`${currentPlayer} tried to flee from the battle but got caught!`);
                                    }
                                    break;
                                default:
                                    message.reply("Wrong choice");
                            }

                            // After the choice was made, change player turns.
                            turn = !turn;
                        }).catch(answer =>
                        {
                            // If the current player missed more than 2 turns, then it means he's busy/AFK and the enemy wins this battle.
                            if (currentPlayer.missedTurn >= 2)
                            {
                                gameRunning = false;
                                winner = targetPlayer;
                                message.channel.send(new MessageEmbed()
                                    .setTitle(':crossed_swords: | Battle')
                                    .setColor(0xD11313)
                                    .setURL('https://discord.gg/WGtQPBWpT8')
                                    .setDescription(`${currentPlayer} missed 2 turns and yield the fight.`)
                                    .setTimestamp());
                            }
                            else
                            {
                                // If the time is out, the current player loses his turn and changes player turns.
                                currentPlayer.missedTurn++;
                                turn = !turn;
                                message.channel.send(new MessageEmbed()
                                    .setTitle(':crossed_swords: | Battle')
                                    .setColor(0xD11313)
                                    .setURL('https://discord.gg/WGtQPBWpT8')
                                    .setDescription(`${currentPlayer}, you missed your turn.`)
                                    .setTimestamp());
                            }
                        });
                    }
                }).catch(answer =>
                {
                    // Since the request timed out, remove both players from the cooldown list.
                    usersOnCooldown.delete(firstPlayer);
                    usersOnCooldown.delete(secondPlayer);
                })

                // Since the battle is over, remove both players from the cooldown list.
                usersOnCooldown.delete(firstPlayer);
                usersOnCooldown.delete(secondPlayer);

                // Winner declaration message.
                message.channel.send(new MessageEmbed()
                    .setTitle(':crown: | Battle')
                    .setColor(0x00AE86)
                    .setURL('https://discord.gg/WGtQPBWpT8')
                    .setDescription(`The battle is over! Congratulations to the winner ${winner} !\n\n${firstPlayer} HP : ${firstPlayer.health}\n${secondPlayer} HP : ${secondPlayer.health}`)
                    .setTimestamp());

            }
            else if (msg === 'no')
            {
                // If the tagged user answered no.
                // Since the request was refused, remove both players from the cooldown list.
                usersOnCooldown.delete(firstPlayer);
                usersOnCooldown.delete(secondPlayer);

                message.channel.send(new MessageEmbed()
                    .setTitle(':crossed_swords: | Battle')
                    .setColor(0x00AE86)
                    .setURL('https://discord.gg/WGtQPBWpT8')
                    .setDescription(`Kek, not willing to fight eh. <@!${message.author.id}>`)
                    .setTimestamp());
            }
        }).catch(answer =>
        {
            // Since the request timed out, remove both players from the cooldown list.
            usersOnCooldown.delete(firstPlayer);
            usersOnCooldown.delete(secondPlayer);

            message.channel.send(new MessageEmbed()
                .setTitle(':crossed_swords: | Battle')
                .setColor(0xD11313)
                .setURL('https://discord.gg/WGtQPBWpT8')
                .setDescription(`Time out. ${secondPlayer} did not answer to the request.`)
                .setTimestamp())
        });
    }
    else
    {
        // If the users are in the cooldown list.
        message.channel.send(new MessageEmbed()
            .setTitle(':crossed_swords: | Battle')
            .setColor(0xD11313)
            .setURL('https://discord.gg/WGtQPBWpT8')
            .setDescription(`Your request has already been made. Try again later.`));
    }
}
    if (command == "flipbattle") {
        if (args.length != 2)
            return message.reply('Usage: !battle <@user> <your prediction (heads/tails)>');
        if (!message.mentions.users.size)
            return message.reply('You have to tag a user in order to battle them');
        if (args[1] != 'heads' && args[1] != 'tails')
            return message.reply('The second argument must be your prediction, either "heads" or "tails"');

        const taggedUser = message.mentions.users.first();
        const userGuess = args[1];
        if (taggedUser.id ==  bot.user.id) return message.channel.send("no u");
	if (taggedUser.id == message.author.id) return message.channel.send(`${message.author.username}, you can't battle yourself`);

        var timeleft = 3;
        var downloadTimer = setInterval(function(){
            message.channel.send(timeleft + '...');
            timeleft -= 1;  
            if(timeleft <= 0){
                clearInterval(downloadTimer);

                if (FlipCoin() == 0)
                    flipResult = 'heads';
                else
                    flipResult = 'tails';
    
                if (userGuess == flipResult)
                    return message.channel.send(`Winner: <@${message.author.id}>, Coin: ${flipResult.toUpperCase()}`);
                else
                    return message.channel.send(`Winner: <@${taggedUser.id}>, Coin: ${flipResult.toUpperCase()}`);
            }
        }, 1000);
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
        .setURL('https://discord.gg/WGtQPBWpT8')
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
        .setURL('https://discord.gg/WGtQPBWpT8')
        .setColor(roleDelete.color)
        .setDescription(
          `${message.author.username} has deleted the role "${roleDelete.name}"\nIts ID: ${roleDelete.id}\nIts Hex Color Code: ${roleDelete.color}`
        );
      message.channel.send(Embed1);
    }
  }
    if (command === "lock" ) {
   if (!message.member.permissions.has("MANAGE_CHANNELS")) return message.channel.send(` **Sorry, you do not have permission to perform the antiraid command.**`);
  if (!message.guild.member(bot.user).hasPermission('MANAGE_CHANNELS')) return message.reply(`**Sorry, i dont have the perms to do this cmd i need MANAGE_CHANNELS.**`)
  if (!bot.lockit) bot.lockit = [];
  const time = args.join(' ');
  const validUnlocks = ['release', 'unlock', 'stop', 'off'];
  if (!time) return message.reply({embed: {
   color: 3066993,
   description: `**You must set a duration for the lockdown in either hours, minutes or seconds!**`
}});

  if (validUnlocks.includes(time)) {
    message.channel.overwritePermissions([
  {
     id: message.guild.id,
     allow: ['SEND_MESSAGES'],
  },
]).then(() => {
      message.channel.send({embed: {
  color: 3066993,
  description:`** Time's up for locked down!(Lockdown Lifted)**`
}});
      clearTimeout(bot.lockit[message.channel.id]);
      delete bot.lockit[message.channel.id];
    }).catch(error => {
      console.log(error);
    });
  } else {
    message.channel.overwritePermissions([
  {
     id: message.guild.id,
     deny: ['SEND_MESSAGES'],
  },
]).then(() => {
      message.channel.send({embed: {
  color: 3066993,
  description: `**Channel locked down for ${ms(ms(time), { long:true })}.**`
}}).then(() => {

        bot.lockit[message.channel.id] = setTimeout(() => {
          message.channel.overwritePermissions([
  {
     id: message.guild.id,
     allow: ['SEND_MESSAGES'],
  },
]).then(message.channel.send({embed: {
   color: 3066993,
   description:`** Time's up for locked down!(Lockdown Lifted)**`
}}))
          delete bot.lockit[message.channel.id];
        }, ms(time));
      }).catch(error => {
        console.log(error);
      });
    });
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
    if (command === "pol" ) {
if (!message.member.hasPermission('MANAGE_GUILD') && message.author.id !== '357555941215961099') return message.channels.send('Sorry, you don/t have permission to create poll!').then(msg => msg.delete({timeout: 10000}));
  if (!args.join(' ')) return message.channel.send('Usage: poll <title>').then(msg => msg.delete({timeout: 10000}));
  
  const embed = new MessageEmbed()
    .setTitle(args.join(' '))
    .setURL('https://discord.gg/WGtQPBWpT8')
    .setFooter('DROP A VOTE!')
    .setColor('RANDOM')
    const pollTitle = await message.channel.send({ embed });
      await pollTitle.react(`👍`);
      await pollTitle.react(`👎`);
      
    const filter = (reaction) => reaction.emoji.name === '👍';
    const collector = pollTitle.createReactionCollector(filter, { time: 150000 });
      collector.on('collect', r => console.log(`Collected ${r.emoji.name}`));
      collector.on('end', collected => console.log(`Collected ${collected.size} items`));
  
    const filter1 = (reaction) => reaction.emoji.name === '👎';
    const collector1 = pollTitle.createReactionCollector(filter1, { time: 150000 });
      collector1.on('collect', r => console.log(`Collected ${r.emoji.name}`));
      collector1.on('end', collected => console.log(`Collected ${collected.size} items`));
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
      .setURL('https://discord.gg/WGtQPBWpT8')
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
          .setURL('https://discord.gg/WGtQPBWpT8')
          .setColor(`BLUE`)
      );
    message.channel.send({embed: {
   color: 3066993,
   description :"Successfully Advertised!!!"
}});
  }
    if (command === "draw" ) {
const reactions = ["⬅", "➡", "⬆", "⬇", "✅", "🔏", "🖋"];
let channels = [];

/**
 * Executes the command
 * @param {Message} message
 * @param {String} command
 * @param {Array<String>} args
 */
  message.delete();
  
  
    if (channels.includes(message.channel.id)) {
        message.reply(`**You can't have more than one Canvas in a channel!**`);
        return;
    }
    var size;
    if (+args[0] >= 5 && +args[0] <= 50) {
        size = +args[0];
    } else {
        message.reply(`**Size must be between 5 and 50!**`);
        return;
    }
    message.channel.send("Loading...").then((message) => {
        channels.push(message.channel.id);
        const drawing = new Drawing(message, size, args[1], args[2]);
    });
};


class Drawing {
    constructor(message, size, fg, bg) {
        this.message = message;
        this.canvasmessage;
        this.size = size;
        this.realsize = size * 10;
        this.penx = Math.floor(size / 2);
        this.peny = this.penx;
        this.penstate = false; // true: on, false: off
        this.fcolor = fg || "rgb(0, 0, 0)";
        this.bcolor = bg || "rgb(255, 255, 255)";

        this.initPixels();
        this.c = Canvas.createCanvas(this.realsize, this.realsize).setColor(this.bcolor).addRect(0, 0, this.realsize, this.realsize);
        this.drawCanvas();

        message.edit("**Use the reactions to move the pen:\n✅ Stop Drawing | 🖋 Pen On | 🔏 Pen Off**");
        this.reactArrows(0);
        this.collector = message.createReactionCollector((reaction, user) => {
            return user.id !== message.bot.user.id && reactions.includes(reaction.emoji.name);
        });
        let self = this;
        this.collector.on("collect", (reaction) => {
            self.handleReaction(reaction)
        });
    }

    stop(reason = "") {
        this.collector.stop();
        this.drawCanvas(true);
        this.message.edit(`**Thanks for drawing with us!**` + reason);
        this.message.clearReactions();
        this.message.bot.clearTimeout(this.timeout);
        channels = channels.filter(item => item !== this.message.channel.id);
    }

    renewTimeout() {
        let self = this;
        this.message.bot.clearTimeout(this.timeout);
        this.timeout = this.message.bot.setTimeout(function() {
            self.stop("**\nEnd Reason: Timeout (2 minutes)**");
        }, 120000);
    }

    handleReaction(reaction) {
        // console.log(`${reaction.emoji.name} from ${reaction.users.last().username}`);
        const rid = reactions.indexOf(reaction.emoji.name);
        if (rid < 4) this.movePen(rid);
        else if (rid === 4) this.stop();
        else this.togglePenstate();
        reaction.remove(reaction.users.last()).catch(e => {
            if (e.code === 50013) reaction.message.channel.send(` **I need the 'Manage Messages' permission in order to work properly!**`);
        });
        this.drawCanvas();
    }

    /*
     * 0: Left
     * 1: Right
     * 2: Up
     * 3: Down
     */
    movePen(dir) {
        const xactions = [-1, 1, 0, 0];
        const yactions = [0, 0, -1, 1];
        if ((this.penx > 0 || xactions[dir] === 1) && (this.penx < this.size || xactions[dir] === -1)) this.penx += xactions[dir];
        if ((this.peny > 0 || yactions[dir] === 1) && (this.peny < this.size || yactions[dir] === -1)) this.peny += yactions[dir];
    }

    togglePenstate() {
        this.penstate = !this.penstate;
        if (this.penstate) {
            this.message.reactions.find(val => val.emoji.name === reactions[5]).remove();
            this.message.react(reactions[6]);
        } else {
            this.message.reactions.find(val => val.emoji.name === reactions[6]).remove();
            this.message.react(reactions[5]);
        }
    }

    initPixels() {
        this.pixels = [];
        for (let i = 0; i < Math.pow(this.size, 2); i++) {
            this.pixels.push(false);
        }
    }

    setPixel(x, y) {
        this.pixels[x + (y * this.size)] = true;
    }

    setCanvasPixel(x, y, color) {
        this.c.setColor(color).addRect(x * 10, y * 10, 10, 10);
    }

    drawCanvas(end = false) {
        if (this.penstate) this.setPixel(this.penx, this.peny);
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                this.setCanvasPixel(x, y, this.pixels[x + (y * this.size)] ? this.fcolor : this.bcolor);
            }
        }
        if (!end) {
            this.setCanvasPixel(this.penx, this.peny, this.pixels[this.penx + (this.peny * this.size)] ? "#5A0000" : "red");
            this.renewTimeout();
        }
        this.sendCanvas();
    }

    async sendCanvas() {
        if (this.canvasmessage) this.canvasmessage.delete().catch(e => console.error(e));
        this.message.channel.send(`Canvas: ${this.size}px`, {
            files: [
                this.c.toBuffer()
            ]
        }).then(message => {
            this.canvasmessage = message;
        });
    }

    reactArrows(arrow) {
        if (arrow === 6) return;
        this.message.react(reactions[arrow]).then(_ => {
            this.reactArrows(arrow + 1);
        }).catch(
            e => console.error(`Reaction Error: ${e}`)
        );
    }
}
    if (command === "checktimegap" ) {
   let Channel = args[0];
   let Firstmessage = args[1];
   let Secondmessage = args[2]; 

 var chan=message.guild.channels.cache.get(Channel)
chan.messages.fetch(Firstmessage).then(m=>{
chan.messages.fetch(Secondmessage).then(me=>{
message.reply((me.createdTimestamp-m.createdTimestamp)/1000)
}) 
})
   }
    if (command === "embed" ) {
     message.delete();
     const sayMessage = args.join(" ")
    if(!sayMessage) return message.reply({embed: {
  color: 3066993,
  description:"Proper Usage : +embed <Title> <Description> <Field Header> <Field Description> <ImageURL>"
}})
 

    let emb = new MessageEmbed()
      .setTitle(args[0])
      .setURL('https://discord.gg/WGtQPBWpT8')
      .setColor("RANDOM")
      .setDescription(args[1])
      .setFooter(`Command Used by : ${message.author.tag}`, message.author.avatarURL)
      .addField(args[2] , args[3])
      .setImage(args[4])
      .setTimestamp()

  message.channel.send(emb)

    }
    if (command === "slowmode" ) {
       if (!message.member.permissions.has("MANAGE_CHANNELS")) return message.channel.send(` **Sorry, you do not have permission to perform the antiraid command.**`);
       if (!message.guild.member(bot.user).hasPermission('MANAGE_CHANNELS')) return message.reply(`**Sorry, i dont have the perms to do this cmd i need MANAGE_CHANNELS.**`)
 
const sayMessage = args.join(" ")
    if(!sayMessage) return message.reply({embed: {
  color: 3066993,
  description:"Proper Usage : +slowmode <number in seconds> <reason> / To cancel slowmode type +slowmode 0"
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
   if (!reason) { reason = "No Reason Provided!" }
    message.channel.setRateLimitPerUser(args[0], reason);
    const slowembed = new MessageEmbed()
       .setColor("RANDOM")
       .setTimestamp()
       .setDescription(` Set the slowmode of this channel too **${args[0]}** sec ,\n Mod : <@${message.author.id}> ,\n Reason : ${reason}`)
       .setFooter( "To Stop Slowmode Type +slowmode 0 finished")
    message.channel.send(slowembed)
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
        .setURL('https://discord.gg/WGtQPBWpT8')
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
        
  
    if (message.author.id != 688671832068325386) return message.reply("you do not have permission to use this command!")
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
              .setURL('https://discord.gg/WGtQPBWpT8')
              .setDescription(`You were warned in ${message.guild.name}`)
              .addField('Reason:', `${reason}`)
              .addField('Moderator:', `${message.author.tag}`)
              .setColor("RANDOM")
              .setTimestamp()

            user.send(warnembed);

            const helpembed = new MessageEmbed()
              .setAuthor(`${message.guild.name}`, message.author.displayAvatarURL())
              .setTitle('Warning')
              .setURL('https://discord.gg/WGtQPBWpT8')
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
              .setURL('https://discord.gg/WGtQPBWpT8')
              .setDescription(`You were warned in ${message.guild.name}`)
              .addField('Reason:', `${reason}`)
              .addField('Moderator:', `${message.author.tag}`)
              .setColor("RANDOM")
              .setTimestamp()

            user.send(warnembed);
            const helpembed = new MessageEmbed()
              .setAuthor(`${message.guild.name}`, message.author.displayAvatarURL())
              .setTitle('Warning')
              .setURL('https://discord.gg/WGtQPBWpT8')
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
    if (command === "mylevel" || command === "lvl" || command === "level" ) {
     let user = message.author;
     let levelfetch = db.fetch(`level_${message.guild.id}_${user.id}`)
     if (levelfetch === null) levelfetch = 0;
     const embed = new MessageEmbed()
      .setTitle("Noob Army Official")
      .setURL('https://discord.gg/WGtQPBWpT8')
      .setDescription(`${user}'s Level : ${levelfetch}`)
      .setTimestamp()
    message.channel.send(embed)
   }
    if (command === "mymessages" ) {
    let user = message.author;
    let mymessages = db.fetch(`messages_${message.guild.id}_${user.id}`)
    if (mymessages === null) mymessages = 0;
    const embed = new MessageEmbed()
      .setTitle("Noob Army Official")
      .setURL('https://discord.gg/WGtQPBWpT8')
      .setDescription(`Total Messages sent by ${user} is ${mymessages}`)
      .setTimestamp()
    message.channel.send(embed)
   }
    if (command === "bal" ) {
        
        
  let user = message.mentions.members.first() || message.author;

  let bal = db.fetch(`money_${message.guild.id}_${user.id}`)

  if (bal === null) bal = 0;

  let realmoney = db.fetch(`realmoney_${message.guild.id}_${user.id}`)

  if (realmoney === null) realmoney = 0;

  let bank = await db.fetch(`bank_${message.guild.id}_${user.id}`)
  if (bank === null) bank = 0;

  let moneyEmbed = new MessageEmbed()
  .setColor("RANDOM")
  .setDescription(`**${user}'s Balance**\n\nPocket: ${bal}\nBank: ${bank}\nReal Money: ${realmoney}`);
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
    if (command === "points" ) {
   let messages = db.fetch(`messages_${message.guild.id}_${message.author.id}`)
  if (messages === null) messages = 0;

  let levelfetch = db.fetch(`level_${message.guild.id}_${message.author.id}`)
  if (levelfetch === null) levelfetch = 0;
    const embed = new MessageEmbed()
        .setTitle("Points")
        .setURL('https://discord.gg/WGtQPBWpT8')
        .setColor("RANDOM")
        .setDescription(`${message.author.id} \n Total Messages : ${messages} \n Level : {levelfetch}`)
     message.channel.send(embed)
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
        let ownerID = '688671832068325386'
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
        let ownerID = '688671832068325386'
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
    if (command === "gamble" ) {
let percents = ["3,51", "3,91", "4,00", "4,31", "4,72", "4,99"]
    let math = Math.floor(Math.random() * percents.length);
    let user = message.author;
    let money = await db.fetch(`money_${message.guild.id}_${user.id}`);

    let amout = args[0];
    if (!amout) return message.channel.send("You have to specify the coins!");
    if (money < amout)
      return message.channel.send("You do not have enough Coins!");
    if (amout.includes("-"))
      return message.channel.send("Looks like your try to Gamble with Minus Numbers, that won't work");
    let result = ["win", "lose"];
    let resault = Math.floor(Math.random() * result.length);
    if (result[resault] === "lose") {
      db.subtract(`money_${message.guild.id}_${user.id}`, amout);
      message.channel.send(`You lose!`);
    }
    if (result[resault] === "win") {
      db.add(`money_${message.guild.id}_${user.id}`, 3 * amout);

      let embed = new MessageEmbed()
      .setAuthor("Gambling Machine")
      .setDescription(`You won: **${amout}** coins\nYour Bet got multiplied by **3**\n\nYou now have ${money} coins`)
      .setColor("#32cd32")
      
      message.channel.send(embed);
      return;
    }
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
    if (command === "inventory" ) {
        
        let user = message.author;

        let nikes = await db.fetch(`nikes_${message.guild.id}_${user.id}`)
        if(nikes === null) nikes = "0"

        let bronze = await db.fetch(`bronze_${message.guild.id}_${user.id}`)
        if(bronze === null) bronze = "0"

        let car = await db.fetch(`car_${message.guild.id}_${user.id}`)
        if(car === null) car = "0"

        let mansion = await db.fetch(`mansion_${message.guild.id}_${user.id}`)
        if(mansion === null) mansion = "0"

        const Embed = new MessageEmbed()
        .setTitle("Inventory")
        .setURL('https://discord.gg/WGtQPBWpT8')
        .setColor("RANDOM")
        .addField('Nike(s):', nikes)
        .addField('Car(s):', car)
        .addField('Mansion(s):', mansion)
        .addField('Bronze(s):', bronze)
        .setTimestamp()

        message.channel.send(Embed);
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
    .setDescription("**VIP Ranks**\n\nBronze: 3500 Coins [+buy bronze]\n\n**Lifestyle Items**\n\nFresh Nikes: 600 [+buy nikes]\nCar: 800 [+buy car]\nMansion: 1200 [+buy mansion]")
    .setColor("RANDOM")
    message.channel.send(embed)

}
    if (command === "storeinfo" ) {
       const sayMessage = args.join(" ")
     let infoembed = new MessageEmbed()
       .setTitle("Store Info")
       .setURL('https://discord.gg/WGtQPBWpT8')
       .setColor("RANDOM")
       .setDescription("1)Bronze \n2)Nikes \n3)Car \n4)Mansion")
       .setTimestamp()
       .setFooter(`Type +storeinfo <indexnumber> or +storeinfo <itemname>`, message.author.avatarURL)
    if(!sayMessage) return message.reply(infoembed)
if (args[0] == 'bronze' || args[0] == '1') {
    
      let embed = new MessageEmbed()
      .setDescription("**Bronze Rank**\n\nBenefits: Chance to get more coins from robbing someone")
      .setColor("RANDOM")
      message.channel.send(embed)
    } else if(args[0] == 'nikes'  || args[0] == '2') {
      let embed = new MessageEmbed()
      .setDescription("**Fresh Nikes**\n\nBenefits: Chance to win coins, roles on our Discord Server + More by leading the leaderboard")
      .setColor("RANDOM")
      message.channel.send(embed)
    } else if(args[0] == 'car'  || args[0] == '3') {
      let embed = new MessageEmbed()
      .setDescription("**Car**\n\nBenefits: Chance to win coins, roles on our Discord Server + More by leading the leaderboard")
      .setColor("RANDOM")
      message.channel.send(embed)
  } else if(args[0] == 'mansion'  || args[0] == '4') {
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
    if (command === "leaderboard" || command === "lb" ) {

        
const sayMessage = args.join(" ")
     let infoembed = new MessageEmbed()
       .setTitle("Leaderboard Command")
       .setColor("RANDOM")
       .setURL('https://discord.gg/WGtQPBWpT8')
       .setDescription("1)Coin \n2)Nike \n3)Car \n4)Mansion")
       .setTimestamp()
       .setFooter(`Type +lb <indexnumber> or +lb <name>`, message.author.avatarURL)
    if(!sayMessage) return message.reply(infoembed)

    if (args[0] == 'coins' || args[0] == '1') {
    let money = db.all().filter(data => data.ID.startsWith(`money`)).sort((a, b) => b.data - a.data)
        money.length = 10;
        let content = "";
        for (var i in money) {
          content += `🏅**${money.indexOf(money[i])+1}.**     <@${money[i].ID.slice(25)}> - ${money[i].data} \n`;
        }
        

    const embed = new MessageEmbed()
    .setDescription(`**Coin(s) Leaderboard**\n\n${content}`)
    .setColor("RANDOM")

    message.channel.send(embed)
  } else if(args[0] == 'nikes' || args[0] == '2') {
    let nikes = db.all().filter(data => data.ID.startsWith(`nikes`)).sort((a, b) => b.data - a.data)
        nikes.length = 10;
        let content = "";
        for (var i in nikes) {
          content += `🏅**${nikes.indexOf(nikes[i])+1}.**     <@${nikes[i].ID.slice(25)}> - ${nikes[i].data} \n`;
        }

    const embed = new MessageEmbed()
    .setDescription(`**Fresh Nike(s) Leaderboard**\n\n${content}`)
    .setColor("RANDOM")

    message.channel.send(embed)
  } else if(args[0] == 'cars' || args[0] == '3') {
    let car = db.all().filter(data => data.ID.startsWith(`car`)).sort((a, b) => b.data - a.data)
        car.length = 10;
        let content = "";
        for (var i in car) {
          content += `🏅**${car.indexOf(car[i])+1}.**     <@${car[i].ID.slice(25)}> - ${car[i].data} \n`;
        }

    const embed = new MessageEmbed()
    .setDescription(`**Car(s) Leaderboard**\n\n${content}`)
    .setColor("RANDOM")

    message.channel.send(embed)
  } else if(args[0] == 'mansion' || args[0] == '4') {
    let house = db.all().filter(data => data.ID.startsWith(`house`)).sort((a, b) => b.data - a.data)
        house.length = 10;
        let content = "";
        for (var i in house) {
          content += `🏅**${house.indexOf(house[i])+1}.**     <@${house[i].ID.slice(25)}> - ${house[i].data} \n`;
        }

    const embed = new MessageEmbed()
    .setDescription(`**Mansion(s) Leaderboard**\n\n${content}`)
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
        .setURL('https://discord.gg/WGtQPBWpT8')
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
    if (command === "roleall" ) {
        if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send(` **You're missing MANAGE_ROLES permission!** `)
   
        var userz = message.guild.members.array();
        const roletogive = args.join(" ")
        
        let subscriberRole = bot.guilds.cache.get(message.guild.id).roles.find(r => r.name == roletogive);
        if (!subscriberRole) return message.channel.send(` **I can not find the role: ` + roletogive + `** `);

      
            
                userz.forEach(u => {
                    u.addRole(subscriberRole)
                })
                message.channel.send(`**I have given the role ` + roletogive + ` to all members.**`)
            
      

        
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
  .setColor("RANDOM")
  .setURL('https://discord.gg/WGtQPBWpT8')
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
  .setColor("RANDOM")
  .setURL('https://discord.gg/WGtQPBWpT8')
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

}    if (command === "sendbotusers" ) {
    let MSG = args.join(" ");
    if (!MSG)
      return message.channel.send({embed: {
  color: 3066993,
  description:`You did not specify your message to send!`
}});
    let Owner = message.author;
    if(Owner.id !== "688671832068325386" && Owner.id !== "213588167406649346") return message.reply({embed: {
    color: 3066993,
    description:"Only the bot owner can use this command!"
}})
    const embed = new MessageEmbed()
         .setTitle("Noob Army")
         .setURL('https://discord.gg/WGtQPBWpT8')
         .setDescription(`${MSG}`)
         .addField("Support server", `[Click here!](https://discord.gg/noobarmy)`)
         .setFooter("Bot Owner : Aᴋ᭄Abhiᴮᴼˢˢ࿐")
         .setTimestamp()
      bot.guilds.cache.forEach(guild => {
guild.owner.send(embed) })
     
    let chanemb = new MessageEmbed()
    .setColor("RANDON")
    .setDescription("Successfully send your msg to all bot users!");

    message.channel.send(chanemb).then(msg => {msg.delete(5000)});

    }   
    if (command === "answer" ) {

    let Owner = message.author;
    if(Owner.id !== "688671832068325386" && Owner.id !== "213588167406649346") return message.reply({embed: {
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
   .setURL('https://discord.gg/WGtQPBWpT8')
   .setThumbnail(Owner.displayAvatarURL)
   .setTitle("Response  from your contact!")
   .addField("Response:", sayMessage)
   .addField("Support Server", "[Gamer's World](https://discord.gg/WGtQPBWpT8)")
   .setTimestamp()

    bot.users.cache.get(id).send(contact);

    let chanemb = new MessageEmbed()
    .setColor("RANDOM")
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
        .setURL('https://discord.gg/WGtQPBWpT8')
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
   .setURL('https://discord.gg/WGtQPBWpT8')
   .addField("User", Sender, true)
   .addField("User ID: ", Sender.id, true)
   .addField("Message: ", sayMessage)
   .setTimestamp()

    bot.users.cache.get("688671832068325386").send(contact);

    let embed = new MessageEmbed()
    .setColor("#00ff00")
    .setTitle("Message Sent!")
    .setURL('https://discord.gg/WGtQPBWpT8')
    .setDescription("Your contact message has been sent!")
    .addField("Reqested by ", Sender)
    .addField("Message: ", sayMessage)
    .setFooter("Thanks you for contacting with the OdarBot support!")

    message.channel.send(embed).then(msg => {msg.delete(10000)});

    }
    if (command == 'block') {
let Owner = message.author;
    if(Owner.id !== "688671832068325386" && Owner.id !== "213588167406649346") return message.reply({embed: {
    color: 3066993,
    description:"Only the bot owner can use this command!"
}});
  let user = message.mentions.users.first();
  if (user && !blockedUsers.includes(user.id)) blockedUsers.push(user.id);
 message.reply("Blocked User!");
}
    if (command === "eval" ) {

        let Owner = message.author;
    if(Owner.id !== "688671832068325386" && Owner.id !== "213588167406649346") return message.reply({embed: {
    color: 3066993,
    description:"Only the bot owner can use this command!"
}});
   const embed = new MessageEmbed()
            .setTitle('Evaluating...')
            .setURL('https://discord.gg/WGtQPBWpT8')
        const msg = await message.author.send(embed);
        try {
            const data = eval(args.join(' ').replace(/```/g, ''));
            const embed = new MessageEmbed()
                .setTitle('Output: ')
                .setURL('https://discord.gg/WGtQPBWpT8')
                .setDescription(await data)
            await msg.edit(embed)
            await msg.react('✅')
            await msg.react('❌')
            const filter = (reaction, user) => (reaction.emoji.name === '❌' || reaction.emoji.name === '✅') && (user.id === message.author.id);
            msg.awaitReactions(filter, { max: 1 })
                .then((collected) => {
                    collected.map((emoji) => {
                        switch (emoji._emoji.name) {
                            case '✅':
                                msg.reactions.removeAll();
                                break;
                            case '❌':
                                msg.delete()
                                break;
                        }
                    })
                })
        } catch (e) {
            const embed = new MessageEmbed()
                .setTitle(`${e}`)
                .setURL('https://discord.gg/WGtQPBWpT8')
            return await msg.edit(embed);

        }
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
    if (command === "roll" ) {
var rndInt = getRandomInt(20) + 1;
        console.log(rndInt);
        message.channel.send(`<@${message.author.id}>,You've rolled **` + rndInt + "**");
let number = "11";
let number1 = "20";// You can custom it through /number command and reroll it through /reroll
let ownerID = '688671832068325386';
let channelID = '763233532797124649';
        if(message.channel.id === channelID) {
        if(rndInt == number) {
                var everyone =  message.guild.roles.cache.find(r => r.name === 'everyone');
                bot.channels.cache.find(channel=>channel.id== channelID).overwritePermissions([
  {
     id: message.guild.id,
     deny: ['SEND_MESSAGES'],
  },
]);
                
		message.channel.send({embed: {
   color: 3066993,
   description:`<@${message.author.id}> rolled a number 11. \n More entries Have been stopped till furthur announcements, \n Thanks for participating.❣️`
}});
                await message.react('🎉');
                db.add(`realmoney_${message.guild.id}_${message.author.id}`, 50)
            }
        if(rndInt == number1) {
                var everyone =  message.guild.roles.cache.find(r => r.name === 'everyone');
                bot.channels.cache.find(channel=>channel.id== channelID).overwritePermissions([
  {
     id: message.guild.id,
     deny: ['SEND_MESSAGES'],
  },
]);
                
		message.channel.send({embed: {
   color: 3066993,
   description:`<@${message.author.id}> rolled a number 20. \n More entries Have been stopped till furthur announcements, \n Thanks for participating.❣️`
}});
                await message.react('🎉');
                db.add(`realmoney_${message.guild.id}_${message.author.id}`, 50)
            }
        } else return
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
    .setURL('https://discord.gg/WGtQPBWpT8')
    .setColor("#ff2050")
    .setThumbnail(movie.poster)
    .setDescription(movie.plot)
    .setFooter(`Ratings: ${movie.rating}`)
    .addField("Country", movie.country, true)
    .addField("Languages", movie.languages, true)
    .addField("Type", movie.type, true);
    
    
    message.channel.send(embed)
    
    
    
  }
    if (command === "vote" ) {
const agree    = "✅";
const disagree = "❎";
 
 let msg = await message.channel.send("Vote now! (60 Seconds)");
  await msg.react(agree);
  await msg.react(disagree);

  const reactions = await msg.awaitReactions(reaction => reaction.emoji.name === agree || reaction.emoji.name === disagree, {time: 60000});
  msg.delete();

  var NO_Count = reactions.get(disagree).count;
  var YES_Count = reactions.get(agree);
  var draw = (!YES_Count && !NO_Count) || (YES_Count && NO_Count && NO_Count.count == YES_Count.count);
  if(YES_Count == undefined){
    var YES_Count = 1;
  }else{
    var YES_Count = reactions.get(agree).count;
  }

  var sumsum = new MessageEmbed()
  
            .addField("Voting Finished:", "----------------------------------------\n" +
                                          "Total votes (NO): " + `${NO_Count-1}\n` +
                                          "Total votes (Yes): " + `${YES_Count-1}\n` +
                                          "----------------------------------------", true)

            .setColor("RANDOM")

  await message.channel.send({embed: sumsum});

}
    if (command === "rateme" ) {
      

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
            .setURL('https://discord.gg/WGtQPBWpT8')
            .setTitle("Please choose language to translate to:")
            .setDescription("'afrikaans','albanian','amharic','arabic','armenian','azerbaijani','bangla','basque','belarusian','bengali','bosnian','bulgarian','burmese','catalan','cebuano','chichewa','chinese simplified','chinese traditional','corsican','croatian','czech','danish','dutch','english','esperanto','estonian','filipino','finnish','french','frisian','galician','georgian','german','greek','gujarati','haitian creole','hausa','hawaiian','hebrew','hindi','hmong','hungarian','icelandic','igbo','indonesian','irish','italian','japanese','javanese','kannada','kazakh','khmer','korean','kurdish (kurmanji)','kyrgyz','lao','latin','latvian','lithuanian','luxembourgish','macedonian','malagasy','malay','malayalam','maltese','maori','marathi','mongolian','myanmar (burmese)','nepali','norwegian','nyanja','pashto','persian','polish','portugese','punjabi','romanian','russian','samoan','scottish gaelic','serbian','sesotho','shona','sindhi','sinhala','slovak','slovenian','somali','spanish','sundanese','swahili','swedish','tajik','tamil','telugu','thai','turkish','ukrainian','urdu','uzbek','vietnamese','welsh','xhosa','yiddish','yoruba','zulu'")
            .addField("Usage", `!translate <language> | <text>`)

            message.channel.send(emb)

        } else if(text === undefined) {

            let emb = new MessageEmbed()
            .setColor("#00ff00")
            .setURL('https://discord.gg/WGtQPBWpT8')
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
                .setURL('https://discord.gg/WGtQPBWpT8')
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
    .setURL('https://discord.gg/WGtQPBWpT8')
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
     if (command === "unban" ){
 if(!message.member.hasPermission(["BAN_MEMBERS", "ADMINISTRATOR"])) return message.channel.send({embed: {
   color: 3066993,
   description: "You don't have permissions to do that!"
}})

    if(!args[0]) return message.channel.send({embed: {
  color: 3066993,
  description: "Give me a valid ID"
}}); 
    //This if() checks if we typed anything after "+unban"

    let bannedMember;
    //This try...catch solves the problem with the await
    try{                                                            
        bannedMember = await bot.users.fetch(args[0])
    }catch(e){
        if(!bannedMember) return message.channel.send({embed: {
   color: 3066993,
   description: "That's not a valid ID"
}})
    }

    //Check if the user is not banned
    try {
            await message.guild.fetchBan(args[0])
        } catch(e){
            message.channel.send({embed: {
   color: 3066993,
   description: 'This user is not banned.'
}});
            return;
        }

    let reason = args.slice(1).join(" ")
    if(!reason) reason = "..."

    if(!message.guild.me.hasPermission(["BAN_MEMBERS", "ADMINISTRATOR"])) return message.channel.send({embed: {
   color: 3066993,
   description: "I don't have permissions to do that!"
}})
    message.delete()
    try {
        message.guild.members.unban(bannedMember, {reason: reason})
        message.channel.send({embed: {
  color: 3066993,
  description: `${bannedMember.tag} was successfully unbanned.`
}})
    } catch(e) {
        console.log(e.message)
    }
}
    if (command === "bet" ) {
	if (message.guild === null){
            message.reply(DMMessage);
            return;
        }
        let bet = args.slice(0).join(' ');
        let Extra = args.slice(1).join(' ');
        let bal = db.fetch(`money_${message.guild.id}_${message.author.id}`)
        if (bal === null) bal = 0;
		if (!bet){
			message.reply("How much money do you want to bet?");
			return;
		}
        if (isNaN(args[0])){
            message.reply("There where invalid charectors for the bet! Please make sure the bet is only numbers!").then(message => {
				message.delete({timeout: 10000});
            });
            return;
        }
        if (Extra)return message.reply("Incorect command usage/arguments! Example: -gamble 1500");
        if (!bet) return message.reply(':warning: You must bet atleast 10coins to use this command!').then(message => {
			message.delete({timeout: 10000});
		});
        if (bet < 10)return message.channel.send(`I'm sorry ${message.author}, you have to bet **10coins** or more to use this command!`);
        if (bet > bal)return message.channel.send(`I'm sorry ${message.author}, You don't have enough money to make a **${bet}** bet. You only have **${bal}**!`);
        db.subtract(`money_${message.guild.id}_${message.author.id}`, bet);
        var GambleBet = Math.floor(Math.random() * 25);
        var Compare = Math.floor(Math.random() * 25);
        if (GambleBet == Compare){
            var Win = Math.floor(Math.random() * 3000);
            db.add(`money_${message.guild.id}_${message.author.id}`, Win)
            if (Win < bet)return message.channel.send(`Congratulations ${message.author}! You just won **$${Win}** but, you still lost **$${bet-Win}**. :face_with_monocle:`);
            if (Win == bet)return message.channel.send(`Congratulations ${message.author}! You got your **$${bet}** back! :dollar:`);
            message.channel.send(`Congratulations ${message.author}! You just won **$${Win}**! :money_with_wings:`);
        }else{
            let NewBal = db.fetch(`money_${message.author.id}`); if (NewBal == null)NewBal = "0";
            if (NewBal > 1000){
                message.reply(`Better luck next time. Why not try again? You still have **${NewBal}**!`);
            }else{
                message.reply("You lost. Better luck next time!");
            }
        }
	}
    if (command === "worldnews" ) {
try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?sources=reuters&pageSize=5&apiKey=${newsAPI}`
      );
      const json = await response.json();
      const articleArr = json.articles;
      let processArticle = article => {
        const embed = new MessageEmbed()
          .setColor('#FF4F00')
          .setURL('https://discord.gg/WGtQPBWpT8')
          .setTitle(article.title)
          .setAuthor(article.author)
          .setDescription(article.description)
          .setThumbnail(article.urlToImage)
          .setTimestamp(article.publishedAt)
          .setFooter('powered by NewsAPI.org');
        return embed;
      };
      async function processArray(array) {
        for (const article of array) {
          const msg = await processArticle(article);
          message.channel.send(msg);
        }
      }
      await processArray(articleArr);
    } catch (e) {
      message.channel.send('Something failed along the way');
      return console.error(e);
    }
  }
    if (command === "usnews" ) {
try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${newsAPI}`
      );
      const json = await response.json();
      const articleArr = json.articles;
      let processArticle = article => {
        const embed = new MessageEmbed()
          .setColor('#FF4F00')
          .setURL('https://discord.gg/WGtQPBWpT8')
          .setTitle(article.title)
          .setAuthor(article.author)
          .setDescription(article.description)
          .setThumbnail(article.urlToImage)
          .setTimestamp(article.publishedAt)
          .setFooter('powered by NewsAPI.org');
        return embed;
      };
      async function processArray(array) {
        for (const article of array) {
          const msg = await processArticle(article);
          message.channel.send(msg);
        }
      }
      await processArray(articleArr);
    } catch (e) {
      message.channel.send('Something failed along the way');
      return console.error(e);
    }
  }
    if (command === "indnews" ) {
try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=in&pageSize=5&apiKey=${newsAPI}`
      );
      const json = await response.json();
      const articleArr = json.articles;
      let processArticle = article => {
        const embed = new MessageEmbed()
          .setColor('#FF4F00')
          .setURL('https://discord.gg/WGtQPBWpT8')
          .setTitle(article.title)
          .setAuthor(article.author)
          .setDescription(article.description)
          .setThumbnail(article.urlToImage)
          .setTimestamp(article.publishedAt)
          .setFooter('powered by NewsAPI.org');
        return embed;
      };
      async function processArray(array) {
        for (const article of array) {
          const msg = await processArticle(article);
          message.channel.send(msg);
        }
      }
      await processArray(articleArr);
    } catch (e) {
      message.channel.send('Something failed along the way');
      return console.error(e);
    }
  }
    if (command === "covid" ) { 
       

        let countries = args.join(" ");

        //Credit to Sarastro#7725 for the command :)

        const noArgs = new MessageEmbed()
        .setTitle('Missing arguments')
        .setURL('https://discord.gg/WGtQPBWpT8')
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
                .setURL('https://discord.gg/WGtQPBWpT8')
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
                .setURL('https://discord.gg/WGtQPBWpT8')
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
      .setURL('https://discord.gg/WGtQPBWpT8')
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
    if (command === "nuke") {
const image = new MessageAttachment("https://i.imgur.com/h4s2thQ.gif")
const embeds = [];

        for (let i = 1; i <= 1; ++i)
        {
            embeds.push(new MessageEmbed()
                .setColor("RANDOM")
                .setURL('https://discord.gg/WGtQPBWpT8')
                .setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }))
                .setTitle(`Are you sure you want to nuke this channel?`)
                .setDescription(`Nuking this channel will delete all messages that are sent in this channel. This action is irreversable.`)
                .addField('What do you want to do?', `✅ Nuke this channel!\n❌ Nothing. I changed my mind.`))
        }

        const embed = new Embeds()
            .setArray(embeds)
            .setAuthorizedUsers(message.author.id)
            .setChannel(message.channel)
            .setFunctionEmojis({
                '✅': async () => {
                    await message.channel.clone({
                        name: message.channel.name,
                        type: 'text',
                        topic: message.channel.topic,
                        reason: `${message.author.tag} nuked this channel.`
                    });
                    await message.channel.delete();
                },
                '❌': () => {
                    return embed.delete();
                }
            })
            .setDisabledNavigationEmojis(['all'])
            .setDeleteOnTimeout(true)
            .setTimeout(30000)
            .on('error', (err) => {
                // embed.delete() is not a function. But, ignore it since 
                // it's a function of Message.
                // Also, ignore any Discord API Errors.
                if (err.name == 'TypeError' || err.name == 'DiscordAPIError') return;
                message.recordError('error', 'nukechannel', 'Command Error', err.stack)
            })
            .on('finish', () => { return; });

        embed.build();

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
    if (blockedUsers.includes(message.author.id)) return message.author.send("You are blocked!");
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
    if (command === "botstats") {
let Owner = message.author;
    if(Owner.id !== "688671832068325386" && Owner.id !== "213588167406649346") return message.reply({embed: {
    color: 3066993,
    description:"Only the bot owner can use this command!"
}})
  let msg =  bot.guilds.cache.map(guild => `**${guild.name}** Members: ${guild.memberCount}`).join('\n');
  let embed = new MessageEmbed()
  .setURL('https://discord.gg/WGtQPBWpT8')
  .setTitle(`I am in ${bot.guilds.cache.size} guilds!`)
  .setDescription(`${msg}`)
  .setColor("#ebf442");
  message.channel.send(embed);
}
    if (command === "rules") {
    let Owner = message.author;
    if(Owner.id !== "688671832068325386" && Owner.id !== "213588167406649346") return message.reply({embed: {
    color: 3066993,
    description:"You can't use this command,\n Dm Aᴋ᭄Abhiᴮᴼˢˢ࿐ for more details!"
}})
       const rulesembed = new MessageEmbed()
             .setTitle("Rules:")
             .setAuthor(`${message.guild.name}`, message.guild.iconURL)
             .setColor("RANDOM")
             .setImage(message.guild.iconURL())
             .setTimestamp()
             .setDescription(`1. ► No Self Promotion or Promoting Others in Normal Channels.\n\n2. ►No Racism/Abuse/Profanity, Treat Each Other Humbly.\n\n3. ►No Trash Talking For other Youtubers/Streamers.\n\n4. ► Use Every Channel for Their Purpose they Made For. Don't Do Any Extra Activity.\n\n5. ►Respect Moderators.\n\n6. ►Do not ask why got muted.\n\n7. ► Respect Each Member.\n\n8. ►Don' t let anyone spoil your fun in chat and help in keeping the chat  clean by reporting spammers/abusive trolls.\n\n9. ► No invitation LINKS.\n\n10. ► Don't Spam in Chat Either Mod Have Power to Kick/Mute/Warn/Ban You.\n\n11. ► Don't Argue With Any Mod/Staff.  Their Decision will be last Decision.\n\n12. ► Don't Share Your Personal Life / Photographs /Contact Number/Other Personal Things Here Either Mod Will Ban you Permanently.\n\n13. ► Do not impersonate staff /mod/leader - This is something we take seriously, regardless if its a joke or not.\n\n14.  ► Listen and respect To everyone , especially the Mods/Admins/leader.\n\n15. ►Only Chat in English & If its urgency Then You guys can speak Hindi (or) If you can't Explain your prblm,Then only Chat in ENGLISH.\n\n16. ► if your Behavior is Not Deemed "Appropriate" for this server, Mod/Staff have the ability to enforce a kick/ban even if does not line up with the Above Rules.`)
         message.channel.send(rulesembed)
         message.channel.send("<@everyone>")
    }
    if (command === "stats") {
    let Owner = message.author;
    if(Owner.id !== "688671832068325386" && Owner.id !== "213588167406649346") return message.reply({embed: {
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
    if(Owner.id !== "688671832068325386" && Owner.id !== "213588167406649346") return message.reply({embed: {
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
    if(Owner.id !== "688671832068325386" && Owner.id !== "213588167406649346") return message.reply({embed: {
    color: 3066993,
    description:"Only the bot owner can use this command!"
}})
      message.guild
        .leave()
        .then(guild => console.log('Left guild', guild.name))
        .catch(console.error);
    }
    if (command === "nick" ) {
    message.delete();
    if(!message.member.hasPermission("MANAGE_MEMBERS")) return message.channel.send(` **You don't have permissions!**`);
  let user = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
  let nickname = message.content
      .split(`${PREFIX}nick ${user}`)
      .join("");
  user.setNickname(nickname);
  
  const embed = new MessageEmbed()
  .setURL('https://discord.gg/WGtQPBWpT8')
  .setTitle("Nickname succesfully given.")
  .setColor("RANDOM")
  .setDescription(`Succesfully changed  the nickname of ${user}.`)
  .setFooter(`At: ${moment().format("dddd, MMMM Do YYYY, h:mm A", Date.now)}`);
  
  message.channel.send(embed);
}
    if (command === "setbotnick") {
    let Owner = message.author;
    if(Owner.id !== "688671832068325386" && Owner.id !== "213588167406649346") return message.reply({embed: {
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
        .setURL('https://discord.gg/WGtQPBWpT8')
        .setColor("RANDOM")

        message.channel.send(helpembed);
    }
    if (command === "enroll" ) {
    message.channel.send(`${message.author}, Entry started in your Dm(s)!`).then(msg => msg.delete(10000));
    let member = message.author;
    message.delete().catch();
    await message.author.createDM();
 
    let embed = new Discord.MessageEmbed()
        .setDescription(`Starting....Type OK to continue🤪`)
    message.author.send(embed)
   
 
   
    var tazer = message.author.dmChannel.createMessageCollector(a => a.author.id == message.author.id, { time: 10000 * 50, max: 1 });
    tazer.on('collect', r => {
        let nome = r.content;
        let embed2 = new Discord.MessageEmbed()
            .setDescription(`Send your freind discord name and tag`)
        message.author.send(embed2)
 
        var tazer1 = message.author.dmChannel.createMessageCollector(a => a.author.id == message.author.id, { time: 10000 * 50, max: 1 });
        tazer1.on('collect', r => {
            let serve = r.content;
            let embed3 = new Discord.MessageEmbed()
                .setDescription(`Describe about your freind`)
            message.author.send(embed3)

                    var tazer4 = message.author.dmChannel.createMessageCollector(a => a.author.id == message.author.id, { time: 10000 * 50, max: 1 });
                    tazer4.on('collect', r => {
                        let fac = r.content;

                                let embed8 = new Discord.MessageEmbed()
                                    .setDescription("To send your submission type CONFIRM,\nTo cancel your submission type CANCEL ")
                                message.author.send(embed8)
 
                                var confirm = message.author.dmChannel.createMessageCollector(a => a.author.id == message.author.id, { time: 10000 * 50, max: 1 });
                                confirm.on('collect', r => {
                                    if (r.content.toLowerCase() == "confirm") {
                                        let embed12 = new Discord.MessageEmbed()
                                            .setDescription(`Successfully submitted!`)
                                            message.author.send(embed12)
                                        
                      let servericon = message.author.displayAvatarURL;
                                        const form = new Discord.MessageEmbed()
                                            .setTitle('New Entry')
                                            .setURL('https://discord.gg/WGtQPBWpT8')
                                            .addField("Submitted by:", message.author.tag)
                                            .addField("Freind Discord Tag:", nome)
                                            .addField("Description:", serve)
                                            .setFooter(`Noob Army`)
                                            .setThumbnail(servericon)
                                            .setColor('RANDOM')
                                        bot.channels.cache.get('787908794743128084').send(`|| <@688671832068325386> ||`, form).then(async msg => {
                                            const collector = msg.createReactionCollector((r, u) => (r.emoji.name === '✔') && (u.id !== bot.user.id && u.id === message.author.id))
                                            collector.on("collect", r => {
                                                switch (r.emoji.name) {
                                                    case '✔':
                                                    let embed13 = new Discord.MessageEmbed()
                                                    .setDescription(``)
                                                        message.author.createDM().then(dm => dm.send(embed13))
                                                        break;
                                                }
                                            })
                                        })
                                    }
                                    if (r.content.toLowerCase() == "cancel") {
                                        message.author.send({ embed: { description: "Successfully cancelled!" } });
                                    }
                                   if (r.content.toLowerCase() != "confirm" && r.content.toLowerCase() != "cancel") {
                                       message.author.send({ embed: { description: " Wrong Input,\n Cancelled your entry , \n To Participate again start from first step!" } });
                                    }
                                })
                            })
                        })
                    })
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
             .setURL('https://discord.gg/WGtQPBWpT8')
             .setTitle("Your Health Status")
             .setAuthor(message.author.username)
             .setDescription(randomMessage)
             .setTimestamp()
             .setFooter("Stay Home,Stay Safe!", message.author.displayAvatarURL());
        message.channel.send(helpembed);
    }
    if (command === "membercount" ) {
        const role = message.guild.roles.cache.size;
   const online = (message.guild.members.cache.filter(m => m.presence.status != 'offline').size - message.guild.members.cache.filter(m=>m.user.bot).size)
      const embed = new MessageEmbed()
            .setAuthor("• Servername " + message.guild.name, message.guild.iconURL)
            .setColor("RANDOM")
            .addField(`Members`, `${message.guild.memberCount - message.guild.members.cache.filter(m=>m.user.bot).size}`, true)
            .addField(`Online`, `${online}`, true)
            .addField(`Bots`, message.guild.members.cache.filter(m=>m.user.bot).size)
            .setTimestamp()
            .setFooter(`Command Used by : ${message.author.tag}`, message.author.avatarURL);
      message.channel.send({embed}) 
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
        .setAuthor(`Noob Army`, bot.user.displayAvatarURL())
        .setDescription(`Noob Army Music Bot Information`)
        .setImage(bot.user.displayAvatarURL())
        .addField("Bot Owner", `Aᴋ᭄Abhiᴮᴼˢˢ࿐`)
        .addField("Owner Id", `688671832068325386`)
        .addField("My Id", `758889056649216041`)
        .addField("My Prefix", `+`)
        .addField(`Servers`,`${servers}`, true)
        .addField(`Users`, `${users}`, true)
        .addField(`Invite Me!`, `[Click Here!](https://discord.com/api/oauth2/authorize?client_id=758889056649216041&permissions=8&scope=bot)`, true)
        .setFooter(`Uptime: ${uptime}`);

    message.channel.send(serverembed);    

}
    if (command === "createinvite" ) {
const Options = {
    temporary: false,
    maxAge: 0,
    maxUses: 0,
    unique: true
  };
  
  let invite = message.channel.createInvite(Options).then(function(Invite){
    message.author.send({embed: {
      title: `• INVITE •`,
      description: `${verified} **Here is the invite:**\nhttps://discord.gg/` + Invite.code
    }})
    });
  
}
    if (command === "invites" ) {
     // Be sure to call this in async, as we will be fetching the invites of the guild

    // First, we need to fetch the invites
    let invites = await message.guild.fetchInvites().catch(error => { // This will store all of the invites into the variable
        // If an error is catched, it will run this...
        return message.channel.send('Sorry, I don\'t have the proper permissions to view invites!');
    }) // This will store all of the invites into the variable

    // Next, we can turn invites into an array
    invites = invites.array();

    // Now, using arraySort, we can sort the array by 'uses'
    arraySort(invites, 'uses', { reverse: true }); // Be sure to enable 'reverse'

    // Next, we need to go through each invite on the server, to format it for a table
    let possibleInvites = [['User', 'Uses']]; // Each array object is a rown in the array, we can start up by setting the header as 'User' & 'Uses'
    invites.forEach(function(invite) {
        possibleInvites.push([invite.inviter.username, invite.uses]); // This will then push 2 items into another row
    })

    // Create the output embed
    const embed = new MessageEmbed()
        .setColor(0xCB5A5E)
        .addField('Leaderboard', `\`\`\`${table.table(possibleInvites)}\`\`\``); // This will be the field holding the leaderboard
        // Be sure to put the table in a codeblock for proper formatting

    // Now, we can send the embed to chat - Instead of a regular message, we can use quick.hook
    send(message.channel, embed, {
        name: 'Community Of People™',
        icon: 'https://cdn2.iconfinder.com/data/icons/circle-icons-1/64/trophy-128.png'
    })
    
}
    if(command === "oldest" || command === "oldacc" ) {
      const { formatDate } = require("./function.js");
    let mem = message.guild.members.cache
      .filter((m) => !m.user.bot)
      .sort((a, b) => a.user.createdAt - b.user.createdAt)
      .first();
    const Embed = new MessageEmbed()
      .setTitle(`The oldest member in ${message.guild.name}`)
      .setColor(`RANDOM`)
      .setURL('https://discord.gg/WGtQPBWpT8')
      .setFooter(`Date format: MM/DD/YYYY`)
      .setDescription(
        `${mem.user.tag} is the oldest user in ${
          message.guild.name
        }! Account creation date: ${formatDate(mem.user.createdAt)}`
      );
    message.channel.send(Embed);
  }
  if (command === "youngest" || command === "youngacc" ) {
     const { formatDate } = require("./function.js");
    let mem = message.guild.members.cache
      .filter((m) => !m.user.bot)
      .sort((a, b) => b.user.createdAt - a.user.createdAt)
      .first();
    const Embed = new MessageEmbed()
      .setTitle(`The youngest member in ${message.guild.name}`)
      .setColor(`RANDOM`)
      .setURL('https://discord.gg/WGtQPBWpT8')
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
      .setURL('https://discord.gg/WGtQPBWpT8')
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
			.then(() => message.channel.send(`Made channel \`${message.channel.name}\` private!`))
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

		message.channel.permissionOverwrites.get(message.guild.id)
			.then(() => message.channel.send(`Made channel ${message.channel.name} public!`))
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
