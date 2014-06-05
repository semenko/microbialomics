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

function renderPage(datum) {
    console.log('Render triggered.');
    $('.jumbotron').hide();
    factbox.show();

    console.log(datum);

    // Fill in our data table
    factbox.find('#dynamic-title').text(datum['genus'] + " " + datum['species']);
    factbox.find('#dynamic-phylum').text(datum['phylum']);
    factbox.find('#dynamic-atcc').text(datum['atcc_id']);
    factbox.find('#dynamic-dsmz').text(datum['dsmz_id']);
    factbox.find('#dynamic-well').text(datum['well']);
    factbox.find('#dynamic-references').html('<a href="' + datum['ncbi_assembly'] + '" target="_blank">See NCBI Assembly <span class="glyphicon glyphicon glyphicon-share-alt"></span></a>');

    // Make our RefSeq ID table


//    renderNCBIviewer(datum['refseq_ids']);
}

function renderNCBIviewer(id) {
    console.log('Rendering NCBI id: ' + id);
    Ext.onReady(function(){
        var app = new SeqView.App('sv1');
        app.load('embedded=true&multipanel=true&slim=false&id=' + id);
    });
}

typeahead_field.bind('typeahead:selected', function(obj, datum, name) {
    renderPage(datum);
});

typeahead_field.bind('typeahead:autocompleted', function(obj, datum, name) {
    renderPage(datum);
});

//typeahead_field.bind('keypress', function(event) { if (event.which === 13) { renderNCBI(); } } );


// TODO: REMOVE THESE LINES WHEN IN PROD!
strains.clearPrefetchCache();

renderPage({"well":"A1","phylum":"Verrucomicrobia","genus":"Akkermansia","species":"muciniphila","atcc_id":"BAA-835","dsmz_id":"22959","ncbi_assembly":"https://www.ncbi.nlm.nih.gov/assembly/GCF_000020225.1/","refseq_ids":"NC_010655.1"});