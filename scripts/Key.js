import Element from './Element.js';

class Key extends Element {
  constructor( parentElement, htmlElement, classList, content, data, state, setStateAfterMouseDown,
  ) {
    super(parentElement, htmlElement, classList, content);
    this.code = data.code;
    this.key = data.key;
    this.keyCaps = data.keyCaps;
    this.keyUpperCase = data.keyUpperCase;
    this.state = state;
    this.setStateAfterMouseDown = (newState) => setStateAfterMouseDown(newState);
    this.node.textContent = this.key;
    this.node.onmousedown = () => this.onMouseDown();
    this.node.onmouseup = () => this.onMouseUp();
    this.update();
  }

  addClassKeyPress = () => {
    this.node.classList.add('key__press');
  };

  removeClassKeyPress = () => {
    this.node.classList.remove('key__press');
  };

  onMouseDown() {
    const { code } = this;
    const { isCapsLock } = this.state;
		const { pressedKeys } = this.state;
		console.log('pressedKeys: ', pressedKeys)
		pressedKeys.add(code);

    if (code === 'CapsLock') {
      this.setStateAfterMouseDown({
        isCapsLock: !this.state.isCapsLock,
        pressedKeys: pressedKeys,
      });
    } else if (code === 'ShiftLeft' || code === 'ShiftRight') {
      this.setStateAfterMouseDown({ isShiftPress: true, pressedKeys: pressedKeys });
    } else if (code === 'Backspace') {
      const newOutput = this.state.output.slice(0, this.state.output.length - 1);
      this.setStateAfterMouseDown({ pressedKeys: pressedKeys, output: newOutput });
    } else {
      const newState = {
        isCapsLock,
        pressedKeys: pressedKeys,
        output: [...this.state.output, this.node.textContent],
      };
      this.setStateAfterMouseDown(newState);
    }
  }

  onMouseUp = () => {
		const { pressedKeys } = this.state;
		pressedKeys.clear();

    const newState = {
      isShiftPress: false,
      pressedKeys,
    };
    this.setStateAfterMouseDown(newState);
  };

  update() {
    this.updateTextContent();
    this.updateClassList();
  }

  updateTextContent() {
    if (this.state.isCapsLock && this.state.isShiftPress) {
      if (this.key === this.keyCaps) {
        this.node.textContent = this.keyUpperCase;
      } else {
        this.node.textContent = this.key;
      }
      return;
    }
    if (this.state.isCapsLock) {
      this.node.textContent = this.keyCaps;
      return;
    }
    if (this.state.isShiftPress) {
      this.node.textContent = this.keyUpperCase;
    }
  }

  updateClassList() {
    if (this.code === 'CapsLock') {
      if (this.state.isCapsLock) {
        this.addClassKeyPress();
      } else {
        this.removeClassKeyPress();
      }
      return;
    }
    if (this.state.pressedKeys.has(this.code)) {
      this.addClassKeyPress();
    } else {
      this.removeClassKeyPress();
    }
  }
}

export default Key;
