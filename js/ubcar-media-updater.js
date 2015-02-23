jQuery(document).ready(function($) {
    
    var data = {
        'action' : 'media_initial',
        'ubcar_media_offset' : escape_html( jQuery( "#ubcar_media_display_count" ).val() ),
        'ubcar_author_name': escape_html( jQuery( "#ubcar-author-name" ).val() )
    };
    jQuery.post(ajax_object.ajax_url, data, function(response) {
        display_medias(response);
        if(response.length < 10) {
            jQuery( "#ubcar_media_forward" ).hide();
        }
        jQuery( "#ubcar_media_back" ).hide();
    });
    
    jQuery( "#ubcar_media_type" ).change(function() {
        switch(this.value) {
            case "image":
                jQuery( ".ubcar-add-media-image" ).show();
                jQuery( ".ubcar-add-media-video" ).hide();
                jQuery( ".ubcar-add-media-audio" ).hide();
                jQuery( ".ubcar-add-media-imagewp" ).hide();
                jQuery( ".ubcar-add-media-external" ).hide();
                jQuery( ".ubcar-add-media-wiki" ).hide();
                jQuery( "#ubcar_media_wiki_warning" ).hide();
                break;
            case "audio":
                jQuery( ".ubcar-add-media-image" ).hide();
                jQuery( ".ubcar-add-media-video" ).hide();
                jQuery( ".ubcar-add-media-audio" ).show();
                jQuery( ".ubcar-add-media-imagewp" ).hide();
                jQuery( ".ubcar-add-media-external" ).hide();
                jQuery( ".ubcar-add-media-wiki" ).hide();
                jQuery( "#ubcar_media_wiki_warning" ).hide();
                break;
            case "video":
                jQuery( ".ubcar-add-media-image" ).hide();
                jQuery( ".ubcar-add-media-video" ).show();
                jQuery( ".ubcar-add-media-audio" ).hide();
                jQuery( ".ubcar-add-media-imagewp" ).hide();
                jQuery( ".ubcar-add-media-external" ).hide();
                jQuery( ".ubcar-add-media-wiki" ).hide();
                jQuery( "#ubcar_media_wiki_warning" ).hide();
                break;
            case "imagewp":
                jQuery( ".ubcar-add-media-image" ).hide();
                jQuery( ".ubcar-add-media-video" ).hide();
                jQuery( ".ubcar-add-media-audio" ).hide();
                jQuery( ".ubcar-add-media-imagewp" ).show();
                jQuery( ".ubcar-add-media-external" ).hide();
                jQuery( ".ubcar-add-media-wiki" ).hide();
                jQuery( "#ubcar_media_wiki_warning" ).hide();
                break;
            case "external":
                jQuery( ".ubcar-add-media-image" ).hide();
                jQuery( ".ubcar-add-media-video" ).hide();
                jQuery( ".ubcar-add-media-audio" ).hide();
                jQuery( ".ubcar-add-media-imagewp" ).hide();
                jQuery( ".ubcar-add-media-external" ).show();
                jQuery( ".ubcar-add-media-wiki" ).hide();
                jQuery( "#ubcar_media_wiki_warning" ).hide();
                break;
            case "wiki":
                jQuery( ".ubcar-add-media-image" ).hide();
                jQuery( ".ubcar-add-media-video" ).hide();
                jQuery( ".ubcar-add-media-audio" ).hide();
                jQuery( ".ubcar-add-media-imagewp" ).hide();
                jQuery( ".ubcar-add-media-external" ).hide();
                jQuery( ".ubcar-add-media-wiki" ).show();
                jQuery( "#ubcar_media_wiki_warning" ).show();
                break;
        }
    });
    
    // ubcar media forward
    jQuery( "#ubcar_media_forward" ).click(function() {
        forward_medias();
    });
    
    // ubcar media backward
    jQuery( "#ubcar_media_back" ).click(function() {
        backward_medias();
    });
    
    jQuery( "[id^=ubcar_media_delete_]" ).click(function() {
        delete_medias();
    });
    
});

/**
 * AJAX call to class-ubcar-admin-medium.php's ubcar_media_forward(),
 * incrementing the displayed ubcar_medium posts
 */
function forward_medias() {
    var data = {
        'action' : 'media_forward',
        'ubcar_media_offset' : escape_html( jQuery( "#ubcar_media_display_count" ).html() ),
        'ubcar_author_name': escape_html( jQuery( "#ubcar-author-name" ).val() )
    };
    jQuery.post(ajax_object.ajax_url, data, function(response) {
        display_medias(response);
        var currentPage = parseInt(jQuery( "#ubcar_media_display_count" ).html());
        jQuery( "#ubcar_media_display_count" ).html( currentPage + 1 );
        if(response.length < 10) {
            jQuery( "#ubcar_media_forward" ).hide();
        } else {
            jQuery( "#ubcar_media_forward" ).show();
        }
        jQuery( "#ubcar_media_back" ).show();
    });
}

