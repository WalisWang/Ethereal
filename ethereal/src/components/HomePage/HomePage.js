import React, { Component } from 'react';
import { Button, Container, Divider, Grid, Header, Icon, Image, List, Menu, Segment, Visibility, Tab,
Card, Embed, Loader, Dimmer } from 'semantic-ui-react';
import {BrowserRouter as Router, Route, Link, IndexRoute} from 'react-router-dom';
import profile_back from '../../asserts/sky_night.jpg';
import LoginPage from '../LoginPage/LoginPage';
import 'semantic-ui-css/semantic.min.css';
import { render } from 'react-dom';
import axios from 'axios';
import '../../asserts/component.css';


export default class HomePage extends Component {

  constructor() {
      super();
  }

  componentWillMount(){
    document.body.style.backgroundImage = 'none';
  }

  render() {

    var imageURL = 'https://m.popkey.co/a616fd/k0RDE.gif';

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
            style={{ minHeight: '100vh', padding: '1em 0em', backgroundImage: 'url('+ imageURL +')', backgroundRepeat: 'no-repeat', backgroundSize: '100%'}}
          >
            <Container>
              <Menu inverted pointing secondary>
                <Menu.Item href='/home' active>
                  HOME
                </Menu.Item>
              </Menu>
            </Container>
            <Container>
              <Header
                as='h1'
                content='E T H E R E A L'
                inverted
                style={{ fontSize: '5em', fontFamily:'Spectral SC', fontWeight: 'normal', marginBottom: 0, marginTop: '25vh'}}
              />
              <Header
                as='h2'
                content='We pick music especially for you.'
                inverted
                style={{ fontSize: '3.0em', fontFamily:'Satisfy', fontWeight: 'normal', padding: 10 }}
              />
              <LoginPage></LoginPage>
            </Container>
          </Segment>
        </Visibility>
      </div>
    )
  }
}

var sectionStyle = {
  backgroundImage:  `url(${profile_back})`,
  minHeight: 300,
  padding: '8px',
};
