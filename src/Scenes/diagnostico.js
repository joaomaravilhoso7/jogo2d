const estado = document.createElement('pre');

estado.style.cssText =
  'position:fixed;bottom:0;left:0;right:0;z-index:9999;' +
  'margin:0;padding:12px;background:#222;color:white;white-space:pre-wrap;';

estado.textContent = 'A carregar o módulo do nível…';
document.body.appendChild(estado);

import('./nivel1.js')
  .then(() => {
    estado.textContent = 'Módulo carregado. A iniciar o jogo…';
  })
  .catch((erro) => {
    estado.textContent = `Falha ao carregar o módulo: ${erro.message}`;
  });