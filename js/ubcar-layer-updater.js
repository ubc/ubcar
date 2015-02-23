jQuery(document).ready(function($) {
    
    var data = {
        'action' : 'layer_initial',
        'ubcar_layer_offset' : escape_html( jQuery( "#ubcar_layer_display_count" ).val() )
    };
    jQuery.post(ajax_object.ajax_url, data, function(response) {
        display_layers(response);
        if(response.length < 10) {
            jQuery( "#ubcar_layer_forward" ).hide();
        }
        jQuery( "#ubcar_layer_back" ).hide();
    });
    
    // ubcar layer updater
    jQuery( "#ubcar_layer_submit" ).click(function() {
        update_layers();
    });
    
    // ubcar layer forward
    jQuery( "#ubcar_layer_forward" ).click(function() {
        forward_layers();
    });
    
    // ubcar layer backward
    jQuery( "#ubcar_layer_back" ).click(function() {
        backward_layers();
    });
    
    jQuery( "[id^=ubcar_layer_delete_]" ).click(function() {
        delete_layers();
    });
    
});

/**
 * AJAX call to class-ubcar-admin-layer.php's ubcar_layer_updater_callback() and
 * ubcar_layer_initial(), inserting an ubcar_layer post and updating the window
 */
function update_layers() {
    var data = {
        'action': 'layer_updater',
        'ubcar_nonce_field': escape_html( jQuery( "#ubcar_nonce_field" ).val() ),
        'ubcar_layer_title': escape_html( jQuery( "#ubcar_layer_title" ).val() ),
        'ubcar_layer_description': escape_html( jQuery( "#ubcar_layer_description" ).val() ),
        'ubcar_layer_password': escape_html( jQuery( "#ubcar_layer_password" ).prop('checked') )
    };
    jQuery.post(ajax_object.ajax_url, data, function(response) {
        alert(response);
        data = {
            'action' : 'layer_initial',
            'ubcar_layer_offset' : escape_html( jQuery( "#ubcar_layer_display_count" ).val() )
        };
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            display_layers(response);
            jQuery( "#ubcar_layer_display_count" ).html( 1 );
            jQuery( "#ubcar_layer_back" ).hide();
            if(response.length < 10) {
                jQuery( "#ubcar_layer_forward" ).hide();
            } else {
                jQuery( "#ubcar_layer_forward" ).show();
            }
        });
    });
}

/**
 * AJAX call to class-ubcar-admin-layer.php's ubcar_layer_forward(),
 * incrementing the displayed ubcar_layer posts
 */
function forward_layers() {
    var data = {
        'action' : 'layer_forward',
        'ubcar_layer_offset' : jQuery( "#ubcar_layer_display_count" ).html()
    };
    jQuery.post(ajax_object.ajax_url, data, function(response) {
        display_layers(response);
        var currentPage = parseInt(jQuery( "#ubcar_layer_display_count" ).html());
        jQuery( "#ubcar_layer_display_count" ).html( currentPage + 1 );
        if(response.length < 10) {
            jQuery( "#ubcar_layer_forward" ).hide();
        } else {
            jQuery( "#ubcar_layer_forward" ).show();
        }
        jQuery( "#ubcar_layer_back" ).show();
    });
}

/**
 * AJAX call to class-ubcar-admin-layer.php's ubcar_layer_backward(),
 * decrementing the displayed ubcar_layer posts
 */
function backward_layers() {
    var data = {
        'action' : 'layer_backward',
        'ubcar_layer_offset' : escape_html( jQuery( "#ubcar_layer_display_count" ).html() )
    };
    jQuery.post(ajax_object.ajax_url, data, function(response) {
        display_layers(response);
        var currentPage = parseInt(jQuery( "#ubcar_layer_display_count" ).html()) - 1;
        jQuery( "#ubcar_layer_display_count" ).html( currentPage );
        if(currentPage == 1) {
            jQuery( "#ubcar_layer_back" ).hide();
        }
    });
    jQuery( "#ubcar_layer_forward" ).show();
}

/**
 * AJAX call to class-ubcar-admin-layer.php's ubcar_layer_delete(), deleting the
 * selected ubcar_layer post.
 * 
 * @param {Number} delete_id
 */
function delete_layers( delete_id ) {
    if(confirm("Are you sure you want to delete this layer?")){
        var data = {
            'action' : 'layer_delete',
            'ubcar_nonce_field': escape_html( jQuery( "#ubcar_nonce_field" ).val() ),
            'ubcar_layer_delete_id' : delete_id
        };
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            if( response == false ) {
                alert( "Sorry, you do not have permission to delete that layer." );
            } else {
                display_layers( response );
                jQuery( "#ubcar_layer_display_count" ).html( 1 );
                jQuery( "#ubcar_layer_back" ).hide();
                if(response.length < 10) {
                    jQuery( "#ubcar_layer_forward" ).hide();
                } else {
                    jQuery( "#ubcar_layer_forward" ).show();
                }
            }
        });
    }
}

/**
 * Helper function to display retrieved ubcar_layer posts data.
 * 
 * @param {Object[]} response JSON object of ubcar_layer posts' data
 */
