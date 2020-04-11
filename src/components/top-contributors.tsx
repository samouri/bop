import * as React from 'react'
import { connect } from 'react-redux'
import * as _ from 'lodash'
import { Link } from 'react-router-dom'

import { getContributorsInPlaylist } from '../state/reducer'

type StateProps = {
  contributors: string[]
}
type OwnProps = { playlistId: number | undefined }

type Props = StateProps & OwnProps

class TopContributors extends React.Component<Props> {
  render() {
    const contribs = _.map(this.props.contributors, (name) => (
      <span className="topcontributors__contrib" key={name}>
        <Link to={`/u/${name}`}>@{name}</Link>
      </span>
    ))
    return (
      <div className="topcontributors">
        <span> Top Contributors</span>
        <span className="topcontributors__list">{contribs}</span>
      </div>
    )
  }
}

export default connect<StateProps, any, OwnProps>((state, ownProps: OwnProps) => ({
  contributors: getContributorsInPlaylist(state, ownProps.playlistId) as any,
}))(TopContributors)