/**
 * AJAX call to class-ubcar-admin-medium.php's ubcar_media_backward(),
 * decrementing the displayed ubcar_medium posts
 */
function backward_medias() {
    var data = {
        'action' : 'media_backward',
        'ubcar_media_offset' : escape_html( jQuery( "#ubcar_media_display_count" ).html() ),
        'ubcar_author_name': escape_html( jQuery( "#ubcar-author-name" ).val() )
    };
    jQuery.post(ajax_object.ajax_url, data, function(response) {
        display_medias(response);
        var currentPage = parseInt(jQuery( "#ubcar_media_display_count" ).html()) - 1;
        jQuery( "#ubcar_media_display_count" ).html( currentPage );
        if(currentPage == 1) {
            jQuery( "#ubcar_media_back" ).hide();
        }
    });
    jQuery( "#ubcar_media_forward" ).show();
}

/**
 * AJAX call to class-ubcar-admin-medium.php's ubcar_media_delete(), deleting
 * the selected ubcar_medium post.
 * 
 * @param {Number} delete_id
 */
function delete_medias( delete_id ) {
    if(confirm("Are you sure you want to delete this media?")){
        var data = {
            'action' : 'media_delete',
            'ubcar_nonce_field': escape_html( jQuery( "#ubcar_nonce_field" ).val() ),
            'ubcar_media_delete_id' : delete_id,
            'ubcar_author_name': escape_html( jQuery( "#ubcar-author-name" ).val() )
        };
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            if( response === '1' ) {
                alert( "Sorry, you do not have permission to delete that media." );
            } else {
                display_medias( response );
                jQuery( "#ubcar_media_display_count" ).html( 1 );
                jQuery( "#ubcar_media_back" ).hide();
                if(response.length < 10) {
                    jQuery( "#ubcar_media_forward" ).hide();
                } else {
                    jQuery( "#ubcar_media_forward" ).show();
                }
            }
        });
    }
}

/**
 * Helper function to display retrieved ubcar_medium posts data.
 * 
 * @param {Object[]} response JSON object of ubcar_medium posts' data
 */
function display_medias( response ) {
    var htmlString = "<tr><td>ID</td><td>Preview</td><td>Title</td><td>Uploader</td><td>Date Uploaded</td><td>Description</td><td>Location</td><td>Layers</td><td>Hide?</td><td>Action</td></tr>";
    for( i in response ) {
        htmlString += '<tr id="ubcar_media_line_';
        htmlString += response[i].ID;
        htmlString += '"><td>';
        htmlString += response[i].ID;
        htmlString += '</td><td style="text-align: center">';
        if( response[i].type == 'image' ) {
            htmlString += '<a href="';
            htmlString += response[i].full_size_url;
            htmlString += '" TARGET="_blank"><img src="';
            htmlString += response[i].url;
            htmlString += '" alt="';
            htmlString += response[i].title;
            htmlString += '" /></a>';
        } else if( response[i].type == 'video' ) {
            htmlString += '<iframe width="150" height="150" src="//www.youtube.com/embed/' + response[i].url + '" frameborder="0" allowfullscreen></iframe>';
        } else if( response[i].type == 'audio' ) {
            htmlString += '<iframe width="150" height="150" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + response[i].url + '&amp;auto_play=false&amp;hide_related=true&amp;show_comments=false&amp;show_user=true&amp;show_reposts=false&amp;visual=false"></iframe>';
        } else if( response[i].type == 'external' || response[i].type == 'wiki' ) {
            htmlString += '<input disabled type="text" value="' + response[i].url + '">';
        }
        htmlString += '</td><td>';
        htmlString += response[i].title;
        htmlString += "</td><td>";
        htmlString += response[i].uploader;
        htmlString += "</td><td>";
        htmlString += response[i].date;
        htmlString += "</td><td>";
        htmlString += response[i].description;
        htmlString += "</td><td>";
        if( response[i].location != null ) {
            htmlString += response[i].location.title + ' (#' + response[i].location.ID + ')';
        }
        htmlString += "</td><td>";
        htmlString += '<select multiple disabled size="5">';
        for( j in response[i].layers ) {
            htmlString += '<option value="' + response[i].layers[j].ID + '">' + response[i].layers[j].title + ' (#' + response[i].layers[j].ID + ')</option>';
        }
        htmlString += "</select>";
        htmlString += '</td><td style="text-align: center"><input type="checkbox" disabled ';
        if( response[i].hidden == 'on' ) {
            htmlString += 'checked ';
        }
        htmlString += '/></td><td><a id="ubcar_media_edit_';
        htmlString += response[i].ID;
        htmlString += '" class="ubcar-edit-delete-control">Edit</a>/<a class="ubcar-edit-delete-control" id="ubcar_media_delete_';
        htmlString += response[i].ID;
        htmlString += '">Delete</a></td></tr>';
    }
    if( response.length == 0 ) {
        htmlString = 'No media found.';
    }
    jQuery( "#ubcar_media_table" ).html( htmlString );
    
    jQuery( "[id^=ubcar_media_delete_]" ).click(function() {
        var delete_id = jQuery( this ).attr("id").replace('ubcar_media_delete_', '');
        delete_medias( delete_id );
    });
    
    jQuery( "[id^=ubcar_media_edit_]" ).click(function() {
        var edit_id = jQuery( this ).attr("id").replace('ubcar_media_edit_', '');
        edit_medias( edit_id );
    });
}

