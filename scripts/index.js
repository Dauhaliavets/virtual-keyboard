import Element from './Element.js';
import Keyboard from './Keyboard.js';
import Output from './Output.js';
import Store from './Store.js';

const DEFAULT_LANGUAGE = 'en';
let langFromStorage = localStorage.getItem('lang');
langFromStorage = langFromStorage || DEFAULT_LANGUAGE;

const initApp = () => {
  const body = document.querySelector('body');
  const store = new Store(langFromStorage);
  const titleBlock = new Element(body, 'h1', 'title', 'RSS Virtual Keyboard');
  titleBlock.init();
  const outputBlock = new Output(body, 'textarea', 'output-block', '', store);
  outputBlock.render();
  const keyboard = new Keyboard(body, 'div', 'keyboard', '', store);
  keyboard.init();
  const descriptionBlock = new Element(body, 'h3', 'description', 'Клавиатура создана в операционной системе Windows');
  const languageBlock = new Element(body, 'h3', 'language', 'Для переключения языка комбинация: левыe ctrl + alt');
  descriptionBlock.init();
  languageBlock.init();
};

initApp();
