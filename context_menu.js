'use strict';

class Menu {
    #onOpen;
    #onClose;
    #container;
    #containerCssClassName = 'menu';
    #abortController;

    constructor({ target, onOpen, onClose }) {
        this.#onOpen = onOpen;
        this.#onClose = onClose;
        this.#createContainer();

        target.addEventListener('contextmenu', (e) => {
            if (!this.#onOpen(e)) {
                return;
            }

            const absTopPositionPx = e.pageY;
            const absLeftPositionPx = e.pageX;

            this.#show(absTopPositionPx, absLeftPositionPx);
            e.preventDefault();

            this.#abortController = new AbortController();
            const options = {
                once: true,
                signal: this.#abortController.signal
            };

            document.addEventListener('scroll', this.#hide.bind(this), options);
            document.addEventListener('contextmenu', this.#hide.bind(this), options);
            document.addEventListener('click', this.#hide.bind(this), options);
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.#hide();
                }
            }, options);

            // Without this the menu will be immediately closed by the "contextmenu" event on the document
            e.stopPropagation();
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
        this.#abortController.abort();
    }
    #createContainer() {
        const container = document.createElement('ul');
        container.classList.add(this.#containerCssClassName);
        container.hidden = true;

        this.#container = container;
        document.body.appendChild(container);
    }
}
