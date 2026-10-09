import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Menu, Pause, Play, Plus, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { acts, introduction } from '@/lib/story';
import { chime } from '@/lib/story-audio';
import PixelFrame from './PixelFrame';
import night from '@/assets/student-night.jpg';
import dawn from '@/assets/student-dawn.jpg';
import uploadedStudent from '@/assets/student-exhausted.jpg.asset.json';
import uploadedScene from '@/assets/student-scene.jpg.asset.json';
import studentVideo from '@/assets/student-intro.webm.asset.json';

type Detail = { title: string; description: string; support: string; act: string };
function Modal({ children, onClose, video = false }: { children: React.ReactNode; onClose: () => void; video?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      const focusable = ref.current?.querySelectorAll<HTMLElement>('button,a[href],input,video');
      if (!focusable?.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener('keydown', key); if (previous instanceof HTMLElement) previous.focus(); };
  }, [onClose]);
  return <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div ref={ref} className={`story-modal ${video ? 'video-modal' : ''}`} role="dialog" aria-modal="true" aria-label={video ? 'Meet Alex' : 'Student support'}><Button variant="tool" className="modal-close" aria-label="Close dialog" onClick={onClose}><X /></Button>{children}</div></div>;
}
function Breathing({ sound }: { sound: boolean }) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [complete, setComplete] = useState(false);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSeconds(s => { if (s >= 31) { setRunning(false); setComplete(true); return 32; } return s + 1; }), 1000);
    return () => clearInterval(timer);
  }, [running]);
  const phase = seconds % 8 < 4 ? 'inhale' : 'exhale';
  return <><div className="eyebrow"><span className="live-dot" /> A MOMENT FOR YOU</div><h2>YOU CAN PAUSE.</h2><p>Let your shoulders soften. Breathe gently, at a pace that feels comfortable. Stop if you feel dizzy or uncomfortable.</p><div className="breathing-timer"><div className={`breath-square ${running ? phase : ''}`}><span aria-live="polite">{complete ? 'Well done.' : running ? `${phase === 'inhale' ? 'Breathe in' : 'Breathe out'} · ${4 - seconds % 4}` : 'A quiet moment'}</span></div></div><Button variant="story" onClick={() => { chime(sound); if (complete) { setSeconds(0); setComplete(false); setRunning(true); } else setRunning(r => !r); }}>{running ? <Pause /> : complete ? <RotateCcw /> : <Play />}{running ? 'Pause' : complete ? 'One more moment' : 'Begin breathing'}</Button><div className="modal-support"><p>This is a calming exercise, not medical treatment. If the weight feels too much, reach out to someone you trust or your campus counsellor. If you are in immediate danger, contact local emergency services.</p></div></>;
}
export default function StudentStory() {
  const [sound, setSound] = useState(false);
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState('intro');
  const [detail, setDetail] = useState<Detail | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [breathOpen, setBreathOpen] = useState(false);
  const [broken, setBroken] = useState(false);
  const [pressure, setPressure] = useState(60);
  const [dialogue, setDialogue] = useState('');
  const [storyPlaying, setStoryPlaying] = useState(false);
  const [welcomed, setWelcomed] = useState(false);
  const [saved, setSaved] = useState(false);
  const cancelled = useRef(false);
  const reduced = useRef(false);
  const closeDetail = useCallback(() => { setDetail(null); setSaved(false); }, []);
  const closeVideo = useCallback(() => { setVideoOpen(false); }, []);
  const closeBreath = useCallback(() => { setBreathOpen(false); }, []);
  const scrollTo = useCallback((id: string) => {
    cancelled.current = true; setStoryPlaying(false);
    window.speechSynthesis?.cancel();
    document.getElementById(id)?.scrollIntoView({ behavior: reduced.current ? 'instant' : 'smooth' });
    setMenu(false); chime(sound);
  }, [sound]);
  useEffect(() => {
    reduced.current = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); }), { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    const sections = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); }), { rootMargin: '-25% 0px -50% 0px' });
    document.querySelectorAll('main > section[id]').forEach(el => sections.observe(el));
    const cancel = () => { cancelled.current = true; };
    window.addEventListener('wheel', cancel, { passive: true }); window.addEventListener('touchstart', cancel, { passive: true });
    return () => { observer.disconnect(); sections.disconnect(); window.removeEventListener('wheel', cancel); window.removeEventListener('touchstart', cancel); window.speechSynthesis?.cancel(); };
  }, []);
  useEffect(() => {
    if (welcomed) return;
    let index = 0;
    const start = window.setTimeout(() => {
      const timer = window.setInterval(() => { index++; setDialogue(introduction.slice(0, index)); if (index >= introduction.length) window.clearInterval(timer); }, reduced.current ? 1 : 35);
      typing.current = timer;
    }, 1600);
    return () => { window.clearTimeout(start); if (typing.current) window.clearInterval(typing.current); };
  }, [welcomed]);
  const typing = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (welcomed || reduced.current) return;
    const timer = window.setTimeout(() => { if (!cancelled.current) document.getElementById('burnout')?.scrollIntoView({ behavior: 'smooth' }); }, 11500);
    return () => window.clearTimeout(timer);
  }, [welcomed]);
  useEffect(() => {
    if (!storyPlaying) return;
    const timer = window.setTimeout(() => {
      setStoryPlaying(false);
      if (!cancelled.current) document.getElementById('burnout')?.scrollIntoView({ behavior: reduced.current ? 'instant' : 'smooth' });
    }, 11500);
    return () => window.clearTimeout(timer);
  }, [storyPlaying]);
  const beginStory = () => {
    cancelled.current = false; setWelcomed(true); setDialogue(introduction); setStoryPlaying(true); chime(sound);
    if (sound && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(introduction); utterance.rate = .88;
      utterance.onend = () => { setStoryPlaying(false); if (!cancelled.current) document.getElementById('burnout')?.scrollIntoView({ behavior: reduced.current ? 'instant' : 'smooth' }); };
      window.speechSynthesis.speak(utterance);
    }
  };
  return <>
    <div className="loader" aria-hidden="true"><i className="brand-symbol" /><span>PIXEL PERSONA</span></div>
    <header className="site-nav">
      <a className="brand" href="#intro" onClick={e => { e.preventDefault(); scrollTo('intro'); }} aria-label="Pixel Persona home"><i className="brand-symbol" /><div className="brand-name">PIXEL PERSONA<span className="brand-sub">BREAKING THE FRAME · 2026</span></div></a>
      <nav className="nav-links" aria-label="Main navigation"><a href="#intro" className={active === 'intro' ? 'active' : ''} onClick={e => { e.preventDefault(); scrollTo('intro'); }}>The story</a><a href="#burnout" className={acts.some(a => a.id === active) ? 'active' : ''} onClick={e => { e.preventDefault(); scrollTo('burnout'); }}>The pressures</a><a href="#break-frame" className={active === 'break-frame' ? 'active' : ''} onClick={e => { e.preventDefault(); scrollTo('break-frame'); }}>Break the frame</a></nav>
      <div className="nav-actions"><Button variant="tool" className="nav-sound" title={sound ? 'Mute sound' : 'Enable sound'} aria-label={sound ? 'Mute sound' : 'Enable sound'} aria-pressed={sound} onClick={() => { setSound(s => !s); chime(!sound); if (sound) window.speechSynthesis?.cancel(); }}>{sound ? <Volume2 /> : <VolumeX />}<span>SOUND {sound ? 'ON' : 'OFF'}</span></Button><Button variant="story" onClick={() => scrollTo('you')}>You’re not alone <ArrowUpRight /></Button><Button variant="tool" className="mobile-menu" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} onClick={() => setMenu(m => !m)}>{menu ? <X /> : <Menu />}</Button></div>
    </header>
    {menu && <nav className="mobile-drawer" aria-label="Mobile navigation">{([['intro','The story'],['burnout','The pressures'],['break-frame','Break the frame'],['you','You’re not alone']] as const).map(([id,label]) => <a key={id} href={`#${id}`} onClick={e => { e.preventDefault(); scrollTo(id); }}>{label} ↗</a>)}</nav>}
    <main>
      <section id="intro" className="hero">
        <div className="hero-media"><img src={night} width={1536} height={1024} alt="Alex, a thoughtful student surrounded by books at his late-night study desk" fetchPriority="high" /></div>
        <div className="hero-copy"><div className="eyebrow hero-kicker"><span className="live-dot" /> A STUDENT STORY. A HUMAN STORY.</div><h1><span>BREAKING</span><span>THE <span className="outline-word" >FRAME.</span></span></h1><p className="hero-tagline">Behind every student is a story<br />a report card will never tell.</p><div className="hero-cta"><Button variant="story" onClick={storyPlaying ? () => scrollTo('burnout') : beginStory}>{storyPlaying ? 'Skip to the story' : 'Step into my world'} <ArrowRight /></Button><Button variant="editorial" className="watch-button" onClick={() => { cancelled.current = true; setVideoOpen(true); chime(sound); }}><span className="play-circle"><Play /></span> MEET ALEX</Button></div></div>
        <span className="hero-serial micro">PIXEL PERSONA / A VOICE UNHEARD</span>
        <div className="hero-dialogue"><div className="micro">ALEX · A STUDENT, JUST LIKE YOU</div><p>{dialogue || '“Everyone sees my grades. Nobody sees the weight.”'}</p></div>
        <div className="hero-bottom"><a href="#burnout" className="scroll-cue micro" onClick={e => { e.preventDefault(); scrollTo('burnout'); }}><ArrowDown /> SCROLL TO FEEL THE STORY</a><span className="hero-credit micro">A PIXEL PERSONA EXPERIENCE</span><span className="hero-counter micro">FOUR ACTS. ONE UNSEEN REALITY.</span></div>
      </section>
      <div className="chapter-ribbon" aria-label="Story acts">{acts.map((act, i) => <a href={`#${act.id}`} key={act.id} onClick={e => { e.preventDefault(); scrollTo(act.id); }}><span className="chapter-no">{act.number}</span><div className="micro">{['THE ACADEMIC LOOP','THE EXPECTATION TRAP','THE FUTURE SPIRAL','THE QUIET CRISIS'][i]}<small>ACT {act.roman} — {['BURNOUT','COMPARISON','UNCERTAINTY','THE 3 A.M. SILENCE'][i]}</small></div></a>)}</div>
      {acts.map((act, i) => <section id={act.id} key={act.id} className="story-act"><div className="act-header"><div className="eyebrow"><span className="live-dot" /> ACT {act.roman} / {act.label}</div><span className="micro">{act.number} / 04</span></div><div className="act-layout reveal"><div className="act-heading"><h2>{act.title}</h2><p>{act.description}</p>{i === 0 && <div className="pressure-control"><label className="micro" htmlFor="pressure">THE WEIGHT OF THE DAY <span>{pressure < 35 ? 'LIGHTER' : pressure < 70 ? 'BUILDING' : 'HEAVY'}</span></label><input id="pressure" type="range" min="0" max="100" value={pressure} onChange={e => { setPressure(Number(e.target.value)); chime(sound, true); }} aria-label="The weight of the day" /><span className="micro text-muted-foreground">{pressure < 35 ? 'There is room to breathe.' : pressure < 70 ? 'The tasks are starting to stack up.' : 'Everything asks for more than you have.'}</span></div>}</div><div className="act-photo"><span className="photo-corner" /><img src={[uploadedStudent.url, uploadedScene.url, night, uploadedStudent.url][i]} width={1536} height={1024} loading="lazy" alt={['A student exhausted at his desk beside a laptop and textbooks','Alex standing in his study room, facing the weight of expectations','Alex wondering about his future late at night','A tired student resting his head on the desk'][i]} /><span className="photo-corner end" /><span className="photo-label micro">ALEX’S WORLD / {act.label}</span></div><div className="problem-list"><span className="problem-label micro">THE THINGS YOU DON’T SEE</span>{act.problems.map(([title,description,support], n) => <Button key={title} variant="editorial" className="problem-button" onClick={() => { cancelled.current = true; setDetail({ title,description,support,act: act.label }); chime(sound); }}><span><small>0{n + 1}</small>{title.toUpperCase()}</span><Plus /></Button>)}</div></div><div className="act-footer reveal"><p className="act-quote">{act.quote}</p><div className="act-next"><span className="micro">{i === 3 ? 'THERE IS ANOTHER WAY' : 'THE STORY CONTINUES'}</span><Button variant="tool" aria-label={i === 3 ? 'Go to break the frame' : `Go to act ${i + 2}`} onClick={() => scrollTo(acts[i + 1]?.id ?? 'break-frame')}><ArrowDown /></Button></div></div></section>)}
      <section id="break-frame" className="frame-section"><div className="frame-status"><span className="eyebrow"><span className="live-dot" /> THE TURNING POINT</span><span className="micro">NOT A SCORE. NOT A LABEL.</span></div><div className="frame-canvas"><PixelFrame broken={broken} /></div><div className="frame-text"><h2>{broken ? <>THE FRAME<br />IS NOT YOU.</> : <>YOU WERE NEVER<br />MADE TO FIT.</>}</h2><p className="frame-aside">{broken ? 'The expectations can fall away. Your worth stays. You get to write what happens next.' : 'A grade. An expectation. A perfect version of yourself. None of these can hold everything you are.'}</p></div><div className="frame-action"><Button variant="story" onClick={() => { setBroken(b => !b); chime(sound, !broken); }}>{broken ? <RotateCcw /> : <ArrowUpRight />}{broken ? 'Rebuild the frame' : 'Break the frame'}</Button><p className="micro">{broken ? 'A DIFFERENT KIND OF FREEDOM.' : 'LET GO OF WHAT YOU WERE TOLD TO BE.'}</p></div></section>
      <section id="you" className="ending"><img className="ending-image" src={dawn} width={1536} height={1024} loading="lazy" alt="Alex taking a quiet break as morning light enters his room" /><div className="ending-copy"><span className="eyebrow"><span className="live-dot" /> THE NEXT CHAPTER IS YOURS</span><h2>YOU ARE MORE<br />THAN ENOUGH.</h2><p>You don’t have to earn a moment of peace. You don’t have to carry this alone. A small step is still a way forward.</p><div className="ending-links"><Button variant="story" onClick={() => { setBreathOpen(true); chime(sound); }}>Take a breath <ArrowUpRight /></Button><Button variant="editorial" onClick={() => { setDetail({ title: 'Start with one conversation.', description: 'You do not need to have everything figured out before asking for support. A friend, trusted teacher, family member, or campus counsellor can be a starting point.', support: 'Try: “I have been feeling overwhelmed lately. Could we talk? I don’t need you to fix everything — I just need someone to listen.” If you are in immediate danger, contact local emergency services.', act: 'YOU DON’T HAVE TO DO THIS ALONE' }); chime(sound); }}>Reach out <ArrowRight /></Button></div></div></section>
    </main>
    <footer className="site-footer"><a className="micro" href="#intro" onClick={e => { e.preventDefault(); scrollTo('intro'); }}>PIXEL PERSONA © 2026</a><span className="micro">FOR EVERY STUDENT WHO HAS EVER SAID “I’M FINE.”</span><a className="micro text-editorial" href="#intro" onClick={e => { e.preventDefault(); scrollTo('intro'); }}>BACK TO THE BEGINNING ↗</a></footer>
    {detail && <Modal onClose={closeDetail}><div className="eyebrow"><span className="live-dot" /> {detail.act}</div><h2>{detail.title.toUpperCase()}</h2><p>{detail.description}</p><div className="modal-support"><div className="micro">ONE SMALL STEP</div><p>{detail.support}</p></div><Button variant="story" className="mt-7" onClick={() => { setSaved(true); chime(sound); }}>{saved ? <Check /> : <Plus />}{saved ? 'A step worth taking' : 'I’ll try this'}</Button></Modal>}
    {videoOpen && <Modal onClose={closeVideo} video><video src={studentVideo.url} controls autoPlay muted={!sound} playsInline onEnded={() => { closeVideo(); scrollTo('burnout'); }} /></Modal>}
    {breathOpen && <Modal onClose={closeBreath}><Breathing sound={sound} /></Modal>}
  </>;
}
