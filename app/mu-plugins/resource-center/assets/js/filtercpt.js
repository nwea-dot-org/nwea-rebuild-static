/* global $ jQuery location history change */
/* Resource Center */
(function($) {
	
	var nweaDebug = function(msg){
		// window.console.log('%c [DEBUG] ' + msg, 'background: #222; color: #bada55');	
	};
	
	var Filter = function(options){
		var vars = {};
		var root = this;
		
		// @GK TODO get newest URL from object instead of the DOM
		var filterVal;
	    
		this.construct = function( options )
		{
			// As in the example to setting up a constructor
	        $.extend(vars , options);
	    };
	    
	    this.setFilterVal = function(val)
	    {
	    	this.filterVal = val;
	    };
	    
	    this.getFilterVal = function(val)
	    {
	    	return this.filterVal;
	    };
	    
		this.make_url_JSON = function( selected )
		{
			var url = '/resource-center/filter/' + selected.resource_topic + '/' + selected.resource_type + '/' + selected.resource_product + '/' + selected.resource_grade_level + '/';
		
			$('.filter-container').val(url);
			root.setFilterVal( url );
		};
		
		this.make_gather_url_JSON = function( selected )
		{
			var url = '/resource-center/filter/' + selected.resource_topic + '/' + selected.resource_type + '/' + selected.resource_product + '/' + selected.resource_grade_level + '/';
			
			
			$('.filter-container').val(url);
			root.setFilterVal( url );
			
			root.gather_posts(url);
			root.remove_featured_content_pdg();
		};

		this.remove_featured_content_pdg = function()
		{
			$('.pdg-content-wrap.featured-content-holder').closest('.container').fadeOut(1100,function(){
				$(this).remove();
			});
		};
		
	    this.scroll_top_filter = function()
	    {
			$([document.documentElement, document.body]).animate({
		      scrollTop: $(".filter-container").offset().top - 50
		    }, 1000, 'easeInOutQuint');
		};
	
		this.ajax_chip_data = function( data )
		{
			var el = $('<ul />', {
				class: 'list-unstyled' 
			});
			
			var close_icon = $('<i />', {
				class: 'fa fa-times-circle'
			});
			
			$.each(data['chip'],function(k,v){
				if(v.name != null){
					if( 'resourcelib_grade_level' == v.filter ){
						v.name = 'Grade level: ' + v.name;
					}
					$('<div>',{
						text: v.name.replace( /\&amp;/g, '&' ),
						'data-remove-filter' : v.filter,
						'data-remove-target' : v.slug,
						class: 'chip active '+ v.filter
					})
						.wrapInner( "<span />")
						.append( close_icon.clone() )
						.wrap('<li>').parent()
						.appendTo(el);
				}
			});
			
			$('.row.chip-wrap').children('ul').fadeOut( 25, function(){
				$(this).remove();
				// @GK going away from fading el.hide().appendTo('.row.chip-wrap').delay(250).fadeIn(100);
				el.hide().appendTo('.row.chip-wrap').show();
			});
		};
	
		this.remove_chip = function( remove )
		{
			$('a[data-option="'+remove.target+'"]').trigger('click');
			
			var containerVal = $('.filter-container').val();

			// @GK TODO (this should be the preferred method) var containerVal = this.getFilterVal();
			
			var newURL = containerVal
							.replace(remove.target, '')
							.replace('//','/all/')
							.replace('/,','/')
							.replace(',/','/')
							.replace(',,',',');
			
			$('.filter-container').val(newURL);
			
			root.setFilterVal( newURL );
			
			root.gather_posts( newURL );
		};
		
		this.ajax_assets_data = function( data )
		{
			
			var pages = Math.ceil( data['count'] / 7 );
			
			if( data['p'].length === 0 && data['paged'] > 1 && data['paged'] > pages ) {
				var newURL = $('.filter-container').val().split('page/')[0] + 'page/' + pages;
				
				$('.filter-container').val(newURL);
				
				this.setFilterVal( newURL );
				root.gather_posts(newURL);
				
				$('.table.related > .tbody').empty();
			
				return false;
			}
			
			$('.table.related > .tbody').empty();
			
			if( data['p'].length === 0 ){
				
				var item_wrap = $('<div />',{class:'tr row tbody'});

				var txt_title	= $("<span>", {
									text: "No Results Found",
									title: "No Results Found"
								  }).wrap('<h4 />').parent();
				
				var imgcol	= $( $('<div />') ).wrap('<div class="cell-wrap" />').parent().wrap('<div class="td col-img d-none d-md-block" />').parent();
				// For the responsiveness layout, 
				// use imgrow in the text column
				var imgrow	  = $( $('<div />') ).wrap('<div class="imgrow visible-xs visible-sm d-md-none d-lg-none" />').parent();
				
				var txtcol = $('<div />',{class: 'cell-wrap'})
								.append( imgrow )
								.append( txt_title )
								.wrap('<div class="td col-txt">').parent();
				var datecol	= $('<span />', {
									class: 'date',
									text: '',
							  })
								.wrap('<div class="cell-wrap" />').parent()
								.wrap('<div class="td col-date" />').parent();
				
				var tbody = item_wrap.append(imgcol).append(txtcol).append(datecol);
				
				// $('.results_feed .wrap').append(el).fadeIn(450);
				$('.table.related > .tbody').append(tbody);
				return false;
			} 
			
			
			$.each(data['p'], function(k,v){
	
				var item_wrap = $('<div />',{class:'tr row tbody'});
				
				var txt_type	= $('<p />',{ 
									text: v.type,
									class:'asset-type plus',
								  });
				var txt_title	= $("<a>", {
									text: $('<div />').html(v.title).text(),
									title: $('<div />').html(v.title).text(),
									href: v.permalink,
								  }).wrap('<p class="asset-title fs-base fw-500" />').parent();
				var txt_description = $('<div />', {
					class: 'search-description line-clamp-3' 
				}).html(v.description);

				var txt_topics = ( 1 <= v.topics.length ) ? $('<p />',{class: 'topics'}).html('Topics: ' + v.topics) : $('<p />') ;

				var txt_products = ( 1 <= v.products.length ) ? $('<p />',{class: 'products'}).html('Products: ' + v.products) : $('<p />') ;

				var imgcol	= $( v.thumb ).wrap('<div class="cell-wrap" />').parent().wrap('<div class="td col-img d-none d-md-block" />').parent();

				// For the responsiveness layout, 
				// use imgrow in the text column
				var imgrow	  = $( v.thumb ).wrap('<div class="imgrow visible-xs visible-sm d-md-none d-lg-none" />').parent();
				
				var txtcol = $('<div />',{class: 'cell-wrap'})
								.append( imgrow )
								.append( txt_type )
								.append( txt_title )
								.append( txt_description )
								.append( txt_topics )
								.append( txt_products )
								.wrap('<div class="td col-txt">').parent();
				var datecol	= $('<span />', {
									class: 'date',
									text: v.date,
							  })
								.wrap('<div class="cell-wrap" />').parent()
								.wrap('<div class="td col-date" />').parent();
				
				var tbody = item_wrap.append(imgcol).append(txtcol).append(datecol);
				
				// $('.results_feed .wrap').append(el).fadeIn(450);
				$('.table.related > .tbody').append(tbody);
			});
		
		};
	
		this.ajax_pagination_data = function( data )
		{

			$('#pagination').empty();

			console.log( data['count'])
			if( data['count'] < 7 ){
				// @GK Do Nothing!	
			}else{
				// @GK Get number of pages
				var pages = Math.ceil( data['count'] / 7 );
				
				// @GK place the page count as the new val for pagination to return # of pages later
				$('#pagination').val(pages);
				
				// @GK Add the prev page link to the pagination
				if(  pages >= 2 && data['paged'] > 1  ){
					$('<a />',{
						class: 'prev page-numbers',
						'data-paginate-action': 'prev',
						text: '‹',
						href: "#",
						onclick: 'return false;',
					}).appendTo('#pagination');
				}
				
				// @GK Set the first page as active and create page-numbers
				// @GK New as of v2.1.7....show top page # in the list
				if(  pages <= 5 ){
					for(var $i = 1; $i <= pages && $i <= 5 ; $i++ )
					{
						var pageLink = $('<a />',{
							class: 'page-numbers',
							'data-paginate-page': $i,
							text: $i,
							href: "#",
							onclick: 'return false;',
						}); 
						
						if( $i == data['paged'] ){
							pageLink.addClass('current');
						}
						
						pageLink.appendTo('#pagination');
					}
				} else if ( pages > 5 && data['paged'] > 2  ) {
					// Quick way to show the middle pages.
					for(var $i = 1; $i <= pages ; $i++ )
					{
						var pageLink = $('<a />',{
							class: 'page-numbers',
							'data-paginate-page': $i,
							text: $i,
							href: "#",
							onclick: 'return false;',
						}); 
						
						if( $i == data['paged'] ){
							pageLink.addClass('current');
						}
						
						if( $i == pages - 1 && data['paged'] < pages - 2 ){
							var endPageLink = $('<span />',{
								class: 'page-numbers dots',
								text: '…',
								href: "#",
								onclick: 'return false;',
							}).appendTo('#pagination');
							
							endPageLink.appendTo('#pagination');
						}else if ( $i == pages ){ 
							pageLink.appendTo('#pagination');
						} else if ( $i == 1 || ( $i > data['paged'] - 3 && $i < data['paged'] + 2 ) ){
							pageLink.appendTo('#pagination');
						}
						
						if( $i == 1 && data['paged'] > 4 ){
							var pageLink = $('<span />',{
								class: 'page-numbers dots',
								text: '…',
								href: "#",
								onclick: 'return false;',
							}).appendTo('#pagination');
						}
						
					}
				} else {
					for(var $i = 1; $i <= pages ; $i++ )
					{
						var pageLink = $('<a />',{
							class: 'page-numbers',
							'data-paginate-page': $i,
							text: $i,
							href: "#",
							onclick: 'return false;',
						}); 
						
						if( $i == data['paged'] ){
							pageLink.addClass('current');
						}
						
						if( $i == 4 ){
							var pageLink = $('<span />',{
								class: 'page-numbers dots',
								text: '…',
								href: "#",
								onclick: 'return false;',
							}).appendTo('#pagination');
						}else if( $i == pages ) {
							pageLink.appendTo('#pagination');
						}else if( $i < 4 ){
							pageLink.appendTo('#pagination');
						}
					}
				}
	
				// @GK Add the next page link to the pagination...
				// @GK New as of v2.1.7... if the total num. pages is greater than the page
				if(  pages >= data['paged'] + 1 && data['paged'] < pages  ){
					$('<a />',{
						class: 'next page-numbers',
						'data-paginate-action': 'next',
						text: '›',
						href: "#",
						onclick: 'return false;',
					}).appendTo('#pagination');
				}else{
					// Do Nothing
				}
					

			}
		};
	
		this.ajax_pagination_init = function ( url )
		{
			$.ajax({
				url: url,
				dataType: 'JSON'
			}).done(function( data ) {
				root.ajax_pagination_data(data);
			});
		}
		
	    this.gather_posts = function( url )
	    {
			$('.table.assets .tbody, #pagination').animate({
		      opacity: .35
		    }, 500);
		    
		    $('.topic-container .topic-wrap').animate({
		      opacity: .55
		    }, 500);
		    
			$.ajax({
				url: url,
				dataType: 'JSON'
			}).done(function( data ) {
				setTimeout(function(){
					$('.topic-container .topic-wrap, .table.assets .tbody, #pagination').animate({
				      opacity: 1
				    }, 500);
				    
					// @GK Reveal the clear button
					if( $('.chip.active').length >= 1 ){
						$('.reset.btn-clear').removeClass('d-none');
					}else{
						$('.reset.btn-clear').addClass('d-none');
					}
				},350);
				
				// @GK Had trouble getting back button to work properly
				var $hash = "/" + "resource-center/all-resources/";
				window.history.replaceState({}, document.title, $hash);
				
				root.ajax_chip_data(data);
				
				if( data['topic'] ){
					var topic_slug;
					var tax_term = data['chip'][0]['filter'];

					if('resourcelib_topic_primary' == tax_term){
						topic_slug = 'primary-topic';
					}else{
						topic_slug = 'topic';
					}
					root.apply_topic( data['topic'], 'topic' );
					$hash = "/" + "resource-center/" + topic_slug + "/" + data['topic']['slug'];
					window.history.replaceState({}, document.title, $hash );
				} else if ( data['type'] ) {
					root.apply_topic( data['type'], 'type' );
					$hash =  "/" + "resource-center/type/" + data['type']['slug'];
					window.history.replaceState({}, document.title, $hash );
				} else if ( data['product'] ) {
					root.apply_topic( data['product'], 'product' );
					$hash =  "/" + "resource-center/product/" + data['product']['slug'];
					window.history.replaceState({}, document.title, $hash );
				} else if ( data['grade_level'] ) {
					root.apply_topic( data['grade_level'], 'grade_level' );
					$hash =  "/" + "resource-center/grade-level/" + data['grade_level']['slug'];
					window.history.replaceState({}, document.title, $hash );
				}else{
					root.hide_topic();
				}
				
				root.ajax_assets_data(data);
				
				root.ajax_pagination_data(data);
				
			}).always(function(data){ /* Always run this code */  });
		};
	
		this.prev_filter_page = function()
		{
			var current = $('#pagination .page-numbers.current').data('paginate-page');
			
			if(current > 1){
				$('#pagination .page-numbers.current').removeClass('current');
			
				var newURL = $('.filter-container').val().split('page/')[0] + 'page/' + ( current - 1 );
				$('.filter-container').val(newURL);
				this.setFilterVal( newURL );
			
				$('#pagination .page-numbers[data-paginate-page=' + ( current - 1 ) + ']').addClass('current');
			
				root.gather_posts(newURL);
				root.scroll_top_filter();
			}
		};
	
		this.next_filter_page = function()
		{
			var current = $('#pagination .page-numbers.current').data('paginate-page');
		
			if( $('#pagination .page-numbers[data-paginate-page=' + ( current + 1 ) + ']').is(':visible') ){
				$('#pagination .page-numbers.current').removeClass('current');
			
				var newURL = $('.filter-container').val().split('page/')[0] + 'page/' + ( current + 1 );
				
				$('.filter-container').val(newURL);
				this.setFilterVal( newURL );
			
				$('#pagination .page-numbers[data-paginate-page=' + ( current + 1 ) + ']').addClass('current');
			
				root.gather_posts(newURL);
				root.scroll_top_filter();
			}
		};

		// @GK TODO this function name is too similar to the research_theme/topics schema.
		// It is updating the filter singular chip's intro paragraph 
		this.apply_topic = function( topic, tax_class )
		{
			if( 'grade_level' == tax_class ){
				topic.name = 'Grade Level: ' + topic.name;
			}
			/* global adjust_full_width_background_image_heights */
			$('.topic-container .topic-wrap').removeClass('empty');
			$('.topic-container .topic-wrap .topic-title').html( topic.name ).fadeIn();
			$('.topic-container .topic-wrap .topic-description').html( topic.description ).fadeIn();
			$('.bannerwrap').html( topic.banner );
			// Not found in the rebuild
			// adjust_full_width_background_image_heights();
		};
		
		this.hide_topic = function()
		{
			$('.topic-container .topic-wrap .topic-title').fadeOut(function(){$(this).empty()});
			$('.topic-container .topic-wrap .topic-description').fadeOut(function(){$(this).empty()});
			$('.topic-container .topic-wrap').addClass('empty');
		};
		
		this.clear_results = function()
		{
			// The submit button is inside a chip-wrap also, so I specified .row.chip-wrap for chips.
			$('.row.chip-wrap').children().fadeOut('200',function(){
				$(this).empty();
			});
			
			$('.dropdown-menu').each(function(){
				$(this).val('');
			});
			
			$('.dropdown ul li.active').each(function(){
				$(this).removeClass('active');
			})
			
			$('.filter-container .btncol .btn-submit').trigger('click'); // @GK this fn can be improved
		};
		
		this.single_gather_url_JSON = function( selected )
		{
			var url = '/resource-center/filter/' + selected.resource_topic + '/' + selected.resource_type + '/' + selected.resource_product + '/' + selected.resource_grade_level + '/';
			// if( 'ASC' == selected.order ){
			// 	url = url + '?order=reversed';
			// }
			$('#related-resources').val(url);
			
			return url;
		};
		
		this.single_ajax_assets_data = function( data )
		{
			
			var pages = Math.ceil( data['count'] / 7 );
			
			if( data['p'].length === 0 && data['paged'] > 1 && data['paged'] > pages ) {
				var newURL = $('#related-resources').val().split('page/')[0] + 'page/' + pages;
				
				$('#related-resources').val(newURL);
				
				root.single_gather_posts(newURL);
				
				$('.table.related > .tbody').empty();
			
				return false;
			}
			
			$('.table.related > .tbody').empty();
			
			if( data['p'].length === 0 ){
				
				var item_wrap = $('<div />',{class:'tr row tbody'});

				var txt_title	= $("<span>", {
									text: "No Results Found",
									title: "No Results Found"
								  }).wrap('<h4 />').parent();
				
				var imgcol	= $( $('<div />') ).wrap('<div class="cell-wrap" />').parent().wrap('<div class="td col-img d-none d-md-block" />').parent();
				// For the responsiveness layout, 
				// use imgrow in the text column
				var imgrow	  = $( $('<div />') ).wrap('<div class="imgrow d-xs-block d-md-none" />').parent();
				
				var txtcol = $('<div />',{class: 'cell-wrap'})
								.append( imgrow )
								.append( txt_title )
								.wrap('<div class="td col-txt">').parent();
				var datecol	= $('<span />', {
									class: 'date',
									text: '',
							  })
								.wrap('<div class="cell-wrap" />').parent()
								.wrap('<div class="td col-date" />').parent();
				
				var tbody = item_wrap.append(imgcol).append(txtcol).append(datecol);
				
				// $('.results_feed .wrap').append(el).fadeIn(450);
				$('.table.related > .tbody').append(tbody);
				return false;
			} 
			
			
			$.each(data['p'], function(k,v){
	
				var item_wrap = $('<div />',{class:'tr row tbody'});
				
				var txt_type	= $('<p />',{ 
									text: v.type,
									class:'asset-type plus',
								  });
				var txt_title	= $("<a>", {
									text: $('<div />').html(v.title).text(),
									title: $('<div />').html(v.title).text(),
									href: v.permalink,
								  }).wrap('<p class="asset-title fs-base fw-500" />').parent();
				var txt_description = $('<div />', {
					class: 'search-description line-clamp-3' 
				}).html(v.description);

				var txt_topics = ( 1 <= v.topics.length ) ? $('<p />',{class: 'topics'}).html('Topics: ' + v.topics) : $('<p />') ;

				var txt_products = ( 1 <= v.products.length ) ? $('<p />',{class: 'products'}).html('Products: ' + v.products) : $('<p />') ;

				var imgcol	= $( v.thumb ).wrap('<div class="cell-wrap" />').parent().wrap('<div class="td col-img d-none d-md-block" />').parent();

				// For the responsiveness layout, 
				// use imgrow in the text column
				var imgrow	  = $( v.thumb ).wrap('<div class="imgrow d-xs-block d-md-none" />').parent();
				
				var txtcol = $('<div />',{class: 'cell-wrap'})
								.append( imgrow )
								.append( txt_type )
								.append( txt_title )
								.append( txt_description )
								.append( txt_topics )
								.append( txt_products )
								.wrap('<div class="td col-txt">').parent();
				var datecol	= $('<span />', {
									class: 'date',
									text: v.date,
							  })
								.wrap('<div class="cell-wrap" />').parent()
								.wrap('<div class="td col-date" />').parent();
				
				var tbody = item_wrap.append(imgcol).append(txtcol).append(datecol);
				
				// $('.results_feed .wrap').append(el).fadeIn(450);
				$('.table.related > .tbody').append(tbody);
			});
		
		};
		
		this.single_ajax_pagination_data = function( data )
		{
			$('#pagination').empty();
	
			if( data['count'] < 7 ){
				// @GK Do Nothing!	
			}else{
				// @GK Get number of pages
				var pages = Math.ceil( data['count'] / 7 );
				
				// @GK place the page count as the new val for pagination to return # of pages later
				$('#pagination').val(pages);
				
				// @GK Add the prev page link to the pagination
				if(  pages >= 2 && data['paged'] > 1  ){
					$('<a />',{
						class: 'prev page-numbers',
						'data-paginate-action': 'prev',
						text: '‹',
						href: "#",
						onclick: 'return false;',
					}).appendTo('#pagination');
				}
				
				// @GK Set the first page as active and create page-numbers
				// @GK New as of v2.1.7....show top page # in the list
				if(  pages <= 5 ){
					for(var $i = 1; $i <= pages && $i <= 5 ; $i++ )
					{
						var pageLink = $('<a />',{
							class: 'page-numbers',
							'data-paginate-page': $i,
							text: $i,
							href: "#",
							onclick: 'return false;',
						}); 
						
						if( $i == data['paged'] ){
							pageLink.addClass('current');
						}
						
						pageLink.appendTo('#pagination');
					}
				} else if ( pages > 5 && data['paged'] > 2  ) {
					// Quick way to show the middle pages.
					for(var $i = 1; $i <= pages ; $i++ )
					{
						var pageLink = $('<a />',{
							class: 'page-numbers',
							'data-paginate-page': $i,
							text: $i,
							href: "#",
							onclick: 'return false;',
						}); 
						
						if( $i == data['paged'] ){
							pageLink.addClass('current');
						}
						
						if( $i == pages - 1 && data['paged'] < pages - 2 ){
							var endPageLink = $('<span />',{
								class: 'page-numbers dots',
								text: '…',
								href: "#",
								onclick: 'return false;',
							}).appendTo('#pagination');
							
							endPageLink.appendTo('#pagination');
						}else if ( $i == pages ){ 
							pageLink.appendTo('#pagination');
						} else if ( $i == 1 || ( $i > data['paged'] - 3 && $i < data['paged'] + 2 ) ){
							pageLink.appendTo('#pagination');
						}
						
						if( $i == 1 && data['paged'] > 4 ){
							var pageLink = $('<span />',{
								class: 'page-numbers dots',
								text: '…',
								href: "#",
								onclick: 'return false;',
							}).appendTo('#pagination');
						}
						
					}
				} else {
					for(var $i = 1; $i <= pages ; $i++ )
					{
						var pageLink = $('<a />',{
							class: 'page-numbers',
							'data-paginate-page': $i,
							text: $i,
							href: "#",
							onclick: 'return false;',
						}); 
						
						if( $i == data['paged'] ){
							pageLink.addClass('current');
						}
						
						if( $i == 4 ){
							var pageLink = $('<span />',{
								class: 'page-numbers dots',
								text: '…',
								href: "#",
								onclick: 'return false;',
							}).appendTo('#pagination');
						}else if( $i == pages ) {
							pageLink.appendTo('#pagination');
						}else if( $i < 4 ){
							pageLink.appendTo('#pagination');
						}
					}
				}
	
				// @GK Add the next page link to the pagination...
				// @GK New as of v2.1.7... if the total num. pages is greater than the page
				if(  pages >= data['paged'] + 1 && data['paged'] < pages  ){
					$('<a />',{
						class: 'next page-numbers',
						'data-paginate-action': 'next',
						text: '›',
						href: "#",
						onclick: 'return false;',
					}).appendTo('#pagination');
				}else{
					// Do Nothing
				}
					

			}
		};
		
	    this.single_gather_posts = function( url )
	    {
			if( 'ASC' == $('#related-resources').data('order') ){
				url = url + '?order=reversed';
			}
	    	
			$('.table.assets .tbody, #pagination').animate({
		      opacity: .35
		    }, 500);
		    
		    $('.topic-container .topic-wrap').animate({
		      opacity: .55
		    }, 500);
		    
			$.ajax({
				url: url,
				dataType: 'JSON'
			}).done(function( data ) {
				setTimeout(function(){
					$('.topic-container .topic-wrap, .table.assets .tbody, #pagination').animate({
				      opacity: 1
				    }, 500);
				},350);
				
				root.single_ajax_assets_data(data);
				
				root.single_ajax_pagination_data(data);
				
			}).always(function(data){ /* Always run this code */  });

			return root.gather;
		};
		
	    this.single_init_pagination = function( url )
	    {
			$.ajax({
				url: url,
				dataType: 'JSON'
			}).done(function( data ) {
				root.single_ajax_pagination_data(data);
			}).always(function(data){ /* Always run this code */  });
		};

		this.single_prev_filter_page = function()
		{
			var current = $('#pagination .page-numbers.current').data('paginate-page');
			
			if(current > 1){
				$('#pagination .page-numbers.current').removeClass('current');
			
				var newURL = $('#related-resources').val().split('page/')[0] + 'page/' + ( current - 1 );
				$('#related-resources').val(newURL);

				this.setFilterVal( newURL );
			
				$('#pagination .page-numbers[data-paginate-page=' + ( current - 1 ) + ']').addClass('current');
				
				// if( 'ASC' == $('#related-resources').data('order') ){
				// 	newURL = newURL + '?order=reversed';
				// }
				
				root.single_gather_posts(newURL);
				root.single_scroll_top_resource();
			}
		};
	
		this.single_next_filter_page = function()
		{
			var current = $('#pagination .page-numbers.current').data('paginate-page');
		
			if( $('#pagination .page-numbers[data-paginate-page=' + ( current + 1 ) + ']').is(':visible') ){
				$('#pagination .page-numbers.current').removeClass('current');
			
				var newURL = $('#related-resources').val().split('page/')[0] + 'page/' + ( current + 1 );
				
				nweaDebug('newURL 1 - ' + newURL);
				$('#related-resources').val(newURL);

				this.setFilterVal( newURL );
			
				$('#pagination .page-numbers[data-paginate-page=' + ( current + 1 ) + ']').addClass('current');
			
				// if( 'ASC' == $('#related-resources').data('order') ){
				// 	newURL = newURL + '?order=reversed';
				// }
				// nweaDebug('newURL 2 - ' + newURL);
				
				root.single_gather_posts(newURL);
				root.single_scroll_top_resource();
			}
		};
		
	    this.single_scroll_top_resource = function()
	    {
	    	nweaDebug('Scrolling to top of the list now');
	    	
			$([document.documentElement, document.body]).animate({
		      scrollTop: $("#related-resources").offset().top - 95
		    }, 1000, 'easeInOutQuint');
		};

		this.construct(options);
	};

	/*  *~ Filter Constructor ~*  */
	var $filter = new Filter();
	
	$(document).ready( function(){
		
		// Do Not Show on single assets.
		// Intended to only show on filter pages with pagination
		if ( !$('body').hasClass('single-library_resource') ) {
			
			$(document).on('click','.results_feed span',function(){
				var filter = $(this).data('remove-filter');
				var term = $(this).data('remove-target');
				
				$('#data-bs-target-' + filter + ' item[data-option="all"]').trigger('click');
			});
			
			$(document).on('click','.btncol .btn-clear',function(){
				$filter.clear_results();
			})
			
			$(document).on('click','.dropdown a[data-option]',function(e){
				e.preventDefault();
				// @Allowing for multiple selections - $(this).parent().siblings().removeClass('active');
				var i = 0;
				var this_dropdown = $(this).parent().parent();
				$(this).parent().toggleClass('active');
				
				$(this).parent('li').parent('ul').children('li.active').each(function(){
					// Ternary statement for adding ","\'s between terms if more than one term
					this_dropdown.val(  ( i < 1 ? '' : this_dropdown.val() + ',' ) + $(this).find('a').data('option') );
					i++;
				});
				
				if(i === 0)
				{
					// Clear values for this dropdown
					this_dropdown.val('');
				}
				
				// @DEBUG ONLY
				// @GK Show what was stored as selected, for debugging
				this_dropdown.attr('data-select', this_dropdown.val() );
				
				$('.dropdown.resource-topic').on('classChange', function () {
				  if($(this).hasClass('open')){
				  	// console.log('not yet');
				  }else{
					// console.log('now an event has occured!');
				  }
				});
				
				return false;
			});
			
			// @GK - Timeout so that the event can bind after dropdown events are initiated
			setTimeout(function(){ 
				var $selected_count, $dropdown_overlay;
				var $container_state = {};
				$('.filter-row .dropdown').on('show.bs.dropdown', function() {
				  // show
				  $dropdown_overlay = $('<div />',{class:'dropdown_overlay active_overlay'});
				  
				  $container_state.topic = $('.dropdown.resource-topic ul').val();
				  $container_state.type = $('.dropdown.resource-type ul').val();
				  $container_state.product = $('.dropdown.resource-product ul').val();
				  $container_state.grade_level = $('.dropdown.resource-grade-level ul').val();
				}).on('shown.bs.dropdown', function() {
				  // shown
				  $('body').prepend($dropdown_overlay);
				}).on('hide.bs.dropdown', function() {
				  // hide
				  if(	 $container_state.topic 	 != $('.dropdown.resource-topic ul').val() 
					  || $container_state.type		 != $('.dropdown.resource-type ul').val()
					  || $container_state.product	 != $('.dropdown.resource-product ul').val()
					  || $container_state.grade_level	 != $('.dropdown.resource-grade-level ul').val() ) {
						$('.filter-container .btncol .btn-submit').trigger('click');
				  }
				}).on('hidden.bs.dropdown', function() {
				  // hidden
				  $dropdown_overlay.fadeOut('fast',function(){
				  	$(this).remove();
				  });
				});
			},500)
		
			$(document).on('click','.filter-container .btncol .btn-submit',function(e){
				e.preventDefault();
				var selected = {}; 
					selected.resource_topic 	= $('.dropdown.resource-topic ul').val()	|| 'all' ;
					selected.resource_type		= $('.dropdown.resource-type ul').val() 	|| 'all';
					selected.resource_product	= $('.dropdown.resource-product ul').val()	|| 'all';
					selected.resource_grade_level	= $('.dropdown.resource-grade-level ul').val()	|| 'all';
				
				// Hide the dropdown that may be open
				$('[data-bs-toggle="dropdown"]').parent().removeClass('open');
				
				$filter.make_gather_url_JSON( selected );
		
				return false;	
			});
			
			$(document).on('click','.chip.active',function(e){
				e.preventDefault();
				
				var remove = {};
				
				remove.filter = $(this).data('remove-filter');
				remove.target = $(this).data('remove-target');
				
				$filter.remove_chip(remove);
				
				return false;
			});
			
			$(document).on('click','.page-numbers[data-paginate-page]',function(e){
				e.preventDefault();
				
				var newPage = $(this).data('paginate-page');
		
				var newURL = $('.filter-container').val().split('page/')[0] + 'page/' + newPage;
				$('.filter-container').val(newURL);
				$filter.setFilterVal( newURL );
				
				$(this).siblings().removeClass('current');
				$(this).addClass('current');
				
				$filter.gather_posts(newURL);
		        $filter.scroll_top_filter();
		      
				return false;
			});
			
			$(document).on('click','.page-numbers[data-paginate-action]',function(e){
				e.preventDefault();
				
				var action = $(this).data('paginate-action');
				
				if( action === 'prev' ){
					$filter.prev_filter_page();
				}else{
					$filter.next_filter_page();
				}
		
				return false;
			});
		
		}

		if ( $('body').hasClass('single-library_resource') ) {
			
			// Single Resource Pagination
			var selected = {}; 
				selected.resource_topic 	= $('#related-resources').data('topics') || 'all' ;
				selected.resource_type		= 'all';
				selected.resource_product	= 'all';
				selected.resource_grade_level	= 'all';
				selected.order				= $('#related-resources').data('order') || 'desc' ;

			var url = $filter.single_gather_url_JSON( selected );
				
			$filter.single_init_pagination(url);
			
			$(document).on('click','.page-numbers[data-paginate-page]',function(e){
				e.preventDefault();
				
				var newPage = $(this).data('paginate-page');
					nweaDebug('Related Resources Val');
					nweaDebug($('#related-resources').val());
					
				var newURL = $('#related-resources').val().split('page/')[0] + 'page/' + newPage;
				
				$('#related-resources').val(newURL);
				
				nweaDebug( 'newURL' );
				nweaDebug( $('#related-resources').val(newURL) );
					
				$filter.setFilterVal( newURL );
				
				$(this).siblings().removeClass('current');
				$(this).addClass('current');
				
				$filter.single_gather_posts(newURL);
		        $filter.single_scroll_top_resource();
		      
				return false;
			});

			$(document).on('click','.page-numbers[data-paginate-action]',function(e){
				e.preventDefault();
				
				var action = $(this).data('paginate-action');
				
				if( action === 'prev' ){
					$filter.single_prev_filter_page();
				}else{
					$filter.single_next_filter_page();
				}
		
				return false;
			});
		}
	});

	$(document).ready(function(){
		$('.filter-container .btncol .btn-submit').trigger('click');
	})
	
/* *~*~*~*~*~*~*~*~*~* */
})(jQuery);
