(function () {
    var BirdAnimation;
    (function (BirdAnimation) {
        BirdAnimation["WALKING"] = "walking";
        BirdAnimation["STOPPING"] = "stopping";
        BirdAnimation["FINDING"] = "finding";
    })(BirdAnimation || (BirdAnimation = {}));
    var BACKGROUND_SIZE = {
        width: 1776,
        height: 1000,
        fixedY: 250
    };
    var Bird = /** @class */ (function () {
        function Bird(birdElement, imageElement) {
            var _this = this;
            this.nextAnimation = null;
            this.currentAnimation = BirdAnimation.STOPPING;
            this.velocity = 0;
            this.MAX_VELOCITY = 2;
            this.position = {
                x: 0,
                y: 0
            };
            this.destination = {
                x: 0,
                y: 0
            };
            this.defaultPosition = {
                x: 0,
                y: 0
            };
            this.area = {
                fixedY: 0,
                height: 0
            };
            this.birdElement = birdElement;
            this.imageElement = imageElement;
            this.reset();
            imageElement.addEventListener("animationiteration", function () {
                if (_this.nextAnimation != null) {
                    _this.switchAnimation(_this.nextAnimation);
                    _this.nextAnimation = null;
                }
                else if (_this.currentAnimation == BirdAnimation.FINDING) {
                    _this.switchAnimation(BirdAnimation.STOPPING);
                }
            });
            this.animationLoop();
        }
        Bird.prototype.reset = function () {
            this.birdElement.style.transform = "";
            this.destination = {
                x: 0, y: 0
            };
            this.position = {
                x: 0, y: 0
            };
            this.defaultPosition = {
                x: this.birdElement.offsetLeft + this.birdElement.offsetWidth / 2,
                y: this.birdElement.offsetTop + this.birdElement.offsetHeight / 2
            };
            this.currentAnimation = BirdAnimation.STOPPING;
            this.nextAnimation = null;
            var fitToVertical = window.innerHeight / window.innerWidth >= BACKGROUND_SIZE.height / BACKGROUND_SIZE.width;
            var scale = fitToVertical
                ? window.innerHeight / BACKGROUND_SIZE.height
                : window.innerWidth / BACKGROUND_SIZE.width;
            this.area = {
                fixedY: fitToVertical
                    ? scale * BACKGROUND_SIZE.fixedY
                    : scale * BACKGROUND_SIZE.fixedY - (scale * BACKGROUND_SIZE.height - window.innerHeight) / 2,
                height: window.innerHeight
            };
            this.switchAnimation(BirdAnimation.STOPPING);
        };
        Bird.prototype.animationLoop = function () {
            var _this = this;
            if (this.currentAnimation == BirdAnimation.WALKING) {
                this.moveOneFrame();
            }
            requestAnimationFrame(function () { return _this.animationLoop(); });
        };
        Bird.prototype.moveOneFrame = function () {
            this.velocity = this.velocity + (this.MAX_VELOCITY - this.velocity) / 50;
            this.position = this.nextCoordinate(this.position, this.destination, this.velocity);
            if (this.position.x == this.destination.x && this.position.y == this.destination.y) {
                this.velocity = 0;
                this.postAnimation(BirdAnimation.STOPPING);
            }
            var scale = Math.pow(2, this.position.y / 100);
            birdElement.style.transform = "translate(" + this.position.x + "px, " + this.position.y + "px) scale(" + scale + ", " + scale + ")";
        };
        Bird.prototype.distance = function (current, destination) {
            return Math.pow((Math.pow((destination.x - current.x), 2) + Math.pow((destination.y - current.y), 2)), (1 / 2));
        };
        Bird.prototype.fixedVelocity = function (current, velocity) {
            return Math.pow(2, current.y / 100) * velocity;
        };
        Bird.prototype.nextCoordinate = function (current, destination, velocity) {
            var ratio = this.fixedVelocity(current, velocity) / this.distance(current, destination);
            if (ratio >= 1) {
                return {
                    x: destination.x,
                    y: destination.y
                };
            }
            return {
                x: ratio * (destination.x - current.x) + current.x,
                y: ratio * (destination.y - current.y) + current.y
            };
        };
        Bird.prototype.walkTo = function (x, y) {
            this.destination.x = x - this.defaultPosition.x;
            this.destination.y = Math.max(y, this.area.fixedY) - this.defaultPosition.y;
            this.postAnimation(BirdAnimation.WALKING);
        };
        Bird.prototype.lost = function () {
            this.postAnimation(BirdAnimation.FINDING);
            this.velocity = 0;
        };
        Bird.prototype.postAnimation = function (animation) {
            this.nextAnimation = animation;
        };
        Bird.prototype.switchAnimation = function (animation) {
            this.clearAnimation();
            this.imageElement.classList.add(animation);
            this.currentAnimation = animation;
            if (animation == BirdAnimation.FINDING) {
                this.destination.x = this.position.x;
                this.destination.y = this.position.y;
            }
        };
        Bird.prototype.clearAnimation = function () {
            for (var anim in BirdAnimation) {
                this.imageElement.classList.remove(BirdAnimation[anim]);
            }
        };
        return Bird;
    }());
    var birdElement = document.getElementById("bird");
    var imageElement = birdElement.querySelector("img.bird-image");
    var bird = new Bird(birdElement, imageElement);
    var walkable = true;
    document.body.addEventListener("mousemove", function (ev) {
        walkable && bird.walkTo(ev.x, ev.y);
    });
    document.body.addEventListener("mouseover", function (ev) {
        walkable = true;
    });
    document.body.addEventListener("mouseout", function (ev) {
        bird.lost();
        walkable = false;
    });
    document.body.addEventListener("touchstart", function (ev) {
        walkable = true;
    });
    document.body.addEventListener("touchmove", function (ev) {
        walkable && bird.walkTo(ev.touches[0].clientX, ev.touches[0].clientY);
    });
    document.body.addEventListener("touchend", function (ev) {
        bird.lost();
        walkable = false;
    });
    window.addEventListener("resize", function () {
        bird.reset();
    });
})();
