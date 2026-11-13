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
  /** @type {Phaser.GameObjects.Image[] | undefined} */
  #fallingObjects;
  /** @type {integer | undefined} */
  #fallingObjectsCount;
  /** @type {Phaser.GameObjects.Text | undefined} */
  #fallingObjectsCountText;
  /** @type {integer | undefined} */
  #score;
  /** @type {Phaser.GameObjects.Text | undefined} */
  #scoreText;
  /** @type {integer | undefined} */
  #playerLifeCount = 3;
  /** @type {Phaser.GameObjects.Image | undefined} */
  #playerLifeHeartIcon;
  /** @type {{x:number,y:number}} */
  #UiStartPoint = { x: 50, y: 50 };

  init() {
    this.#playerSpeed = 500;
    this.#fallingSpeed = 300;
    this.#score = 0;
    this.#fallingObjectsCount = 0;
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

    const textConfig = {
      fontSize: '30px',
      color: '#760404',
      stroke: '#ffffff',
      strokeThickness: 2,
    };
    const scorePrefix = this.add.text(this.#UiStartPoint?.x, this.#UiStartPoint?.y, 'Score : ', textConfig);
    this.#scoreText = this.add.text(scorePrefix.x + scorePrefix.width, scorePrefix.y, `${this.#score}`, textConfig);
    const fallingLostPrefix = this.add.text(
      this.#UiStartPoint?.x,
      this.#UiStartPoint?.y + this.#scoreText.height,
      'Lost : ',
      textConfig,
    );
    this.#fallingObjectsCountText = this.add.text(
      this.#UiStartPoint?.x + fallingLostPrefix.width,
      this.#UiStartPoint?.y + this.#scoreText.height,
      `${this.#fallingObjectsCount}`,
      textConfig,
    );
    const lifeCount = this.add.text(
      this.#UiStartPoint?.x,
      this.#UiStartPoint?.y - scorePrefix.height,
      'Life : ',
      textConfig,
    );

    // this.#playerLifeHeartIcon = this.add.image(
    //   (this.#UiStartPoint?.x + lifeCount.width) * 1.05,
    //   ((this.#UiStartPoint?.y - scorePrefix.height) / 3) * 5,
    //   ASSET_KEYS.Heart,
    // );
    const gap = 50;
    if (this.#playerLifeCount) {
      for (let index = 0; index < this.#playerLifeCount; index++) {
        this.#playerLifeHeartIcon = this.add.image(
          this.#UiStartPoint?.x + lifeCount.width + gap * index + 20,
          ((this.#UiStartPoint?.y - scorePrefix.height) / 3) * 5,
          ASSET_KEYS.Heart,
        );
        this.#playerLifeHeartIcon.scale = 0.1;
        // this.
      }
    }
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
          element.getBounds(),
        );
        console.log(overlapPoints);

        if (overlapPoints.length > 0) {
          element.destroy();
          this.#fallingObjects.splice(index, 1);
          this.#score += 1;

          this.#scoreText.setText(`${this.#score}`);
        }

        if (element.y > this.scale.height + element.height) {
          element.destroy();
          this.#fallingObjects.splice(element, 1);
          this.#fallingObjectsCount += 1;
          this.#fallingObjectsCountText?.setText(`${this.#fallingObjectsCount}`);
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
