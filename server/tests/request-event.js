import {IncomingMessage, ServerResponse} from 'node:http';
import {Socket} from 'node:net';
import {createEvent} from 'h3';

export default function buildRequestEvent ({url = '/', method = 'GET', headers = {}}) {
  const request = new IncomingMessage(new Socket());

  request.url = url;
  request.method = method;
  request.headers = headers;

  return createEvent(request, new ServerResponse(request));
}
