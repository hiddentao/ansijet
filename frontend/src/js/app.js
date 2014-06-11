var MINI = require('minified');
var _=MINI._, $=MINI.$, $$=MINI.$$, EE=MINI.EE, HTML=MINI.HTML;

$.ready(function() {

  // expandable/collapsible content sections
  $('.expandable').each(function(elem) {
    var collapsed = $('.collapsed', elem)[0];
    var expanded = $('.expanded', elem)[0];

    collapsed.onclick = function() {
      expanded.style.display = 'block';
      collapsed.style.display = 'none';
    };

    expanded.onclick = function() {
      expanded.style.display = 'none';
      collapsed.style.display = 'block';
    };
  });


  // delete buttons
  $('a.delete').on('?click', function(e) {
    var elem = this[0];
    var str = elem.getAttribute('data-item-type') || 'item';

    return confirm('Are you sure you want to delete this ' + str + '?');
  });
});

