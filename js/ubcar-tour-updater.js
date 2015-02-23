jQuery(document).ready(function($) {
    
    var data = {
        'action' : 'tour_initial',
        'ubcar_tour_offset' : escape_html( jQuery( "#ubcar_tour_display_count" ).val() )
    };
    jQuery.post(ajax_object.ajax_url, data, function(response) {
        display_tours(response);
        if(response.length < 10) {
            jQuery( "#ubcar_tour_forward" ).hide();
        }
        jQuery( "#ubcar_tour_back" ).hide();
    });
    
    // ubcar tour updater
    jQuery( "#ubcar_tour_submit" ).click(function() {
        update_tours();
    });
    
    // ubcar tour forward
    jQuery( "#ubcar_tour_forward" ).click(function() {
        forward_tours();
    });
    
    // ubcar tour backward
    jQuery( "#ubcar_tour_back" ).click(function() {
        backward_tours();
    });
    
    jQuery( "[id^=ubcar_tour_delete_]" ).click(function() {
        delete_tours();
    });
    
    jQuery(function() {
        jQuery( "#ubcar-tour-locations-selected-list, #ubcar-tour-locations-complete-list" ).sortable({
            connectWith: ".ubcar-tour-order-locations"
        });
    });
    
});

/**
 * AJAX call to class-ubcar-admin-tour.php's ubcar_tour_updater_callback() and
 * ubcar_tour_initial(), inserting an ubcar_tour post and updating the window
 */
function update_tours() {
    var tour_locations = [];
    jQuery( "#ubcar-tour-locations-selected-list li input" ).each(function() {
        tour_locations.push( escape_html( jQuery( this ).val() ) );
    });
    var data = {
        'action': 'tour_updater',
        'ubcar_nonce_field': escape_html( jQuery( "#ubcar_nonce_field" ).val() ),
        'ubcar_tour_title': escape_html( jQuery( "#ubcar_tour_title" ).val() ),
        'ubcar_tour_description': escape_html( jQuery( "#ubcar_tour_description" ).val() ),
        'ubcar_tour_locations': tour_locations
    };
    jQuery.post(ajax_object.ajax_url, data, function(response) {
        alert(response);
        data = {
            'action' : 'tour_initial',
            'ubcar_tour_offset' : escape_html( jQuery( "#ubcar_tour_display_count" ).val() )
        };
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            display_tours(response);
            jQuery( "#ubcar_tour_display_count" ).html( 1 );
            jQuery( "#ubcar_tour_back" ).hide();
            if(response.length < 10) {
                jQuery( "#ubcar_tour_forward" ).hide();
            } else {
                jQuery( "#ubcar_tour_forward" ).show();
            }
        });
    });
}

/**
 * AJAX call to class-ubcar-admin-tour.php's ubcar_tour_forward(),
 * incrementing the displayed ubcar_tour posts
 */
function forward_tours() {
    var data = {
        'action' : 'tour_forward',
        'ubcar_tour_offset' : escape_html( jQuery( "#ubcar_tour_display_count" ).html() )
    };
    jQuery.post(ajax_object.ajax_url, data, function(response) {
        display_tours(response);
        var currentPage = parseInt(jQuery( "#ubcar_tour_display_count" ).html());
        jQuery( "#ubcar_tour_display_count" ).html( currentPage + 1 );
        if(response.length < 10) {
            jQuery( "#ubcar_tour_forward" ).hide();
        } else {
            jQuery( "#ubcar_tour_forward" ).show();
        }
        jQuery( "#ubcar_tour_back" ).show();
    });
}

/**
 * AJAX call to class-ubcar-admin-tour.php's ubcar_tour_backward(),
 * decrementing the displayed ubcar_tour posts
 */
function backward_tours() {
    var data = {
        'action' : 'tour_backward',
        'ubcar_tour_offset' : escape_html( jQuery( "#ubcar_tour_display_count" ).html() )
    };
    jQuery.post(ajax_object.ajax_url, data, function(response) {
        display_tours(response);
        var currentPage = parseInt(jQuery( "#ubcar_tour_display_count" ).html()) - 1;
        jQuery( "#ubcar_tour_display_count" ).html( currentPage );
        if(currentPage == 1) {
            jQuery( "#ubcar_tour_back" ).hide();
        }
    });
    jQuery( "#ubcar_tour_forward" ).show();
}

/**
 * AJAX call to class-ubcar-admin-tour.php's ubcar_tour_delete(), deleting the
 * selected ubcar_tour post.
 * 
 * @param {Number} delete_id
 */
