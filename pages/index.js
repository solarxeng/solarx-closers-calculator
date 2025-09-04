import { useState, useEffect, useMemo, useRef } from 'react';
// confetti will be loaded dynamically on the client to avoid SSR issues
import usaMap from '@svg-maps/usa';

// Full redline dataset. Each state contains one or more utility sections,
// and each utility contains pricing per finance option. When adding new
// pricing, ensure the keys exactly match the utilities expected. Default
// utilities are used when a specific utility entry is not present.
const pricingByState = {
  Arkansas: {
    default: { sunrun: 2.2, enfin_loan: 2.2, goodleap_loan: 2.2, cash: 2.0 }
  },
  Arizona: {
    default: {
      everbright: 1.5,
      goodleap_tpo: 2.2,
      sunrun: 1.55,
      enfin_loan: 1.7,
      goodleap_loan: 2.2,
      credit_human: 2.2,
      cash: 2.0
    },
    'APS/TEP': { goodleap_tpo: 1.6 }
  },
  California: {
    default: {
      everbright: 2.7,
      goodleap_tpo: 2.85,
      sunrun: 2.95,
      enfin_loan: 3.05,
      goodleap_loan: 2.5,
      credit_human: 2.5,
      cash: 2.15
    },
    SMUD: { goodleap_tpo: 2.55 },
    'PG&E': {
      enfin_tpo: 2.8,
      everbright: 2.85,
      goodleap_tpo: 2.95,
      sunrun: 3.05,
      enfin_loan: 2.5,
      goodleap_loan: 2.5,
      credit_human: 2.5,
      cash: 2.15
    },
    'SCE/SDG&E': {
      enfin_tpo: 2.65,
      everbright: 2.85,
      goodleap_tpo: 2.7,
      sunrun: 3.05,
      enfin_loan: 2.5,
      goodleap_loan: 2.5,
      credit_human: 2.5,
      cash: 2.15
    },
    'SDG&E': { everbright: 2.85, goodleap_tpo: 2.95 }
  },
  Colorado: {
    default: {
      goodleap_tpo: 2.3,
      sunrun: 1.9,
      enfin_loan: 2.2,
      goodleap_loan: 2.2,
      credit_human: 2.2,
      cash: 2.0
    },
    'Black Hills': { goodleap_tpo: 2.1 }
  },
  Connecticut: {
    default: {
      everbright: 2.47,
      goodleap_tpo: 2.4,
      sunrun: 2.27,
      enfin_loan: 2.47,
      goodleap_loan: 2.55,
      credit_human: 2.55,
      cash: 2.17
    }
  },
  'District of Columbia': {
    default: { sunrun: 2.5, enfin_loan: 2.45, goodleap_loan: 2.65, credit_human: 2.65, cash: 2.3 }
  },
  Delaware: {
    default: { enfin_loan: 2.7, goodleap_loan: 2.7, credit_human: 2.7, cash: 2.45 }
  },
  Florida: {
    default: { everbright: 1.9, sunrun: 2.0, enfin_loan: 2.1, goodleap_loan: 2.2, credit_human: 2.2, cash: 2.0 }
  },
  Georgia: {
    default: { sunrun: 1.65, goodleap_loan: 2.25, credit_human: 2.25, cash: 2.0 }
  },
  Illinois: {
    default: { everbright: 2.3, goodleap_tpo: 2.75, enfin_loan: 2.15, goodleap_loan: 2.25, credit_human: 2.25, cash: 2.2 }
  },
  Kansas: {
    default: { sunrun: 2.25, goodleap_loan: 2.3, credit_human: 2.3, cash: 2.05 }
  },
  Massachusetts: {
    default: { everbright: 2.65, goodleap_tpo: 2.85, sunrun: 2.8, enfin_loan: 2.75, goodleap_loan: 2.55, credit_human: 2.55, cash: 2.22 }
  },
  Maryland: {
    default: { goodleap_tpo: 2.5, sunrun: 2.45, enfin_loan: 2.45, goodleap_loan: 2.4, credit_human: 2.4, cash: 2.05 }
  },
  Maine: {
    default: { goodleap_tpo: 2.65, sunrun: 2.6, enfin_loan: 2.45, goodleap_loan: 2.5, credit_human: 2.5, cash: 2.15 }
  },
  Michigan: {
    default: { sunrun: 1.9, goodleap_loan: 2.4, credit_human: 2.4, cash: 2.25 }
  },
  Minnesota: {
    default: { goodleap_loan: 2.2, credit_human: 2.2, cash: 2.25 }
  },
  Missouri: {
    default: { sunrun: 1.8, goodleap_loan: 2.15, credit_human: 2.15, cash: 2.1 }
  },
  Montana: {
    default: { goodleap_loan: 1.95, credit_human: 1.95, cash: 2.05 }
  },
  'North Carolina': {
    default: { goodleap_loan: 2.11, credit_human: 2.11, cash: 1.96 }
  },
  'New Hampshire': {
    default: { goodleap_tpo: 2.62, sunrun: 2.57, enfin_loan: 2.42, goodleap_loan: 2.55, credit_human: 2.55, cash: 2.17 }
  },
  'New Jersey': {
    default: { everbright: 2.25, goodleap_tpo: 2.7, sunrun: 2.35, enfin_loan: 2.4, goodleap_loan: 2.5, credit_human: 2.5, cash: 2.15 }
  },
  'New Mexico': {
    default: { sunrun: 1.95, enfin_loan: 1.95, goodleap_loan: 2.2, credit_human: 2.2, cash: 2.0 }
  },
  Nevada: {
    default: { enfin_loan: 1.9, goodleap_loan: 2.11, credit_human: 2.11, cash: 1.96 }
  },
  'New York': {
    default: { everbright: 2.3, sunrun: 2.55, enfin_loan: 2.2, goodleap_loan: 2.35, credit_human: 2.35, cash: 2.2 }
  },
  Ohio: {
    default: { goodleap_tpo: 2.3, sunrun: 2.3, goodleap_loan: 2.35, credit_human: 2.35, cash: 2.0 }
  },
  Oklahoma: {
    default: { sunrun: 1.9, goodleap_loan: 2.15, credit_human: 2.15, cash: 2.0 }
  },
  Oregon: {
    default: { sunrun: 1.85, goodleap_loan: 2.25, credit_human: 2.25, cash: 2.0 }
  },
  Pennsylvania: {
    default: { sunrun: 2.15, enfin_loan: 2.35, goodleap_loan: 2.4, credit_human: 2.4, cash: 2.0 }
  },
  'Puerto Rico': {
    default: { enfin_loan: 1.95, cash: 2.0 }
  },
  'Rhode Island': {
    default: { sunrun: 2.27, enfin_loan: 2.45, goodleap_loan: 2.55, credit_human: 2.55, cash: 2.17 }
  },
  'South Carolina': {
    default: { sunrun: 1.6, goodleap_loan: 2.15, credit_human: 2.15, cash: 2.0 }
  },
  Texas: {
    default: {
      everbright: 2.0,
      goodleap_tpo: 2.25,
      sunrun: 2.05,
      enfin_loan: 2.3,
      goodleap_loan: 2.15,
      credit_human: 2.15,
      cash: 2.0
    },
    CPS: { sunrun: 1.9 }
  },
  Virginia: {
    default: { sunrun: 1.9, goodleap_loan: 2.4, credit_human: 2.4, cash: 2.0 }
  },
  Vermont: {
    default: { goodleap_loan: 2.55, credit_human: 2.55, cash: 2.3 }
  },
  Washington: {
    default: { sunrun: 1.51, goodleap_loan: 2.15, credit_human: 2.15, cash: 1.96 }
  },
  Wisconsin: {
    default: { goodleap_loan: 2.3, credit_human: 2.3, cash: 2.05 }
  }
};

