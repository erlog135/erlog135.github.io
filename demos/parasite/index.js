let baseImageUpload = document.getElementById("image-base-upload");
let overlayImageUpload = document.getElementById("image-to-encode-upload");
let textWrite = document.getElementById("text-to-encode");

let canvas = document.getElementById("base-canvas");
let overlayCanvas = document.getElementById("overlay-canvas");
let outputCanvas = document.getElementById("output-canvas");

let encodingTypeForm = document.getElementById("encoding-type-form");

let textRadio = document.getElementById("encode-text");
let imageRadio = document.getElementById("encode-image");
let decodeRadio = document.getElementById("decode-image");

let textEncodeForm = document.getElementById("text-encode-form");
let imageEncodeForm = document.getElementById("image-encode-form");

let outputForm = document.getElementById("output-form");
let outputButton = document.getElementById("output-button");

let maxROutputRadio = document.getElementById("output-maxr");
let compOutputRadio = document.getElementById("output-comp");
let customOutputRadio = document.getElementById("output-custom");

let outputSlider = document.getElementById("output-slider");

let outputSliderForm = document.getElementById("output-slider-form");
let downloadForm = document.getElementById("download-form");
let downloadButton = document.getElementById("download-button");

let outputQualityReductionText = document.getElementById("output-quality-text");
let outputQualityReduction = document.getElementById("output-quality-reduction");

let outputProgressBar = document.getElementById("output-progress")

let baseImage;
let overlayImage;
let qrStrength = 16;

const gpu = new GPU();
// const multiplyMatrix = gpu.createKernel(function(a, b) {
//     let sum = 0;
//     for (let i = 0; i < 512; i++) {
//         sum += a[this.thread.y][i] * b[i][this.thread.x];
//     }
//     return sum;
// }).setOutput([512, 512]);

//const c = multiplyMatrix(1, 2);

baseImageUpload.addEventListener("change", (e) => {


    if (e.target.files.length > 0) {
        let img = new Image();
        img.onload = showBaseCanvas;
        img.onerror = () => { console.error("error") };
        img.src = URL.createObjectURL(e.target.files[0]);

        encodingTypeForm.hidden = false;
        canvas.hidden = false;
    }

});

overlayImageUpload.addEventListener("change", (e) => {


    if (e.target.files.length > 0) {
        let img = new Image();
        img.onload = imageOverlayCanvas;
        img.onerror = () => { console.error("error") };
        img.src = URL.createObjectURL(e.target.files[0]);
    }

});

textWrite.addEventListener("change", (e) => {
    textOverlayCanvas(e.target.value);
})

textWrite.addEventListener("submit", (e) => {
    e.preventDefault();
})

textRadio.addEventListener("change", (e) => {
    if (e.target.checked) {

        textEncodeForm.hidden = false;
        imageEncodeForm.hidden = true;

        overlayCanvas.hidden = false;

        outputForm.hidden = false;
        outputButton.innerText = "Encode";
    }
});

imageRadio.addEventListener("change", (e) => {
    if (e.target.checked) {

        textEncodeForm.hidden = true;
        imageEncodeForm.hidden = false;

        overlayCanvas.hidden = false;

        outputForm.hidden = false;
        outputButton.innerText = "Encode";
    }
});


decodeRadio.addEventListener("change", (e) => {
    if (e.target.checked) {


        textEncodeForm.hidden = true;
        imageEncodeForm.hidden = true;

        overlayCanvas.hidden = true;

        outputForm.hidden = false;
        outputButton.innerText = "Decode";
    }
});

maxROutputRadio.addEventListener("change", (e) => {
    if (e.target.checked) {

        outputSliderForm.hidden = true;

        outputButton.hidden = false;
    }
});

maxROutputRadio.addEventListener("change", (e) => {
    if (e.target.checked) {

        outputSliderForm.hidden = true;

        outputQualityReductionText.hidden = false;
        outputQualityReduction.innerText = "1";

        outputButton.hidden = false;

        resizeOverlay();
    }
});

