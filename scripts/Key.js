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
		const position = this.state.positionSelection;
    const content = this.state.output;
		const pressed = this.state.pressedKeys;
    let newState;
    let newContent;
    let newPosition;

		pressed.add(code);

		if (code === 'CapsLock') {
      newState = { isCapsLock: !isCapsLock, pressedKeys: pressed };
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
    } else if (code === 'ArrowLeft') {
			if (position < 1) {
        newPosition = 0;
      } else {
        newPosition = position - 1;
      }
			newState = { positionSelection: newPosition };
		} else if (code === 'ArrowRight') {
			if (position > content.length) {
        newPosition = content.length;
      } else {
        newPosition = position + 1;
      }
			newState = { positionSelection: newPosition };
		} else if (code === 'ArrowUp') {
			let prevEnter = content.slice(0, position).lastIndexOf('\n');
			if(prevEnter === -1) {
				newPosition = 0;
			} else {
				let prevRowLength;
				let curRowOffsetLeft = position - prevEnter - 1;
				let prevRowEnterPosition = content.slice(0, prevEnter).lastIndexOf('\n');
				if(prevRowEnterPosition === -1) {
					prevRowLength = content.slice(0, prevEnter).length;
				} else {
					prevRowLength = content.slice(prevRowEnterPosition, prevEnter).length - 1;
				}
				if(curRowOffsetLeft >= prevRowLength) {
					newPosition = position - curRowOffsetLeft - 1;
				} else {
					newPosition = position - curRowOffsetLeft - (prevRowLength - curRowOffsetLeft) - 1;
				}
			}	
			newState = { pressedKeys: pressed, positionSelection: newPosition };
		} else if (code === 'ArrowDown') {
			let prevEnter = content.slice(0, position).lastIndexOf('\n');
			let curRowOffsetLeft;
			if (prevEnter === -1) {
				curRowOffsetLeft = position;
			} else {
				curRowOffsetLeft = position - prevEnter - 1;
			}
			let nextEnterIndex = content.slice(position).indexOf('\n');
			if(nextEnterIndex === -1) {
				newPosition = content.length;
			} 
			else {
				let nextEnterPosition = position + nextEnterIndex + 1;
				let nextRowLength;
				let nextRow = content.slice(nextEnterPosition);
				let nextRowEnterPosition = nextRow.indexOf('\n');
				if(nextRowEnterPosition === -1) {
					nextRowLength = nextRow.length;
				} else {
					nextRowEnterPosition = position + nextRowEnterPosition + nextEnterIndex + 1;
					nextRow = content.slice(nextEnterPosition, nextRowEnterPosition);
					nextRowLength = nextRow.length;
				}
				if(curRowOffsetLeft >= nextRowLength) {
					newPosition = position + nextEnterIndex + nextRowLength + 1;
				} else {
					newPosition = position + nextEnterIndex + curRowOffsetLeft + 1;
				}
			}	
			newState = { pressedKeys: pressed, positionSelection: newPosition };
		} else {
      newPosition = position + 1;
      newState = {
        pressedKeys: pressed,
        output: [...content.slice(0, position), this.node.textContent, ...content.slice(position)],
        positionSelection: newPosition,
      };
    }

    this.setStateAfterMouseDown(newState);
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
