/*
 * File: UI.js
 * Sets up the UI and the associated event listeners
 * @author: Rishabh Asthana {asthana4@illinois.edu}
 */


// When the DOM has fully loaded
window.addEventListener("load", function(){
    
    initAudio();
    configureUIHandlers();
    configureDropzone();
    setUIUpdateHooks();
    $(".button-collapse").sideNav();
});


/*
 * This function reveals the UI
 */
function setVisible(){
    
    if(mic_enabled === false){
        document.getElementById("player").classList.remove('hidden');
        document.getElementById("player").classList.add('visible');

        document.getElementById("headingId").classList.remove('hidden');
        document.getElementById("headingId").classList.add('visible');
    }
    document.getElementById("trig").classList.remove('hidden');
    document.getElementById("trig").classList.add('visible');
    
    document.getElementById("micTrig").classList.remove('hidden');
    document.getElementById("micTrig").classList.add('visible');
    
    document.getElementById("micDiv").classList.remove('hidden');
    document.getElementById("micDiv").classList.add('visible');
    
    document.getElementById("spotTrig").classList.remove('hidden');
    document.getElementById("spotTrig").classList.add('visible');
    
}

/*
 * This function hides the UI
 */
function setHidden(){
    
    document.getElementById("player").classList.remove('visible');
    document.getElementById("player").classList.add('hidden');   
    
    document.getElementById("headingId").classList.remove('visible');
    document.getElementById("headingId").classList.add('hidden');  
    
    document.getElementById("trig").classList.remove('visible');
    document.getElementById("trig").classList.add('hidden');
    
    document.getElementById("micTrig").classList.remove('visible');
    document.getElementById("micTrig").classList.add('hidden');
    
    document.getElementById("micDiv").classList.remove('visible');
    document.getElementById("micDiv").classList.add('hidden');
    
    document.getElementById("spotTrig").classList.remove('visible');
    document.getElementById("spotTrig").classList.add('hidden');
}

/*
 * Helper function to get a human readable time string
 * @params:
 *      time: float: time in seconds
 * @return
*       string: Human readable time in format mm:ss
 */
function getTimeString(time){
    let minutes = Math.floor(time/60);
    let seconds = Math.floor(time%60);
    if(seconds < 10) seconds = "0" + seconds;
    return minutes + ":" + seconds;
}

/*
 * This function updates the text on UI indicating the current time.
 */
function updateTime(){
    let current_time = getTimeString( (time_elapsed - start_time)/1000 );
    let duration = (has_loaded ? getTimeString(source.buffer.duration) : 0 );
    if ( has_loaded && ((time_elapsed - start_time)/1000) <= source.buffer.duration )
        document.getElementById("currTime").innerHTML = current_time + "/" + duration;
}

/*
 * This function attaches event handlers to the UI elements to respond to the user inputs
 */
function configureUIHandlers(){
        
    // Get references to the slider elements
    let volume_slider = document.getElementById("volumeSlider");
    let seek_slider = document.getElementById("seekSlider");
    let footer_height = window.innerHeight - document.getElementById("footerId").offsetHeight;

    // Associate a click listener with the play/pause button to start/stop the playback
    document.getElementById("playIcon").addEventListener("click", function(){
        togglePlay();
    });
    
    // Associate a click listener with the mic button to start/stop listening
    document.getElementById("micDiv").addEventListener("click", function(){
        togglePlay();
    });
    
    // Associate a click listener with the play/pause button to start/stop the playback
    document.getElementById("nextIcon").addEventListener("click", function(){
        playNextSong();
    });
    
    // Associate a click listener with the play/pause button to start/stop the playback
    document.getElementById("prevIcon").addEventListener("click", function(){
        playPreviousSong();
    });
    
    // When user presses spacebar, start/stop the playback
    document.body.onkeyup = function(e){
        if(e.keyCode == 32){
            togglePlay();
            setVisible();
        }
    }

    // Associate a continuos input listener with the volume slider. When event is fired, adjust volume based on the slider value
    volume_slider.addEventListener("input", function(element){
        let fraction = parseInt(element.target.value) / parseInt(element.target.max);
        gainNode.gain.value = fraction * fraction;
    });
    
    // Associate a continuos input listener with the seek slider. When event is fired, seek the audio track according to the slider value
    seek_slider.addEventListener("input", function(){
        playSound(audioBuffer, seek_slider.value/100 * source.buffer.duration);
        time_elapsed = start_time + (seek_slider.value/100 * (source.buffer.duration * 1000));
        updateTime();
    });
    
    // When user moves the mouse, make the UI visible
    window.addEventListener("mousemove", function(e){
        mouse_on_ui = (e.clientY >= footer_height);
        setVisible();
    });
    
    let mic_button = document.getElementById("micTrig");
    mic_button.addEventListener('click', function(){
        getMicInput();
    });
    
}

