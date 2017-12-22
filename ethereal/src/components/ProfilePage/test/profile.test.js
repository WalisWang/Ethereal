'use strict';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { Button, Container, Divider, Grid, Header, Icon, Image, List, Menu, Segment, Visibility, Tab,
Card, Embed, Loader, Dimmer} from 'semantic-ui-react';
import renderer from 'react-test-renderer';
import React, { Component } from 'react';
import ProfilePage from '../ProfilePage';
import {BrowserRouter as Router, Route, Link, IndexRoute} from 'react-router-dom';
import { shallow, mount, render } from 'enzyme';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';


Enzyme.configure({ adapter: new Adapter() });
describe('Profile page suite', function() {
  it('should render without throwing an error', function() {
    const tree = renderer.create(<ProfilePage />).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should have one menu bar', function() {
    expect(shallow(<ProfilePage />).find('Menu').length).toBe(1);
  });
  it('should have one navigation bar', function() {
    expect(shallow(<ProfilePage />).find('#tab').length).toBe(1);
  });
  it('should have one user profile image', function() {
    expect(shallow(<ProfilePage />).find('#profile_img').length).toBe(1);
  });
});
