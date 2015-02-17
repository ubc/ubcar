jQuery(document).ready(function() {

    var requested_latlng = new google.maps.LatLng(49.2683366, -123.2550359);
    var mapOptions = {
        zoom: 10,
        center: requested_latlng,
        mapTypeId: google.maps.MapTypeId.SATELLITE
    };
    var map = new google.maps.Map(document.getElementById('ubcar-map-canvas'), mapOptions);
    
    var single_point_request = false;
    if( jQuery( "#ubcar-hidden-request-type" ).val() != null ) {
        single_point_request = true;
    }

    // type, id, KMLlayer, on/off state, listener
    // TODO: combine into one array
    var ubcar_kml_layers = [];
    var ubcar_kml_tours = [];
    
    // create initial complete KML objects in both arrays
    var all_kml = make_kml_layer( map, 'all' );
    ubcar_kml_layers.push( [ 'ubcar_layer', 'all', all_kml, true ] );
    ubcar_kml_layers[0][4] = add_kml_layer( 0, ubcar_kml_layers, map, single_point_request );
    ubcar_kml_tours.push( [ 'ubcar_tour', 'all', all_kml, true ] );
    ubcar_kml_tours[0][4] = add_kml_layer( 0, ubcar_kml_tours, map, single_point_request );
    
    jQuery( "#ubcar-layers-form input" ).click(function() {
        var return_array = display_selected_layers( this, 'layer', ubcar_kml_layers, ubcar_kml_tours, map, true );
        ubcar_kml_layers = return_array[0];
        ubcar_kml_tours = return_array [1];
    });
    
    jQuery( "#ubcar-tours-form input" ).click(function() {
        var return_array = display_selected_layers( this, 'tour', ubcar_kml_tours, ubcar_kml_layers, map, true );
        ubcar_kml_tours = return_array[0];
        ubcar_kml_layers = return_array [1];
    });
    
    jQuery( "#ubcar-search-button" ).click(function() {
        var return_array = display_searched_layers( ubcar_kml_layers, ubcar_kml_tours, map );
        ubcar_kml_layers = return_array[0];
        ubcar_kml_tours = return_array [1];
    });
    
    jQuery( "#ubcar-display-choice-map" ).click(function() {
        jQuery( "#ubcar-map-canvas" ).show();
        jQuery( "#ubcar-streetview-canvas" ).hide();
    });
    
    // detects if a GET request is being made
    responder_detector( map );
    
});

/**
 * This function displays a set of points from a search while wiping and
 * hiding irrelevant panes.
 * 
 * @param {Object[]} ubcar_kml_layers - The current array of retrieved
 *   ubcar_layers
 * @param {Object[]} ubcar_kml_tours - The current array of retrieved
 *   ubcar_tours
 * @param {Object} map - The Google Map being displayed
 * 
 * @returns {Object[Object[]]}
 */
function display_searched_layers( ubcar_kml_layers, ubcar_kml_tours , map ) {
    jQuery( "#ubcar-tours-form input" ).prop( "checked", false );
    jQuery( "#ubcar-layers-form input" ).prop( "checked", false );
    ubcar_kml_layers = remove_kml_layers( ubcar_kml_layers, map );
    ubcar_kml_tours = remove_kml_layers( ubcar_kml_tours, map );
    ubcar_kml_layers.push( [ 'ubcar_search', jQuery( "#ubcar-search-input" ).val(), make_kml_layer( map, [ 'ubcar_search', jQuery( "#ubcar-search-input" ).val() ] ), true ] );
    ubcar_kml_layers[ubcar_kml_layers.length-1][4] = add_kml_layer( ubcar_kml_layers.length-1, ubcar_kml_layers, map, false );
    jQuery( "#ubcar-body-aggregate" ).html( "" );
    jQuery( "#ubcar-body-aggregate" ).hide();
    jQuery( "#ubcar-header-aggregate" ).html( "Layer/Tour Information" );
    jQuery( "#ubcar-header-aggregate" ).css( "background", "#DEDEDE");
    jQuery( "#ubcar-map-canvas" ).show();
    jQuery( "#ubcar-streetview-canvas" ).hide();
    return [ ubcar_kml_layers, ubcar_kml_tours ];
}

