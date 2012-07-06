var Util = {
  matrix : function (r, c) {
    var rv = new Array(r),
      i;
    for (i = 0; i < r; i += 1) {
      rv[i] = new Array(c);
    }
    return rv;
  }
};