// Finance labels for display. If a key is missing, the key itself will be used.
const FINANCE_LABELS = {
  everbright: 'EverBright',
  goodleap_tpo: 'GoodLeap TPO',
  goodleap_loan: 'GoodLeap Loan',
  enfin_tpo: 'Enfin TPO',
  enfin_loan: 'Enfin Loan',
  credit_human: 'Credit Human',
  sunrun: 'Sunrun',
  cash: 'Cash'
};

// A small mapping from state names to their postal abbreviations. Only the
// states present in pricingByState are listed here. If you add a new state
// to pricingByState, also add its abbreviation here.
const stateAbbr = {
  Arkansas: 'AR',
  Arizona: 'AZ',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  'District of Columbia': 'DC',
  Delaware: 'DE',
  Florida: 'FL',
  Georgia: 'GA',
  Illinois: 'IL',
  Kansas: 'KS',
  Massachusetts: 'MA',
  Maryland: 'MD',
  Maine: 'ME',
  Michigan: 'MI',
  Minnesota: 'MN',
  Missouri: 'MO',
  Montana: 'MT',
  'North Carolina': 'NC',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  Nevada: 'NV',
  'New York': 'NY',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  'Puerto Rico': 'PR',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  Texas: 'TX',
  Virginia: 'VA',
  Vermont: 'VT',
  Washington: 'WA',
  Wisconsin: 'WI'
};

