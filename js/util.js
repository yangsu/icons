var Util = {
  matrix : function(r, c) {
    var rv = [],
      i;
    for (i = 0; i < r; i += 1) {
      rv[i] = [];
    }
    return rv;
  },
  identityKernel: [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0]
  ]
};