jQuery( document ).ready(function( $ ) {
	
	jQuery( '#ubcar-options-submit' ).click(function() {
		updateOptions();
	});
	
});

/**
 * AJAX call to class-ubcar-admin.php's ubcar_options_updater_callback(),
 * updating UBCAR's options.
 */
function updateOptions() {
	
	var cssChoice, data;
	
	if( jQuery( '#ubcar-css-choice-1' ).attr( 'checked' ) === 'checked' ) {
		cssChoice = 'responsive';
	} else {
		cssChoice = 'full';
	}
	data = {
		'action': 'options_updater',
		'ubcar_css_choice': cssChoice,
		'ubcar_google_maps_api_key': escapeHTML( jQuery( '#ubcar-google-maps-api-key' ).val() ),
		'ubcar_app_title': escapeHTML( jQuery( '#ubcar-app-title' ).val() ),
		'ubcar_app_introduction': escapeHTML( jQuery( '#ubcar-app-introduction' ).val() )
	};
	jQuery.post( ajax_object.ajax_url, data, function( response ) {
		alert( response );
	});
}