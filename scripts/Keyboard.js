import Element from './Element.js';
import Key from './Key.js';
import en from './en.js';
import ru from './ru.js';

class Keyboard extends Element {
  constructor(parentElement, htmlElement, classList, content, store) {
    super(parentElement, htmlElement, classList, content);
    this.store = store;
    this.store.addListener(this);
    this.state = store.getState();
    this.node.parentNode.onkeydown = (e) => this.onKeyDown(e);
    this.node.parentNode.onkeyup = (e) => this.onKeyUp(e);
    this.checkSwitchLang = () => this.setChangeLanguage();
    this.switcLangCodes = ['ControlLeft', 'AltLeft'];
    // this.pressed = new Set();
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
		const pressed = this.state.pressedKeys;
    let newState;
    let newContent;
    let newPosition;

		pressed.add(e.code);

    if (code === 'AltLeft' || code === 'ControlLeft') {
      newState = { pressedKeys: pressed };

      this.store.setState(newState);

      for (let i = 0; i < this.switcLangCodes.length; i += 1) {
        if (!pressed.has(this.switcLangCodes[i])) {
          return;
        }
      }
      pressed.clear();
      this.checkSwitchLang();
    }

    if (code === 'CapsLock') {
      newState = { isCapsLock: !this.state.isCapsLock, pressedKeys: pressed };
    } else if (code === 'ShiftLeft' || code === 'ShiftRight') {
      newState = { isShiftPress: true, pressedKeys: pressed };
    } else if (code === 'ControlLeft' || code === 'MetaLeft' || code === 'AltLeft' || code === 'AltRight' || code === 'ControlRight') {
      newState = { pressedKeys: pressed };
    } else if (code === 'Tab') {
      newPosition = position + 4;
      newContent = [...content, '_', '_', '_', '_'];
      newState = {
        pressedKeys: pressed,
        output: newContent,
        positionSelection: newPosition,
      };
    } else if (code === 'Enter') {
      newPosition = position + 1;
      newContent = [...content, '\n'];
      newState = {
        pressedKeys: pressed,
        output: newContent,
        positionSelection: newPosition,
      };
    } else if (code === 'Backspace') {
      if (position < 1) {
        newPosition = 0;
      } else {
        newPosition = position - 1;
      }
      newContent = [...content.slice(0, newPosition), ...content.slice(position)];
      newState = { output: newContent, positionSelection: newPosition };
    } else if (code === 'Delete') {
      newContent = [...content.slice(0, position), ...content.slice(position + 1)];
      newState = { output: newContent, positionSelection: position };
    } else {
      const ind = this.keys.findIndex((key) => key.code === code);
			const findPressed = this.keys[ind];

      newPosition = position + 1;

      newState = {
        pressedKeys: pressed,
        output: [...content.slice(0, position), findPressed.node.textContent, ...content.slice(position)],
        positionSelection: newPosition,
      };
    }

    this.store.setState(newState);
  }

  onKeyUp(e) {
		const { code } = e;
    let { isShiftPress } = this.state;
		const pressed = this.state.pressedKeys;

    pressed.delete(e.code);

    if (code === 'ShiftLeft' || code === 'ShiftRight') {
      isShiftPress = false;
    }
    const newState = {
      isShiftPress,
      pressedKeys: pressed,
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
