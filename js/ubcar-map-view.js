jQuery(document).ready(function() {

    var requested_latlng = new google.maps.LatLng(49.2683366, -123.2550359);
    var mapOptions = {
        zoom: 10,
        center: requested_latlng,
        mapTypeId: google.maps.MapTypeId.SATELLITE
    };
    var map = new google.maps.Map(document.getElementById('ubcar-map-canvas'), mapOptions);
    
    var ubcar_map = new UBCAR_Map( map );
    
    jQuery( "#ubcar-layers-form input" ).click(function() {
        jQuery( "#ubcar-tours-form input" ).prop( "checked", false );
        ubcar_map.retrieve_points( jQuery( this ).attr( "id" ), 'ubcar_layer' );
    });
    
    jQuery( "#ubcar-tours-form input" ).click(function() {
        jQuery( "#ubcar-layers-form input" ).prop( "checked", false );
        ubcar_map.retrieve_points( jQuery( this ).attr( "id" ), 'ubcar_tour' );
    });

    jQuery( "#ubcar-search-button" ).click(function() {
        jQuery( "#ubcar-tours-form input" ).prop( "checked", false );
        jQuery( "#ubcar-layers-form input" ).prop( "checked", false );
        ubcar_map.retrieve_points( escape_html( jQuery( "#ubcar-search-input" ).val() ), 'ubcar_search' );
    });
    
    jQuery( "#ubcar-display-choice-map" ).click(function() {
        jQuery( "#ubcar-map-canvas" ).show();
        jQuery( "#ubcar-streetview-canvas" ).hide();
        jQuery( "#ubcar-display-fullscreen" ).removeClass( "ubcar-display-fullscreen-move" );
        jQuery( "#ubcar-display-choice-map" ).removeClass( "ubcar-display-choice-map-move" );
        jQuery( "#ubcar-display-choice-street" ).removeClass( "ubcar-display-choice-street-move" );
    });
    
    jQuery( "#ubcar-show-all" ).click(function() {
        jQuery( "#ubcar-tours-form input" ).prop( "checked", false );
        jQuery( "#ubcar-layers-form input" ).prop( "checked", false );
        ubcar_map.retrieve_points( 0, 'all' );
    });
    
    jQuery( "#ubcar-display-fullscreen" ).toggle(function() {
        jQuery( "body" ).prepend( jQuery( ".ubcar-content") );
        jQuery( ".ubcar-content" ).css( "position", "fixed" );
        jQuery( ".ubcar-content" ).css( "left", "0px" );
        jQuery( ".ubcar-content" ).css( "top", "0px" );
        jQuery( ".ubcar-content" ).css( "width", "100%" );
        jQuery( ".ubcar-content" ).css( "height", "100%" );
        jQuery( ".ubcar-content" ).css( "z-index", "99999999999" ); // this may be higher than needed
        jQuery( window ).scrollTop( 0 );
        jQuery( "#ubcar-display-fullscreen" ).html( "Regular" );
    },
    function() {
        jQuery( ".entry-content" ).prepend( jQuery( ".ubcar-content") );
        jQuery( ".ubcar-content" ).css( "position", "relative" );
        jQuery( ".ubcar-content" ).css( "height", "800px" );
        jQuery( "#ubcar-display-fullscreen" ).html( "Fullscreen" );
        jQuery( window ).scrollTop( jQuery( ".ubcar-content" ).offset().top - 40 );
    });
    
    ubcar_map.request_detector();
    
});

