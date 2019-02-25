// this is the way to load a package with NodeJS
const express = require("express")
const Crawler = require("crawler");
const Discord = require('discord.js')
const client = new Discord.Client()
require('dotenv').config();

// Helpers
const {
    mapLeague,
    removePastRoles,
    truncate,
    isValidDate,
    getMessageErrors,
    daysMap,
    checkMessages,
    getTomorrowDate,
    fetchUserData,
    getTeamTag
} = require('./crawler-helper.js');
const scrimFormatPattern = /(^(((mon|fri|sun)(day)?|tue(sday)?|wed(nesday)?|thu(rsday)?|sat(urday)?) (0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01]) ((0?[2-9]|1[012])([: ][0-5]?[0-9])? ?([ap]m)?[ ,\/]?)+ ?(inferno|nuke|mirage|dust2|train|overpass|cache|\/)*)$)+/gim;

var tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
var t = new Date()

var diff = tomorrow - t;

let days = [];

days.push(tomorrow);

const setUpCleanup = async (channelId, _diff) => {
  await checkMessages(client, channelId, scrimFormatPattern, _diff);
  let _tomorrow = getTomorrowDate();
  let now = new Date();
  
  let difference = _tomorrow - now;
  console.log(`Scheduling a clean up in ${difference} milliseconds`);
  setUpCleanup(channelId, diff);
}

client.login(process.env.BOT_TOKEN);
client.on('ready', () => {
    client.user.setUsername("NA Scrims Bot");
    //(client, channelId, pattern, millis) 
    //setUpCleanup('531675700944568321', 0)
})
client.on('message', msg => {
    const userId = msg.author.id,
        userName = msg.author.username,
        isBot = msg.author.bot

    if (!isBot) {

        if (msg.channel.name == "role-assigner") {
            if (msg.content.indexOf("play.esea.net/users/") > -1) {
              let eseaId = msg.content.split('play.esea.net/users/')[1];
              if(eseaId.indexOf('/') > -1) eseaId = eseaId.split('/')[0];
              console.log(eseaId);
              fetchUserData(eseaId)
              .then(data => {
                let alias = data.alias;
                data = data.data;
                var newDisplayName = '';
                let rank           = data.rank.current,
                    leagueName = '',
                    rankRole = msg.guild.roles.find(role => role.name.trim() === rank.charAt(0));
                var leagueRole;
                if(data.league)
                {
                    let league = data.league[0],
                    teamName   = league.team.name || '',
                    teamId     = league.team.id || 0;
                  
                  leagueName = league.league.name || ''
                  
                  if(teamId != 0)
                  {
                    getTeamTag(teamId)
                    .then(tag => {
                        // console.log(leagueName, tag, alias);
                      if(leagueName.indexOf('CSGO') > -1) leagueName = leagueName.split('CSGO ')[1];
                      let displayLeagueName = leagueName == "Intermediate" ? "IM" : leagueName;
                      newDisplayName = `[${tag}-${displayLeagueName}] ${alias}`;
                      msg.member.setNickname(newDisplayName);
                      leagueRole = msg.guild.roles.find(role => role.name.trim() === leagueName);

                    })
                    .catch(e => console.log(e))
                  }
                    
                } else {
                  newDisplayName = `[LFT] ${alias}`;
                  msg.member.setNickname(newDisplayName);
                }
               removePastRoles(rankRole, leagueRole, msg)
                  .then(() => {
                      msg.member.addRole(rankRole);
                      if (leagueRole) msg.member.addRole(leagueRole);
                      msg.reply('role(s) assigned, thanks!')
                  });


              })
            }
        } else if (msg.channel.name == 'mdl' || msg.channel.name == 'advanced' || msg.channel.name == 'main' || msg.channel.name == 'im' || msg.channel.name == 'open') {
            let errors = [];
            errors = getMessageErrors(msg);
            if (errors.length > 0) {
                msg.delete();
                client.channels.get('532974153264005130').send(`message: ${msg.content} from: ${msg.member.displayName}`);
                msg.author.sendMessage(`${errors[0]}\n\nnumber of errors ${errors.length}\n\noriginal message:\n${msg.content}`);
            }
        }
    }
})

client.on('messageUpdate', (oldMessage, newMessage) => {
    if (oldMessage.channel.name == 'mdl' || oldMessage.channel.name == 'advanced' || oldMessage.channel.name == 'main' || oldMessage.channel.name == 'im' || oldMessage.channel.name == 'open) {
        let errors = [];
        errors = getMessageErrors(newMessage);
        if (errors.length > 0) {
            newMessage.delete();
            newMessage.author.sendMessage(`${errors[0]}\n\nnumber of errors ${errors.length}\n\noriginal message:\n${newMessage.content}`);
        }
    }
})


// create an express object: a Web server
var app = express();

// When our server receives a certain request, it needs to know what it should respond,
// so we are defining "routes" the server follows to return the right data.
// When the server gets a request for the "root" route of this domain: "/"
// here: "https://hello-node-server.glitch.me/"
app.get("/", function(request, response) {
    // we program the server to respond with an HTML string
    response.send("<h1>Hello :)</h1><p><a href='/about'>About</a></p>");
});

// when the server gets a request for "https://hello-node-server.glitch.me/about"
app.get("/about", function(request, response) {
    response.send("<h1>This is my about page</h1><a href='/'>Home</a></p>");
});

// finally we tell the server to listen for requests
app.listen(process.env.PORT);
// the server needs to listen for requests on a specified port:
// a port can be thought of as an access on device to communicate data
// and computers have thousands of ports
// on Glitch we can use "process.env.PORT" which corresponds to port 3000