/**
 * AJAX call to class-ubcar-admin-medium.php's ubcar_media_edit(), retrieving an
 * ubcar_medium post's data and formatting it for editing.
 * 
 * @param {Number} edit_id
 */
function edit_medias( edit_id ) {
        var data = {
            'action' : 'media_edit',
            'ubcar_nonce_field': escape_html( jQuery( "#ubcar_nonce_field" ).val() ),
            'ubcar_media_edit_id' : edit_id
        };
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            if( response == false ) {
                alert( "Sorry, you do not have permission to edit that media." );
            } else {
                var htmlString = '<td>';
                htmlString += response.ID;
                htmlString += '</td><td style="text-align: center">';
                if( response.type == 'image' ) {
                    htmlString += '<a href="';
                    htmlString += response.full_size_url;
                    htmlString += '" TARGET="_blank"><img src="';
                    htmlString += response.url;
                    htmlString += '" alt="';
                    htmlString += response.title;
                    htmlString += '" /></a>';
                } else if( response.type == 'video' ) {
                    htmlString += '<iframe width="150" height="150" src="//www.youtube.com/embed/' + response.url + '" frameborder="0" allowfullscreen></iframe>';
                } else if( response.type == 'audio' ) {
                    htmlString += '<iframe width="150" height="150" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + response.url + '&amp;auto_play=false&amp;hide_related=true&amp;show_comments=false&amp;show_user=true&amp;show_reposts=false&amp;visual=false"></iframe>';
                } else if( response.type == 'external' || response.type == 'wiki' ) {
                    htmlString += '<input disabled type="text" value="' + response.url + '">';
                }
                htmlString += '</td><td><input type="text" id="ubcar_media_edit_title_';
                htmlString += response.ID;
                htmlString += '" value="';
                htmlString += response.title;
                htmlString += '" /></td><td>';
                htmlString += response.uploader;
                htmlString += "</td><td>";
                htmlString += response.date;
                htmlString += '</td><td><textarea ';
                if( response.type == 'wiki' ) {
                    htmlString += 'disabled ';
                }
                htmlString += 'id="ubcar_media_edit_description_';
                htmlString += response.ID;
                htmlString += '">';
                htmlString += response.description;
                htmlString += '</textarea></td><td><select id="ubcar_media_edit_location_';
                htmlString += response.ID;
                htmlString += '">';
                htmlString += '<option value="">---</option>';
                for( j in response.all_locations ) {
                    htmlString += '<option ';
                    if( response.all_locations[j].ID == response.location.ID ) {
                        htmlString += 'selected ';
                    }
                    htmlString += 'value="' + response.all_locations[j].ID + '">' + response.all_locations[j].title + ' (#' + response.all_locations[j].ID + ')</option>';
                }
                htmlString += '"</select></td><td><select multiple id="ubcar_media_edit_layers_';
                htmlString += response.ID;
                htmlString += '">';
                var selected_layers = [];
                for( j in response.layers ) {
                    selected_layers[response.layers[j].ID] = true;
                }
                for( j in response.all_layers ) {
                    htmlString += '<option ';
                    if( selected_layers[response.all_layers[j].ID] == true ) {
                        htmlString += 'selected ';
                    }
                    htmlString += 'value="' + response.all_layers[j].ID + '">' + response.all_layers[j].title + ' (#' + response.all_layers[j].ID + ')</option>';
                }
                htmlString += '"</select></td><td style="text-align: center"><input type="checkbox" id="ubcar_media_edit_hidden_';
                htmlString += response.ID;
                htmlString += '"';
                if( response.hidden == 'on' ) {
                    htmlString += ' checked ';
                }
                htmlString += '/></td><td><div class="button button-primary" id="ubcar_media_edit_submit_';
                htmlString += response.ID;
                htmlString += '">Upload Edit</div></td>';
                jQuery( "#ubcar_media_line_" + response.ID ).html( htmlString );
            }
            jQuery( "#ubcar_media_edit_submit_" + edit_id ).click(function() {
                edit_medias_submit(this, selected_layers, response.location.ID );
            });
        });
}

