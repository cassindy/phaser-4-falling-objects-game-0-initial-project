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
  #fallingObjectFrames;

  init() {
    this.#playerSpeed = 500;
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

    this.#player = this.add.image(width / 2, height, ASSET_KEYS.JAR);

    // this.add.image(width / 2, height / 2, ASSET_KEYS.OBJECTS, 'button1.png').setScale(0.5);
    this.#spawnFallingObjects();

    this.#cursorKey = this.input.keyboard?.createCursorKeys();

    console.log(this.textures.get(ASSET_KEYS.OBJECTS));
  }

  update(time, delta) {
    if (this.#player && this.#playerSpeed) {
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
    }
  }

  #spawnFallingObjects() {
    const { width, height } = this.scale;
    this.add.image(Phaser.Math.RND.between(50, width - 50), 0, ASSET_KEYS.OBJECTS, 'button1.png').setScale(0.85);
  }
}