/*
 * This function configures the dropzone to handle user file drops
 */
function configureDropzone(){
    window.addEventListener("drop", function(e){
        e.stopPropagation();
        e.preventDefault();
        // Faciilitate file transfer using DataTransfer API
        let dt = e.dataTransfer;
        let files = dt.files;
        for(var i = 0; i < files.length; i++){
            let current_file = files[i];
            // Verify only audio files are being provided
            let valid = (current_file.name.indexOf('mp3') != -1 || current_file.name.indexOf('wav') != -1 || current_file.name.indexOf('wav') != -1)
            // Load the file into memory if valid
            if(valid){
                var reader = new FileReader();
                // Only load if file not already present in the memory
                if(!songs[current_file.name]){
                    reader.onload = (function(data){
                        let key = current_file.name.substr(0, current_file.name.length - 4);
                        songs[key] = data.target.result.slice();
                        console.log("Music file added : " + current_file.name);
                        last_added_index += 1;
                        song_index_map[key] = last_added_index;
                        let a = document.createElement('a');
                        a.innerHTML = key;
                        a.className = "waves-effect collection-item";
                        a.onclick = (e) => {playPlaylistSong(e.srcElement.text)};
                        document.getElementById("slide-out").appendChild(a);
                    });
                    reader.readAsArrayBuffer(current_file);
                }
            }
        }
        
    }, false);
    window.addEventListener("dragenter", function(e){
        e.stopPropagation();
        e.preventDefault();
    }, false);
    window.addEventListener("dragover", function(e){
        e.stopPropagation();
        e.preventDefault();
    }, false);

}



/*
 * This function sets up timers which monitor users interaction and update UI accordingly
 */
function setUIUpdateHooks(){
    
    // Every 3 seconds, attempt to hide the UI if music is playing otherwise show it if it's not
    setInterval(function(){
        ( (is_playing && !mouse_on_ui) ? setHidden() : setVisible());
    }, 3000);
    
    setSliderUpdateHooks();
}


let timestampTimer = 'Placeholder';
let seekTimer = 'Placeholder';
let timersSet = false;

/*
 * This function sets the timers which monitor the sliders on player UI and updates them accordingly
 */
function setSliderUpdateHooks(){
    
    let seek_slider = document.getElementById("seekSlider");
    // Every 1 second, Update the time text
    timestampTimer = setInterval(function(){
        if(is_playing){
            time_elapsed += 1000;
            
            if( (time_elapsed - start_time) / 1000 < source.buffer.duration){
                allow_change = true;
            }
            if( allow_change && (time_elapsed - start_time) / 1000 > source.buffer.duration){
                playNextSong();
                allow_change = false;
            }    
        }
        updateTime();
    }, 1000);
    
    // Every 10ms, change the value of seek slider based on the current song position
    seekTimer = setInterval(function(){
        if(is_playing)
            seek_slider.value = ((time_elapsed - start_time)/1000)/source.buffer.duration * 100;
    }, 10);
    
    timersSet = true;
    
    // Hide the mic interface and display the player interface
    document.getElementById("player").style.display = "block";
    document.getElementById("micDiv").style.display = "none";

}

/*
 * This function disables the previously set timers.
 */
function releaseSliderHooks(){
    clearInterval(timestampTimer);
    clearInterval(seekTimer);
    timersSet = false;
    
    // Hide the player, and display the mic interface
    document.getElementById("player").style.display = "none";
    document.getElementById("micDiv").style.display = "block";

}

/*
 * Populates the search list with spotify returned items
 * @param: input : user search input
 */
function populateList(input){
    axios.get('http://localhost:8888/get_access_token').then(function(response){
        let spotify_endpoint = 'https://api.spotify.com/v1/search?q=' + input + '&type=track&access_token=';
        let access_token = (response.data);
        let encodedURI = window.encodeURI(spotify_endpoint + access_token);
        axios.get(encodedURI).then(function(response){
            let tracks  = response.data.tracks.items;
            let track_list_element = document.getElementById("trackList");
            while (track_list_element.hasChildNodes()) {
                track_list_element.removeChild(track_list_element.lastChild);
            }
            for(let item in tracks){
                let a = document.createElement('a');
                a.innerHTML = tracks[item].name;
                a.className = "waves-effect collection-item";
                a.href = tracks[item].external_urls.spotify;
                a.target = "_blank";
                a.onclick = getMicInput();
                track_list_element.appendChild(a);
            }
        });
    });
}