// Format numbers as USD currency. If the input is not finite, returns '$0'.
function currency(n) {
  return Number.isFinite(n)
    ? n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
    : '$0';
}

// Strip all characters except digits and a single dot. Limit to two decimal places.
function sanitizeDecimalInput(value) {
  if (!value) return '';
  let cleaned = value.replace(/[^0-9.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot !== -1) {
    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
  }
  const parts = cleaned.split('.');
  if (parts.length === 2) {
    parts[1] = parts[1].slice(0, 2);
    return parts[0] + '.' + parts[1];
  }
  return cleaned;
}

// Quotes used by the typewriter effect in the footer. To add or remove quotes,
// modify this list. Quotes will cycle every 15 seconds by default.
const QUOTES = [
  'The only limit to our realization of tomorrow is our doubts of today. – Franklin D. Roosevelt',
  'Do what you can, with what you have, where you are. – Theodore Roosevelt',
  'Success is not final, failure is not fatal: It is the courage to continue that counts. – Winston Churchill',
  'Don’t count the days, make the days count. – Muhammad Ali',
  'The best way to predict the future is to create it. – Peter Drucker',
  'Believe you can and you’re halfway there. – Theodore Roosevelt',
  'Act as if what you do makes a difference. It does. – William James',
  'Your time is limited, so don’t waste it living someone else’s life. – Steve Jobs',
  'What lies behind us and what lies before us are tiny matters compared to what lies within us. – Ralph Waldo Emerson',
  'Everything you’ve ever wanted is on the other side of fear. – George Addair',
  'Hardships often prepare ordinary people for an extraordinary destiny. – C.S. Lewis',
  'Success usually comes to those who are too busy to be looking for it. – Henry David Thoreau',
  'Opportunities don\'t happen. You create them. – Chris Grosser',
  'Don’t be pushed around by the fears in your mind. Be led by the dreams in your heart. – Roy T. Bennett',
  'It always seems impossible until it’s done. – Nelson Mandela',
  'Start where you are. Use what you have, do what you can. – Arthur Ashe',
  'Hustle beats talent when talent doesn’t hustle. – Ross Simmonds',
  'Great things never come from comfort zones. – Anonymous',
  'Push yourself, because no one else is going to do it for you. – Anonymous',
  'Dream big and dare to fail. – Norman Vaughan',
  'If you’re going through hell, keep going. – Winston Churchill',
  'Success is walking from failure to failure with no loss of enthusiasm. – Winston Churchill',
  'Don’t wait. The time will never be just right. – Napoleon Hill',
  'I am not a product of my circumstances. I am a product of my decisions. – Stephen R. Covey',
  'Discipline equals freedom. – Jocko Willink',
  'Do not wait to strike till the iron is hot, but make it hot by striking. – William Butler Yeats',
  'A goal without a plan is just a wish. – Antoine de Saint-Exupéry',
  'Fall seven times and stand up eight. – Japanese Proverb',
  'Action is the foundational key to all success. – Pablo Picasso',
  'Small progress is still progress. – Anonymous',
  'Energy and persistence conquer all things. – Benjamin Franklin',
  'You miss 100% of the shots you don’t take. – Wayne Gretzky',
  'Whether you think you can or think you can’t, you’re right. – Henry Ford',
  'Don’t wish it were easier. Wish you were better. – Jim Rohn',
  'Success is how high you bounce when you hit bottom. – George S. Patton',
  'Work hard in silence, let your success be your noise. – Frank Ocean',
  'Quality is not an act, it is a habit. – Aristotle',
  'The way to get started is to quit talking and begin doing. – Walt Disney',
  'Courage is grace under pressure. – Ernest Hemingway',
  'Great minds discuss ideas; average minds discuss events; small minds discuss people. – Eleanor Roosevelt'
];

// Custom hook to animate a typewriter effect cycling through an array of quotes.
function useTypewriterQuotes(quotes, cycleMs = 15000) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!quotes.length) return;
    const full = quotes[index % quotes.length];
    const HOLD_MS = 1800;
    const BETWEEN_MS = 300;
    const len = Math.max(1, full.length);
    const available = Math.max(0, cycleMs - HOLD_MS - BETWEEN_MS);
    const perChar = Math.max(18, Math.floor(available / (len * 2)));
    const TYPE_SPEED = perChar;
    const DELETE_SPEED = Math.max(12, Math.floor(perChar * 0.6));
    let timer;
    const step = () => {
      if (isTyping) {
        const next = full.slice(0, text.length + 1);
        setText(next);
        if (next.length === full.length) {
          setIsTyping(false);
          setTimeout(() => setIsDeleting(true), HOLD_MS);
        }
        timer = setTimeout(step, TYPE_SPEED);
      } else if (isDeleting) {
        const next = full.slice(0, Math.max(0, text.length - 1));
        setText(next);
        if (next.length === 0) {
          setIsDeleting(false);
          setIsTyping(true);
          setTimeout(() => setIndex((i) => (i + 1) % quotes.length), BETWEEN_MS);
          return;
        }
        timer = setTimeout(step, DELETE_SPEED);
      }
    };
    timer = setTimeout(step, isTyping ? TYPE_SPEED : DELETE_SPEED);
    return () => clearTimeout(timer);
  }, [index, isTyping, isDeleting, text, quotes, cycleMs]);
  useEffect(() => {
    setIsTyping(true);
    setIsDeleting(false);
    setText('');
  }, [index]);
  return text;
}

