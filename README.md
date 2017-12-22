# Ethereal
Ethereal is a web based application. It is a music player capable of finding similar songs, provide lyrics to the songs being played, and generate audio reactive visualizations.  
Ethereal was originally supposed to wrap around SoundCloud API and provide a seamless experience however since SoundCloud has temporarily stopped providing access tokens, Ethereal is now a set of two applications where the visualizer is separated as a separate application. These will be merged in future when an API exposing audio stream in a legal manner comes up. Right now Ethereal relies on last.fm API

# Startup
Ethereal runs on node. To start the application, navigate to 'ethereal' directory using bash/terminal/cmd and type  
```
npm start
```
Same applies for ethereal-viz. Just navigate to 'EtherealViz' directory and retype the same command
This will start the server on port 8080
