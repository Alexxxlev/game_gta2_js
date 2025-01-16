const MOVE_UP_KEY_CODES = ["ArrowUp", "KeyW"];
const MOVE_DOWN_KEY_CODES = ["ArrowDown", "KeyS"];
const MOVE_LEFT_KEY_CODES = ["ArrowLeft", "KeyA"];
const MOVE_RIGHT_KEY_CODES = ["ArrowRight", "KeyD"];
const ALL_MOVE_KEY_CODES = [...MOVE_UP_KEY_CODES, ...MOVE_DOWN_KEY_CODES, ...MOVE_LEFT_KEY_CODES, ...MOVE_RIGHT_KEY_CODES];

export class Player {
  constructor(x, y, context, movementLimits) {
    // скорость перемещения
    this.velocity = 3;
    this.radius = 15;

    this.x = x;
    this.y = y;
    this.context = context;
    this.cursorPosition = {
      x: 0,
      y: 0
    };
    this.movementLimits = {
      minX: movementLimits.minX + this.radius,
      maxX: movementLimits.maxX - this.radius,
      minY: movementLimits.minY + this.radius,
      maxY: movementLimits.maxY - this.radius,
    }

    // обработчик на каждое перемещение курсора
    document.addEventListener("mousemove", event => {
      this.cursorPosition.x = event.clientX;
      this.cursorPosition.y = event.clientY;
    });

    // объект хранит нажатые клавиши(нужно чтоб персонаж мог одновременно перемещаться в 2 стороны)
    this.keyMap = new Map();
    // событие нажатия клавииши
    document.addEventListener("keydown", event => this.keyMap.set(event.code, true));
    // событие отпускания клавииши
    document.addEventListener("keyup", event => this.keyMap.delete(event.code));

    this.image = new Image();
    this.image.src = "./img/player.png";
    this.imageWidth = 50;
    this.imageHeight = 60;
    // рисовать неподвижного персонажа
    this.isMoving = false;
    // считать количество смены кадров между смены картинок для анимации движения ног
    this.imageTick = 0;
  }

  // метод отрисовки персонажа
  drawImg() {
    // каждые 18 кадров менять картинку положения ног
    const imageTickLimit = 18;
    // позиция начала картинки
    let subX = 0;
    // если персонаж не двигается
    if (!this.isMoving) {
      subX = 0;
      this.imageTick = 0;
    } else {
      subX = this.imageTick > imageTickLimit ? this.imageWidth * 2 : this.imageWidth;
      this.imageTick++;
    }
    // если imageTick больше 2х лимитов
    if (this.imageTick > imageTickLimit*2) {
      this.imageTick = 0;
    }

    this.context.drawImage(
      this.image,
      subX,
      0,
      this.imageWidth,
      this.imageHeight,
      this.x - this.imageWidth/2,
      this.y - this.imageHeight/2,
      this.imageWidth,
      this.imageHeight
    );
  }

  // метод отрисовки персонажа под нужным углом чтоб персонаж всегда смотрел на курсор
  draw() {
    // сохранить текущее состояние конваса чтоб потом вернуться к нему
    this.context.save();
    // высчитать угол между персонажем и курсором
    let angle = Math.atan2(this.cursorPosition.y - this.y, this.cursorPosition.x - this.x);
    this.context.translate(this.x, this.y);
    this.context.rotate(angle + Math.PI/2);
    this.context.translate(-this.x, -this.y);
    this.drawImg();
    // вернуть конвас в исходное состояние
    this.context.restore();
  }

  // внутри метода рисовать персонажа а после этого менять его координаты для следующей отрисовки
  update() {
    this.draw();
    this.isMoving = this.shouldMove(ALL_MOVE_KEY_CODES);
    this.updatePosition();
    this.checkPositionLimitAndUpdate();
  }

  // метод для проверки нажатия клавиш перемещения
  updatePosition() {
    if (this.shouldMove(MOVE_UP_KEY_CODES)) this.y -= this.velocity;
    if (this.shouldMove(MOVE_DOWN_KEY_CODES)) this.y += this.velocity;
    if (this.shouldMove(MOVE_LEFT_KEY_CODES)) this.x -= this.velocity;
    if (this.shouldMove(MOVE_RIGHT_KEY_CODES)) this.x += this.velocity;
  }

  // метод проверки координат персонажа не вышел ли он за границы
  checkPositionLimitAndUpdate() {
    if (this.y < this.movementLimits.minY) this.y = this.movementLimits.minY;
    if (this.y > this.movementLimits.maxY) this.y = this.movementLimits.maxY;
    if (this.x < this.movementLimits.minX) this.x = this.movementLimits.minX;
    if (this.x > this.movementLimits.maxX) this.x = this.movementLimits.maxX;
  }

  // метод принимает массив с кодом клавиш
  shouldMove(keys) {
    return keys.some(key => this.keyMap.get(key));
  }
}