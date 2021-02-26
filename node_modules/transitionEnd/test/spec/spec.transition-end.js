describe('transition-end', function(){
	beforeEach(function(){
		var that = this;

		var createElement = (function(){
			$('body').append('<div id="element"></div>');
			that.jQueryElement = $('#element');
			that.DOMElement = document.getElementById('element');
		}());
	});
	
	afterEach(function(){
		var that = this;
			
		var killElement = (function(){
			that.jQueryElement.remove();
		
			delete that.jQueryElement;
			delete that.DOMElement;
		}());
	});

	describe('instance', function(){
		it('should exist function transitionEnd', function(){
			expect(transitionEnd).toBeDefined();
		});

		it('should throw exception if function transitionEnd not receive parameter when called', function(){
			var instaceFunction = function(){
				transitionEnd();
			};

			expect(instaceFunction).toThrow();
		});
		
		it('should accept jquery object', function(){
			var jQueryElement = this.jQueryElement;
			var instaceFunction = function(){
				transitionEnd(jQueryElement);
			};

			expect(instaceFunction).not.toThrow();
		});
		
		it('should accept dom object', function(){
			var DOMElement = this.DOMElement;
			var instaceFunction = function(){
				transitionEnd(DOMElement);
			};

			expect(instaceFunction).not.toThrow();
		});
		
		it('should exist function bind into the transitionEnd', function(){
			var transition = transitionEnd(this.DOMElement);
			spyOn(transition, 'bind');
			transition.bind();

			expect(transition.bind).toHaveBeenCalled();
		});

		it('should exist function unbind into the transitionEnd', function(){
			var transition = transitionEnd(this.DOMElement);
			spyOn(transition, 'unbind');
			transition.unbind();

			expect(transition.unbind).toHaveBeenCalled();
		});

		it('should exist function whichTransitionEnd into the transitionEnd', function(){
			var transition = transitionEnd(this.DOMElement);
			spyOn(transition, 'whichTransitionEnd');
			transition.whichTransitionEnd();

			expect(transition.whichTransitionEnd).toHaveBeenCalled();
		});
	});

	describe('event', function(){
		beforeEach(function(){
			this.verify = function(element, hasUnbind){
				var callback = jasmine.createSpy();
				transitionEnd(element).bind(callback);
				
				if(hasUnbind){
					transitionEnd(element).unbind();
				}

				setTimeout(function(){
					element.className = 'on';
				}, 100);

				waits(500);

				runs(function(){
					if(hasUnbind){
						expect(callback).not.toHaveBeenCalled();
					}else{
						expect(callback).toHaveBeenCalled();
					}
				});
			};
		});

		it('should call function passed in bind after the execution of a transition', function(){
			this.verify(this.DOMElement, false);
			this.verify(this.jQueryElement, false);
		});
		
		it('should disassociate event listener called when the method unbind', function(){
			this.verify(this.DOMElement, true);
			this.verify(this.jQueryElement, true);
		});
	});
});