import React, { Component } from 'react';
import { Button, Container, Divider, Grid, Header, Icon, Image, List, Menu, Segment, Visibility, Tab,
Card, Embed, Loader, Dimmer, Search, Input, Accordion, Form, Dropdown, Popup} from 'semantic-ui-react';
import {BrowserRouter as Router, Route, Link, IndexRoute} from 'react-router-dom';
import profile_back from '../../asserts/sky_night.jpg';
import LoginPage from '../LoginPage/LoginPage';
import 'semantic-ui-css/semantic.min.css';
import update from 'immutability-helper';
import { render } from 'react-dom'
import axios from 'axios';
import logo from '../../asserts/logo.jpg';

export default class ResultPage extends Component {

  constructor(props) {
      super(props);
      this.state = {
        user_id: this.props.id,
        found_track_data: [],
        found_artist_data: [],
        found_tag_data: [],
        user_id: this.props.id,
        user_info_data: {},
        icons: [],
        loved_track_name: new Set(),
        loved_artist_name: new Set(),
      };
      this.heartOrNot = this.heartOrNot.bind(this);
  }

  heartOrNot(name, data) {
    if (data.has(name)) {
      return "heart";
    } else {
      return "empty heart";
    }
  }

  getTrackInfo(URL) {
  {/*Fetch user info data from API*/}
    var self = this;
    getInfo(URL)
      .then(function(response){
        var update = [];
        if (typeof response != 'undefined' && typeof response.data.results != 'undefined') {
          var getInfo = response.data.results.trackmatches.track;
          var replaceImage = 'https://farm5.staticflickr.com/4515/27207954779_6e0604b035_b.jpg';
          for(var d = 0; d < getInfo.length; d++) {
            let checkImage = typeof getInfo[d].image === 'undefined';
            if (!checkImage) checkImage = getInfo[d].image[3]["#text"].length === 0;
            update.push({
              'name': getInfo[d].name,
              'url': getInfo[d].url,
              'artist_name': getInfo[d].artist,
              'image': checkImage == true? replaceImage: getInfo[d].image[3]["#text"]
            });
            var heart_or_not = self.heartOrNot(getInfo[d].name, self.state.loved_track_name);
            var new_pair= Object.assign({}, self.state.icons, { [getInfo[d].name]: heart_or_not});
            self.setState({ icons: new_pair});
          }
        }
        self.setState({ found_track_data: update });
      });
  }

  getArtistInfo(URL) {
  {/*Fetch user info data from API*/}
    var self = this;
    getInfo(URL)
      .then(function(response){
        var update = [];
        let check = JSON.stringify(response);
        if (typeof check != 'undefined') {
          var getInfo = response.data.results.artistmatches.artist;
          var replaceImage = 'https://farm5.staticflickr.com/4515/27207954779_6e0604b035_b.jpg';
          for(var d = 0; d < getInfo.length; d++) {
            let target = getInfo[d].url;
            let prefix = "https://www.last.fm/music/";
            let art = target.substring(prefix.length);
            let url = "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&api_key=6c0c7ea8faab40a381fda49dcb07e8a6&artist="
            + art + "&format=json";
            axios.get(url)
              .then(function(response){
                var found_art = response.data.artist;
                var art_name = found_art.name;
                let checkImage = typeof found_art.image === 'undefined';
                if (!checkImage) checkImage = found_art.image[3]["#text"].length === 0;
                update.push({
                  'name': found_art.name,
                  'url': found_art.url,
                  'image': checkImage == true? replaceImage: found_art.image[3]["#text"],
                  'tags': JSON.stringify(found_art.tags.tag),
                  'similar_artist': JSON.stringify(found_art.similar.artist),
                });
                self.setState({ found_artist_data: update });
                var heart_or_not = self.heartOrNot(art_name, self.state.loved_artist_name);
                var new_pair= Object.assign({}, self.state.icons, { [art_name]: heart_or_not});
                self.setState({ icons: new_pair});
              });
          }
        }
      });
  }

