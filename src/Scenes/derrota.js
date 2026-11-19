import './menu.css';
import { SceneManager } from '../Scripts/SceneManager.js';

const score = Number(localStorage.getItem('score')) || 0;

document.querySelector('#scoreFinal').textContent = score;

document
  .querySelector('#btnMenu')
  .addEventListener('click', () => {
    SceneManager.loadScene('index');
  });