/* Author:
  Yang Su
*/
var
//Constants
  gSize = 114,
  gSizeSQ = gSize * gSize,
  gTotalCount = 0,
  gIconTemplate = _.template($('#icontemplate').html()),
  $content = $('#content'),
  $state = $('#state'),
  gInfoMap = {},

  gCanvas = document.createElement('canvas'),
  gContext,
  gImgData;

gCanvas.width = gSize;
gCanvas.height = gSize;
gContext = gCanvas.getContext('2d');


var processImages = function () {
  var i, j, pixel, pos, color, sum = Util.rgba(0, 0, 0, 255), $el, c = 0;
  $('img').each(function (ii, image) {
    c += 1;
    $state.html('Processing Images ... ' + c + '/' + gTotalCount);

    $el = $(this);
    gContext.drawImage(image, 0, 0);
    if (!image.width && !image.height) {
      console.log(image);
      return;
    }
    gImgData = gContext.getImageData(0, 0, image.width, image.height);
    pixel = gImgData.data;
    for (i = image.width - 1; i >= 0; i -= 1) {
      for (j = image.height - 1; j >= 0; j -= 1) {
        pos = (i + gImgData.width * j) * 4;
        color = Util.rgba(
          pixel[pos],
          pixel[pos + 1],
          pixel[pos + 2],
          pixel[pos + 3]
        );
        sum.r = sum.r + color.r;
        sum.g = sum.g + color.g;
        sum.b = sum.b + color.b;
        sum.a = sum.a + color.a;
      }
    }
    sum.r = sum.r / gSizeSQ;
    sum.g = sum.g / gSizeSQ;
    sum.b = sum.b / gSizeSQ;
    sum.a = sum.a / gSizeSQ;

    gInfoMap[$el.attr('number')] = {
      rgba : sum,
      hsl : Util.rgbToHsl(sum),
      gray : Util.gray(sum)
    };

  });
  // $state.html('Ready');
  console.log(gInfoMap);
};

var compareFuncs = {
  id : function (a, b) {
    var aa = +$(a).attr('number'),
      bb = +$(b).attr('number');
    return (aa < bb) ? -1 : (aa > bb) ? 1 : 0;
  },
  hue : function (a, b) {
    var aa = (gInfoMap[$(a).attr('number')]) ? gInfoMap[$(a).attr('number')].hsl.h : $(a).attr('number'),
      bb = (gInfoMap[$(b).attr('number')]) ? gInfoMap[$(b).attr('number')].hsl.h : $(b).attr('number');
    return (aa < bb) ? -1 : (aa > bb) ? 1 : 0;
  },
  gray : function (a, b) {
    var aa = (gInfoMap[$(a).attr('number')]) ? gInfoMap[$(a).attr('number')].gray : $(a).attr('number'),
      bb = (gInfoMap[$(b).attr('number')]) ? gInfoMap[$(b).attr('number')].gray : $(b).attr('number');
    return (aa < bb) ? -1 : (aa > bb) ? 1 : 0;
  }
};

var sortFunc = function (type) {
  var togleState = false;
  return function (evt) {
    var list = $('#list'),
      listitems = list.children('li').get();
    listitems.sort(compareFuncs[type]);
    if (togleState) {
      listitems.reverse();
    }
    $.each(listitems, function (idx, itm) { list.append(itm); });
    evt.target.innerHTML = (togleState) ? 'Sort' : 'RSort';
    togleState = !togleState;
  };
};

$('#sort').click(sortFunc('id'));
$('#huesort').click(sortFunc('hue'));
$('#graysort').click(sortFunc('gray'));

$(document).ready(function () {
  var iconslist = $('<ul id="list"></ul>'),
    counter = 0,
    loadedCount = 0,
    checkLoaded = function () {
      loadedCount += 1;
      $state.html('Loading Images ... ' + loadedCount + '/' + gTotalCount);
      if (loadedCount >= gTotalCount) {
        $content.append(iconslist);
        processImages();
      }
    };
  $.getJSON('data/icons.json', function (data) {
    gTotalCount += data.length;
    var i, filename, result;
    for (i = data.length - 1; i >= 0; i -= 1) {
      filename = data[i].image.match(/(s\d{2,3}[a-zA-Z0-9-_.]+)/)[0];
      data[i].image = 'data/icons/' + filename.replace(/(s\d{2,3})/, 's' + gSize);
      data[i].number = counter++;
      result = $(gIconTemplate(data[i]));
      result.find('img').load(checkLoaded).error(checkLoaded);
      iconslist.append(gIconTemplate(data[i]));
    }
    $('img').load(checkLoaded).error(checkLoaded);
  });
  $.getJSON('data/appstore.complete.json', function (data) {
    var c = 0;
    _.each(data, function (category, key) {
      c += 1;
      if (c > 5) return;
      gTotalCount += _.chain(category).pluck('image').compact().value().length;
      var i, filename, result;
      for (i = category.length - 1; i >= 0; i -= 1) {
        if (category[i].image) {
          filename = category[i].image.match(/\/([a-zA-Z0-9-_.]+\.jpg)/)[0];
          category[i].image = 'data/appstore' + filename.replace(/(\d{2,3}x\d{2,3})/, '100x100');
          category[i].number = counter++;
          result = $(gIconTemplate(category[i]));
          result.find('img').load(checkLoaded).error(checkLoaded);
          iconslist.append(result);
        }
      }
    });
  });
});