var strains = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  limit: 10,
  prefetch: {
    // All our available strain data: Name, NCBI Url, ATCC / DSMZ IDs, NCBI info?
    // Converted Google Doc w/ strains to JSON via https://shancarter.github.io/mr-data-converter/
    url: '../data/93genomes.json',
    filter: function(list) {
      return $.map(list, function(strain) { console.log(strain); return { name: strain['genus'] + " " + strain['species'] }; });
    }
  }
});

// kicks off the loading/processing of `local` and `prefetch`
strains.initialize();

// passing in `null` for the `options` arguments will result in the default
// options being used
$('#prefetch .typeahead').typeahead(null, {
  name: 'strains',
  displayKey: 'name',
  // `ttAdapter` wraps the suggestion engine in an adapter that
  // is compatible with the typeahead jQuery plugin
  source: strains.ttAdapter()
});