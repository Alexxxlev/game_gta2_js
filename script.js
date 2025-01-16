import { Player } from "./player.js";
import { Projectile } from "./projectile.js";
import { Enemy } from "./enemy.js";
import { distanceBetweenTwoPoints } from "./utilities.js";

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;

const wastedElement = document.querySelector('.wasted');
const scoreElement = document.querySelector('#score');

let player;
let projectiles = [];
let enemies = [];
let particles = [];
let score = 0;
let animationId;
let spawnIntervalId;
let countIntervalId;

startGame();

function startGame() {
  init();
  animate();
  spawnEnemies();
}

function init() {
  // ограничение игрового поля
  const movementLimits = {
  minX: 0,
  maxX: canvas.width,
  minY: 0,
  maxY: canvas.height,
  };
  // создание персонажа и расположение посередине экрана
  player = new Player(canvas.width/2, canvas.height/2, context, movementLimits);
  addEventListener("click", createProjectile);
}

// стрельба персонажа
function createProjectile(event) {
  projectiles.push(
    new Projectile(
      // координаты выстрела
      player.x,
      player.y,
      // координаты цели(совпадают с местом клика)
      event.clientX,
      event.clientY,
      context
    )
  );
}

// добавление врагов
function spawnEnemies() {
  // количество появляющихся врагов(со временем растет)
  let countOfSpawnEnemies = 1;

  // каждые 30сек увеличивать значение появления врагов
  countIntervalId = setInterval(() => countOfSpawnEnemies++, 30000);
  spawnIntervalId = setInterval(() => spawnCountEnemies(countOfSpawnEnemies), 1000);
  spawnCountEnemies(countOfSpawnEnemies);
}

// создает нужное кол-во врагов
function spawnCountEnemies(count) {
  for (let i=0; i<count; i++) {
    enemies.push(new Enemy(canvas.width, canvas.height, context, player));
  }
}

// создать цикл отрисовки анимации
function animate() {
  animationId = requestAnimationFrame(animate);
  // полностью отчищать конвас перед новой отрисовкой
  context.clearRect(0, 0, canvas.width, canvas.height);

  // удалять из массива все частицы которые стали прозрачными
  particles = particles.filter(particle => particle.alpha > 0);
  // когда снаряд вылетает за границы экрана, то больше его не рисовать
  projectiles = projectiles.filter(projectileInsideWindow);
  // логика попадания снаряда во врага
  enemies.forEach(enemy => checkHittingEnemy(enemy));
  // убрать с экрана убитого врага
  enemies = enemies.filter(enemy => enemy.health > 0);
  // проверка не коснулся ли кто то персонажа(конец игры)
  const isGameOver = enemies.some(checkHittingPlayer);
  // если враг коснулся то останавливаем анимацию
  if (isGameOver) {
    wastedElement.style.display = 'block';
    clearInterval(countIntervalId);
    clearInterval(spawnIntervalId);
    cancelAnimationFrame(animationId);
  }

  // добавить отрисовку частиц взрыва в коде
  particles.forEach(particle => particle.update());
  // добавить отрисовку снаряда в коде
  projectiles.forEach(projectile => projectile.update());
  // добавить отрисовку персонажа в коде
  player.update();
  // добавить отрисовку врагов
  enemies.forEach(enemy => enemy.update());
}

// функция проверки не коснулся ли кто то персонажа
function checkHittingPlayer(enemy) {
  const distance = distanceBetweenTwoPoints(player.x, player.y, enemy.x, enemy.y);
  return distance - enemy.radius - player.radius < 0;
}

// функция проверки вышел ли снаряд за границы экрана
function projectileInsideWindow(projectile) {
  return projectile.x + projectile.radius > 0 &&
    projectile.x - projectile.radius < canvas.width &&
    projectile.y + projectile.radius > 0 &&
    projectile.y - projectile.radius < canvas.height;
}

// найти один любой снаряд который коснулся врага
function checkHittingEnemy(enemy) {
  projectiles.some((projectile, index) => {
    // рассчитать расстояние между врагом и снарядом
    const distance = distanceBetweenTwoPoints(projectile.x, projectile.y, enemy.x, enemy.y);
    // если расстояние больше чем радиус снаряда и радиус врага(не попали во врага)
    if (distance - enemy.radius - projectile.radius > 0) return false;

    // в случае попадения снаряда во врага удалить снаряд из массива снарядов
    removeProjectileByIndex(index);
    // уменьшение жизни у врага
    enemy.health--;

    // добавление кровавого взрыва убитому врагу
    if (enemy.health < 1) {
      // увеличение очков при убийстве врага
      increaseScore();
      enemy.createExplosion(particles);
    }

    return true;
  });
}

// функция удаляет один элемент индекса из массива снарядов
function removeProjectileByIndex(index) {
  projectiles.splice(index, 1);
}

// увеличивать кол-во очков на 250 за каждого убитого врага
function increaseScore() {
  score += 250;
  scoreElement.innerHTML = score;
}