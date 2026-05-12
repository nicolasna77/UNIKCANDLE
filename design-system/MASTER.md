# UnikCandle — Design System Master

## Brand & Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#8a6243` (warm brown) | CTAs, selected states, accents |
| `primary-foreground` | `#ffffff` | Text on primary |
| `background` | `#ffffff` | Page background |
| `foreground` | `#3a3530` | Body text |
| `muted` | `#faf8f6` | Subtle backgrounds |
| `muted-foreground` | `#635d56` | Secondary text |
| `border` | `#e8e3dd` | Dividers, card borders |
| Emerald-600 | `#059669` | Free/gratuit labels |
| Destructive | oklch(0.577 0.245 27.3) | Errors |

## Typography

- **Body**: 16px min, line-height 1.5–1.75
- **Labels**: 14px (text-sm), medium weight
- **Captions**: 12px (text-xs), muted-foreground
- **Headings**: font-semibold, foreground

## Spacing & Radius

- Card padding: `p-4` / `p-6`
- Section gap: `space-y-6`
- Button height: 44px min (touch target)
- Border radius: `rounded-xl` (cards), `rounded-lg` (inputs)

## Interaction Patterns

- Transitions: `duration-150` to `duration-200` (`transition-all`)
- Selected state: `border-primary bg-primary/5 shadow-sm`
- Hover: `hover:border-primary/50 hover:bg-primary/5`
- Focus ring: `focus-visible:ring-2 focus-visible:ring-ring`
- Disabled: `opacity-50 cursor-not-allowed`

## Checkout / Cart Rules

- **Shipping method selector**: Radio cards (NOT Select dropdown)
  - Show all options simultaneously for quick comparison
  - Custom radio dot (4px filled circle inside 16px ring)
  - Carrier name + delivery days as secondary line
  - Price right-aligned, "Gratuit" in emerald-600
- **Point relais**: search-first flow, list + map side-by-side
- **Order summary**: subtotal → shipping → separator → total (bold)
- **Trust badges**: Shield + Truck icons, payment logos at bottom

## Component Conventions

- `cn()` for conditional class merging
- `aria-hidden="true"` on all decorative icons
- `sr-only` labels for icon-only buttons
- `tabular-nums` for all prices
- Loading: `Loader2` with `animate-spin`
- Error: `text-destructive` inline near the problem
