(function (window, Color, Util) {
  // require: color, $, _

  var Canvas = function () {
    this.stackFilters = true;
  };

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

  Canvas.prototype.drawImageWithSize = function (image, x, y, w, h) {
    this.ctx.drawImage(image, x, y, w, h);
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
    this.computeOriginalPixels();
  };

  Canvas.prototype.inval = function () {
    this.ctx.putImageData(this.imageDataBuffer, 0, 0);
    if (this.stackFilters) {
      this.computeBufferPixels();
    }
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

  var timer = function (ctx, cb) {
    var start = Date.now(),
      rv = cb.call(ctx);
    $timer.html(Date.now() - start);
    return rv;
  };

  var genKernelFunction = function (step, finish) {
    finish = finish || function (c) { return c; };
    return function (i, j, kernel) {
      var centerPixel = this.getPixel(i, j),
        c = Color.fromHSL(centerPixel.h, centerPixel.s, centerPixel.l);
      kernel = kernel || Util.identityKernel;
      step(c, this.getPixel(i - 1, j - 1), kernel[0][0]);
      step(c, this.getPixel(i, j - 1), kernel[0][1]);
      step(c, this.getPixel(i + 1, j - 1), kernel[0][2]);
      step(c, this.getPixel(i - 1, j), kernel[1][0]);
      step(c, centerPixel, kernel[1][1]);
      step(c, this.getPixel(i + 1, j), kernel[1][2]);
      step(c, this.getPixel(i - 1, j + 1), kernel[2][0]);
      step(c, this.getPixel(i, j + 1), kernel[2][1]);
      step(c, this.getPixel(i + 1, j + 1), kernel[2][2]);
      finish(c, centerPixel);
      return c;
    };
  };

  var genFilter = function (func) {
    return function (kernel) {
      timer(this, function () {
        var i, j, w, h;
        for (i = 0, w = this.width; i < w; i += 1) {
          for (j = 0, h = this.height; j < h; j += 1) {
            this.setPixel(i, j, func.call(this, i, j, kernel));
          }
        }
      });
    };
  };

  Canvas.prototype.rgbFilter = genFilter(
    genKernelFunction(function (o, i, val) {
      o.r += i.r * val;
      o.g += i.g * val;
      o.b += i.b * val;
    }, function (c, centerPixel) {
      c.a = centerPixel.a;
    })
  );

  Canvas.prototype.rgbaFilter = genFilter(
    genKernelFunction(function (o, i, val) {
      o.r += i.r * val;
      o.g += i.g * val;
      o.b += i.b * val;
      o.a += i.a * val;
    })
  );

  Canvas.prototype.grayFilter = genFilter(
    genKernelFunction(function (o, i, val) {
      o.gray = i.gray * val;
    }, function (c) {
      c.GrayToRGB();
    })
  );

  Canvas.prototype.filter = Canvas.prototype.rgbFilter;

  var genHSLFilter = function (mathop) {
    return genKernelFunction(function (o, i) {
      o.l = Math[mathop](o.l, i.l);
    }, function (c, centerPixel) {
      c.a = centerPixel.a;
      c.HSLtoRGB();
    });
  };

  Canvas.prototype.erodeFilter = genFilter(genHSLFilter('max'));
  Canvas.prototype.dilateFilter = genFilter(genHSLFilter('min'));

  Canvas.prototype.regions = function (rw, rh) {
    return timer(this, function () {
      var w = this.width,
        h = this.height,
        row = Math.ceil(w / rw),
        col = Math.ceil(h / rh),
        rsize = rw * rh,
        colors = Util.matrix(row, col),
        i, j, r, c, color, pcolor;

      for (i = 0; i < w; i += 1) {
        for (j = 0; j < h; j += 1) {
          r = Math.floor(i / rw);
          c = Math.floor(j / rh);
          color = colors[r][c];
          pcolor = this.getPixel(i, j);
          if (color) {
            color.r += pcolor.r;
            color.g += pcolor.g;
            color.b += pcolor.b;
          } else {
            colors[r][c] = new Color(pcolor.r, pcolor.g, pcolor.b, 255);
          }
        }
      }

      for (r = 0; r < row; r += 1) {
        for (c = 0; c < col; c += 1) {
          color = colors[r][c];
          color.r /= rsize;
          color.g /= rsize;
          color.b /= rsize;
        }
      }

      return colors;
    });
  };

  Canvas.prototype.paintRegions = function (regions, rw, rh) {
    var row = regions.length,
      col = regions[0].length,
      i, j, w, h, r, c;
    for (i = 0, w = this.width; i < w; i += 1) {
      for (j = 0, h = this.height; j < h; j += 1) {
        r = Math.floor(i / rw);
        c = Math.floor(j / rh);
        this.setPixel(i, j, regions[r][c]);
      }
    }
    this.inval();
  };

  window.Canvas = Canvas;
}(window, Color, Util));