function delete_tours( delete_id ) {
    if(confirm("Are you sure you want to delete this tour?")){
        var data = {
            'action' : 'tour_delete',
            'ubcar_nonce_field': escape_html( jQuery( "#ubcar_nonce_field" ).val() ),
            'ubcar_tour_delete_id' : delete_id
        };
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            if( response == false ) {
                alert( "Sorry, you do not have permission to delete that tour." );
            } else {
                display_tours( response );
                jQuery( "#ubcar_tour_display_count" ).html( 1 );
                jQuery( "#ubcar_tour_back" ).hide();
                if(response.length < 10) {
                    jQuery( "#ubcar_tour_forward" ).hide();
                } else {
                    jQuery( "#ubcar_tour_forward" ).show();
                }
            }
        });
    }
}

/**
 * Helper function to display retrieved ubcar_tour posts data.
 * 
 * @param {Object[]} response JSON object of ubcar_tour posts' data
 */
function display_tours( response ) {
    var htmlString = "<tr><td>ID</td><td>Title</td><td>Uploader</td><td>Date Uploaded</td><td>Description</td><td>Locations</td><td>Action</td></tr>";
    for( i in response ) {
        htmlString += '<tr id="ubcar_tour_line_';
        htmlString += response[i].ID;
        htmlString += '"><td>';
        htmlString += response[i].ID;
        htmlString += "</td><td>";
        htmlString += response[i].title;
        htmlString += "</td><td>";
        htmlString += response[i].uploader;
        htmlString += "</td><td>";
        htmlString += response[i].date;
        htmlString += "</td><td>";
        htmlString += response[i].description;
        htmlString += '</td><td><div style="max-height: 200px; overflow: scroll">';
        htmlString += '<ol id="ubcar-tour-locations-display">';
        for( j in response[i].locations ) {
            htmlString += '<li>' + response[i].locations[j].title + ' (#' + response[i].locations[j].ID + ')</li>';
        }
        htmlString += "</ol>";
        htmlString += '</div></td><td><a id="ubcar_tour_edit_';
        htmlString += response[i].ID;
        htmlString += '" class="ubcar-edit-delete-control">Edit</a>/<a class="ubcar-edit-delete-control" id="ubcar_tour_delete_';
        htmlString += response[i].ID;
        htmlString += '">Delete</a></td></tr>';
    }
    if( response.length == 0 ) {
        htmlString = 'No tours found.';
    }
    jQuery( "#ubcar_tour_table" ).html( htmlString );
    
    jQuery( "[id^=ubcar_tour_delete_]" ).click(function() {
        var delete_id = jQuery( this ).attr("id").replace('ubcar_tour_delete_', '');
        delete_tours( delete_id );
    });
    
    jQuery( "[id^=ubcar_tour_edit_]" ).click(function() {
        var edit_id = jQuery( this ).attr("id").replace('ubcar_tour_edit_', '');
        edit_tours( edit_id );
    });
}

/**
 * AJAX call to class-ubcar-admin-tour.php's ubcar_tour_edit(), retrieving an
 * ubcar_tour post's data and formatting it for editing.
 * 
 * @param {Number} edit_id
 */
