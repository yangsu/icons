var Util = {
  /*
  Image Utils
  var imagedata = getImageData(imgTexture.image);
  var color = getPixel(imagedata, 10, 10);
  */
  getImageData : function (image) {
    var canvas = document.createElement('canvas'),
      context;
    canvas.width = image.width;
    canvas.height = image.height;

    context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);

    return context.getImageData(0, 0, image.width, image.height);
  },
  rgba : function (r, g, b, a) {
    return {
      r: r,
      g: g,
      b: b,
      a: a
    };
  },
  getPixel : function (imagedata, x, y) {
    var data = imagedata.data,
      position = (x + imagedata.width * y) * 4;
    return Util.rgba(
      data[position],
      data[position + 1],
      data[position + 2],
      data[position + 3]
    );
  },
  getRow : function (imagedata, r) {
    var position = (imagedata.width * r) * 4,
      data = imagedata.data,
      row = [],
      end = imagedata.width,
      i;
    for (i = 0; i < end; position += 4, i += 1) {
      row[i] = Util.rgba(
        data[position],
        data[position + 1],
        data[position + 2],
        data[position + 3]
      );
    }
    return row;
  },
  getColumn : function (imagedata, c) {
    var position = c * 4,
      data = imagedata.data,
      column = [],
      inc = imagedata.width * 4,
      end = imagedata.height,
      i;
    for (i = 0; i < end; position += inc, i += 1) {
      column[i] = Util.rgba(
        data[position],
        data[position + 1],
        data[position + 2],
        data[position + 3]
      );
    }
    return column;
  },
  gray : function (color) {
    return 0.2989 * color.r + 0.5870 * color.g + 0.1140 * color.b;
  },
  grayToRGB : function (gray) {
    return Util.rgba(gray, gray, gray, 255);
  },
  rgbToHsl : function (color) {
    var r = color.r / 255,
      g = color.g / 255,
      b = color.b / 255,
      max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      h,
      s,
      l = (max + min) / 2,
      d = (max - min);

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: h,
      s: s,
      l: l
    };
  },
  hue2rgb : function (p, q, t) {
    if (t < 0) {
      t += 1;
    }
    if (t > 1) {
      t -= 1;
    }
    if (t < 1 / 6) {
      return p + (q - p) * 6 * t;
    }
    if (t < 1 / 2) {
      return q;
    }
    if (t < 2 / 3) {
      return p + (q - p) * (2 / 3 - t) * 6;
    }
    return p;
  },

  hslToRgb : function (h, s, l) {
    var r, g, b, p, q;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      p = 2 * l - q;
      r = Util.hue2rgb(p, q, h + 1 / 3);
      g = Util.hue2rgb(p, q, h);
      b = Util.hue2rgb(p, q, h - 1 / 3);
    }

    return Util.rgba(r * 255, g * 255, b * 255, 255);
  },

  componentToHex : function (c) {
    var hex = Math.round(c).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  },

  rgbToHex : function (color) {
    return "#" + Util.componentToHex(color.r) + Util.componentToHex(color.g) + Util.componentToHex(color.b);
  }
};