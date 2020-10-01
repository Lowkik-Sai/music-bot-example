const { Client, Util, MessageEmbed } = require("discord.js");
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


bot.on('ready', () => {
  console.log("Activity OK")
  //CHANGE {type: 2} in 
  //1 FOR PLAYING
  //2 FOR LISTENING
  //3 FOR WATCHING
  bot.user.setActivity("Among Us Official", {type: 3});
});

bot.on('message', msg => {
  if (msg.content === 'prefix') {
    msg.reply('My Prefix is **-**');
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
    const serverQueue = queue.get(message.guild.id);

    let command = message.content.toLowerCase().split(" ")[0];
    command = command.slice(PREFIX.length);
    
    if (command === "invite" || command === "inv") {
        const helpembed = new MessageEmbed()
            .setColor("BLUE")
            .setAuthor("Invite Link", message.author.displayAvatarURL())
            .setDescription(`[Click here!](https://discord.com/api/oauth2/authorize?client_id=758889056649216041&permissions=8&scope=bot)`)
            .setTimestamp()
            .setFooter("Among Us Official", "https://cdn.discordapp.com/attachments/758709208543264778/758904787499745310/Screenshot_2020-09-25-09-45-28-68.jpg");
        message.channel.send(helpembed);
    }
    if (command === "invite" || command === "inv") {
        const helpembed = new MessageEmbed()
            .setColor("BLUE")
            .setAuthor("Invite Link", message.author.displayAvatarURL())
            .setDescription(`[Click here!](https://discord.com/api/oauth2/authorize?client_id=758889056649216041&permissions=8&scope=bot)`)
            .setTimestamp()
            .setFooter("Among Us Official", "https://cdn.discordapp.com/attachments/758709208543264778/758904787499745310/Screenshot_2020-09-25-09-45-28-68.jpg");
        message.author.send(helpembed);
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
    if (command === "ban" ) {
        const config = require('./config.json')
        
        if (!cache.get(req.message.author.id)) {
      var execArray = this.regPattern.exec(req.command.suffixe)
      var userId = execArray[1]
      var reason = execArray[2] !== '' ? execArray[2].replace(/^\s+|\s+$/g, '') : 'No reason'
      var target = req.message.channel.guild.members.get(userId)
      if (target) {
        if (target.roles.has(config.modRole)) return
        if (target._roles.some(role => config.disabledRoleBan.indexOf(role) >= 0)) return
        if (target.user.bot && !config.allowBotBan) return
        if (!config.allowHigherRankBan) {
          var roleIndexesReq = req.message.member.roles.map((role) => {
            return role.calculatedPosition
          })
          roleIndexesReq.sort()
          var roleIndexesTarget = target.roles.map((role) => {
            return role.calculatedPosition
          })
          roleIndexesTarget.sort()
          if (roleIndexesReq[roleIndexesReq.length - 1] < roleIndexesTarget[roleIndexesTarget.length - 1]) return
        }
      }
      cache.set(req.message.author.id, true)
      console.log(`Banning command request from id: ${req.message.author.id} - ${req.message.author.username}\n Ban id requested: ${userId} - ${target != null ? target.user.username : 'Unknown name'}\nReason: ${reason}`)
      req.channel.guild.ban(userId, { reason: reason }).then(() => {
        if (config.modLog) req.client.channelLog.send('', { embed: { description: `User banned by ${req.message.author.username} - ${req.message.author.id}\nReason: ${reason}`, title: `New ban: ${userId} - ${target != null ? target.user.username : 'Unknown name'}` } })
        console.log(` Banned: ${userId} at ${new Date().toJSON().slice(0, 20).replace(/-/g, '/')}`)
      }).catch((err) => {
        console.log(`Can't ban\n ${err.message}`)
        req.channel.send('Can\'t ban')
      })
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
    if (command === "avatar" || command === "a") {
        let member = message.mentions.users.first() || message.author

        let avatar = member.displayAvatarURL({size: 1024})


        const helpembed = new MessageEmbed()
        .setTitle(`${member.username}'s avatar`)
        .setImage(avatar)
        .setColor("RANDOM")

        message.channel.send(helpembed);
    }
    if (command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
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
        const helpembed = new MessageEmbed()
            .setColor("RED")
            .setTitle("Server Info")
            .setImage(message.guild.iconURL())
            .setDescription(`${message.guild}'s information`)
            .addField("Owner", `The owner of this server is ${message.guild.owner}`)
            .addField("Member Count", `This server has ${message.guild.memberCount} members`)
            .addField("Emoji Count", `This server has ${message.guild.emojis.cache.size} emojis`)
            .addField("Roles Count", `This server has ${message.guild.roles.cache.size} roles`)
            .setTimestamp()
        message.channel.send(helpembed);
    }
    if (command === "botinfo" || command === "bi") {
        const helpembed = new MessageEmbed()
            .setColor("ORANGE")
            .setTitle("Bot Info")
            .setAuthor(`${message.guild}`, message.author.displayAvatarURL())
            .setDescription(`Among Us Music Bot Information`)
            .addField("Bot Owner", `The owner of this bot is Rock Star`)
            .addField("Owner Id", `The owner id is 654669770549100575`)
            .addField("My Id", `The bot id is 758889056649216041`)
            .addField("My Prefix", `The bot prefix is -`)
            .addField("Invite Me", `[Click here!](https://discord.com/api/oauth2/authorize?client_id=758889056649216041&permissions=8&scope=bot)`)
            .setTimestamp()
            .setFooter("Type -help for more commands!")
        message.channel.send(helpembed);
    }
    if (command === "help" || command === "cmd") {
        const helpembed = new MessageEmbed()
            .setColor("BLUE")
            .setAuthor("Commands List", message.author.displayAvatarURL())
            .setDescription(`
1) \`play(p)\`  
2) \`search(sc)\`
3) \`skip(sk)\`
4) \`stop(st)\`
5)  \`pause(pa)\`
6) \`resume(r)\`
7) \`nowplaying(np)\`
8) \`queue(q)\`
9) \`volume(v)\`
10) \`invite(inv)\`
11) \`serverinfo(si)\`
12) \`botinfo(bi)\``)
            .setTimestamp()
            .setFooter("Among Us Official", "https://cdn.discordapp.com/attachments/758709208543264778/758904787499745310/Screenshot_2020-09-25-09-45-28-68.jpg");
        message.author.send(helpembed);
    }
    if (command === "help" || command === "cmd") {
        const helpembed = new MessageEmbed()
            .setColor("BLUE")
            .setDescription(`
📩 |You've got Dm!`)
            .setTimestamp()
              message.channel.send(helpembed);
    }
    if (command === "play" || command === "p") {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send({embed: {color: "RED", description: "I'm sorry, but you need to be in a voice channel to play a music!"}});
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT")) {
            return message.channel.send({embed: {color: "RED", description: "Sorry, but I need a **`CONNECT`** permission to proceed!"}});
        }
        if (!permissions.has("SPEAK")) {
            return message.channel.send({embed: {color: "RED", description: "Sorry, but I need a **`SPEAK`** permission to proceed!"}});
        }
        if (!url || !searchString) return message.channel.send({embed: {color: "RED", description: "Please input link/title to play music"}});
        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            for (const video of Object.values(videos)) {
                const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
                await handleVideo(video2, message, voiceChannel, true); // eslint-disable-line no-await-in-loop
            }
            return message.channel.send({embed: {
                    color: "GREEN",
                    description: `✅  **|**  Playlist: **\`${playlist.title}\`** has been added to the queue`
            }});
        } else {
            try {
                var video = await youtube.getVideo(url);
            } catch (error) {
                try {
                    var videos = await youtube.searchVideos(searchString, 10);
                    var video = await youtube.getVideoByID(videos[0].id);
                    if (!video) return message.channel.send({embed: {color: "RED", description: "🆘  **|**  I could not obtain any search results"}});
                } catch (err) {
                    console.error(err);
                    return message.channel.send({embed: {color: "RED", description: "🆘  **|**  I could not obtain any search results"}});
                }
            }
            return handleVideo(video, message, voiceChannel);
        }
    }
    if (command === "search" || command === "sc") {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send({embed: {color: "RED", description: "I'm sorry, but you need to be in a voice channel to play a music!"}});
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT")) {
            return message.channel.send({embed: {color: "RED", description: "Sorry, but I need a **`CONNECT`** permission to proceed!"}});
        }
        if (!permissions.has("SPEAK")) {
            return message.channel.send({embed: {color: "RED", description: "Sorry, but I need a **`SPEAK`** permission to proceed!"}});
        }
        if (!url || !searchString) return message.channel.send({embed: {color: "RED", description: "Please input link/title to search music"}});
        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            for (const video of Object.values(videos)) {
                const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
                await handleVideo(video2, message, voiceChannel, true); // eslint-disable-line no-await-in-loop
            }
            return message.channel.send({embed: {
                color: "GREEN",
                description: `✅  **|**  Playlist: **\`${playlist.title}\`** has been added to the queue`
            }});
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
                        return message.channel.send({embed: {
                            color: "RED",
                            description: "The song selection time has expired in 15 seconds, the request has been canceled."
                        }});
                    }
                    const videoIndex = parseInt(response.first().content);
                    var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
                } catch (err) {
                    console.error(err);
                    return message.channel.send({embed: {color: "RED", description: "🆘  **|**  I could not obtain any search results"}});
                }
            }
            response.delete();
            return handleVideo(video, message, voiceChannel);
        }

    } else if (command === "skip" || command === "sk") {
        if (!message.member.voice.channel) return message.channel.send({embed: {color: "RED", description: "I'm sorry, but you need to be in a voice channel to skip a music!"}});
        if (!serverQueue) return message.channel.send({embed: {color: "RED", description: "There is nothing playing that I could skip for you"}});
        serverQueue.connection.dispatcher.end("[runCmd] Skip command has been used");
        return message.channel.send({embed: {color: "GREEN", description: "⏭️  **|**  I skipped the song for you"}});

    } else if (command === "stop" || command === "st") {
        if (!message.member.voice.channel) return message.channel.send({embed: {color: "RED", description: "I'm sorry but you need to be in a voice channel to play music!"}});
        if (!serverQueue) return message.channel.send({embed: {color: "RED", description: "There is nothing playing that I could stop for you"}});
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end("[runCmd] Stop command has been used");
        return message.channel.send({embed: {color: "GREEN", description: "⏹️  **|**  Deleting queues and leaving voice channel..."}});

    } else if (command === "volume" || command === "v") {
        if (!message.member.voice.channel) return message.channel.send({embed: {color: "RED", description: "I'm sorry, but you need to be in a voice channel to set a volume!"}});
        if (!serverQueue) return message.channel.send({embed: {color: "RED", description: "There is nothing playing"}});
        if (!args[1]) return message.channel.send({embed: {color: "BLUE", description: `The current volume is: **\`${serverQueue.volume}%\`**`}});
        if (isNaN(args[1]) || args[1] > 100) return message.channel.send({embed: {color: "RED", description: "Volume only can be set in a range of **\`1\`** - **\`100\`**"}});
        serverQueue.volume = args[1];
        serverQueue.connection.dispatcher.setVolume(args[1] / 100);
        return message.channel.send({embed: {color: "GREEN", description: `I set the volume to: **\`${args[1]}%\`**`}});

    } else if (command === "nowplaying" || command === "np") {
        if (!serverQueue) return message.channel.send({embed: {color: "RED", description: "There is nothing playing"}});
        return message.channel.send({embed: {color: "BLUE", description: `🎶  **|**  Now Playing: **\`${serverQueue.songs[0].title}\`**`}});

    } else if (command === "queue" || command === "q") {
        if (!serverQueue) return message.channel.send({embed: {color: "RED", description: "There is nothing playing"}});
        let embedQueue = new MessageEmbed()
            .setColor("BLUE")
            .setAuthor("Song queue", message.author.displayAvatarURL())
            .setDescription(`${serverQueue.songs.map(song => `**-** ${song.title}`).join("\n")}`)
            .setFooter(`• Now Playing: ${serverQueue.songs[0].title}`);
        return message.channel.send(embedQueue);

    } else if (command === "pause" || command === "pa") {
        if (serverQueue && serverQueue.playing) {
            serverQueue.playing = false;
            serverQueue.connection.dispatcher.pause();
            return message.channel.send({embed: {color: "GREEN", description: "⏸  **|**  Paused the music for you"}});
        }
        return message.channel.send({embed: {color: "RED", description: "There is nothing playing"}});

    } else if (command === "resume" || command === "r") {
        if (serverQueue && !serverQueue.playing) {
            serverQueue.playing = true;
            serverQueue.connection.dispatcher.resume();
            return message.channel.send({embed: {color: "GREEN", description: "▶  **|**  Resumed the music for you"}});
        }
        return message.channel.send({embed: {color: "RED", description: "There is nothing playing"}});
    } else if (command === "loop") {
        if (serverQueue) {
            serverQueue.loop = !serverQueue.loop;
            return message.channel.send({embed: {color: "GREEN", description: `🔁  **|**  Loop is **\`${serverQueue.loop === true ? "enabled" : "disabled"}\`**`}});
        };
        return message.channel.send({embed: {color: "RED", description: "There is nothing playing"}});
    }
};

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
            return message.channel.send({embed: {color: "RED", description: `I could not join the voice channel, because: **\`${error}\`**`}});
        }
    } else {
        serverQueue.songs.push(song);
        if (playlist) return;
        else return message.channel.send({embed: {color: "GREEN", description: `✅  **|**  **\`${song.title}\`** has been added to the queue`}});
    }
    return;
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
