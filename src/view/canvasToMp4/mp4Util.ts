import { IClip } from '@webav/av-cliper';
const WIDTH = 360;
const HEIGHT = 640;

let canvasEl = null
class CountdownClip implements IClip {
    #cvsEl;
    #ctx;
    #duration;
    ready;
  
    constructor(cvsEl: any, duration: number) {
      this.#duration = duration;
      
      canvasEl = cvsEl
      this.#cvsEl = document.createElement('canvas');
      this.#cvsEl.width = WIDTH;
      this.#cvsEl.height = HEIGHT;

  
      this.ready = Promise.resolve({
        width: WIDTH,
        height: HEIGHT,
        // 单位 微秒
        duration: duration * 1e6,
      });
      // this.#ctx = gl
      // debugger
      this.#ctx = this.#cvsEl.getContext('2d')!;
      // this.#ctx.drawImage(canvasEl, WIDTH, HEIGHT);
    }
  
    async tick(time: number): Promise<{
      video?: VideoFrame;
      state: 'success' | 'done';
    }> {
      if (time > 1e6 * 10) return { state: 'done' };
      
      // console.log(canvasEl.currentTime)
      // console.log(canvasEl.width)
      // console.log(canvasEl.height)
      this.#ctx.drawImage(canvasEl, 0, 0);
      // const c = document.createElement('canvas')
      // c.width = 720
      // c.height = 1280
      // const cc = c.getContext('2d')
      // cc?.drawImage(canvasEl, 0,0)
      // document.body.append(c)
      // console.log('data', this.#ctx.getImageData(0, 0, WIDTH, HEIGHT))
    //   this.#ctx.fillStyle = '#333';
    //   this.#ctx.fillRect(0, 0, this.#cvsEl.width, this.#cvsEl.height);
  
    //   this.#ctx.fillStyle = '#FFF';
    //   // 最重要的是需要知道**某一时刻**应该绘制什么内容
    //   // 倒计时总时长 - 当前时刻  就是需要绘制的内容
    //   this.#ctx.fillText(
    //     String(Math.round((this.#duration * 1e6 - time) / 1000) / 1000),
    //     this.#cvsEl.width / 2 - 100,
    //     this.#cvsEl.height / 2,
    //   );
      console.log('time', time)
      return {
        state: 'success',
        video: new VideoFrame(this.#cvsEl, {
          timestamp: time,
        }),
      };
    }

    clone() {
      return new CountdownClip(canvasEl, this.#duration);
    }
  
    destroy() {
      this.#cvsEl.remove();
    }
  }

  export default CountdownClip

