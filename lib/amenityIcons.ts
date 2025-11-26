// lib/amenityIcons.ts
export type AmenityIconKey =
  | 'check'
  | 'bed'
  | 'tooth'
  | 'airplane'
  | 'car'
  | 'hotel'
  | 'language'
  | 'globe';

export type AmenityIconDef = {
  value: '' | AmenityIconKey;
  label: string;
  icon: string; // Iconify id
};

export const AMENITY_ICON_DEFS: AmenityIconDef[] = [
  {
    value: '',
    label: 'No icon',
    icon: 'mdi:checkbox-blank-circle-outline',
  },
  {
    value: 'check',
    label: 'General check',
    icon: 'solar:check-circle-bold',
  },
  {
    value: 'bed',
    label: 'Bed / room',
    icon: 'mdi:bed-outline',
  },
  {
    value: 'tooth',
    label: 'Tooth / dental',
    icon: 'mdi:tooth-outline',
  },
  {
    value: 'airplane',
    label: 'Airplane / travel',
    icon: 'mdi:airplane',
  },
  {
    value: 'car',
    label: 'Car / transfer',
    icon: 'mdi:car-side',
  },
  {
    value: 'hotel',
    label: 'Hotel / stay',
    icon: 'mdi:hotel',
  },
  {
    value: 'language',
    label: 'Languages',
    icon: 'mdi:translate',
  },
  {
    value: 'globe',
    label: 'Global / international',
    icon: 'mdi:web',
  },
];

export const AMENITY_ICON_MAP: Record<
  AmenityIconKey,
  { label: string; icon: string }
> = AMENITY_ICON_DEFS.reduce((acc, def) => {
  if (def.value) {
    acc[def.value as AmenityIconKey] = {
      label: def.label,
      icon: def.icon,
    };
  }
  return acc;
}, {} as Record<AmenityIconKey, { label: string; icon: string }>);