function UBCAR_Map( map ) {
    
    var map_instance = map
    var map_infowindow = new google.maps.InfoWindow( { pixelOffset: new google.maps.Size(0, -35) } );
    var object_instance = this;
    var ubcar_points = []; // set of previously retrieved points
    this.active_type = 'ubcar_layer'; // active_type shoudl be ubcar_layer, ubcar_tour, ubcar_search, or all
    
    
    /**
     * AJAX call to class-ubcar-view-map.php's ubcar_get_aggregate_points(),
     * then displaying the points of the new layer, tour, search, or all
     * points, removing points if they are not of the currently selected kind.
     *
     * @param {String} aggregate_id - The object id or search string.
     * @param {String} selected_type - The type of collection being displayed.
     */
    this.retrieve_points = function( aggregate_id, selected_type ) {
        if( object_instance.active_type != selected_type || selected_type == 'ubcar_search' ) {
            for( i in ubcar_points ) {
                if( ubcar_points[i].active == true ) {
                    object_instance.hide_points( i );
                    object_instance.hide_aggregate_information( i );
                }
            }
        }
        object_instance.active_type = selected_type;
        if( ubcar_points[aggregate_id] == null || ( ubcar_points[aggregate_id].type == 'ubcar_search' && selected_type != 'ubcar_search' ) || ( ubcar_points[aggregate_id].type != 'ubcar_search' && selected_type == 'ubcar_search' ) ) {
            var data = {
                'action': 'ubcar_aggregate_points_retriever',
                'ubcar_aggregate_id': aggregate_id,
                'ubcar_aggregate_type': selected_type
            };
            jQuery.post(ajax_object.ajax_url, data, function( response ) {
                var temp_data = new google.maps.Data();
                temp_data.addGeoJson( response.geojson );
                ubcar_points[aggregate_id] = {
                    'type': selected_type,
                    'active': true,
                    'raw_data': response,
                    'map_data': temp_data
                };
                object_instance.display_points( aggregate_id );
            });
        } else {
            if( ubcar_points[aggregate_id].active == false ) {
                object_instance.display_points( aggregate_id );
            } else if( selected_type != 'all' ) {
                object_instance.hide_points( aggregate_id );
            }
        }
    }
    
    /**
     * Helper function to retrieve_points(), formatting the points and
     * putting them onto the displayed map.
     *
     * @param {String} aggregate_id - The object id (id may be a search string).
     */
    this.display_points = function( aggregate_id ) {
        ubcar_points[aggregate_id].map_data.setMap( map_instance );
        ubcar_points[aggregate_id].active = true;
        if( ubcar_points[aggregate_id].type != 'ubcar_search' ) {
            object_instance.retrieve_aggregate_information( aggregate_id );
        }
        if( ubcar_points[aggregate_id].type == 'ubcar_tour' ) {
            object_instance.display_route( aggregate_id );
        }
        object_instance.resize_map();
        ubcar_points[aggregate_id].map_data.addListener( 'mouseover', function(event) {
            map_infowindow.setContent( '<div style="text-align: center;">' + event.feature.getProperty('title') + ' (#' + event.feature.getProperty('id') + ')</div>' );
            var anchor = new google.maps.MVCObject();
            anchor.set( "position", event.latLng );
            map_infowindow.open( map_instance, anchor );
        });
//        ubcar_points[aggregate_id].map_data.addListener( 'mouseout', function(event) {
//            map_infowindow.close();
//        });
        ubcar_points[aggregate_id].map_data.addListener( 'click', function(event) {
            object_instance.retrieve_point( event.feature.getProperty('id') );
        });
    }
    
    /**
     * Helper function to display_points(), displaying Google Maps
     * directions if an ubcar_tour is being displayed.
     *
     * @param {String} aggregate_id - The object id.
     */
    this.display_route = function( aggregate_id ) {
        if( ubcar_points[aggregate_id].raw_data.geojson != null ) {
            if( ubcar_points[aggregate_id].route_data == null ) {
            
                var coordinates = ubcar_points[aggregate_id].raw_data.geojson.features;
                var last_index = coordinates.length-1;
                ubcar_points[aggregate_id].route_data = [];
            
                object_instance.retrieve_route_recursive( aggregate_id, 0, last_index, coordinates );
            
            } else {
                for(i in ubcar_points[aggregate_id].route_data ) {
                    ubcar_points[aggregate_id].route_data[i].setMap( map_instance );
                }
            }
        }
    }
    
    /**
     * Helper function to display_route(), retrieving Google Maps
     * directions. This function is recursively called in the Google
     * route requester's callback function, allowing more than ten
     * points in a single route be displayed.
     *
     * @param {String} aggregate_id - The object id.
     * @param {String} start_index - The starting index of the object's points to be routed.
     * @param {String} last_index - The last index of the object's points to be routed.
     * @param {Object} coordinates - The GeoJSON object associated with the object id.
     */
    this.retrieve_route_recursive = function( aggregate_id, start_index, last_index, coordinates ) {
        
        var temp_last_index = start_index + 9;
        if( last_index <= temp_last_index ) {
            temp_last_index = last_index;
        }
        var first_coordinate = new google.maps.LatLng( coordinates[start_index].geometry.coordinates[1], coordinates[start_index].geometry.coordinates[0] );
        var last_coordinate = new google.maps.LatLng( coordinates[temp_last_index].geometry.coordinates[1], coordinates[temp_last_index].geometry.coordinates[0] );
        var waypoints = [];
        for( var j = start_index + 1; j < temp_last_index; j++ ) {
            var temp_latlng = new google.maps.LatLng( coordinates[j].geometry.coordinates[1], coordinates[j].geometry.coordinates[0] );
            waypoints[j-1-start_index] = { location:temp_latlng, stopover:true };
        }
        var directionsDisplay = new google.maps.DirectionsRenderer( { suppressMarkers : true, preserveViewport: true } );
        var directionsService = new google.maps.DirectionsService();
        var request = {
            origin: first_coordinate,
            destination: last_coordinate,
            waypoints: waypoints,
            optimizeWaypoints: false,
            travelMode: google.maps.TravelMode.WALKING
        }
        directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            }
            directionsDisplay.setMap( map_instance );
            ubcar_points[aggregate_id].route_data.push( directionsDisplay );
            if( last_index == temp_last_index ) {
                return;
            } else {
                object_instance.retrieve_route_recursive( aggregate_id, start_index + 9, last_index, coordinates );
            }
        });
    }
    
    /**
     * Helper function to retrieve_points(), removing an object
     * from the map.
     *
     * @param {String} aggregate_id - The object id.
     */
    this.hide_points = function( aggregate_id ) {
        ubcar_points[aggregate_id].map_data.setMap( null );
        ubcar_points[aggregate_id].active = false;
        object_instance.hide_aggregate_information( aggregate_id );
        object_instance.resize_map();
        if( ubcar_points[aggregate_id].route_data != null ) {
            for(i in ubcar_points[aggregate_id].route_data ) {
                ubcar_points[aggregate_id].route_data[i].setMap( null );
            }
        }
        map_infowindow.close();
    }
    
    /**
     * AJAX call to class-ubcar-view-map.php's ubcar_get_aggregate_information(),
     * then displaying the information of the new layer or tour.
     *
     * @param {String} aggregate_id - The object id.
     */
    this.retrieve_aggregate_information = function( aggregate_id ) {
        if( aggregate_id != 'all_tours' && aggregate_id != 'all_layers' ) {
            var data = {
                'action': 'ubcar_aggregate_information_retriever',
                'ubcar_aggregate_id': aggregate_id
            };
            jQuery.post(ajax_object.ajax_url, data, function( response ) {
                object_instance.display_aggregate_information( response );
            });
        }
    }
    
    /**
     * Helper function to retrieve_aggregate_information(), formatting and
     * displaying the AJAX response.
     *
     * @param {Object} response - The AJAX response to display.
     */
    this.display_aggregate_information = function( response ) {
        var htmlString = '<div id="ubcar-aggregate-description-' + response.id + '">';
        if( response.title != null ) {
            htmlString += '<p><strong>' + response.title + ' (#' + response.id + ')</strong></p>';
        }
        if( response.description != null ) {
            htmlString += '<p>' + response.description + '</p>';
        }
        if( response.type == 'ubcar_tour' && response.points != null ) {
            htmlString += '<p>Points:</p>';
            htmlString += '<ol>';
            for( i in response.points ) {
                htmlString += '<li id="ubcar-aggregate-point-' + response.points[i].id + '">'
                htmlString += response.points[i].title + ' (Point #' + response.points[i].id + ')';
                htmlString += '<input hidden name="latitude" value="' + response.points[i].latitude + '" />';
                htmlString += '<input hidden name="longitude" value="' + response.points[i].longitude + '" />';
                htmlString += '</li>';
            }
            htmlString += '</ol>';
        }
        if( response.id != null ) {
            htmlString += '<hr />';
            htmlString += '</div>';
            jQuery( "#ubcar-body-aggregate" ).append( htmlString );
            jQuery( "#ubcar-header-aggregate" ).css( "background", "#002145");
        }
        
        jQuery(document).on( "click", "#ubcar-aggregate-description-" + response.id + " ol li", function() {
            
            jQuery( "#ubcar-body-aggregate > div ol li" ).css( "background", "white" );
            jQuery( "#ubcar-aggregate-description-" + response.id + " ol li" ).css( "background", "white");
            jQuery( this ).css( "background", "#DEDEDE");
            jQuery("#ubcar-body-aggregate").animate( {scrollTop: jQuery( this ).position().top + jQuery( "#ubcar-body-aggregate" ).scrollTop() - 20 }, 500, 'swing' );
            
            var point_id = jQuery(this).attr('id').replace('ubcar-aggregate-point-', '');
            object_instance.retrieve_point( point_id );
            
            var latitude = parseFloat( jQuery(this).children("input[name=latitude]").val() );
            var longitude = parseFloat( jQuery(this).children("input[name=longitude]").val() );
            var my_latlng = new google.maps.LatLng( latitude, longitude );
            map_instance.panTo( my_latlng );
            var max_zoom_service = new google.maps.MaxZoomService();
            max_zoom_service.getMaxZoomAtLatLng( my_latlng, function( max_zoom ){
                map_instance.setZoom( max_zoom.zoom - 2 );
            });
            
        });
    }
    
    /**
     * Helper function to retrieve_points() and hide_points(), removing
     * an object from the map.
     *
     * @param {String} aggregate_id - The object id.
     */
    this.hide_aggregate_information = function( aggregate_id ) {
        jQuery( "#ubcar-aggregate-description-" + aggregate_id ).remove();
        jQuery( document ).off( "click", "#ubcar-layers-form input" );
        jQuery(document).off( "click", "#ubcar-aggregate-description-" + aggregate_id + " ol li" );
        if( jQuery( "#ubcar-body-aggregate" ).html() == "" ) {
            jQuery( "#ubcar-body-aggregate" ).hide();
            jQuery( "#ubcar-header-aggregate" ).html( "Layer/Tour Information" );
            jQuery( "#ubcar-header-aggregate" ).css( "background", "#DEDEDE");
        }
    }
    
    /**
     * AJAX call to class-ubcar-view-map.php's ubcar_get_point_information()
     * and ubcar_get_point_comments(), then displaying the information of
     * the new point.
     *
     * @param {String} point_id - The point id.
     */
    this.retrieve_point = function( point_id ) {
        jQuery( "#ubcar-body-information" ).html( '<div class="ubcar-delay"></div>' );
        jQuery( "#ubcar-body-media" ).html( '<div class="ubcar-delay"></div>' );
        jQuery( "#ubcar-body-comments" ).html( '<div class="ubcar-delay"></div>' );
        jQuery( "#ubcar-header-information" ).css( "background", "#002145");
        jQuery( "#ubcar-header-media" ).css( "background", "#DEDEDE");
        jQuery( "#ubcar-header-comments" ).css( "background", "#DEDEDE");
        jQuery( "#ubcar-display-choice-street" ).css( "background", "#DEDEDE");
        jQuery( "#ubcar-display-choice-street" ).unbind( "click" );
        jQuery( "#ubcar-map-canvas" ).show();
        jQuery( "#ubcar-streetview-canvas" ).hide();
        var data = {
            'action': 'ubcar_point_information_retriever',
            'ubcar_point_id': point_id
        };
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            object_instance.display_point_information( response );
            if( response.logged_in == true) {
                jQuery( "#ubcar-header-comments-submit" ).css( "background", "#002145");
            }
            var temp_latlng = new google.maps.LatLng( response.point_latitude, response.point_longitude );
            object_instance.display_streetview( point_id, temp_latlng, map );
        });
        var data = {
            'action': 'ubcar_point_comments_retriever',
            'ubcar_point_id': point_id
        };
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            object_instance.display_point_comments( response, point_id );
        });
    }
    
    /**
     * Helper function to retrieve_point(), formatting and
     * displaying the AJAX response (point information).
     *
     * @param {Object} response - The AJAX response to display.
     */
    this.display_point_information = function( response ) {

        var htmlStringMedia = '';
        var htmlStringDescription = '<h4>' + response.point_title + ' ( ' + response.point_ID +')</h4>';
        htmlStringDescription += '<p>' + response.point_description + '</p>';
        htmlStringDescription += '<p class="ubcar-meta">Latitude: ' + response.point_latitude + ', Longitude: ' + response.point_longitude + '</p>';
        htmlStringDescription += '<p>Tags: ' + response.point_tags + '</p>';

        if( response.ubcar_media == null || response.ubcar_media.length != 0 ) {
            for( i in response.ubcar_media) {
                if( response.ubcar_media[i].type == 'external' ) {
                    htmlStringDescription += '<p><strong>External Link: </strong><a href="' + response.ubcar_media[i].url + '" TARGET="_blank" >';
                    if( response.ubcar_media[i].title != '' ) {
                        htmlStringDescription += response.ubcar_media[i].title;
                    } else {
                        htmlStringDescription += response.ubcar_media[i].url;
                    }
                    htmlStringDescription += '</a>';
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
            if( htmlStringMedia != '' ) {
                jQuery( "#ubcar-header-media" ).css( "background", "#002145");
            } else {
                jQuery( "#ubcar-body-media" ).hide();
            }
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
     * Helper function to retrieve_point(), submit_new_comment(), and
     * submit_new_reply(), formatting and displaying the AJAX
     * response (point comments).
     *
     * @param {Object} response - The AJAX response to display.
     * @param {String} point_id - The point id.
     */
    this.display_point_comments = function( response, point_id ) {
        if( response != '<ol class="commentlist"></ol>' && response != '0' ) {
            jQuery( "#ubcar-header-comments" ).css( "background", "#002145");
            jQuery( "#ubcar-body-comments" ).html( response );
        } else {
            jQuery( "#ubcar-body-comments" ).html( '' );
            jQuery( "#ubcar-body-comments" ).hide();
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
                object_instance.submit_new_reply( point_id, parent_id );
            });
        });
        
        jQuery( "#ubcar-new-comment-submit" ).click(function() {
            object_instance.submit_new_comment( point_id );
        });
    }
    
    /**
     * AJAX call to class-ubcar-view-map.php's ubcar_submit_comment(),
     * then displaying the retrieved comments.
     *
     * @param {String} point_id - The point id.
     */
    this.submit_new_comment = function( point_id ) {
        var data = {
            'action': 'ubcar_submit_comment',
            'ubcar_point_id': point_id,
            'ubcar_comment_text': jQuery( "#ubcar-new-comment-text" ).val(),
            'ubcar_nonce_field': jQuery( "#ubcar_nonce_field" ).val()
        };
        jQuery( "#ubcar-body-comments-submit" ).html( '<div class="ubcar-delay"></div>' );
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            var data = {
                'action': 'ubcar_point_comments_retriever',
                'ubcar_point_id': point_id
            };
            jQuery.post(ajax_object.ajax_url, data, function(response) {
                object_instance.display_point_comments( response, point_id );
            });
        });
        jQuery( "#ubcar-body-comments-submit" ).html( '<div class="ubcar-delay"></div>' );
    }
    
    /**
     * AJAX call to class-ubcar-view-map.php's ubcar_submit_reply(),
     * then displaying the retrieved comments.
     *
     * @param {String} point_id - The point id.
     * @param {String} parent_id - The parent comment id.
     */
    this.submit_new_reply = function( point_id, parent_id ) {
        var data = {
            'action': 'ubcar_submit_reply',
            'ubcar_point_id': point_id,
            'ubcar_reply_text': jQuery( "#ubcar-comment-reply-text-" + parent_id ).val(),
            'ubcar_comment_parent': parent_id,
            'ubcar_nonce_field': jQuery( "#ubcar_nonce_field" ).val(),
        };
        jQuery( "#ubcar-body-comments" ).html( '<div class="ubcar-delay"></div>' );
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            var data = {
                'action': 'ubcar_point_comments_retriever',
                'ubcar_point_id': point_id
            };
            jQuery.post(ajax_object.ajax_url, data, function(response) {
                object_instance.display_point_comments( response, point_id );
            });;
        });
    }
    
    /**
     * Helper function to retrieve_point(), testing if a streetview
     * is available for a certain point.
     *
     * @param {String} point_id - The point id.
     * @param {Object} latlng_object - The latlng object with the coordinates of the point.
     */
    this.display_streetview = function( point_id, latlng_object ) {
        var streetview_tester = new google.maps.StreetViewService();
        streetview_tester.getPanoramaByLocation( latlng_object, 50, function( data, status) {
            object_instance.display_streetview_test( point_id, data, status, latlng_object );
        });
    }
    
    /**
     * Helper function to display_streetview(), testing if a streetview
     * is available for a certain point and allowing the option to
     * display it if it is.
     *
     * @param {String} point_id - The point id.
     * @param {Object} data - Google supplied parameter.
     * @param {Object} status - Google supplied parameter.
     * @param {Object} latlng_object - The latlng object with the coordinates of the point.
     */
    this.display_streetview_test = function( point_id, data, status, latlng_object ) {
        if (status == google.maps.StreetViewStatus.OK) {
            jQuery( "#ubcar-display-choice-street" ).css( "background", "#002145");
            jQuery( "#ubcar-display-choice-street" ).click(function() {
                jQuery( "#ubcar-map-canvas" ).hide();
                jQuery( "#ubcar-streetview-canvas" ).show();
                jQuery( "#ubcar-display-fullscreen" ).addClass( "ubcar-display-fullscreen-move" );
                jQuery( "#ubcar-display-choice-map" ).addClass( "ubcar-display-choice-map-move" );
                jQuery( "#ubcar-display-choice-street" ).addClass( "ubcar-display-choice-street-move" );
                var streetview_options = {
                    position: latlng_object
                }
                var streetview = new google.maps.StreetViewPanorama( document.getElementById( 'ubcar-streetview-canvas' ), streetview_options );
            });
        }
    }
    
    /**
     * Helper function to display_points() and hide_points(),
     * resizing the map if necessary.
     */
    this.resize_map = function() {
        var map_bounds = new google.maps.LatLngBounds();
        for( i in ubcar_points ) {
            if( ubcar_points[i].active == true && ubcar_points[i].raw_data.geojson_bounds != null ) {
                var temp_sw = new google.maps.LatLng( ubcar_points[i].raw_data.geojson_bounds.sw_lat, ubcar_points[i].raw_data.geojson_bounds.sw_lng );
                var temp_ne = new google.maps.LatLng( ubcar_points[i].raw_data.geojson_bounds.ne_lat, ubcar_points[i].raw_data.geojson_bounds.ne_lng );
                var temp_bounds = new google.maps.LatLngBounds( temp_sw, temp_ne );
                map_bounds.union( temp_bounds );
                map_instance.fitBounds( map_bounds );
                if( temp_sw.lat() == temp_ne.lat() && temp_sw.lng() == temp_ne.lng() ) {
                    map_instance.setZoom( 8 );
                }
            }
        }
    }
    
    /**
     * Function to detect and respond to hidden input fields used
     * to communicate a user's GET request for a specific point,
     * tour, or layer.
     */
    this.request_detector = function() {
        var requested_type = jQuery( "#ubcar-hidden-request-type" ).val();
        var requested_value = jQuery( "#ubcar-hidden-request-value" ).val();
        if( requested_type != null && requested_value != null ) {
            if( requested_type == 'ubcar_point' ) {
                object_instance.retrieve_point( requested_value );
                var requested_latitude = jQuery( "#ubcar-hidden-request-latitude" ).val();
                var requested_longitude = jQuery( "#ubcar-hidden-request-longitude" ).val();
                var requested_latlng = new google.maps.LatLng( requested_latitude, requested_longitude );
                var max_zoom_service = new google.maps.MaxZoomService();
                max_zoom_service.getMaxZoomAtLatLng( requested_latlng, function( max_zoom ){
                    map_instance.setCenter( requested_latlng );
                    if( max_zoom.zoom != null ) {
                        map_instance.setZoom( max_zoom.zoom );
                    } else {
                        map_instance.setZoom( 16 );
                    }
                });
            } else if( requested_type == 'ubcar_layer' ) {
                jQuery( "#ubcar-accordion-header-layers" ).click();
                jQuery( "#" + requested_value ).click();
            } else if( requested_type == 'ubcar_tour' ) {
                jQuery( "#ubcar-accordion-header-tours" ).click();
                jQuery( "#" + requested_value ).click();
            } else {
                object_instance.retrieve_points( 0, 'all' );
            }
        } else {
            object_instance.retrieve_points( 0, 'all' );
        }
    }
    
}

// bad variables used for XSS
var entity_map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;',
    "\n": '<br />'
};

/**
 * Function to sanitize user-supplied input fields not handled
 * by WordPress's comments system.
 *
 * @param {String} string - Input string.
 * @return {String} string - Sanitized output string.
 */
function escape_html( string ) {
    return String(string).replace( /[&<>"'\/]|[\n]/g, function ( character_to_be_replaced ) {
        return entity_map[character_to_be_replaced];
    });
}