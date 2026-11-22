'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import useSWR from 'swr'
import {
  Activity, ArrowDown, ArrowRight, BarChart3, Bell, Bookmark, Check, ChevronDown, CircleHelp,
  Code2, Copy, FileText, FlaskConical, Globe, Layers3, Library, LoaderCircle, LockKeyhole,
  LogIn, LogOut, Menu, MessageSquare, Paperclip, Plus, Search, Settings2, Share2,
  Sparkles, WandSparkles, X, Zap,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type ActivityRow = { id: string; kind: string; prompt: string; response: string | null; model: string; created_at: string }
type SavedPrompt = { id: string; title: string; prompt: string; category: string; created_at: string }

const sections = [
  { id: 'playground', name: 'Playground', icon: MessageSquare, description: 'Test, iterate & perfect prompts with real AI models.' },
  { id: 'optimizer', name: 'Optimizer', icon: WandSparkles, description: 'Improve and refine any prompt.' },
  { id: 'compare', name: 'Compare', icon: Layers3, description: 'Run the same prompt on multiple AI models.' },
  { id: 'techniques', name: 'Techniques', icon: FlaskConical, description: 'Learn and apply prompt engineering methods.' },
  { id: 'library', name: 'Library', icon: Bookmark, description: 'Save, organize & reuse your best prompts.' },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, description: 'Track usage, performance and improvements.' },
]

