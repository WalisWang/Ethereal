import React, { Component } from 'react';
import { Button, Container, Divider, Grid, Header, Icon, Image, List, Menu, Segment, Visibility, Tab,
Card, Embed, Loader, Dimmer, Dropdown, Popup, Message} from 'semantic-ui-react';
import {BrowserRouter as Router, Route, Link, IndexRoute} from 'react-router-dom';
import profile_back from '../../asserts/sky_night.jpg';
import LoginPage from '../LoginPage/LoginPage';
import 'semantic-ui-css/semantic.min.css';
import update from 'immutability-helper';
import { render } from 'react-dom'
import axios from 'axios';

export default class ProfilePage extends Component {

  constructor(props) {
      super(props);
      this.state = {
        user_id: this.props.id,
        loved_track_name: new Set(),
        loved_artist_name: new Set(),
        top_track_data: [],
        recent_track_data: [],
        top_artist_data: [],
        user_info_data: {},
        recommend_tracks: {},
        temp_key: '',
        video_link: '',
        icons: [],
      };
      this.getLovedTracks = this.getLovedTracks.bind(this);
      this.getSimilarTracks = this.getSimilarTracks.bind(this);
      this.heartOrNot = this.heartOrNot.bind(this);
  }

  getUserInfo(URL) {
  {/*Fetch user info data from API*/}
    var self = this;
    getInfo(URL)
      .then(function(response){
        var update = {};
        var getInfo = response.data.data;
        update = {
          'name': getInfo.name,
          'email': getInfo.email,
          'image': getInfo.image,
          'loved_tracks': getInfo.lovedTracks,
          'recent_tracks': getInfo.recentTracks,
          'loved_artists': getInfo.lovedArtists,
          'password': getInfo.password
        };
        localStorage.setItem('user_info_data', JSON.stringify(update));
        self.setState({ user_info_data: update });
        if (update.loved_tracks.length !== 0) self.getLovedTracks(update.loved_tracks);
        if (update.recent_tracks.length !== 0) self.getRecentTracks(update.recent_tracks);
        if (update.loved_artists.length !== 0) self.getLovedArtists(update.loved_artists);
      });
  }

