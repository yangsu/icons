/* Author:
  Yang Su
*/
var
//Constants
  gSize = 57,
  gSizeSQ = gSize * gSize,
  gIconpath = 'data/icons/',

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


var allLoaded = function () {
  var i, j, pixel, pos, color, sum = Util.rgba(0, 0, 0, 255), $el;
  $('img').each(function (count, image) {
    $el = $(this);
    gContext.drawImage(image, 0, 0);
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
  $state.html('Ready');
};

var sortFunc = (function () {
  var togleState = false,
    compareFunc = function (a, b) {
      var aa = +$(a).attr('id').replace('#', ''),
        bb = +$(b).attr('id').replace('#', '');
      return (aa < bb) ? -1 : (aa > bb) ? 1 : 0;
    };
  return function (evt) {
    var list = $('#list'),
      listitems = list.children('li').get();
    listitems.sort(compareFunc);
    if (togleState) {
      listitems.reverse();
    }
    $.each(listitems, function (idx, itm) { list.append(itm); });
    evt.target.innerHTML = (togleState) ? 'Sort' : 'RSort';
    togleState = !togleState;
  };
}());

$('#sort').click(sortFunc);
$(document).ready(function () {
  var iconslist = $('<ul id="list"></ul>');
  $.getJSON('data/icons.json', function (data) {
    var i, file,
      count = data.length,
      loadedCount = 0,
      checkLoaded = function () {
        loadedCount += 1;
        $state.html(loadedCount + '/' + count);
        if (loadedCount >= count) {
          allLoaded();
        }
      };
    for (i = data.length - 1; i >= 0; i -= 1) {
      file = data[i].image.match(/(s\d{2,3}[a-zA-Z0-9-_.]+)/)[0];
      data[i].image = gIconpath + file.replace(/(s\d{2,3})/, 's' + gSize);
      data[i].number = i;
      iconslist.append(gIconTemplate(data[i]));
    }
    $content.append(iconslist);
    $('img').load(checkLoaded);
  });
});