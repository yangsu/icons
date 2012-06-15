var Color = function (r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
};

Color.prototype.toGray = function () {
  if (_.isUndefined(this.gray)) {
    this.gray = 0.2989 * this.r + 0.5870 * this.g + 0.1140 * this.b;
  }
  return this.gray;
};

Color.prototype.toHSL = function () {
  if (_.isUndefined(this.h) || _.isUndefined(this.s) || _.isUndefined(this.l)) {
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

Color.hue2rgb = function (p, q, t) {
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
  if (_.isUndefined(this.r) || _.isUndefined(this.g) || _.isUndefined(this.b)) {
    if (this.s === 0) {
      r = g = b = this.l; // achromatic
    } else {
      q = this.l < 0.5 ? this.l * (1 + this.s) : this.l + this.s - this.l * this.s;
      p = 2 * this.l - q;
      r = Color.hue2rgb(p, q, this.h + 1 / 3);
      g = Color.hue2rgb(p, q, this.h);
      b = Color.hue2rgb(p, q, this.h - 1 / 3);
    }
    this.r = r * 255;
    this.g = g * 255;
    this.b = b * 255;
    this.a = 255;
  }
  return this;
};

Color.componentToHex = function (c) {
  var hex = Math.round(c).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};

Color.prototype.toHEX = function () {
  return "#" + Color.componentToHex(this.r) + Color.componentToHex(this.g) + Color.componentToHex(this.b);
};

Color.prototype.generateConversions = function () {
  this.toGray();
  this.toHSL();
}