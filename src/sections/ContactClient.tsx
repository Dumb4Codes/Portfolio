'use client'
import { useId, useRef, useState, useSyncExternalStore } from 'react'
import { copyText } from '@/components/toast'
import { decodeContact } from '@/lib/obfuscate'

export function ContactActions({ email, phoneEnc, resume }: { email: string; phoneEnc: string; resume?: string }) {
  // decoded in the browser only: the number is not plain text in the server HTML
  const phone = useSyncExternalStore(
    () => () => {},
    () => decodeContact(phoneEnc),
    () => '',
  )
  return (
    <ul className="contact__actions">
      <li>
        <span className="mono muted">Email</span>
        <span className="contact__row">
          <a href={`mailto:${email}`} className="contact__value">
            {email}
          </a>
          <button type="button" className="btn btn-sm" data-cursor="Copy" onClick={() => void copyText(email, 'Email copied')}>
            Copy<span className="sr-only"> email address</span>
          </button>
        </span>
      </li>
      <li>
        <span className="mono muted">Phone</span>
        <span className="contact__row">
          {phone ? (
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="contact__value">
              {phone}
            </a>
          ) : (
            <span className="contact__value muted">Loading…</span>
          )}
        </span>
      </li>
      {resume && (
        <li>
          <span className="mono muted">Résumé</span>
          <span className="contact__row">
            <a href={resume} className="contact__value" target="_blank" rel="noopener noreferrer" download="Youvraj_Singh_Resume.pdf">
              Download PDF
            </a>
          </span>
        </li>
      )}
    </ul>
  )
}

type Status = 'idle' | 'sending' | 'ok' | 'error'
const KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY

/** Web3Forms form: inline validation on blur, honeypot, success/error states. Hidden when no key is set. */
export function ContactForm({ email }: { email: string }) {
  const id = useId()
  const form = useRef<HTMLFormElement>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>('idle')

  if (!KEY) return null

  const validate = (name: string, value: string) => {
    if (name === 'name') return value.trim().length < 2 ? 'Tell me your name (2 letters or more).' : ''
    if (name === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'That email does not look right. Example: you@company.com'
    if (name === 'message') return value.trim().length < 10 ? 'A sentence or two helps (10 characters or more).' : ''
    return ''
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setErrors((prev) => ({ ...prev, [e.target.name]: validate(e.target.name, e.target.value) }))

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const next: Record<string, string> = {}
    for (const f of ['name', 'email', 'message']) {
      const m = validate(f, String(fd.get(f) ?? ''))
      if (m) next[f] = m
    }
    setErrors(next)
    const firstBad = Object.keys(next)[0]
    if (firstBad) {
      form.current?.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus()
      return
    }
    // honeypots: bots fill hidden fields. Pretend it worked, send nothing.
    if (fd.get('botcheck') || fd.get('website')) {
      setStatus('ok')
      return
    }
    setStatus('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: KEY,
          subject: 'New message from your portfolio',
          from_name: 'Portfolio contact form',
          name: fd.get('name'),
          email: fd.get('email'),
          message: fd.get('message'),
        }),
      })
      const json = (await res.json()) as { success?: boolean }
      if (!res.ok || !json.success) throw new Error('rejected')
      setStatus('ok')
      form.current?.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <form ref={form} className="form" onSubmit={onSubmit} noValidate aria-labelledby={`${id}-t`}>
      <h3 id={`${id}-t`} className="mono muted">
        Or write here
      </h3>
      {(['name', 'email', 'message'] as const).map((f) => {
        const Tag = f === 'message' ? 'textarea' : 'input'
        return (
          <div key={f} className="field" data-invalid={Boolean(errors[f])}>
            <label htmlFor={`${id}-${f}`} className="mono">
              {f === 'email' ? 'Your email' : f === 'name' ? 'Your name' : 'Message'} <span aria-hidden="true">*</span>
            </label>
            <Tag
              id={`${id}-${f}`}
              name={f}
              type={f === 'email' ? 'email' : f === 'name' ? 'text' : undefined}
              rows={f === 'message' ? 5 : undefined}
              autoComplete={f === 'name' ? 'name' : f === 'email' ? 'email' : 'off'}
              inputMode={f === 'email' ? 'email' : undefined}
              required
              aria-required="true"
              aria-invalid={Boolean(errors[f])}
              aria-describedby={errors[f] ? `${id}-${f}-err` : undefined}
              onBlur={onBlur}
            />
            {errors[f] && (
              <p id={`${id}-${f}-err`} className="field__err mono" role="alert">
                {errors[f]}
              </p>
            )}
          </div>
        )
      })}
      {/* honeypots: invisible to people, tempting to bots */}
      <div className="hp" aria-hidden="true">
        <label>
          Leave this empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <label>
          <input type="checkbox" name="botcheck" tabIndex={-1} />
          Not a robot
        </label>
      </div>

      <div className="form__foot">
        <button type="submit" className="btn btn-accent" disabled={status === 'sending'} data-cursor="Send">
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
        <p className="form__status mono" role="status" aria-live="polite">
          {status === 'ok' && <span className="accent">Sent. Thank you, I will get back to you.</span>}
          {status === 'error' && (
            <span>
              Could not send. Please email <a href={`mailto:${email}`}>{email}</a> instead.
            </span>
          )}
        </p>
      </div>
    </form>
  )
}
