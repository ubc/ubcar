jQuery(document).ready(function($) {
    
    jQuery( "#ubcar-options-submit" ).click(function() {
        update_options();
    });
    
});

/**
 * AJAX call to class-ubcar-admin.php's ubcar_options_updater_callback(),
 * updating UBCAR's options.
 */
function update_options() {
    if( jQuery( "#ubcar_css_choice-1" ).attr("checked") == 'checked' ) {
        var css_choice = 'responsive';
    } else {
        var css_choice = 'full';
    }
    var data = {
        'action': 'options_updater',
        'ubcar_css_choice': css_choice,
        'ubcar_google_maps_api_key': jQuery( "#ubcar_google_maps_api_key" ).val(),
        'ubcar_app_title': jQuery( "#ubcar_app_title" ).val(),
        'ubcar_app_introduction': jQuery( "#ubcar_app_introduction" ).val()
    };
    jQuery.post(ajax_object.ajax_url, data, function(response) {
        alert( response );
    });
}
