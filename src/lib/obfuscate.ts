/** Light scraper deterrent: the phone number is not plain text in the HTML. Decoded in the browser. */
export const encodeContact = (s: string) => Buffer.from(s, 'utf8').toString('base64')
export const decodeContact = (s: string) => {
  try {
    return decodeURIComponent(escape(atob(s)))
  } catch {
    return ''
  }
}
