import React, { Component } from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import 'semantic-ui-css/semantic.min.css';
import { Button, Container, Divider, Grid, Header, Icon, Image, List, Menu, Segment, Visibility, Tab,
Card, Embed, Loader, Dimmer, Dropdown, Popup} from 'semantic-ui-react';
import profile_back from '../../asserts/sky_night.jpg';
import logo from '../../asserts/logo.jpg';
import { Scrollbars } from 'react-custom-scrollbars';
import update from 'immutability-helper';
import {BrowserRouter as Router, Route, Link, IndexRoute} from 'react-router-dom';

export default class PlayerPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          user_id: this.props.id,
          video_id: '',
          video_link: '',
          video_name: '',
          video_image: '',
          video_artist: '',
          video_artist_url: '',
          active: false,
          user_id: this.props.id,
          user_info_data: {},
          loved_track_name: new Set(),
          loved_artist_name: new Set(),
          icons: [],
          from_search: false,
        };
    }

    getVideoId(URL) {
    {/*Get youtube video id from the props passed from Profile Page*/}
      var self = this;
      getInfo('https://cors-anywhere.herokuapp.com/' + URL)
        .then(function(response){
          let data = JSON.stringify(response.data);
          let pre_string = 'data-youtube-id=';
          let search_string = '\\"';
          if (data.indexOf(pre_string) != -1) {
            let pre_index = data.indexOf(pre_string) + pre_string.length + 2;
            if (data.substring(pre_index).indexOf(search_string) != -1) {
              let search_index = pre_index + data.substring(pre_index).indexOf(search_string);
              let found_video_id = data.substring(pre_index, search_index);
              if (found_video_id !== 'undefined') {
                self.setState({ active: true });
                self.setState({ video_id: found_video_id });
              }
            } else {
              console.log('No video found');
            }
          } else {
            console.log('No video found');
          }
        })
        .catch(function(error){
          console.log(error);
        });
    }

    getLyrics(URL) {
    {/*Get lyrics of the track from the props passed from Profile Page*/}
      var self = this;
      getInfo('https://cors-anywhere.herokuapp.com/' + URL + '/+lyrics')
      .then(function(response){
        let data = JSON.stringify(response.data);
        let pre_string = '<span itemprop=\\"text\\">\\n';
        let search_string = '</span>';
        if (data.indexOf(pre_string) != -1) {
          let pre_index = data.indexOf(pre_string) + pre_string.length;
          if (data.substring(pre_index).indexOf(search_string) != -1) {
            let search_index = pre_index + data.substring(pre_index).indexOf(search_string);
            let found_lyrics = data.substring(pre_index, search_index - 4);
            if (found_lyrics !== 'undefined') {
              let remove_sign = found_lyrics.indexOf('\\n');
              found_lyrics = found_lyrics.substring(0, remove_sign);
              document.getElementById('lyrics_box_content').innerHTML = found_lyrics;
            }
          } else {
            document.getElementById('lyrics_box_content').innerHTML = 'Sorry, no lyric found...';
          }
        } else {
          document.getElementById('lyrics_box_content').innerHTML = 'Sorry, no lyric found...';
        }
      })
      .catch(function(error){
        console.warn(error);
      });
    }

    componentWillMount(){
      document.body.style.backgroundImage = `url(${profile_back})`;
      document.body.style.backgroundRepeat = `no-repeat`;
      document.body.style.backgroundSize='cover';
      const cache_id = localStorage.getItem('user_id');
      if (cache_id) {
        console.info("cache: " + cache_id);
        this.setState({ user_id: cache_id });
      } else {
        console.warn("No user id found in localStorage");
      }
      const cache_user_data = JSON.parse(localStorage.getItem('user_info_data'));
      if (cache_user_data) {
        this.setState({ user_info_data: cache_user_data });
      } else {
        console.warn("No user information found in localStorage");
      }
      this.getVideoId(this.props.location.state.video_link);
      this.getLyrics(this.props.location.state.video_link);
      if (this.props.location.state.from_search === true) {
        this.setState({ from_search: true });
      }
      this.setState({
        video_link: this.props.location.state.video_link,
        video_name: this.props.location.state.video_name,
        video_image: this.props.location.state.video_image,
        video_artist: this.props.location.state.video_artist,
        video_artist_url: this.props.location.state.video_artist_url,
        loved_track_name: this.props.location.state.loved_track_name,
        loved_artist_name: this.props.location.state.loved_artist_name,
        icons: this.props.location.state.icons
      });
    }

    render() {

      const { visible } = this.state;

      const video_name = this.state.video_name;

      const user_id = this.state.user_id;

      const EmbedExampleYouTube = () => (
          <Embed
            id={this.state.video_id}
            placeholder = {logo}
            source='youtube'
            active={this.state.active}
          />
      )

      var updateLovedTrack = (preIcon, url, name) => {
        if (preIcon == "heart") {
          var URL = 'http://localhost:3001/api/users/'+ user_id + '?' +
          'field="lovedTracks"' + '&method="del"' + '&target="' + url +'"';
          putRequest(URL)
            .then(function(response){
              console.log(JSON.stringify(response.data));
            });
          let updateLoved = this.state.loved_track_name;
          updateLoved.delete(name);
          this.setState({ loved_track_name: updateLoved });
        } else {
          var URL = 'http://localhost:3001/api/users/'+ user_id + '?' +
          'field="lovedTracks"' + '&method="add"' + '&target="' + url +'"';
          putRequest(URL)
            .then(function(response){
              console.log(JSON.stringify(response.data));
            });
          let updateLoved = this.state.loved_track_name;
          updateLoved.add(name);
          this.setState({ loved_track_name: updateLoved });
        }
      }

      var iconOperation = () => {
        return (
          <a>
            <Icon color='red' size='big' name={this.state.icons[video_name]} onClick={ () => {
              var name = video_name;
              var empty = {};
              empty[name] = {$set: 'empty heart'};
              var fill = {};
              fill[name] = {$set: 'heart'};
              this.state.icons[video_name] == "heart" ?
              this.setState({ icons: update(this.state.icons, empty) }) :
              this.setState({ icons: update(this.state.icons, fill) });
              updateLovedTrack(this.state.icons[video_name], this.state.video_link, video_name);
            }}>
            </Icon>
          </a>
        );
      }

      return (
       <div>
        <Visibility
          once={false}
        >
          <Segment
            textAlign='center'
            vertical
            inverted
            style={ sectionStyle }
          >
            <Container>
            <Menu inverted pointing secondary>
             <Menu.Item as='a' active>
                PLAYER
             </Menu.Item>
             <Menu.Item position='right'>
               {this.state.from_search === true &&
                 <Popup
                   trigger={
                     <Link to={{ pathname: '/result' }}>
                      <Icon style={{ marginLeft: '25px'}} size='large' name='arrow circle left'/>
                     </Link>
                   }
                   content='Back to search result'
                   inverted
                 />
               }
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
        <Container style={ playerStyle } id='youtube_box'>
          <Container style = { decripStyle }>
            <Image id='profile_img' src={this.state.video_image} circular floated='left'  size='tiny'/>
            <p style={{ color: 'white', fontSize: '20px', marginBottom: '0px'}}>{this.state.video_name}</p>
            <p><a style={{ color: 'white', fontSize: '16px', marginBottom: '0px'}} href={this.state.video_artist_url}>{this.state.video_artist}</a></p>
            <p>{ iconOperation() }</p>
          </Container>
         <Container style = { lyricsStyle }>
          <Scrollbars style={{ marginTop: '6px', color:'white'}} id='lyrics_box'>
            <p id='lyrics_box_content' style = {{color:'white', fontSize:'20'}}>Seaching for Lyrics...</p>
          </Scrollbars>
         </Container>
         <Container style={ videoStyle } id='video_box'>
          { EmbedExampleYouTube() }
         </Container>
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
    });
}