/**
 * This function removes a set of layers (either ubcar_layers or ubcar_tours)
 * from the map.
 * 
 * @param {Object[]} layers_to_remove - The layers to remove from the map
 * @param {Object} map - The Google Map being displayed
 * 
 * @returns {Object[]}
 */
function remove_kml_layers( layers_to_remove, map ) {
    for( i in layers_to_remove ) {
        if( layers_to_remove[i][3] == true ) {
            layers_to_remove[i][3] = false;
            remove_kml_layer( i, layers_to_remove, map );
        }
    }
    return layers_to_remove;
}

/**
 * This function displays a set of points from a layer (either an ubcar_layer or
 * an ubcar_tour) while wiping any layers that do not belong to its type.
 * 
 * @param {Object} selected_object - The layer to display on the map
 * @param {String} selected_type - The type of the layer
 *   (ubcar_layer or ubcar_tour)
 * @param {Object[]} selected_array - The array to which the selected_object
 *   will belong
 * @param {Object[]} nonselected_array - The array to which the selected_object
 *   will not belong
 * @param {Object} map - The Google Map being displayed
 * 
 * @returns {Object[Object[]]}
 */
function display_selected_layers( selected_object, selected_type, selected_array, nonselected_array, map ) {

    var selected_id = jQuery( selected_object ).attr("id");
    var nonselected_type;
    if( selected_type == 'layer' ) {
        nonselected_type = 'tour';
    } else if( selected_type == 'tour' ) {
        nonselected_type = 'layer';
    } else {
        return;
    }

    // uncheck all boxes from the nonselected type of layer and remove their KML layers from the map
    jQuery( "#ubcar-" + nonselected_type + "s-form input" ).prop( "checked", false );
    for( i in nonselected_array ) {
        if( nonselected_array[i][3] == true ) {
            nonselected_array[i][3] = false;
            remove_kml_layer( i, nonselected_array, map );
        }
    }
    // remove all layers created as a result of searches
    for( i in selected_array ) {
        if( selected_array[i][0] == 'ubcar_search' ) {
            selected_array[i][3] = false;
            remove_kml_layer( i, selected_array, map );
        }
    }
   
    // if the user wants to add a layer
    if( jQuery( selected_object ).prop("checked") ) {
        // if the user has selected to see all points
        if( selected_id == 'all_' + selected_type + 's' ) {
            // remove checks from specific layers
            jQuery( "#ubcar-" + selected_type + "s-form input" ).prop( "checked", false );
            // check the 'all' box
            jQuery( selected_object ).prop( "checked", true );
            for( i in selected_array ) {
                if( selected_array[i][0] == 'ubcar_' + selected_type ) {
                    // remove KML layers from map
                    if( selected_array[i][1] != 'all' && selected_array[i][3] == true ) {
                        selected_array[i][3] = false;
                        remove_kml_layer( i, selected_array, map );
                    }
                    // add the 'all' KML layer to the map and resize its bounds
                    if( selected_array[i][1] == 'all' ) {
                        selected_array[i][3] = true;
                        add_kml_layer( i, selected_array, map, false );
                    }
                }
            }
        // if the user requests a specific layer
        } else {
            // uncheck the 'all' box
            jQuery( "#all_" + selected_type + "s" ).prop( "checked", false );
            var kml_existing = false;
            for( i in selected_array ) {
                // remove the 'all' KML layer from the map
                if( selected_array[i][0] == 'ubcar_' + selected_type && selected_array[i][1] == 'all' && selected_array[i][3] == true ) {
                    selected_array[i][3] = false;
                    remove_kml_layer( i, selected_array, map );
                }
                // add the appropriate KML layer to the map if it exsts
                if( selected_array[i][1] == selected_id && selected_array[i][3] == false ) {
                    selected_array[i][3] = true;
                    add_kml_layer( i, selected_array, map, false );
                    kml_existing = true;
                }
            }
            // make the KML layer if it doesn't already exist and add to map
            if( kml_existing == false ) {
                selected_array.push( [ 'ubcar_' + selected_type, selected_id, make_kml_layer( map, [ 'ubcar_' + selected_type + 's[]', selected_id ] ), true ] );
                selected_array[selected_array.length-1][4] = add_kml_layer( selected_array.length-1, selected_array, map, false );
            }
        }
    // if the user wants to remove a layer
    } else {
        // if the layer to be removed is 'all' points
        if( selected_id == 'all_' + selected_type + 's' ) {
            for( i in selected_array ) {
                if( selected_array[i][0] == 'ubcar_' + selected_type && selected_array[i][1] == 'all' && selected_array[i][3] == true ) {
                    selected_array[i][3] = false;
                    remove_kml_layer( i, selected_array, map );
                }
            }
        // if the layer to be removed is a specific layer
        } else {
            for( i in selected_array ) {
                if( selected_array[i][0] == 'ubcar_' + selected_type && selected_array[i][1] == selected_id && selected_array[i][3] == true ) {
                    selected_array[i][3] = false;
                    remove_kml_layer( i, selected_array, map );
                }
            }
        }
    }
    
    jQuery( "#ubcar-map-canvas" ).show();
    jQuery( "#ubcar-streetview-canvas" ).hide();
    
    return [ selected_array, nonselected_array ];
}

