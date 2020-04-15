import { normalize, schema } from 'normalizr'
import { createAction } from 'redux-actions'
import sdk, { ApiUser, ApiSongs, ApiPlaylists } from '../sdk'

/* action types */
export const LOGIN_USER = 'LOGIN_USER'
export const LOGOUT_USER = 'LOGOUT_USER'
export const PLAY_SONG = 'PLAY_SONG'
export const PAUSE_SONG = 'PAUSE_SONG'
export const VOTE_SONG = 'VOTE_SONG'
export const SET_SORT = 'SET_SORT'
export const DELETE_SONG = 'DELETE_SONG'
export const SHUFFLE_SONGS = 'SHUFFLE_SONGS'
export const SET_PLAYLIST = 'SET_PLAYLIST'
export const FETCH_EVENTS = 'FETCH_EVENTS'
export const ADD_ENTITIES = 'ADD_ENTITIES'
export const RESIZE_EVENT = 'RESIZE_EVENT'
export const CREATED_PLAYLIST = 'CREATED_PLAYLIST'

/* action creators */
export type SongIdPayload = { songId?: number }
export type PlaylistIdPayload = { playlistId?: number }
export type UserPayload = { user }
export type SetPlaylistPayload = { playlistId }

export const logout = createAction(LOGOUT_USER)
export const login = createAction<{ id: number } | Error>(LOGIN_USER)

export const playSong = createAction<SongIdPayload & { stream? }>(PLAY_SONG)
export const pauseSong = createAction(PAUSE_SONG)

export type SORT = 'votes' | 'title' | 'artist' | 'playlist' | 'user' | 'duration' | 'date'
export type SetSortPayload = { sort: SORT }
export const setSort = createAction<SetSortPayload>(SET_SORT)
export const shuffleSongs = createAction(SHUFFLE_SONGS)
export type EventsPayload = { events }
export const fetchEvents = createAction(FETCH_EVENTS, sdk.getEvents)
export const resizeWindow = createAction(RESIZE_EVENT)

/* Thunk Async Actions */

export const loginUser = (credentials: any) => async (dispatch: any) => {
  try {
    const { users, user }: any = await sdk.getUser(credentials.username, 'so secure')

    dispatch(addEntities({ users }))
    dispatch(login({ id: user.id }))
    localStorage.setItem('login', JSON.stringify(credentials))
  } catch (error) {
    console.error(error, error.stack)
    dispatch(login(new Error('could not log in')))
    localStorage.removeItem('login')
  }
}

export const voteSong = createAction(VOTE_SONG, sdk.vote)
export const unvoteSong = createAction(VOTE_SONG, sdk.unvote)
export const deleteSong = createAction(DELETE_SONG, sdk.deleteSong)
export const setPlaylistName = createAction(SET_PLAYLIST, sdk.getPlaylistForName)
export const createPlaylist = createAction(CREATED_PLAYLIST, sdk.createPlaylist)

export const fetchSongsInPlaylist: any = createAction(
  ADD_ENTITIES,
  wrap(sdk.getSongsInPlaylist, normalizeSongs)
)
export const addEntities = createAction<any>(ADD_ENTITIES)
export const requestPlaylist: any = createAction(
  ADD_ENTITIES,
  wrap(sdk.getPlaylistForName, normalizePlaylist)
)

export const fetchUsers: any = createAction(ADD_ENTITIES, wrap(sdk.getAllUsers, normalizeUsers))
export const fetchSongs: any = createAction(ADD_ENTITIES, wrap(sdk.getAllSongs, normalizeSongs))

function wrap(fn, normalizer): any {
  return (...args: any) => fn(...args).then(normalizer)
}

function normalizePlaylist(playlists: Array<ApiPlaylists>) {
  const playlist = new schema.Entity('playlists')
  return normalize(playlists, [playlist])
}

function normalizeUsers(users: Array<ApiUser>) {
  const user = new schema.Entity('users')
  return normalize(users, [user])
}

function normalizeSongs(songs: Array<ApiSongs>) {
  const metadata = new schema.Entity('metadata')
  const user = new schema.Entity('users')
  const playlist = new schema.Entity('playlists')
  const vote = new schema.Entity('votes')
  const song = new schema.Entity('songs', {
    metadata,
    playlists: playlist,
    votes: [vote],
    user,
  })

  return normalize(songs, [song])
}
