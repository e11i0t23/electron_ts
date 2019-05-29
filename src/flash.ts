const temp = require('temp');
const path = require('path');
const https = require('follow-redirects').https;
const fs = require('fs');
const usb = require('usb');

import { dfuProgrammerFlash } from "./programmers/dfuProgrammer";

  /**
 * Stores a table of deviceIDs which chose programmer
 */
const deviceIDs = {
  0x03eb: 'dfu-programmer', // Atmel vendor id
  0x2341: 'avrdude', // Arduino vendor id
  0x1B4F: 'avrdude', // Sparkfun vendor id
  0x239a: 'avrdude', // adafruit vendor id
  1155: 'dfu-util',
};

export class flashByURL {
  private APIurl: string;
  private keyboard: string;
  private filename: string;
  private filePath: string;
  private flashing: boolean;
  private autoFlash: boolean = (<any>window).Bridge.autoFlash
  
  /**
   * Initialize flashing procedure
   * @param {string} url API Url for which file is downloaded from
   * @param {string} keyboard Name of keyboard
   * @param {string} filename Name of file to download to
   */
  constructor(url: string, keyboard: string, filename: string) {
    this.APIurl = url;
    this.keyboard = keyboard;
    this.filename = filename;
    this.downloadFile()
  }
  
  /** Downloads Firmware File from api */
  downloadFile(): void {
    temp.mkdir('qmkconfigurator', function(err, dirPath) {
      (<any>window).Bridge.statusAppend('\n\n ----STARTING FLASHING PROCEDURES----\n');
      this.filePath = path.join(dirPath, this.filename);
      console.log(this.filePath);
      var pipeFile = fs.createWriteStream(this.filePath);
      https
        .get(this.APIurl, function(response) {
          response.pipe(pipeFile);
          pipeFile.on('finish', function() {
            console.log('finish downloads');
            this.selector();
            pipeFile.close();
          });
        })
        .on('error', function(err) {
          // Handle errors
          fs.unlink(this.filePath); // Delete the file async. (But we don't check the result)
        });
    });
  }
  
  /**Automatic selection of programmer to use */
  selector(): void {
    var USBdevices = usb.getDeviceList();
    var USBdevicesQTY = USBdevices.length;
    for (const USBdevice of USBdevices) {
      var vendorID = USBdevice.deviceDescriptor.idVendor.toString();
      var productID = USBdevice.deviceDescriptor.idProduct.toString();
      // Check if known VID for AVR/ARM programmers
      if (Object.keys(deviceIDs).includes(vendorID)) {
        var programmer = deviceIDs[vendorID];
        // Forwards onto seperate programming scripts found in ./modules/programmers
        switch (programmer) {
          case 'dfu-programmer':
            if (!this.flashing) {
              (<any>window).Bridge.statusAppend('\nUsing DFU-Programmer');
              new dfuProgrammerFlash(productID, this.filePath, {keyboard: this.keyboard});
              this.flashing = true;
            }
            break;
          case 'avrdude':
            if (!this.flashing) {
              this.flashing = true;
              (<any>window).Bridge.statusAppend('\nUsing avrgirl to flash caterina');
              //if (vendorID == 0x1B4F) avrFlash('sf-pro-micro');
              //else avrFlash();
            }
            break;
          case 'dfu-util':
            if (!this.flashing) {
              this.flashing = true;
              (<any>window).Bridge.statusAppend('\nnot implemented yet');
            }
            break;
          default:
          (<any>window).Bridge.statusAppend(
                '\nProgrammer not yet implemented for this device'
            );
            break;
        }
        break;
      } else if (USBdevice == USBdevices[USBdevicesQTY - 1]) {
        if (!this.autoFlash) {
          (<any>window).Bridge.statusAppend('\nERROR: No USB Device Found');
        }
      }
    }
  }
}