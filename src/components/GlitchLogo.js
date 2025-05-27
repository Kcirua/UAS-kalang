import React from "react";
import Sketch from "react-p5";
import garutStudios from "../assets/your-logo.png"; // <-- use your image

class Glitch {
    constructor(img, p5) {
        this.p5 = p5;
        this.channelLen = 4;
        this.imgOrigin = img;
        this.imgOrigin.loadPixels();
        this.copyData = [];
        this.flowLineImgs = [];
        this.shiftLineImgs = [];
        this.shiftRGBs = [];
        this.scatImgs = [];
        this.throughFlag = true;
        this.copyData = new Uint8ClampedArray(this.imgOrigin.pixels);

        // flow line
        for (let i = 0; i < 1; i++) {
            let o = {
                pixels: null,
                t1: p5.floor(p5.random(0, 1000)),
                speed: p5.floor(p5.random(4, 24)),
                randX: p5.floor(p5.random(24, 80))
            };
            this.flowLineImgs.push(o);
        }

        // shift line
        for (let i = 0; i < 6; i++) {
            let o = null;
            this.shiftLineImgs.push(o);
        }

        // shift RGB
        for (let i = 0; i < 1; i++) {
            let o = null;
            this.shiftRGBs.push(o);
        }

        // scat imgs
        for (let i = 0; i < 3; i++) {
            let scatImg = {
                img: null,
                x: 0,
                y: 0
            };
            this.scatImgs.push(scatImg);
        }
    }

    replaceData(destImg, srcPixels) {
        for (let y = 0; y < destImg.height; y++) {
            for (let x = 0; x < destImg.width; x++) {
                let index = (y * destImg.width + x) * this.channelLen;
                destImg.pixels[index] = srcPixels[index];
                destImg.pixels[index + 1] = srcPixels[index + 1];
                destImg.pixels[index + 2] = srcPixels[index + 2];
                destImg.pixels[index + 3] = srcPixels[index + 3];
            }
        }
        destImg.updatePixels();
    }

    flowLine(srcImg, obj) {
        const p5 = this.p5;
        let destPixels = new Uint8ClampedArray(srcImg.pixels);
        obj.t1 %= srcImg.height;
        obj.t1 += obj.speed;
        let tempY = p5.floor(obj.t1);
        for (let y = 0; y < srcImg.height; y++) {
            if (tempY === y) {
                for (let x = 0; x < srcImg.width; x++) {
                    let index = (y * srcImg.width + x) * this.channelLen;
                    destPixels[index] = srcImg.pixels[index] + obj.randX;
                    destPixels[index + 1] = srcImg.pixels[index + 1] + obj.randX;
                    destPixels[index + 2] = srcImg.pixels[index + 2] + obj.randX;
                    destPixels[index + 3] = srcImg.pixels[index + 3];
                }
            }
        }
        return destPixels;
    }

    shiftLine(srcImg) {
        const p5 = this.p5;
        let destPixels = new Uint8ClampedArray(srcImg.pixels);
        let rangeH = srcImg.height;
        let rangeMin = p5.floor(p5.random(0, rangeH));
        let rangeMax = rangeMin + p5.floor(p5.random(1, rangeH - rangeMin));
        let offsetX = this.channelLen * p5.floor(p5.random(-40, 40));

        for (let y = 0; y < srcImg.height; y++) {
            if (y > rangeMin && y < rangeMax) {
                for (let x = 0; x < srcImg.width; x++) {
                    let index = (y * srcImg.width + x) * this.channelLen;
                    let r2 = index + offsetX;
                    let g2 = index + 1 + offsetX;
                    let b2 = index + 2 + offsetX;
                    destPixels[index] = srcImg.pixels[r2];
                    destPixels[index + 1] = srcImg.pixels[g2];
                    destPixels[index + 2] = srcImg.pixels[b2];
                    destPixels[index + 3] = srcImg.pixels[index + 3];
                }
            }
        }
        return destPixels;
    }

