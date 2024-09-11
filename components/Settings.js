class Settings extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        h2 {
          color: red;
        }
      </style>
      <h2>Settings</h2>
    `;

    shadow.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('bplucas-settings', Settings);
