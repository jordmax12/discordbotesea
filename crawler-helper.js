const mapLeague = (leagueText) => {
  if(leagueText.indexOf('CSGO Open') > -1) {
     return 'Open';
  } else if(leagueText.indexOf('CSGO Int...') > -1) {
     return 'IM';
  } else if(leagueText.indexOf('CSGO Main') > -1) {
     return 'Main';
  } else if(leagueText.indexOf('CSGO Adv...') > -1) {
     return 'Advanced';
  } else if(leagueText.indexOf('CSGO MDL') > -1) {
     return 'MDL';
  } else if(leagueText.indexOf('CSGO Pro...') > -1) {
     return 'Professional';
  } else {
     return 'LFT';
  }
}

const truncateTeamName = (str) => {
    var re = str.match(/^.{0,5}[\S]*/);
    var l = re[0].length;
    var re = re[0].replace(/\s$/,'');
    if(l < str.length)
        re = re + "&hellip;";
    return re;
}

const truncate = (str, len) => {
    var re = str.match(/^.{0,len}[\S]*/);
    var l = re[0].length;
    var re = re[0].replace(/\s$/,'');
    if(l < str.length)
        re = re + "&hellip;";
    return re;
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
  "IM",
  "Open",
  "LFT"
]

const removePastRoles = (rankRole, leagueRole, msg) => new Promise((resolve, reject) => {
  //TODO: here you can check to see if all removeRoles are finished before resolving, but this should be fine for now.
  rankArr.filter(_rank => _rank != rankRole).map(_rank => {
    let role = msg.member.roles.find(role => role.name.trim() === _rank);
    if(role && role.name && role.name.trim() != rankRole) msg.member.removeRole(role)
  });
  leagueArr.filter(_league => _league != leagueRole).map((_league, idx, arr) => {
    let role = msg.member.roles.find(role => role.name.trim() === _league);
    if(role && role.name && role.name.trim() != leagueRole) msg.member.removeRole(role);
  });
  setTimeout(() => { resolve() }, 1000);
  //resolve();
})

module.exports = {
  mapLeague,
  rankArr,
  leagueArr,
  removePastRoles,
  truncateTeamName,
  truncate
}