compOutputRadio.addEventListener("change", (e) => {
    if (e.target.checked) {

        outputSliderForm.hidden = true;

        outputQualityReductionText.hidden = false;
        outputQualityReduction.innerText = "4";

        outputButton.hidden = false;

        resizeOverlay();
    }
});


customOutputRadio.addEventListener("change", (e) => {
    if (e.target.checked) {

        outputSliderForm.hidden = false;

        outputQualityReductionText.hidden = false;
        outputQualityReduction.innerText = outputSlider.value;

        outputButton.hidden = false;

        resizeOverlay();
    }
});

outputSlider.addEventListener("change", (e) => {
    outputQualityReduction.innerText = e.target.value;

    resizeOverlay();
});

outputButton.addEventListener("click", (e) => {

    downloadForm.hidden = false;

    if (outputButton.innerText == "Encode") {
        encode();
    } else {
        decode();
    }
})

downloadButton.addEventListener("click", (e) => {
    let image = outputCanvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");
    let link = document.createElement('a');
    link.download = "ps-output.png";
    link.href = image;
    link.click();
})

function showBaseCanvas() {

    baseImage = this;

    canvas.width = this.width;
    canvas.height = this.height;

    let ctx = canvas.getContext("2d");
    ctx.drawImage(this, 0, 0);
}

function imageOverlayCanvas() {

    overlayImage = this;

    overlayCanvas.width = canvas.width;
    overlayCanvas.height = canvas.height;

    let octx = overlayCanvas.getContext("2d");
    octx.drawImage(this, 0, 0, canvas.width, canvas.height);
}

function textOverlayCanvas(text) {

    overlayCanvas.width = canvas.width;
    overlayCanvas.height = canvas.height;

    let octx = overlayCanvas.getContext("2d");
    octx.font = "30px Arial";

    octx.fillStyle = "white";
    octx.fillRect(0, 0, canvas.width, canvas.height);

    octx.fillStyle = "black"
    octx.fillText(text, 10, 50);
}

function encode() {

    //from 1 to 8

    let qr = Number(outputQualityReduction.innerText) * qrStrength;

    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;

    let baseData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
    let overlayData = overlayCanvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);

    let opctx = outputCanvas.getContext("2d");

    let outputData = new ImageData(canvas.width, canvas.height);

    const gpuEncode = gpu.createKernel(function (base, overlay) {

        const pos = 4 * (this.thread.x + this.constants.w * (this.constants.h - this.thread.y));
        const bPixel = [base[pos],base[pos + 1],base[pos + 2]];
        const oPixel = [overlay[pos],overlay[pos + 1],overlay[pos + 2]];

        const opPixel = [
            Math.min((Math.floor(bPixel[0] / (this.constants.oqr*this.constants.qrs)) * (this.constants.oqr*this.constants.qrs)) + ((Math.floor(oPixel[0] / this.constants.qrs)) * this.constants.oqr), 255),
            Math.min((Math.floor(bPixel[1] / (this.constants.oqr*this.constants.qrs)) * (this.constants.oqr*this.constants.qrs)) + ((Math.floor(oPixel[1] / this.constants.qrs)) * this.constants.oqr), 255),
            Math.min((Math.floor(bPixel[2] / (this.constants.oqr*this.constants.qrs)) * (this.constants.oqr*this.constants.qrs)) + ((Math.floor(oPixel[2] / this.constants.qrs)) * this.constants.oqr), 255),
        ];

        this.color(opPixel[0]/256, opPixel[1]/256, opPixel[2]/256, 1);
    })
        .setOutput([canvas.width, canvas.height])
        .setConstants({ w: canvas.width, h: canvas.height, oqr: Number(outputQualityReduction.innerText) ,qrs: qrStrength })
        .setGraphical(true);

    // for (let i = 0; i < overlayData.data.length; i += 4) {

    //     progress(Math.round((i/baseData.data.length)*100));

    //     const pixel = [baseData.data[i], baseData.data[i + 1], baseData.data[i + 2], baseData.data[i + 3]];
    //     const oPixel = [overlayData.data[i], overlayData.data[i + 1], overlayData.data[i + 2], overlayData.data[i + 3]];

    //     for (let color = 0; color < pixel.length; color++) {
    //         if (color < 3) {
    //             //round base pixels down to a multiple of qr
    //             let base = Math.floor(pixel[color] / qr) * qr;

    //             //round overlay pixels to 16 color values for r,g,b
    //             let overlay = (Math.floor(oPixel[color] / qrStrength)) * Number(outputQualityReduction.innerText);

    //             //in the output, append the overlay to the base
    //             outputData.data[i + color] = Math.min(base + overlay, 255);
    //         } else {

    //             //do nothing to the alpha channel
    //             outputData.data[i + color] = pixel[color];
    //         }
    //     }
    // }

    gpuEncode(baseData.data, overlayData.data);

    //console.log(gpuEncode.getPixels());
    //console.log(outputData.data);
    outputData.data.set(gpuEncode.getPixels());
    opctx.putImageData(outputData, 0, 0);

    //outputImage = gpuEncode.canvas;
    //opctx.drawImage(outputImage, 0, 0);

}

