/** A sequence of single key presses, each identified by its `keyName()`. */
export interface KeyCombo {
  id: string;
  label: string;
  keys: string[];
}

/** Add your own here; they show up in both radio groups. Avoid keys that need Shift. */
export const COMBOS: KeyCombo[] = [
  { id: 'ctrl-mfe', label: 'Ctrl M F E', keys: ['Control', 'm', 'f', 'e'] },
  {
    id: 'konami',
    label: 'Konami code',
    keys: [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ],
  },
  { id: 'iddqd', label: 'IDDQD (Doom god mode)', keys: ['i', 'd', 'd', 'q', 'd'] },
  { id: 'triple-escape', label: 'Triple Escape', keys: ['Escape', 'Escape', 'Escape'] },
  {
    id: 'arrow-circle',
    label: 'Arrow circle',
    keys: ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'],
  },
  { id: 'f10', label: 'F10 X', keys: ['F10', 'x'] },
];

/**
 * Normalizes a keydown into the names used in `COMBOS`: single characters are
 * lowercased (so Caps Lock doesn't matter); named keys like `ArrowUp`, `Control`
 * and `Escape` pass through as-is.
 */
export function keyName(event: KeyboardEvent): string {
  return event.key.length === 1 ? event.key.toLowerCase() : event.key;
}

const LABELS: Record<string, string> = {
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Control: 'Ctrl',
  Escape: 'Esc',
  ' ': 'Space',
};

/** Display label for a key name, e.g. `ArrowUp` → `↑`, `m` → `M`. */
export function keyLabel(key: string): string {
  return LABELS[key] ?? (key.length === 1 ? key.toUpperCase() : key);
}
