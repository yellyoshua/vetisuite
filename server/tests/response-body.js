export default function responseBody (event) {
  const raw = event.node.res.outputData?.map((chunk) => chunk.data).join('') || '';

  return JSON.parse(raw.split('\r\n\r\n').slice(1).join('\r\n\r\n') || '{}');
}
