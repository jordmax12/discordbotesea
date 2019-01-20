// this is the way to load a package with NodeJS
const express = require("express");
const Crawler = require("crawler");
const Discord = require('discord.js')
const client = new Discord.Client()
const Humanoid = require("humanoid-js");
const humanoid = new Humanoid();
require('dotenv').config()
// Helpers
const { mapLeague, removePastRoles, truncate, isValidDate, getMessageErrors, daysMap } = require('./crawler-helper.js');

client.login(process.env.BOT_TOKEN);

client.on('ready', () => {
  client.user.setUsername("NA Scrims Bot");
})
client.on('message', msg => {
  const userId = msg.author.id,
    userName = msg.author.username,
    isBot = msg.author.bot

  if (!isBot) {
    var c = new Crawler({
      maxConnections: 10,
      callback: function (error, res, done) {
        if (error) {
          console.log(error);
        } else {
          var $ = res.$;
          let rank = $("#rankGraph h1").text().trim(),
            rRole = $("#rankGraph h1").text().trim().charAt(0) || "Unranked",
            league = mapLeague($('label:contains("League:")').siblings('.data').text()),
            rankRole = msg.guild.roles.find(role => role.name.trim() === rRole),
            leagueRole = msg.guild.roles.find(role => role.name.trim() === league);

          let oldDisplayName = msg.member.displayName,
            newDisplayName = msg.member.displayName; //default

          if (league == "Advanced") league = "Adv";
          if (league == "Professional") league = "EPL";

          try {
            oldDisplayName = $('#upanel-profile header')[0].children[0].data.split('- User')[0].trim();
            if (league != 'LFT') {
              let teamName = $('label:contains("League:")').siblings('.data').find('a[href^="/teams"]')[0].children[0].data;
              if (teamName.length > 12) teamName = truncate(teamName, 12);
              newDisplayName = `[${teamName}-${league}]`;
              if (newDisplayName.length > 20) newDisplayName = truncate(newDisplayName, 20) + ']';
              newDisplayName = `${newDisplayName} ${oldDisplayName}`;
              if (newDisplayName.length > 32) newDisplayName = truncate(newDisplayName, 30);

            } else {
              newDisplayName = `[LFT] ${oldDisplayName}`;
            }

            msg.member.setNickname(newDisplayName);
          } catch (e) { msg.reply('Unable to set nickname, check with developer.'); console.log(e); };

          removePastRoles(rankRole, leagueRole, msg)
            .then(() => {
              msg.member.addRole(rankRole);
              if (leagueRole) msg.member.addRole(leagueRole);
              msg.reply('role(s) assigned, thanks!')
            });
        }
        done();
      }
    });

    if (msg.channel.name == "role-assigner") {
      if (msg.content.indexOf("play.esea.net/users/") > -1) {
        humanoid.get(msg.content)
          .then(res => {
            c.queue([{
              html: res.body
            }]);
          })
          .catch(err => {
            console.error(err)
          })
      }
      //       else if(msg.content.toLowerCase().indexOf("awesome") > -1 || msg.content.toLowerCase().indexOf("great job") > -1 || msg.content.toLowerCase().indexOf("ty") > -1 || msg.content.toLowerCase().indexOf("thx") > -1 || msg.content.toLowerCase().indexOf("nice job") > -1 || msg.content.toLowerCase().indexOf("thanks") > -1 || msg.content.toLowerCase().indexOf("thank you") > -1) {
      //           msg.reply("You're welcome :)"); 
      //         }
    } else if (msg.channel.name == 'regextest' ||  msg.channel.name == 'pro' || msg.channel.name == 'advanced' || msg.channel.name == 'mdl' || msg.channel.name == 'main' || msg.channel.name == 'im' || msg.channel.name == 'open') {
      let errors = [];
      errors = getMessageErrors(msg);
      if (errors.length > 0) {
        msg.delete();
        msg.author.sendMessage(`${errors[0]}\n\noriginal message:\n${msg.content}`);
        client.channels.get('532974153264005130').send(msg.content);
      }
    }
  }
})

client.on('messageUpdate', (oldMessage, newMessage) => {
  if (newMessage.channel.name == 'regextest' ||  newMessage.channel.name == 'pro' || newMessage.channel.name  == 'advanced' || newMessage.channel.name == 'mdl' || newMessage.channel.name == 'main' || newMessage.channel.name == 'im' || newMessage.channel.name == 'open') {
    let errors = [];
    errors = getMessageErrors(newMessage);
    if (errors.length > 0) {
      newMessage.delete();
      newMessage.author.sendMessage(`${errors[0]}\n\noriginal message:\n${newMessage.content}`);
      client.channels.get('532974153264005130').send(msg.content);
    }
  }
})


// create an express object: a Web server
var app = express();

// When our server receives a certain request, it needs to know what it should respond,
// so we are defining "routes" the server follows to return the right data.
// When the server gets a request for the "root" route of this domain: "/"
// here: "https://hello-node-server.glitch.me/"
app.get("/", function (request, response) {
  // we program the server to respond with an HTML string
  response.send("<h1>Hello :)</h1><p><a href='/about'>About</a></p>");
});

// when the server gets a request for "https://hello-node-server.glitch.me/about"
app.get("/about", function (request, response) {
  response.send("<h1>This is my about page</h1><a href='/'>Home</a></p>");
});

// finally we tell the server to listen for requests
app.listen(process.env.PORT);
// the server needs to listen for requests on a specified port:
// a port can be thought of as an access on device to communicate data
// and computers have thousands of ports
// on Glitch we can use "process.env.PORT" which corresponds to port 3000
