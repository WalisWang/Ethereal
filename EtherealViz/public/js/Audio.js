/*
 * File: Audio.js
 * Sets up the audio backbone and analysis structures
 * @author: Rishabh Asthana {asthana4@illinois.edu}
 */

// WebAudio meta
let context = null;
let source = null;
let audioBuffer = null;
let gainNode = null;

// Analysis
let processor = null;
let analyser = null;
let data = null;

// Control flags
let is_playing = false;
let source_started = false;
let has_loaded = false;
let start_time = null;
let time_elapsed = null;
let mouse_on_ui = false;
let mic_enabled = false;

// Media storage
let songs = {};
let song_index_map = {};
let last_added_index = 0;
let allow_change = true;
let current_index = 0;
let sum = 0;

/*
 * This function initializes the audio object, uses the default source mp3
 */
function initAudio(){

    //Get an Audio Context
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new window.AudioContext();
        context.suspend();
    } catch(e) {
        //Web Audio API is not supported in this browser
        alert("Sorry! This browser does not support the Web Audio API. Please use Chrome, Safari or Firefox.");
        return;
    }
    
    // Create a script processor node with a `bufferSize` of 2048. 
    processor = context.createScriptProcessor(2048,1,1);
    // Create an analyser node 
    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 512;

    // Wire the processor into our audio context.
    processor.connect(context.destination);
    // Wire the analyser into the processor 
    analyser.connect(processor);

    // Define a Uint8Array to receive the analysers data. 
    data = new Uint8Array(analyser.frequencyBinCount);

    freqByteData = new Uint8Array(analyser.frequencyBinCount);
    timeByteData = new Uint8Array(analyser.frequencyBinCount);

    loadSound("Audio/Test.mp3");
    document.getElementById("headingId").innerHTML = 'Six Shooter';

}

/*
 * Loads an audio file into the playlist from the user filesystem/server
 * @param path: Path of the audio file
 */
function loadSound(path){
    
    var request = new XMLHttpRequest();
    request.open("GET", path , true);
    request.responseType = "arraybuffer";
    request.onload = function() {
    songs['Six Shooter'] = request.response.slice();
    song_index_map['Six Shooter'] = 0;
    document.getElementById("test_song").onclick = (e) => {playPlaylistSong(e.srcElement.text)};
    decodeAudioBuffer(request.response, 0);
    };
    request.send();
}

/*
 * Parse and load the audio file into an audio buffer, load it and play the sound
 * @param offset: Time in seconds after which to start playing the file from the start
 */
function decodeAudioBuffer(audio_data, offset){
    context.decodeAudioData(audio_data, function(buffer) {
        audioBuffer = buffer;
        has_loaded = true;
        if(timersSet === false){
            setSliderUpdateHooks();
        }
        mic_enabled = false;
        setVisible();
        playSound(audioBuffer, offset);

        }, function(e) {
        console.log(e);
        });
}

/*
 * Play the audio via speakers while analyzing the audio to produce visualization data
 * @param audioBuffer: arraybuffer containing the decoded audio data to be processed and played
 * @param offset: Time in seconds after which to start playing the file from the start
 */
function playSound(audioBuffer, offset) {
    
    // Stop the existing sources if they are any
    if(source_started)
        toggleSource(offset);
    
    // Create a new source
    source = context.createBufferSource();
    // Create a new volume node
    gainNode = context.createGain();
    // Load the source buffer with decoded audio
    source.buffer = audioBuffer;
    // Connect the nodes
    source.connect(gainNode);
    gainNode.connect(analyser);
    // Connect the gain node to speakers
    gainNode.connect(context.destination);
    processor.onaudioprocess = function() {
    // Populate the data array with the frequency data.
    analyser.getByteFrequencyData(data);
    analyser.getByteFrequencyData(freqByteData);
    analyser.getByteTimeDomainData(timeByteData);

    };
    // Update the time_stamps
    time_elapsed = start_time = Date.now()/1000;
    // Start the new source
    if(!source_started)
        toggleSource(offset);
}

/*
 * This function stops existing playing audio, and creates a media stream from user microphone and plugs it into the 
 * analysis toolchain
 */
function getMicInput() {

    stopSound();

    //x-browser
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    if (navigator.getUserMedia ) {
        navigator.getUserMedia(
            {audio: true}, 
            function(stream) {
                //reinit here or get an echo on the mic
                source = context.createBufferSource();
                analyser = context.createAnalyser();
                analyser.fftSize = 1024;
                analyser.smoothingTimeConstant = 0.3; 
                microphone = context.createMediaStreamSource(stream);
                microphone.connect(analyser);
                is_playing = true;
                mic_enabled = true;
                context.resume();
                releaseSliderHooks();
            },
            // errorCallback
            function(err) {
                alert("The following error occured: " + err);
            }
        );

    }else{
        alert("Could not getUserMedia");
    }
}

/*
 * This function completely stops the source and disconnects it from the audio graph
 */
function stopSound(){
    source_started = false;
    if (source) {
        source.stop();
        source.disconnect();
    }
}

/*
 * Start the source if stopped, and stop the source if started. Start playing at offset duration from start
 * @param offset: Time in seconds after which to start playing the file from the start
 */
function toggleSource(offset) {
    if (source && source_started) {
        source.stop();
        source_started = false;
    }
    else if(source){
        source.start(0, offset);
        source_started = true;
    }

}

/*
 * This function toggles the playback state of the audio and reflects the change on UI
 */
function togglePlay(){
    if(is_playing){
        document.getElementById("playIcon").innerHTML = 'play_arrow';
        document.getElementById("micIcon").innerHTML = 'mic';
        context.suspend();
    }
    else{
        document.getElementById("playIcon").innerHTML = 'pause';
        document.getElementById("micIcon").innerHTML = 'mic_off';
        context.resume();            
    }
    is_playing = !is_playing;
}


/*
 * Plays the song at the matching index in the playlist
 * @param current_index: Index of the song to be played
 */
function playSongAtIndex(current_index){
    let song_title = document.getElementById("headingId");
    let local_index = 0;
    for(let song in songs){
        if(local_index == current_index){
            decodeAudioBuffer(songs[song].slice());
            if(song_title.innerHTML)
                song_title.innerHTML = song;
        }
        local_index += 1;
    }
}

/*
 * Plays the selected song from playlist
 */
function playPlaylistSong(song_title){
    current_index = song_index_map[song_title];
    playSongAtIndex(current_index);       
}

/*
 * If there is a next song, play the next song and update the current_index
 */
function playNextSong(){
    let count = Object.keys(songs).length;
    //console.log(count);
    if(current_index < count){
        current_index += 1;
        if(current_index == count)
            current_index = 0;
        playSongAtIndex(current_index);
    }
}

/*
 * If there is a previous song, play the previous song and update the current_index
 */
function playPreviousSong(){
    let count = Object.keys(songs).length;
    if(current_index - 1 >= -1){
        current_index -= 1;
        if(current_index == -1){
            current_index = count - 1;
        }
        playSongAtIndex(current_index);
    }
}
