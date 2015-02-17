<?php
    /**
     * A redirection page
     * 
     * This file redirects users to the designated return URL.
     * 
     * @package UBCAR
     */
    header( "Location: " . $_GET['return'] );
    exit;
?>
