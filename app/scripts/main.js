var strains = new Bloodhound({
  datumTokenizer: function(d) {
        return Bloodhound.tokenizers.whitespace(d['genus']).concat(Bloodhound.tokenizers.whitespace(d['species']));
  },
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  limit: 10,
  prefetch: '../data/93genomes.json'
});

// kicks off the loading/processing of `local` and `prefetch`
strains.initialize();

// passing in `null` for the `options` arguments will result in the default
// options being used
$('.typeahead').typeahead(null, {
  name: 'strains',
  displayKey: function(strain) { return strain['genus'] + " " + strain['species']; },
  // `ttAdapter` wraps the suggestion engine in an adapter that
  // is compatible with the typeahead jQuery plugin
  source: strains.ttAdapter()
});

function renderNCBI() {
    console.log('Render triggered.')
}

$('.typeahead').bind('typeahead:selected', function(obj, datum, name) {
    console.log(obj);
    console.log(datum);
    console.log(name);
    renderNCBI();
});

$('.typeahead').bind('keypress', function(event) { if (event.which === 13) { renderNCBI(); } } );

// TODO: REMOVE THIS LINE WHEN IN PROD!
strains.clearPrefetchCache();