  getTagInfo(URL) {
  {/*Fetch user info data from API*/}
    var self = this;
    if (URL === "http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=&api_key=6c0c7ea8faab40a381fda49dcb07e8a6&format=json") {
      return;
    }
    getInfo(URL)
      .then(function(response){
        var update = [];
        if (typeof response != 'undefined') {
          var getInfo = response.data.tracks.track;
          for(var d = 0; d < getInfo.length; d++) {
            let checkArtist = typeof getInfo[d].artist == 'undefined';
            let replaceImage = 'https://farm5.staticflickr.com/4543/37899630425_80554453a7_h.jpg';
            let checkImage = typeof getInfo[d].image === 'undefined';
            if (!checkImage) checkImage = getInfo[d].image[3]["#text"].length === 0;
            update.push({
              'name': getInfo[d].name,
              'url': getInfo[d].url,
              'artist_name': checkArtist == true? '': getInfo[d].artist.name,
              'artist_url': checkArtist == true? '': getInfo[d].artist.url,
              'image': checkImage == true? replaceImage:getInfo[d].image[3]["#text"]
            });
            var heart_or_not = self.heartOrNot(getInfo[d].name, self.state.loved_track_name);
            var new_pair= Object.assign({}, self.state.icons, { [getInfo[d].name]: heart_or_not});
            self.setState({ icons: new_pair});
          }
        }
        self.setState({ found_tag_data: update });
      });
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
        self.setState({ user_info_data: update });
      });
  }

  componentWillMount(){
    document.body.style.backgroundImage = `url(${profile_back})`;
    document.body.style.backgroundRepeat = `repeat`;
    document.body.style.backgroundSize='cover';
    const cache_id = localStorage.getItem('user_id');
    if (cache_id) {
      console.info("cache: " + cache_id);
      var self = this;
      self.setState({ user_id: cache_id }, () => {
        self.getUserInfo('http://localhost:3001/api/users/' + self.state.user_id);
      });
    } else {
      console.warn("No user id found in localStorage");
    }
    const cache_user_data = JSON.parse(localStorage.getItem('user_info_data'));
    if (cache_user_data) {
      this.setState({ user_info_data: cache_user_data });
    } else {
      console.warn("No user information found in localStorage");
    }

    if (typeof this.props.location.state === 'undefined') {
      let track_name = new Set(localStorage.getItem('loved_track_name'));
      let artist_name = new Set(localStorage.getItem('loved_artist_name'));
      this.setState({
        loved_artist_name: artist_name,
        loved_track_name: track_name,
      });
      this.getTrackInfo(localStorage.getItem('trackURL'));
      this.getArtistInfo(localStorage.getItem('artistURL'));
      this.getTagInfo(localStorage.getItem('tagURL'));
    } else {
      this.getTrackInfo(this.props.location.state.trackURL);
      this.getArtistInfo(this.props.location.state.artistURL);
      this.getTagInfo(this.props.location.state.tagURL);
      this.setState({
        loved_artist_name: this.props.location.state.loved_artist_name,
        loved_track_name: this.props.location.state.loved_track_name,
      });
    }
  }

  render() {
    var imageURL = 'https://m.popkey.co/a616fd/k0RDE.gif';

    var updateRecentTrack = (url) => {
    {/*Update user's list of recent listened tracks after the user picked a track to listen*/}
      var URL = 'http://localhost:3001/api/users/' + this.state.user_id + '?' +
      'field="recentTracks"' + '&method="add"' + '&target="' + url +'"';
      putRequest(URL)
        .then(function(response){
          console.log(JSON.stringify(response.data));
        });
    }

    var cards_track = this.state.found_track_data.map((item) => {
    {/*Create a group of cards to show the info of user's loved tracks*/}
      var self = this;
      return(
        <li style ={{listStyle: 'none'}}>
          <Card centered style ={{ marginRight:'3px'}}>
            <Image src={item.image} rounded/>
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
                    icons: self.state.icons,
                    from_search: true,
                  } }}
                  style={{ color: 'black'}}
                  onClick={() => updateRecentTrack(item.url)}>
                  {item.name}
                </Link>
              </Card.Header>
              <Card.Description>
                <a
                  style={{color: 'grey'}}>
                  {item.artist_name}
                </a>
              </Card.Description>
            </Card.Content>
           </Card>
          </li>
       );
    });

    var cards_artist = this.state.found_artist_data.map((item) => {
    {/*Create a group of cards to show the info of user's loved tracks*/}
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
                  icons: self.state.icons,
                  from_search: true,
                } }}
                style={{ color: 'black'}}>
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
         </Card>
        </li>
       );
    });

    var cards_tag = this.state.found_tag_data.map((item) => {
    {/*Create a group of cards to show the info of user's loved tracks*/}
      var self = this;
      return(
        <li style ={{listStyle: 'none'}}>
          <Card centered style ={{ marginRight:'3px'}}>
          <Image src={item.image} rounded/>
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
                  icons: self.state.icons,
                  from_search: true,
                } }}
                style={{ color: 'black'}}
                onClick={() => updateRecentTrack(item.url)}>
                {item.name}
              </Link>
            </Card.Header>
            <Card.Description>
              <a
                style={{color: 'grey'}}>
                {item.artist_name}
              </a>
            </Card.Description>
          </Card.Content>
         </Card>
         </li>
       );
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
            style={ sectionStyle }
          >
            <Container>
            <Menu inverted pointing secondary>
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
                 <Popup
                   trigger={
                     <Link to="/profile">
                       <Icon style={{ marginLeft: '25px'}} size='large' name='user circle outline'/>
                     </Link>}
                   content='Profile'
                   inverted
                 />
                 <span style ={{fontSize: '18px', fontStyle: 'bold'}}>{this.state.user_info_data.name}</span>
               </Menu.Item>
              </Menu>
            </Container>
          </Segment>
        </Visibility>
        <Container>
          {this.state.found_track_data.length > 0 &&
          <Segment vertical>
           <Header style={headerStyle}>Found Tracks</Header>
           <ul style={{display:'flex', flexDirection:'row', overflowX:'scroll', padding: '3px'}}>
            {cards_track}
           </ul>
          </Segment>}
          {this.state.found_artist_data.length > 0 &&
          <Segment vertical>
           <Header style={headerStyle}>Found Artists</Header>
           <ul style={{display:'flex', flexDirection:'row', overflowX:'scroll', padding: '3px'}}>
            {cards_artist}
           </ul>
          </Segment>}
          {this.state.found_tag_data.length > 0 &&
          <Segment vertical>
           <Header style={headerStyle}>Found Tags</Header>
           <ul style={{display:'flex', flexDirection:'row', overflowX:'scroll', padding: '3px'}}>
            {cards_tag}
           </ul>
          </Segment>}
        </Container>
      </div>
    )
  }

}

function getInfo(URI) {
{/*Get request using Axios to fetch data*/}
  return axios.get(URI)
    .then(function(response){
      return response;
    }).catch(error => {
      console.warn(error);
    });
}

function putRequest(URI) {
{/*Get request using Axios to fetch data*/}
  return axios.put(URI)
    .then(function(response){
      return response;
    });
}

var sectionStyle = {
  padding: '0px',
  opacity: 0.9,
  color: 'black'
};

var headerStyle = {
  fontSize: '2em',
  color: 'white',
  marginTop: '10px',
}
