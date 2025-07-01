let cvs = document.getElementById("mycanvas");
let ctx = cvs.getContext("2d");
let DEGREE = Math.PI / 180;
let frames = 0;
let sprite = new Image();
sprite.src = "img/sprite.png";

let SCORE = new Audio();
SCORE.src = "audio/score.wav";
let FLAP = new Audio();
FLAP.src = "audio/flap.wav";
let START = new Audio();
START.src = "audio/start.wav";
let DIE = new Audio();
DIE.src = "audio/die.wav";
let HIT = new Audio();
HIT.src = "audio/hit.wav";

let state ={
    current : 0,
    getReady : 0,
    game : 1,
    over : 2
}

function clickHandler(){
    switch (state.current) {
        case state.getReady:
            START.play();
            state.current = state.game;
            break;
        case state.game :
            FLAP.play()
            bird.flap();
            break;
        default:
            bird.speed = 0;
            bird.rotation = 0;
            pipes.position = [];
            score.value = 0;
            state.current = state.getReady;
            break;
    }
}
document.addEventListener("click", clickHandler)
document.addEventListener("keydown", function(e){
    if(e.which == 32){
        clickHandler();
    }
})

let backgrounnd = {
    sX: 0,
    sY: 0,
    w: 275,
    h: 226,
    x: 0,
    y: cvs.height - 226,
    draw : function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
    }
}

let forground = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    dx: 2,
    y: cvs.height - 112,
    draw : function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
    },
    update: function(){
        if(state.current == state.game){
            this.x = (this.x - this.dx) % (this.w/2)
        }
    }
}

const bird = {
    animation: [
        {sX: 276, sY: 112},
        {sX: 276, sY: 140},
        {sX: 276, sY: 165},
        {sX: 276, sY: 140}
    ],
    w: 34,
    h: 26,
    x: 50,
    y: 150,
    speed: 0,
    gravity: 0.20,
    animationIndex: 0,
    rotation: 0,
    jump: 4,
    radius: 12,
    draw: function(){
        let bird = this.animation[this.animationIndex]
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, - this.w/2, - this.h/2, this.w, this.h)
        ctx.restore()
    },
    update: function(){
        let period = state.current == state.getReady ? 10 : 5;
        this.animationIndex += frames % period == 0 ? 1 : 0;
        this.animationIndex = this.animationIndex % 4
        if(state.current == state.getReady){
            this.y = 150;
        }else{
            this.speed += this.gravity;
            this.y += this.speed;
            if(this.speed < this.jump){
                this.rotation = -15 * DEGREE;
            }else{
                this.rotation = 45 * DEGREE;
            }
        }
        if(this.y + this.h/2 >= cvs.height - forground.h){
            this.y = cvs.height - forground.h - this.h/2;
            this.animationIndex = 1;
            if(state.current == state.game){
                state.current = state.over;
                DIE.play();
            }
        }
    },
    flap: function(){
        this.speed = - this.jump
    }
}

let pipes ={
    top: {
        sX: 553,
        sY: 0,
    },
    bottom: {
        sX: 502,
        sY: 0,
    },
    w: 53,
    h: 400,
    dx: 2,
    gap: 80,
    position: [],
    maxYPos: -150,
    draw: function(){
        for(let i =0; i < this.position.length; i++){
            let p = this.position[i]

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h)
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h)
        }
    },
    update: function(){
        if(state.current != state.game) return;
        if(frames % 100 == 0){
            this.position.push({
                x: cvs.width,
                y: this.maxYPos * (Math.random() + 1)
            })
        }
        for(let i=0; i < this.position.length; i++){
            let p = this.position[i]
            p.x -= this.dx

            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x +this.w && bird.y + bird.radius > p.y
                && bird.y - bird.radius < p.y + this.h){
                    HIT.play();
                    DIE.play();
                    state.current = state.over;
            }
            let bottomPipesPos = p.y + this.h + this.gap;
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x +this.w && bird.y + bird.radius > bottomPipesPos
                && bird.y - bird.radius < bottomPipesPos + this.h){
                    HIT.play();
                    DIE.play();
                    state.current = state.over;
            }

            if(p.x + this.w <= 0){
                this.position.shift()
                score.value += 1;
                SCORE.play();
                score.best = Math.max(score.value, score.best)
                localStorage.setItem("best", score.best)
            }
        }
    }
}

let getReady = {
    sX: 0,
    sY: 228,
    w: 173,
    h: 152,
    x: cvs.width/2 - 173/2,
    y: 80,
    draw: function(){
        if(state.current == state.getReady){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        }
    }
}

let gameOver = {
    sX: 175,
    sY: 228,
    w: 225,
    h: 202,
    x: cvs.width/2 - 225/2,
    y: 90,
    draw: function(){
        if(state.current == state.over){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        }
    }
}

let score ={
    best: parseInt(localStorage.getItem("best")) || 0,
    value: 0,
    draw: function(){
        ctx.fillStyle = "#FFF"
        ctx.strokeStyle = "#000"
        if(state.current == state.game){
            ctx.lineWidth = 2;
            ctx.font = "35px IMPACT";

            ctx.fillText(this.value, cvs.width/2, 50)
            ctx.strokeText(this.value, cvs.width/2, 50)
        }else if(state.current == state.over){
            ctx.lineWidth = 2;
            ctx.font = "30px IMPACT";

            ctx.fillText(this.value,225,190)
            ctx.strokeText(this.value,225,190)

            ctx.fillText(this.best, 225, 235)
            ctx.strokeText(this.best, 225, 235)
        }
    }
}

function update(){
    bird.update()
    forground.update()
    pipes.update()
}

function draw(){
    ctx.fillStyle = "#70c5ce"
    ctx.fillRect(0, 0, cvs.width, cvs.height)
    backgrounnd.draw()
    pipes.draw()
    forground.draw()
    bird.draw()
    getReady.draw()
    gameOver.draw()
    score.draw()
}

function animate(){
    update()
    draw()
    frames ++;
    requestAnimationFrame(animate)
}

animate()