(() => {
  enum BirdAnimation {
    WALKING = "walking",
    STOPPING = "stopping",
    FINDING = "finding"
  }
  const BACKGROUND_SIZE = {
    width: 1776,
    height: 1000,
    fixedY: 250
  }

  class Bird {
    private nextAnimation: BirdAnimation = null;
    private birdElement: HTMLElement;
    private imageElement: HTMLElement;
    private currentAnimation: BirdAnimation = BirdAnimation.STOPPING;
    private velocity = 0;
    private MAX_VELOCITY = 2;
    private position = {
      x: 0,
      y: 0
    }
    private destination = {
      x: 0,
      y: 0
    }
    private defaultPosition = {
      x: 0,
      y: 0
    }
    private area = {
      fixedY: 0,
      height: 0
    }

    constructor(birdElement: HTMLElement, imageElement: HTMLElement) {
      this.birdElement = birdElement;
      this.imageElement = imageElement;
      this.reset();
      imageElement.addEventListener("animationiteration", () => {
        if (this.nextAnimation != null) {
          this.switchAnimation(this.nextAnimation);
          this.nextAnimation = null;
        } else if (this.currentAnimation == BirdAnimation.FINDING) {
          this.switchAnimation(BirdAnimation.STOPPING);
        }
      });
      this.animationLoop();
    }

    reset() {
      this.birdElement.style.transform = "";
      this.destination = {
        x: 0, y: 0
      }
      this.position = {
        x: 0, y: 0
      }
      this.defaultPosition = {
        x: this.birdElement.offsetLeft + this.birdElement.offsetWidth / 2,
        y: this.birdElement.offsetTop + this.birdElement.offsetHeight / 2,
      }
      this.currentAnimation = BirdAnimation.STOPPING;
      this.nextAnimation = null;
      const fitToVertical = window.innerHeight / window.innerWidth >= BACKGROUND_SIZE.height / BACKGROUND_SIZE.width;
      const scale = fitToVertical
        ? window.innerHeight / BACKGROUND_SIZE.height
        : window.innerWidth / BACKGROUND_SIZE.width;
      this.area = {
        fixedY: fitToVertical
          ? scale * BACKGROUND_SIZE.fixedY
          : scale * BACKGROUND_SIZE.fixedY - (scale * BACKGROUND_SIZE.height - window.innerHeight) / 2,
        height: window.innerHeight
      }
      this.switchAnimation(BirdAnimation.STOPPING)
    }

    private animationLoop() {
      if (this.currentAnimation == BirdAnimation.WALKING) {
        this.moveOneFrame();
      }
      requestAnimationFrame(() => this.animationLoop());
    }

    private moveOneFrame() {
      this.velocity = this.velocity + (this.MAX_VELOCITY - this.velocity) / 50;
      this.position = this.nextCoordinate(this.position, this.destination, this.velocity);
      if (this.position.x == this.destination.x && this.position.y == this.destination.y) {
        this.velocity = 0;
        this.postAnimation(BirdAnimation.STOPPING);
      }
      const scale = Math.pow(2, this.position.y / 100)
      birdElement.style.transform = `translate(${this.position.x}px, ${this.position.y}px) scale(${scale}, ${scale})`
    }

    private distance(current: { x: number, y: number }, destination: { x: number, y: number }) {
      return ((destination.x - current.x) ** 2 + (destination.y - current.y) ** 2) ** (1 / 2)
    }

    private fixedVelocity(current: { x: number, y: number }, velocity: number) {
      return Math.pow(2, current.y / 100) * velocity;
    }

    private nextCoordinate(current: { x: number, y: number }, destination: { x: number, y: number }, velocity: number) {
      const ratio = this.fixedVelocity(current, velocity) / this.distance(current, destination);
      if (ratio >= 1) {
        return {
          x: destination.x,
          y: destination.y
        };
      }
      return {
        x: ratio * (destination.x - current.x) + current.x,
        y: ratio * (destination.y - current.y) + current.y
      }
    }

    walkTo(x: number, y: number) {
      this.destination.x = x - this.defaultPosition.x;
      this.destination.y = Math.max(y, this.area.fixedY) - this.defaultPosition.y;
      this.postAnimation(BirdAnimation.WALKING);
    }

    lost() {
      this.postAnimation(BirdAnimation.FINDING);
      this.velocity = 0;
    }

    private postAnimation(animation: BirdAnimation) {
      this.nextAnimation = animation;
    }

    private switchAnimation(animation: BirdAnimation) {
      this.clearAnimation();
      this.imageElement.classList.add(animation);
      this.currentAnimation = animation;
      if (animation == BirdAnimation.FINDING) {
        this.destination.x = this.position.x;
        this.destination.y = this.position.y;
      }
    }

    private clearAnimation() {
      for (let anim in BirdAnimation) {
        this.imageElement.classList.remove(BirdAnimation[anim]);
      }
    }
  }

  const birdElement = document.getElementById("bird");
  const imageElement = birdElement.querySelector("img.bird-image") as HTMLElement;

  const bird = new Bird(birdElement, imageElement);
  let walkable = true;

  document.body.addEventListener("mousemove", ev => {
    walkable && bird.walkTo(ev.x, ev.y);
  });

  document.body.addEventListener("mouseover", ev => {
    walkable = true;
  });
  document.body.addEventListener("mouseout", ev => {
    bird.lost();
    walkable = false;
  });

  document.body.addEventListener("touchstart", ev => {
    walkable = true;
  });
  document.body.addEventListener("touchmove", ev => {
    walkable && bird.walkTo(ev.touches[0].clientX, ev.touches[0].clientY);
  });
  document.body.addEventListener("touchend", ev => {
    bird.lost();
    walkable = false;
  });

  window.addEventListener("resize", () => {
    bird.reset();
  })
})();