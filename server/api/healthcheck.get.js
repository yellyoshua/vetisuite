import {defineEventHandler} from 'h3';

export default defineEventHandler(() => {
  return {response: {ok: true}, errors: null};
});
