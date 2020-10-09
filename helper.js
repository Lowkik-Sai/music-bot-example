let permRanks = config.get('moderation');
let speechBotChannels = config.get('speechbot');
let priceBotChannels = config.get('pricebot');
let ExcludedSpam = config.get('spamdetection');
let hashBotChannels = config.get('hashbot');
let statsBotChannels = config.get('statsbot');


// Checks if user is allowed to use a command only for mods/team members
exports.hasPerms = function(msg) {
  return msg.member.roles !== null && msg.member.roles.some(r => permRanks.perms.includes(r.name));
};

// Check if command was sent in dm
exports.inPrivate = function(msg) {
  return msg.channel.type == 'dm';
};

