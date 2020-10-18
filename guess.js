
const Discord = require('discord.js')

const cooldown = new Set();

exports.run = (bot, message) => {
const args = message.content.split(" ").slice(1).join(" ")

const embed = new Discord.MessageEmbed()
.setDescription("Please specify the number you would like to guess up to")
.setColor("RED")

if (!args) return message.channel.send(embed)

const embed2 = new Discord.MessageEmbed()
.setDescription("Please say a valid number")
.setColor("RED")

if (isNaN(Number(args))) return message.channel.send(embed2)

var randomNumber = Math.round(Math.random() * Number(args))

const embed4 = new Discord.MessageEmbed()
.setDescription("Please do not input a number that is less than 0")
.setColor("RED")
if (Number(args) < 0) return message.channel.send(embed4)

if (Number(args) === Infinity) return message.channel.send("That wont work... What are you trying to do here?")

console.log(`random guessing game started by ${message.author.tag} and the number is ${randomNumber}`)

const embed3 = new Discord.MessageEmbed()
.setDescription(`The Game has started! Guess a number between 0-${args} in 2 minutes!`)
.setFooter(`Only ${message.author.username} can play in this round, if you want to play, you can do p!guess [number] to play!`)
.setColor("4CEF8B")

if (!cooldown.has(message.author.id)) {
cooldown.add(message.author.id);
setTimeout(() => {
  cooldown.delete(message.author.id)
}, 900000);
}

message.channel.send(embed3).then(msg => {
 const filter = m => m.author.id === message.author.id
    const collector = message.channel.createMessageCollector(filter, { time: 120000 });
let gotCorrect = false
        collector.on('collect', m => {
          let currentnum;
          if (Number(m.content) > randomNumber) {
            if (currentnum === Number(m.content)) return;
            message.channel.send(new Discord.MessageEmbed().setColor("RED").setTitle("That is the wrong number!").setDescription(`The number is **Less** than **${Number(m.content)}**!`))
            currentnum = Number(m.content)
          }
          if (Number(m.content) < randomNumber) {
            if (currentnum === Number(m.content)) return;
            message.channel.send(new Discord.MessageEmbed().setColor("RED").setTitle("That is the wrong number!").setDescription(`The number is **More** than **${Number(m.content)}**!`))
            currentnum = Number(m.content)
          }
          
          if (Number(m.content) === randomNumber) {
            gotCorrect = true
            collector.stop()
            const embed = new Discord.MessageEmbed().setColor("4CEF8B").setTitle("You got the number correct!").setDescription("You now have the feeling of satisfaction!")
            message.channel.send(embed)
          }
        });
  collector.on('end', collected => {
	if (gotCorrect === false) return message.channek.send(new Discord.MessageEmbed().setColor("RED").setTitle("The timer ran out!").setDescrtipion(`The number was **${randomNumber}**! Please try again!`))
});
});
};

exports.help = {
  name: "guess",
  description: "Lets you guess a number between 0 and a number you choose",
  usage: "guess [max number]",
  category: "Fun"
}

exports.aliases = []
