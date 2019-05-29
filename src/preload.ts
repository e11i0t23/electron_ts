// in preload scripts, we have access to node.js and electron APIs
// the remote web app will not have access, so this is safe
const {ipcRenderer: ipc, remote} = require('electron');
import { flashByURL } from "flash";

class Preload{
  /**
   * Initialise preloading functions
   */
  constructor() {
    // Expose a bridging API to by setting an global on `window`.
    // We'll add methods to it here first, and when the remote web app loads,
    // it'll add some additional methods as well.
    //
    // !CAREFUL! do not expose any functionality or APIs that could compromise the
    // user's computer. E.g. don't directly expose core Electron (even IPC) or node.js modules.
    (<any>window).Bridge = {
      setDockBadge: this.setDockBadge,
      flashURL: this.flashURL,
      autoFlash: Boolean,
    };

    // we get this message from the main process
    ipc.on('markAllComplete', () => {
      // the todo app defines this function
      // window.Bridge.markAllComplete();
      console.log('we sent stuff not');
    });
    
  }
  /**
   * Set badge value on macos
   * @param {number} count value of to witch badge be set
   */
  setDockBadge(count: number) {
    console.log(count);
    if (process.platform === 'darwin') {
      // Coerce count into a string. Passing an empty string makes the badge disappear.
      remote.app.dock.setBadge('' + (count || ''));
    }
  }

  flashURL(url: string, keyboard: string, filename: string){
			new flashByURL(url, keyboard, filename)
	};
}

let preloadjs = new Preload()