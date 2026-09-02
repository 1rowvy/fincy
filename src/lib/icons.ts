import {
  Banknote,
  Briefcase,
  Car,
  Circle,
  Cloud,
  CreditCard,
  Dumbbell,
  Gift,
  GraduationCap,
  Heart,
  HeartPulse,
  Home,
  type LucideIcon,
  MoreHorizontal,
  PawPrint,
  Plane,
  PlusCircle,
  Popcorn,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Utensils,
  Wallet,
  Wrench,
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  home: Home,
  popcorn: Popcorn,
  'heart-pulse': HeartPulse,
  smartphone: Smartphone,
  'shopping-bag': ShoppingBag,
  'more-horizontal': MoreHorizontal,
  wallet: Wallet,
  briefcase: Briefcase,
  'plus-circle': PlusCircle,
  gift: Gift,
  plane: Plane,
  'graduation-cap': GraduationCap,
  dumbbell: Dumbbell,
  heart: Heart,
  'paw-print': PawPrint,
  wrench: Wrench,
  sparkles: Sparkles,
  cloud: Cloud,
  banknote: Banknote,
  'credit-card': CreditCard,
  circle: Circle,
};

export const ICON_KEYS = Object.keys(ICON_MAP);

export function getIcon(key: string | null | undefined): LucideIcon {
  return (key && ICON_MAP[key]) || Circle;
}
