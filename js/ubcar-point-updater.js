jQuery(document).ready(function($) {
    
    var requested_latlng = new google.maps.LatLng(49.2683366, -123.2550359);
    var mapOptions = {
        zoom: 10,
        center: requested_latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById('ubcar-map-canvas'), mapOptions);
    var marker = new google.maps.Marker({
    });
    
    var data = {
        'action' : 'point_initial'
    };
    jQuery.post(ajax_object.ajax_url, data, function(response) {
        display_points(response);
        if(response.length < 10) {
            jQuery( "#ubcar_point_forward" ).hide();
        }
        jQuery( "#ubcar_point_back" ).hide();
    });
    
    // ubcar point updater
    jQuery( "#ubcar_point_submit" ).click(function() {
        update_points();
    });
    
    // ubcar point forward
    jQuery( "#ubcar_point_forward" ).click(function() {
        forward_points();
    });
    
    // ubcar point backward
    jQuery( "#ubcar_point_back" ).click(function() {
        backward_points();
    });
    
    jQuery( "[id^=ubcar_point_delete_]" ).click(function() {
        delete_points();
    });
    
    google.maps.event.addListener(map, 'click', function(event) {
        jQuery( "#ubcar_point_longitude" ).val( event.latLng.lng() );
        jQuery( "#ubcar_point_latitude" ).val( event.latLng.lat() );
        marker.setPosition( event.latLng );
        marker.setMap( map );
    });
    
    jQuery( "#ubcar_point_latlng_check" ).click(function() {
        requested_latlng = new google.maps.LatLng( escape_html( jQuery( "#ubcar_point_latitude" ).val() ), escape_html( jQuery( "#ubcar_point_longitude" ).val() ) );
        map.setCenter( requested_latlng );
        marker.setPosition( requested_latlng );
        marker.setMap( map );
    });
    
});

/**
 * AJAX call to class-ubcar-admin-point.php's ubcar_point_updater_callback() and
 * ubcar_point_initial(), inserting an ubcar_point post and updating the window
 */
function update_points() {
    var data = {
        'action': 'point_updater',
        'ubcar_nonce_field': escape_html( jQuery( "#ubcar_nonce_field" ).val() ),
        'ubcar_point_title': escape_html( jQuery( "#ubcar_point_title" ).val() ),
        'ubcar_point_description': escape_html( jQuery( "#ubcar_point_description" ).val() ),
        'ubcar_point_latitude': escape_html( jQuery( "#ubcar_point_latitude" ).val() ),
        'ubcar_point_longitude': escape_html( jQuery( "#ubcar_point_longitude" ).val() ),
        'ubcar_point_tags': escape_html( jQuery( "#ubcar_point_tags" ).val() )
    };
    jQuery.post(ajax_object.ajax_url, data, function(response) {
        alert(response);
        data = {
            'action' : 'point_initial'
        };
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            display_points(response);
            jQuery( "#ubcar_point_display_count" ).html( 1 );
            jQuery( "#ubcar_point_back" ).hide();
            if(response.length < 10) {
                jQuery( "#ubcar_point_forward" ).hide();
            } else {
                jQuery( "#ubcar_point_forward" ).show();
            }
        });
    });
}

/**
 * AJAX call to class-ubcar-admin-point.php's ubcar_point_forward(),
 * incrementing the displayed ubcar_point posts
 */
function forward_points() {
    var data = {
        'action' : 'point_forward',
        'ubcar_point_offset' : escape_html( jQuery( "#ubcar_point_display_count" ).html() )
    };
    jQuery.post(ajax_object.ajax_url, data, function(response) {
        display_points(response);
        var currentPage = parseInt(jQuery( "#ubcar_point_display_count" ).html());
        jQuery( "#ubcar_point_display_count" ).html( currentPage + 1 );
        if(response.length < 10) {
            jQuery( "#ubcar_point_forward" ).hide();
        } else {
            jQuery( "#ubcar_point_forward" ).show();
        }
        jQuery( "#ubcar_point_back" ).show();
    });
}

/**
 * AJAX call to class-ubcar-admin-point.php's ubcar_point_backward(),
 * decrementing the displayed ubcar_point posts
 */
function backward_points() {
    var data = {
        'action' : 'point_backward',
        'ubcar_point_offset' : escape_html( jQuery( "#ubcar_point_display_count" ).html() )
    };
    jQuery.post(ajax_object.ajax_url, data, function(response) {
        display_points(response);
        var currentPage = parseInt(jQuery( "#ubcar_point_display_count" ).html()) - 1;
        jQuery( "#ubcar_point_display_count" ).html( currentPage );
        if(currentPage == 1) {
            jQuery( "#ubcar_point_back" ).hide();
        }
    });
    jQuery( "#ubcar_point_forward" ).show();
}

/**
 * AJAX call to class-ubcar-admin-point.php's ubcar_point_delete(), deleting the
 * selected ubcar_point post.
 * 
 * @param {Number} delete_id
 */
function delete_points( delete_id ) {
    if(confirm("Are you sure you want to delete this point?")){
        var data = {
            'action' : 'point_delete',
            'ubcar_nonce_field': escape_html( jQuery( "#ubcar_nonce_field" ).val() ),
            'ubcar_point_delete_id' : delete_id
        };
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            if( response == false ) {
                alert( "Sorry, you do not have permission to delete that point." );
            } else {
                display_points( response );
                jQuery( "#ubcar_point_display_count" ).html( 1 );
                jQuery( "#ubcar_point_back" ).hide();
                if(response.length < 10) {
                    jQuery( "#ubcar_point_forward" ).hide();
                } else {
                    jQuery( "#ubcar_point_forward" ).show();
                }
            }
        });
    }
}

