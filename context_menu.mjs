export class ContextMenu {
    #beforeOpen;
    #onClose;
    #container;
    #abortController;
    #defaultCss = `
        ul {
            background: white;
            border: #ccc solid 1px;
            border-radius: .5em;
            box-shadow: .3em .3em .5em gray;
            position: absolute;
            user-select: none;
            list-style: none;
            padding: 0;
            margin: 0;
        }

        li {
            padding: .5em 1em;
        }

        li:hover {
            border-radius: .5em;
            background: #f1f1f1;
        }
    `;

    constructor({ target, beforeOpen, onClose, css: customCss }) {
        this.#beforeOpen = beforeOpen;
        this.#onClose = onClose;
        this.#createShadowDom(this.#stylesheets(customCss));

        target.addEventListener('contextmenu', (e) => {
            if (this.#opened()) {
                this.#close();
            }

            // Call back
            if (!this.#beforeOpen(e)) {
                return;
            }

            const cursorPosPx = { x: e.pageX, y: e.pageY };
            const posPx = this.#posPx(cursorPosPx);
            this.#open(posPx);

            this.#abortController = new AbortController();
            const options = {
                once: true,
                signal: this.#abortController.signal
            };

            document.addEventListener('scroll', this.#close.bind(this), options);
            document.addEventListener('click', this.#close.bind(this), options);
            document.addEventListener('keydown', this.#onKeydown.bind(this), options);
            window.addEventListener('resize', this.#close.bind(this), options);

            // Without `stopPropagation` the menu will be immediately closed by the `contextmenu` event handler.
            document.addEventListener('contextmenu', this.#close.bind(this), options);
            e.stopPropagation();

            this.#disableDefaultContextMenu(e);
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
        this.#container.style.left = `${posPx.x}px`;
        this.#container.style.top = `${posPx.y}px`;
        this.#container.style.visibility = 'visible';
        this.#container.hidden = false;
    }
    #close() {
        if (this.#container.hidden) return;

        this.#onClose();
        this.#container.hidden = true;
        this.#abortController.abort();
    }
    #createShadowDom(stylesheets) {
        const host = document.createElement('div');
        document.body.appendChild(host);

        const root = host.attachShadow({ mode: 'open' });
        root.adoptedStyleSheets = stylesheets;

        this.#container = document.createElement('ul');
        this.#container.hidden = true;
        root.appendChild(this.#container);
    }
    #opened() {
        return !this.#container.hidden;
    }
    #posPx(cursorPosPx) {
        let x = cursorPosPx.x;
        let y = cursorPosPx.y;
        const edgeOffsetPx = 5;

        this.#renderInvisibly();

        const documentXOverflown = (x + this.#container.offsetWidth) > document.documentElement.scrollWidth;
        if (documentXOverflown) {
            x = document.documentElement.scrollWidth - this.#container.offsetWidth - edgeOffsetPx;
        }

        const documentYOverflown = (y + this.#container.offsetHeight) > document.documentElement.scrollHeight;
        if (documentYOverflown) {
            y = document.documentElement.scrollHeight - this.#container.offsetHeight - edgeOffsetPx;
        }

        return { y: y, x: x };
    }
    // Renders hidden container to enable dimensions calculation.
    #renderInvisibly() {
        this.#container.style.visibility = 'hidden';
        this.#container.hidden = false;
        this.#container.style.left = 0;
        this.#container.style.top = 0;
    }
    #disableDefaultContextMenu(e) {
        e.preventDefault();
    }
    #onKeydown(e) {
        const escPressed = (e.key === 'Escape');

        if (escPressed) {
            this.#close();
        }
    }
    #stylesheets(customCss) {
        const list = [this.#defaultStylesheet()];

        if (customCss) {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(customCss);
            list.push(sheet);
        }

        return list;
    }
    #defaultStylesheet() {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(this.#defaultCss);
        return sheet;
    }
}
