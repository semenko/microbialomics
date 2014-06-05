"use strict";

var strains = new Bloodhound({
    datumTokenizer: function(d) {
        return Bloodhound.tokenizers.whitespace(d['genus']).concat(Bloodhound.tokenizers.whitespace(d['species']));
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    limit: 15,
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
    if (datum['atcc_id']) {
        factbox.find('#dynamic-atcc a').attr('href', datum['atcc_id']);
        factbox.find('#dynamic-atcc a').text(datum['atcc_id']);

    } else {
        factbox.find('#dynamic-atcc').text("None");
    }

    if (datum['dsmz_id']) {
        factbox.find('#dynamic-dsmz a').attr('href', datum['dsmz_id']);
        factbox.find('#dynamic-dsmz a').text(datum['dsmz_id']);

    } else {
        factbox.find('#dynamic-dsmz').text("None");
    }

    factbox.find('#dynamic-well').text(datum['well']);
    if (datum['ncbi_assembly']) {
        factbox.find('#dynamic-references a').attr('href', datum['ncbi_assembly']);
    } else {
        factbox.find('#dynamic-references').text('None');

    }

    // Make our RefSeq ID table
    if (datum['refseq_ids']) {
        console.log(datum['refseq_ids']);
        var refseq_ids = datum['refseq_ids'].split('|');
        var individual_refseq;
        $.each(refseq_ids, function(index, chunk) {
            console.log(chunk);
            individual_refseq = chunk.split(',');
            console.log(individual_refseq);
            factbox.find('#dynamic-refseq-table tbody').append('<tr><td class="text-muted">' + individual_refseq[1] + '</td><td>' + individual_refseq[0] + '</td><td id="#refseq-' + index + '"></td></tr>');
        });
    }

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

//renderPage(    {"well":"A11","phylum":"Firmicute","genus":"Eubacterium","species":"eligens","atcc_id":"27750","dsmz_id":"3376","ncbi_assembly":"https://www.ncbi.nlm.nih.gov/assembly/GCF_000146185.1/","refseq_ids":"Chromosome,NC_012778.1|Plasmid 1,NC_012782.1|Plasmid 2,NC_012780.1"});