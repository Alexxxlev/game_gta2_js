import { cosBetweenTwoPoints, sinBetweenTwoPoints } from "./utilities.js";
import { Particle } from "./particle.js"

export class Enemy {
  constructor(canvasWidth, canvasHeight, context, player) {
    this.context = context;
    this.player = player;

    this.radius = 15;
    const enemyType = Math.random() > 0.8 ? 2 : 1;
    this.health = enemyType;

    // появление врага слева или справа
    if (Math.random() < 0.5) {
      this.x = Math.random() < 0.5 ? 0 - this.radius : canvasWidth + this.radius;
      this.y = Math.random() * canvasHeight;
    } else {
      // появление врага сверху или снизу
      this.x = Math.random() * canvasWidth;
      this.y = Math.random() < 0.5 ? 0 - this.radius : canvasHeight + this.radius;
    }

    // создание картинки врага
    this.image = new Image();
    this.image.src = `./img/enemy_${enemyType}.png`;
    this.imageWidth = 50;
    this.imageHeight = 60;
    this.imageTick = 0;
  }

  drawImg() {
    const imageTickLimit = 18;
    const subX = this.imageTick > imageTickLimit ? this.imageWidth : 0;
    this.imageTick++;
    if ( this.imageTick > imageTickLimit * 2) this.imageTick = 0;

    // нарисовать картинку врага на конвасе
    this.context.drawImage(
      this.image,
      subX,
      0,
      this.imageWidth,
      this.imageHeight,
      // точка начала отрисовки картинки
      this.x - this.imageWidth/2,
      this.y - this.imageHeight/2,
      this.imageWidth,
      this.imageHeight
    );
  }

  draw() {
    this.context.save();
    let angle = Math.atan2(this.player.y - this.y, this.player.x - this.x);
    this.context.translate(this.x, this.y);
    this.context.rotate(angle + Math.PI/2);
    this.context.translate(-this.x, -this.y);
    this.drawImg();
    this.context.restore();
  }

  // менять позицию x,y врага
  update() {
    this.draw();
    this.velocity = {
      x: cosBetweenTwoPoints(this.player.x, this.player.y, this.x, this.y) * 2,
      y: sinBetweenTwoPoints(this.player.x, this.player.y, this.x, this.y) * 2,
    }
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  // создание 50 частиц взрыва(при убийстве противника)
  createExplosion(particles) {
    for (let i=0; i<50; i++) {
      particles.push(new Particle(
        this.x,
        this.y,
        this.context
      ));
    }
  }
}