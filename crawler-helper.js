const fetch = require('node-fetch');
const Crawler = require("crawler");
const Humanoid = require("humanoid-js");
const humanoid = new Humanoid();

const mapLeague = (leagueText) => {
    if (leagueText.indexOf('CSGO Open') > -1) {
        return 'Open';
    } else if (leagueText.indexOf('CSGO Int...') > -1) {
        return 'Intermediate';
    } else if (leagueText.indexOf('CSGO Main') > -1) {
        return 'Main';
    } else if (leagueText.indexOf('CSGO Adv...') > -1) {
        return 'Advanced';
    } else if (leagueText.indexOf('CSGO MDL') > -1) {
        return 'MDL';
    } else if (leagueText.indexOf('CSGO Pro...') > -1) {
        return 'Professional';
    } else {
        return 'LFT';
    }
}

const getTeamTag = (teamId) => new Promise((resolve, reject) => {
  const url = `https://play.esea.net/teams/${teamId}`;
          var c = new Crawler({
            maxConnections: 10,
            callback: function(error, res, done) {
              var $ = res.$;
                if (error) {
                    console.log(error);
                } else {
                  try {
                    let teamTag = $('#profile-info').children('.content').children('.data')[0].children[0].data;
                    resolve(teamTag.trim())
                  } catch(e) { reject(e) };

                }
            }
        });
        humanoid.get(url)
          .then(res => {
              c.queue([{
                  html: res.body
              }]);
          })
          .catch(err => {
              console.error(err)
          })
});

const fetchUserAlias = (userId) => new Promise(async (resolve, reject) => {
  const url = `https://play.esea.net/api/users/${userId}`;
    fetch(url)
  .then(r => r.json())
  .then(data => { 
      if(data && data.data && data.data.alias) resolve(data.data.alias);
      else reject('Could not get alias');1
  })  
});

const fetchUserData = (userId) => new Promise(async (resolve, reject) => {
  const url = `https://play.esea.net/api/users/${userId}/profile`;
  console.log('Fetching user data');
  fetch(url)
  .then(r => r.json())
  .then(async data => {
    data['alias'] = await fetchUserAlias(userId);
    console.log(data.alias);
    resolve(data);
    
  })  
  .catch(err => reject(err));
});

