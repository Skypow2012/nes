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
const keyMaps = {
  'ArrowUp': '↑',
  'ArrowDown': '↓',
  'ArrowLeft': '←',
  'ArrowRight': '→',
  ' ': 'Space',
}

const ctls = [
  '↑',
  '↓',
  '←',
  '→',
  'A',
  'B',
  'SELECT',
  'START',
  '↑',
  '↓',
  '←',
  '→',
  'A',
  'B',
  'SELECT',
  'START',
  '加速'
]

const ctlTars = localStorage.ctlTars ? JSON.parse(localStorage.ctlTars) : [
  'ArrowUp|38',
  'ArrowDown|40',
  'ArrowLeft|37',
  'ArrowRight|39',
  'a|65',
  's|83',
  'Tab|9',
  'Enter|13',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  'Space|32'
]
window.onkeydown = function(ev) {
  console.log(ev.key, ev.keyCode)
  if (window.ctlIdx !== undefined) {
    ctlTars[window.ctlIdx] = `${ev.key}|${ev.keyCode}`;
    localStorage.ctlTars=JSON.stringify(ctlTars)
  }
  renderCtlList()
}

function startSetCtl(idx) {
  window.ctlIdx=idx;
  let user = '';
  if (idx < 8) user = 'P1'
  else if (idx < 16) user = 'P2'
  document.getElementById('tips').innerText = `${user} ${ctls[idx]}？`
}

function renderCtlList() {
  const boxId = 'ctl-list-box'
  const box = document.getElementById(boxId);
  box.innerHTML = '';
  box.onmouseleave = ()=>{
    delete window.ctlIdx;
    document.getElementById('tips').innerText = `按键配置`
  }
  ctls.map((ctl, idx)=>{
    const p = document.createElement('p');
    let ctlTar = (ctlTars[idx] || '').split('|')[0];
    ctlTar = keyMaps[ctlTar] || ctlTar
    p.innerHTML = `<span>${ctl}</span><span onmouseover={startSetCtl(${idx})}>${ctlTar||''}</span>`;
    box.appendChild(p)
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
