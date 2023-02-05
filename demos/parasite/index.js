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

let downloadForm = document.getElementById("download-form");
let downloadButton = document.getElementById("download-button");

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

textWrite.addEventListener("submit", (e)=>{
    e.preventDefault();
})

textRadio.addEventListener("change", (e) => {
    if(e.target.checked){

        textEncodeForm.hidden = false;
        imageEncodeForm.hidden = true;

        overlayCanvas.hidden = false;

        outputForm.hidden = false;
        outputButton.innerText = "Encode";
    }
});

imageRadio.addEventListener("change", (e) => {
    if(e.target.checked){
        
        textEncodeForm.hidden = true;
        imageEncodeForm.hidden = false;

        overlayCanvas.hidden = false;
        
        outputForm.hidden = false;
        outputButton.innerText = "Encode";
    }
});


decodeRadio.addEventListener("change", (e) => {
    if(e.target.checked){

        
        textEncodeForm.hidden = true;
        imageEncodeForm.hidden = true;

        overlayCanvas.hidden = true;
        
        outputForm.hidden = false;
        outputButton.innerText = "Decode";
    }
});

outputButton.addEventListener("click",(e)=>{

    downloadForm.hidden = false;

    if(outputButton.innerText == "Encode"){
        encode();
    }else{
        decode();
    }
})

downloadButton.addEventListener("click",(e)=>{
    let image = outputCanvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");
    let link = document.createElement('a');
    link.download = "ps-output.png";
    link.href = image;
    link.click();
})

function showBaseCanvas() {

    canvas.width = this.width;
    canvas.height = this.height;

    let ctx = canvas.getContext("2d");
    ctx.drawImage(this, 0, 0);
}

function imageOverlayCanvas() {

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
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;

    let baseData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
    let overlayData = overlayCanvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);

    let opctx = outputCanvas.getContext("2d");

    let outputData = new ImageData(canvas.width, canvas.height);

    for (let i = 0; i < overlayData.data.length; i += 4) {

        const pixel = [baseData.data[i], baseData.data[i + 1], baseData.data[i + 2], baseData.data[i + 3]];
        const oPixel = [overlayData.data[i], overlayData.data[i + 1], overlayData.data[i + 2], overlayData.data[i + 3]];

        outputData.data[i] = Math.min(pixel[0] - pixel[0] % 10, 240) + Math.floor(oPixel[0] / (25.6));

        outputData.data[i + 1] = Math.min(pixel[1] - pixel[1] % 10, 240) + Math.floor(oPixel[1] / (25.6));

        outputData.data[i + 2] = Math.min(pixel[2] - pixel[2] % 10, 240) + Math.floor(oPixel[2] / (25.6));

        outputData.data[i + 3] = pixel[3];

    }

    opctx.putImageData(outputData, 0, 0);

}

function decode() {

    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;

    let baseData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);

    let opctx = outputCanvas.getContext("2d");

    let outputData = new ImageData(canvas.width, canvas.height);

    for (let i = 0; i < baseData.data.length; i += 4) {

        const pixel = [baseData.data[i], baseData.data[i + 1], baseData.data[i + 2], baseData.data[i + 3]];

        outputData.data[i] = Math.floor((pixel[0] % 10) * (10 / 9) * (25.6));

        outputData.data[i + 1] = Math.floor((pixel[1] % 10) * (10 / 9) * (25.6));

        outputData.data[i + 2] = Math.floor((pixel[2] % 10) * (10 / 9) * (25.6));

        outputData.data[i + 3] = pixel[3];

    }

    opctx.putImageData(outputData, 0, 0);
}
