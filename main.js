const ioHook = require('iohook');
const fs = require('fs');
const path = require('path')
const { createUpdateTimer, msToTime } = require('./libs/common.js')

// fs.writeFile('./store.json', (content, err) {
//   if (err) {
//     console.log(err);
//     return;
//   }
//
//
//
// })

function runApp() {
  const events = ['mousemove', 'keydown', 'mousewheel', 'mousedown'];
  let idleDelay = 60 * 2.5; // minutes
  //let idleDelay = 5; // sec
  let startTimeOffline;
  let userOnline = true;

  let actionTimer = createUpdateTimer(() => {
    userOnline = false;
    startTimeOffline = new Date(Date.now() - (idleDelay * 1000))
    let logTime = startTimeOffline.toLocaleTimeString();
    console.log(`${logTime} Нет на месте`)
  }, idleDelay * 1000);

  let triggerHandler = () => {
    if (!userOnline) {
      userOnline = true;

      let endTimeOffline = new Date();
      let diffTimeOffline = endTimeOffline - startTimeOffline;
      let historyItem = {
        startTimeOffline,
        endTimeOffline,
        diffTimeOffline
      }

      //fs.writeFile('./log.txt', msToTime(diffTimeOffline))

      let logTime = endTimeOffline.toLocaleTimeString()

      console.log(`${logTime} На месте, Время отсутствия - ${msToTime(diffTimeOffline)}`)

      fs.readFile('./storage.json', 'utf8', (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            let saveData = {
              history: []
            }
            saveData.history.push(historyItem);
            fs.writeFile('./storage.json', JSON.stringify(saveData, null, 2), err => {
              if (err) return console.log(err)
            });
          } else {
            console.log(err)
          }
        } else {
          let storage = JSON.parse(data);
          storage.history.push(historyItem);
          fs.writeFile('./storage.json', JSON.stringify(storage, null, 2), err => {
            if (err) return console.log(err)
          });
        }
      })

      actionTimer();
    } else {
      actionTimer();
    }
  }

  events.forEach(eventName => {
    ioHook.on(eventName, triggerHandler);
  });

  ioHook.start(false);
  triggerHandler();


}

process.on('exit', () => {
  console.log(new Date().toLocaleTimeString() + ' Выход')
  ioHook.unload();
});

process.on('SIGINT', function() {
    process.exit();
});

console.log(`\n${new Date().toLocaleTimeString()} Запущен`)

runApp();
