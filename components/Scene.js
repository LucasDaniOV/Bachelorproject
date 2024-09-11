class Scene extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        .container {
          width: 100vw;
          height: 100vh;
          position: relative;
          animation: background 60s linear infinite;
          overflow: hidden;
        }

        @keyframes background {
          0% { background: white }
          49% { background: white }
          51% { background: black }
          100% { background: black }
        }

        .sun {
          position: absolute;
          width: 200px;
          height: 200px;
          transform: translate(-50%, -50%);
          animation: rotateSun 60s linear infinite;
        }

        @keyframes rotateSun {
          0% { top: 50%; left: 0; }
          25% { top: 0; left: 50%; }
          50% { top: 50%; left: 100%; }
          75% { top: 100%; left: 50%; }
          100% { top: 50%; left: 0; }
        }

        .moon {
          position: absolute;
          width: 200px;
          height: 200px;
          transform: translate(-50%, -50%);
          animation: rotateMoon 60s linear infinite;
        }

        @keyframes rotateMoon {
          0% { top: 50%; left: 100%; }
          25% { top: 100%; left: 50%; }
          50% { top: 50%; left: 0%; }
          75% { top: 0%; left: 50%; }
          100% { top: 50%; left: 100%; }
        }
      </style>

      <div class="container">
        <img class="sun" src="../img/sun.webp" />
        <img class="moon" src="../img/moon.png" />
      </div>
    `;

    shadow.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('bplucas-scene', Scene);
