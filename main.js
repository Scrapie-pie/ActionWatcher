#!/usr/bin/env node
const ioHook = require('iohook');
const fs = require('fs');
const path = require('path')
const { createUpdateTimer, msToTime, saveHistory } = require('./libs/common.js')



function runApp() {
  const events = ['mousemove', 'keydown', 'mousewheel', 'mousedown'];
  //let idleDelay = 60 * 2.5; // minutes
  let idleDelay = 5; // sec
  let startTimeOffline;
  let startTimeOnline = new Date();
  let timeOnline;
  let userOnline = true;

  let actionTimer = createUpdateTimer(() => {
    let logTime;

    userOnline = false;
    startTimeOffline = new Date(Date.now() - (idleDelay * 1000));
    timeOnline = startTimeOffline - startTimeOnline;
    logTime = startTimeOffline.toLocaleTimeString();

    console.log(`${logTime} Нет на месте, Время онлайн - ${msToTime(timeOnline)}`)
  }, idleDelay * 1000);

  let triggerHandler = () => {
    if (!userOnline) {
      let logTime;
      let endTimeOffline = new Date();

      let historyItem = {
        startTimeOffline,
        endTimeOffline,
        timeOffline: endTimeOffline - startTimeOffline,
        timeOnline,
      }

      userOnline = true;
      startTimeOnline = new Date();
      logTime = historyItem.endTimeOffline.toLocaleTimeString();

      console.log(`${logTime} На месте, Время отсутствия - ${msToTime(historyItem.timeOffline)}`);

      saveHistory(historyItem);
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

  process.on('exit', () => {
    saveHistory({
      startTimeOffline: null,
      endTimeOffline: null,
      timeOffline: null,
      timeOnline: new Date() - startTimeOnline,
    }, true)
    console.log(new Date().toLocaleTimeString() + ' Выход')
    ioHook.unload();

  });

  process.on('SIGINT', function() {
      process.exit();
  });

  console.log(`\n${new Date().toLocaleTimeString()} Запущен`)
}



runApp();
