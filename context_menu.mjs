export class ContextMenu {
    #beforeOpen;
    #onClose;
    #container;
    #containerCssClassName = 'menu';
    #abortController;

    constructor({ target, beforeOpen, onClose }) {
        this.#beforeOpen = beforeOpen;
        this.#onClose = onClose;
        this.#createContainer();

        target.addEventListener('contextmenu', (e) => {
            if (this.#opened()) {
                this.#close();
            }

            // Call back
            if (!this.#beforeOpen(e)) {
                return;
            }

            const cursorPosPx = { y: e.pageY, x: e.pageX };
            const posPx = this.#posPx(cursorPosPx);
            this.#open(posPx);

            e.preventDefault();

            this.#abortController = new AbortController();
            const options = {
                once: true,
                signal: this.#abortController.signal
            };

            document.addEventListener('scroll', this.#close.bind(this), options);
            document.addEventListener('contextmenu', this.#close.bind(this), options);
            document.addEventListener('click', this.#close.bind(this), options);
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.#close();
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
    #open(posPx) {
        this.#container.style.top = `${posPx.y}px`;
        this.#container.style.left = `${posPx.x}px`;
        this.#container.style.visibility = 'visible';
        this.#container.hidden = false;
    }
    #close() {
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
    #opened() {
        return !this.#container.hidden;
    }
    #posPx(cursorPosPx) {
        var y = cursorPosPx.y;
        var x = cursorPosPx.x;
        const edgeOffsetPx = 5;

        this.#renderInvisibly();

        const documentYOverflown = (y + this.#container.offsetHeight) > document.documentElement.scrollHeight;
        if (documentYOverflown) {
            y = document.documentElement.scrollHeight - this.#container.offsetHeight - edgeOffsetPx;
        }

        const documentXOverflown = (x + this.#container.offsetWidth) > document.documentElement.scrollWidth;
        if (documentXOverflown) {
            x = document.documentElement.scrollWidth - this.#container.offsetWidth - edgeOffsetPx;
        }

        return { y: y, x: x };
    }
    // Renders hidden container to enable dimensions calculation.
    #renderInvisibly() {
        this.#container.style.visibility = 'hidden';
        this.#container.hidden = false;
        this.#container.style.top = 0;
        this.#container.style.left = 0;
    }
}
