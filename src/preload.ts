// in preload scripts, we have access to node.js and electron APIs
// the remote web app will not have access, so this is safe
const {ipcRenderer: ipc, remote} = require('electron');
const flash = require('./flash');


/**
 * Set badge on MacOS
 * @param {Number} count Value to set badge to
 * @module window.Bridge
 */
function setDockBadge(count): void {
    console.log(count);
    if (process.platform === 'darwin') {
        // Coerce count into a string.
        // Passing an empty string makes the badge disappear.
        remote.app.dock.setBadge('' + (count || ''));
    }
}

/**
 * Function called when connecting to website to expose Bridge API
 * @module preload
 */
function init(): void {
    // Expose a bridging API to by setting an global on `window`.
    // We'll add methods to it here first, and when the remote web app loads,
    // it'll add some additional methods as well.
    //
    // !CAREFUL! do not expose any functionality or APIs that could compromise the
    // user's computer. E.g. don't directly expose core Electron
    // (even IPC) or node.js modules.
    // @ts-ignore
    window.Bridge = {
        setDockBadge: setDockBadge,
        flashURL: flash,
        autoFlash: Boolean,
    };

    // we get this message from the main process
    ipc.on('markAllComplete', (): void => {
        // the todo app defines this function
        // window.Bridge.markAllComplete();
        console.log('we sent stuff not');
    });
}

init();
