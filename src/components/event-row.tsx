import * as React from 'react'
import * as _ from 'lodash'
import cx from 'classnames'
import * as moment from 'moment'
import { Link } from 'react-router-dom'
import { withSongControls, withPlayer } from './hocs'
import CoverFlow from 'react-coverflow'
import { DenormalizedSong } from '../state/reducer'

class CombinedSongEvent extends React.Component<any> {
  sliderRef = null
  state = { current: 0 }

  handleSliderMouseOver = (i) => {
    // console.error(i);
    // this.sliderRef && (this.sliderRef as any).slickGoTo(i);
  }

  handleSliderChange = (i) => {
    this.setState({ current: i })
  }

  componentWillReceiveProps(nextProps) {
    const currSongId = _.get(this.props, ['player', 'songId'])
    const nextSongId = _.get(nextProps, ['player', 'songId'])
    if (nextSongId === currSongId) {
      return
    }

    const songIndex = _.findIndex(this.props.event.combined, {
      id: nextSongId,
    })
    console.error('onlye one!!', songIndex)
    if (songIndex >= 0) {
      this.setState({ current: songIndex })
      this.sliderRef && (this.sliderRef as any).slickGoTo(songIndex)
    }
  }

  render() {
    const event: any = this.props.event

    if (!event || !event.combined || !event.song) {
      return null
    }

    const thumbs = _.map(event.combined, (evt: any, i: number) => {
      return (
        // <div key={`${evt.eventType}-${evt.id}`}>
        // <i className="fa fa-play combined-song-event__play" />
        <img
          key={`${evt.eventType}-${evt.id}`}
          src={evt.song.metadata.thumbnail_url}
          alt={_.truncate(evt.song.metadata.title, { length: 20 })}
          data-action={this.props.play}
        />
        // </div>
      )
    })

    return (
      <div style={{ paddingBottom: '20px' }}>
        <SongEvent event={event} />
        <div>
          <CoverFlow
            width={800}
            height={200}
            displayQuantityOfSide={2}
            navigation={false}
            enableScroll={true}
            clickable={true}
            active={0}
          >
            {thumbs}
          </CoverFlow>
        </div>
      </div>
    )
  }
}

// const ConnectedCombinedSongEvent = connect()(CombinedSongEvent);

const SongEvent = ({ event }) => {
  const { song, user } = event
  if (!song) {
    return null
  }

  let action = 'added a song to'
  if (event.combined) {
    action = `added ${event.combined.length} songs to`
  }

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
    var duration = moment.duration(this.props.event.song.metadata?.youtubeDuration) ?? 0
    var duration_minutes = duration.minutes()
    var duration_seconds: any = duration.seconds()
    if (duration_seconds < 10) {
      duration_seconds = '0' + duration_seconds
    }
    return duration_minutes + ':' + duration_seconds
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
  if (event.eventType === 'song' && event.combined) {
    return <CombinedSongEvent event={event} stream={stream} player={player} />
  }
  return <ConnectedSingleEvent event={event} stream={stream} songId={event.song && event.song.id} />
})

type Props = {
  dispatch: any
  event: { song: DenormalizedSong; eventType; combined }
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
