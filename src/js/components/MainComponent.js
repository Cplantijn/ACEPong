import React, { Component } from 'react';
import Footer from './Footer';
import TopBar from './TopBar';
import classNames from 'classNames';
import Overlay from './Overlays';
import io from 'socket.io-client';
import GameComponent from './Game';

export default class MainComponent extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    const { game, toggleReady, modifyPoint, resetGroups } = this.props;
    this.socket = io();
    this.socket.on('btnHold', function(side) {
      if (game.active) {
        modifyPoint(side, 'REMOVE');
      } else {
        if (game.groupOne.playerOne.active && game.groupTwo.playerOne.active) {
          if (!game[side].ready) {
            if (side === 'groupOne') {
              if (game.groupTwo.ready) {
                toggleReady(side, true);
              } else {
                toggleReady(side, false);
              }
            } else {
              if (game.groupOne.ready) {
                toggleReady(side, true);
              } else {
                toggleReady(side, false);
              }
            }
          } else {
            toggleReady(side, false);
          }
        }
      }
    });

    this.socket.on('btnDblDown', function() {
      if (!game.active && game.ended) {
        resetGroups();
      }
    });

    this.socket.on('btnDown', function(side) {
      if (game.active) {
        modifyPoint(side, 'ADD');
      }
    });

    window.addEventListener('keydown', this._kbPressHandler.bind(this));
  }
  _kbPressHandler(e) {
    const { game, modifyPoint, resetGroups, toggleReady } = this.props;
    if (game.active) {
      switch (e.which) {
        case 49: // Grp 1 press
          modifyPoint('groupOne', 'ADD');
          break;
        case 50: // Grp 2 press
          modifyPoint('groupTwo', 'ADD');
          break;
        case 189: // Grp 1 hold
          modifyPoint('groupOne', 'REMOVE');
          break;
        case 187: // Grp 2 hold
          modifyPoint('groupTwo', 'REMOVE');
          break;
        default:
          // nothing
      }
    } else {
      if (e.which === 189) {
        if (game.groupTwo.ready) {
          toggleReady('groupOne', true);
        } else {
          toggleReady('groupOne', false);
        }
      } else if (e.which === 187) {
        if (game.groupOne.ready) {
          toggleReady('groupTwo', true);
        } else {
          toggleReady('groupTwo', false);
        }
      }
      if (game.ended) {
        if (e.which === 51) {
          resetGroups();
        }
      }
    }
  }
  render() {
    const {
      game,
      createNewPlayer,
      fetchPlayers,
      playerList,
      fetchPlayerDetails,
      showcasedPlayer,
      overlay,
      hideOverlay,
      fetchSettings,
      changeGamePoint,
      changeServeInterval,
      startSelection,
      changePlayerPic,
      hideMessage,
      endSelection,
      highlightSelection,
      joinGroup,
      showOverlay,
      userMessage,
      endGame,
      showSelectionWarning
    } = this.props;
    const cls = classNames({
      'game-component-container': true,
      'no-game': !game.active && !game.ended
    });
    return (
      <div className="main-component container-fluid">
        <TopBar userMessage={userMessage}/>
        <div className={cls}>
          <GameComponent
            showOverlay={showOverlay}
            endGame={endGame}
            fetchPlayers={fetchPlayers}
            game={game}/>
          <Overlay
            game={game}
            createNewPlayer={createNewPlayer}
            fetchPlayers={fetchPlayers}
            playerList={playerList}
            fetchPlayerDetails={fetchPlayerDetails}
            showcasedPlayer={showcasedPlayer}
            overlay={overlay}
            fetchSettings={fetchSettings}
            changeGamePoint={changeGamePoint}
            changeServeInterval={changeServeInterval}
            startSelection={startSelection}
            changePlayerPic={changePlayerPic}
            highlightSelection={highlightSelection}
            hideMessage={hideMessage}
            endSelection={endSelection}
            joinGroup={joinGroup}
            showSelectionWarning={showSelectionWarning}
            hideOverlay={hideOverlay} />
        </div>
        <Footer
          hideOverlay={hideOverlay}
          showOverlay={showOverlay}
          overlay={overlay}
          fetchPlayers={fetchPlayers}/>
      </div>
    );
  }
}

MainComponent.propTypes = {
  userMessage: React.PropTypes.object,
  game: React.PropTypes.object,
  createNewPlayer: React.PropTypes.func,
  fetchPlayers: React.PropTypes.func,
  playerList: React.PropTypes.object,
  fetchPlayerDetails: React.PropTypes.func,
  showcasedPlayer: React.PropTypes.object,
  overlay: React.PropTypes.object,
  showOverlay: React.PropTypes.func,
  hideOverlay: React.PropTypes.func,
  fetchSettings: React.PropTypes.func,
  changeGamePoint: React.PropTypes.func,
  changeServeInterval: React.PropTypes.func,
  startSelection: React.PropTypes.func,
  changePlayerPic: React.PropTypes.func,
  hideMessage: React.PropTypes.func,
  endSelection: React.PropTypes.func,
  highlightSelection: React.PropTypes.func,
  joinGroup: React.PropTypes.func,
  showSelectionWarning: React.PropTypes.func,
  modifyPoint: React.PropTypes.func,
  resetGroups: React.PropTypes.func,
  toggleReady: React.PropTypes.func,
  endGame: React.PropTypes.func
};
