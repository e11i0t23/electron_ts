export {};
import DfuProgrammerFlash from './programmers/dfuProgrammer';

const temp = require('temp');
const path = require('path');
const https = require('follow-redirects').https;
const fs = require('fs');
const usb = require('usb');
/**
 * Stores a table of deviceIDs which chose programmer
 */
const deviceIDs = {
    0x03eb: 'dfu-programmer', // Atmel vendor id
    0x2341: 'avrdude', // Arduino vendor id
    0x1b4f: 'avrdude', // Sparkfun vendor id
    0x239a: 'avrdude', // adafruit vendor id
    1155: 'dfu-util',
};

class FlashByURL {
    private APIurl: string;
    private keyboard: string;
    private filename: string;
    private filePath: string;
    private flashing: boolean;
    // @ts-ignore
    private autoFlash: boolean = window.Bridge.autoFlash;

    /**
	 * Initialize flashing procedure
	 * @param {string} url API Url for which file is downloaded from
	 * @param {string} keyboard Name of keyboard
	 * @param {string} filename Name of file to download to
	 */
    public constructor(url: string, keyboard: string, filename: string) {
        this.APIurl = url;
        this.keyboard = keyboard;
        this.filename = filename;
        this.downloadFile();
        this.flashing=false;
    }

    /** Downloads Firmware File from api */
    public downloadFile(): void {
        const self = this;
        temp.mkdir('qmkconfigurator', function(err, dirPath): void {
            // @ts-ignore
            window.Bridge.statusAppend('\n\n ----STARTING FLASHING PROCEDURES----\n');
            self.filePath = path.join(dirPath, self.filename);
            console.log(self.filePath);
            const pipeFile = fs.createWriteStream(self.filePath);
            https
                .get(self.APIurl, function(response): void {
                    response.pipe(pipeFile);
                    pipeFile.on('finish', function(): void {
                        console.log('finish downloads');
                        if(self.autoFlash){
                            while(!self.flashing){
                                self.selector();
                            }
                        }else{
                            self.selector()
                        }
                        pipeFile.close();
                    });
                })
                .on('error', function(err): void {
                    console.log(err);
                    fs.unlink(self.filePath); // Delete the file async. (But we don't check the result)
                });
        });
    }

    /** Automatic selection of programmer to use */
    private selector(): void {
        const USBdevices = usb.getDeviceList();
        const USBdevicesQTY = USBdevices.length;
        for (const USBdevice of USBdevices) {
            const vendorID = USBdevice.deviceDescriptor.idVendor.toString();
            const productID = USBdevice.deviceDescriptor.idProduct.toString();
            // Check if known VID for AVR/ARM programmers
            if (Object.keys(deviceIDs).includes(vendorID)) {
                const programmer = deviceIDs[vendorID];
                // Forwards onto seperate programming scripts found in ./modules/programmers
                switch (programmer) {
                    case 'dfu-programmer':
                        if (!this.flashing) {
                            // @ts-ignore
                            window.Bridge.statusAppend('\nUsing DFU-Programmer');
                            new DfuProgrammerFlash(productID, this.filePath, {keyboard: this.keyboard});
                            this.flashing = true;
                        }
                        break;
                    case 'avrdude':
                        if (!this.flashing) {
                            this.flashing = true;
                            // @ts-ignore
                            window.Bridge.statusAppend('\nUsing avrgirl to flash caterina');
                            // if (vendorID == 0x1B4F) avrFlash('sf-pro-micro');
                            // else avrFlash();
                        }
                        break;
                    case 'dfu-util':
                        if (!this.flashing) {
                            this.flashing = true;
                            // @ts-ignore
                            window.Bridge.statusAppend('\nnot implemented yet');
                        }
                        break;
                    default:
                        // @ts-ignore
                        window.Bridge.statusAppend('\nProgrammer not yet implemented for this device');
                        break;
                }
                break;
            } else if (USBdevice == USBdevices[USBdevicesQTY - 1]) {
                if (!this.autoFlash) {
                    // @ts-ignore
                    window.Bridge.statusAppend('\nERROR: No USB Device Found');
                }
            }
        }
    }
}

exports.default = (url: string, keyboard: string, filename: string): void => {
    new FlashByURL(url, keyboard, filename);
};
