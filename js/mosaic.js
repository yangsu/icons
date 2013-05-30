/* Author:
  Yang Su
*/
var
//Constants
  gTotalCount = 0,
  gSize = 100,
  gSizeSQ = gSize * gSize,
  $imgContainer = $('#imgContainer'),
  $state = $('#state'),
  $timer = $('#timer'),
  gImgTemplate = _.template($('#imgtemplate').html()),

  gCanvas = Canvas.fromCanvas($('#canvas')[0]),
  gImageMap = {},
  gAvgColor = {};

var gOffscreenCanvas = document.createElement('canvas'),
  gOffscreenContext;
gOffscreenCanvas.width = gSize;
gOffscreenCanvas.height = gSize;
gOffscreenContext = gOffscreenCanvas.getContext('2d');

var processImages = function() {
  var i, j, pixel, pos, sum, imgdata, c = 0;
  _.each(gImageMap, function(image) {
    c += 1;
    $state.html('Processing Images ... ' + c + '/' + gTotalCount);
    sum = new Color(0, 0, 0, 255);
    if (!image.width && !image.height) {
      console.log(image);
      return;
    }
    try {
      gOffscreenContext.drawImage(image, 0, 0, gSize, gSize);
    } catch (e) {
      debugger;
    }
    imgdata = gOffscreenContext.getImageData(0, 0, image.width, image.height);
    pixel = imgdata.data;
    for (i = image.width - 1; i >= 0; i -= 1) {
      for (j = image.height - 1; j >= 0; j -= 1) {
        pos = (i + imgdata.width * j) * 4;
        sum.r = sum.r + pixel[pos];
        sum.g = sum.g + pixel[pos + 1];
        sum.b = sum.b + pixel[pos + 2];
        sum.a = sum.a + pixel[pos + 3];
      }
    }
    sum = Color.fromRGBAWithConversions(
      sum.r / gSizeSQ,
      sum.g / gSizeSQ,
      sum.b / gSizeSQ,
      sum.a / gSizeSQ
    );

    gAvgColor[image.src] = sum;
  });
};

var generateNextImage = function() {
  var keys = _.keys(gImageMap);
  var image = gImageMap[keys[Math.floor(Math.random() * keys.length)]];
  $imgContainer.html(image);
  gCanvas.drawImage(image, 0, 0, gSize, gSize);
};

$('#pixelate').click(function() {
  var start = Date.now();
  var s = 5,
    w = s,
    h = s;
  var regions = gCanvas.regions(w, h),
    imgs = Util.matrix(regions.length, regions[0].length),
    i, j, k, img, l, l2, l3,
    color, color2, closestColor, closestImage,
    diff,mindiff,
    computeClosest = function(avg, key) {
      color2 = avg.RGBtoGray();
      if (!color2) {
        debugger;
      }
      diff = color.rgbDiff(color2);
      if (diff < mindiff) {
        mindiff = diff;
        closestColor = color2;
        closestImage = gImageMap[key.slice(22)];
      }
    };
  for (i = 0, l = regions.length; i < l; i += 1) {
    for (j = 0, l2 = regions[0].length; j < l2; j += 1) {
      mindiff = 999999;
      color = regions[i][j].RGBtoHSL().RGBtoGray();
      _.each(gAvgColor, computeClosest);
      if (!closestColor) {
        debugger;
      }
      regions[i][j] = closestColor;
      imgs[i][j] = closestImage;
    }
  }

  var x, y;
  for (i = 0, l = regions.length; i < l; i += 1) {
    for (j = 0, l2 = regions[0].length; j < l2; j += 1) {
      x = w * i;
      y = h * j;
      gCanvas.drawImageWithSize(imgs[i][j], x, y, w, h);
    }
  }
  // gCanvas.paintRegions(regions, w, h);
  $timer.html(Date.now() - start);
});

$('#next').click(function() { generateNextImage(); });
$('#reset').click(function() { gCanvas.reset(); });

$(document).ready(function() {
  var counter = 0,
    loadedCount = 0,
    checkLoaded = function() {
      loadedCount += 1;
      $state.html('Loading Images ... ' + loadedCount + '/' + gTotalCount);
      if (loadedCount >= gTotalCount) {
        processImages();
        generateNextImage();
      }
    };
  $.getJSON('data/icons.json', function(data) {
    gTotalCount += data.length;
    var i, filename, result, img;
    for (i = data.length - 1; i >= 0; i -= 1) {
      filename = data[i].image.match(/(s\d{2,3}[a-zA-Z0-9\-_.]+)/)[0];
      data[i].image = 'data/icons/' + filename.replace(/(s\d{2,3})/, 's' + 256 || gSize);
      data[i].number = counter++;
      img = $(gImgTemplate(_.extend(data[i], { width: gSize, height: gSize }))).load(checkLoaded).error(checkLoaded);
      gImageMap[data[i].image] = img[0];
    }
  });
  $.getJSON('data/appstore.complete.json', function(data) {
    var c = 0;
    _.each(data, function(category, key) {
      c += 1;
      if (c > 5) {
        return;
      }
      gTotalCount += _.chain(category).pluck('image').compact().value().length;
      var i, filename, result;
      for (i = category.length - 1; i >= 0; i -= 1) {
        if (category[i].image) {
          filename = category[i].image.match(/\/([a-zA-Z0-9\-_.]+\.jpg)/)[0];
          category[i].image = 'data/appstore' + filename.replace(/(\d{2,3}x\d{2,3})/, '100x100');
          category[i].number = counter++;
          img = $(gImgTemplate(_.extend(category[i], { width: gSize, height: gSize }))).load(checkLoaded).error(checkLoaded);
          gImageMap[category[i].image] = img[0];
        }
      }
    });
  });
});