var ubcar_add_new_media_status = 0;

jQuery( "#ubcar-add-new-toggle" ).click(function() {
    jQuery( "#ubcar-add-new-form" ).slideToggle( "slow" );
    if(ubcar_add_new_media_status == 0) {
        jQuery( "#ubcar-add-toggle-arrow" ).html("&#9658");
        ubcar_add_new_media_status = 1;
    } else {
        jQuery( "#ubcar-add-toggle-arrow" ).html("&#9660");
        ubcar_add_new_media_status = 0;
    }
});

jQuery( "#ubcar-add-new-toggle" ).click();

var entity_map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;',
    "\n": '<br />'
};

function escape_html(string) {
    return String(string).replace( /[&<>"'\/]|[\n]/g, function ( character_to_be_replaced ) {
        return entity_map[character_to_be_replaced];
    });
}