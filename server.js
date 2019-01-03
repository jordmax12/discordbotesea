// this is the way to load a package with NodeJS
const express = require("express");
const Crawler = require("crawler");
const Discord = require('discord.js')
const client = new Discord.Client()
const Humanoid = require("humanoid-js");
const humanoid = new Humanoid();
require('dotenv').config()
// Helpers
const { mapLeague, removePastRoles } = require('./crawler-helper.js');

client.login(process.env.BOT_TOKEN);

client.on('message', msg => {
  const userId = msg.author.id,
        userName = msg.author.username,
        isBot = msg.author.bot
        // error = 1 / 0;

  if(!isBot) {
    var c = new Crawler({
        maxConnections: 10,
        callback: function (error, res, done) {
            if (error) {
                console.log(error);
            } else {
              var $ = res.$;
              let rank = $("#rankGraph h1").text().trim(),
                  rRole = $("#rankGraph h1").text().trim().charAt(0),
                  league = mapLeague($('label:contains("League:")').siblings('.data').text()),
                  rankRole = msg.guild.roles.find(role => role.name.trim() === rRole),
                  leagueRole = msg.guild.roles.find(role => role.name.trim() === league);

              if(rankRole) {
                let oldDisplayName = msg.member.displayName,
                    newDisplayName = msg.member.displayName; //default
                
                try {
                  oldDisplayName = $('#upanel-profile header')[0].children[0].data.split('- User Profile')[0].trim();
                  if(league != 'LFT')
                  {
                    let teamName = $('label:contains("League:")').siblings('.data').find('a[href^="/teams"]')[0].attribs.name;
                    newDisplayName =`[${teamName}-${league}] ${oldDisplayName}`;
                  } else {
                    newDisplayName = `[LFT] ${oldDisplayName}`;
                  }
                  console.log(`setting username ${newDisplayName}`);
                  msg.member.setNickname(newDisplayName);
                } catch(e) { msg.reply('Unable to set nickname, check with developer.') };
                // 
                // msg.reply(`users ESEA username ${oldDisplayName}`);
                
                removePastRoles(rankRole, leagueRole, msg)
                  .then(() => {
                      msg.member.addRole(rankRole);
                      if(leagueRole) msg.member.addRole(leagueRole);
                      msg.reply('role(s) assigned, thanks!')
                  });

              } else {
                msg.reply('Invalid rank');
              }
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
