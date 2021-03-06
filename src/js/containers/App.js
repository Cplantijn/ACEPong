import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as PongActions from '../actions';
import MainComponent from '../components/MainComponent';

class App extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <MainComponent {...this.props}/>
    );
  }
}

function mapStateToProps(state) {
  return {
    overlay: state.overlay,
    game: state.game,
    history: state.history,
    userMessage: state.userMessage,
    playerList: state.playerList,
    showcasedPlayer: state.showcasedPlayer,
    imageSelectModal: state.imageSelectModal
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(PongActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
