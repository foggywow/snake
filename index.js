const cnv = document.querySelector('#canvas');
const ctx = cnv.getContext('2d');

class Snake {
  length = 1; // use for score
  isAlive = true; // if dead = false
  position = [ // every next peace of point will be pushed in this array
      [250, 250] //  [ [x, y], [x, y] ... ]
  ]
  direction = null
  move(direction) {
    if ( direction == 'up') this.moveUp()
    if ( direction == 'bottom') this.moveBottom()
    if ( direction == 'right') this.moveRight()
    if ( direction == 'left') this.moveLeft()
  }
  moveUp() {
    if( this.direction != 'bottom')
      this.direction = 'up';
  }
  moveBottom() {
    if( this.direction != 'up')
      this.direction = 'bottom';
  }
  moveRight() {
    if( this.direction != 'left')
      this.direction = 'right';
  }
  moveLeft() {
    if( this.direction != 'right')
      this.direction = 'left';
  }
  eat() {
    const last = this.position.length - 1; // copy last position
    this.position.push( [ this.position[last] ] );
    this.length += 1; // increase score
  }
  deathByItseft() {
    if( this.direction ) { // if snake is moving
      const head = this.position[0] // head of snake
      let pixel;
      if (this.direction == 'up')
        pixel = ctx.getImageData(head[0], head[1]-9, 500, 500).data // get the next pixel above the head
      else if (this.direction == 'bottom')
        pixel = ctx.getImageData(head[0], head[1]+9, 500, 500).data // get the next pixel below the head
      else if (this.direction == 'right')
        pixel = ctx.getImageData(head[0]+9, head[1], 500, 500).data // get the next pixel from right
      else if (this.direction == 'left')
        pixel = ctx.getImageData(head[0]-9, head[1], 500, 500).data // get the next pixel from left

      if( pixel[1] == 52 && pixel[1] == 52 && pixel[2] == 54 && pixel[3] == 255 ) {
        // the snake color rgb(52,52,54,255)
        // if head on this color - die
        this.die()
      }
    }
  }
  die() {
    this.isAlive = false;
  }
}
class Spawn {
  dot = [] // coordinates for next point
  //generate random coordinates
  randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
  }
  create() {
    this.dot = []; //clear last dot
    let random = this.randomInteger(0, cnv.width-15); //get random coordinates
    this.dot.push( random, random ) // save point
  }
  getDot() {
    return this.dot; //return point coord
  }
}

class Game {
  constructor() {
    this.snake = new Snake;
    this.spawner = new Spawn;
    this.spawner.create() // create new point on canvas
    this.gameActive = this.startGame(); // start render func
    this.paused = false; // if game paused
    //global key listener
    document.onkeypress = (e) => {
      if ( e.key == 'w' ) this.snake.move('up')
      if ( e.key == 's' ) this.snake.move('bottom')
      if ( e.key == 'd' ) this.snake.move('right')
      if ( e.key == 'a' ) this.snake.move('left')
      if ( e.code == 'Space' ) this.pause();
    }
  }
  startGame() {
    return setInterval( () => {
      ctx.clearRect(0,0, cnv.width, cnv.height ); // clear old canvas
      this.moveSnake();
      this.cornerTeleport() // if snake hit the corner
      this.render(); // render canvas
      this.snake.deathByItseft(); // if snake hit itself
    }, 1000/35)
  }
  pause() {
    if ( this.paused == false ) {
      this.paused = true // switch game status
      clearInterval( this.gameActive ) // stop main function
      // back screen
      const div = document.createElement('div');
      div.classList.add('hover')
      div.innerHTML = '<h1>PAUSED</h1>';
      document.querySelector('body').append(div)
    } else {
      this.paused = false
      this.gameActive = this.startGame() //start main function
      document.querySelector('.hover').remove() // remove black screen
    }
  }
  moveSnake() {
    const direction = this.snake.direction; // up || bottom || right || left
    const last = this.snake.position.length - 1 // snake tail
    const head = this.snake.position[0] // snake head

    if ( direction == 'up' ) {
      this.snake.position.unshift( [ head[0], head[1]-9] ) //add new block above the head
      this.snake.position.pop(); // remove tail
    } else if ( direction == 'bottom' ) {
      this.snake.position.unshift( [ head[0], head[1]+9] ) // 9 it's width and height of snake peace
      this.snake.position.pop();
    } else if ( direction == 'right' ) {
      this.snake.position.unshift( [ head[0]+9, head[1]] )
      this.snake.position.pop();
    } else if ( direction == 'left' ) {
      this.snake.position.unshift( [ head[0]-9, head[1]] )
      this.snake.position.pop();
    }
    // point hit logic
    if( this.spawner.getDot()[0] -  head[0]<= 13 //13 = width and height of point block
    && head[0] - this.spawner.getDot()[0] <= 13
    && this.spawner.getDot()[1]- head[1] <= 15 // not sure why 15 :D
    && head[1] - this.spawner.getDot()[1] <= 15) {
            this.spawner.create(); // create new point on canvas
            this.snake.eat() // feet the snake
    }
    // game over :(
    if( this.snake.isAlive != true )
      this.gameOver()
  }
  cornerTeleport() {
    const head = this.snake.position[0];
    if( head[1] < 0  ) { // if snake hit top corner
      this.snake.position[0][1] = 500 // teleport in bottom
    } else if( head[1] + 9 > 500  ) { // bottom corner
      this.snake.position[0][1] = 0 // to top
    } else if( head[0] + 9 > 500  ) { // right corner
      this.snake.position[0][0] = 0
    } else if( head[0] < 0  ) { // left corner
      this.snake.position[0][0] = 500
    }
  }
  render() {
    // render the snake
    for( let snakePos of this.snake.position ) { // all of it's peaces :)
      ctx.fillStyle = '#2d3436' // dark color
      ctx.fillRect( snakePos[0], snakePos[1], 9, 9)
    }
    let dot = this.spawner.getDot(); // and target
    ctx.fillStyle = '#a29bfe' // with cute color
    ctx.fillRect( dot[0], dot[1], 13, 13)
  }
  gameOver() {
    clearInterval( this.gameActive ); // stop rendering
    alert(`You DIED! Score: ${this.snake.length}`) // just alert, nothing special
  }
}
let game = new Game();
