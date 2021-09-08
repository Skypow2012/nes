const KEYS = {
  88: [1, jsnes.Controller.BUTTON_A, "X"], // X
  89: [1, jsnes.Controller.BUTTON_B, "Y"], // Y (Central European keyboard)
  90: [1, jsnes.Controller.BUTTON_B, "Z"], // Z
  17: [1, jsnes.Controller.BUTTON_SELECT, "Right Ctrl"], // Right Ctrl
  13: [1, jsnes.Controller.BUTTON_START, "Enter"], // Enter
  38: [1, jsnes.Controller.BUTTON_UP, "Up"], // Up
  40: [1, jsnes.Controller.BUTTON_DOWN, "Down"], // Down
  37: [1, jsnes.Controller.BUTTON_LEFT, "Left"], // Left
  39: [1, jsnes.Controller.BUTTON_RIGHT, "Right"], // Right

  103: [2, jsnes.Controller.BUTTON_A, "Num-7"], // Num-7
  105: [2, jsnes.Controller.BUTTON_B, "Num-9"], // Num-9
  99: [2, jsnes.Controller.BUTTON_SELECT, "Num-3"], // Num-3
  97: [2, jsnes.Controller.BUTTON_START, "Num-1"], // Num-1
  104: [2, jsnes.Controller.BUTTON_UP, "Num-8"], // Num-8
  98: [2, jsnes.Controller.BUTTON_DOWN, "Num-2"], // Num-2
  100: [2, jsnes.Controller.BUTTON_LEFT, "Num-4"], // Num-4
  102: [2, jsnes.Controller.BUTTON_RIGHT, "Num-6"] // Num-6
};
window.addEventListener("gamepadconnected", function (e) {
  window.gp = navigator.getGamepads()[e.gamepad.index];
  console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    gp.index, gp.id,
    gp.buttons.length, gp.axes.length);
});

function processGp() {

  if (window.gp) {
    let gpKeyDic = {
      0: 'A',
      1: 'B',
      3: 'X',
      4: 'Y',
      6: 'L', // LB Left Bumper 按钮
      7: 'R', // RB Right Bumper
      8: 'ZL', // LT L2 Left Trigger 扳机
      9: 'ZR', // RT R2 Left Trigger
      10: 'Select',
      11: 'Start',
      13: 'LS', // 左摇杆按压 Left Sitck 操纵杆
      14: 'RS', // 右摇杆按压 Right Sitck

      21: '↑',
      22: '→',
      23: '↓',
      24: '←',
    }
    let gpKey2KeysDic = {
      0: 88,
      1: 89,
      3: 88,
      4: 89,
      6: 88,
      7: 88,
      8: 89,
      9: 89,
      10: 17,
      11: 13,

      21: 38,
      22: 39,
      23: 40,
      24: 37,
    }
    window.gp = navigator.getGamepads()[0];
    // 按钮部分
    window.gpBtnDownDic = window.gpBtnDownDic || {};
    let buttons = window.gp.buttons;
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      let gpKey = i;
      if (btn.value == 1) {
        if (!window.gpBtnDownDic[i]) {
          window.gpBtnDownDic[i] = 1;
          let key = KEYS[gpKey2KeysDic[gpKey]];
          console.log(gpKey, 'is down');
          nes.buttonDown(key[0], key[1]);
        } else {
          // 按着就按着吧，不触发
        }
      } else {
        if (window.gpBtnDownDic[i]) {
          window.gpBtnDownDic[i] = 0;
          let key = KEYS[gpKey2KeysDic[gpKey]];
          console.log(gpKey, 'is up');
          nes.buttonUp(key[0], key[1]);
        } else {
          // 什么事都没有
        }
      }
    }
    // 摇杆部分
    // idx0 左摇杆 左 -1
    // idx0 左摇杆 右 1
    // idx1 右摇杆 上 -1
    // idx1 右摇杆 下 1

    // idx2 右摇杆 左 -1
    // idx2 右摇杆 右 1
    // idx5 右摇杆 上 -1
    // idx5 右摇杆 下 1
    window.gpAxesDownDic = window.gpAxesDownDic || {};
    let axes = window.gp.axes;
    for (let i = 0; i <= 1; i++) {
      const axe = axes[i];
      let gpKey;
      if (i == 0) {
        gpKey = 24;
        if (axe < -.5) {
          if (!window.gpAxesDownDic[gpKey]) {
            window.gpAxesDownDic[gpKey] = 1;
            let key = KEYS[gpKey2KeysDic[gpKey]];
            console.log(gpKey, 'is down');
            nes.buttonDown(key[0], key[1]);
          } else {
            // 按着就按着吧，不触发
          }
        } else {
          if (window.gpAxesDownDic[gpKey]) {
            window.gpAxesDownDic[gpKey] = 0;
            let key = KEYS[gpKey2KeysDic[gpKey]];
            console.log(gpKey, 'is up');
            nes.buttonUp(key[0], key[1]);
          } else {
            // 什么事都没有
          }
        }
        gpKey = 22;
        if (axe > .5) {
          if (!window.gpAxesDownDic[gpKey]) {
            window.gpAxesDownDic[gpKey] = 1;
            let key = KEYS[gpKey2KeysDic[gpKey]];
            console.log(gpKey, 'is down');
            nes.buttonDown(key[0], key[1]);
          } else {
            // 按着就按着吧，不触发
          }
        } else {
          if (window.gpAxesDownDic[gpKey]) {
            window.gpAxesDownDic[gpKey] = 0;
            let key = KEYS[gpKey2KeysDic[gpKey]];
            console.log(gpKey, 'is up');
            nes.buttonUp(key[0], key[1]);
          } else {
            // 什么事都没有
          }
        }
      }
      if (i == 1) {
        gpKey = 21;
        if (axe < -.5) {
          if (!window.gpAxesDownDic[gpKey]) {
            window.gpAxesDownDic[gpKey] = 1;
            let key = KEYS[gpKey2KeysDic[gpKey]];
            console.log(gpKey, 'is down');
            nes.buttonDown(key[0], key[1]);
          } else {
            // 按着就按着吧，不触发
          }
        } else {
          if (window.gpAxesDownDic[gpKey]) {
            window.gpAxesDownDic[gpKey] = 0;
            let key = KEYS[gpKey2KeysDic[gpKey]];
            console.log(gpKey, 'is up');
            nes.buttonUp(key[0], key[1]);
          } else {
            // 什么事都没有
          }
        }
        gpKey = 23;
        if (axe > .5) {
          if (!window.gpAxesDownDic[gpKey]) {
            window.gpAxesDownDic[gpKey] = 1;
            let key = KEYS[gpKey2KeysDic[gpKey]];
            console.log(gpKey, 'is down');
            nes.buttonDown(key[0], key[1]);
          } else {
            // 按着就按着吧，不触发
          }
        } else {
          if (window.gpAxesDownDic[gpKey]) {
            window.gpAxesDownDic[gpKey] = 0;
            let key = KEYS[gpKey2KeysDic[gpKey]];
            console.log(gpKey, 'is up');
            nes.buttonUp(key[0], key[1]);
          } else {
            // 什么事都没有
          }
        }
      }
    }
  }
}