    shiftRGB(srcImg) {
        const p5 = this.p5;
        let range = 16;
        let destPixels = new Uint8ClampedArray(srcImg.pixels);
        let randR = (p5.floor(p5.random(-range, range)) * srcImg.width + p5.floor(p5.random(-range, range))) * this.channelLen;
        let randG = (p5.floor(p5.random(-range, range)) * srcImg.width + p5.floor(p5.random(-range, range))) * this.channelLen;
        let randB = (p5.floor(p5.random(-range, range)) * srcImg.width + p5.floor(p5.random(-range, range))) * this.channelLen;

        for (let y = 0; y < srcImg.height; y++) {
            for (let x = 0; x < srcImg.width; x++) {
                let index = (y * srcImg.width + x) * this.channelLen;
                let r2 = (index + randR) % srcImg.pixels.length;
                let g2 = (index + 1 + randG) % srcImg.pixels.length;
                let b2 = (index + 2 + randB) % srcImg.pixels.length;
                destPixels[index] = srcImg.pixels[r2];
                destPixels[index + 1] = srcImg.pixels[g2];
                destPixels[index + 2] = srcImg.pixels[b2];
                destPixels[index + 3] = srcImg.pixels[index + 3];
            }
        }
        return destPixels;
    }

    getRandomRectImg(srcImg) {
        const p5 = this.p5;
        let startX = p5.floor(p5.random(0, srcImg.width - 30));
        let startY = p5.floor(p5.random(0, srcImg.height - 50));
        let rectW = p5.floor(p5.random(30, srcImg.width - startX));
        let rectH = p5.floor(p5.random(1, 50));
        let destImg = srcImg.get(startX, startY, rectW, rectH);
        destImg.loadPixels();
        return destImg;
    }

    show() {
        const p5 = this.p5;
        this.replaceData(this.imgOrigin, this.copyData);

        let n = p5.floor(p5.random(100));
        if (n > 75 && this.throughFlag) {
            this.throughFlag = false;
            setTimeout(() => {
                this.throughFlag = true;
            }, p5.floor(p5.random(40, 400)));
        }
        if (!this.throughFlag) {
            p5.push();
            p5.translate((p5.width - this.imgOrigin.width) / 2, (p5.height - this.imgOrigin.height) / 2);
            p5.image(this.imgOrigin, 0, 0);
            p5.pop();
            return;
        }

        this.flowLineImgs.forEach((v, i, arr) => {
            arr[i].pixels = this.flowLine(this.imgOrigin, v);
            if (arr[i].pixels) {
                this.replaceData(this.imgOrigin, arr[i].pixels);
            }
        });

        this.shiftLineImgs.forEach((v, i, arr) => {
            if (p5.floor(p5.random(100)) > 50) {
                arr[i] = this.shiftLine(this.imgOrigin);
                this.replaceData(this.imgOrigin, arr[i]);
            } else {
                if (arr[i]) {
                    this.replaceData(this.imgOrigin, arr[i]);
                }
            }
        });

        this.shiftRGBs.forEach((v, i, arr) => {
            if (p5.floor(p5.random(100)) > 65) {
                arr[i] = this.shiftRGB(this.imgOrigin);
                this.replaceData(this.imgOrigin, arr[i]);
            }
        });

        p5.push();
        p5.translate((p5.width - this.imgOrigin.width) / 2, (p5.height - this.imgOrigin.height) / 2);
        p5.image(this.imgOrigin, 0, 0);
        p5.pop();

        this.scatImgs.forEach((obj) => {
            p5.push();
            p5.translate((p5.width - this.imgOrigin.width) / 2, (p5.height - this.imgOrigin.height) / 2);
            if (p5.floor(p5.random(100)) > 80) {
                obj.x = p5.floor(p5.random(-this.imgOrigin.width * 0.3, this.imgOrigin.width * 0.7));
                obj.y = p5.floor(p5.random(-this.imgOrigin.height * 0.1, this.imgOrigin.height));
                obj.img = this.getRandomRectImg(this.imgOrigin);
            }
            if (obj.img) {
                p5.image(obj.img, obj.x, obj.y);
            }
            p5.pop();
        });
    }
}

export default function GlitchLogo() {
  let glitch;
  let isLoaded = false;
  let imgWidth = 400; // Adjust as needed
  let imgHeight = 200; // Adjust as needed

  const setup = (p5, canvasParentRef) => {
    p5.loadImage(garutStudios, (img) => {
      img.resize(imgWidth, imgHeight);
      p5.createCanvas(imgWidth, imgHeight).parent(canvasParentRef);
      glitch = new Glitch(img, p5);
      isLoaded = true;
    });
  };

  const draw = (p5) => {
    p5.clear();
    p5.background(0, 0);
    if (isLoaded && glitch) {
      glitch.show();
    }
  };

  return <Sketch setup={setup} draw={draw} />;
}