// Animated cash stack component. Renders a small SVG stack of bills and
// animates its fall into view. Several CashStack components are stacked on
// top of each other to create the illusion of money stacking up as the
// commission changes.
const CashStackSVG = ({ className }) => (
  <svg
    viewBox="0 0 64 40"
    /**
     * Provide explicit width and height fallback for non‑Tailwind environments.  The
     * original component expected utility classes (e.g. w‑12 h‑8) to size the
     * stack. Without those classes the SVG expands to fill the container.  To
     * keep the green bills subtle, scale the default down to 32×20px. If a
     * custom className is supplied the caller controls sizing.
     */
    style={{ width: className ? undefined : '32px', height: className ? undefined : '20px' }}
    className={className || ''}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <defs>
      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#47a447" />
        <stop offset="100%" stopColor="#2f7a2f" />
      </linearGradient>
    </defs>
    <rect x="2" y="6" width="60" height="28" rx="4" fill="url(#g1)" stroke="#235d23" strokeWidth="2" />
    <rect x="6" y="10" width="52" height="20" rx="3" fill="#e6f5e6" opacity="0.2" />
    <circle cx="20" cy="20" r="6" fill="#1e5d1e" opacity="0.35" />
    <text x="34" y="24" fontFamily="ui-sans-serif,system-ui" fontSize="12" fill="#144d14" fontWeight="700">
      $
    </text>
  </svg>
);

