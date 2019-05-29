const atmelDevices = {
  12270: ['atmega8u2'],
  12271: ['atmega16u2'],
  12272: ['atmega32u2'],
  12273: ['at32uc3a3'],
  12275: ['atmega16u4'],
  12276: ['atmega32u4'],
  12278: ['at32uc3b0', 'at32uc3b1'],
  12279: ['at90usb82'],
  12280: ['at32uc3a0', 'at32uc3a1'],
  12281: ['at90usb646'],
  12282: ['at90usb162'],
  12283: ['at90usb1286', 'at90usb1287'],
  12285: ['at89c5130', 'at89c5131'],
  12287: ['at89c5132', 'at89c5snd1c'],
};

export type keeb = {keyboard:string} | {processor: string}

export class dfuProgrammerFlash{
  private device: string;
  private filepath: string
  /**
   * 
   * @param {string} productID USB product ID of connected device
   * @param {string} filepath File path whre hex file is stored
   * @param {keeb} [kbd] keyboard or processor submited to be used for flashing
   */
  constructor(productID: string, filepath: string, kbd: keeb) {
    this.filepath = filepath
    console.log(kbd)
    if (kbd["processor"]) this.device = kbd["processor"];
  }
}
