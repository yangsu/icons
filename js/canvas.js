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
    return (Math.max(Math.min(x, this.width - 1), 0) + this.width * Math.max(Math.min(y, this.height - 1), 0));
  };

  Canvas.prototype.drawImage = function (image, x, y) {
    this.ctx.drawImage(image, x, y);
    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    this.imageDataBuffer = this.ctx.getImageData(0, 0, this.width, this.height);
    this.subPixels = this.imageData.data;
    this.subPixelsBuffer = this.imageDataBuffer.data;
    this.pixels = new Array(this.width * this.height);

    this.computeOriginalPixels();
  };

  var computePixels = function (c, target) {
    var subPixels = c[target];
    c.eachPixel(function (i, j, pixelPos, pos) {
      c.pixels[pixelPos] = Color.fromRGBAWithConversions(
        subPixels[pos],
        subPixels[pos + 1],
        subPixels[pos + 2],
        subPixels[pos + 3]
      );
    });
  };

  Canvas.prototype.computeOriginalPixels = function () {
    computePixels(this, 'subPixels');
  };

  Canvas.prototype.computeBufferPixels = function () {
    computePixels(this, 'subPixelsBuffer');
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
  };

  Canvas.prototype.reset = function () {
    this.ctx.putImageData(this.imageData, 0, 0);
  };

  Canvas.prototype.inval = function () {
    this.ctx.putImageData(this.imageDataBuffer, 0, 0);
  };

  var normalize = function (val) {
    return (val === 0) ? val + 128 : (val < 0) ? val + 255 : val;
  };
  var identity = function (val) {
    return val;
  };

  Canvas.prototype.setNormalize = function (bool) {
    // Canvas.prototype.normalize = (bool) ? normalize : identity;
    this.normalize = (bool) ? normalize : identity;
  };

  Canvas.prototype.applyGrayKernel = function (i, j, kernel) {
    var sum =
      this.getPixel(i - 1, j - 1).gray * kernel[0][0] +
      this.getPixel(i, j - 1).gray * kernel[0][1] +
      this.getPixel(i + 1, j - 1).gray * kernel[0][2] +
      this.getPixel(i - 1, j).gray * kernel[1][0] +
      this.getPixel(i, j).gray * kernel[1][1] +
      this.getPixel(i + 1, j).gray * kernel[1][2] +
      this.getPixel(i - 1, j + 1).gray * kernel[2][0] +
      this.getPixel(i, j + 1).gray * kernel[2][1] +
      this.getPixel(i + 1, j + 1).gray * kernel[2][2];
    return sum;
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
    return sum;
  };

  var wrapper = function (kernel, cb) {
    var start = Date.now();
    if (kernel && kernel.length === 3 && kernel[0].length === 3) {
      cb.call(this, kernel);
    }
    $timer.html(Date.now() - start);
  };

  Canvas.prototype.rgbFilter = function (kernel) {
    wrapper.call(this, kernel, function (kernel) {
      var i, j, w, h, r, g, b, a;
      for (i = 0, w = this.width; i < w; i += 1) {
        for (j = 0, h = this.height; j < h; j += 1) {
          r = this.applyKernel(i, j, kernel, 'r');
          g = this.applyKernel(i, j, kernel, 'g');
          b = this.applyKernel(i, j, kernel, 'b');
          this.setPixel(i, j, Color.fromRGBA(r, g, b));
        }
      }
    });
  };

  Canvas.prototype.rgbaFilter = function (kernel) {
    wrapper.call(this, kernel, function (kernel) {
      var i, j, w, h, r, g, b, a;
      for (i = 0, w = this.width; i < w; i += 1) {
        for (j = 0, h = this.height; j < h; j += 1) {
          r = this.applyKernel(i, j, kernel, 'r');
          g = this.applyKernel(i, j, kernel, 'g');
          b = this.applyKernel(i, j, kernel, 'b');
          a = this.applyKernel(i, j, kernel, 'a');
          this.setPixel(i, j, Color.fromRGBA(r, g, b, a));
        }
      }
    });
  };

  Canvas.prototype.filter = function (kernel) {
    wrapper.call(this, kernel, function (kernel) {
      var i, j, w, h, gray;
      for (i = 0, w = this.width; i < w; i += 1) {
        for (j = 0, h = this.height; j < h; j += 1) {
          gray = this.applyGrayKernel(i, j, kernel);
          this.setPixel(i, j, Color.fromGray(gray));
        }
      }
    });
  };

  window.Canvas = Canvas;
}(window, Color));