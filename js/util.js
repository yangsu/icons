var Util = {
  matrix : function (r, c) {
    var rv = new Array(r),
      i;
    for (i = 0; i < r; i += 1) {
      rv[i] = new Array(c);
    }
    return rv;
  },
  identityKernel: [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
  ]
};