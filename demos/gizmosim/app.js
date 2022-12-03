//import { charMap } from "/res/charMap.js"

let canvas = document.getElementById("canvas");
let width = window.innerWidth;
let height = window.innerHeight;
let pointerX = 0;
let pointerY = 0;

const SPEED = 1;

let nodes = []
let pulses = []

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
        this.detected = [];

        this.gfx = new PIXI.Graphics();
        this.gfx.interactive= true;
        //this.gfx.on("pointerdown",this.click);
        this.gfx.on("pointerdown",()=>{this.pointerover = true; console.log(this.age);});
        this.gfx.on("pointerup",()=>{this.pointerover = false});
        this.gfx.on("pointermove",()=>{
            if(this.pointerover){
                this.move(pointerX,pointerY);
            }
        })

        this.gfx.lineStyle(5, 0xCAE6FF, 1);
        this.gfx.beginFill(0x006492);
        this.gfx.drawCircle(0, 0, 15);
        this.gfx.position.x = this.x;
        this.gfx.position.y = this.y;
        this.gfx.endFill();
        
        stage.addChild(this.gfx)

        this.pulse = new Pulse(this.x,this.y,this.age,this.range,SPEED)
        pulses.push(this.pulse)
    }
    click(){
        console.log("clicked");
    }
    move(x,y){
       //console.log(this.gfx.position);
       this.pulse.move(x,y)
       this.x = x;
       this.y = y;
       this.gfx.position.x = this.x;
       this.gfx.position.y = this.y;
    }
    detect(){
        for (const pulse of pulses) {
            if(pulse != this.pulse){
                let distX = this.x-pulse.x;
                let distY = this.y-pulse.y;
                let dist = Math.sqrt((distX*distX)+(distY*distY));
                if(dist < pulse.size){
                    if(!this.detected.includes(pulse)){
                        this.detected.push(pulse);
                        if(pulse.age > this.age){
                            this.age = lerp(this.age,pulse.age,0.5);
                            this.pulse.age = this.age;
                        }
                        //console.log("hi");
                    }
                }else{
                    if(this.detected.includes(pulse)){
                        //console.log(this.detected.indexOf(pulse));
                        this.detected.splice(this.detected.indexOf(pulse),1)
                    }
                }
            }
        }
    }
}

class Pulse{
    constructor(x,y,age,range,speed){
        this.age = age;
        this.x = x;
        this.y = y;
        this.range = range;//in px
        this.speed = speed;//px/tick
        this.size = this.range % this.age;

        this.gfx = new PIXI.Graphics();
        //this.gfx.lineStyle(5, 0xCAE6FF, 1);
        this.gfx.beginFill(0x006492);
        this.gfx.drawCircle(0, 0, 0);
        this.gfx.position.x = this.x;
        this.gfx.position.y = this.y;
        this.gfx.endFill();
        
        stage.addChild(this.gfx);

    }
    send_message(){

    }
    update(){
        if(this.size+this.speed > this.range){
            this.size = 0;
        }else{
            this.size += this.speed;
        }
        this.age+=1;
        this.gfx.clear();
        //this.gfx.lineStyle(5, 0xCAE6FF, 1);
        this.gfx.beginFill(0x006492);
        this.gfx.alpha = (this.range-this.size)/this.range
        this.gfx.drawCircle(0, 0, this.size);
        this.gfx.position.x = this.x;
        this.gfx.position.y = this.y;
        this.gfx.endFill();
    }
    move(x,y){
        //console.log(this.gfx.position);
        this.x = x;
        this.y = y;
        this.gfx.position.x = this.x;
        this.gfx.position.y = this.y;
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
    let node = new Node(Math.floor(Math.random()*width),Math.floor(Math.random()*height),Math.random()*100,Math.random()*100+50);
    nodes.push(node);
}

//let node = new Node(100,100,0,0)



function tick(delta){
    //delta = 1 at optimal performance at 60fps
    //etime += delta*TIME_SCALE
    //console.log(delta);
    for (const pulse of pulses) {
        pulse.update()
    }
    for (const node of nodes) {
        node.detect()
    }
}



app.ticker.add(tick)

function windowResize(){
    width = window.innerWidth
    height = window.innerHeight
}

function lerp(start_value, end_value, pct)
{
    return (start_value + (end_value - start_value) * pct);
}

window.onresize = windowResize