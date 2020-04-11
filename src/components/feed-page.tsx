import * as _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";

import EventsList from "./events-list";

import { fetchEvents, fetchSongsInPlaylist } from "../state/actions";
import { getEventsDenormalized, getCurrentUser } from "../state/reducer";
// import { getEventsDenormalized } from '../state/reducer';
import { SidebarSpacer } from "./sidebar";

type Props = {
  events: Array<any>;
  dispatch: any;
};
class FeedPage extends React.Component<Props> {
  fetchEvents = _.throttle(
    (props = this.props) => props.dispatch(fetchEvents({})),
    1000
  );
  fetchSongs = _.throttle(
    (props = this.props) =>
      props.dispatch(fetchSongsInPlaylist({ playlistId: 17 })),
    1000
  );

  componentWillMount() {
    this.fetchEvents();
    this.fetchSongs();
  }

  render() {
    const { events } = this.props;

    return (
      <div style={{ display: "flex" }}>
        <SidebarSpacer />
        <div className="feed-page">
          <span className="feed-page__title">
            <span>My Stream</span>
          </span>
          <EventsList events={events} stream={{ type: "events" }} />
        </div>
      </div>
    );
  }
}

export default connect<{}, {}, Props>((state) => ({
  user: getCurrentUser(state),
  // events: getCombinedEvents(state),
  events: getEventsDenormalized(state),
}))(FeedPage);
