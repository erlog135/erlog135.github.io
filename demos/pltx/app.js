//import { charMap } from "/res/charMap.js"

let canvas = document.getElementById("canvas")
let width = window.innerWidth
let height = window.innerHeight
let charSize = Math.min(width,height)
let sideLength = charSize



let objs = [[1,0,0,1]]

const app = new PIXI.Application({
    width: width, height: height, backgroundColor: 0x201030, resolution: 1, resizeTo: canvas
});


let text = new PIXI.Text('Platexon esoteric typography demo\n\nStart typing...',{fontFamily : 'monospace', fontSize: 24, fill : 0x604080, align : 'center'});

canvas.appendChild(app.view)



let stage = new PIXI.Container()

app.stage.addChild(stage)
stage.addChild(text)

function windowResize(){
    width = window.innerWidth
    height = window.innerHeight


    updateGrid()
}


//windowResize()


let obj = new PIXI.Graphics()
function updateGrid(){
    
    sideLength = Math.floor(Math.ceil(Math.sqrt(objs.length))/2)*2+1//Math.ceil(Math.sqrt(objs.length))
    charSize = Math.min(width,height)/sideLength

    //console.log("length: " + objs.length.toString() + ", x:" + (objs.length%sideLength).toString() + ", y: " + (Math.floor(objs.length/sideLength)).toString());
    //console.log("length: "+objs.length.toString()+", side: " + Math.ceil(Math.sqrt(objs.length)).toString())
    obj.clear()
    for (let i = 0; i < sideLength; i++){
        for (let j = 0; j < sideLength; j++) {
            // obj.beginFill(0xff0000);
            // obj.drawRect((j)*charSize, (i)*charSize, charSize, charSize);
            // obj.endFill()
            // let cellPos = [j-Math.floor(sideLength/2),i-Math.floor(sideLength/2)]
            drawChar(j,i,charSize,[3,2,3,1])
            
        }
    }
    drawChar(0, 0, charSize,[0,0,0,1]);
    for(let i = 0; i<objs.length; i++){
        let cellPos = spiral(i-1)
        obj.lineStyle(1, 0xFEEB77, 1);
        obj.beginFill(0x00ff00);
        drawChar((cellPos[0]+Math.floor(sideLength/2)), (cellPos[1]+Math.floor(sideLength/2)),charSize,objs[i]);
        obj.endFill()
    }

    drawChar(Math.floor(sideLength/2), Math.floor(sideLength/2), charSize,[1,0,0,1]);

}
updateGrid()
stage.addChild(obj)

document.addEventListener('keydown', (event) => {
    //if(event.repeat) {return}
    if(event.key == "Backspace"){
        if(objs.length > 1){
            objs.pop()
        }
    }else{
        try {
            //console.log(charMap[event.key.toUpperCase()]);
            if(charMap[event.key.toUpperCase()]){
                objs.push(charMap[event.key.toUpperCase()])
            }
        } catch (error) {
            console.error(error);
        }
        //charmap[key]
    }
    updateGrid()

    var name = event.key;
    var code = event.code;
    //console.log(`Key pressed ${name} \r\n Key code value: ${code}`);

});

function spiral(n) {
    // given n an index in the squared spiral
    // p the sum of point in inner square
    // a the position on the current square
    // n = p + a

    var r = Math.floor((Math.sqrt(n + 1) - 1) / 2) + 1;

    // compute radius : inverse arithmetic sum of 8+16+24+...=
    var p = (8 * r * (r - 1)) / 2;
    // compute total point on radius -1 : arithmetic sum of 8+16+24+...

    var en = r * 2;
    // points by face

    var a = (1 + n - p) % (r * 8);
    // compute de position and shift it so the first is (-r,-r) but (-r+1,-r)
    // so square can connect

    //var pos = [0, 0, r]; 'r' was used for specifying the row or something idk
    var pos = [0, 0]
    switch (Math.floor(a / (r * 2))) {
        // find the face : 0 top, 1 right, 2, bottom, 3 left
        case 0:
            {
                pos[0] = a - r;
                pos[1] = -r;
            }
            break;
        case 1:
            {
                pos[0] = r;
                pos[1] = (a % en) - r;

            }
            break;
        case 2:
            {
                pos[0] = r - (a % en);
                pos[1] = r;
            }
            break;
        case 3:
            {
                pos[0] = -r;
                pos[1] = r - (a % en);
            }
            break;
    }
    return pos;
}


function drawChar(x,y,size,value){
    let rightAlign = width-charSize*sideLength
    obj.lineStyle(1, 0xffff00, 1);
    obj.beginFill(0x000000);
    obj.drawRect(rightAlign+(x)*size, (y)*size, size, size);
    let qSize = size/2
    for (let i = 0; i < value.length; i++) {
        let xOff = rightAlign+x*size+(i % 2)*qSize
        let yOff = y*size+(Math.floor(i/2) % 2)*qSize
        switch (value[i]) {
            case 1:
                obj.moveTo(xOff,yOff+qSize)
                obj.lineTo(xOff+qSize,yOff)
                break;
            case 2:
                obj.moveTo(xOff,yOff)
                obj.lineTo(xOff+qSize,yOff+qSize)
                break;
            case 3:
                obj.moveTo(xOff,yOff+qSize)
                obj.lineTo(xOff+qSize,yOff)
                obj.moveTo(xOff,yOff)
                obj.lineTo(xOff+qSize,yOff+qSize)
                break;
            default:
                break;
        }
    }
    obj.endFill()
}

window.onresize = windowResize