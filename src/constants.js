export const HISTORY_LEN = 40

export const SCENARIOS = [
  {
    id: 'healthy',
    label: 'Healthy colon',
    badge: 'NORMAL',
    badgeCls: 'ok',
    tagCls: '',
    base: { temp: 37.2, pressure: 12.0, flow: 1.80 },
    tubeRadius: 0.75,
    tissueColor: 0xc0544a,
  },
  {
    id: 'polyp',
    label: 'Polyp detected',
    badge: 'WARN',
    badgeCls: 'w',
    tagCls: 'warn',
    base: { temp: 37.8, pressure: 14.5, flow: 1.50 },
    tubeRadius: 0.75,
    tissueColor: 0xb84c42,
  },
  {
    id: 'bleed',
    label: 'Active bleeding',
    badge: 'ALERT',
    badgeCls: 'd',
    tagCls: 'danger',
    base: { temp: 38.5, pressure: 18.5, flow: 0.55 },
    tubeRadius: 0.75,
    tissueColor: 0x991818,
  },
  {
    id: 'stricture',
    label: 'Stricture — narrowing',
    badge: 'WARN',
    badgeCls: 'w',
    tagCls: 'warn',
    base: { temp: 37.5, pressure: 23.0, flow: 0.38 },
    tubeRadius: 0.50,
    tissueColor: 0xa04040,
  },
]

export const MODES = [
  {
    id: 'diagnostic',
    label: 'DIAGNOSTIC',
    cls: 'diag',
    thresholds: { temp: 38.5, pressure: 20, flow: 0.5 },
  },
  {
    id: 'therapeutic',
    label: 'THERAPEUTIC',
    cls: 'ther',
    thresholds: { temp: 38.0, pressure: 17, flow: 0.8 },
  },
  {
    id: 'emergency',
    label: 'EMERGENCY',
    cls: 'emer',
    thresholds: { temp: 37.8, pressure: 14, flow: 1.0 },
  },
]
