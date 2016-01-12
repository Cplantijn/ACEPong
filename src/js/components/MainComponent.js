import React, { Component } from 'react';
import Footer from './Footer';
import TopBar from './TopBar';
import classNames from 'classNames';
import Overlay from './Overlays';
import GameComponent from './GameComponent';

export default class MainComponent extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    var {playerGroup} = this.props;
    var cls = classNames({
      "game-component-container": true,
      "no-game": !playerGroup.game.active && !playerGroup.game.ended
    });
    return (
      <div className="main-component container-fluid">
        <TopBar {...this.props}/>
        <div className={cls}>
          <GameComponent {...this.props}/>
          <Overlay {...this.props}/>
        </div>
        <Footer {...this.props}/>
      </div>
    )
  }
}