/**
 * This function retrieves a KML file and uses it to create a KMLlayer object.
 * 
 * @param {String[]} parameters - The type and specification of the UBCAR data
 *   being requested
 * @param {Object} map - The Google Map being displayed
 * 
 * @returns {Object} - The KMLlayer
 */
function make_kml_layer( map, parameters ) {
    return new google.maps.KmlLayer({
        url: window.location.protocol + '//' + window.location.hostname + window.location.pathname + '?ubcar_download_kml&' + encodeURIComponent( parameters[0] ) + '=' + encodeURIComponent( parameters[1] ),
        suppressInfoWindows: true,
        map: null,
        preserveViewport: true
    });
}

/**
 * This function adds a KMLlayer to the displayed Google Map.
 * 
 * @param {int} kml_index - The index of the KMLlayer to add
 * @param {Object[]} - The array of KMLlayers (ubcar_layers or ubcar_tours)
 * @param {Object} map - The Google Map being displayed
 * @param {bool} keep_bounds - Determines if the Google Map will resize to
 *   accommodate the layer
 * 
 * @returns {Object} - The Google Maps click listener
 */
function add_kml_layer( kml_index, ubcar_kml_objects, map, keep_bounds ) {
    var kml_layer = ubcar_kml_objects[kml_index][2];
    kml_layer.setMap( map );
    add_kml_layer_description( ubcar_kml_objects[kml_index][1], ubcar_kml_objects[kml_index][0], map );
    if( keep_bounds != true ) {
        google.maps.event.addDomListener( kml_layer, 'defaultviewport_changed', function(){
            resize_google_map( map, ubcar_kml_objects );
        });
    }
    return google.maps.event.addListener(kml_layer, 'click', function(kmlEvent) {
        var ubcar_point_id = kmlEvent.featureData.description;
        update_point( ubcar_point_id, map );
        if( jQuery( ".ubcar-informational-left-column").css("padding-right") == '0px' ) {
            jQuery( 'html, body' ).animate( { scrollTop: jQuery("#ubcar-header-information").offset().top - 80 }, 200 );
        }
    });
}

/**
 * This function retrieves a description of the displayed layer (ubcar_layer or
 * ubcar_tour) and adds it to the aggregate pane.
 * 
 * @param {int} kml_index - The index of the KMLlayer to add a description for
 * @param {String} - The type of layer to add a description for
 * @param {Object} map - The Google Map being displayed
 */
