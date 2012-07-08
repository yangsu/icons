/* Author:
  Yang Su
*/
var
//Constants
  gSize = 256,
  gSizeSQ = gSize * gSize,
  $imgContainer = $('#imgContainer'),
  gImgTemplate = _.template($('#imgtemplate').html()),

  gCanvas = Canvas.fromCanvas($('#canvas')[0]),
  gImages;

var processImage = function () {
  var i, j, pixels, pos, color,
    colorMap = {},
    sum = new Color(0, 0, 0, 255),
    img = $('#image')[0];
  gCanvas.drawImage(img, 0, 0);

  gCanvas.eachPixel(function (x, y, pixelPos) {
    color = gCanvas.pixels[pixelPos];
    sum.r = sum.r + color.r;
    sum.g = sum.g + color.g;
    sum.b = sum.b + color.b;
    sum.a = sum.a + color.a;
  });

  sum.r = sum.r / gSizeSQ;
  sum.g = sum.g / gSizeSQ;
  sum.b = sum.b / gSizeSQ;
  sum.a = sum.a / gSizeSQ;

  gColorInfo = {
    img : img,
    rgba : sum,
    hsl : sum.RGBtoHSL(),
    gray : sum.RGBtoGray()
  };
};

var compareFuncs = {
  id : function (a, b) {
    var aa = a.pos,
      bb = b.pos;
    return (aa < bb) ? -1 : (aa > bb) ? 1 : 0;
  },
  hue : function (a, b) {
    var aa = a.h,
      bb = b.h;
    return (aa < bb) ? -1 : (aa > bb) ? 1 : 0;
  },
  gray : function (a, b) {
    var aa = a.gray,
      bb = b.gray;
    return (aa < bb) ? -1 : (aa > bb) ? 1 : 0;
  }
};

var sortFunc = function (type) {
  var togleState = false, x, y, pos;
  return function (evt) {
    var pixels = gCanvas.getPixels();
    pixels.sort(compareFuncs[type]);
    if (togleState) {
      pixels.reverse();
    }

    gCanvas.eachPixel(function (x, y, pixelPos) {
      gCanvas.setPixel(x, y, pixels[pixelPos]);
    });

    gCanvas.inval();

    evt.target.innerHTML = (togleState) ? 'Sort' : 'RSort';
    togleState = !togleState;
  };
};

var generateNextImage = function () {
  var image = gImages[Math.floor(Math.random() * gImages.length)];
  $('#image').remove();
  $imgContainer.append(gImgTemplate(image));
  $('#image').load(processImage);
};

$('#sort').click(sortFunc('id'));
$('#huesort').click(sortFunc('hue'));
$('#graysort').click(sortFunc('gray'));
$('#next').click(function () { generateNextImage(); });
$('#reset').click(function () { gCanvas.reset(); });
$('#blur').click(function () {
  gCanvas.filter([
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9]
  ]);
  gCanvas.inval();
});

$('#sharpen').click(function () {
  gCanvas.filter([
    [-1 / 9, -1 / 9, -1 / 9],
    [-1 / 9, 17 / 9, -1 / 9],
    [-1 / 9, -1 / 9, -1 / 9]
  ]);
  gCanvas.inval();
});

$('#edge').click(function () {
  gCanvas.filter([
    [-1, -1, -1],
    [-1, 8, -1],
    [-1, -1, -1]
  ]);
  gCanvas.inval();
});

$('#emboss').click(function () {
  gCanvas.filter([
    [-2, -1, -0],
    [-1, 1, 1],
    [-0, 1, 2]
  ]);
  gCanvas.inval();
});

$('#pixelate').click(function () {
  var w = 5,
    h = 5;
  gCanvas.paintRegions(gCanvas.regions(w, h), w, h);
});

$('#erode').click(function () {
  gCanvas.dilateFilter();
  gCanvas.inval();
});

$('#dilate').click(function () {
  gCanvas.erodeFilter();
  gCanvas.inval();
});

var ks = [
  $('#k0'),
  $('#k1'),
  $('#k2'),
  $('#k3'),
  $('#k4'),
  $('#k5'),
  $('#k6'),
  $('#k7'),
  $('#k8')
];

var kernel = [
  [0, 0, 0],
  [0, 1, 0],
  [0, 0, 0]
];

$timer = $('#timer');
$('#kernel').delegate('.kernel-cell', 'keyup', function (e) {
  var i = +e.target.id.slice(1),
    r = Math.floor(i / 3),
    c = i%3,
    val = +ks[i].attr('value'),
    changed = false;
  if (e.which === 38) { // UP
    ks[i].attr('value', ++val);
    kernel[r][c] = val;
    changed = true;
  } else if (e.which === 40) { // DOWN
    ks[i].attr('value', --val);
    kernel[r][c] = val;
    changed = true;
  } else if (e.which >= 48 && e.which <= 57) { // 0-9

  } else {

  }

  if (changed) {
    gCanvas.filter(kernel);
    gCanvas.inval();
  }
});

$(document).ready(function () {
  $.getJSON('data/icons.json', function (data) {
    var filename;
    gImages = _.map(data, function (value, key) {
      filename = value.image.match(/(s\d{2,3}[a-zA-Z0-9-_.]+)/)[0];
      return {
        image: 'data/icons/' + filename.replace(/(s\d{2,3})/, 's' + gSize)
      };
    });
    generateNextImage();
  });
});