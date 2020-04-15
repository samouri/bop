import * as React from 'react'
import * as Select from 'react-select'
import 'react-select/dist/react-select.css'
import cx from 'classnames'
import * as _ from 'lodash'
import sdk from '../sdk'
import * as fuzzysearch from 'fuzzysearch'

const mapSongsToOptions = (songs: any): Option[] => {
  return songs.map((track) => ({
    value: _.mapKeys(track, (v, k) => _.camelCase(k)),
    label: track.title,
  }))
}

const getOptions = (input, cb) => {
  if (_.isEmpty(input)) {
    return cb(undefined, { options: [] })
  }
  sdk.searchForSong(input).then(async (songs) => {
    const ret = { options: mapSongsToOptions(songs), cache: false }
    console.error('found these fuckers', ret)
    cb(undefined, ret)
  })
}
const debouncedGetOptions = _.debounce(getOptions, 300)

type Option = Select.Option & {
  value: { thumbnail_url: string; artist: string; title: string }
}
type TrackValueProps = {
  option: Option
  isFocused: boolean
  isSelected: boolean
  onSelect: (Option, event: any) => void
  onFocus: (Option, event: any) => void
}

class TrackValue extends React.Component<TrackValueProps> {
  handleMouseDown = (event) => {
    event.preventDefault()
    event.stopPropagation()
    this.props.onSelect(this.props.option, event)
  }
  handleMouseEnter = (event) => {
    this.props.onFocus(this.props.option, event)
  }
  handleMouseMove = (event) => {
    if (this.props.isFocused) return
    this.props.onFocus(this.props.option, event)
  }
  render() {
    const { option, isFocused, isSelected } = this.props
    const { thumbnail_url, artist, title } = option.value
    return (
      <div
        className={cx('search-result-thumbnail-wrapper', {
          'is-focused': isFocused || isSelected,
        })}
        onMouseDown={this.handleMouseDown}
        onMouseEnter={this.handleMouseEnter}
        onMouseMove={this.handleMouseMove}
      >
        <img alt="artist thumb" src={thumbnail_url} />
        {title} by {artist}
      </div>
    )
  }
}

type SearchBarProps = {
  handleSelection: (string) => void
}

export default class SearchBar extends React.Component<SearchBarProps> {
  render() {
    return (
      <Select.Async
        loadOptions={debouncedGetOptions}
        autoload={false}
        optionComponent={TrackValue as any}
        placeholder={'add a song'}
        onValueClick={(option: any) => {
          this.props.handleSelection(option.value)
        }}
        onChange={(option: any) => {
          option && this.props.handleSelection(option.value)
        }}
        filterOption={
          ((option: Option, filter: string): any => {
            const { title, artist } = _.mapValues(option.value, _.toLower) as any
            return (
              fuzzysearch(filter, title) ||
              fuzzysearch(filter, artist) ||
              fuzzysearch(filter, artist + title) ||
              fuzzysearch(filter, title + artist)
            )
          }) as any
        }
      />
    )
  }
}