function display_layers( response ) {
    var htmlString = "<tr><td>ID</td><td>Title</td><td>Uploader</td><td>Date Uploaded</td><td>Description</td><td>Blocked?</td><td>Action</td></tr>";
    for( i in response ) {
        htmlString += '<tr id="ubcar_layer_line_';
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
        htmlString += '</td><td style="text-align: center">';
        htmlString += '<input type="checkbox" disabled';
        if( response[i].password == 'true' ) {
            htmlString += ' checked';
        }
        htmlString += '></td><td><a id="ubcar_layer_edit_';
        htmlString += response[i].ID;
        htmlString += '" class="ubcar-edit-delete-control">Edit</a>/<a class="ubcar-edit-delete-control" id="ubcar_layer_delete_';
        htmlString += response[i].ID;
        htmlString += '">Delete</a></td></tr>';
    }
    if( response.length == 0 ) {
        htmlString = 'No layers found.';
    }
    jQuery( "#ubcar_layer_table" ).html( htmlString );
    
    jQuery( "[id^=ubcar_layer_delete_]" ).click(function() {
        var delete_id = jQuery( this ).attr("id").replace('ubcar_layer_delete_', '');
        delete_layers( delete_id );
    });
    
    jQuery( "[id^=ubcar_layer_edit_]" ).click(function() {
        var edit_id = jQuery( this ).attr("id").replace('ubcar_layer_edit_', '');
        edit_layers( edit_id );
    });
}

/**
 * AJAX call to class-ubcar-admin-layer.php's ubcar_layer_edit(), retrieving an
 * ubcar_layer post's data and formatting it for editing.
 * 
 * @param {Number} edit_id
 */
function edit_layers( edit_id ) {
        var data = {
            'action' : 'layer_edit',
            'ubcar_nonce_field': escape_html( jQuery( "#ubcar_nonce_field" ).val() ),
            'ubcar_layer_edit_id' : edit_id
        };
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            if( response == false ) {
                alert( "Sorry, you do not have pssermission to edit that layer." );
            } else {
                var htmlString = '<td>';
                htmlString += response.ID;
                htmlString += '</td><td><input type="text" id="ubcar_layer_edit_title_';
                htmlString += response.ID;
                htmlString += '" value="';
                htmlString += response.title;
                htmlString += '" /></td><td>';
                htmlString += response.uploader;
                htmlString += "</td><td>";
                htmlString += response.date;
                htmlString += '</td><td><textarea id="ubcar_layer_edit_description_';
                htmlString += response.ID;
                htmlString += '">';
                htmlString += response.description;
                htmlString += '</textarea></td><td style="text-align: center"><input type="checkbox" id="ubcar_layer_edit_password_';
                htmlString += response.ID;
                htmlString += '"';
                if( response.password == 'true' ) {
                    htmlString += ' checked';
                }
                htmlString += '></td><td><div class="button button-primary" id="ubcar_layer_edit_submit_';
                htmlString += response.ID;
                htmlString += '">Upload Edit</div></td>';
                jQuery( "#" + "ubcar_layer_line_" + response.ID ).html( htmlString );
            }
            jQuery( "#ubcar_layer_edit_submit_" + edit_id ).click(function() {
                edit_layers_submit(this);
            });
        });
}

/**
 * AJAX call to class-ubcar-admin-layer.php's ubcar_layer_edit_submit(),
 * submitting an ubcar_layer post's edited information and displaying it
 * 
 * @param {Number} thisthis The unique div of the post to be submitted
 */
function edit_layers_submit(thisthis) {
    var edit_id = jQuery( thisthis ).attr("id").replace('ubcar_layer_edit_submit_', '');
    var submit_data = {
        'action' : 'layer_edit_submit',
        'ubcar_nonce_field': escape_html( jQuery( "#ubcar_nonce_field" ).val() ),
        'ubcar_layer_edit_id' : edit_id,
        'ubcar_layer_title': escape_html( jQuery( "#ubcar_layer_edit_title_" + edit_id ).val() ),
        'ubcar_layer_description': escape_html( jQuery( "#ubcar_layer_edit_description_" + edit_id ).val() ),
        'ubcar_layer_password': escape_html( jQuery( "#ubcar_layer_edit_password_" + edit_id ).prop('checked') )
    };
    jQuery.post(ajax_object.ajax_url, submit_data, function(response) {
        if( response == false ) {
            alert( "Sorry, you do not have permission to delete that layer." );
        } else {
            var htmlString = '<td>';
            htmlString += response.ID;
            htmlString += '</td><td>';
            htmlString += response.title;
            htmlString += '</td><td>';
            htmlString += response.uploader;
            htmlString += '</td><td>';
            htmlString += response.date;
            htmlString += '</td><td>';
            htmlString += response.description;
            htmlString += '</td><td style="text-align: center"><input type="checkbox"';
            if( response.password == 'true' ) {
                htmlString += ' checked';
            }
            htmlString += ' disabled></td><td>Updated!</td>';
            jQuery( "#" + "ubcar_layer_line_" + response.ID ).html( htmlString );
        }
    });
}