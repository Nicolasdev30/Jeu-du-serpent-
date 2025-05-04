window.onload = function () {
    const canvasWidth = 900;
    const canvasHeight = 600;
    const blockSize = 30;
    let ctx;
    const delay = 100;
    let snake;
    let apple;
    const widthInBlocks = canvasWidth / blockSize;
    const heightInBlocks = canvasHeight / blockSize;
    let score;
    let timeout;

    function init() {
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "30px solid gray";
        canvas.style.margin = "50px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#ddd";
        document.body.appendChild(canvas);
        ctx = canvas.getContext("2d");

        snake = new Snake([[6, 4], [5, 4], [4, 4], [3, 4], [2, 4]], "right");
        apple = new Apple([10, 10]);
        score = 0;
        refreshCanvas();
    }

    function refreshCanvas() {
        snake.advance();
        if (snake.checkCollision()) {
            gameOver();
        } else {
            if (snake.eatingApple(apple)) {
                score++;
                snake.ateApple = true;
                do {
                    apple.setNewPosition();
                } while (apple.isOnSnake(snake));
            }
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            drawScore();
            snake.draw();
            apple.draw();
            timeout = setTimeout(refreshCanvas, delay);
        }
    }

    function gameOver() {
        ctx.save();
        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        ctx.strokeText("Game Over", centerX, centerY - 180);
        ctx.fillText("Game Over", centerX, centerY - 180);
        ctx.fillText("Press SPACE to restart", centerX, centerY);
        ctx.strokeText("Press SPACE to restart", centerX, centerY);
        ctx.restore();
    }

    function restart() {
        snake = new Snake([[6, 4], [5, 4], [4, 4], [3, 4], [2, 4]], "right");
        apple = new Apple([10, 10]);
        score = 0;
        clearTimeout(timeout);
        refreshCanvas();
    }

    function drawScore() {
        ctx.save();
        ctx.font = "bold 200px sans-serif";
        ctx.fillStyle = "gray";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        ctx.fillText(score.toString(), centerX, centerY);
        ctx.restore();
    }

    function drawBlock(ctx, position) {
        const x = position[0] * blockSize;
        const y = position[1] * blockSize;
        ctx.fillRect(x, y, blockSize, blockSize);
    }

    class Snake {
        constructor(body, direction) {
            this.body = body;
            this.direction = direction;
            this.ateApple = false;
        }

        draw() {
            ctx.save();
            ctx.fillStyle = "#FF0000";
            this.body.forEach(block => drawBlock(ctx, block));
            ctx.restore();
        }

        advance() {
            const nextPosition = this.body[0].slice();
            switch (this.direction) {
                case "left":
                    nextPosition[0]--;
                    break;
                case "right":
                    nextPosition[0]++;
                    break;
                case "down":
                    nextPosition[1]++;
                    break;
                case "up":
                    nextPosition[1]--;
                    break;
                default:
                    throw new Error("Invalid direction");
            }
            this.body.unshift(nextPosition);
            if (!this.ateApple) {
                this.body.pop();
            } else {
                this.ateApple = false;
            }
        }

        setDirection(newDirection) {
            const allowedDirections = {
                left: ["up", "down"],
                right: ["up", "down"],
                up: ["left", "right"],
                down: ["left", "right"]
            };
            if (allowedDirections[this.direction].includes(newDirection)) {
                this.direction = newDirection;
            }
        }

        checkCollision() {
            const head = this.body[0];
            const rest = this.body.slice(1);
            const [snakeX, snakeY] = head;

            const hitWall = snakeX < 0 || snakeX >= widthInBlocks || snakeY < 0 || snakeY >= heightInBlocks;
            const hitSelf = rest.some(block => block[0] === snakeX && block[1] === snakeY);

            return hitWall || hitSelf;
        }

        eatingApple(apple) {
            const [headX, headY] = this.body[0];
            return headX === apple.position[0] && headY === apple.position[1];
        }
    }

    class Apple {
        constructor(position) {
            this.position = position;
        }

        setNewPosition() {
            const newX = Math.floor(Math.random() * widthInBlocks);
            const newY = Math.floor(Math.random() * heightInBlocks);
            this.position = [newX, newY];
        }

        isOnSnake(snake) {
            return snake.body.some(block => block[0] === this.position[0] && block[1] === this.position[1]);
        }

        draw() {
            ctx.save();
            ctx.fillStyle = "#33cc33";
            ctx.beginPath();
            const radius = blockSize / 2;
            const x = this.position[0] * blockSize + radius;
            const y = this.position[1] * blockSize + radius;
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        }
    }

    document.onkeydown = function (e) {
        e.preventDefault(); // Évite le défilement de la page avec les flèches
        let newDirection;
        switch (e.key) {
            case "ArrowLeft":
                newDirection = "left";
                break;
            case "ArrowUp":
                newDirection = "up";
                break;
            case "ArrowRight":
                newDirection = "right";
                break;
            case "ArrowDown":
                newDirection = "down";
                break;
            case " ":
                restart();
                return;
            default:
                return;
        }
        snake.setDirection(newDirection);
    };

    init();
};