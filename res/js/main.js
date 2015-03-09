(function( $ ){
	$.fn.cipCarousel = function(options){
		
		var settings = $.extend({
			el : this,
			itemCtn : $(this).find('wrapper'),
			itemClass : '.item',
			item : $(this).find('.item'),
			itemW : $(this).find('.item').width(),
			debug : false,
			openingMsg : 'Hi, welcome to CipCarousel.\n You read this message because you had anabled the debug mode.\n Good Debugging! ' ,
			navigation : 'nav', // nav | arrow | all
			itemFirstindex : 0,
			itemfirst : $(this).find('.item').eq(0),
			itemActive : {},
			trasholdActivationDrag : 'medium', //short || medium || long
			rangeActivationDrag : {
				'long' : 2,
				'medium' : 3,
				'short' : 4
			},
			callBack : null,
			callbackReturn : true,
			callBackValue : '',
			callBackReturnCtn : '',
			mc : null,
		}, options);

		var s = settings;
		s.itemClass.indexOf('.') < 0 ? s.itemClass = '.' + s.itemClass : false;
		s.item = $(this).find(s.itemClass);
		s.itemW = $(this).find(s.itemClass).width();
		s.itemfirst = $(this).find(s.itemClass).eq(s.itemFirstindex);

		s.debug && debug(s.openingMsg);

		// Private function for debugging.
	    function debug( obj ) {

	        if ( window.console && window.console.log ) {
	            window.console.log( obj );
	        }
	    };

	    function windowResize(){
	    	$('body').append('<div id="cipDebug"><p>resize to view</p></div>');
	    	$( window ).resize(function() {
			 	$('#cipDebug p').html( 'width: ' + $( window ).width() + ' height: ' + $( window ).height());
			});
	    }

		function setClass(){
			//set to the first visible element active class
			s.itemfirst.addClass('active');
			s.itemActive = s.itemfirst;
			$.each(s.item, function(key, value){
				var tc = s.itemClass.split('.');
				tc.shift();
				$(value).attr({'data-index' : key}).addClass(tc + ' ' + tc+'-'+key);
			});
			setLeftRight();
		}

		function setLeftRight(){
			//insert left class before/after active element
			$.each(s.item, function(key, value){
				if(key < s.itemActive.index()){
					$(value).removeClass('ready-right').addClass('ready-left').css({'left' : -s.itemW});
				}else if(key != s.itemActive.index()) {
					$(value).removeClass('ready-left').addClass('ready-right').css({'left' : s.itemW});
				}
			})
		}

		function buildnavigation(){
			var navMarkUp = $('<div>').addClass('navigation');
			var arrowMarkup = '<a href="#1" data-direction="right" class="arrow left">&laquo;</a><a href="#1" data-direction="left" class="arrow right">&raquo;</a>';
			
			switch(s.navigation){
				case 'nav':
					for (var i = 0; i <= s.item.length - 1; i++) {
						navMarkUp.append('<a href="#1" class="btn-floating waves-effect" data-index="'+i+'">&nbsp;</a>');
					};
					s.el.append(navMarkUp);
					s.el.find('.navigation a').eq(s.itemActive.index()).addClass('active light-blue').siblings().removeClass('active');
					break;
				case 'arrow':
					s.el.prepend(arrowMarkup);
					manageArrow();
					break;
				case 'all':
					for (var i = 0; i <= s.item.length - 1; i++) {
						navMarkUp.append('<a href="#1" class="btn-floating waves-effect" data-index="'+i+'>&nbsp;</a>"');
					};
					s.el.append(navMarkUp, arrowMarkup);
					s.el.find('.navigation a').eq(s.itemActive.index()).addClass('active light-blue').siblings().removeClass('active');
					manageArrow();
				break;
			}

			handlerNavigation();
		}
		function manageArrow(){
			if(s.itemActive.index() == 0){
			 	s.el.find('.arrow.left').addClass('disabled');
			}else if(s.itemActive.index() == s.item.length - 1){
				s.el.find('.arrow.right').addClass('disabled');
			}else{
				s.el.find('.arrow').removeClass('disabled');
			}
		}

		function bindTansitioned(el, isGoes){
			this.callCallBack = false;
			var that = this;
			var intervall;

			this.initCallBackFunction = function(){
				if(that.callCallBack && s.callBack){
					clearInterval(intervall);
					var result = s.callBack;
					buildLoadingAnimation( s.itemActive.find('.content') );
					$.when( result() ).done(function(data){

						s.debug && debug({'callback result:' : data});
						s.callBackReturnCtn = s.itemActive.find('.content').html(data);
						s.callBackValue = data;

						s.itemActive.attr('data-cb-called', true);
						s.el.find('.navigation a.active').html('');
						
					})
				}else if(!s.callBack){
					clearInterval(intervall);
				}
			}

			el.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
				$(this).removeClass('anim');
				$(this).siblings().removeClass('anim');
				that.callCallBack = true;
				setLeftRight();
			});

			isGoes ? intervall = setInterval(that.initCallBackFunction, 100) : false;
		}

		function buildLoadingAnimation(el){
			var loaderMarkUp = 
				'<div class="spinner"> \
					<div class="bounce1"></div> \
				  	<div class="bounce2"></div> \
				  	<div class="bounce3"></div> \
				</div>';
			el.html(loaderMarkUp);			
		}

		// CAROUSEL BUILDING
		function build(){

			var options = {
			 	preventDefault: true
			};

			s.mc = new Hammer(s.itemActive, {
				dragLockMinDistance: 10,
				dragBlockHorizontal: true,
				drag_lock_to_axis: true,
    			drag_block_horizontal: true,
    			drag: true
			}).on("dragleft dragright swipeleft swiperight release", handleHammer);

			var hammertime = new Hammer(document, options).on("dragleft dragright swipeleft swiperight", function(ev){$('.loMgsg p').html(ev)});
		}

		function handlerNavigation(){
			s.el.find('.navigation a').on('click', function(ev){
				ev.preventDefault();
				if( !$(this).hasClass('active') ){
					$(this).index() > s.itemActive.index() ? direction = 'left' : direction = 'right';
					goTo(ev, s.itemActive, direction, $(this).index());
				}
			})

			s.el.find('a.arrow').on('click', function(ev){
				ev.preventDefault();

				if( !$(this).hasClass('disabled') ){
					goTo(ev, s.itemActive, $(this).attr('data-direction'));
				}
			})
		}

		function handleHammer(ev){
			
			var g = ev.gesture;
			var evType = ev.type;
			// s.debug && debug({'is enabled: ' : this.enableToGo});
			switch(evType){
				case 'dragleft':
					s.itemActive.css({'left' : g.deltaX});
					if(s.itemActive.next().length > 0){
						this.enableToGo = true;
						s.itemActive.next().css({'left' : g.deltaX + s.itemW + 10});
					}else{
						this.enableToGo = false;
						// s.debug && debug('last');
					}


					break;
				case 'dragright':
					s.itemActive.css({'left' : g.deltaX});
					if(s.itemActive.prev().length > 0){
						this.enableToGo = true;
						s.itemActive.prev().css({'left' : g.deltaX - s.itemW});
					}else{
						this.enableToGo = false;
						// s.debug && debug('first');
					}


					break;
				case 'release':

					if( Math.abs(g.deltaX) < (s.itemW/s.rangeActivationDrag[s.trasholdActivationDrag]) ){ //release before hotspot action
						s.debug && debug({'not hotspot: ' : ''});
						if(g.direction == 'left'){
							s.itemActive.addClass('anim').css({'left' : 0});
							s.itemActive.next().addClass('anim').css({'left' : s.itemW});
						}else if(g.direction == 'right'){
							s.itemActive.addClass('anim').css({'left' : 0});
							s.itemActive.prev().addClass('anim').css({'left' : -s.itemW});
						}
						bindTansitioned(s.item);

					}else if(this.enableToGo){ //release is enabled to go
						s.debug && debug({'enable: ' : true});
						goTo(evType, s.itemActive, g.direction);

					}else{ //release is not enable to go
						s.debug && debug({'enable: ' : false});
						if(g.direction == 'left'){
							s.itemActive.addClass('anim').css({'left' : 0});
							s.itemActive.next().addClass('anim').css({'left' : s.itemW});
						}else if(g.direction == 'right'){
							s.itemActive.addClass('anim').css({'left' : 0});
							s.itemActive.prev().addClass('anim').css({'left' : -s.itemW});
						}
						
						bindTansitioned(s.item);
					}
					break;
				default:
					// another
					break;
			}
			
		}

		function goTo(evType, el, direction, to){
			//unbind element from dragging
			s.mc.off("dragleft dragright release",handleHammer);

			// el.addClass('anim').removeClass('active');
			if(direction == 'left'){
				to > -1 ? idx = to :  idx = el.index() + 1;
				el.addClass('anim').css({'left' : -s.itemW}).removeClass('active').addClass('ready-left');
				s.item.eq(idx).removeClass('ready-right').addClass('anim active').css({'left' : 0});
				s.itemActive = s.item.eq(idx);

			}else if(direction == 'right'){
				to > -1 ? idx = to :  idx = el.index() - 1;
				el.addClass('anim').css({'left' : s.itemW}).removeClass('active').addClass('ready-right');
				s.item.eq(idx).removeClass('ready-left').addClass('anim active').css({'left' : 0});
				s.itemActive = s.item.eq(idx);
			}
			s.debug && debug({'evType: ' : evType, ' el: ' : el, ' direction: ' : direction, ' to: ' : idx});

			bindTansitioned(s.item, true);
			//bind the new element
			build();

			//set class to navigation items
			if( s.el.find('.navigation').length > 0 ){
				s.el.find('.navigation a').eq(s.itemActive.index()).addClass('active light-blue').siblings().removeClass('active light-blue');
			}

			if( s.el.find('.arrow').length > 0 ){
				manageArrow();
			}


			//call to Service
		}

		setClass();
		build();

		s.navigation && buildnavigation();
		s.debug && windowResize();
	}
} ( jQuery ) )