var raf = require('./raf');
var songs = require('./songs');

var canvas = document.querySelector('#game');
var ctx = canvas.getContext('2d');

var mode = {
  HOME: 0,
  SONG1: 1,
  COMPOSE: 2,
  CUSTOM: 3
};

var selectedMode = mode.HOME;
var selectedSong = songs.SONG1;

var backDrops = [];

var timeElapsed = 0;
var keyInPlay = false;
var activeKey = null;

var notesPlayed = 0;
var notesMissed = 0;

var lanes = {
  a: 100,
  s: 300,
  d: 500,
  f: 700
}

setInterval(function() {
  timeElapsed += 1;
}, 1);

window.onkeypress = function(e) {
  if (keyInPlay || selectedMode === mode.COMPOSE) {
    activeKey = e.key;
  }
  // if compose mode, alternate high and low with shift key
  // play sound
  if (selectedMode === mode.COMPOSE && lanes[activeKey.toLowerCase()]) {
    songs.CUSTOM.push({realNote: activeKey, key: activeKey.toLowerCase(), x: lanes[activeKey], y: -10, time: timeElapsed, color: '#4180ad', played: false});
  }

  if (activeKey != null) {
    setTimeout(function() {
      activeKey = null;
    }, 100);
  }
}

function makeBackgroundDrops() {
  var arr = [];
  // Background Drop Creation:
  var x = 0;
  while (x < 50) {
    arr.push(createDrop());
    x++;
  }
  return arr;
}

function createDrop() {
  return {x: Math.round(Math.random() * canvas.width), y: Math.round(Math.random() * 500), color: '#99d7e2'}
}

// mode buttons
var modeButtons = document.querySelectorAll('button');
modeButtons.forEach(function(button) {
  button.addEventListener('click', function(event) {
    var id = event.srcElement.id;
    timeElapsed = 0;
    selectedMode = mode[id];
    if (selectedMode === mode.COMPOSE) {
      songs.CUSTOM = [];
    }
    // make a mad deep copy so you can replay
    selectedSong = songs[id] && JSON.parse(JSON.stringify(songs[id].slice(0)));
    backDrops = makeBackgroundDrops();
  });
});

backDrops = makeBackgroundDrops();

raf.start(function(elapsed) {

  // Clear the screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // create background drops (every mode)
  backDrops.forEach(function(drop) {
      drop.y += 5;
      if (drop.y >= canvas.height) {
        drop.y = Math.round(Math.random() * 100);
      }
      // render the rain drop
      ctx.beginPath();
      ctx.moveTo(drop.x - 2, drop.y)
      ctx.lineTo(drop.x, drop.y - 4);
      ctx.lineTo(drop.x + 2, drop.y)
      ctx.arc(drop.x, drop.y, 2, 0, Math.PI);
      ctx.closePath();


    ctx.fillStyle = drop.color;
    ctx.fill();
  });
  
  var opacity = {
    a: '0.5',
    s: '0.5',
    d: '0.5',
    f: '0.5'
  };

  // draw the lanes
  if (selectedMode === mode.COMPOSE) {
    var realKey = activeKey && activeKey.toLowerCase();
    opacity[realKey] = '1';
  }

  // A
  ctx.fillStyle = 'rgba(220, 146, 146,' + opacity.a + ')';
  ctx.fillRect(0, canvas.height - 90, 200, 50);

  // S
  ctx.fillStyle = 'rgba(221, 220, 147,' + opacity.s + ')';
  ctx.fillRect(200, canvas.height - 90, 200, 50);

  // D
  ctx.fillStyle = 'rgba(183, 221, 147,' + opacity.d + ')';
  ctx.fillRect(400, canvas.height - 90, 200, 50);

  // F
  ctx.fillStyle = 'rgba(164, 147, 221,' + opacity.f + ')';
  ctx.fillRect(600, canvas.height - 90, 200, 50);

  // MODE SPECIFIC OPERATIONS:
  if (selectedMode !== mode.COMPOSE && selectedMode !== mode.HOME && selectedMode) {
    selectedSong && selectedSong.forEach(function(note) {
      // note is active!
      if (note.time <= timeElapsed) {
        note.y += 5;
      }
  
      // render the rain drop
      ctx.beginPath();
      ctx.moveTo(note.x - 10, note.y)
      ctx.lineTo(note.x, note.y - 17);
      ctx.lineTo(note.x + 10, note.y)
      ctx.arc(note.x, note.y, 10, 0, Math.PI);
      ctx.closePath();
  
      if (note.y >= canvas.height - 110 && note.y <= canvas.height - 30) {
        keyInPlay = true;
        // player has a sec to press the button
        if (activeKey === note.key) {
          note.color = '#93bedd';
          activeKey = null;
          if (!note.played) {
            notesPlayed++;
          }
          // play note.realNote
          note.played = true;
        }
      } else if (note.y > canvas.height - 50 && !note.played) {
        note.color = '#FF0000';
        keyInPlay = false;
        if (!note.dead && backDrops.length <= 500) {
          var z = 0;
          // create MORE drops in the background
          while (z < 20) {
            backDrops.push(createDrop());
            z++;
          }
          notesMissed++;
        }
        // play bad key sound
        note.dead = true;
      }
  
      ctx.fillStyle = note.color;
      ctx.fill();
  
    });
  }
});
