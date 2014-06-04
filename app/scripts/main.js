"use strict";

var strains = new Bloodhound({
    datumTokenizer: function(d) {
        return Bloodhound.tokenizers.whitespace(d['genus']).concat(Bloodhound.tokenizers.whitespace(d['species']));
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    limit: 10,
    prefetch: '../data/93genomes.json'
});
// Start loading the .json
strains.initialize();

var typeahead_field = $('.typeahead');

typeahead_field.typeahead(null, {
    name: 'strains',
    displayKey: function(strain) { return strain['genus'] + " " + strain['species']; },
    source: strains.ttAdapter()
});

var factbox = $('.factbox');

function renderNCBI(datum) {
    console.log('Render triggered.')
    $('.jumbotron').hide();
    factbox.show();

    console.log(datum);

    // Fill in our data table
    factbox.find('.panel-title').text(datum['genus'] + " " + datum['species']);

    Ext.onReady(function(){
        var app = new SeqView.App('sv1');
        app.load('embedded=true&multipanel=true&slim=false&id=NC_010655.1');
    });
}

typeahead_field.bind('typeahead:selected', function(obj, datum, name) {
    renderNCBI(datum);
});

typeahead_field.bind('typeahead:autocompleted', function(obj, datum, name) {
    renderNCBI(datum);
});

//typeahead_field.bind('keypress', function(event) { if (event.which === 13) { renderNCBI(); } } );


// TODO: REMOVE THESE LINES WHEN IN PROD!
strains.clearPrefetchCache();

renderNCBI({"well":"A1","phylum":"Verrucomicrobia","genus":"Akkermansia","species":"muciniphila","atcc_id":"BAA-835","dsmz_id":"22959","ncbi_assembly":"https://www.ncbi.nlm.nih.gov/assembly/GCF_000020225.1/","refseq_ids":"NC_010655.1"});