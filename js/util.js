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
  games.map((game) => {
    if (game.length < 36) {
      const p = document.createElement('p');
      p.innerText = game.replace(/\..*/, '');
      p.onclick = () => {
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

let ctlTars;
if (window.utools) {
	window.utools.onPluginReady(function() {
		if (window.utools.db.get('ctlTars')) {
      let info = window.utools.db.get('ctlTars') || {_id: 'ctlTars'}
      if (info && info.data) {
        ctlTars = JSON.parse(info.data);
        renderCtlList()
      }
		}
	})
} else if (localStorage) {
	if (localStorage.ctlTars) ctlTars = JSON.parse(localStorage.ctlTars)
}
if (!ctlTars) {
  ctlTars = [
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
}
window.onkeydown = function (ev) {
  console.log(ev.key, ev.keyCode)
  if (window.ctlIdx !== undefined) {
    ctlTars[window.ctlIdx] = `${ev.key}|${ev.keyCode}`;
    if (window.utools) {
      let info = window.utools.db.get('ctlTars') || {_id: 'ctlTars'};
      info.data = JSON.stringify(ctlTars);
      window.utools.db.put(info);
    } else {
      localStorage.ctlTars = JSON.stringify(ctlTars)
    }
  }
  renderCtlList()
}

function startSetCtl(idx) {
  window.ctlIdx = idx;
  let user = '';
  if (idx < 8) user = 'P1'
  else if (idx < 16) user = 'P2'
  document.getElementById('tips').innerText = `${user} ${ctls[idx]}？`
}

function renderCtlList() {
  const boxId = 'ctl-list-box'
  const box = document.getElementById(boxId);
  box.innerHTML = '';
  box.onmouseleave = () => {
    delete window.ctlIdx;
    document.getElementById('tips').innerText = `按键配置`
  }
  ctls.map((ctl, idx) => {
    const p = document.createElement('p');
    let ctlTar = (ctlTars[idx] || '').split('|')[0];
    ctlTar = keyMaps[ctlTar] || ctlTar
    p.innerHTML = `<span>${ctl}</span><span onmouseover={startSetCtl(${idx})}>${ctlTar||''}</span>`;
    box.appendChild(p)
  })
}

function search(key = '') {
  console.log('key', key)
  renderGameList(window.games.filter((game) => {
    return game.indexOf(key) > -1;
  }), 'game-list-box', (gameUrl) => {
    nes_load_url("nes-canvas", gameUrl)
  })
}

function saveData() {
  if (window.isSaving) return;
  window.isSaving = true;
  key = localStorage.romurl;
  let lKeys = Object.keys(localStorage);
  console.log(lKeys);
  // 删除其他存档，防止空间不足无法存储，限制为4M左右，1个存档就有2M了，所以同一时间只有1个游戏的存档，除非之后开发出新的小存储办法，虽然我试过了，小的办法都会漏东西，大的都会在细小的地方有差别 2020-09-09 23:46
  // 现在只要200k了，所以没事了
  for (let i = 0; i < lKeys.length; i++) {
    const key = lKeys[i];
    if (key.indexOf('./rom') > -1) {
      delete localStorage[key];
    }
  }
  let tar = {
    cpu: nes.cpu,
    nameTable: nes.ppu.nameTable,
    bgbuffer: nes.ppu.bgbuffer,
    mmap: nes.mmap
  };
  tar = nes;
  nes.ppu.buffer = [];
  nes.ppu.pixrendered = [];
  nes.ppu.bgbuffer = [];
  // tar.ppu.vramMirrorTable  = []; // 这个参数用来扩展地图内容，不能删
  // nes.ppu.vramMem = []; // 这个去掉了会灰屏
  delete nes.romData;
  if (window.utools) {
    let info = window.utools.db.get(key) || {_id: key};
    info.data = JSON.stringify(nes);
    window.utools.db.put(info);
  } else {
    localStorage[key] = JSON.stringify(nes)
  }
  window.isSaving = false;
  loadBtn.disabled = false;
}


function loadSavedData() {
  key = localStorage.romurl;
  if (window.utools) {
    if (window.utools.db.get(key)) {
      let info = window.utools.db.get(key) || {_id: key};
      if (info.data) {
        nes2 = JSON.parse(info.data);
      }
      setB2A(nes, nes2);
    }
  } else {
    if (localStorage[key]) {
      // 本地存储
      if (localStorage[key]) {
        nes2 = JSON.parse(localStorage[key]);
      }
      setB2A(nes, nes2);
    }
  }
}

const rDic = {} 

function setB2A(a, b, _k = []) {
  for (const key in b) {
    if (b.hasOwnProperty(key)) {
      const bV = b[key];
      if (bV instanceof Object) {
        if (a[key]) {
          // 透明度好了 step1 加上了这个好了
          // if (key == 'opaque') {
          //   return;
          //   console.log('keykeykeyk', opaque)
          // }
          setB2A(a[key], b[key], [..._k, key]);
        } else {
          // a[key] = {};
          // 这个地方很神奇，如果转换了 就报错了Cannot read property 'opaque' of undefined，但能显示主角，不显示背景
          // 如果把这里注释掉，就能显示背景，但主角和怪物什么的 都会变成马赛克
          a[key] = {}; // 透明度好了 step2 加上了这个好了
          setB2A(a[key], b[key], [..._k, key]);
        }
      } else {
        if (a[key] !== b[key] && _k && !rDic[_k]) {
          console.log(', _k', _k)
          rDic[_k.toString()] = 1
        }
        a[key] = b[key];
      }
    }
  }
}

window.isFullScreen = false;
window.onresize = function() {
  changeScreen({isResize: true});
}
function changeScreen(config={}) {
  if (!config.isResize) window.isFullScreen = !window.isFullScreen;
  if (window.isFullScreen) {
    let w = window.innerWidth-284;
    let h = window.innerHeight-50;
    let minW = Math.min(w, h/480 * 512);
    document.getElementById('nes-canvas').style.width = `${minW}px`;
  } else {
    document.getElementById('nes-canvas').style.width = '512px';
  }
}