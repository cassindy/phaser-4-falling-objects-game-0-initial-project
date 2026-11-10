import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';

export class GameScene extends Phaser.Scene {
  /** @type {Phaser.Types.Input.Keyboard.CursorKeys | undefined} */
  #cursorKey;
  /** @type {Phaser.GameObjects.Image | undefined} */
  #player;
  /** @type {integer | undefined} */
  #playerSpeed;
  /** @type {integer | undefined} */
  #fallingSpeed;
  /** @type {string[] | undefined} */
  #fallingObjectFrames;
  #fallingObjects;

  init() {
    this.#playerSpeed = 500;
    this.#fallingSpeed = 100;
  }

  constructor() {
    super({
      key: SCENE_KEYS.GAME_SCENE,
    });
  }

  /**
   * @public
   * Tied to the Phaser Scene lifecycle. Will run one time after the PRELOAD
   * logic is finished. Runs each time the Phaser Scene restarts.
   * @returns {void}
   */
  create() {
    const { width, height } = this.scale;

    // add game background
    //this.add.image(this.scale.width / 2, this.scale.height / 2, ASSET_KEYS.BACKGROUND);
    this.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND);

    this.#player = this.add.image(width / 2, height, ASSET_KEYS.JAR).setDepth(1);

    this.#cursorKey = this.input.keyboard?.createCursorKeys();

    this.#fallingObjectFrames = Object.keys(this.textures.get(ASSET_KEYS.OBJECTS).frames).filter(
      (name) => name !== '__BASE',
    );
    this.#fallingObjects = [];

    // this.add.image(width / 2, height / 2, ASSET_KEYS.OBJECTS, 'button1.png').setScale(0.5);
    // this.#spawnFallingObjects();

    this.time.addEvent({
      delay: 1000,
      callback: this.#spawnFallingObjects,
      callbackScope: this,
      loop: true,
    });
  }

  update(time, delta) {
    if (this.#player && this.#playerSpeed && this.#fallingSpeed) {
      const moveStep = this.#playerSpeed * (delta / 1000);

      if (this.#cursorKey?.right.isDown) {
        this.#player.x += moveStep;
      }
      if (this.#cursorKey?.left.isDown) {
        this.#player.x -= moveStep;
      }
      if (this.#player.x < this.#player.displayWidth / 2) {
        this.#player.x = this.#player.displayWidth / 2;
      }
      if (this.#player.x > this.scale.width - this.#player.displayWidth / 2) {
        this.#player.x = this.scale.width - this.#player.displayWidth / 2;
      }

      //falling
      for (let index = this.#fallingObjects.length - 1; index >= 0; index--) {
        const element = this.#fallingObjects[index];
        element.y += this.#fallingSpeed * (delta / 1000);

        const overlapPoints = Phaser.Geom.Intersects.GetRectangleToRectangle(
          this.#player.getBounds(),
          element.getBound(),
        );
        // console.log(overlapPoints);

        if (element.y > this.scale.height + element.height) {
          element.destroy();
          this.#fallingObjects.splice(element, 1);
        }
      }
    }
  }

  #spawnFallingObjects() {
    const randomFrame = Phaser.Utils.Array.GetRandom(this.#fallingObjectFrames);
    const obj = this.add
      .image(Phaser.Math.RND.between(50, this.scale.width - 50), 0, ASSET_KEYS.OBJECTS, randomFrame)
      .setScale(0.85);
    this.#fallingObjects.push(obj);
  }
}