function add_kml_layer_description( kml_index, kml_type, map ) {
    if( kml_index != 'all' ) {
        var data = {
            'action': 'ubcar_aggregate_retriever',
            'ubcar_aggregate_id': kml_index,
            'ubcar_aggregate_type': kml_type
        };
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            if( kml_type == 'ubcar_layer' ) {
                jQuery( "#ubcar-header-aggregate" ).html( "Layer Information" );
            } else if( kml_type == 'ubcar_tour' ) {
                jQuery( "#ubcar-header-aggregate" ).html( "Tour Information" );
            } else {
                return;
            }
            jQuery( "#ubcar-header-aggregate" ).css( "background", "#002145");
            var htmlString = '<div id="ubcar-aggregate-description-' + kml_index + '">'
            if( response.title != null ) {
                htmlString += '<p><strong>' + response.title + ' (#' + kml_index + ')</strong></p>';
            }
            if( response.description != null ) {
                htmlString += '<p>' + response.description + '</p>';
            }
            if( kml_type == 'ubcar_tour' && response.points[0] != null ) {
                htmlString += '<p>Points:</p>';
                htmlString += '<ol>';
                for( i in response.points ) {
                    htmlString += '<li id="ubcar-aggregate-point-' + response.points[i].ID + '">'
                    htmlString += response.points[i].title + ' (Point #' + response.points[i].ID + ')';
                    htmlString += '<input hidden name="latitude" value="' + response.points[i].latitude + '" />';
                    htmlString += '<input hidden name="longitude" value="' + response.points[i].longitude + '" />';
                    htmlString += '</li>';
                }
                htmlString += '</ol>';
            }
            htmlString += '<hr />';
            htmlString += '</div>';
            jQuery( "#ubcar-body-aggregate" ).show();
            jQuery( "#ubcar-body-aggregate" ).append( htmlString );
            jQuery(document).on( "click", "#ubcar-aggregate-description-" + kml_index + " ol li", function() {
                
                jQuery( "#ubcar-body-aggregate > div ol li" ).css( "background", "white" );
                jQuery( "#ubcar-aggregate-description-" + kml_index + " ol li" ).css( "background", "white");
                jQuery( this ).css( "background", "#DEDEDE");
                jQuery("#ubcar-body-aggregate").animate( {scrollTop: jQuery( this ).position().top + jQuery( "#ubcar-body-aggregate" ).scrollTop() - 20 }, 500, 'swing' );
                
                var point_id = jQuery(this).attr('id').replace('ubcar-aggregate-point-', '');
                update_point( point_id, map );
                
                var latitude = parseFloat( jQuery(this).children("input[name=latitude]").val() );
                var longitude = parseFloat( jQuery(this).children("input[name=longitude]").val() );
                var my_latlng = new google.maps.LatLng( latitude, longitude );
                map.panTo( my_latlng );
                var max_zoom_service = new google.maps.MaxZoomService();
                max_zoom_service.getMaxZoomAtLatLng( my_latlng, function( max_zoom ){
                    map.setZoom( max_zoom.zoom - 2 );
                });
            });
        });
    }
}

/**
 * This function removes a KMLlayer from the displayed Google Map.
 * 
 * @param {int} kml_index - The index of the KMLlayer to remove
 * @param {Object[]} - The array of KMLlayers (ubcar_layers or ubcar_tours)
 * @param {Object} map - The Google Map being displayed
 */
function remove_kml_layer( kml_index, ubcar_kml_objects, map ) {
    var kml_layer = ubcar_kml_objects[kml_index][2];
    var map_listener = ubcar_kml_objects[kml_index][4];
    kml_layer.setMap();
    if( ubcar_kml_objects[kml_index][1] != 'all' ) {
        remove_kml_layer_description( ubcar_kml_objects[kml_index][1] );
    }
    google.maps.event.removeListener( map_listener );
    resize_google_map( map, ubcar_kml_objects );
}

/**
 * This function removes a description of the displayed layer (ubcar_layer or
 * ubcar_tour) from the aggregate pane.
 * 
 * @param {int} kml_index - The index of the KMLlayer description to remove
 */
function remove_kml_layer_description( kml_index ) {
    jQuery(document).on( "click", "#ubcar-layers-form input", function() {
        jQuery( "#ubcar-aggregate-description-" + kml_index ).remove();
        jQuery( document ).off( "click", "#ubcar-layers-form input" );
        jQuery(document).off( "click", "#ubcar-aggregate-description-" + kml_index + " ol li" );
        if( jQuery( "#ubcar-body-aggregate" ).html() == "" ) {
            jQuery( "#ubcar-body-aggregate" ).hide();
            jQuery( "#ubcar-header-aggregate" ).html( "Layer/Tour Information" );
            jQuery( "#ubcar-header-aggregate" ).css( "background", "#DEDEDE");
        }
    });
    jQuery(document).on( "click", "#ubcar-tours-form input", function() {
        jQuery( "#ubcar-aggregate-description-" + kml_index ).remove();
        jQuery( document ).off( "click", "#ubcar-tours-form input" );
        jQuery(document).off( "click", "#ubcar-aggregate-description-" + kml_index + " ol li" );
        if( jQuery( "#ubcar-body-aggregate" ).html() == "" ) {
            jQuery( "#ubcar-body-aggregate" ).hide();
            jQuery( "#ubcar-header-aggregate" ).html( "Layer/Tour Information" );
            jQuery( "#ubcar-header-aggregate" ).css( "background", "#DEDEDE");
        }
    });
}