/**
 * AJAX call to class-ubcar-admin-medium.php's ubcar_media_edit_submit(),
 * submitting an ubcar_medium post's edited information and displaying it
 * 
 * @param {Number} thisthis The unique div of the post to be submitted
 */
function edit_medias_submit( thisthis, old_selected_layers, old_location ) {
    var edit_id = jQuery( thisthis ).attr("id").replace('ubcar_media_edit_submit_', '');
    var new_selected_layers = escape_html( jQuery( "#ubcar_media_edit_layers_" + edit_id ).val() );
    var removed_selected_layers = old_selected_layers;
    var added_selected_layers = [];
    var added_selected_layers_to_send = [];
    var removed_selected_layers_to_send = [];
    for( j in new_selected_layers ) {
        added_selected_layers[new_selected_layers[j]] = true;
    }
    for( i in removed_selected_layers ) {
        if( added_selected_layers[i] == true) {
            removed_selected_layers[i] = null;
        }
    }
    for( i in old_selected_layers ) {
        if( added_selected_layers[i] == true ) {
            added_selected_layers[i] = null;
        }
    }
    for( i in removed_selected_layers ) {
        if( removed_selected_layers[i] != null ) {
            removed_selected_layers_to_send.push(i);
        }
    }
    for( i in added_selected_layers ) {
        if( added_selected_layers[i] != null ) {
            added_selected_layers_to_send.push(i);
        }
    }
    var submit_data = {
        'action' : 'media_edit_submit',
        'ubcar_nonce_field': escape_html( jQuery( "#ubcar_nonce_field" ).val() ),
        'ubcar_media_edit_id' : edit_id,
        'ubcar_media_title': escape_html( jQuery( "#ubcar_media_edit_title_" + edit_id ).val() ),
        'ubcar_media_description': escape_html( jQuery( "#ubcar_media_edit_description_" + edit_id ).val() ),
        'ubcar_media_old_location': old_location,
        'ubcar_media_location': escape_html( jQuery( "#ubcar_media_edit_location_" + edit_id ).val() ),
        'ubcar_media_layers': new_selected_layers,
        'ubcar_media_added_layers': added_selected_layers_to_send,
        'ubcar_media_removed_layers': removed_selected_layers_to_send,
        'ubcar_media_hidden': jQuery( "#ubcar_media_edit_hidden_" + edit_id ).prop('checked')
    };
    jQuery.post(ajax_object.ajax_url, submit_data, function(response) {
        if( response == false ) {
            alert( "Sorry, you do not have permission to delete that media." );
        } else {
            alert( response );
            var htmlString = '<td>';
            htmlString += response.ID;
            htmlString += '</td><td style="text-align: center">';
            if( response.type == 'image' ) {
                htmlString += '<a href="';
                htmlString += response.full_size_url;
                htmlString += '" TARGET="_blank"><img src="';
                htmlString += response.url;
                htmlString += '" alt="';
                htmlString += response.title;
                htmlString += '" /></a>';
            } else if( response.type == 'video' ) {
                htmlString += '<iframe width="150" height="150" src="//www.youtube.com/embed/' + response.url + '" frameborder="0" allowfullscreen></iframe>';
            } else if( response.type == 'audio' ) {
                htmlString += '<iframe width="150" height="150" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + response.url + '&amp;auto_play=false&amp;hide_related=true&amp;show_comments=false&amp;show_user=true&amp;show_reposts=false&amp;visual=false"></iframe>';
            } else if( response.type == 'external' || response.type == 'wiki' ) {
                htmlString += '<input disabled type="text" value="' + response.url + '">';
            }
            htmlString += '</td><td>';
            htmlString += response.title;
            htmlString += "</td><td>";
            htmlString += response.uploader;
            htmlString += "</td><td>";
            htmlString += response.date;
            htmlString += "</td><td>";
            htmlString += response.description;
            htmlString += "</td><td>";
            if( response.location != null ) {
                htmlString += response.location.title + ' (#' + response.location.ID + ')';
            } else {
                htmlString += 'Deleted location (#?)';
            }
            htmlString += "</td><td>";
            htmlString += '<select multiple disabled size="5">';
            for( j in response.layers ) {
                htmlString += '<option value="' + response.layers[j].ID + '">' + response.layers[j].title + ' (#' + response.layers[j].ID + ')</option>';
            }
            htmlString += "</select>";
            htmlString += '</td><td style="text-align: center"><input type="checkbox" disabled ';
            if( response.hidden == 'on' ) {
                htmlString += 'checked ';
            }
            htmlString += '/></td><td>Updated!</td>';
            jQuery( "#" + "ubcar_media_line_" + response.ID ).html( htmlString );
        }
    });
}