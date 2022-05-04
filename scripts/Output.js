import { Element } from './Element.js';

class Output extends Element {
  constructor(parentElement, htmlElement, classList, content, store) {
    super(parentElement, htmlElement, classList, content);
    this.store = store;
    this.state = store.getState();
		// this.node.setAttribute('readonly', 'true')
		this.node.onclick = () => {
			store.setState({positionSelection: this.node.selectionStart});
		}
    store.addListener(this);
    this.render();
  }

  update(state) {
    this.state = state;
    this.render();
  }

  render() {
		// this.node.focus();
    // this.node.innerHTML = '';
    this.node.textContent = this.state.output.join('');

		this.node.setSelectionRange(this.state.positionSelection, this.state.positionSelection);
  }
}

export { Output };