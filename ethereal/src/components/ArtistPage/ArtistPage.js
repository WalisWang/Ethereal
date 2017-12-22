import React, { Component } from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import 'semantic-ui-css/semantic.min.css';
import { Button, Container, Divider, Grid, Header, Icon, Image, List, Menu, Segment, Visibility, Tab,
Card, Embed, Loader, Dimmer, Dropdown, Label, Popup} from 'semantic-ui-react';
import profile_back from '../../asserts/sky_night.jpg';
import logo from '../../asserts/logo.jpg';
import { Scrollbars } from 'react-custom-scrollbars';
import update from 'immutability-helper';
import {BrowserRouter as Router, Route, Link, IndexRoute} from 'react-router-dom';

export default class ArtistPage extends Component {

    constructor() {
        super();
        this.state = {
            user_id: '',
            user_info_data: {},
            artist_id: '',
            artist_name: '',
            artist_image: '',
            artist_url: '',
            icons: [],
            artist_tags: [],
            similar_artist: [],
            loved_artist_name: new Set(),
            loved_track_name: new Set(),
            from_search: false,
        };
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
      let artist_info = this.props.location.state.artist_info;
      var self = this;
      if (this.props.location.state.from_search === true) {
        this.setState({ from_search: true });
      }
      this.setState({
        artist_id: artist_info.id,
        artist_name: artist_info.name,
        artist_image: artist_info.image,
        artist_url: artist_info.url,
        artist_tags: JSON.parse(artist_info.tags),
        similar_artist: JSON.parse(artist_info.similar_artist),
        loved_artist_name: this.props.location.state.loved_artist_name,
        loved_track_name: this.props.location.state.loved_track_name,
        icons: this.props.location.state.icons,
      });
    }

    render() {

      const { visible } = this.state;

      const art_name = this.state.artist_name;

      const user_id = this.state.user_id;

      var cards_similar = this.state.similar_artist.map((item) => {
      {/*Create a group of cards to show similar artists related to the current artist*/}
        var self = this;
        var icon_name = self.state.icons[item.name];
        if (typeof icon_name == 'undefined') {
          icon_name = 'empty heart';
          let name = item.name;
          let empty = {};
          empty[name] = {$set: 'empty heart'};
          let new_pair= Object.assign({}, this.state.icons, { [item.name]: 'empty heart'});
          this.setState({ icons: new_pair });
        }
        return(
          <li style ={{listStyle: 'none'}}>
          <Card centered style ={{ marginRight:'3px'}}>
            <Image src={item.image[3]['#text']} rounded/>
            <Card.Content>
              <Card.Header>
                <a
                  style={{ color: 'black' }}
                  href={item.url}>
                  {item.name}
                </a>
              </Card.Header>
            </Card.Content>
            <Card.Content extra>
              <a>
                <Icon color='red' size='big' name={icon_name} onClick={ () => {
                  let name = item.name;
                  let empty = {};
                  empty[name] = {$set: 'empty heart'};
                  let fill = {};
                  fill[name] = {$set: 'heart'};
                  icon_name == "heart" ?
                  self.setState({ icons: update(self.state.icons, empty) }) :
                  self.setState({ icons: update(self.state.icons, fill) });
                  updateLovedArtist(self.state.icons[item.name], item.url, item.name);
                }
                }>
                </Icon>
              </a>
            </Card.Content>
           </Card>
           </li>
         );
      });

      var tags_group = this.state.artist_tags.map((item) => {
      {/*Create a group of tags which are related to the current artist*/}
        return (
            <Popup
              trigger={  <Label tag style={{fontSize: '15px'}} as='a' href={item.url}> {item.name} </Label> }
              style={{padding: '5px', fontSize:'14px'}}
              content='Click to see more details'
            />
        )
      });

      var iconOperation = () => {
      {/*Love/unlove the artist when the user click on the heart icon*/}
        return (
          <a>
            <Icon style={{padding: '0px'}} color='red' size='big' name={this.state.icons[art_name]} onClick={ () => {
              var name = art_name;
              var empty = {};
              empty[name] = {$set: 'empty heart'};
              var fill = {};
              fill[name] = {$set: 'heart'};
              this.state.icons[art_name] == "heart" ?
              this.setState({ icons: update(this.state.icons, empty) }) :
              this.setState({ icons: update(this.state.icons, fill) });
              updateLovedArtist(this.state.icons[art_name], this.state.artist_url, art_name);
            }}>
            </Icon>
          </a>
        );
      }

      var updateLovedArtist = (preIcon, url, name) => {
      {/*Update user's loved artist list in the library*/}
        if (preIcon == "heart") {
          var URL = 'http://localhost:3001/api/users/'+ user_id + '?' +
          'field="lovedArtists"' + '&method="del"' + '&target="' + url +'"';
          putRequest(URL)
            .then(function(response){
              console.log(JSON.stringify(response.data));
            });
          let updateLoved = this.state.loved_artist_name;
          updateLoved.delete(name);
          this.setState({ loved_artist_name: updateLoved });
        } else {
          var URL = 'http://localhost:3001/api/users/'+ user_id + '?' +
          'field="lovedArtists"' + '&method="add"' + '&target="' + url +'"';
          putRequest(URL)
            .then(function(response){
              console.log(JSON.stringify(response.data));
            });
          let updateLoved = this.state.loved_artist_name;
          updateLoved.add(name);
          this.setState({ loved_artist_name: updateLoved });
        }
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
                  ARTIST
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
        <Container style={ playerStyle }>
          <Container style = { decripStyle }>
            <Image id='profile_img' src={this.state.artist_image} circular floated='left' size='tiny'/>
            <p style={{ color: 'white', fontSize: '24px', padding: '5px', margin: '0px'}}>{this.state.artist_name}</p>
            <p>{ iconOperation() }</p>
          </Container>
         <Container style = { tagStyle }>
          {tags_group}
         </Container>
         <Container style={ videoStyle } id='video_box'>
           <Header style={{ fontSize: '2em', color:'white', textAlign: 'left'}}>Similar Artists</Header>
           <ul style={{display:'flex', flexDirection:'row', overflowX:'scroll', padding: '3px'}}>
            {cards_similar}
           </ul>
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

var tagStyle = {
  margin: '2px 0px 0px 1px',
  width: '70%',
  backgroundColor: 'black',
  borderRadius: '5px',
  fontSize: '19px',
  fontStyle: 'oblique',
}

var videoStyle = {
  margin: '15px 0px 0px 0px',
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
