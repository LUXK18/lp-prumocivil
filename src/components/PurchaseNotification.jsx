import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { IconConfetti, IconX } from '@tabler/icons-react';
import './PurchaseNotification.css';

const names = ['Ana', 'Rafael', 'Camila', 'Bruno', 'Mariana', 'Lucas', 'Beatriz', 'Gabriel', 'Juliana', 'Felipe', 'Carolina', 'Thiago'];
const surnames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Pereira', 'Almeida', 'Rodrigues'];
const pick = values => values[Math.floor(Math.random() * values.length)];
const randomDelay = () => 4000 + Math.random() * 4000;

function createProfile(previousName) {
  let name;
  do { name = `${pick(names)} ${pick(surnames)}`; } while (name === previousName);
  return {
    name,
    skin: pick(['#f2c8a5', '#ca8e66', '#895c42', '#dfab87']),
    hair: pick(['#332521', '#694834', '#a56b38', '#d6b16b']),
    shirt: pick(['#16a34a', '#15262A', '#537b73', '#617894', '#966b8a']),
    background: pick(['#ede0ca', '#d7e6e1', '#e1e5f0', '#f1dcd6']),
    longHair: Math.random() > 0.5,
    id: Math.random().toString(36).slice(2),
  };
}

export default function PurchaseNotification() {
  const [profile, setProfile] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const previousName = useRef('');
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (dismissed) return undefined;
    let timer;
    let disposed = false;
    const schedule = (delay = randomDelay()) => {
      timer = window.setTimeout(() => {
        if (disposed) return;
        if (document.hidden) { schedule(); return; }
        const next = createProfile(previousName.current);
        previousName.current = next.name;
        setProfile(next);
        timer = window.setTimeout(() => {
          setProfile(null);
          schedule();
        }, 6000);
      }, delay);
    };
    schedule(2000);
    return () => { disposed = true; window.clearTimeout(timer); };
  }, [dismissed]);

  return <AnimatePresence>
    {profile && !dismissed && <motion.aside
      key={profile.id}
      className="purchase-notification"
      aria-label="Demonstração de notificação de compra; perfil fictício"
      initial={{ x: reducedMotion ? 0 : 'calc(-100% - 32px)', opacity: 0 }}
      animate={{ x: 0, opacity: 1, transition: { duration: reducedMotion ? 0.15 : 0.85, ease: [0.16, 1, 0.3, 1] } }}
      exit={{ x: reducedMotion ? 0 : 'calc(-100% - 32px)', opacity: 0, transition: { duration: reducedMotion ? 0.15 : 0.65, ease: [0.7, 0, 0.84, 0] } }}
    >
      <svg className="purchase-notification__avatar" viewBox="0 0 80 80" aria-hidden="true">
        <defs><clipPath id={`avatar-${profile.id}`}><circle cx="40" cy="40" r="38" /></clipPath></defs>
        <g clipPath={`url(#avatar-${profile.id})`}>
          <path fill={profile.background} d="M0 0h80v80H0z" />
          {profile.longHair && <ellipse cx="40" cy="40" rx="23" ry="30" fill={profile.hair} />}
          <ellipse cx="40" cy="83" rx="31" ry="28" fill={profile.shirt} />
          <path d="M33 48h14v17H33z" fill={profile.skin} />
          <ellipse cx="40" cy="33" rx="18" ry="23" fill={profile.skin} />
          <path d="M21 31C18 5 60 2 59 31L50 20c-8 7-18 4-29 11Z" fill={profile.hair} />
          <g fill="#332521"><circle cx="33" cy="34" r="1.5" /><circle cx="47" cy="34" r="1.5" /></g>
          <path d="M34 45q6 5 12 0" fill="none" stroke="#8b4e3b" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
      <div className="purchase-notification__copy">
        <strong>{profile.name}</strong>
        <p>Acabou de investir<br />no Prumo Civil</p>
      </div>
      <IconConfetti className="purchase-notification__confetti" aria-hidden="true" />
      <button className="purchase-notification__close" onClick={() => setDismissed(true)} aria-label="Desativar notificações demonstrativas"><IconX size={13} /></button>
    </motion.aside>}
  </AnimatePresence>;
}
