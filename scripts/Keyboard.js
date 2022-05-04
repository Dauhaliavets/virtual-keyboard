import { Element } from './Element.js';
import { Key } from './Key.js';
import { en } from './en.js';
import { ru } from './ru.js';

class Keyboard extends Element {
  constructor(parentElement, htmlElement, classList, content, store) {
    super(parentElement, htmlElement, classList, content);
    this.store = store;
    this.state = store.getState();
    store.addListener(this);
    this.node.parentNode.onkeydown = (e) => this.onKeyDown(e);
    this.node.parentNode.onkeyup = (e) => this.onKeyUp(e);

    this.keys = [];
    this.init();
    this.render(this.keyFromLanguage);
  }

  switchData() {
    if (this.state.language === 'en') {
      this.keyFromLanguage = en;
    } else if (this.state.language === 'ru') {
      this.keyFromLanguage = ru;
    }
  }

  setChangeLanguage() {
    const currentLang = this.state.language;
    let newLang;
    if (currentLang === 'en') {
      newLang = 'ru';
    } else {
      newLang = 'en';
    }
    this.switchData();
    localStorage.setItem('lang', newLang);
    store.setState({ language: newLang });
  }

  onKeyDown(e) {
    e.preventDefault();

    const { code } = e;
    let newState;
    if (code === 'CapsLock') {
      newState = { isCapsLock: !this.state.isCapsLock, pressedKey: code };
    } else if (code === 'ShiftLeft' || code === 'ShiftRight') {
      newState = { isShiftPress: true, pressedKey: code };
    } else if (
      code === 'ControlLeft'
			|| code === 'MetaLeft'
			|| code === 'AltLeft'
			|| code === 'AltRight'
			|| code === 'ControlRight'
    ) {
      newState = { pressedKey: code };
    } else if (code === 'Tab') {
      newState = {
        pressedKey: code,
        output: [...this.state.output, '____'],
        positionSelection: this.state.positionSelection + 4,
      };
    } else if (code === 'Enter') {
      newState = {
        pressedKey: code,
        output: [...this.state.output, '\n'],
      };
    } else if (code === 'Backspace') {
      const position = this.state.positionSelection;
      const content = this.state.output;
      const newContent = [...content.slice(0, position - 1), ...content.slice(position)];
      store.setState({ output: newContent, positionSelection: position - 1 });
    } else if (code === 'Delete') {
      const position = this.state.positionSelection;
      const content = this.state.output;
      const newContent = [...content.slice(0, position), ...content.slice(position + 1)];
      store.setState({ output: newContent, positionSelection: position });
    } else {
      const pressed = this.keys.filter((key) => key.code === code);
      newState = {
        pressedKey: code,
        output: [...this.state.output, pressed[0].node.textContent],
        positionSelection: this.state.positionSelection + 1,
      };
    }

    store.setState(newState);
  }

  onKeyUp(e) {
    console.log(this.state.positionSelection);

    const { code } = e;
    const { isCapsLock } = this.state;
    if (code === 'ShiftLeft' || code === 'ShiftRight') {
      store.setState({ isShiftPress: false });
    }
    const newState = {
      isCapsLock,
      pressedKey: '',
    };
    store.setState(newState);
  }

  setStateAfterMouseDown(newState) {
    store.setState(newState);
  }

  runOnKeys(func, ...codes) {
    const pressed = new Set();

    document.addEventListener('keydown', (event) => {
      pressed.add(event.code);

      for (const code of codes) {
        if (!pressed.has(code)) {
          return;
        }
      }

      pressed.clear();

      func();
    });

    document.addEventListener('keyup', (event) => {
      pressed.delete(event.code);
    });
  }

  update(state) {
    this.state = state;
    this.render(this.keyFromLanguage);
  }

  init() {
    this.switchData();
    this.runOnKeys(() => this.setChangeLanguage(), 'ControlLeft', 'AltLeft');
  }

  render(lang) {
    this.node.innerHTML = '';

    this.keys = lang.map(
      (item) => new Key(this.node, 'div', 'key', '', item, this.state, (newState) => this.setStateAfterMouseDown(newState)),
    );
  }
}

export { Keyboard };
