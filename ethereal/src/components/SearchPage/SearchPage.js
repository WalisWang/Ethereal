import React, { Component } from 'react';
import { Button, Container, Divider, Grid, Header, Icon, Image, List, Menu, Segment, Visibility, Tab,
Card, Embed, Loader, Dimmer, Search, Input, Accordion, Form, Dropdown, Modal, Popup} from 'semantic-ui-react';
import {BrowserRouter as Router, Route, Link, IndexRoute} from 'react-router-dom';
import profile_back from '../../asserts/sky_night.jpg';
import ResultPage from '../ResultPage/ResultPage';
import ProfilePage from '../ProfilePage/ProfilePage';
import 'semantic-ui-css/semantic.min.css';
import update from 'immutability-helper';
import { render } from 'react-dom'
import createBrowserHistory from 'history/createBrowserHistory'
import axios from 'axios';

export default class SearchPage extends Component {

  constructor(props) {
      super(props);
      this.state = {
        user_id: this.props.id,
        activeIndex: '',
        chosenTrack: '',
        chosenArtist: '',
        chosenTag: '',
        user_info_data: {},
        loved_artist_name: new Set(),
        loved_track_name: new Set(),
      };
      this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount(){
    document.body.style.backgroundImage = `url(${profile_back})`;
    document.body.style.backgroundRepeat = `no-repeat`;
    document.body.style.backgroundSize = 'cover';
    const cache_user_data = JSON.parse(localStorage.getItem('user_info_data'));
    if (cache_user_data) {
      this.setState({
        user_info_data: cache_user_data,
        loved_artist_name: this.props.location.state.loved_artist_name,
        loved_track_name: this.props.location.state.loved_track_name,
      });
    } else {
      console.warn("No user information found in localStorage");
    }
  }

  handleClick = (e, titleProps) => {
  {/*Pick one view of the input to show up*/}
    const { index } = titleProps
    const { activeIndex } = this.state.activeIndex
    const newIndex = activeIndex === index ? -1 : index
    this.setState({ activeIndex: newIndex });
  }

  handleChange = (e) => {
  {/*Update state while user typing in the input boxes*/}
    if (this.state.activeIndex === 0) {
      this.setState({
        chosenTrack: e.target.value,
      });
    } else if (this.state.activeIndex === 1) {
      this.setState({
        chosenArtist: e.target.value,
      });
    } else {
      this.setState({
        chosenTag: e.target.value,
      });
    }
  }

  changeArtist = (e) => {
    this.setState({ chosenArtist: e.target.value })
  }

  changeTag = (e) => {
    this.setState({ chosenTag: e.target.value })
  }

  render() {

    const history = createBrowserHistory({
      forceRefresh: true
    });

    const location = history.location;

    const unlisten = history.listen((location, action) => {
      console.log(action, location.pathname, location.state)
    });

    const { activeIndex } = this.state

    const handleButton = () => {
      let prefix = "http://ws.audioscrobbler.com/2.0/?";
      let suffix = "&api_key=6c0c7ea8faab40a381fda49dcb07e8a6&format=json";
      let trackURL = prefix + "method=track.search&track=" + this.state.chosenTrack + suffix;
      let artistURL = prefix + "method=artist.search&artist=" + this.state.chosenArtist + suffix;
      let tagURL = prefix + "method=tag.gettoptracks&tag=" + this.state.chosenTag + suffix;
      let artist_name = this.state.loved_artist_name;
      let track_name = this.state.loved_track_name;
      localStorage.setItem('trackURL', trackURL);
      localStorage.setItem('artistURL', artistURL);
      localStorage.setItem('tagURL', tagURL);
      localStorage.setItem('loved_artist_name', artist_name);
      localStorage.setItem('loved_track_name', track_name);
      // Push result page and states to the brower history and navigate to the page
      history.push('/result', {
        trackURL : trackURL,
        artistURL: artistURL,
        tagURL: tagURL,
        loved_artist_name: this.state.loved_artist_name,
        loved_track_name: this.state.loved_track_name
      });
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
                 SEARCH
              </Menu.Item>
              <Menu.Item position='right'>
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
       <Grid centered verticalAlign>
        <Form style={formStyle} inverted>
          <Accordion as={Form.Field} onChange = {this.handleChange}>
            <Accordion.Title style={{fontSize: '20px', color: 'hsl(240, 100%, 90%)'}} active={activeIndex === 0} index={0}  value={this.state.chosenTrack} control={Input} onClick={this.handleClick}>
              <Icon name='dropdown' />
              What is the name of the track you like?
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 0} as={Form.Input} placeholder='Name of the track...'>
            </Accordion.Content>
            <Accordion.Title style={{fontSize: '20px', color: 'hsl(240, 100%, 85%)'}} active={activeIndex === 1} index={1} control={Input} onClick={this.handleClick}>
              <Icon name='dropdown' />
              Which artist do you like?
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 1} as={Form.Input} placeholder='Name of the artist...'>
            </Accordion.Content>
            <Accordion.Title style={{fontSize: '20px', color: 'hsl(240, 100%, 80%)'}} active={activeIndex === 2} index={2} control={Input} onClick={this.handleClick}>
              <Icon name='dropdown' />
              What genre of music do you like?
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 2} as={Form.Input} placeholder='Name of the music genres...'>
            </Accordion.Content>
          </Accordion>
          <Button secondary style={{backgroundColor:'hsl(240, 100%, 15%)'}} size='huge' type='button' onClick={handleButton}>Pick for Me</Button>
        </Form>
       </Grid>
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

var sectionStyle = {
  padding: '0px',
  opacity: 0.9,
  color: 'black'
}

var playerStyle = {
  flexGrow: 1,
  marginTop: '30px',
  minHeight: '85vh',
  height: 'auto',
  width: '70%',
  opacity: 0.8,
  borderRadius: '25px 25px 0px 0px',
  backgroundColor: 'black',
  padding: '3px 0px 0px 0px',
}

var formStyle = {
  width: '50%',
  marginTop: '200px',
  opacity: 0.8,
  textAlign: 'left',
  borderRadius: '25px',
  backgroundColor: 'black',
  padding: '20px',
  fontSize: '18px'
}
