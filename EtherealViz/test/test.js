var expect = chai.expect;

describe('Audio', function() {
  describe('On Window Load', function() {
  	describe('Audio Context', function() {

	    it('should be initialized', function() {
	      expect(context).to.not.equal(null);
	    });

	    it('should have 48000 as sample rate', function() {
	      expect(context.sampleRate).to.equal(48000);
	    });

	    it('should be connected to speakers', function() {
	      expect(context.destination).to.not.equal(null);
	    });
	});

  	describe('Media Storage', function() {

		it('current_index should be 0 upon start', function() {
	      expect(current_index).to.equal(0);
	    });

		it('has_loaded should be false', function() {
	    	expect(has_loaded).to.equal(false);
	    });

	    it('Test song is loaded', function(done) {
	        setTimeout(function(){
	      		expect(songs).to.not.equal({});
	        	done();
	      }, 1);
	    });

	    it('has_loaded should be true', function(done) {
	        setTimeout(function(){
	      		expect(has_loaded).to.equal(true);
	        	done();
	      }, 1500);
	    });
	});

	describe('Media controls', function() {
	    it('is_playing should be false', function() {
	      expect(is_playing).to.equal(false);
	    });
	    it('source_started should be true', function() {
	    	  expect(source_started).to.equal(true);
	    });
	    describe('On toggle source', function() {
	    	it('source_started should be false', function() {
	    	  toggleSource(0);
	    	  expect(source_started).to.equal(false);
	    	});
	    });

	    describe('playNextSong()', function() {

		   	it('should increment current_index', function() {
		   		  songs["rand"] = [];
		   		  playNextSong();
		    	  expect(current_index).to.equal(1);
		    });

	   });

	    describe('playPrevSong()', function() {

		   	it('should decrement current_index', function() {
		   		  playPreviousSong();
		    	  expect(current_index).to.equal(0);
		    });
		});
	});

  });

  describe('Time string conversion', function() {
	    it('should return a human readible time string', function() {
	      let ret = getTimeString(250);
	      console.log(ret);
	      expect(ret).to.equal("4:10");
	    });
  });

});