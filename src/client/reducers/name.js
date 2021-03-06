// This is very, very over-engineered.  All we're storing is a string
import { Map } from 'immutable';

import { actions } from '../actions/name';

const initialState = new Map({
  name: '',
});

function update(state, value) {
  return state.set('name', value);
}

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.UPDATE:
      return update(state, action.value);
    default:
      return state;
  }
}
