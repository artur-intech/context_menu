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

    constructor({ target, items: rawItems, beforeOpen, onClose, css: customCss }) {
        this.#beforeOpen = beforeOpen;
        this.#onClose = onClose;
        this.#buildDom(rawItems, customCss);

        target.addEventListener('contextmenu', (e) => {
            if (this.#opened()) {
                this.#close();
            }

            // Call back
            if (!this.#beforeOpen(e)) {
                return;
            }

            const [coordXPx, coordYPx] = this.#nonOverflowCoordsPx(e.pageX, e.pageY);
            this.#open(coordXPx, coordYPx);

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
        Object.freeze(this);
    }
    #open(coordXPx, coordYPx) {
        this.#container.style.left = `${coordXPx}px`;
        this.#container.style.top = `${coordYPx}px`;
        this.#container.style.visibility = 'visible';
        this.#container.hidden = false;
    }
    #close() {
        if (this.#container.hidden) return;

        this.#onClose();
        this.#container.hidden = true;
        this.#abortController.abort();
    }
    #opened() {
        return !this.#container.hidden;
    }
    #nonOverflowCoordsPx(x, y) {
        let outX = x;
        let outY = y;
        const edgeOffset = 5;

        this.#renderInvisibly();

        const documentXOverflown = (x + this.#container.offsetWidth) > document.documentElement.scrollWidth;
        if (documentXOverflown) {
            outX = document.documentElement.scrollWidth - this.#container.offsetWidth - edgeOffset;
        }

        const documentYOverflown = (y + this.#container.offsetHeight) > document.documentElement.scrollHeight;
        if (documentYOverflown) {
            outY = document.documentElement.scrollHeight - this.#container.offsetHeight - edgeOffset;
        }

        return [outX, outY];
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
    #buildDom(rawItems, customCss) {
        const menu = document.createElement('ul');
        menu.hidden = true;
        menu.dataset.testid = 'menu';
        menu.replaceChildren(...this.#items(rawItems));

        this.#shadowRoot(this.#stylesheets(customCss)).appendChild(menu);

        this.#container = menu;
    }
    #shadowRoot(stylesheets) {
        const host = document.createElement('div');
        host.dataset.testid = 'context-menu-shadow-host';
        document.body.appendChild(host);

        const root = host.attachShadow({ mode: 'open' });
        root.adoptedStyleSheets = stylesheets;

        return root;
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
    #items(rawItems) {
        return rawItems.map((rawItem) => {
            const element = document.createElement('li');
            element.textContent = rawItem.label;
            element.addEventListener('click', rawItem.action.bind(this));

            return element;
        })
    }
}
