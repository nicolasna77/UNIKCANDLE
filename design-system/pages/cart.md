# Cart Page — Design Overrides

Inherits from MASTER.md. Specific rules for the cart checkout flow.

## Shipping Method Selection

- **Pattern**: Radio cards stacked vertically, full width
- **Card height**: auto (padding p-3.5), min 44px touch target
- **Selected**: `border-primary bg-primary/5 shadow-sm`
- **Unselected**: `border-border bg-background`
- **Radio dot**: 16px ring, 8px fill when selected (both use `bg-primary`)
- **Service point indicator**: `MapPin` icon (primary, 14px) before method name

## Country Selector

- Full-width Select, `rounded-xl`
- No flag emojis — keep plain country names

## Service Point Picker

- Search bar: full-width Input + Button side-by-side
- Results layout: 2-col (list | map) on md+, single col on mobile
- List max-height: `max-h-72` with `overflow-y-auto`
- Selected card: `border-primary/40 bg-primary/5` with `CheckCircle2` icon (emerald)
- Distance badge: `text-xs bg-muted rounded-full px-2 py-0.5`

## Order Summary Numbers

- All prices: `tabular-nums`
- Separator before total: `border-t border-border pt-2 mt-2`
- Total row: `font-semibold text-base`

## Trust Badges

- Below checkout button
- Payment logos: centered, max 48px height, grayscale → color on hover (optional)