const models = [
  { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash', vendor: 'Google Gemini', badge: 'Fast' },
  { id: 'google/gemini-3-flash', label: 'Gemini 3 Flash', vendor: 'Google Gemini', badge: 'New' },
  { id: 'alibaba/qwen-3-32b', label: 'Qwen 3 32B', vendor: 'Alibaba', badge: 'Reasoning' },
]

const techniques = [
  { title: 'Zero-shot prompting', body: 'Give the model a clear task without examples. Best for direct, well-defined requests.', sample: 'Explain {{topic}} to a curious beginner in three concise paragraphs.' },
  { title: 'Few-shot prompting', body: 'Provide a small set of examples to demonstrate the pattern or format you expect.', sample: 'Classify sentiment. Example: “Loved it!” → Positive. Now classify: {{text}}' },
  { title: 'Role prompting', body: 'Set a useful perspective and expertise level to shape the response.', sample: 'Act as a patient {{expert}}. Help me understand {{topic}} with one practical example.' },
  { title: 'Structured output', body: 'Specify the exact sections or schema you need to make results easier to use.', sample: 'Return {{topic}} as a JSON object with keys: summary, steps, and caveats.' },
]

function formatError(message: string) {
  return message.length > 180 ? `${message.slice(0, 177)}…` : message
}

export default function PromptLabDashboard() {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [signUpMode, setSignUpMode] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState(models[0].id)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [errorLink, setErrorLink] = useState('')
  const [advanced, setAdvanced] = useState(false)
  const [temperature, setTemperature] = useState(0.7)
  const [copied, setCopied] = useState(false)
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [techniquePrompt, setTechniquePrompt] = useState(techniques[0].sample)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [supabase])

  const activityFetcher = useCallback(async () => {
    const { data, error: queryError } = await supabase.from('promptlab_activity').select('id,kind,prompt,response,model,created_at').order('created_at', { ascending: false }).limit(30)
    if (queryError) throw queryError
    return (data ?? []) as ActivityRow[]
  }, [supabase])
  const libraryFetcher = useCallback(async () => {
    const { data, error: queryError } = await supabase.from('promptlab_library').select('id,title,prompt,category,created_at').order('created_at', { ascending: false }).limit(30)
    if (queryError) throw queryError
    return (data ?? []) as SavedPrompt[]
  }, [supabase])
  const { data: activity = [], mutate: refreshActivity } = useSWR(user ? ['promptlab-activity', user.id] : null, activityFetcher)
  const { data: savedPrompts = [], mutate: refreshLibrary } = useSWR(user ? ['promptlab-library', user.id] : null, libraryFetcher)

  const selectedModel = models.find((item) => item.id === model) ?? models[0]
  const filteredPrompts = savedPrompts.filter((item) => `${item.title} ${item.prompt} ${item.category}`.toLowerCase().includes(search.toLowerCase()))
  const counts = {
    generation: activity.filter((item) => item.kind === 'generation').length,
    optimization: activity.filter((item) => item.kind === 'optimization').length,
    comparison: activity.filter((item) => item.kind === 'comparison').length,
  }

  function goTo(id: string) {
    setActiveSection(id)
    setMobileMenu(false)
    document.getElementById(id === 'home' ? 'home' : id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthBusy(true)
    setAuthMessage('')
    try {
      if (signUpMode) {
        const { error: authError } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback` },
        })
        if (authError) throw authError
        setAuthMessage('Check your inbox to confirm your email, then sign in.')
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
        if (authError) {
          if (/invalid|credentials|user not found/i.test(authError.message)) throw new Error('Invalid email or password.')
          throw authError
        }
        setAuthOpen(false)
        setAuthPassword('')
      }
    } catch (cause) {
      setAuthMessage(cause instanceof Error ? cause.message : 'An unexpected sign-in error occurred.')
    } finally {
      setAuthBusy(false)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setAuthOpen(false)
    setNotice('You have been signed out.')
  }

  async function generate() {
    if (!prompt.trim() || generating) return
    setGenerating(true)
    setResult('')
    setError('')
    setErrorLink('')
    setNotice('')
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), model, temperature }),
      })
      const payload = await response.json()
      if (!response.ok) {
        if (typeof payload.setupUrl === 'string') setErrorLink(payload.setupUrl)
        throw new Error(payload.error || 'Generation could not be completed.')
      }
      setResult(payload.text)
      if (user) {
        const { error: saveError } = await supabase.from('promptlab_activity').insert({ user_id: user.id, kind: 'generation', prompt: prompt.trim(), response: payload.text, model })
        if (saveError) setNotice('Response generated. Activity could not be saved.')
        else await refreshActivity()
      }
    } catch (cause) {
      setError(formatError(cause instanceof Error ? cause.message : 'Something went wrong. Please try again.'))
    } finally {
      setGenerating(false)
    }
  }

  async function savePrompt() {
    if (!prompt.trim()) return
    if (!user) {
      setAuthOpen(true)
      setAuthMessage('Sign in to save prompts to your private library.')
      return
    }
    const title = prompt.trim().split(/[.!?\n]/)[0].slice(0, 72) || 'Untitled prompt'
    const { error: saveError } = await supabase.from('promptlab_library').insert({ user_id: user.id, title, prompt: prompt.trim(), category: 'Productivity' })
    if (saveError) setNotice('Could not save this prompt. Please try again.')
    else {
      setNotice('Prompt saved to your library.')
      await refreshLibrary()
    }
  }

  async function optimizePrompt() {
    setActiveSection('optimizer')
    const source = prompt.trim()
    if (!source) {
      setNotice('Add a prompt in the composer first, then choose Optimize.')
      goTo('playground')
      return
    }
    setPrompt(`Improve this prompt for clarity, useful context, and a specific output format. Preserve its intent. Return only the improved prompt.\n\nOriginal prompt:\n${source}`)
    setNotice('Your prompt is ready to optimize. Generate to see the AI result.')
    goTo('playground')
  }

  async function copyResult() {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  function useTechnique() {
    setPrompt(techniquePrompt.replaceAll('{{topic}}', 'prompt engineering').replaceAll('{{text}}', 'This guide made my workflow much easier.').replaceAll('{{expert}}', 'learning coach'))
    goTo('playground')
  }

  return (
    <main id="home" className="dashboard-shell">
      <header className="topbar">
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); goTo('home') }} aria-label="PromptLab AI home">
          <span className="brand-mark">P</span><span>PromptLab <b>AI</b></span>
        </a>
        <nav className={`main-nav ${mobileMenu ? 'nav-open' : ''}`} aria-label="Main navigation">
          {[['home', 'Home'], ...sections.map(({ id, name }) => [id, name])].map(([id, name]) => (
            <button key={id} className={`nav-link ${activeSection === id ? 'active' : ''}`} onClick={() => goTo(id)}>{name}</button>
          ))}
        </nav>
        <div className="top-actions">
          <label className="search-box"><Search size={15} aria-hidden="true"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search prompts, templates…" aria-label="Search prompts and templates"/><kbd>⌘K</kbd></label>
          <button className="round-action notification" aria-label="Notifications" onClick={() => setNotice('You’re all caught up.') }><Bell size={18}/><i/></button>
          <button className="avatar-button" aria-label={user ? 'Account menu' : 'Sign in'} onClick={() => { setAuthOpen(!authOpen); setAuthMessage('') }}>{user ? (user.email?.[0] ?? 'P').toUpperCase() : 'N'}</button>
          <button className="mobile-toggle" aria-label={mobileMenu ? 'Close navigation' : 'Open navigation'} onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X/> : <Menu/>}</button>
        </div>
      </header>

      {authOpen && <div className="auth-popover" role="dialog" aria-label={user ? 'Account' : 'Sign in'}>
        <button className="popover-close" onClick={() => setAuthOpen(false)} aria-label="Close"><X size={16}/></button>
        {user ? <><div className="auth-title"><LockKeyhole size={18}/><span>Your workspace</span></div><p className="auth-copy">Signed in as {user.email}</p><button className="auth-submit" onClick={signOut}><LogOut size={15}/> Sign out</button></> : <>
          <div className="auth-title"><LockKeyhole size={18}/><span>{signUpMode ? 'Create your account' : 'Welcome back'}</span></div>
          <p className="auth-copy">Sign in to save prompts and see your activity.</p>
          <form onSubmit={submitAuth} className="auth-form"><label>Email<input type="email" required autoComplete="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} /></label><label>Password<input type="password" minLength={6} required autoComplete={signUpMode ? 'new-password' : 'current-password'} value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} /></label><button className="auth-submit" disabled={authBusy}>{authBusy ? 'Please wait…' : signUpMode ? 'Create account' : 'Sign in'}</button></form>
          <button className="auth-switch" onClick={() => { setSignUpMode(!signUpMode); setAuthMessage('') }}>{signUpMode ? 'Already have an account? Sign in' : 'New to PromptLab? Create an account'}</button>
        </>}
        {authMessage && <p className="auth-message" role="status">{authMessage}</p>}
      </div>}

      <section className="hero-grid" aria-label="PromptLab overview">
        <article className="hero-promo glass-card">
          <div className="promo-logo">P</div>
          <h1>Effortless<br/>Prompt<br/>Perfection</h1>
          <p>AI-powered prompt engineering studio to create, optimize and compare better prompts.</p>
          <button className="primary-button" onClick={() => goTo('playground')}>Start Creating <ArrowRight size={17}/></button>
          <div className="promo-ribbon" aria-hidden="true"/>
        </article>
        <div className="hero-center">
          <div className="eyebrow"><Sparkles size={14}/> The Complete AI Prompt Studio</div>
          <h2>Your AI Prompt<br/><span>Companion</span></h2>
          <button className={`orb-stage ${generating ? 'orb-generating' : ''}`} onClick={() => goTo('playground')} aria-label="Start creating a prompt">
            <span className="orbit orbit-one"/><span className="orbit orbit-two"/><span className="orbit orbit-three"/>
            <span className="orb"><i className="orb-eye eye-left"/><i className="orb-eye eye-right"/><i className="orb-shine"/></span>
            <span className="orb-spark spark-a"/><span className="orb-spark spark-b"/><span className="orb-spark spark-c"/><span className="orb-spark spark-d"/>
            <span className="orb-glow"/>
          </button>
        </div>
        <aside className="hero-side">
          <div className="metric-grid">
            <article className="metric-card glass-card"><span className="metric-symbol fire">✦</span><div><strong>{user ? counts.generation : '—'}</strong><span>Prompts Generated</span></div></article>
            <article className="mode-card glass-card"><span className="mode-pill"><span><Sparkles size={18}/></span></span><small>AI mode</small><strong>Focused</strong></article>
            <article className="metric-card users-metric glass-card"><div><strong>{user ? activity.length : '—'}</strong><span>Workspace actions</span></div><div className="avatar-stack" aria-hidden="true"><b>P</b><b>L</b><b>+</b></div></article>
            <article className="trial-card glass-card"><span className="trial-icon"><Sparkles size={16}/></span><strong>Built for better prompts</strong><span>Explore the studio tools</span></article>
          </div>
          <button className="template-card glass-card" onClick={() => goTo('library')}><span className="template-icon"><Layers3 size={22}/></span><span className="template-copy"><strong>Prompt Templates</strong><small>Start with a proven structure and make it your own.</small></span><span className="template-stack"><i/><i/><i/></span></button>
        </aside>
      </section>

      <section className="feature-grid" aria-label="PromptLab tools">
        {sections.map(({ id, name, icon: Icon, description }) => <button className={`feature-card glass-card ${activeSection === id ? 'feature-active' : ''}`} key={id} onClick={() => goTo(id)}><span className="feature-icon"><Icon size={21}/></span><strong>{name === 'Playground' ? 'AI Playground' : name === 'Compare' ? 'Compare Models' : name === 'Techniques' ? 'Prompt Techniques' : name === 'Library' ? 'Prompt Library' : name === 'Analytics' ? 'Analytics' : 'Prompt Optimizer'}</strong><span>{description}</span><ArrowRight className="feature-arrow" size={17}/></button>)}
      </section>

      <section className="workspace-grid" aria-label="Prompt workspace">
        <article className="models-panel glass-card">
          <div className="panel-heading"><span className="heading-icon"><Layers3 size={19}/></span><div><h3>Supported AI Models</h3><p>Available through AI Gateway</p></div></div>
          <div className="model-list">{models.map((item, index) => <button key={item.id} className={`model-row ${model === item.id ? 'model-selected' : ''}`} onClick={() => setModel(item.id)}><span className={`provider-logo provider-${index}`}>{index === 0 ? 'G' : index === 1 ? 'G' : 'Q'}</span><span className="model-meta"><strong>{item.vendor}</strong><small>{item.label}</small></span><span className="model-tag">{item.badge}</span><span className={`radio-dot ${model === item.id ? 'checked' : ''}`}>{model === item.id && <Check size={12}/>}</span></button>)}</div>
          <button className="outline-wide" onClick={() => setNotice('These models are available from the verified AI Gateway catalog.') }><Plus size={15}/> Browse available models</button>
        </article>

        <article id="playground" className="composer-panel glass-card">
          <div className="panel-heading composer-heading"><span className="heading-icon bolt-icon"><Zap size={19}/></span><div><h3>{sections.find((item) => item.id === activeSection)?.name ? `Try It Now · ${sections.find((item) => item.id === activeSection)?.name}` : 'Try It Now'}</h3><p>Enter a prompt, choose a model and generate a response.</p></div><button className={`advanced-button ${advanced ? 'advanced-active' : ''}`} onClick={() => setAdvanced(!advanced)}><Settings2 size={14}/> Advanced settings</button></div>
          {advanced && <div className="advanced-controls"><label>Temperature <span>{temperature.toFixed(1)}</span><input type="range" min="0" max="1" step="0.1" value={temperature} onChange={(event) => setTemperature(Number(event.target.value))}/></label><span className="advanced-note">Controls response variation · 0.0–1.0</span></div>}
          <label className="sr-only" htmlFor="prompt-input">Write your prompt</label><textarea id="prompt-input" className="prompt-input" value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={8000} placeholder="e.g. Explain prompt engineering with examples and best practices…" />
          <div className="composer-bottom"><div className="composer-tools"><button className="tool-circle" aria-label="Attach a file (coming soon)" onClick={() => setNotice('File attachments are not enabled yet.')}><Paperclip size={17}/></button><button className="tool-circle" aria-label="Insert code block" onClick={() => setPrompt((current) => `${current}${current ? '\n\n' : ''}Use this code context:\n\`\`\`\n\n\`\`\``)}><Code2 size={17}/></button><button className="tool-circle" aria-label="Insert web context" onClick={() => setPrompt((current) => `${current}${current ? '\n\n' : ''}Use the following context: `)}><Globe size={17}/></button><span className="character-count">{prompt.length}/8000</span></div><div className="generate-controls"><label className="model-select"><span className="google-g">{selectedModel.vendor === 'Google Gemini' ? 'G' : 'Q'}</span><select value={model} onChange={(event) => setModel(event.target.value)} aria-label="Select AI model">{models.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><ChevronDown size={15}/></label><button className="primary-button generate-button" onClick={generate} disabled={!prompt.trim() || generating}>{generating ? <><LoaderCircle className="spin" size={16}/> Generating</> : <>Generate <Sparkles size={16}/></>}</button></div></div>
          {error && <div className="response-error" role="alert"><span>{error}</span>{errorLink && <a href={errorLink} target="_blank" rel="noreferrer">Open Gateway billing settings <ArrowRight size={13}/></a>}</div>}
          {notice && <div className="inline-notice" role="status"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss message"><X size={14}/></button></div>}
          {result && <div className="response-card"><div className="response-head"><span><Sparkles size={15}/> Response</span><div><button onClick={copyResult} aria-label="Copy response">{copied ? <Check size={15}/> : <Copy size={15}/>} {copied ? 'Copied' : 'Copy'}</button><button onClick={savePrompt}><Bookmark size={15}/> Save prompt</button></div></div><p>{result}</p></div>}
        </article>

        <article id="analytics" className="activity-panel glass-card">
          <div className="panel-heading"><span className="heading-icon pulse-icon"><Activity size={19}/></span><div><h3>Your Activity</h3><p>{user ? 'Your recent workspace activity.' : 'Sign in to see your activity.'}</p></div></div>
          <div className="activity-content"><div className="bar-chart" aria-label="Recent prompt activity"><i style={{ height: `${Math.max(12, Math.min(100, counts.generation * 12))}%` }}/><i style={{ height: `${Math.max(18, Math.min(100, counts.optimization * 16))}%` }}/><i style={{ height: `${Math.max(32, Math.min(100, activity.length * 8))}%` }}/><i style={{ height: `${Math.max(45, Math.min(100, counts.comparison * 20))}%` }}/><i style={{ height: `${Math.max(25, Math.min(100, counts.generation * 9))}%` }}/><i style={{ height: `${Math.max(54, Math.min(100, activity.length * 10))}%` }}/></div><div className="activity-stats"><div><span className="stat-icon"><FileText size={16}/></span><span><strong>{user ? counts.generation : '—'}</strong><small>Total prompts</small></span></div><div><span className="stat-icon"><Layers3 size={16}/></span><span><strong>{user ? counts.optimization : '—'}</strong><small>Optimizations</small></span></div><div><span className="stat-icon"><Share2 size={16}/></span><span><strong>{user ? counts.comparison : '—'}</strong><small>Comparisons</small></span></div></div></div>
          {!user && <button className="activity-signin" onClick={() => setAuthOpen(true)}><LogIn size={14}/> Sign in to sync</button>}
          {user && !activity.length && <p className="empty-activity">Your first generation will appear here.</p>}
        </article>
      </section>

      <section id="library" className="library-panel glass-card">
        <div className="library-head"><div className="panel-heading"><span className="heading-icon"><Bookmark size={18}/></span><div><h3>Prompt Library</h3><p>Your saved prompts, organized in one place.</p></div></div><button className="text-link" onClick={() => user ? setNotice('Save a prompt from the composer to add it here.') : setAuthOpen(true)}>View library <ArrowRight size={15}/></button></div>
        {!user ? <div className="library-empty"><span className="empty-icon"><Library size={20}/></span><div><strong>Your personal prompt space</strong><p>Sign in to save and reuse prompts across sessions.</p></div><button onClick={() => setAuthOpen(true)}>Sign in <ArrowRight size={14}/></button></div> : savedPrompts.length ? <div className="saved-list">{filteredPrompts.slice(0, 3).map((item) => <button key={item.id} onClick={() => { setPrompt(item.prompt); goTo('playground') }}><span className="saved-icon"><FileText size={16}/></span><span><strong>{item.title}</strong><small>{item.category} · {new Date(item.created_at).toLocaleDateString()}</small></span><ArrowRight size={15}/></button>)}</div> : <div className="library-empty"><span className="empty-icon"><Bookmark size={20}/></span><div><strong>No saved prompts yet</strong><p>Save a prompt from the composer to find it here.</p></div></div>}
      </section>

      <section id="optimizer" className="below-section glass-card"><div className="panel-heading"><span className="heading-icon"><WandSparkles size={18}/></span><div><h3>Prompt Optimizer</h3><p>Turn a rough prompt into a clearer, more useful request.</p></div></div><div className="optimizer-content"><div className="optimizer-copy"><strong>A stronger prompt starts with a clear outcome.</strong><p>Use AI to add context, clarify constraints, and define the response format without changing your intent.</p><button className="secondary-button" onClick={optimizePrompt}>Optimize current prompt <ArrowRight size={15}/></button></div><div className="optimizer-preview"><span>YOUR PROMPT</span><p>{prompt ? prompt.slice(0, 150) : 'Add a prompt in the studio to begin…'}</p><ArrowDown size={16}/><span className="preview-result">READY FOR AI REFINEMENT</span></div></div></section>

      <section id="compare" className="below-section glass-card"><div className="panel-heading"><span className="heading-icon"><Layers3 size={18}/></span><div><h3>Compare Models</h3><p>Select a model in the studio, then compare responses as your library grows.</p></div></div><div className="compare-strip">{models.slice(0, 2).map((item) => <div key={item.id}><span className="model-tag">Available</span><strong>{item.label}</strong><small>Run the same prompt with this model in the generator.</small></div>)}</div><button className="secondary-button" onClick={() => goTo('playground')}>Open the playground <ArrowRight size={15}/></button></section>

      <section id="techniques" className="below-section glass-card"><div className="panel-heading"><span className="heading-icon"><FlaskConical size={18}/></span><div><h3>Prompt Techniques Lab</h3><p>Learn a pattern, adapt the example, and try it in the AI playground.</p></div></div><div className="techniques-grid">{techniques.map((item) => <button key={item.title} className="technique-card" onClick={() => setTechniquePrompt(item.sample)}><span>{item.title}</span><p>{item.body}</p></button>)}</div><label className="sr-only" htmlFor="technique-example">Editable technique example</label><textarea id="technique-example" className="technique-input" value={techniquePrompt} onChange={(event) => setTechniquePrompt(event.target.value)}/><button className="secondary-button" onClick={useTechnique}>Try this technique <ArrowRight size={15}/></button></section>

      <footer className="footer"><a className="brand footer-brand" href="#home" onClick={(event) => { event.preventDefault(); goTo('home') }}><span className="brand-mark">P</span><span>PromptLab <b>AI</b></span></a><span>Thoughtful prompts. Better outcomes.</span><button onClick={() => setNotice('PromptLab AI · AI powered by Vercel AI Gateway.') }><CircleHelp size={14}/> About PromptLab</button></footer>
    </main>
  )
}