/**
 * This helper function resizes the displayed Google Map to fit the currently
 * displayed layers.
 * 
 * @param {Object} map - The Google Map being displayed
 * @param {Object[]} - The array of KMLlayers (ubcar_layers or ubcar_tours)
 * 
 * @returns {Object} - The new LatLngBounds of the Map
 */
function resize_google_map( map, ubcar_kml_objects ) {
    var map_bounds = new google.maps.LatLngBounds();
    for( i in ubcar_kml_objects ) {
        if( ubcar_kml_objects[i][3] == true && ubcar_kml_objects[i][2].getDefaultViewport() != null ) {
            if( !( ubcar_kml_objects[i][2].getDefaultViewport().getSouthWest().lng() == -180 && ubcar_kml_objects[i][2].getDefaultViewport().getNorthEast().lng() == 180 ) ) {
                map_bounds.union(ubcar_kml_objects[i][2].getDefaultViewport());
                map.fitBounds( map_bounds );
            }
        }
    }
    return map_bounds;
}

/**
 * This function retrieves information about the currently selected point and
 * displays it in the appropriate panes.
 * 
 * @param {int} ubcar_point_id - The ID of the point to be retrieved
 * @param {Object} map - The Google Map being displayed
 */
function update_point( ubcar_point_id, map ) {
        jQuery( "#ubcar-body-information" ).html( '<div class="ubcar-delay"></div>' );
        jQuery( "#ubcar-body-media" ).html( '<div class="ubcar-delay"></div>' );
        jQuery( "#ubcar-body-comments" ).html( '<div class="ubcar-delay"></div>' );
        jQuery( "#ubcar-header-information" ).css( "background", "#002145");
        jQuery( "#ubcar-header-media" ).css( "background", "#002145");
        jQuery( "#ubcar-header-comments" ).css( "background", "#002145");
        jQuery( "#ubcar-display-choice-street" ).css( "background", "#DEDEDE");
        jQuery( "#ubcar-display-choice-street" ).unbind( "click" );
        jQuery( "#ubcar-map-canvas" ).show();
        jQuery( "#ubcar-streetview-canvas" ).hide();
        var data = {
            'action': 'map_click_point_updater',
            'ubcar_point_id': ubcar_point_id
        };
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            display_point( response );
            if( response.logged_in == true) {
                jQuery( "#ubcar-header-comments-submit" ).css( "background", "#002145");
//                jQuery( "#ubcar-body-comments-submit" ).fadeIn( "fast" );
            }
            var temp_latlng = new google.maps.LatLng( response.point_latitude, response.point_longitude );
            display_streetview( ubcar_point_id, temp_latlng, map );
        });
        var data = {
            'action': 'map_click_point_updater_comments',
            'ubcar_point_id': ubcar_point_id
        };
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            display_point_comments( response, ubcar_point_id );
        });
}

/**
 * This function tests if a streetview is available at the currently selected
 * point.
 * 
 * @param {int} ubcar_point_id - The ID of the point to be retrieved
 * @param {Object} latlng_object - The latitude and longitude of the point
 * @param {Object} map - The Google Map being displayed
 */
function display_streetview( ubcar_point_id, latlng_object, map ) {
    var streetview_tester = new google.maps.StreetViewService();
    streetview_tester.getPanoramaByLocation( latlng_object, 50, function( data, status) {
        streetview_test( ubcar_point_id, data, status, latlng_object );
    });
}

/**
 * This callback function for display_streeview() checks that a streetview is
 * available and enables the option to see it if it is.
 * 
 * @param {int} ubcar_point_id - The ID of the point to be retrieved
 * @param {Object} data - Google-supplied
 * @param {int} status - Google-supplied
 * @param {Object} latlng_object - The latitude and longitude of the point
 */
