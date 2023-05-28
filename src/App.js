import './App.css';
import { useRef } from 'react';

const App = () => {
  const normalizeToGrid = (n) => {
    return Math.floor(n / cellSize) * cellSize
  }

  let muted = false;
  const inited = false;

  let speedInput = 50;
  let sizeInput = 50;
  const mapping = {speed: [250, 200, 100, 50, 25, 10], size: [1, 2, 5, 10, 20, 30, 40, 50]}

  let speed, cellSize, x,y, snake;
  const canvas = {h: 512, w:1080, el: useRef()};
  let ctx, interval;
  let directionMapping = {right: [1, 0], left: [-1, 0], down: [0, 1], up: [0, -1]}
  let direction = directionMapping.right;
  let frameDirection = direction;
  let fruits = [];
  let started = false;
  let snakeSize = 0;

  const check = (arr, n, m) => {
    for (let item of arr) {
      if (item[0] === n && item[1] === m) {
        return true;
      }
    }
    return false;
  }

  const mapMapping = (value, mapping) => {
    return mapping[Math.round(value / 100 * (mapping.length-1))];
  }

  const init = (e) => {
    if (!inited) {
      speed = mapMapping(speedInput, mapping.speed);
      cellSize = mapMapping(sizeInput, mapping.size);
      x = cellSize*2;
      y = normalizeToGrid(canvas.h / 2);
      snake = [[x,y]];
      e.target.parentElement.style.display = 'none';
      e.target.parentElement.parentElement.firstChild.style.display  = 'none';
      canvas.el.current.style.display = 'block';
      canvas.el.current.focus();
      ctx = canvas.el.current.getContext('2d');
      ctx.fillStyle = 'lime'
      ctx.strokeStyle = 'green';
      fruits.push([normalizeToGrid(canvas.w / 2), normalizeToGrid(canvas.h / 2)]);
      displayFruit();
      
      
      ctx.beginPath();
      ctx.fillRect(x, y, cellSize, cellSize);
      ctx.strokeRect(x+1, y+1, cellSize-2, cellSize-2);
    }
  }

  const start = () => {
    started = true;
    interval = setInterval(getFrame, speed, ctx);
  }
  
  const handlePress = (e) => {
    if (!started) {
      start();
    }
    if (!e.key.startsWith('Arrow')) {
      return;
    }
    let tmp = directionMapping[e.key.slice(5).toLowerCase()];
    if (tmp[0] * -1 === frameDirection[0] && tmp[1] * -1 === frameDirection[1]) {
      return;
    }
    if (!muted) {
      (new Audio('/assets/audio/moving.mp3')).play();
    }
    direction = tmp;
  }

  const displayFruit = () => {
    ctx.fillStyle = 'red';
    ctx.fillRect(fruits[0][0], fruits[0][1], cellSize, cellSize);
    ctx.fillStyle = 'lime';
  }

  const randomFruit = () => {
    let [a,b] = [normalizeToGrid(Math.random() * canvas.w), normalizeToGrid(Math.random() * canvas.h)];
    if (check(snake, a, b)) {
      return randomFruit();
    }
    else {
      return [a,b];
    }
  }

  const getFrame = () => {
    let fruit = check(fruits, x, y);
    if (fruit) {
      snakeSize++;
      (new Audio('/assets/audio/eating.mp3')).play();
      fruits = [randomFruit()];
      displayFruit();
    }
    else {
      ctx.clearRect(snake[0][0], snake[0][1], cellSize, cellSize);
      snake = snake.slice(1);
    }
    ctx.beginPath();
    ctx.fillRect(x, y, cellSize, cellSize);
    ctx.strokeRect(x+1, y+1, cellSize-2, cellSize-2);
    let folding = check(snake, x, y);
    if (folding) {
      gameOver();
    }
    snake.push([x,y]);
    if (x > canvas.w || x<0 || y<0 || y>canvas.h) {
      gameOver();
    }
    x+=parseInt(cellSize * direction[0]);
    y+=parseInt(cellSize * direction[1]);
    frameDirection = direction;
  }

  const gameOver = () => {
    (new Audio('/assets/audio/dying.mp3')).play();
    muted = true;
    clearInterval(interval);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.w, canvas.h);
    window.location.replace(`/?died=${snakeSize}`)
  };

  const urlParams = new URLSearchParams(window.location.search);
  const died = urlParams.get('died');


  return <>
    {died ? <div className='death-message'>
        YOU DIED | SCORE: {died}
    </div> : <></>}
    <div className='start-screen'>
      <div className='text'>Snake</div>
      <input type="range" name="size" id="size" className='styled-slider' onChange={(e) => {sizeInput = e.target.value}}/>
      <button className='btn' onClick={init}>PLAY</button>
      <input type="range" name="speed" id="speed" className='styled-slider' onChange={(e) => {speedInput = e.target.value}}/>
      <div className='btn-underlay'></div>
      <div className='btn-fruit'></div>
    </div>
    <canvas id="snake" 
            tabIndex="1"
            ref={canvas.el}
            onKeyDown={handlePress}
            height={canvas.h} 
            width={canvas.w}
            style={{display: 'none'}} >
    </canvas>
  </>
}

export default App;
