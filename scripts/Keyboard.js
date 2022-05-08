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
    this.render();
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
    const { switcLangCodes } = this;
    const pressed = this.state.pressedKeys;
    const { isCapsLock } = this.state;
    const { keys } = this;
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
      const newLang = this.getSwitchedLanguage();
      localStorage.setItem('lang', newLang);
      newState = { pressedKeys: pressed, language: newLang };
      this.store.setState(newState);
    }
    if (code === 'CapsLock') {
      if (!e.repeat) {
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
      newContent = [...content.slice(0, position), '\n', ...content.slice(position)];
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
      newState = { output: newContent, positionSelection: newPosition, pressedKeys: pressed };
    } else if (code === 'Delete') {
      newContent = [...content.slice(0, position), ...content.slice(position + 1)];
      newState = { pressedKeys: pressed, output: newContent, positionSelection: position };
    } else if (code === 'ArrowLeft') {
      if (position < 1) {
        newPosition = 0;
      } else {
        newPosition = position - 1;
      }
      newState = { pressedKeys: pressed, positionSelection: newPosition };
    } else if (code === 'ArrowRight') {
      if (position > content.length) {
        newPosition = content.length;
      } else {
        newPosition = position + 1;
      }
      newState = { pressedKeys: pressed, positionSelection: newPosition };
    } else if (code === 'ArrowUp') {
      const prevEnter = content.slice(0, position).lastIndexOf('\n');
      if (prevEnter === -1) {
        newPosition = 0;
      } else {
        let prevRowLength;
        const curRowOffsetLeft = position - prevEnter - 1;
        const prevRowEnterPosition = content.slice(0, prevEnter).lastIndexOf('\n');
        if (prevRowEnterPosition === -1) {
          prevRowLength = content.slice(0, prevEnter).length;
        } else {
          prevRowLength = content.slice(prevRowEnterPosition, prevEnter).length - 1;
        }
        if (curRowOffsetLeft >= prevRowLength) {
          newPosition = position - curRowOffsetLeft - 1;
        } else {
          newPosition = position - curRowOffsetLeft - (prevRowLength - curRowOffsetLeft) - 1;
        }
      }
      newState = { pressedKeys: pressed, positionSelection: newPosition };
    } else if (code === 'ArrowDown') {
      const prevEnter = content.slice(0, position).lastIndexOf('\n');
      let curRowOffsetLeft;
      if (prevEnter === -1) {
        curRowOffsetLeft = position;
      } else {
        curRowOffsetLeft = position - prevEnter - 1;
      }
      const nextEnterIndex = content.slice(position).indexOf('\n');
      if (nextEnterIndex === -1) {
        newPosition = content.length;
      } else {
        const nextEnterPosition = position + nextEnterIndex + 1;
        let nextRowLength;
        let nextRow = content.slice(nextEnterPosition);
        let nextRowEnterPosition = nextRow.indexOf('\n');
        if (nextRowEnterPosition === -1) {
          nextRowLength = nextRow.length;
        } else {
          nextRowEnterPosition = position + nextRowEnterPosition + nextEnterIndex + 1;
          nextRow = content.slice(nextEnterPosition, nextRowEnterPosition);
          nextRowLength = nextRow.length;
        }
        if (curRowOffsetLeft >= nextRowLength) {
          newPosition = position + nextEnterIndex + nextRowLength + 1;
        } else {
          newPosition = position + nextEnterIndex + curRowOffsetLeft + 1;
        }
      }
      newState = { pressedKeys: pressed, positionSelection: newPosition };
    } else {
      const ind = keys.findIndex((key) => key.code === code);
      if (ind === -1) {
        return;
      }
      newPosition = position + 1;
      newContent = [
        ...content.slice(0, position),
        keys[ind].node.textContent,
        ...content.slice(position)];
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

    pressed.delete(code);

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
    this.render();
  }

  init() {
    this.switchData();
  }

  render() {
    this.node.innerHTML = '';

    this.keys = this.keyFromLanguage.map(
      (item) => new Key(this.node, 'div', 'key', '', item, this.state, (newState) => this.setStateAfterMouseDown(newState)),
    );
  }
}

export default Keyboard;