function streetview_test( ubcar_point_id, data, status, latlng_object ) {
    jQuery( "#ubcar-display-choice-street" ).html( "Point " + ubcar_point_id + " Street View" );
    if (status == google.maps.StreetViewStatus.OK) {
        jQuery( "#ubcar-display-choice-street" ).css( "background", "#002145");
        jQuery( "#ubcar-display-choice-street" ).click(function() {
            jQuery( "#ubcar-map-canvas" ).hide();
            jQuery( "#ubcar-streetview-canvas" ).show();
            var streetview_options = {
                position: latlng_object
            }
            var streetview = new google.maps.StreetViewPanorama( document.getElementById( 'ubcar-streetview-canvas' ), streetview_options );
        });
    }
}

/**
 * This helper function formats point data retrieved in the update_point()
 * function's first AJAX call.
 * 
 * @param {Object[]} response - The JSON response from the UBCAR plugin
 */
function display_point( response ) {

    jQuery( "#ubcar-header-information" ).html( "Point " + response.point_ID + ": " + response.point_title + " - Information" );
    jQuery( "#ubcar-header-comments" ).html( "Comments for Point " + response.point_ID + ": " + response.point_title );
    jQuery( "#ubcar-header-media" ).html( "Point " + response.point_ID + ": " + response.point_title + " - User Media" );

    var htmlStringMedia = '';
    var htmlStringDescription = '<p>' + response.point_description + '</p>';
    htmlStringDescription += '<p class="ubcar-meta">Latitude: ' + response.point_latitude + ', Longitude: ' + response.point_longitude + '</p>';
    htmlStringDescription += '<p>Tags: ' + response.point_tags + '</p>';

    if( response.ubcar_media == null || response.ubcar_media.length != 0 ) {
        for( i in response.ubcar_media) {
            if( response.ubcar_media[i].type == 'external' ) {
                htmlStringDescription += '<p><strong>External Link: </strong><a href="' + response.ubcar_media[i].url + '" TARGET="_blank" >' + response.ubcar_media[i].title + '</a>';
                if( response.ubcar_media[i].description != '' ) {
                    htmlStringDescription += ' - ' + response.ubcar_media[i].description;
                }
                if( response.ubcar_media[i].layers.length > 0 ) {
                    htmlStringDescription += ' (Layers: ';
                    for( j in response.ubcar_media[i].layers ) {
                        htmlStringDescription += response.ubcar_media[i].layers[j].title;
                        if( j < response.ubcar_media[i].layers.length - 1 ) {
                            htmlStringDescription += ', ';
                        }
                    }
                    htmlStringDescription += ')';
                }
                htmlStringDescription += '</p>';
            } else if( response.ubcar_media[i].type == 'wiki' ) {
                htmlStringDescription += '<div class="ubcar-wiki-header" id="ubcar-wiki-header-' + response.ubcar_media[i].ID + '">' + response.ubcar_media[i].title;
                if( response.ubcar_media[i].layers.length > 0 ) {
                    htmlStringDescription += ' (Layers: ';
                    for( j in response.ubcar_media[i].layers ) {
                        htmlStringDescription += response.ubcar_media[i].layers[j].title;
                        if( j < response.ubcar_media[i].layers.length - 1 ) {
                            htmlStringDescription += ', ';
                        }
                    }
                    htmlStringDescription += ')';
                }
                htmlStringDescription += '</div><div class="ubcar-wiki-body" id="ubcar-wiki-body-' + response.ubcar_media[i].ID + '"></div>';
            } else if( response.ubcar_media[i].type == 'image' ) {
                htmlStringMedia += '<a href="' + response.ubcar_media[i].full_size_url + '" TARGET="_blank">';
                htmlStringMedia += response.ubcar_media[i].image;
                htmlStringMedia += '</a>';
            } else if( response.ubcar_media[i].type == 'video' ) {
                htmlStringMedia += '<iframe width="100%" height="300" src="//www.youtube.com/embed/' + response.ubcar_media[i].url + '" frameborder="0" allowfullscreen></iframe>';
            } else if( response.ubcar_media[i].type == 'audio' ) {
                htmlStringMedia += '<iframe width="100%" height="150" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + response.ubcar_media[i].url + '&amp;auto_play=false&amp;hide_related=true&amp;show_comments=false&amp;show_user=true&amp;show_reposts=false&amp;visual=false"></iframe>';
            }
            if( response.ubcar_media[i].type != 'external' && response.ubcar_media[i].type != 'wiki' ) {
                htmlStringMedia += '<div class="ubcar-caption-title"><p>';
                htmlStringMedia += '<strong>' + response.ubcar_media[i].title + '</strong>' + ' (#' + response.ubcar_media[i].ID + ')';
                htmlStringMedia += '</p></div>';
                htmlStringMedia += '<div class="ubcar-caption-main">';
                htmlStringMedia += '<p>' + response.ubcar_media[i].description + '</p>';
                htmlStringMedia += '<div class="ubcar-uploader"><p>';
                htmlStringMedia += 'Uploader: ' + response.ubcar_media[i].uploader + ' | ' + response.ubcar_media[i].date;
                if( response.ubcar_media[i].layers.length > 0 ) {
                    htmlStringMedia += '<br />Layers: ';
                    for( j in response.ubcar_media[i].layers ) {
                        htmlStringMedia += response.ubcar_media[i].layers[j].title;
                        if( j < response.ubcar_media[i].layers.length - 1 ) {
                            htmlStringMedia += ', ';
                        }
                    }
                }
                htmlStringMedia += '</div>';
                htmlStringMedia += '</div>';
                htmlStringMedia += '<hr />';
            }
        }
    } else {
        htmlStringMedia = '<p>No media available for this point.</p>';
    }
    
    jQuery( "#ubcar-body-information" ).html( htmlStringDescription );
    jQuery( "#ubcar-body-media" ).html( htmlStringMedia );
    
    jQuery( ".ubcar-wiki-header" ).click(function() {
        var wiki_id = jQuery( this ).attr("id").replace('ubcar-wiki-header-', '');
        if( jQuery( "#ubcar-wiki-body-" + wiki_id ).css("display") == 'none' ) {
            if( jQuery( "#ubcar-wiki-body-" + wiki_id ).html() == "" ) {
                jQuery( "#ubcar-wiki-body-" + wiki_id ).html( '<div class="ubcar-delay"></div>' );
                jQuery( "#ubcar-wiki-body-" + wiki_id ).show();
                var data = {
                    'action': 'ubcar_wiki_page',
                    'ubcar_wiki_id': wiki_id
                };
                jQuery.post(ajax_object.ajax_url, data, function(response) {
                    if( response.url == null ) {
                        jQuery( "#ubcar-wiki-body-" + wiki_id ).html( response );
                    } else {
                        jQuery( "#ubcar-wiki-body-" + wiki_id ).html( '<br /><p>The Wiki Embed plugin is not activated. You may visit the linked wiki page <a TARGET="_blank" href="' + response.url + '">here</a>.' );
                    }
                });
            }
            jQuery( "#ubcar-wiki-body-" + wiki_id ).show();
        } else {
            jQuery( "#ubcar-wiki-body-" + wiki_id ).hide();
        }
    });
}

