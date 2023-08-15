class TransformationMatrix {
    public elements;
    constructor() {
      this.elements = new Float32Array(9);
      this.identity();
    }
  
    identity() {
      const elements = this.elements;
      elements[0] = 1; elements[1] = 0; elements[2] = 0;
      elements[3] = 0; elements[4] = 1; elements[5] = 0;
      elements[6] = 0; elements[7] = 0; elements[8] = 1;
    }
  
    translate(tx, ty) {
      const elements = this.elements;
      elements[6] += elements[0] * tx + elements[3] * ty;
      elements[7] += elements[1] * tx + elements[4] * ty;
      elements[8] += elements[2] * tx + elements[5] * ty;
    }
  
    scale(sx, sy) {
      const elements = this.elements;
      elements[0] *= sx;
      elements[1] *= sx;
      elements[2] *= sx;
      elements[3] *= sy;
      elements[4] *= sy;
      elements[5] *= sy;
    }
  
    rotate(angle) {
      const radians = angle * Math.PI / 180.0;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
  
      // 获取画布的宽高比例
      const canvasWidth = 1280 /* 你的画布宽度 */;
      const canvasHeight = 720 /* 你的画布高度 */;
      const canvasRatio = canvasWidth / canvasHeight;
  
      // 根据宽高比例进行缩放
      if (canvasRatio > 1) {
        this.scale(1, 1 / canvasRatio);
      } else {
        this.scale(canvasRatio, 1);
      }
  
      // 平移操作
      const tx = this.elements[6];
      const ty = this.elements[7];
      this.translate(tx, ty);
  
      // 旋转操作
      const elements = this.elements;
      const a00 = elements[0], a01 = elements[1], a02 = elements[2],
            a10 = elements[3], a11 = elements[4], a12 = elements[5];
  
      elements[0] = cos * a00 - sin * a10;
      elements[1] = cos * a01 - sin * a11;
      elements[2] = cos * a02 - sin * a12;
      elements[3] = sin * a00 + cos * a10;
      elements[4] = sin * a01 + cos * a11;
      elements[5] = sin * a02 + cos * a12;
  
      // 反向平移操作
      this.translate(-tx, -ty);
  
      // 调整绘制坐标恢复实际比例和位置
      if (canvasRatio > 1) {
        this.scale(1, canvasRatio);
      } else {
        this.scale(1 / canvasRatio, 1);
      }
    }
  
    multiply(matrix) {
      const elements = this.elements;
      const a00 = elements[0], a01 = elements[1], a02 = elements[2],
            a10 = elements[3], a11 = elements[4], a12 = elements[5],
            a20 = elements[6], a21 = elements[7], a22 = elements[8];
  
      const b00 = matrix.elements[0], b01 = matrix.elements[1], b02 = matrix.elements[2],
            b10 = matrix.elements[3], b11 = matrix.elements[4], b12 = matrix.elements[5],
            b20 = matrix.elements[6], b21 = matrix.elements[7], b22 = matrix.elements[8];
  
      elements[0] = b00 * a00 + b01 * a10 + b02 * a20;
      elements[1] = b00 * a01 + b01 * a11 + b02 * a21;
      elements[2] = b00 * a02 + b01 * a12 + b02 * a22;
      elements[3] = b10 * a00 + b11 * a10 + b12 * a20;
      elements[4] = b10 * a01 + b11 * a11 + b12 * a21;
      elements[5] = b10 * a02 + b11 * a12 + b12 * a22;
      elements[6] = b20 * a00 + b21 * a10 + b22 * a20;
      elements[7] = b20 * a01 + b21 * a11 + b22 * a21;
      elements[8] = b20 * a02 + b21 * a12 + b22 * a22;
    }
  }

  export default TransformationMatrix
  