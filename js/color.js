(function (window) {
  var Color = function (r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  };

  Color.fromGray = function (gray) {
    var c = new Color(gray, gray, gray, 255);
    c.gray = gray;
    return c;
  };

  Color.fromGrayWithConversions = function (gray) {
    var c = Color.fromGray(gray);
    c.toHSL();
    return c;
  };

  Color.fromRGBAWithConversions = function (r, g, b, a) {
    var c = new Color(r, g, b, a);
    c.toHSL();
    c.toGray();
    return c;
  };

  Color.fromHSL = function (h, s, l) {
    var c = new Color();
    c.h = h;
    c.s = s;
    c.l = l;
    return c;
  };

  Color.fromHSLWithConversions = function (h, s, l) {
    var c = Color.fromHSL(h, s, l);
    c.toGray();
    c.toRGB();
    return c;
  };

  Color.fromHex = function (hex) {
    var c = new Color();
    c.r = parseInt(hex.substring(1, 3), 16);
    c.g = parseInt(hex.substring(3, 5), 16);
    c.b = parseInt(hex.substring(5), 16);
    c.a = 255;
    return c;
  };

  Color.fromHexWithConversions = function (hex) {
    var c = Color.fromHexWithConversions(hex);
    c.toGray();
    c.toHSL();
    return c;
  };

  Color.prototype.toGray = function () {
    if (_.isUndefined(this.gray)) {
      this.gray = 0.2989 * this.r + 0.5870 * this.g + 0.1140 * this.b;
    }
    return this.gray;
  };

  Color.prototype.toHSL = function () {
    if (_.isNumber(this.r) && _.isNumber(this.g) && _.isNumber(this.b)) {
      var r = this.r / 255,
        g = this.g / 255,
        b = this.b / 255,
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
      this.h = h;
      this.s = s;
      this.l = l;
    }
    return this;
  };

  var hue2rgb = function (p, q, t) {
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
  };

  Color.prototype.toRGB = function () {
    var r, g, b, p, q;
    if (_.isNumber(this.h) && _.isNumber(this.s) && _.isNumber(this.l)) {
      if (this.s === 0) {
        r = g = b = this.l; // achromatic
      } else {
        q = this.l < 0.5 ? this.l * (1 + this.s) : this.l + this.s - this.l * this.s;
        p = 2 * this.l - q;
        r = hue2rgb(p, q, this.h + 1 / 3);
        g = hue2rgb(p, q, this.h);
        b = hue2rgb(p, q, this.h - 1 / 3);
      }
      this.r = r * 255;
      this.g = g * 255;
      this.b = b * 255;
      this.a = 255;
    }
    return this;
  };

  var componentToHex = function (c) {
    var hex = Math.round(c).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  Color.prototype.toHEX = function () {
    return "#" + componentToHex(this.r) + componentToHex(this.g) + componentToHex(this.b);
  };

  window.Color = Color;
}(window));