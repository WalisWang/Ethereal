'use strict';
import renderer from 'react-test-renderer';
import React, { Component } from 'react';
import ProfilePage from './components/ProfilePage/ProfilePage';
import PlayerPage from './components/PlayerPage/PlayerPage';
import {BrowserRouter as Router, Route, Link, IndexRoute} from 'react-router-dom';
import render from 'react-dom';

jest.useFakeTimers();
Date.now = jest.fn(() => 1482363367071);

it('renders correctly', () => {
  const tree = renderer.create(<ProfilePage />).toJSON();
  expect(tree).toMatchSnapshot();
});