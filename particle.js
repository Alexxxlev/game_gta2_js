export class Particle {
  constructor(x, y, context) {
    this.x =x;
    this.y = y;
    this.context = context;
    this.radius = Math.random() + 2;
    this.color = "#920101";
    this.velocity = {
      // частита должна лететь в случайную сторону с случайной скоростью
      x: (Math.random() - 0.5) * Math.random() * 5,
      y: (Math.random() - 0.5) * Math.random() * 5,
    }
    // частица кадр за кадров становилась более прозрачной
    this.alpha = 1;
    // сопротивление для более реалистичного взрыва противника
    this.friction = 0.99;
  }

  draw() {
    this.context.save();
    this.context.globalAlpha = this.alpha;
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    this.context.fillStyle = this.color;
    this.context.fill();
    this.context.restore();
  }

  // менять позицию частицы по x,y на соответствующую скорость
  update() {
    this.draw();
    // менять скорость умножая ее на значение сопротивления(с каждым кадров скорость частиц будет всё меньше и меньше)
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.04;
  }
}