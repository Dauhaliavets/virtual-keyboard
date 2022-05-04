class Store {
  constructor(lang) {
    this.state = {
      isCapsLock: false,
      isShiftPress: false,
      pressedKey: '',
      language: lang,
      output: [],
      positionSelection: 0,
    };
    this.listeners = [];
  }

  setState(obj) {
    this.state = { ...this.state, ...obj };
    this.notifyListeners(this.state);
  }

  getState() {
    return this.state;
  }

  addListener(fn) {
    this.listeners.push(fn);
  }

  removeListener(fn) {
    this.listeners = this.listeners.filter((listener) => listener !== fn);
  }

  notifyListeners(data) {
    this.listeners.forEach((listener) => listener.update(data));
  }
}

export default Store;
