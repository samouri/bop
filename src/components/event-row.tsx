import * as React from 'react'
import * as _ from 'lodash'
import cx from 'classnames'
import { Link } from 'react-router-dom'
import { withSongControls, withPlayer } from './hocs'
import { DenormalizedSong } from '../state/reducer'
import { parseDuration } from '../utils'

const SongEvent = ({ event }) => {
  const { song, user } = event
  if (!song) {
    return null
  }

  let action = 'added a song to'
  const playlistName = song.playlists?.name
  return (
    <div>
      <Link to={`/u/${user.username}`}>@{user && user.username}</Link> {action}{' '}
      <Link to={`/p/${playlistName}`}>{playlistName}</Link>
    </div>
  )
}

const VoteEvent = ({ event }) => {
  const { song, user } = event
  if (!song) {
    return null
  }

  const playlistName = song.playlists?.name
  return (
    <div>
      <Link to={`/u/${user && user.username}`}>@{user && user.username}</Link> upvoted a song on{' '}
      <Link to={`/p/${playlistName}`}>{playlistName}</Link>
    </div>
  )
}

class SingleEvent extends React.Component<Props> {
  state = {
    hovered: false,
    voteModifier: 0,
  }

  handleMouseOver = () => this.setState({ hovered: true })
  handleMouseOut = (e) => this.setState({ hovered: false })

  durationToString() {
    let { minutes, seconds } = parseDuration(this.props.event.song.metadata?.youtubeDuration)
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
  }

  render() {
    const { event, isPlaying, isSelected, isUpvoted, showContextLine = true, vote } = this.props
    const { eventType, song } = event

    const metadata = song.metadata || {}
    const ContextRow =
      eventType === 'song' ? <SongEvent event={event} /> : <VoteEvent event={event} />

    const playOrPauseClasses = cx('fa', 'fa-2x', {
      'fa-pause': isPlaying,
      'fa-play': !isPlaying,
      'selected-purple': isSelected,
    })
    const backgroundColor = isPlaying || this.state.hovered ? 'lightgray' : ''

    const handlePausePlay = isPlaying ? this.props.pause : this.props.play
    const upChevronClasses = cx('fa fa-lg fa-chevron-up pointer', {
      'up-chevron-selected': isUpvoted,
    })

    return (
      <div
        className="event-row"
        onMouseEnter={this.handleMouseOver}
        onMouseLeave={this.handleMouseOut}
        onDoubleClick={handlePausePlay}
        style={{ backgroundColor }}
      >
        {showContextLine && ContextRow}
        <div className="event-row__song">
          <span className="event-row__song-play-info">
            <span className="event-row__song-upvote">
              <i className={upChevronClasses} onClick={vote} />
            </span>
            <span className="event-row__controls">
              {(isPlaying || this.state.hovered) && (
                <i className={playOrPauseClasses} onClick={handlePausePlay} />
              )}
            </span>
          </span>
          <img className="event-row__thumb" alt="thumbnail" src={metadata.thumbnailUrl} />
          <span className="event-row__arttit">
            <span className="event-row__song-title">{metadata.title}</span>
            <span className="event-row__song-artist">{metadata.artist}</span>
            <span className="event-row__song-duration">{this.durationToString()}</span>
          </span>
        </div>
      </div>
    )
  }
}

const EventRow = withPlayer(({ event, stream, player }) => {
  return <ConnectedSingleEvent event={event} stream={stream} songId={event.song && event.song.id} />
})

type Props = {
  dispatch: any
  event: { song: DenormalizedSong }
  isPlaying: boolean
  isSelected: boolean
  stream: any
  loggedInUser: any
  showContextLine
  isUpvoted: boolean
  vote
  pause
  play
}
const ConnectedSingleEvent = withSongControls(SingleEvent)

export default EventRow
