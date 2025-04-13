'use strict';

class Menu {
    #onOpen;
    #onClose;
    #container;
    #containerCssClassName = 'menu';

    constructor({ target, onOpen, onClose }) {
        this.#onOpen = onOpen;
        this.#onClose = onClose;
        this.#createContainer();

        document.addEventListener('click', this.#hide.bind(this));
        document.addEventListener('contextmenu', this.#hide.bind(this));

        target.addEventListener('contextmenu', (e) => {
            if (!this.#onOpen(e)) {
                return;
            }

            const absTopPositionPx = e.pageY;
            const absLeftPositionPx = e.pageX;

            this.#show(absTopPositionPx, absLeftPositionPx);
            e.preventDefault();

            document.addEventListener('scroll', this.#hide.bind(this), { once: true });

            // Without this the menu will be immediately closed by the "contextmenu" event on the document
            e.stopPropagation();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.#hide();
            }
        });
    }
    createItem(label, action) {
        const item = document.createElement('li');
        item.classList.add('item');
        item.textContent = label;
        item.addEventListener('click', action.bind(this));

        this.#container.appendChild(item);
    }
    #show(absTopPositionPx, absLeftPositionPx) {
        this.#container.style.top = `${absTopPositionPx}px`;
        this.#container.style.left = `${absLeftPositionPx}px`;
        this.#container.hidden = false;
    }
    #hide() {
        if (this.#container.hidden) return;

        this.#onClose();
        this.#container.hidden = true;
        document.removeEventListener('scroll', this.#hide.bind(this));
    }
    #createContainer() {
        const container = document.createElement('ul');
        container.classList.add(this.#containerCssClassName);
        container.hidden = true;

        this.#container = container;
        document.body.appendChild(container);
    }
}
