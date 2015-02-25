jQuery(document).ready(function() {
    
    var ubcar_layers_body_status = 'closed';
    var ubcar_tours_body_status = 'closed';
    
    jQuery( "#ubcar-header-information" ).css( "background", "#DEDEDE");
    jQuery( "#ubcar-header-media" ).css( "background", "#DEDEDE");
    jQuery( "#ubcar-header-comments" ).css( "background", "#DEDEDE");
    jQuery( "#ubcar-header-comments-submit" ).css( "background", "#DEDEDE");
    jQuery( "#ubcar-header-aggregate" ).css( "background", "#DEDEDE");
    jQuery( "#ubcar-display-choice-street" ).css( "background", "#DEDEDE");
    
    jQuery( "#ubcar-accordion-header-layers" ).click(function() {
        jQuery( "#ubcar-accordion-body-layers" ).slideToggle( "slow" );
        if( ubcar_layers_body_status == 'closed' ) {
            ubcar_layers_body_status = 'open';
            if( ubcar_tours_body_status == 'open' ) {
                jQuery( "#ubcar-accordion-body-tours" ).slideToggle( "slow" );
                ubcar_tours_body_status = 'closed';
            }
        } else {
            ubcar_layers_body_status = 'closed';
        }
    });

    jQuery( "#ubcar-accordion-header-tours" ).click(function() {
        jQuery( "#ubcar-accordion-body-tours" ).slideToggle( "slow" );
        if( ubcar_tours_body_status == 'closed' ) {
            ubcar_tours_body_status = 'open';
            if( ubcar_layers_body_status == 'open' ) {
                jQuery( "#ubcar-accordion-body-layers" ).slideToggle( "slow" );
                ubcar_layers_body_status = 'closed';
            }
        } else {
            ubcar_tours_body_status = 'closed';
        }
    });
    
    jQuery( "#ubcar-show-all" ).click(function() {
        jQuery( "#ubcar-accordion-body-layers" ).hide();
        jQuery( "#ubcar-accordion-body-tours" ).hide();
        ubcar_layers_body_status = 'closed';
        ubcar_tours_body_status = 'closed';
    });
    
    jQuery( "#ubcar-header-aggregate" ).click(function() {
        if( jQuery( "#ubcar-body-aggregate" ).html() != "" ) {
            jQuery( "#ubcar-body-comments-submit" ).hide();
            jQuery( "#ubcar-body-media" ).hide();
            jQuery( "#ubcar-body-information" ).hide();
            jQuery( "#ubcar-body-comments" ).hide();
            jQuery( "#ubcar-body-aggregate" ).toggle();
        }
    });
    
    jQuery( "#ubcar-header-information" ).click(function() {
        if( jQuery( "#ubcar-body-information" ).html() != "" ) {
            jQuery( "#ubcar-body-comments-submit" ).hide();
            jQuery( "#ubcar-body-media" ).hide();
            jQuery( "#ubcar-body-comments" ).hide();
            jQuery( "#ubcar-body-aggregate" ).hide();
            jQuery( "#ubcar-body-information" ).toggle();
        }
    });
    
    jQuery( "#ubcar-header-media" ).click(function() {
        if( jQuery( "#ubcar-body-media" ).html() != "" ) {
            jQuery( "#ubcar-body-comments-submit" ).hide();
            jQuery( "#ubcar-body-comments" ).hide();
            jQuery( "#ubcar-body-information" ).hide();
            jQuery( "#ubcar-body-aggregate" ).hide();
            jQuery( "#ubcar-body-media" ).toggle();
        }
    });
    
    jQuery( "#ubcar-header-comments" ).click(function() {
        if( jQuery( "#ubcar-body-comments" ).html() != "" ) {
            jQuery( "#ubcar-body-comments-submit" ).hide();
            jQuery( "#ubcar-body-media" ).hide();
            jQuery( "#ubcar-body-information" ).hide();
            jQuery( "#ubcar-body-aggregate" ).hide();
            jQuery( "#ubcar-body-comments" ).toggle();
        }
    });
    
    jQuery( "#ubcar-header-comments-submit" ).click(function() {
        if( jQuery( "#ubcar-body-comments-submit" ).html() != "" ) {
            jQuery( "#ubcar-body-comments" ).hide();
            jQuery( "#ubcar-body-media" ).hide();
            jQuery( "#ubcar-body-information" ).hide();
            jQuery( "#ubcar-body-aggregate" ).hide();
            jQuery( "#ubcar-body-comments-submit" ).toggle();
        }
    });
    
});