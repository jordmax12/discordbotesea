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

const daysMap = (str) => {
  switch(str) {
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

const isValidDate = (dateString) =>
{
    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Check that it is not a past date and the passed date is valid
    var current = new Date(),
        passedDate = new Date(dateString);

    if(isNaN(passedDate) || passedDate < current)
        return false;
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
  isValidDate,
  daysMap,
  mapLeague,
  rankArr,
  leagueArr,
  removePastRoles,
  truncate
}
