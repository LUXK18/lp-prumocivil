import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { IconConfetti, IconX } from '@tabler/icons-react';
import NotificationAvatar from './NotificationAvatar';
import './PurchaseNotification.css';

const names = ['Ana', 'Rafael', 'Camila', 'Bruno', 'Mariana', 'Lucas', 'Beatriz', 'Gabriel', 'Juliana', 'Felipe', 'Carolina', 'Thiago'];
const surnames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Pereira', 'Almeida', 'Rodrigues'];
const pick = values => values[Math.floor(Math.random() * values.length)];
const randomDelay = () => 5000 + Math.random() * 15000;

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
      <NotificationAvatar profile={profile} className="purchase-notification__avatar" />
      <div className="purchase-notification__copy">
        <strong>{profile.name}</strong>
        <p>Acabou de investir<br />no Prumo Civil</p>
      </div>
      <IconConfetti className="purchase-notification__confetti" aria-hidden="true" />
      <button className="purchase-notification__close" onClick={() => setDismissed(true)} aria-label="Desativar notificações demonstrativas"><IconX size={13} /></button>
    </motion.aside>}
  </AnimatePresence>;
}