const getTomorrowDate = () => {
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

const deleteMessage = message => new Promise((resolve, reject) => {
    console.log(message.author);
    // if (!message.deleted || !message.pinned || !message.author.bot || message.author.id != '267704447361089537' || message.author.id != '92646182978859008' || message.author.id != '182190078104174593' || message.author.id != '272506696708915200' || message.author.id != '154052900073635840' || message.author.id != '106830419600666624' || message.author.id != '223597518926118913' || message.author.id != '90615098611109888') {
        message.delete()
            .then(() => resolve())
            .catch(err => resolve(err));
    // }
});

const messageHandler = (message, pattern) => new Promise((resolve, reject) => {
    if (!message.author.isBot && message.content.indexOf('@') == -1 && message.content.match(pattern)) {
        let escaped = escape(message.content).split('%0A');
        escaped.map((e, idx, arr) => {
            let content = unescape(e);
            if (content.indexOf(' ') == -1) message.delete();
            else {
                let date = content.split(' ')[1].replace('-', '/') + `/${(new Date()).getFullYear()}`,
                    day = content.split(' ')[0].toLowerCase();

                let nD = new Date(date);
                let now = new Date();

                function days(d1, d2) {
                    var t2 = d2.getTime();
                    var t1 = d1.getTime();

                    return parseInt((t2 - t1) / (24 * 3600 * 1000));
                }
                var daysDiff = days(now, nD);
                if (isNaN(daysDiff) || 0 > daysDiff) {
                    console.log('deleting message', content);
                    deleteMessage(message);
                }

                if (idx + 1 == arr.length) {
                    //use last message id as after in new call to see if there's any more messages
                    resolve();
                }
            }

        });
    } else {
        resolve();
    }

});

const getMessages = (channel, after) => new Promise(async (resolve, reject) => {
    if (!channel) reject('channel required');
    let options = {
        limit: 100
    }

    if (after) options['after'] = after;
    let results = await channel.fetchMessages(options);
    resolve(results);
});

const checkMessages = (client, channelId, pattern, millis) => new Promise((resolve, reject) => {
    var channel = client.channels.get(channelId);

    setTimeout(async () => {
        let action = async (messages) => {
          if(messages.length == 0) resolve('finished')
            for (var i = 0; i < messages.length; i++) {
                let message = messages[i];
                await messageHandler(message)
                if (i + 1 == messages.length) {
                    //use last message id as after in new call to see if there's any more messages
                    let lastMessage = messages[messages.length - 1];
                    console.log('fetching more messages');
                    let test = await channel.fetchMessages({
                        limit: 100,
                        before: lastMessage.id
                    });
                    action(test.clone().array())
                }
            }
        }
        let _messages = await getMessages(channel);

        let msgs = _messages.clone().array();
        action(msgs);
    }, millis);
});

const daysMap = (str) => {
    switch (str) {
        case 'sun':
        case 'sunday':
            return 0;
        case 'mon':
        case 'monday':
            return 1;
        case 'tue':
        case 'tuesday':
            return 2;
        case 'wed':
        case 'wednesday':
            return 3;
        case 'thu':
        case 'thursday':
            return 4;
        case 'fri':
        case 'friday':
            return 5;
        case 'sat':
        case 'saturday':
            return 6;
    }
}

const getMessageErrors = (msg) => {
    let escaped = escape(msg.content).split('%0A'),
        errors = [],
        scrimFormatPattern = /(^(((mon|fri|sun)(day)?|tue(sday)?|wed(nesday)?|thu(rsday)?|sat(urday)?) (0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01]) ((0?[2-9]|1[012])([: ][0-5]?[0-9])? ?([ap]m)?[ ,\/]?)+ ?(inferno|nuke|mirage|dust2|train|overpass|cache|\/)*)$)+/gim;
    escaped.map(e => {
        let content = unescape(e).trim();
        scrimFormatPattern.lastIndex = 0;
        let regexResult = scrimFormatPattern.test(content);
        if (!regexResult) {
            errors.push("Your message was formatted incorrectly. Please use 'Tuesday 1-10 5/6/7 dust2' as an example.");
        } else {
            let date = content.split(' ')[1].replace('-', '/') + `/${(new Date()).getFullYear()}`,
                day = content.split(' ')[0].toLowerCase();
            console.log(isValidDate(date));
            if (isValidDate(date)) {
                //make sure the date is the same day as the day provided
                let _day = daysMap(day);
                let dateTest = new Date(date).getDay();
                console.log(_day, dateTest);
                if (_day != dateTest) errors.push("The day and date you supplied do not match. Please check the calendar.");
            } else errors.push("The date you supplied is either in the past or not a valid date.");
        }
    });

    return errors;
};

const isValidDate = (dateString) => {
    // First check for the pattern
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Check that it is not a past date and the passed date is valid
    var current = new Date(),
        passedDate = new Date(dateString);
    current.setHours(current.getHours() - 8);
    current.setHours(0, 0, 0, 0);
    console.log(current);
    console.log(passedDate);
    if (isNaN(passedDate) || passedDate < current)
        return false;
    return true;
};

const truncate = (str, len) => {
    return str.length > len ?
        str.substring(0, len - 3) + "..." :
        str;
}

const rankArr = [
    "S",
    "G",
    "A",
    "B",
    "C",
    "D"
]

const leagueArr = [
    "Professional",
    "Advanced",
    "Main",
    "Intermediate",
    "Open",
    "LFT"
]

const removePastRoles = (rankRole, leagueRole, msg) => new Promise((resolve, reject) => {
    //TODO: here you can check to see if all removeRoles are finished before resolving, but this should be fine for now.
    rankArr.filter(_rank => _rank != rankRole).map(_rank => {
        let role = msg.member.roles.find(role => role.name.trim() === _rank);
        if (role && role.name && role.name.trim() != rankRole) msg.member.removeRole(role)
    });
    leagueArr.filter(_league => _league != leagueRole).map((_league, idx, arr) => {
        let role = msg.member.roles.find(role => role.name.trim() === _league);
        if (role && role.name && role.name.trim() != leagueRole) {
                                                                  msg.member.removeRole(role);
                                                                 }
    });
    setTimeout(() => {
        resolve()
    }, 1000);
    //resolve();
})

module.exports = {
    getMessageErrors,
    getTomorrowDate,
    isValidDate,
    daysMap,
    mapLeague,
    rankArr,
    leagueArr,
    removePastRoles,
    truncate,
    checkMessages,
    fetchUserData,
    getTeamTag
}