function edit_tours( edit_id ) {
        var data = {
            'action' : 'tour_edit',
            'ubcar_nonce_field': escape_html( jQuery( "#ubcar_nonce_field" ).val() ),
            'ubcar_tour_edit_id' : edit_id
        };
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            if( response == false ) {
                alert( "Sorry, you do not have permission to edit that tour." );
            } else {
                var htmlString = '<td>';
                htmlString += response.ID;
                htmlString += '</td><td><input type="text" id="ubcar_tour_edit_title_';
                htmlString += response.ID;
                htmlString += '" value="';
                htmlString += response.title;
                htmlString += '" /></td><td>';
                htmlString += response.uploader;
                htmlString += "</td><td>";
                htmlString += response.date;
                htmlString += '</td><td><textarea id="ubcar_tour_edit_description_';
                htmlString += response.ID;
                htmlString += '">';
                htmlString += response.description;
                htmlString += '</textarea></td><td style="text-align: center">';
                htmlString += '<div class="button button-primary" id="ubcar_tour_edit_locations_';
                htmlString += response.ID;
                htmlString += '">Edit Points</div><div class="ubcar-full-screen-popup" id="ubcar_reorder_locations_';
                htmlString += response.ID;
                htmlString += '">';
                htmlString += '<h3>Edit Points for Tour ' + response.ID + '</h3>';
                htmlString += '<div class="button button-primary" id="ubcar_tour_close_edit_locations_';
                htmlString += response.ID;
                htmlString += '">Close</div>';
                
                var htmlStringSelected = '<div class="ubcar-tour-locations">';
                htmlStringSelected += '<h4>Selected Points</h4>';
                htmlStringSelected += '<ul id="ubcar-tour-locations-selected-list-reorder-'
                htmlStringSelected += response.ID;
                htmlStringSelected += '" class="ubcar-tour-reorder-locations-'
                htmlStringSelected += response.ID;
                htmlStringSelected += '">';
                
                var selected_locations = [];
                for( j in response.locations ) {
                    selected_locations[response.locations[j].ID] = true;
                    htmlStringSelected += '<li>' + response.locations[j].title + ' (#' + response.locations[j].ID + ')';
                    htmlStringSelected += '<input type="hidden" value="' + response.locations[j].ID + '">';
                    htmlStringSelected += '</li>';
                }
                htmlStringSelected += '</ul>';
                htmlStringComplete += '</div>';

                var htmlStringComplete = '<div class="ubcar-tour-locations">';
                htmlStringComplete += '<h4>Available Points</h4>';
                htmlStringComplete += '<ul id="ubcar-tour-locations-complete-list-reorder-'
                htmlStringComplete += response.ID;
                htmlStringComplete += '" class="ubcar-tour-reorder-locations-'
                htmlStringComplete += response.ID;
                htmlStringComplete += '">';
                for( j in response.all_locations ) {
                    if( selected_locations[response.all_locations[j].ID] != true ) {
                        htmlStringComplete += '<li>' + response.all_locations[j].title + ' (#' + response.all_locations[j].ID + ')';
                        htmlStringComplete += '<input type="hidden" value="' + response.all_locations[j].ID + '">';
                        htmlStringComplete += '</li>';
                    }
                }
                htmlStringComplete += '</ul>';
                htmlStringComplete += '</div>';

                htmlString += htmlStringComplete;
                htmlString += htmlStringSelected;
                
                htmlString += '</div></td>';
                htmlString += '<td><div class="button button-primary" id="ubcar_tour_edit_submit_';
                htmlString += response.ID;
                htmlString += '">Upload Edit</div></td>';
                jQuery( "#" + "ubcar_tour_line_" + response.ID ).html( htmlString );
            }
            jQuery(function() {
                jQuery( "#ubcar-tour-locations-selected-list-reorder-" + response.ID + ", #ubcar-tour-locations-complete-list-reorder-" + response.ID ).sortable({
                    connectWith: ".ubcar-tour-reorder-locations-" + response.ID
                });
            });
            jQuery( "#ubcar_tour_edit_locations_" + edit_id ).click(function() {
                jQuery( "#ubcar_reorder_locations_" + edit_id ).show();
            });
            jQuery( "#ubcar_tour_close_edit_locations_" + edit_id ).click(function() {
                jQuery( "#ubcar_reorder_locations_" + edit_id ).hide();
            });
            jQuery( "#ubcar_tour_edit_submit_" + edit_id ).click(function() {
                edit_tours_submit(this);
            });
        });
}

/**
 * AJAX call to class-ubcar-admin-tour.php's ubcar_tour_edit_submit(),
 * submitting an ubcar_tour post's edited information and displaying it
 * 
 * @param {Number} thisthis The unique div of the post to be submitted
 */
function edit_tours_submit(thisthis) {
    var edit_id = jQuery( thisthis ).attr("id").replace('ubcar_tour_edit_submit_', '');
    var tour_locations = [];
    jQuery( "#ubcar-tour-locations-selected-list-reorder-" + edit_id + " li input" ).each(function() {
        tour_locations.push( escape_html( jQuery( this ).val() ) );
    });
    var submit_data = {
        'action' : 'tour_edit_submit',
        'ubcar_nonce_field': escape_html( jQuery( "#ubcar_nonce_field" ).val() ),
        'ubcar_tour_edit_id' : edit_id,
        'ubcar_tour_title': escape_html( jQuery( "#ubcar_tour_edit_title_" + edit_id ).val() ),
        'ubcar_tour_description': escape_html( jQuery( "#ubcar_tour_edit_description_" + edit_id ).val() ),
        'ubcar_tour_locations': tour_locations
    };
    jQuery.post(ajax_object.ajax_url, submit_data, function(response) {
        if( response == false ) {
            alert( "Sorry, you do not have permission to delete that tour." );
        } else {
            var htmlString = '<td>';
            htmlString += response.ID;
            htmlString += "</td><td>";
            htmlString += response.title;
            htmlString += "</td><td>";
            htmlString += response.uploader;
            htmlString += "</td><td>";
            htmlString += response.date;
            htmlString += "</td><td>";
            htmlString += response.description;
            htmlString += '</td><td><div style="max-height: 200px; overflow: scroll">';
            htmlString += '<ol id="ubcar-tour-locations-display">';
            for( j in response.locations ) {
                htmlString += '<li>' + response.locations[j].title + ' (#' + response.locations[j].ID + ')</li>';
            }
            htmlString += "</ol>";
            htmlString += '</div></td><td>Updated!</td>';
            jQuery( "#" + "ubcar_tour_line_" + response.ID ).html( htmlString );
        }
    });
}