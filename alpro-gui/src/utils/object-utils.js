// define unique id property
(function () {
  if (typeof Object.id == 'undefined') {
    var id = 0;

    Object.id = function (o) {
      if (typeof o.__uniqueid == 'undefined') {
        Object.defineProperty(o, "__uniqueid", {
          value: ++id,
          enumerable: false,
          writable: false
        });
      }

      return o.__uniqueid;
    }
  }
})();