import { ContextMenu } from "../context_menu.mjs";

// Initialize and configure a new menu
const menu = new ContextMenu({
    target: document.querySelector('.js-items-with-context-menu'),
    beforeOpen: function (_contextMenuEvent) {
        console.log('beforeOpen callback');
        return true; // A callback must return true
    },
    onClose: function () {
        console.log('onClose callback');
    }
});

menu.createItem('Edit', function () {
    console.log('Editing...');
});

menu.createItem('Delete', function () {
    console.log('Deleting...');
});
