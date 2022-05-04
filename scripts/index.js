import { Element } from './Element.js';
import { Keyboard } from './Keyboard.js';
import { Output } from './Output.js';
import { Store } from './Store.js';

const defaultLanguage = 'en';
let langFromStorage = localStorage.getItem('lang');
langFromStorage = langFromStorage || defaultLanguage;

const body = document.querySelector('body');
const store = new Store(langFromStorage);
const titleBlock = new Element(body, 'h1', 'title', 'RSS Virtual Keyboard');
const outputBlock = new Output(body, 'textarea', 'output-block', '', store);
const keyboard = new Keyboard(body, 'div', 'keyboard', '', store);
const descriptionBlock = new Element(body, 'h3', 'description', 'Клавиатура создана в операционной системе Windows');
const languageBlock = new Element(body, 'h3', 'language', 'Для переключения языка комбинация: левыe ctrl + alt');

window.keyboard = keyboard;
window.store = store;
