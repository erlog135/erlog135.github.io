//import { charMap } from "/res/charMap.js"

let canvas = document.getElementById("canvas");
let width = window.innerWidth;
let height = window.innerHeight;
let pointerX = 0;
let pointerY = 0;

let nodes = []

const app = new PIXI.Application({
    width: width, height: height, backgroundColor: 0x001E2F, resolution: 1, resizeTo: canvas
});
let stage = new PIXI.Container()
stage.interactive = true
stage.on("pointermove",(e)=>{
    pointerX = e.data.global.x;
    pointerY = e.data.global.y;
})

class Node{
    constructor(x,y,age,range){
        this.pointerover = false
        this.x = x;
        this.y = y;
        this.age = age;
        this.range = range;
        
        this.gfx = new PIXI.Graphics();
        this.gfx.interactive= true
        //this.gfx.on("pointerdown",this.click);
        this.gfx.on("pointerdown",()=>{this.pointerover = true});
        this.gfx.on("pointerup",()=>{this.pointerover = false});
        this.gfx.on("pointermove",()=>{
            if(this.pointerover){
                this.move(pointerX,pointerY)
            }
        })

        this.gfx.lineStyle(5, 0xCAE6FF, 1);
        this.gfx.beginFill(0x006492);
        this.gfx.drawCircle(0, 0, 15);
        this.gfx.position.x = this.x;
        this.gfx.position.y = this.y;
        this.gfx.endFill();
        
        stage.addChild(this.gfx)
    }
    click(){
        console.log("clicked");
    }
    move(x,y){
       //console.log(this.gfx.position);
       this.x = x
       this.y = y
       this.gfx.position.x = this.x
       this.gfx.position.y = this.y
    }
}

class Pulse{
    constructor(x,y,range,speed){
        this.x = x;
        this.y = y;
        this.range = range;
        this.speed = speed;
    }

}

class Message{
    constructor(origin,destination,content){
        this.origin = origin;
        this.destination = destination;
        this.content = content;
    }
}

canvas.appendChild(app.view)

//console.log(stage.getMousePosition());

app.stage.addChild(stage)

let etime = 20
const TIME_SCALE = 0.01

for (let i = 0; i < 10; i++) {
    let node = new Node(Math.floor(Math.random()*width),Math.floor(Math.random()*height),0,100);
    nodes.push(node);
}

//let node = new Node(100,100,0,0)



function tick(delta){
    etime += delta*TIME_SCALE


}



app.ticker.add(tick)

function windowResize(){
    width = window.innerWidth
    height = window.innerHeight
}


window.onresize = windowResize