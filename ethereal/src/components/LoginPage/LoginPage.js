import React, { Component, Link } from 'react';
import { Button, Form, Modal, Message, Label, Menu, Tab} from 'semantic-ui-react'
import axios from 'axios';

class LoginWindow extends Component {

  constructor(props){
      super(props);
      this.state = {
        email: '',
        name: '',
        password: '',
        id:'',
        activeIndex: 0,
        newName: '',
        newEmail: '',
        newPassword: ''
      };
      this.navToProfile.bind(this);
      this.checkAuth.bind(this);
      this.toSignup.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.createAccount = this.createAccount.bind(this);
  }

  navToProfile = () => {
  {/*Navigate to profile page when user has logged in (click on login button)*/}
    var add = this.state.email.trim();
    var url = 'http://localhost:3001/api/users?address="' + add + '"';
    var self = this;
    axios.get(url)
      .then(function(response) {
        if (response.data == null || response.data.data.length == 0) {
          alert("Incorrect email address. Please try again.");
          return;
        }
        if (self.checkAuth(response.data)) {
          var user_id = response.data.data[0]["_id"];
          self.setState({ id: user_id }, () => {
            // Clear out-dated user id in the local storage; set new id in it
            localStorage.clear();
            localStorage.setItem('user_id', self.state.id);
            document.location.href = '/profile'
          });
        }
      });
  }

  checkAuth(data) {
  {/*Check authentication by th input values in the form after the user click on log-in button*/}
    if (this.state.password == null) {
      alert("Please fill in your password.");
      return false;
    }
    if (this.state.email == null) {
      alert("Please fill in your email address.");
      return false;
    }
    if (data.data[0]["password"] != this.state.password.trim() || data.data[0]["name"] !== this.state.name.trim()) {
      alert("Incorrect password/username. Please try again.");
      return false;
    }
    return true;
  }

  updateName(evt) {
  {/*Update state of name while user typing in the form*/}
    this.setState({
      name: evt.target.value
    });
  }

  updateEmail(evt) {
  {/*Update state of email while user typing in the form*/}
    this.setState({
      email: evt.target.value
    });
  }

  updatePass(evt) {
  {/*Update state of password while user typing in the form*/}
    this.setState({
      password: evt.target.value
    });
  }

  createName(evt) {
  {/*Set state of new user's name while user typing in the form*/}
    this.setState({
      newName: evt.target.value
    });
  }

  createEmail(evt) {
  {/*Set state of new user's email while user typing in the form*/}
    this.setState({
      newEmail: evt.target.value
    });
  }

  createPass(evt) {
  {/*Set state of new user's password while user typing in the form*/}
    this.setState({
      newPassword: evt.target.value
    });
  }

  handleChange = (e, data) => {
  {/*Change between log-in view and sign-up view of the form*/}
    this.setState({ activeIndex: data.activeIndex });
  }

  toSignup = () => {
  {/*Switch to sign-up view of the form*/}
    this.setState({ activeIndex: 1 });
  }

  createAccount = () => {
  {/*Send post request to the database to create a new user's account*/}
    axios.post("http://localhost:3001/api/users", {
          name: this.state.newName.trim(),
          email: this.state.newEmail.trim(),
          password: this.state.newPassword.trim()
        }) .then(function(response) {
          console.info(JSON.stringify(response.data));
        }) .catch(function (error) {
          console.warn(error);
        });
    this.setState({ activeIndex: 0 });
  }

  render() {

    var login = () => {
      return (
        <Form>
          <Form.Input
            fluid
            icon='user'
            iconPosition='left'
            placeholder='Username'
            value={this.state.name}
            onChange={evt => this.updateName(evt)}
          />
          <Form.Input
            fluid
            icon='mail'
            iconPosition='left'
            placeholder='E-mail address'
            value={this.state.email}
            onChange={evt => this.updateEmail(evt)}
          />
          <Form.Input
            fluid
            icon='lock'
            iconPosition='left'
            placeholder='Password'
            type='Password'
            value={this.state.password}
            onChange={evt => this.updatePass(evt)}
          />
          <Button fluid type='submit' size='large' onClick={this.navToProfile}>Log In</Button>
          <Message>
            New to us? <a onClick={this.toSignup}> Sign Up</a>
          </Message>
        </Form>
      );
    }

    var signup = () => {
      return (
        <Form>
          <Form.Input
            fluid
            icon='user'
            iconPosition='left'
            placeholder='Username'
            value={this.state.newName}
            onChange={evt => this.createName(evt)}
          />
          <Form.Input
            fluid
            icon='mail'
            iconPosition='left'
            placeholder='E-mail address'
            value={this.state.newEmail}
            onChange={evt => this.createEmail(evt)}
          />
          <Form.Input
            fluid
            icon='lock'
            iconPosition='left'
            placeholder='Password'
            type='Password'
            value={this.state.newPassword}
            onChange={evt => this.createPass(evt)}
          />
          <Button fluid type='submit' size='large' onClick={this.createAccount}>Create Account</Button>
        </Form>
      );
    }

    var panes = () => {
    {/*Set contents under login and signup tabs*/}
      var self = this;
      return(
        [
            { menuItem: 'Log In', render: () =>
              <Tab.Pane attached={false} id='login' index={0}> {login()} </Tab.Pane>
            },
            { menuItem: 'Sign Up', render: () =>
              <Tab.Pane attached={false} id='signup' index={1}> {signup()} </Tab.Pane>
            },
          ]
      );
    }

    return (
      <Modal
        trigger={<Button primary style={{ backgroundColor:'hsl(240, 100%, 10%)', fontWeight: 'normal', fontSize: '1.5em', fontFamily:'Spectral SC', padding: '5' }}size='huge' onClick={this.handleOpen}>Get Started</Button>}
        size='tiny'
        dimmer='blurring'
        >
        <Modal.Header style={{fontStyle: 'italic', textAlign: 'center'}}>Welcome to Ethereal</Modal.Header>
        <Modal.Content >
          <Modal.Description>
            <Tab renderActiveOnly={true} panes={panes()} activeIndex={this.state.activeIndex} onTabChange={(e, data)=>this.handleChange(e, data)}/>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    );
  }
}

export default LoginWindow;