function putRequest(URI) {
{/*Get request using Axios to fetch data*/}
  return axios.put(URI)
    .then(function(response){
      return response;
    });
}

var menuStyle = {
  opacity: 0.6,
}

var sectionStyle = {
  padding: '0px',
  opacity: 0.9,
  color: 'black'
}

var myScrollbar = {
  width: '70%',
  height: 50,
}

var decripStyle = {
  margin: '8px 0px 0px 3px',
  width: '70%',
  height: 90,
  fontColor: 'white',
  fontSize: '13px',
  textAlign: 'left',
}

var lyricsStyle = {
  margin: '2px 0px 0px 1px',
  width: '70%',
  height: 150,
  opacity: 0.9,
  backgroundColor: 'grey',
  borderRadius: '5px',
  fontSize: '19px',
  fontStyle: 'oblique',
}

var videoStyle = {
  margin: '2px 0px 0px 0px',
  width: '70%',
  opacity: 1.0,
}

var playerStyle = {
  flexGrow: 1,
  marginTop: '30px',
  minHeight: '85vh',
  height: 'auto',
  width: '70%',
  opacity: 0.7,
  borderRadius: '25px 25px 0px 0px',
  backgroundColor: 'black',
  textAlign: 'center',
  padding: '3px 0px 0px 0px',
}
