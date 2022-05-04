import Element from './Element.js';
import Key from './Key.js';
import en from './en.js';
import ru from './ru.js';

class Keyboard extends Element {
  constructor(parentElement, htmlElement, classList, content, store) {
    super(parentElement, htmlElement, classList, content);
    this.store = store;
    this.state = store.getState();
    this.store.addListener(this);
    this.node.parentNode.onkeydown = (e) => this.onKeyDown(e);
    this.node.parentNode.onkeyup = (e) => this.onKeyUp(e);

    this.pressed = new Set();

    this.checkSwitchLang = () => this.setChangeLanguage();
    this.switcLangCodes = ['ControlLeft', 'AltLeft'];

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
    this.store.setState({ language: newLang });
  }

  onKeyDown(e) {
    e.preventDefault();
    const { code } = e;
    const position = this.state.positionSelection;
    const content = this.state.output;
    let newState;

    if (code === 'AltLeft' || code === 'ControlLeft') {
      this.pressed.add(e.code);
      for (let i = 0; i < this.switcLangCodes.length; i += 1) {
        if (!this.pressed.has(this.switcLangCodes[i])) {
          return;
        }
      }
      this.pressed.clear();
      this.checkSwitchLang();
    }

    if (code === 'CapsLock') {
      newState = { isCapsLock: !this.state.isCapsLock, pressedKey: code };
    } else if (code === 'ShiftLeft' || code === 'ShiftRight') {
      newState = { isShiftPress: true, pressedKey: code };
    } else if (code === 'ControlLeft' || code === 'MetaLeft' || code === 'AltLeft' || code === 'AltRight' || code === 'ControlRight') {
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
      const newContent = [...content.slice(0, position - 1), ...content.slice(position)];
      newState = { output: newContent, positionSelection: position - 1 };
    } else if (code === 'Delete') {
      const newContent = [...content.slice(0, position), ...content.slice(position + 1)];
      newState = { output: newContent, positionSelection: position };
    } else {
      const pressed = this.keys.filter((key) => key.code === code);
      newState = {
        pressedKey: code,
        output: [...this.state.output, pressed[0].node.textContent],
        positionSelection: this.state.positionSelection + 1,
      };
    }

    this.store.setState(newState);
  }

  onKeyUp(e) {
    this.pressed.delete(e.code);

    const { code } = e;
    let { isShiftPress } = this.state;
    if (code === 'ShiftLeft' || code === 'ShiftRight') {
      isShiftPress = false;
    }
    const newState = {
      isShiftPress,
      pressedKey: '',
    };
    this.store.setState(newState);
  }

  setStateAfterMouseDown(newState) {
    this.store.setState(newState);
  }

  update(state) {
    this.state = state;
    this.switchData();
    this.render(this.keyFromLanguage);
  }

  init() {
    this.switchData();
  }

  render(lang) {
    this.node.innerHTML = '';

    this.keys = lang.map(
      (item) => new Key(this.node, 'div', 'key', '', item, this.state, (newState) => this.setStateAfterMouseDown(newState)),
    );
  }
}

export default Keyboard;
