/*jshint camelcase:false, devel:true, scripturl:false*/
/*global Bloodhound:false, renderNCBIviewer:false, Ext:false, SeqView:false*/
'use strict';

// Enable Bootstrap popover code
$(function () {
    $('[data-toggle="popover"]').popover();
});

var strains = new Bloodhound({
    datumTokenizer: function(d) {
        return Bloodhound.tokenizers.whitespace(d.genus).concat(Bloodhound.tokenizers.whitespace(d.species));
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    limit: 15,
    // Goog Docs -> JSON via https://blaiprat.github.io/tsvToJson/
    prefetch: 'data/93genomes.json'
});
// Start loading the .json
var strain_promise = strains.initialize();

var typeahead_field = $('.typeahead');

typeahead_field.typeahead(null, {
    name: 'strains',
    displayKey: function(strain) { return strain.genus + ' ' + strain.species; },
    source: strains.ttAdapter()
});

// Helper via https://stackoverflow.com/questions/6466135/adding-extra-zeros-in-front-of-a-number-using-jquery
function pad(str, max) {
    str = str.toString();
    return str.length < max ? pad('0' + str, max) : str;
}

var factbox = $('.factbox');

function renderDataTable(datum) {
    // Fill in the factual metadata in the data table
    // Called by renderPage() below.

    factbox.find('#dynamic-title').text(datum.genus + ' ' + datum.species);
    factbox.find('#dynamic-phylum').text(datum.phylum);

    var dynamic_atcc = factbox.find('#dynamic-atcc a');
    var dynamic_dsmz = factbox.find('#dynamic-dsmz a');
    dynamic_atcc.attr('href', 'javascript:;').text('None');
    dynamic_dsmz.attr('href', 'javascript:;').text('None');

    if (datum.atcc_id) {
        dynamic_atcc.attr('href', 'https://www.atcc.org/products/all/' + datum.atcc_id + '.aspx').text(datum.atcc_id);
    }

    if (datum.dsmz_id) {
        dynamic_dsmz.attr('href', 'https://www.dsmz.de/catalogues/details/culture/DSM-' + datum.dsmz_id + '.html').text(datum.dsmz_id);
    }

    factbox.find('#dynamic-well').text(datum.well);

    var factbox_references = factbox.find('#dynamic-references');
    factbox_references.text('');

    if (datum.ncbi_assembly) {
        factbox_references.append('<li><a target="_blank" id="dynamic-references-ncbi">View NCBI Assembly</a> <span class="glyphicon glyphicon-share-alt text-muted"></span></li>');
        factbox_references.find('#dynamic-references-ncbi').attr('href', datum.ncbi_assembly);
    }
    if (datum.taxonomy_url) {
        factbox_references.append('<li><a target="_blank" id="dynamic-references-taxonomy">Taxonomic Data & References</a> <span class="glyphicon glyphicon-share-alt text-muted"></span></li>');
        factbox_references.find('#dynamic-references-taxonomy').attr('href', datum.taxonomy_url);
    }
}

function renderRefSeqTable(datum) {
    var refSeqSelect = factbox.find('#dynamic-refseq-select');
    refSeqSelect.find('option').remove();
    if (datum.refseq_ids || datum.wgs_contigs) {
        $('#sv1').show();
        refSeqSelect.prop('disabled', false);

        if (datum.refseq_ids) {
            var refseq_ids = datum.refseq_ids.split('|');
            var individual_refseq;
            $.each(refseq_ids, function(index, chunk) {
                individual_refseq = chunk.split(',');
                refSeqSelect.append('<option value="' + individual_refseq[1] + '">' + individual_refseq[1] + ' (' + individual_refseq[0] + ')</option>');
            });
        }

        if (datum.wgs_contigs) {
            var wgs_contigs = datum.wgs_contigs.split('-');
            console.log('Parsing WGS range: ' + wgs_contigs);
            var lower_array = wgs_contigs[0].split(/[A-Z]/);
            var upper_array = wgs_contigs[1].split(/[A-Z]/);

            var lower_prefix = wgs_contigs[0].substr(0, lower_array.length - 1);
            var upper_prefix = wgs_contigs[1].substr(0, upper_array.length - 1);
            if (lower_prefix !== upper_prefix) {
                alert('ERROR: Unable to parse contigs! ' + wgs_contigs);
            }

            var zeropad = lower_array[lower_array.length - 1].length;
            var lower_limit = parseInt(lower_array[lower_array.length - 1]);
            var upper_limit = parseInt(upper_array[upper_array.length - 1]);

            var wgs_entry;
            for (var i = lower_limit; i <= upper_limit; i += 1) {
                wgs_entry = lower_prefix + pad(i, zeropad);
                refSeqSelect.append('<option value="' + wgs_entry + '">' + wgs_entry + ' (contig)</option>');
            }
        }

        renderNCBIviewer(refSeqSelect.val());
    } else {
        refSeqSelect.append('<option>(None currently available)</option>').prop('disabled', true);
        $('#sv1').hide();
    }
}

function renderPage(datum) {
    console.log('Render triggered.');
    $('.jumbotron').hide();
    factbox.show();
    $('#browserButton').addClass('active');

    // Fill out the raw data table
    renderDataTable(datum);

    // And make the RefSeq ID table
    renderRefSeqTable(datum);
}

var app;
function renderNCBIviewer(id) {
    console.log('Rendering NCBI id: ' + id);
    if (app) {
        app.GI = id;
        app.loadAccession();
    } else {
        Ext.onReady(function () {
            console.log('Creating new app.');
            app = new SeqView.App('sv1');
            app.load('embedded=true&multipanel=true&slim=false&appname=GordonLabMicrobialomics&tracks=[key:gene_model_track,Options:ShowAll,CDSProductFeats:true]&id=' + id);
        });
    }
}

// Listen to manual select dropdown changes
$('#dynamic-refseq-select').change(function(data) { renderNCBIviewer($( this ).val()); } );

typeahead_field.bind('typeahead:selected', function(obj, datum, name) { renderPage(datum); });

typeahead_field.bind('typeahead:autocompleted', function(obj, datum, name) { renderPage(datum); });

// Hilarious button work for the modal
$('#strain-table').on('show.bs.modal', function (e) { $('#strainListButton').addClass('active'); });

$('#strain-table').on('hide.bs.modal', function (e) { $('#strainListButton').removeClass('active'); });

// Pre-load our 93G table modal.
$(window).load(function(){
    // Promise less important since we don't load from Bloodhound
    strain_promise.done(function(){
        $.getJSON('data/93genomes.json', function( data ) {
            var strain_table_body = $('#strain-table-body');
            $.each( data, function( key, val ) {
                strain_table_body.append('<tr><td>' + val.well + '</td><td>' + val.genus + ' ' + val.species +
                '</td><td>' + val.phylum + '</td><td>' + val.atcc_id + '</td><td>' +  val.dsmz_id + '</td></tr>');
                // Hack to patch up null values
                strain_table_body.html(strain_table_body.html().replace('null','N/A'));
            });
            $('#strain-table-itself').dataTable();
        });
    });
});

// TODO: REMOVE THESE LINES WHEN IN PROD!
// strains.clearPrefetchCache();
