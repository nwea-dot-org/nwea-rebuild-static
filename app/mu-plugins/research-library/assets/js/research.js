/* global jQuery */
(function($) {

    var ResearchTiles = function(options){
        
    	var vars = {};
    	var root = this;
    	
    	this.construct = function( options )
    	{
            $.extend(vars , options);
        };
        
        this.adjust_main_width_background_image_heights = function()
        {
        	var relTag, heights, window_size, tmp, ccWidth; // @GK one_em never used
            // console.log('window:%s, container:%s, each menu:%s',$(window).width(),$('.container').width(),($(window).width()-$('.container').width())/2);
            // console.log($('.full-width.has-background'));
            $.each($( '.main-width.has-background' ),function(){
                    // var element_id = $(this).attr('id'); // @GK Never used
                // console.log(element_id);
                relTag = $(this).attr('rel');
                relTag = relTag.split(':');
                if(relTag[0] == 'heights' && relTag[1] != ',') {
                    heights = {
                        'lg':relTag[1].split(',')[0],
                        'md':relTag[1].split(',')[1],
                        'sm':relTag[1].split(',')[2]
                    };
                    $(this).css( {'height':heights[window_size] + 'px','border':'1px solid green !important'} );
                    // console.log(heights);
                    return;
                } else if(relTag[0] == 'dimensions' && relTag[1] != ',') {
                    // one_em = 14.5; @GK Never used
                    tmp = {
                        'id' : $( this ).attr( 'id' ),
                        'height' : parseInt(relTag[1].split(',')[0]),
                        'width' : parseInt(relTag[1].split(',')[1]),
                        'main_width' : $( '.container .maincol' ).width(),
                        'window_size' : window_size,
                        'inner_div_height' : $('#' + $(this).attr('id')).find('div.content').outerHeight()
                    };
                    
                    tmp.ratio = tmp.height / tmp.width;
        
                    tmp.newCss = {
                        'height' : tmp.main_width*tmp.ratio + 'px',
                        'background-size' : 'cover'
                    };
        
                    // @GK Homepage - adding fixup to give the area a soft background color while loading new images
                    $('#' + tmp.id).css(tmp.newCss).addClass('fixup').addClass('fixup');
        
                    // if we are talking about the hp-carousel, we are going to adjust the with of the controls...
                    if ($(this).hasClass('hp-carousel')){
                        ccWidth = ( $(window).width() - $('.container').width() ) / 2;
                        $( '.carousel-control' ).css({'width':ccWidth + 'px'});
                    }
        
                    return;
                }
            });
        };
    };
    
    /* *~*~*~*~*~*~*~*~*~*~*~*~*  */
	/*  *~ Filter Constructor ~*  */
	var $research_tiles = new ResearchTiles();
    /* *~*~*~*~*~*~*~*~*~*~*~*~*  */
    
    $(window).on('load', function () {
    	'use strict';
    	var w, ogSize, window_size, doneResizing;
    	
        $research_tiles.adjust_main_width_background_image_heights();
        
        $(window).resize(function(){
            if( w != $( window ).width() ){
                ogSize = window_size;
    
                clearTimeout(resizeId);
                var resizeId = setTimeout(doneResizing, 250);
            }
            
            $research_tiles.adjust_main_width_background_image_heights();
        });
            
    });

})(jQuery);