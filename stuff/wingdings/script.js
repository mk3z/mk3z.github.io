const VS15 = '\uFE0E';
const stripVS15 = (str) => str.replace(/\uFE0E/g, '');

const wingdingsMap = {
  ' ': ' ', '!': '🖉', '"': '✂', '#': '✁', '$': '👓', '%': '🕭', '&': '🕮', "'": '🕯',
  '(': '🕿', ')': '✆', '*': '🖂', '+': '🖃', ',': '📪', '-': '📫', '.': '📬', '/': '📭',
  '0': '📁', '1': '📂', '2': '📄', '3': '🗏', '4': '🗐', '5': '🗄', '6': '⌛', '7': '🖮',
  '8': '🖰', '9': '🖲', ':': '🖳', ';': '🖴', '<': '🖫', '=': '🖬', '>': '✇', '?': '✍',
  '@': '🖎', 'A': '✌', 'B': '👌', 'C': '👍', 'D': '👎', 'E': '☜', 'F': '☞', 'G': '☝',
  'H': '☟', 'I': '🖐', 'J': '☺', 'K': '😐', 'L': '☹', 'M': '💣', 'N': '☠', 'O': '🏳',
  'P': '🏱', 'Q': '✈', 'R': '☼', 'S': '💧', 'T': '❄', 'U': '🕆', 'V': '✞', 'W': '🕈',
  'X': '✠', 'Y': '✡', 'Z': '☪', '[': '☯', '\\': 'ॐ', ']': '☸', '^': '♈', '_': '♉',
  '`': '♊', 'a': '♋', 'b': '♌', 'c': '♍', 'd': '♎', 'e': '♏', 'f': '♐', 'g': '♑',
  'h': '♒', 'i': '♓', 'j': '🙰', 'k': '🙵', 'l': '●', 'm': '🔾', 'n': '■', 'o': '□',
  'p': '🞐', 'q': '❑', 'r': '❒', 's': '⬧', 't': '⧫', 'u': '◆', 'v': '❖', 'w': '⬥',
  'x': '⌧', 'y': '⮹', 'z': '⌘', '{': '🏵', '|': '🏶', '}': '🙶', '~': '🙷'
};

const emojiChars = ['✂', '👓', '⌛', '✍', '✌', '👌', '👍', '👎', '☺', '☹', '✈', '☼', '❄', '✞', '✡', '☯', 'ॐ', '☸', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

function getDisplaySymbol(symbol) {
  return emojiChars.includes(symbol) ? symbol + VS15 : symbol;
}

const reverseMap = Object.fromEntries(Object.entries(wingdingsMap).map(([k, v]) => [v, k]));

let isShifted = false;
const layout = [
  { normal: "`1234567890-=", shift: "~!@#$%^&*()_+" },
  { normal: "qwertyuiop[]\\", shift: "QWERTYUIOP{}|" },
  { normal: "asdfghjkl;'", shift: "ASDFGHJKL:\"" },
  { normal: "zxcvbnm,./", shift: "ZXCVBNM<>?" }
];

function renderKeyboard() {
  const container = document.getElementById('keyboard-container');
  container.innerHTML = '';

  layout.forEach((rowDef, index) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'keyboard-row';
    const chars = isShifted ? rowDef.shift : rowDef.normal;

    if (index === 3) {
      const shiftBtn = document.createElement('button');
      shiftBtn.className = `key-btn key-special ${isShifted ? 'key-active' : ''}`;
      shiftBtn.innerHTML = '<i class="material-icons">arrow_upward</i>';
      shiftBtn.onclick = toggleShift;
      rowDiv.appendChild(shiftBtn);
    }

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const symbol = wingdingsMap[char] || char;
      const displaySymbol = getDisplaySymbol(symbol);

      const btn = document.createElement('button');
      btn.className = 'key-btn';
      btn.onclick = () => typeSymbol(symbol);
      btn.innerHTML = `
                    <span class="key-wingding wingdings-font">${displaySymbol}</span>
                    <span class="key-char">${char}</span>
                `;
      rowDiv.appendChild(btn);
    }

    if (index === 0) {
      const bsBtn = document.createElement('button');
      bsBtn.className = 'key-btn key-special';
      bsBtn.innerHTML = '<i class="material-icons">backspace</i>';
      bsBtn.onclick = backspace;
      rowDiv.appendChild(bsBtn);
    }
    container.appendChild(rowDiv);
  });

  const spaceRow = document.createElement('div');
  spaceRow.className = 'keyboard-row';
  const spaceBtn = document.createElement('button');
  spaceBtn.className = 'key-btn key-space';
  spaceBtn.innerHTML = '<span class="key-char" style="position:static; font-size:12px;">SPACE</span>';
  spaceBtn.onclick = () => typeSymbol(' ');
  spaceRow.appendChild(spaceBtn);
  container.appendChild(spaceRow);
}

function toggleShift() {
  isShifted = !isShifted;
  renderKeyboard();
}

function typeSymbol(symbol) {
  const textarea = document.getElementById('wingdingsText');
  textarea.value += getDisplaySymbol(symbol);
  autoResize(textarea);
  wingdingsToText();
}

function backspace() {
  const textarea = document.getElementById('wingdingsText');

  // Spread operator splits into code points, keeping surrogate pairs together
  const chars = [...textarea.value];

  if (chars.length === 0) return;

  const removed = chars.pop();

  // If we removed a VS15, we also need to pop the character it was modifying
  // so the whole "glyph" disappears at once.
  if (removed === VS15 && chars.length > 0) {
    chars.pop();
  }

  textarea.value = chars.join('');
  autoResize(textarea);
  wingdingsToText();
}

function textToWingdings() {
  const input = document.getElementById('normalText').value;
  const output = document.getElementById('wingdingsText');
  let result = '';
  for (let char of input) {
    const mapped = wingdingsMap[char] || char;
    result += getDisplaySymbol(mapped);
  }
  output.value = result;
  autoResize(document.getElementById('normalText'));
  autoResize(output);
}

function wingdingsToText() {
  const rawInput = document.getElementById('wingdingsText').value;
  const cleanInput = stripVS15(rawInput);
  const output = document.getElementById('normalText');
  let result = '';
  for (let char of cleanInput) {
    result += reverseMap[char] || char;
  }
  output.value = result;
  autoResize(document.getElementById('wingdingsText'));
  autoResize(output);
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

function copyNormal() {
  const el = document.getElementById('normalText');
  el.select();
  document.execCommand('copy');
  showToast('Text copied');
}

function copyWingdings() {
  const el = document.getElementById('wingdingsText');
  el.select();
  document.execCommand('copy');
  showToast('Wingdings copied');
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  container.appendChild(toast);

  void toast.offsetWidth;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      container.removeChild(toast);
    }, 300);
  }, 3000);
}

function clearAll() {
  const normal = document.getElementById('normalText');
  const wingdings = document.getElementById('wingdingsText');
  normal.value = '';
  wingdings.value = '';
  normal.style.height = '150px';
  wingdings.style.height = '150px';
}

document.addEventListener('DOMContentLoaded', function() {
  renderKeyboard();
});
