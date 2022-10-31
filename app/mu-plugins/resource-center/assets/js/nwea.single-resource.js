/* global $ jQuery $gate_cb GateUtil POST_ID $utils */
(function($) {
	$(function() {
		
		// See more functionality START
			$("section.maincol a.ellipsis").click(function (e) {
			    e.preventDefault(); //prevent '#' from being added to the url
				var el = $(this);
			    el.parent().find('span.ellipsis').fadeToggle(500,null,function(){
			    	el.text( el.text() == 'See More' ? 'See Less' : 'See More' );
			    	el.parent().toggleClass('showing line-clamp-5');
			    });
			});
			
			$(document).on('click','.results_feed span',function(){
				var filter = $(this).data('remove-filter');
				var term = $(this).data('remove-target');
	
				$('#data-bs-target-'+filter+' item[data-option="all"]').trigger('click');
			});
		// See more functionality END
		
		// Match heights on tiles
        if($('.maincol .tile').is(':visible')){
            $('.maincol .asset-tiles > .col-flex').matchHeight();
        }
        
        // Article Layout
        $('.asset_holder .btn.read-more').on('click',function(e){
        	e.preventDefault();
        	
        	$gate_cb.read_more();
        	// LMF
        	$gate_cb.update_localstorage();
        	
        	return false;
        });
        
        if( $('.allow_all').is(':visible') ){
        	window[ 'allowable_resource' ]();
        }
        
        // If PHP CURL Does not work
        if( $('img.thumbnail_holder').length ){
			var url = 'https://vimeo.com/api/oembed.json?url=https://vimeo.com/' + $('.play_frame').attr('data-video_id') ; // @GK to bust the cacher, include ?v'+Math.ceil(Math.random()*500000)
			$.ajax({
				url      : url,
				dataType : 'JSON',
				method   : 'GET'
			}).done(function(data){
				$('img.thumbnail_holder').css('opacity',0.0)
					.attr( 'src', data.thumbnail_url )
					.animate({'opacity':1.0});
			});
        }
        
        // Video Layout
        $('.asset_holder.video_layout .btn')
	        .mouseenter(function(){
	        	$(this).parent().addClass('hover');
	        })
	        .mouseleave(function(){
	        	$(this).parent().removeClass('hover');
	        });
		    
	    // Asset Video Readiness
        $('.asset_holder.video_layout .btn.play-video').on('click',function(e){
        	e.preventDefault();
        	$gate_cb.play_video();
        	// LMF
        	$gate_cb.update_localstorage();
        	
        	return false;
        }).addClass('ready');
        
        $('.asset_holder.video_layout .play_frame.allow_all .btn-cta').addClass('ready');

		// Link+Download Layout
        let dlayout = $('.asset_holder.download_layout .btn').not('.show-survey');
        
        dlayout.on('click',function(e){
        	// LMF
        	$gate_cb.update_localstorage();
        })
		
		var Asset = function(options){
			
			var vars = {};
			var root = this;
			let url;
			
			this.construct = function( options )
			{
				// As in the example to setting up a constructor
		        $.extend(vars , options);
		    };
		    
		    this.storeLocation = function ( url )
		    {
		    	root.url = url;
		    	console.log('Stored the url');
		    	console.log('URL - ' + root.url);
		    };
		    
		    this.gather_posts = function (){
		    	console.log('Gathering Posts');
		    	
				$.ajax({
					url: root.url,
					// dataType: 'JSON' 
				}).done(function( data ) {
					// console.log('Grabbed the URL and outputting data');
					// console.log(data);
				});
				
				console.log('Finished gathering posts');
		    }
		    
		    this.construct(options);
		}

		/*  *~ Asset Constructor ~*  */
		var $asset = new Asset();
		
		// AJAX Pagination Only
		// $('.page-numbers').on('click',function( e ){
		// 	e.preventDefault();
			
		// 	// Just get the URL and send it to AJAX function inside the $asset obj
		// 	let el = $(this);
		// 	let url = el.attr('href');
			
		// 	$asset.storeLocation(url);
		// 	$asset.gather_posts();
			
		// 	return false;
		// });
		
		// Debug
		if( $('#gated').length < 1 && $('#codex_resourcegate').length >= 1 ){
			$('[data-bs-target="#codex_resourcegate"]').text('').append($( "<p />",{html:'<em>Non-gated Resource</em>'}));
		}

	});
})(jQuery);
