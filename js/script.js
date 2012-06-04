/* Author:
  Yang Su
*/

$(document).ready(function () {
  var icontemplate = _.template($('#icontemplate').html()),
    content = $('#content'),
    iconpath = 'data/icons/'
    iconslist = $('<ul></ul>');
  $.getJSON('data/icons.json', function (data) {
    var i;
    for (i = data.length - 1; i >= 0; i -= 1) {
      var file = data[i].image.match(/(s\d{2,3}.+\.\w{2,4})/)[0];
      data[i].image = iconpath + file.replace(/(s\d{2,3})/, "s57");
      iconslist.append(icontemplate(data[i]));
    }
    content.append(iconslist);
  })
});