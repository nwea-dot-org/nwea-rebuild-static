/* global $ jQuery */

(function($) {
	$(function() {
		// @GK @TODO Advance behavior would come in after paged links are working (best practice for accessiblity)
		//
		// $('#pagination .page-numbers').on('click',function(e){
		// 	e.preventDefault();
			
		// 	var query_data = [];
		// 	query_data['themes'] = $('#pagination').data('themes');
		// 	query_data['exclude'] = $('#pagination').data('exclude');
		// 	if(!$(this).hasClass('active')){
		// 		$(this).siblings('.page-numbers').removeClass('current');
		// 		$(this).toggleClass('current');
				
		// 		updatePostResults( query_data );
		// 	}
		// 	return false;
		// });
		
		// See more functionality START
		$("section.maincol a.ellipsis").click(function (e) {
		    e.preventDefault(); //prevent '#' from being added to the url
			var el = $(this);

		    el.parent().find('span.ellipsis').fadeToggle( 500, null, function(){
		    	el.text( el.text() == 'See More' ? 'See Less' : 'See More' );				
				if( el.text() == 'See More' ){
					el.parent().toggleClass('showing');
				}
		    });

			if( el.text() == 'See More' ){
				el.parent().delay(1000).toggleClass('showing');
			}
			
		});
		
		$(document).on('click','.results_feed span',function(){
			var filter = $(this).data('remove-filter');
			var term = $(this).data('remove-target');

			$('#data-target-'+filter+' item[data-option="all"]').trigger('click');
		});
		// See more functionality END
        
	});
})(jQuery);

function updatePostResults( query_data ){
	
	var query_url ='/wp-json/wp/v2/publications/?research_theme=' + query_data['themes'] + '&exclude=' + query_data['exclude'] + '&offset=0';
	// console.log(query_url);
	
	// var selectResearchCenter = $('.filter_list #data-target-research_center item.active').data('option');
	// var selectTopic 		 = $('.filter_list #data-target-research_theme item.active').data('option');
	// var selectType			 = $('.filter_list #data-target-publication_type item.active').data('option');
	// var selectResearcher	 = $('.filter_list #data-target-researcher item.active').data('option')
	
	// $.ajax({
	// 	url: '/content/module/research/ajax/results.php?loc='+selectResearchCenter+'&topic='+selectTopic+'&type='+selectType+'&researcher='+selectResearcher,
	// 	type: "POST",
	// 	data: {
	// 		loc: selectResearchCenter,
	// 		topic: selectTopic,
	// 		type: selectType,
	// 		researcher: selectResearcher,
	// 	},
	// 	dataType: 'JSON'
	// }).done(function( data ) {
	// 	if( data.count < 1){
	// 		$('.results_feed .wrap').fadeOut('fast',function(){
				
	// 			$(this).empty();
				
	// 			var el = $('<div />', {
	// 				class: 'row' 
	// 			});
				
	// 			var queryText;
	// 			if( selectResearchCenter !== 'all' ){
	// 				queryText = 'No Publications Found';
	// 			} else {
	// 				queryText = 'No Publications Found'
	// 			}
				
	// 			$('<h4 />',{
	// 				text: queryText,
	// 			}).appendTo( el );
				
	// 			$('.results_feed .wrap').append(el).fadeIn(450);
				
	// 		});
			
	// 	} else {
			
	// 		$('.results_feed .wrap').fadeOut('fast',function(){
	// 			$(this).empty();
				
	// 			var el = $('<div />', {
	// 				class: 'row' 
	// 			});
				
	// 			var queryText;
	// 			if( selectResearchCenter !== 'all' ){
	// 				queryText = 'Research from the '+ data['chip'][0]['name'];	
	// 			} else {
	// 				queryText = 'All Publications'
	// 			}
				
	// 			$('<h4 />',{
	// 				text: queryText,
	// 			}).appendTo( el );
			
	// 			$.each(data['chip'],function(k,v){
	// 				$('<span>',{
	// 					text: v.name,
	// 					'data-remove-filter' : v.filter,
	// 					'data-remove-target' : v.slug,
	// 				}).appendTo( el );
	// 			});
			
	// 			$('.results_feed .wrap').append(el);
				
	// 			var list = el.append('<ul />').find('ul');
				
	// 			$.each(data['p'], function(k,v){
					
	// 				var item = $('<li>');
	// 				var link = $("<a>", {
	// 					text: v.title,
	// 					title: v.title,
	// 					href: v.permalink
	// 				}).appendTo(item);
					
	// 				item.appendTo(list);
					
	// 			});
				
	// 			$('.results_feed .wrap').append(el).fadeIn(450);
				
	// 		});
			
	// 	}
		
	// } ).always(function() {

		// Always callback hook
  
	// });
}