/**
 * This helper function formats point comment data retrieved in the
 * update_point(), submit_new_comment(), and submit_new_reply() functions'
 * AJAX calls.
 * 
 * @param {Object[]} response - The JSON response from the UBCAR plugin
 * @param {int} ubcar_point_id - The ID of the point to be retrieved
 */
function display_point_comments( response, ubcar_point_id ) {
    if( response != '<ol class="commentlist"></ol>' ) {
        jQuery( "#ubcar-body-comments" ).html( response );
    } else {
        jQuery( "#ubcar-body-comments" ).html( '<p>No comments available for this point.</p>' );
    }
    
    jQuery( "#ubcar-body-comments-submit" ).html( '<textarea rows="4" id="ubcar-new-comment-text"></textarea><br /><div class="ubcar-button" id="ubcar-new-comment-submit">Submit New Comment</div>' );
    
    jQuery( "[id^=ubcar-comment-reply-]" ).click(function() {
        jQuery( this ).hide();
        var edit_id = jQuery( this ).attr("id").replace('ubcar-comment-reply-', '');
        var htmlString = '<textarea rows="4" id="ubcar-comment-reply-text-' + edit_id + '"></textarea>';
        htmlString += '<div class="ubcar-button" id="ubcar-comment-submit-reply-' + edit_id + '">Submit Reply</div>';
        jQuery( "#ubcar-reply-area-" + edit_id ).html( htmlString );
        
        jQuery( "[id^=ubcar-comment-submit-reply-]" ).unbind('click').click(function() {
            var parent_id = jQuery( this ).attr("id").replace('ubcar-comment-submit-reply-', '');
            submit_new_reply( ubcar_point_id, parent_id );
        });
    });
    
    jQuery( "#ubcar-new-comment-submit" ).click(function() {
        submit_new_comment( ubcar_point_id );
    });
    
}

