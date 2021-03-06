import React, { Component } from 'react';
import PlayerListItem from './PlayerListItem';
import classNames from 'classNames';
import ps from 'perfect-scrollbar';
import PlayerDetail from './PlayerDetail';
import _ from 'underscore';

export default class ProfilesOverlay extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    let ul = this.refs.playerList;
    ul.style.height = 440;
    ps.initialize(ul, {
      suppressScrollX: true
    });
    ul.scrollTop = 0;
    ps.update(ul);
  }
  _changePlayerName(e) {
    if (e.type === 'keyup') {
      if (e.which === 13) {
        this._submitNewPlayer();
      }
    }
  }
  _submitNewPlayer() {
    const { createNewPlayer } = this.props;
    createNewPlayer(this.refs.playerNameInput.value);
    this.refs.playerNameInput.value = '';
  }
  _filterPlayerList() {
    const { fetchPlayers } = this.props;
    fetchPlayers(this.refs.playerFilterInput.value.toLowerCase(), 'updated_on DESC');
  }
  render() {
    const { playerList, fetchPlayerDetails, showcasedPlayer } = this.props;
    let activeId = null;
    let empty = true;
    let players = null;
    const hasPlayerResult = _.size(playerList.players) > 0;

    if (_.size(showcasedPlayer) > 0) {
      activeId = showcasedPlayer.id;
      empty = false;
    }

    if (hasPlayerResult) {
      players = _.map(playerList.players, function(player, i) {
        const placement = (i % 2 === 0 || i === 0) ? 'even' : 'odd';
        const playerName = player.name.length > 23 ? '    ' + player.name.slice(0, 21) + '...' : player.name;
        return (
          <PlayerListItem
            key={player.id}
            playerId={player.id}
            active={player.id === activeId}
            placement={placement}
            fetchPlayerDetails={fetchPlayerDetails}
            playerImg={player.standardPose}
            playerName={playerName}
            wins={player.wins}
            losses={player.losses}/>
        );
      });
    } else if (hasPlayerResult && !playerList.isLoading){
      players = (
        <span className="muted empty">
          {'No players found.'}
        </span>
      );
    }
    const cls = classNames({
      'player-view-master-container': true,
      empty,
      'player-shown': !empty
    });

    const playerListCls = classNames({
      'player-list': true,
      'empty': !hasPlayerResult
    })
    return (
      <div
        className="profiles-container"
        ref="profilesContainer">
        <div className="player-add-container">
          <h2 className="header">Create</h2>
          <div className="player-add-form-container">
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter Player Name"
                ref="playerNameInput"
                onKeyUp={this._changePlayerName.bind(this)}/>
            </div>
            <div className="input-group">
              <button
                type="button"
                className="btn btn-block btn-primary add-player-btn"
                onClick={this._submitNewPlayer.bind(this)}>
                Add Player
              </button>
            </div>
          </div>
        </div>
        <div className="spacer left-spacer"></div>
        <div className="spacer mid-spacer">
          <div className="line"></div>
        </div>
        <div className="spacer right-spacer"></div>
        <div className="player-manage-container">
          <div
            className="player-list-master-container"
            ref="playerListMasterContainer">
            <h2
              className="header"
              ref="viewHeader">
              View
            </h2>
            <div className="player-list-view">
              <div className="player-list-container">
                <div className="player-filter-input-container">
                  <div className="input-group">
                    <input
                      type="text"
                      id="player-profile-filter-input"
                      placeholder="Filter Players"
                      ref="playerFilterInput"
                      onKeyUp={this._filterPlayerList.bind(this)} />
                  </div>
                </div>
                  <ul
                    className={playerListCls}
                    ref="playerList">
                    {players}
                  </ul>
              </div>
            </div>
          </div>
          <div className={cls}>
            <PlayerDetail {...this.props} />
          </div>
        </div>
      </div>
    );
  }
}

ProfilesOverlay.propTypes = {
  createNewPlayer: React.PropTypes.func,
  fetchPlayers: React.PropTypes.func,
  playerList: React.PropTypes.object,
  fetchPlayerDetails: React.PropTypes.func,
  showcasedPlayer: React.PropTypes.object
};