/**
 * Helper function to display retrieved ubcar_point posts data.
 * 
 * @param {Object[]} response JSON object of ubcar_point posts' data
 */
function display_points( response ) {
    var htmlString = "<tr><td>ID</td><td>Title</td><td>Uploader</td><td>Date Uploaded</td><td>Description</td><td>Latitude</td><td>Longitude</td><td>Tags</td><td>Action</td></tr>";
    for( i in response ) {
        htmlString += '<tr id="ubcar_point_line_';
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
        htmlString += "</td><td>";
        htmlString += response[i].latitude;
        htmlString += "</td><td>";
        htmlString += response[i].longitude;
        htmlString += "</td><td>";
        htmlString += response[i].tags;
        htmlString += '</td><td><a id="ubcar_point_edit_';
        htmlString += response[i].ID;
        htmlString += '" class="ubcar-edit-delete-control">Edit</a>/<a class="ubcar-edit-delete-control" id="ubcar_point_delete_';
        htmlString += response[i].ID;
        htmlString += '">Delete</a></td></tr>';
    }
    if( response.length == 0 ) {
        htmlString = 'No points found.';
    }
    jQuery( "#ubcar_point_table" ).html( htmlString );
    
    jQuery( "[id^=ubcar_point_delete_]" ).click(function() {
        var delete_id = jQuery( this ).attr("id").replace('ubcar_point_delete_', '');
        delete_points( delete_id );
    });
    
    jQuery( "[id^=ubcar_point_edit_]" ).click(function() {
        var edit_id = jQuery( this ).attr("id").replace('ubcar_point_edit_', '');
        edit_points( edit_id );
    });
}

/**
 * AJAX call to class-ubcar-admin-point.php's ubcar_point_edit(), retrieving an
 * ubcar_point post's data and formatting it for editing.
 * 
 * @param {Number} edit_id
 */
function edit_points( edit_id ) {
        var data = {
            'action' : 'point_edit',
            'ubcar_nonce_field': escape_html( jQuery( "#ubcar_nonce_field" ).val() ),
            'ubcar_point_edit_id' : edit_id
        };
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            if( response == false ) {
                alert( "Sorry, you do not have pssermission to edit that point." );
            } else {
                var htmlString = '<td>';
                htmlString += response.ID;
                htmlString += '</td><td><input type="text" id="ubcar_point_edit_title_';
                htmlString += response.ID;
                htmlString += '" value="';
                htmlString += response.title;
                htmlString += '" /></td><td>';
                htmlString += response.uploader;
                htmlString += "</td><td>";
                htmlString += response.date;
                htmlString += '</td><td><textarea id="ubcar_point_edit_description_';
                htmlString += response.ID;
                htmlString += '">';
                htmlString += response.description;
                htmlString += '</textarea></td><td><input type="text" id="ubcar_point_edit_latitude_';
                htmlString += response.ID;
                htmlString += '" value="';
                htmlString += response.latitude;
                htmlString += '" /></td><td><input type="text" id="ubcar_point_edit_longitude_';
                htmlString += response.ID;
                htmlString += '" value="';
                htmlString += response.longitude;
                htmlString += '" /></td><td><input type="text" id="ubcar_point_edit_tags_';
                htmlString += response.ID;
                htmlString += '" value="';
                htmlString += response.tags;
                htmlString += '" /></td><td><div class="button button-primary" id="ubcar_point_edit_submit_';
                htmlString += response.ID;
                htmlString += '">Upload Edit</div></td>';
                jQuery( "#" + "ubcar_point_line_" + response.ID ).html( htmlString );
            }
            jQuery( "#ubcar_point_edit_submit_" + edit_id ).click(function() {
                edit_points_submit(this);
            });
        });
}

/**
 * AJAX call to class-ubcar-admin-point.php's ubcar_point_edit_submit(),
 * submitting an ubcar_point post's edited information and displaying it
 * 
 * @param {Number} thisthis The unique div of the post to be submitted
 */
function edit_points_submit( thisthis ) {
    var edit_id = jQuery( thisthis ).attr("id").replace('ubcar_point_edit_submit_', '');
    var submit_data = {
        'action' : 'point_edit_submit',
        'ubcar_nonce_field': escape_html( jQuery( "#ubcar_nonce_field" ).val() ),
        'ubcar_point_edit_id' : edit_id,
        'ubcar_point_title': escape_html( jQuery( "#ubcar_point_edit_title_" + edit_id ).val() ),
        'ubcar_point_description': escape_html( jQuery( "#ubcar_point_edit_description_" + edit_id ).val() ),
        'ubcar_point_latitude': escape_html( jQuery( "#ubcar_point_edit_latitude_" + edit_id ).val() ),
        'ubcar_point_longitude': escape_html( jQuery( "#ubcar_point_edit_longitude_" + edit_id ).val() ),
        'ubcar_point_tags': escape_html( jQuery( "#ubcar_point_edit_tags_" + edit_id ).val() )
    };
    jQuery.post(ajax_object.ajax_url, submit_data, function(response) {
        if( response == false ) {
            alert( "Sorry, you do not have permission to delete that point." );
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
            htmlString += "</td><td>";
            htmlString += response.latitude;
            htmlString += "</td><td>";
            htmlString += response.longitude;
            htmlString += "</td><td>";
            htmlString += response.tags;
            htmlString += '</td><td>Updated!</td>';
            jQuery( "#" + "ubcar_point_line_" + response.ID ).html( htmlString );
        }
    });
}