import { IClip } from '@webav/av-cliper';
const WIDTH = 1280;
const HEIGHT = 720;

class CountdownClip implements IClip {
    #cvsEl;
    #ctx;
    #duration;
  
    ready;
  
    constructor(duration: number) {
      this.#duration = duration;
      this.#cvsEl = document.createElement('canvas');
      this.#cvsEl.width = WIDTH;
      this.#cvsEl.height = HEIGHT;
  
      this.ready = Promise.resolve({
        width: WIDTH,
        height: HEIGHT,
        // 单位 微秒
        duration: duration * 1e6,
      });
  
      this.#ctx = this.#cvsEl.getContext('2d')!;
      this.#ctx.font = `100px Noto Sans SC`;
    }
  
    async tick(time: number): Promise<{
      video?: VideoFrame;
      state: 'success' | 'done';
    }> {
      if (time > 1e6 * 10) return { state: 'done' };
  
      this.#ctx.fillStyle = '#333';
      this.#ctx.fillRect(0, 0, this.#cvsEl.width, this.#cvsEl.height);
  
      this.#ctx.fillStyle = '#FFF';
      // 最重要的是需要知道**某一时刻**应该绘制什么内容
      // 倒计时总时长 - 当前时刻  就是需要绘制的内容
      this.#ctx.fillText(
        String(Math.round((this.#duration * 1e6 - time) / 1000) / 1000),
        this.#cvsEl.width / 2 - 100,
        this.#cvsEl.height / 2,
      );
  
      return {
        state: 'success',
        video: new VideoFrame(this.#cvsEl, {
          timestamp: time,
        }),
      };
    }
  
    clone() {
      return new CountdownClip(this.#duration);
    }
  
    destroy() {
      this.#cvsEl.remove();
    }
  }

  export default CountdownClip

