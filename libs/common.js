const fs = require('fs');

function createUpdateTimer(cb, delay) {
  let timer;

  return function updateTimer() {
    clearTimeout(timer)
    timer = setTimeout(cb,  delay);
  }
}

function msToTime(ms) {
  let seconds = (ms / 1000).toFixed(1);
  let minutes = (ms / (1000 * 60)).toFixed(1);
  let hours = (ms / (1000 * 60 * 60)).toFixed(1);
  let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
  if (seconds < 60) return seconds + " Sec";
  else if (minutes < 60) return minutes + " Min";
  else if (hours < 24) return hours + " Hrs";
  else return days + " Days"
}

function saveAsJson(file, obj, sync = false) {
  if (sync) {
    try {
      fs.writeFileSync(file, JSON.stringify(obj, null, 2));
    } catch(err) {
      console.error(err);
    }
  } else {
    fs.writeFile(file, JSON.stringify(obj, null, 2), err => {
      if (err) console.error(err);
    });
  }
}

function saveHistory(historyItem, sync = false) {
  const file = './storage.json';
  let storage;

  if (sync) {
    try {
      storage = JSON.parse(fs.readFileSync(file, 'utf8'));
      storage.history.push(historyItem);
      saveAsJson(file, storage, true);
    } catch(err) {
      if (err.code === 'ENOENT') {
        storage = { history: [historyItem] };
        saveAsJson(file, storage, true);
      } else {
        return console.error(err);
      }
    }
  } else {
    fs.readFile(file, 'utf8', (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          storage = { history: [historyItem] };
          saveAsJson(file, storage);
        } else {
          return console.error(err);
        }
      } else {
        storage = JSON.parse(content);
        storage.history.push(historyItem);
        saveAsJson(file, storage);
      }
    });
  }

  return storage;
}


exports.createUpdateTimer = createUpdateTimer;
exports.msToTime = msToTime;
exports.saveHistory = saveHistory;