/**
 * This function submits a new comment for the given point and displays the
 * new list of comments for that point.
 * 
 * @param {int} ubcar_point_id - The ID of the point to be retrieved
 */
function submit_new_comment( ubcar_point_id ) {
    var data = {
        'action': 'ubcar_submit_comment',
        'ubcar_point_id': ubcar_point_id,
        'ubcar_comment_text': jQuery( "#ubcar-new-comment-text" ).val(),
        'ubcar_nonce_field': jQuery( "#ubcar_nonce_field" ).val()
    };
    jQuery( "#ubcar-body-comments-submit" ).html( '<div class="ubcar-delay"></div>' );
    jQuery.post(ajax_object.ajax_url, data, function(response) {
        var data = {
            'action': 'map_click_point_updater_comments',
            'ubcar_point_id': ubcar_point_id
        };
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            display_point_comments( response, ubcar_point_id );
        });
    });
    jQuery( "#ubcar-body-comments-submit" ).html( '<div class="ubcar-delay"></div>' );
}

/**
 * This function submits a new reply for a comment for the given point and
 * displays the new list of comments for that point.
 * 
 * @param {int} ubcar_point_id - The ID of the point to be retrieved
 * @param {int} parent_id - The ID of the comment to be retrieved
 */
function submit_new_reply( ubcar_point_id, parent_id ) {
    var data = {
        'action': 'ubcar_submit_reply',
        'ubcar_point_id': ubcar_point_id,
        'ubcar_reply_text': jQuery( "#ubcar-comment-reply-text-" + parent_id ).val(),
        'ubcar_comment_parent': parent_id,
        'ubcar_nonce_field': jQuery( "#ubcar_nonce_field" ).val(),
    };
    jQuery( "#ubcar-body-comments" ).html( '<div class="ubcar-delay"></div>' );
    jQuery.post(ajax_object.ajax_url, data, function(response) {
        var data = {
            'action': 'map_click_point_updater_comments',
            'ubcar_point_id': ubcar_point_id
        };
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            display_point_comments( response, ubcar_point_id );
        });;
    });
}

/**
 * This function detects if a GET request is present and responds accordingly
 * for points, layers, and tours.
 * 
 * @param {Object} map - The Google Map being displayed
 */
function responder_detector( map ) {
    var requested_type = jQuery( "#ubcar-hidden-request-type" ).val();
    var requested_value = jQuery( "#ubcar-hidden-request-value" ).val();
    if( requested_type != null && requested_value != null ) {
        if( requested_type == 'ubcar_point' ) {
            update_point( requested_value, map );
            var requested_latitude = jQuery( "#ubcar-hidden-request-latitude" ).val();
            var requested_longitude = jQuery( "#ubcar-hidden-request-longitude" ).val();
            var requested_latlng = new google.maps.LatLng( requested_latitude, requested_longitude );
            var max_zoom_service = new google.maps.MaxZoomService();
            max_zoom_service.getMaxZoomAtLatLng( requested_latlng, function( max_zoom ){
                map.setCenter( requested_latlng );
                if( max_zoom.zoom != null ) {
                    map.setZoom( max_zoom.zoom );
                } else {
                    map.setZoom( 16 );
                }
            });
        }
        if( requested_type == 'ubcar_layer' ) {
            jQuery( "#ubcar-accordion-header-layers" ).click();
            jQuery( "#" + requested_value ).click();
        }
        if( requested_type == 'ubcar_tour' ) {
            jQuery( "#ubcar-accordion-header-tours" ).click();
            jQuery( "#" + requested_value ).click();
        }
    }
}