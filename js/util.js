function query(url, cb, config = {}) {
  let xhr = new XMLHttpRequest();
  xhr.open(config.method || 'GET', url);
  xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  xhr.onreadystatechange = function (ev) {
    if (xhr.readyState == 4) {
      cb(ev.target.responseText)
    }
  }
  xhr.send(config.data)
}

function get(url, cb) {
  query(url, cb)
}

function post(url, data, cb) {
  query(url, cb, {
    method: 'POST',
    data
  })
}

function renderGameList(games, boxId, cb) {
  const box = document.getElementById(boxId);
  box.innerHTML = '';
  games.map((game)=>{
    if (game.length < 36) {
      const p = document.createElement('p');
      p.innerText = game.replace(/\..*/, '');
      p.onclick = ()=>{
        console.log('clicked')
        cb(`https://tekii.cn/fc/rom/${encodeURIComponent(game)}`);
      }
      box.appendChild(p)
    }
  })
}

function search(key='') {
  console.log('key', key)
  renderGameList(window.games.filter((game)=>{
    return game.indexOf(key) > -1;
  }), 'game-list-box', (gameUrl) => {
    nes_load_url("nes-canvas", gameUrl)
  })
}
