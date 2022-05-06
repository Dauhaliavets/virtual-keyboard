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

  getSwitchedLanguage() {
    let newLang;
    if (this.state.language === 'en') {
      newLang = 'ru';
    } else {
      newLang = 'en';
    }
		return newLang;
  }

  onKeyDown(e) {
    e.preventDefault();

    const { code } = e;
    const position = this.state.positionSelection;
    const content = this.state.output;
		const switcLangCodes = this.switcLangCodes;
		const pressed = this.state.pressedKeys;
		const isCapsLock = this.state.isCapsLock;
		const keys = this.keys; 
    let newState;
    let newContent;
    let newPosition;

		pressed.add(e.code);

    if (code === 'AltLeft' || code === 'ControlLeft') {
			newState = { pressedKeys: pressed };
      for (let i = 0; i < switcLangCodes.length; i += 1) {
        if (!pressed.has(switcLangCodes[i])) {
					this.store.setState(newState);
          return;
        }
      }
      let newLang = this.getSwitchedLanguage();
			localStorage.setItem('lang', newLang);
      newState = { pressedKeys: pressed, language: newLang };
			this.store.setState(newState);
    }
    if (code === 'CapsLock') {
			if(!e.repeat) {
				newState = { isCapsLock: !isCapsLock, pressedKeys: pressed };
			}
    } else if (code === 'ShiftLeft' || code === 'ShiftRight') {
      newState = { isShiftPress: true, pressedKeys: pressed };
    } else if (code === 'ControlLeft' || code === 'MetaLeft' || code === 'AltLeft' || code === 'AltRight' || code === 'ControlRight') {
      newState = { pressedKeys: pressed };
    } else if (code === 'Tab') {
      newPosition = position + 4;
      newContent = [...content.slice(0, position), ' ', ' ', ' ', ' ', ...content.slice(position)];
      newState = {
        pressedKeys: pressed,
        output: newContent,
        positionSelection: newPosition,
      };
    } else if (code === 'Enter') {
			newPosition = position + 1;
			newContent = [...content.slice(0, position), '\n', ...content.slice(position)]
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
      const ind = keys.findIndex((key) => key.code === code);
			const findPressed = keys[ind];
      newPosition = position + 1;
			newContent = [...content.slice(0, position), findPressed.node.textContent, ...content.slice(position)]
      newState = {
        pressedKeys: pressed,
        output: newContent,
        positionSelection: newPosition,
      };
    }
    this.store.setState(newState);
  }

  onKeyUp(e) {
		e.preventDefault();
		const { code } = e;
    let { isShiftPress } = this.state;
		const pressed = this.state.pressedKeys;

		console.log(e)
		// console.log(this.state)
    pressed.delete(code);
    // pressed.clear();

    if (code === 'ShiftLeft' || code === 'ShiftRight') {
      isShiftPress = false;
    }
    const newState = {
      isShiftPress,
      pressedKeys: pressed,
    };
		// console.log('newState: ', newState)
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
