import { describe, expect, it } from 'vitest'

import { CONVERSIONS, convert, isConversion, pathCase, trainCase, truncate } from '../src/index.js'

describe('new cases', () => {
  it('builds path and train case', () => {
    expect(pathCase('XMLHttp request_id')).toBe('xml/http/request/id')
    expect(trainCase('content type')).toBe('Content-Type')
    expect(trainCase('x-request-id')).toBe('X-Request-Id')
    expect(trainCase('istanbul', { locale: 'tr' })).toBe('İstanbul')
  })
})

describe('truncate position', () => {
  const file = 'annual-report-2026-final.pdf'

  it('keeps both ends in the middle', () => {
    expect(truncate(file, 19, { position: 'middle' })).toBe('annual-re…final.pdf')
    expect(Array.from(truncate(file, 19, { position: 'middle' }))).toHaveLength(19)
    expect(truncate('hello world again', 8, { position: 'middle' })).toBe('hell…ain')
    expect(truncate('abcdef', 2, { position: 'middle' })).toBe('a…')
    expect(truncate('abcdef', 1, { position: 'middle' })).toBe('…')
  })

  it('keeps the ending at the start', () => {
    expect(truncate('The quick brown fox jumps', 12, { position: 'start' })).toBe('…fox jumps')
    expect(
      truncate('The quick brown fox jumps', 12, { position: 'start', wordBoundary: false })
    ).toBe('…n fox jumps')
    expect(truncate('supercalifragilistic', 6, { position: 'start' })).toBe('…istic')
    expect(truncate('abc def', 1, { position: 'start' })).toBe('…')
    expect(truncate('abc, def', 6, { position: 'start' })).toBe('…def')
  })
})

describe('convert', () => {
  const input = 'XMLHttp request_id'

  it('runs every conversion by name', () => {
    const results = Object.fromEntries(
      CONVERSIONS.map(name => [name, convert(input, name, { length: 10 })])
    )
    expect(results).toEqual({
      camel: 'xmlHttpRequestId',
      pascal: 'XmlHttpRequestId',
      kebab: 'xml-http-request-id',
      snake: 'xml_http_request_id',
      dot: 'xml.http.request.id',
      path: 'xml/http/request/id',
      constant: 'XML_HTTP_REQUEST_ID',
      train: 'Xml-Http-Request-Id',
      title: 'Xmlhttp Request_Id',
      sentence: 'Xmlhttp request_id',
      capitalize: 'XMLHttp request_id',
      uncapitalize: 'xMLHttp request_id',
      lower: 'xmlhttp request_id',
      upper: 'XMLHTTP REQUEST_ID',
      slug: 'xmlhttp-request-id',
      accents: 'XMLHttp request_id',
      truncate: 'XMLHttp…',
      initials: 'XH',
    })
  })

  it('passes options and locales through', () => {
    expect(convert('el fin de la era', 'title', { smallWords: ['de', 'la'] })).toBe(
      'El Fin de la Era'
    )
    expect(convert('Pan & Café', 'slug', { replacements: { '&': 'y' }, separator: '_' })).toBe(
      'pan_y_cafe'
    )
    expect(convert('istanbul', 'upper', { locale: 'tr' })).toBe('İSTANBUL')
    expect(convert('Ana María López', 'initials', { max: 3 })).toBe('AML')
    expect(convert('Ñandú', 'accents')).toBe('Nandu')
  })

  it('returns the text unchanged for truncate without a length and unknown names', () => {
    expect(convert('hello world', 'truncate')).toBe('hello world')
    expect(convert('hello', 'nope' as never)).toBe('hello')
    expect(convert(undefined as never, 'kebab')).toBe('')
  })

  it('recognizes conversion names', () => {
    expect(isConversion('kebab')).toBe(true)
    expect(isConversion('Kebab')).toBe(false)
    expect(isConversion(undefined)).toBe(false)
  })
})