const CashStack = ({ index }) => {
  const [landed, setLanded] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setLanded(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const cols = 5;
  const col = index % cols;
  const row = Math.floor(index / cols);
  // Each stack occupies roughly the same height as the SVG.  Reduce the
  // baseline from 30px to 20px to match the scaled CashStackSVG height.  This
  // prevents the cash graphics from dominating the Final Commission area.
  const stackH = 20;
  const rightPct = col * (100 / cols);
  const bottomPx = row * (stackH - 2);
  const rotate = col % 2 ? -4 : 4;
  return (
    <div
      className="absolute"
      style={{
        right: `${rightPct}%`,
        bottom: `${bottomPx}px`,
        transform: landed ? `translateY(0) rotate(${rotate}deg)` : `translateY(-120%) rotate(${rotate}deg)`,
        transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'transform'
      }}
    >
      <CashStackSVG />
    </div>
  );
};

// Watermark component that displays the selected state's silhouette behind
// the state dropdown. If the redline is unavailable (null), or if the
// silhouette cannot be found, it falls back to a simple abbreviation badge.
function StateWatermark({ stateName, redlineRaw }) {
  if (!stateName || redlineRaw === null) return null;
  const abbr = stateAbbr[stateName] || '';
  const location = usaMap.locations.find(
    (loc) => (loc.name || '').trim().toLowerCase() === stateName.trim().toLowerCase()
  );
  // If no path data is found, show letters only
  if (!location || !location.path) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 80,
          height: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          opacity: 0.1,
          color: '#1E40AF',
          fontWeight: 800,
          fontSize: 24
        }}
      >
        {abbr}
      </div>
    );
  }
  const pathData = location.path;
  const pathRef = useRef(null);
  const [viewBox, setViewBox] = useState('0 0 1000 600');
  useEffect(() => {
    if (pathRef.current) {
      try {
        const bbox = pathRef.current.getBBox();
        setViewBox(`${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
      } catch (e) {
        // swallow exceptions – not all browsers support getBBox on unloaded SVGs
      }
    }
  }, [pathData]);
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 80,
        height: 50,
        pointerEvents: 'none'
      }}
    >
      <svg viewBox={viewBox} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <path
          ref={pathRef}
          d={pathData}
          fill="#E5E7EB"
          stroke="#1E40AF"
          strokeWidth={1}
          opacity={0.15}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1E40AF',
          fontWeight: 700,
          fontSize: 14,
          opacity: 0.4
        }}
      >
        {abbr}
      </div>
    </div>
  );
}

// Helper to label finance keys
const labelForFinance = (k) => FINANCE_LABELS[k] || k;

export default function Home() {
  /*
   * Confetti is loaded on demand inside the chooseSplit handler.  Importing
   * 'canvas-confetti' on the server causes SSR failures, and a static
   * import at the module scope can throw during build.  Rather than
   * pre‑loading the module in an effect, we defer loading until the user
   * actually triggers a split change.  See chooseSplit below.
   */
  const states = useMemo(() => Object.keys(pricingByState), []);
  const [stateSel, setStateSel] = useState(states[0] || '');
  const utilitiesForState = useMemo(() => {
    if (!stateSel) return [];
    const utils = Object.keys(pricingByState[stateSel] || {});
    return utils.sort((a, b) => (a === 'default' ? -1 : b === 'default' ? 1 : a.localeCompare(b)));
  }, [stateSel]);
  const [utilitySel, setUtilitySel] = useState('default');
  useEffect(() => {
    if (!utilitiesForState.includes(utilitySel)) {
      setUtilitySel(utilitiesForState[0] || 'default');
    }
  }, [utilitiesForState, utilitySel]);
  const financesForSelection = useMemo(() => {
    if (!stateSel || !utilitySel) return [];
    return Object.keys(pricingByState[stateSel]?.[utilitySel] || {});
  }, [stateSel, utilitySel]);
  const [financeSel, setFinanceSel] = useState('');
  useEffect(() => {
    if (!financesForSelection.includes(financeSel)) {
      setFinanceSel(financesForSelection[0] || '');
    }
  }, [financesForSelection, financeSel]);
  const [ppwSold, setPpwSold] = useState('');
  const [systemSize, setSystemSize] = useState('');
  const INSTALLER_SHARE = 0.8;
  const onChangePpw = (e) => {
    const v = sanitizeDecimalInput(e.target.value);
    setPpwSold(v);
  };
  const onBlurPpw = () => {
    if (ppwSold === '') return;
    const num = Number(ppwSold);
    if (Number.isFinite(num)) setPpwSold(num.toFixed(2));
  };
  const onChangeKw = (e) => {
    const v = sanitizeDecimalInput(e.target.value);
    setSystemSize(v);
  };
  const onBlurKw = () => {
    if (systemSize === '') return;
    const isIntegerLike = /^\d+$/.test(systemSize);
    let num = Number(systemSize);
    if (isIntegerLike && num >= 100) {
      num = num / 1000;
    }
    if (Number.isFinite(num)) setSystemSize(num.toFixed(2));
  };
  const [splitPct, setSplitPct] = useState(40);
  // Hold a reference to the confetti function once it has been loaded on the client.
  const confettiRef = useRef(null);
  // Load canvas-confetti on the client after the component mounts.  We do this once
  // so the module isn't fetched every time a split is chosen, and to avoid
  // importing it during SSR.  If the import fails we simply leave the ref
  // as null and no confetti will fire.
  useEffect(() => {
    let mounted = true;
    // Import the browser build of canvas-confetti.  The default package entry
    // sometimes resolves to a Node build that doesn't run in the browser when
    // loaded dynamically.  The browser build lives under the dist directory.
    import('canvas-confetti/dist/confetti.browser')
      .then((mod) => {
        if (!mounted) return;
        const fn = mod.default || mod;
        if (typeof fn === 'function') {
          confettiRef.current = fn;
        }
      })
      .catch(() => {
        // ignore import errors
      });
    return () => {
      mounted = false;
    };
  }, []);
  const chooseSplit = (pct) => {
    setSplitPct(pct);
    // Fire confetti only if the module has been loaded successfully.  This
    // prevents runtime errors when the module isn't available (e.g. SSR) and
    // avoids re-importing on every click.
    const confettiFn = confettiRef.current;
    if (typeof confettiFn === 'function') {
      confettiFn({ particleCount: 120, spread: 70, origin: { y: 0.2 } });
    }
  };
  const numericSystemSize = parseFloat(systemSize) || 0;
  const numericPpwSold = parseFloat(ppwSold) || 0;
  const redlineRaw = useMemo(() => {
    const r = pricingByState[stateSel]?.[utilitySel]?.[financeSel] ?? pricingByState[stateSel]?.['default']?.[financeSel];
    return typeof r === 'number' ? r : null;
  }, [stateSel, utilitySel, financeSel]);
  const redline = redlineRaw ?? 0;
  const redlineDisplay = redlineRaw == null ? 'N/A' : redline;
  const commissionableMargin = useMemo(
    () => Math.max(0, numericPpwSold - redline) * numericSystemSize,
    [numericPpwSold, redline, numericSystemSize]
  );
  const commissionable = useMemo(() => commissionableMargin * INSTALLER_SHARE, [commissionableMargin]);
  const finalCommission = useMemo(() => commissionable * (splitPct / 100), [commissionable, splitPct]);
  const [displayCommission, setDisplayCommission] = useState(0);
  useEffect(() => {
    const target = Math.max(0, finalCommission * 1000);
    const startVal = displayCommission;
    const diff = target - startVal;
    const duration = 900;
    let raf = 0;
    const startTs = performance.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const p = Math.min(1, (now - startTs) / duration);
      const eased = easeOutCubic(p);
      setDisplayCommission(startVal + diff * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [finalCommission]);
  const [cashStacks, setCashStacks] = useState([]);
  useEffect(() => {
    setCashStacks((prev) => (prev.length >= 40 ? prev : [...prev, { id: Date.now() + Math.random() }]));
  }, [finalCommission]);
  const clearCash = () => setCashStacks([]);
  const typedQuote = useTypewriterQuotes(QUOTES, 15000);
  // Copy breakdown to clipboard. Generates a single line summarizing
  // the deal parameters and commission. Displays a temporary "Copied!" indicator.
  const [copied, setCopied] = useState(false);
  const copyBreakdown = () => {
    const marginPerW = Math.max(0, numericPpwSold - redline);
    const parts = [];
    parts.push(stateSel);
    if (utilitySel && utilitySel !== 'default') parts.push(utilitySel);
    if (financeSel) parts.push(labelForFinance(financeSel));
    parts.push(`${numericSystemSize.toFixed(2)} kW`);
    parts.push(`PPW $${numericPpwSold.toFixed(2)}`);
    parts.push(`Redline ${redlineRaw == null ? 'N/A' : '$' + redline.toFixed(2)}`);
    parts.push(`Margin $${marginPerW.toFixed(2)}/W`);
    parts.push(`${splitPct}% split`);
    parts.push(`Commission ${currency(finalCommission * 1000)}`);
    const text = parts.join(' | ');
    const doCopy = (val) => {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(val).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }).catch(() => {});
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = val;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch (err) {
          // ignore
        }
        document.body.removeChild(textarea);
      }
    };
    doCopy(text);
  };
  // Base styles used throughout the component. Changing these values will
  // cascade through the UI for a consistent look and feel.
  const card = {
    background: '#fff',
    border: '1px solid #eee',
    borderRadius: 16,
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    padding: 20
  };
  const inputStyle = {
    width: '100%',
    border: '1px solid #ddd',
    borderRadius: 12,
    padding: '8px 12px',
    outline: 'none'
  };
  const buttonBase = {
    border: '1px solid #ddd',
    borderRadius: 16,
    padding: '12px 16px',
    fontWeight: 700,
    fontSize: 16,
    background: '#fff',
    color: '#111'
  };
  const buttonSelected = {
    ...buttonBase,
    background: '#BFDBFE',
    border: '1px solid #60A5FA',
    color: '#0C4A6E'
  };
  return (
    <div style={{ minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gap: 24 }}>
        <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>Solar X - Elite Closers Calculator</h1>
            <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              Formula: <code>(PPW − Redline) × kW × 80% × Closer Split</code>
            </p>
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            Installer cut fixed at <b>20%</b>
          </div>
        </header>
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <section style={card}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Deal Inputs</h2>
            <div style={{ marginBottom: 12, position: 'relative' }}>
              <StateWatermark stateName={stateSel} redlineRaw={redlineRaw} />
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>State</label>
              <select
                style={inputStyle}
                value={stateSel}
                onChange={(e) => setStateSel(e.target.value)}
              >
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {utilitiesForState.length > 1 && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Utility</label>
                <select
                  style={inputStyle}
                  value={utilitySel}
                  onChange={(e) => setUtilitySel(e.target.value)}
                >
                  {utilitiesForState.map((u) => (
                    <option key={u} value={u}>
                      {u === 'default' ? 'All Utilities (Default)' : u}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Finance</label>
              <select
                style={inputStyle}
                value={financeSel}
                onChange={(e) => setFinanceSel(e.target.value)}
              >
                {financesForSelection.length ? (
                  financesForSelection.map((f) => (
                    <option key={f} value={f}>
                      {labelForFinance(f)}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No finance options
                  </option>
                )}
              </select>
            </div>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>PPW Sold ($/W)</label>
                <input
                  type="text"
                  placeholder="3.25"
                  style={inputStyle}
                  value={ppwSold}
                  onChange={onChangePpw}
                  onBlur={onBlurPpw}
                />
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>net PPW</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>System Size (kW)</label>
                <input
                  type="text"
                  placeholder="12.12"
                  style={inputStyle}
                  value={systemSize}
                  onChange={onChangeKw}
                  onBlur={onBlurKw}
                />
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>e.g. 7790 watts → 7.79</div>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>
                <span
                  style={{
                    textDecoration: 'underline',
                    textDecorationColor: '#DC2626',
                    textDecorationThickness: 2
                  }}
                >
                  Redline
                </span>{' '}
                ($/W)
              </label>
              <input
                style={{ ...inputStyle, background: '#f5f5f5' }}
                value={redlineDisplay}
                readOnly
              />
            </div>
          </section>
          <section style={card}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Closer Split</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[40, 45, 50].map((pct) => (
                <button
                  key={pct}
                  onClick={() => chooseSplit(pct)}
                  style={splitPct === pct ? buttonSelected : buttonBase}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <div
              style={{
                position: 'relative',
                marginTop: 16,
                background: '#fafafa',
                border: '1px solid #eee',
                borderRadius: 12,
                padding: 16,
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
                <div style={{ position: 'absolute', inset: 0 }}>
                  {cashStacks.map((s, i) => (
                    <CashStack key={s.id} index={i} />
                  ))}
                </div>
              </div>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ fontSize: 12, color: '#666' }}>Final Commission</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#50C878' }}>
                  {currency(Number(displayCommission.toFixed(2)))}
                </div>
                <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                  Used:{' '}
                  <code>
                    ({Number(numericPpwSold).toFixed(2)} − {Number(redline).toFixed(2)}) ×{' '}
                    {Number(numericSystemSize).toFixed(2)} × 80% × {splitPct}%
                  </code>
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button onClick={clearCash} style={{ ...buttonBase, padding: '10px 14px' }}>
                Clear Cash
              </button>
              <button onClick={copyBreakdown} style={{ ...buttonBase, padding: '10px 14px' }}>
                {copied ? 'Copied!' : 'Copy breakdown'}
              </button>
            </div>
          </section>
        </div>
        <footer style={{ textAlign: 'center', fontSize: 13, color: '#444', marginTop: 12 }}>
          <span style={{ fontStyle: 'italic' }}>{typedQuote}</span>
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              marginLeft: 6,
              width: 6,
              height: 18,
              borderRight: '2px solid #888',
              transform: 'translateY(3px)',
              animation: 'blink 1s steps(1) infinite'
            }}
          />
          <div style={{ marginTop: 4, fontSize: 10, color: '#9a9a9a' }}>Quotes rotate every 15s</div>
          <div style={{ marginTop: 8, fontSize: 11, color: '#6b7280' }}>
            Made for Solar X Earth a Wyoming Company.
          </div>
        </footer>
      </div>
      <style jsx>{`
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
        input:focus {
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
          border-color: #c7d2fe;
        }
      `}</style>
    </div>
  );
}