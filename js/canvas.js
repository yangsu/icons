(function (window, Color) {
  // require: color, $, _

  var Canvas = function () {};

  Canvas.fromImage = function (image) {
    if (image && image.width && image.height) {
      var c = new Canvas();

      c.canvas = document.createElement('canvas');
      c.width = c.canvas.width = image.width;
      c.height = c.canvas.height = image.height;

      c.ctx = c.canvas.getContext('2d');

      c.drawImage(image, 0, 0);

      return c;
    }
    return null;
  };

  Canvas.fromCanvas = function (canvas) {
    var c = new Canvas();
    c.canvas = canvas;
    c.width = canvas.width;
    c.height = canvas.height;
    c.ctx = canvas.getContext('2d');
    return c;
  };

  Canvas.prototype.getPixelPos = function (x, y) {
    return (x + this.width * y);
  };

  Canvas.prototype.drawImage = function (image, x, y) {
    this.ctx.drawImage(image, x, y);
    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    this.imageDataBuffer = this.ctx.getImageData(0, 0, this.width, this.height);
    this.subPixels = this.imageData.data;
    this.subPixelsBuffer = this.imageDataBuffer.data;
    this.pixels = new Array(this.width * this.height);
    this.pixelsBuffer = new Array(this.width * this.height);

    var c;
    this.eachPixel(function (i, j, pixelPos, pos) {
      c = new Color(
        this.subPixels[pos],
        this.subPixels[pos + 1],
        this.subPixels[pos + 2],
        this.subPixels[pos + 3]
      );
      c.generateConversions();
      this.pixels[pixelPos] = c;
      this.pixelsBuffer[pixelPos] = c;
    });
  };

  Canvas.prototype.eachPixel = function (iterator) {
    var i, j, w, h, pos, pixelPos;
    for (i = 0, w = this.width; i < w; i += 1) {
      for (j = 0, h = this.height; j < h; j += 1) {
        pixelPos = this.getPixelPos(i, j);
        pos = pixelPos * 4;
        iterator.call(this, i, j, pixelPos, pos);
      }
    }
  };

  Canvas.prototype.getPixels = function () {
    return _.clone(this.pixels);
  };

  Canvas.prototype.getImageData = function () {
    return this.imageData;
  };

  Canvas.prototype.getPixel = function (x, y) {
    return this.pixels[this.getPixelPos(x, y)];
  };

  Canvas.prototype.getBufferPixel = function (x, y) {
    return this.pixelsBuffer[this.getPixelPos(x, y)];
  };

  Canvas.prototype.setPixel = function (x, y, color) {
    var pixelPos = this.getPixelPos(x, y),
      pos = pixelPos * 4;

    this.subPixelsBuffer[pos] = color.r;
    this.subPixelsBuffer[pos + 1] = color.g;
    this.subPixelsBuffer[pos + 2] = color.b;
    this.subPixelsBuffer[pos + 3] = color.a;

    this.pixelsBuffer[pixelPos] = _.clone(color);
  };

  Canvas.prototype.reset = function () {
    this.ctx.putImageData(this.imageData, 0, 0);
  };

  Canvas.prototype.inval = function () {
    this.ctx.putImageData(this.imageDataBuffer, 0, 0);
  };

  Canvas.prototype.applyKernel = function (i, j, kernel, val) {
    var sum =
      this.getPixel(i - 1, j - 1)[val] * kernel[0][0] +
      this.getPixel(i, j - 1)[val] * kernel[0][1] +
      this.getPixel(i + 1, j - 1)[val] * kernel[0][2] +
      this.getPixel(i - 1, j)[val] * kernel[1][0] +
      this.getPixel(i, j)[val] * kernel[1][1] +
      this.getPixel(i + 1, j)[val] * kernel[1][2] +
      this.getPixel(i - 1, j + 1)[val] * kernel[2][0] +
      this.getPixel(i, j + 1)[val] * kernel[2][1] +
      this.getPixel(i + 1, j + 1)[val] * kernel[2][2];
    return (sum === 0) ? sum + 128 : (sum < 0) ? sum + 255 : sum;
  };

  Canvas.prototype.filter = function (kernel) {
    if (kernel && kernel.length === 3 && kernel[0].length === 3) {
      var i, j, w, h, r, g, b, a;
      for (i = 1, w = this.width - 1; i < w; i += 1) {
        for (j = 1, h = this.height - 1; j < h; j += 1) {
          r = this.applyKernel(i, j, kernel, 'r');
          g = this.applyKernel(i, j, kernel, 'g');
          b = this.applyKernel(i, j, kernel, 'b');
          a = this.applyKernel(i, j, kernel, 'a');
          this.setPixel(i, j, new Color(r, g, b, 255));
        }
      }
    }
  };

  window.Canvas = Canvas;
}(window, Color));