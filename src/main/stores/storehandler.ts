import zlib from 'zlib'

export function CompressJson(data: Json) {
  // Default: value => JSON.stringify(value, null, '\t')
  return zlib.deflateSync(JSON.stringify(data)).toString('base64')
}

export function UnCompressJson(data: string) {
  return JSON.parse(zlib.inflateSync(Buffer.from(data, 'base64')).toString())
}