  getLovedTracks(tracks) {
  {/*Fetch user loved tracks from API*/}
     var temp_fst = JSON.stringify(tracks).replace(/['"]+/g, '');
     var temp_snd = temp_fst.split(",").join("+");
     var suffix = temp_snd.substr(1, temp_snd.length - 2);
     var URI = "http://localhost:3001/api/tracks/" + suffix;
     console.log('loved track list: ' + URI);
     var self = this;
     getInfo(URI)
       .then(function(response){
         var get_tracks = response.data.data;
         var update = [];
         var update_set = new Set();
         for(var d = 0; d < get_tracks.length; d++) {
          update.push({
            'id': get_tracks[d]["_id"],
            'name': get_tracks[d].name,
            'url': get_tracks[d].url,
            'artist_name': get_tracks[d].artist,
            'artist_url': get_tracks[d].artistUrl,
            'image': get_tracks[d].image
          });
          update_set.add(get_tracks[d].name);
          let new_pair= Object.assign({}, self.state.icons, { [get_tracks[d].name]: "heart"});
          self.setState({ icons: new_pair});
        }
        self.setState({top_track_data: update});
        return update_set;
     }).then( function(update_set) {
       self.setState({ loved_track_name: update_set }, () => {
         localStorage.setItem('loved_track_name', JSON.stringify([...update_set.keys()]));
       });
     });
  }

  getLovedArtists(artists){
  {/*Fetch recently picked artists from API*/}
    var temp_fst = JSON.stringify(artists).replace(/['"]+/g, '');
    var temp_snd = temp_fst.split(",").join("+");
    var suffix = temp_snd.substr(1, temp_snd.length - 2);
    var URI = "http://localhost:3001/api/artists/" + suffix;
    console.log('artist list: ' + URI);
    var self = this;
    getInfo(URI)
      .then(function(response){
        var get_artists = response.data.data;
        var update = [];
        for(var d = 0; d < get_artists.length; d++) {
         update.push({
           'id': get_artists[d]["_id"],
           'name': get_artists[d].name,
           'url': get_artists[d].url,
           'image': get_artists[d].image,
           'tags': get_artists[d].tags,
           'similar_artist': get_artists[d].similar_artist
         });
         let update_set = self.state.loved_artist_name.add(get_artists[d].name);
         self.setState({ loved_artist_name: update_set});
         var new_pair= Object.assign({}, self.state.icons, { [get_artists[d].name]: "heart"});
         self.setState({ icons: new_pair});
       }
       self.setState({top_artist_data: update});
    }).then( function() {
      localStorage.setItem('loved_artist_name', JSON.stringify(self.state.loved_artist_name));
      console.info("icons: " + JSON.stringify(self.state.icons));
    });
  }

  getRecentTracks(tracks){
  {/*Fetch recently picked artists from API*/}
    var temp_fst = JSON.stringify(tracks).replace(/['"]+/g, '');
    var temp_snd = temp_fst.split(",").join("+");
    var suffix = temp_snd.substr(1, temp_snd.length - 2);
    var URI = "http://localhost:3001/api/tracks/" + suffix;
    console.log('recent track list: ' + URI);
    var self = this;
    getInfo(URI)
      .then(function(response){
        var get_tracks = response.data.data;
        var update = [];
        for(var d = 0; d < get_tracks.length; d++) {
         update.push({
           'id': get_tracks[d]["_id"],
           'name': get_tracks[d].name,
           'url': get_tracks[d].url,
           'artist_name': get_tracks[d].artist,
           'artist_url': get_tracks[d].artistUrl,
           'image': get_tracks[d].image
         });
       }
       self.setState({recent_track_data: update});
       return update;
    }).then(function(update){
      self.getSimilarTracks();
    });
  }

  getSimilarTracks(){
  {/*Fetch similar tracks for each recently listened track of the user from API*/}
    var start_with = 'https://www.last.fm/music/';
    var recent_tracks = this.state.recent_track_data;
    var recommend_tracks = new Map();
    for (var i = 0; i < recent_tracks.length; i++) {
        var track_token = recent_tracks[i].url.substring(start_with.length, recent_tracks[i].url.length);
        var track_art = track_token.substring(0, track_token.indexOf('/'));
        var track_name = track_token.substring(track_token.lastIndexOf('/') + 1, track_token.length);
        var URL = 'http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&'
        URL += 'artist=' + track_art + '&track=' + track_name;
        URL += '&api_key=6c0c7ea8faab40a381fda49dcb07e8a6&format=json';
        var key = recent_tracks[i].name;
        var self = this;
        getInfoKey(URL, key)
          .then(function(response){
            var curr_key = response[0];
            response = response[1];
            var values = [];
            if (response.data) {
             var getTracks = response.data.similartracks.track;
             for(var d = 0; d < getTracks.length && d < 10; d++) {
                values.push({
                   'name': getTracks[d].name,
                   'url': getTracks[d].url,
                   'artist_name': getTracks[d].artist.name,
                   'artist_url': getTracks[d].artist.url,
                   'image': getTracks[d].image[3]['#text']
                 });
                 var heart_or_not = self.heartOrNot(getTracks[d].name);
                 var new_pair= Object.assign({}, self.state.icons, { [getTracks[d].name]: heart_or_not});
                 self.setState({ icons: new_pair});
               }
               var new_pair= Object.assign({}, self.state.recommend_tracks, {[curr_key]: values});
               self.setState({ recommend_tracks: new_pair});
             }
           });
         }
  }

  heartOrNot(name) {
  {/*Check if the current track has been loved or not and set the corresponding icons*/}
    if (this.state.loved_track_name.has(name)) {
      return "heart";
    } else {
      return "empty heart";
    }
  }

  componentWillMount(){
    document.body.style.backgroundImage = 'none';
    const cache_id = localStorage.getItem('user_id');
    if (cache_id) {
      console.info("cache: " + cache_id);
      var self = this;
      self.setState({ user_id: cache_id }, () => {
        self.getUserInfo('http://localhost:3001/api/users/' + self.state.user_id);
      });
    } else {
      //this.getUserInfo('http://localhost:3001/api/users/' + this.props.location.state.id);
      console.warn("No user id found in localStorage");
    }
  }

  render() {

    const { visible } = this.state;

    var panes = () => {
    {/*Set contents under recommendation and library tabs*/}
      return(
        [
            { menuItem: 'Recommodation', render: () => <Tab.Pane attached={false} id='recommodation'>
              {cards_recommend}
              { this.state.recent_track_data.length === 0 &&
                <div>
                  <p style={holderStyle}> Recommodation tracks for you based on your recently listened tracks will show up here </p>
                  <Message style={{borderStyle:'hidden', fontSize:'18px'}}>
                    No recommendation for you here? You can pick any track, artist or type of music you like. {"  "}
                    <Link to={{ pathname: '/search', state: {
                         loved_track_name: this.state.loved_track_name,
                         loved_artist_name: this.state.loved_artist_name,
                       } }}>
                       Try search!
                     </Link>
                  </Message>
                  </div>
              }
              </Tab.Pane> },
            { menuItem: 'Library', render: () => <Tab.Pane attached={false} id='library'>
              <Segment vertical>
               <Header style={{ fontSize: '2em' }}>Loved Tracks</Header>
               {this.state.top_track_data.length > 0? (
                 <ul style={{display:'flex', flexDirection:'row', overflowX:'scroll', padding: '3px'}}>
                  {cards_loved}
                 </ul> ) : (
                   <span style={holderStyle}> Your loved tracks will show up here </span>
                )}
              </Segment>
              <Segment vertical>
               <Header style={{ fontSize: '2em' }}>Loved Artists</Header>
               {this.state.top_artist_data.length > 0? (
                 <ul style={{display:'flex', flexDirection:'row', overflowX:'scroll', padding: '3px'}}>
                  {cards_artist}
                 </ul>) : (
                   <span style={holderStyle}> Your loved artists will show up here</span>
                 )}
              </Segment>
             </Tab.Pane> },
          ]
      );
    }

    var cards_loved = this.state.top_track_data.map((item) => {
    {/*Create a group of cards to show the info of user's loved tracks*/}
      var self = this;
      return(
        <li style ={{listStyle: 'none'}}>
        <Card centered style ={{ marginRight:'3px'}}>
          <Image src={item.image}  rounded/>
          <Card.Content>
            <Card.Header>
              <Link to={{ pathname: '/player', state: {
                 video_link: item.url,
                 video_name: item.name,
                 video_image: item.image,
                 video_artist: item.artist_name,
                 video_artist_url: item.artist_url,
                 loved_track_name: self.state.loved_track_name,
                 loved_artist_name: self.state.loved_artist_name,
                 icons: self.state.icons
               } }}
               style={{ color: 'black'}}
               onClick={() => updateRecentTrack(item.url)}>
               {item.name}
             </Link>
            </Card.Header>
            <Card.Description>
              <a
                style={{color: 'grey'}}
                href={item.artist_url}>
                {item.artist_name}
              </a>
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
            <a>
              <Icon color='red' size='big' name={self.state.icons[item.name]} onClick={ () => {
                var name = item.name;
                var empty = {};
                empty[name] = {$set: 'empty heart'};
                var fill = {};
                fill[name] = {$set: 'heart'};
                self.state.icons[item.name] == "heart" ?
                self.setState({ icons: update(self.state.icons, empty) }) :
                self.setState({ icons: update(self.state.icons, fill) });
                updateLovedTrack(self.state.icons[item.name], item);
              } }>
              </Icon>
            </a>
          </Card.Content>
         </Card>
         </li>
       );
    });

    var cards_artist = this.state.top_artist_data.map((item) => {
    {/*Create a group of cards to show the info of user's recently picked artists*/}
      var self = this;
      return(
        <li style ={{listStyle: 'none'}}>
        <Card centered style ={{ marginRight:'3px'}}>
          <Image src={item.image} rounded/>
          <Card.Content>
            <Card.Header>
              <Link to={{ pathname: '/artist', state: {
                  artist_info: item,
                  loved_artist_name: self.state.loved_artist_name,
                  icons: self.state.icons
                } }}
                style={{ color: 'black'}}>
                {item.name}
              </Link>
            </Card.Header>
          </Card.Content>
          <Card.Content extra>
            <a>
              <Icon color='red' size='big' name={self.state.icons[item.name]} onClick={ () => {
                var name = item.name;
                var empty = {};
                empty[name] = {$set: 'empty heart'};
                var fill = {};
                fill[name] = {$set: 'heart'};
                self.state.icons[item.name] == "heart" ?
                self.setState({ icons: update(self.state.icons, empty) }) :
                self.setState({ icons: update(self.state.icons, fill) });
                updateLovedArtist(self.state.icons[item.name], item);
              }
              }>
              </Icon>
            </a>
          </Card.Content>
         </Card>
         </li>
       );
    });

    var updateRecentTrack = (url) => {
    {/*Update user's list of recent listened tracks after the user picked a track to listen*/}
      let prefix = 'http://localhost:3001/';
      let URL = prefix + 'api/users/'+ this.state.user_id + '?' +
      'field="recentTracks"' + '&method="add"' + '&target="' + url +'"';
      console.log('To be added as recent: ' + URL);
      putRequest(URL)
        .then(function(response){
          console.log(JSON.stringify(response.data));
        });
    }

    var updateLovedTrack = (preIcon, item) => {
    {/*Update user's list of loved tracks after the user chose to love/unlove a track*/}
      let url = item.url;
      let name = item.name;
      let update_top_track = this.state.top_track_data;
      let index = -1;
      if (preIcon == "heart") {
        for (let i = 0; i < update_top_track.length; i++) {
          if (update_top_track[i]["name"] == name) {
            index = i;
            break;
          }
        }
      }
      if (preIcon == "heart") {
        var URL = 'http://localhost:3001/api/users/'+ this.state.user_id + '?' +
        'field="lovedTracks"' + '&method="del"' + '&target="' + url +'"';
        console.log('To be deleted: ' + URL);
        putRequest(URL)
          .then(function(response){
            console.log(JSON.stringify(response.data));
          });
        let updateLoved = this.state.loved_track_name;
        updateLoved.delete(name);
        update_top_track.splice(index, 1);
        this.setState({
          loved_track_name: updateLoved,
          top_track_data: update_top_track
        });
      } else {
        var URL = 'http://localhost:3001/api/users/'+ this.state.user_id + '?' +
        'field="lovedTracks"' + '&method="add"' + '&target="' + url +'"';
        console.log('To be added: ' + URL);
        putRequest(URL)
          .then(function(response){
            console.log(JSON.stringify(response.data));
          });
        let updateLoved = this.state.loved_track_name;
        updateLoved.add(name);
        update_top_track.push(item);
        this.setState({
          loved_track_name: updateLoved,
          top_track_data: update_top_track
        });
      }
    }

    var updateLovedArtist = (preIcon, item) => {
    {/*Update user's list of loved artists after the user chose to love/unlove an artist*/}
      let url = item.url;
      let name = item.name;
      let update_top_artist = this.state.top_artist_data;
      let index = -1;
      if (preIcon == "heart") {
        for (let i = 0; i < update_top_artist.length; i++) {
          if (update_top_artist[i]["name"] == name) {
            index = i;
            break;
          }
        }
      }
      if (preIcon == "heart") {
        var URL = 'http://localhost:3001/api/users/'+ this.state.user_id + '?' +
        'field="lovedArtists"' + '&method="del"' + '&target="' + url +'"';
        console.log('To be deleted: ' + URL);
        putRequest(URL)
          .then(function(response){
            console.log(JSON.stringify(response.data));
          });
        let updateLoved = this.state.loved_artist_name;
        updateLoved.delete(name);
        update_top_artist.splice(index, 1);
        this.setState({
          loved_artist_name: updateLoved,
          top_artist_data: update_top_artist
        });
      } else {
        var URL = 'http://localhost:3001/api/users/'+ this.state.user_id + '?' +
        'field="lovedArtists"' + '&method="add"' + '&target="' + url +'"';
        console.log('To be added: ' + URL);
        putRequest(URL)
          .then(function(response){
            console.log(JSON.stringify(response.data));
          });
        let updateLoved = this.state.loved_artist_name;
        updateLoved.add(name);
        update_top_artist.push(item);
        this.setState({
          loved_artist_name: updateLoved,
          top_artist_data: update_top_artist
        });
      }
    }

    var cards_similar = (key) => {
    {/*Create a list of cards of similar tracks for one of the user's recently listened tracks*/}
      var values = this.state.recommend_tracks[key.item];
      var self = this;
      if(!!values) {
        return values.map((item) => {
          var self = this;
          return(
            <li style ={{listStyle: 'none'}}>
            <Card centered style ={{ marginRight:'3px'}}>
              <Image src={item.image} rounded/>
              <Card.Content>
                <Card.Header
                  >
                  <Link to={{ pathname: '/player', state: {
                      video_link: item.url,
                      video_name: item.name,
                      video_image: item.image,
                      video_artist: item.artist_name,
                      video_artist_url: item.artist_url,
                      loved_track_name: self.state.loved_track_name,
                      loved_artist_name: self.state.loved_artist_name,
                      icons: self.state.icons
                    } }}
                    style={{ color: 'black'}}
                    onClick={() => updateRecentTrack(item.url)}
                    >
                    {item.name}
                  </Link>
                </Card.Header>
                <Card.Description>
                  <a
                    style={{ color: 'grey' }}
                    href={item.artist_url}>
                    {item.artist_name}
                  </a>
                </Card.Description>
              </Card.Content>
              <Card.Content extra>
                <a>
                  <Icon color='red' size='big' name={self.state.icons[item.name]} onClick={ () => {
                    {updateLovedTrack(self.state.icons[item.name], item)}
                    var name = item.name;
                    var empty = {};
                    empty[name] = {$set: 'empty heart'};
                    var fill = {};
                    fill[name] = {$set: 'heart'};
                    self.state.icons[item.name] == "heart" ?
                    self.setState({ icons: update(self.state.icons, empty) }) :
                    self.setState({ icons: update(self.state.icons, fill) });
                  }
                  }>
                  </Icon>
                </a>
              </Card.Content>
             </Card>
             </li>
           );
        });
      }
    };

    var cards_recommend = Object.keys(this.state.recommend_tracks).map((item) => {
    {/*Create segment of a recently listened track followed by its similar tracks*/}
      var recent_name = item;
      if (this.state.recommend_tracks[item].length > 0) {
        return(
          <Segment vertical>
           <Popup
              style={{padding: '5px'}}
              trigger={
                <Button style={{ fontSize: '2em', padding: '3px', backgroundColor:'white'}} color = 'white' content={item} />}
           >
           <Popup.Content style={{fontSize: '16px'}}>
            <p>Tracks similar to your recently listened <span style={{fontStyle: 'italic'}}>{item}</span></p>
           </Popup.Content>
           </Popup>
            <ul style={{display:'flex', flexDirection:'row', overflowX:'scroll', padding: '3px'}}>
              {cards_similar({item})}
            </ul>
          </Segment>
         )
       }
    });

    /* Code modified from Semantic UI React template obtained from https://react.semantic-ui.com/layouts/homepage */
    return (

      <div>
        <Visibility
          once={false}
        >
          <Segment
            inverted
            textAlign='center'
            vertical
            style={ profileStyle }
          >
            <Segment
              inverted
              vertical
              style={ sectionStyle }
            >
            <Container>
              <Menu inverted pointing secondary>
                <Menu.Item as='a' active>
                  PROFILE
                </Menu.Item>
                <Menu.Item position='right'>
                  <Popup
                    trigger={
                      <Link to={{ pathname: '/search', state: {
                         loved_track_name: this.state.loved_track_name,
                         loved_artist_name: this.state.loved_artist_name,
                       } }}>
                       <Icon style={{ marginLeft: '25px'}} size='large' name='search'/>
                     </Link>
                    }
                    content='Search'
                    inverted
                  />
                  <Popup
                    trigger={
                      <Link to="/home" onClick={()=>{ localStorage.clear() }}>
                        <Icon style={{ marginLeft: '25px'}} size='large' name='log out'/>
                      </Link>}
                    content='Log out'
                    inverted
                  />
                  <span style ={{fontSize: '18px', fontStyle: 'bold', marginLeft: '5px'}}>{this.state.user_info_data.name}</span>
                </Menu.Item>
              </Menu>
            </Container>
            </Segment>
            <Container>
              <Header
                as='h1'
                inverted
                style={{ marginBottom: '1.0em', marginTop: '1.5em' }}
              >
                <span style ={{fontSize: '40px', fontFamily: 'Spectral SC'}}>{this.state.user_info_data.name}</span>
              </Header>
            </Container>
          </Segment>
        </Visibility>
        <Container>
          <Tab id='tab' menu={{ secondary: true, pointing: true, widths: 10, height: 100 }} panes= {panes()}/>
        </Container>
      </div>
    )
  }
}

function getInfoKey(URI, key) {
{/*Get request using Axios to get key-value pair for each recently listened track with similar tracks*/}
  return axios.get(URI)
    .then(function(response){
      return [key, response];
    });
}

function getInfo(URI) {
{/*Get request using Axios to fetch data*/}
  return axios.get(URI)
    .then(function(response){
      return response;
    });
}

function putRequest(URI) {
{/*Get request using Axios to fetch data*/}
  return axios.put(URI)
    .then(function(response){
      return response;
    });
}

function getInfoTest(URI) {
{/*Get request using Axios to fetch data*/}
  return axios.get(URI, {responseType: 'document'})
    .then(function(response){
      return response;
    });
}

var sectionStyle = {
  padding: '0px',
  opacity: 0.9,
  color: 'black'
};

var profileStyle = {
  backgroundImage:  `url(${profile_back})`,
  height: 200,
  padding: '0px'
};

var holderStyle ={
  fontSize: '18px'
}
