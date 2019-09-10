const config = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();
const Enmap = require('enmap');
client.settings = new Enmap({
    name: "settings",
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep'
});


const defaultSettings = {
    prefix: "!",
    modLogChannel: "mod-log",
    modRole: "Moderator",
    adminRole: "Administrator",
    welcomeChannel: "welcome",
    welcomeMessage: "Say hello to {{user}}, everyone!"
}

client.on("guildDelete", guild => {
    client.settings.delete(guild.id);
});

client.on("guildMemberAdd", member => {
    client.settings.ensure(member.guild.id, defaultSettings);
    let welcomeMessage = client.settings.get(member.guild.id, "welcomeMessage");
    welcomeMessage = welcomeMessage.replace("{{user}}", member.user.tag)
    member.guild.channels
    .find("name", client.settings.get(member.guild.id, "welcomeChannel"))
    .send(welcomeMessage)
    .catch(console.error);
});

client.on("message", async (message) => {
    if(!message.guild || message.author.bot) return;
    const guildConf = client.settings.ensure(message.guild.id, defaultSettings);
    if(message.content.indexOf(guildConf.prefix) !== 0) return;
    const args = message.content.split(/\s+/g);
    const command = args.shift().slice(guildConf.prefix.length).toLowerCase();

});

if(command === "setconf") {
    const adminRole = message.guild.roles.find("name", guildConf.adminRole);
    if(!adminRole) return message.reply("Administrator Role Not Found");
    if(!message.member.roles.has(adminRole.id)) {
        return message.reply("You're not an admin, sorry!");
    }
    const [prop, ...value] = args;
    if(!client.settings.has(message.guild.id, prop)) {
        return message.reply("This key is not in the configuration.");
    }
    client.settings.set(message.guild.id, value.join(" "), prop);
    message.channel.send(`Guild configuration item ${prop} has been changed to:\n\`${value.join(" ")}\``);
}

if(command === "showconf") {
    let configProps = Object.keys(guildConf).map(prop => {
      return `${prop}  :  ${guildConf[prop]}\n`;
    });
    message.channel.send(`The following are the server's current configuration:
    \`\`\`${configProps}\`\`\``);
  }