function decode() {

    let qr = Number(outputQualityReduction.innerText) * qrStrength;

    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;

    let baseData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);

    let opctx = outputCanvas.getContext("2d");

    let outputData = new ImageData(canvas.width, canvas.height);

    const gpuDecode = gpu.createKernel(function (base) {

        const pos = 4 * (this.thread.x + this.constants.w * (this.constants.h - this.thread.y));
        const bPixel = [base[pos],base[pos + 1],base[pos + 2]];

        const opPixel = [
            Math.min((Math.floor(((bPixel[0] % (this.constants.oqr*this.constants.qrs))) / this.constants.oqr) * this.constants.qrs), 255),
            Math.min((Math.floor(((bPixel[1] % (this.constants.oqr*this.constants.qrs))) / this.constants.oqr) * this.constants.qrs), 255),
            Math.min((Math.floor(((bPixel[2] % (this.constants.oqr*this.constants.qrs))) / this.constants.oqr) * this.constants.qrs), 255),
        ];

        this.color(opPixel[0]/256, opPixel[1]/256, opPixel[2]/256, 1);
    })
        .setOutput([canvas.width, canvas.height])
        .setConstants({ w: canvas.width, h: canvas.height, oqr: Number(outputQualityReduction.innerText) ,qrs: qrStrength })
        .setGraphical(true);

    // for (let i = 0; i < baseData.data.length; i += 4) {

    //     progress(Math.round((i / baseData.data.length) * 100));

    //     const pixel = [baseData.data[i], baseData.data[i + 1], baseData.data[i + 2], baseData.data[i + 3]];

    //     for (let color = 0; color < pixel.length; color++) {
    //         if (color < 3) {
    //             //get the 16  r,g,b, from the base and ensure max is qrStrength to make them fit range
    //             let output = Math.floor(((pixel[color] % qr)) / Number(outputQualityReduction.innerText)) * qrStrength;

    //             //in the output, append the overlay to the base
    //             outputData.data[i + color] = Math.min(output, 255);
    //         } else {

    //             //do nothing to the alpha channel
    //             outputData.data[i + color] = pixel[color];
    //         }
    //     }

    // }

    gpuDecode(baseData.data);

    //opctx.putImageData(outputData, 0, 0);

    outputData.data.set(gpuDecode.getPixels());
    opctx.putImageData(outputData, 0, 0);
}

function progress(percent) {
    outputProgressBar.innerText = percent;
    outputProgressBar.style.width = percent;
}

function resizeOverlay() {
    if (outputButton.innerText == "Encode") {
        let qualityReduction = Number(outputQualityReduction.innerText);

        let reWidth = canvas.width / qualityReduction;
        let reHeight = canvas.height / qualityReduction;

        octx = overlayCanvas.getContext("2d");

        octx.webkitImageSmoothingEnabled = false;
        octx.mozImageSmoothingEnabled = false;
        octx.imageSmoothingEnabled = false;

        octx.drawImage(overlayImage, 0, 0, reWidth, reHeight);
        octx.drawImage(overlayCanvas, 0, 0, reWidth, reHeight, 0, 0, canvas.width, canvas.height);
    }
}

function mapRange(num, in_min, in_max, out_min, out_max) {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}