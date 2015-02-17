<?php
    
    /**
     * The UBCAR_Point_Data_JSON class
     * 
     * This file defines the UBCAR_Point_Data_JSON subclass. The
     * UBCAR_Point_Data_JSON subclass produces JSON-formatted data about an
     * individual ubcar_point and associated data.
     * 
     * @package UBCAR
     */

    /**
     * The UBCAR_Point_Data_JSON class.
     */
    class UBCAR_Point_Data_JSON extends UBCAR_Data {
    
       // TODO: create JSON data for individual ubcar_point and associated data

        /**
         * The UBCAR_Data constructor.
         * 
         * @access public
         * @return void
         */
        public function __construct() {
            $this->add_actions();
        }
    }
    
?>
