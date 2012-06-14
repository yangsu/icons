/* Author:
  Yang Su
*/
var
//Constants
  gSize = 256,
  gSizeSQ = gSize * gSize,
  $imgContainer = $('#imgContainer'),
  gImgTemplate = _.template($('#imgtemplate').html()),

  gCanvas = $('#canvas')[0],
  gContext,
  gImgData,
  gColorInfo,
  gImages;

gCanvas.width = gSize;
gCanvas.height = gSize;
gContext = gCanvas.getContext('2d');

var processImage = function () {
  var i, j, pixel, pos, color, colorMap = {}, sum = Util.rgba(0, 0, 0, 255);
  gContext.drawImage($('#image')[0], 0, 0);
  if (!image.width && !image.height) {
    console.log(image);
    return;
  }
  gImgData = gContext.getImageData(0, 0, image.width, image.height);
  pixels = gImgData.data;
  for (i = image.width - 1; i >= 0; i -= 1) {
    for (j = image.height - 1; j >= 0; j -= 1) {
      pos = (i + gImgData.width * j) * 4;
      color = Util.rgba(
        pixels[pos],
        pixels[pos + 1],
        pixels[pos + 2],
        pixels[pos + 3]
      );
      sum.r = sum.r + color.r;
      sum.g = sum.g + color.g;
      sum.b = sum.b + color.b;
      sum.a = sum.a + color.a;

      colorMap[i + '|' + j] = {
        pos: pos,
        color: color,
        hsl: Util.rgbToHsl(color),
        gray : Util.gray(color),
      };
    }
  }
  sum.r = sum.r / gSizeSQ;
  sum.g = sum.g / gSizeSQ;
  sum.b = sum.b / gSizeSQ;
  sum.a = sum.a / gSizeSQ;

  gColorInfo = {
    colorMap : colorMap,
    img : image,
    rgba : sum,
    hsl : Util.rgbToHsl(sum),
    gray : Util.gray(sum)
  };
};

var compareFuncs = {
  id : function (a, b) {
    var aa = a.pos,
      bb = b.pos;
    return (aa < bb) ? -1 : (aa > bb) ? 1 : 0;
  },
  hue : function (a, b) {
    var aa = a.hsl.h,
      bb = b.hsl.h;
    return (aa < bb) ? -1 : (aa > bb) ? 1 : 0;
  },
  gray : function (a, b) {
    var aa = a.gray,
      bb = b.gray;
    return (aa < bb) ? -1 : (aa > bb) ? 1 : 0;
  }
};

var sortFunc = function (type) {
  var togleState = false;
  return function (evt) {
    var pixels = _.map(gColorInfo.colorMap, function (val) { return val; });
    pixels.sort(compareFuncs[type]);
    if (togleState) {
      pixels.reverse();
    }
    var x, y, pos;
    for (x = 0; x < gColorInfo.img.width; x++) {
      for (y = 0; y < gColorInfo.img.height; y++) {
        pos = x + gImgData.width * y;
        Util.setImageData(gImgData, x, y, pixels[pos].color);
      }
    }
    gContext.putImageData(gImgData, 0, 0);
    evt.target.innerHTML = (togleState) ? 'Sort' : 'RSort';
    togleState = !togleState;
  };
};

var generateNextImage = function () {
  var image = gImages[Math.floor(Math.random() * gImages.length)];
  $('#image').remove();
  $imgContainer.append(gImgTemplate(image));
  $('#image').load(processImage)
};

$('#sort').click(sortFunc('id'));
$('#huesort').click(sortFunc('hue'));
$('#graysort').click(sortFunc('gray'));
$('#next').click(function() { generateNextImage() });
$(document).ready(function () {
  $.getJSON('data/icons.json', function (data) {
    var filename;
    gImages = _.map(data, function (value, key) {
      filename = value.image.match(/(s\d{2,3}[a-zA-Z0-9-_.]+)/)[0];
      return {
        image: 'data/icons/' + filename.replace(/(s\d{2,3})/, 's' + gSize)
      };
    })
    generateNextImage();
  });
});