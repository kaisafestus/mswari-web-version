import { LoanOption, LiveActivity } from './types';

export const LOAN_OPTIONS: LoanOption[] = [
  { amount: 2000, label: 'KES 2,000', fee: 99, feeText: 'Service fee: KES 99' },
  { amount: 3000, label: 'KES 3,000', fee: 150, feeText: 'Service fee: KES 150' },
  { amount: 5000, label: 'KES 5,000', fee: 199, feeText: 'Service fee: KES 199' },
  { amount: 7500, label: 'KES 7,500', fee: 250, feeText: 'Service fee: KES 250' },
  { amount: 10000, label: 'KES 10,000', fee: 300, feeText: 'Service fee: KES 300' },
  { amount: 12500, label: 'KES 12,500', fee: 350, feeText: 'Service fee: KES 350' },
  { amount: 16000, label: 'KES 16,000', fee: 450, feeText: 'Service fee: KES 450' },
  { amount: 21000, label: 'KES 21,000', fee: 500, feeText: 'Service fee: KES 500' },
  { amount: 25500, label: 'KES 25,500', fee: 650, feeText: 'Service fee: KES 650' },
  { amount: 30000, label: 'KES 30,000', fee: 600, feeText: 'Service fee: KES 600' },
  { amount: 35000, label: 'KES 35,000', fee: 650, feeText: 'Service fee: KES 650' },
  { amount: 40000, label: 'KES 40,000', fee: 750, feeText: 'Service fee: KES 750' },
  { amount: 45000, label: 'KES 45,000', fee: 800, feeText: 'Service fee: KES 800' },
  { amount: 50000, label: 'KES 50,000', fee: 900, feeText: 'Service fee: KES 900' },
  { amount: 60000, label: 'KES 60,000', fee: 1050, feeText: 'Service fee: KES 1,050' },
  { amount: 70000, label: 'KES 70,000', fee: 1200, feeText: 'Service fee: KES 1,200' },
  { amount: 80000, label: 'KES 80,000', fee: 1350, feeText: 'Service fee: KES 1,350' },
  { amount: 100000, label: 'KES 100,000', fee: 1650, feeText: 'Service fee: KES 1,650' }
];

export const INITIAL_ACTIVITY: LiveActivity = {
  initial: 'M',
  name: 'mark abdul',
  phone: '07** *** *89',
  amount: 'Ksh 45,000',
  time: 'dakika 1 iliyopita'
};

export const ACTIVITIES: LiveActivity[] = [
  {
    initial: 'M',
    name: 'Daniel Omo...',
    phone: '07** *** 990',
    amount: 'Ksh 45,000',
    time: 'dakika 17 zilizopita'
  },
  {
    initial: 'K',
    name: 'Samson Kiprop',
    phone: '07** *** 478',
    amount: 'Ksh 25,500',
    time: 'dakika 9 zilizopita'
  },
  {
    initial: 'A',
    name: 'Esther Wafula',
    phone: '07** *** 631',
    amount: 'Ksh 30,000',
    time: 'sekunde 10 zilizopita'
  },
  {
    initial: 'J',
    name: 'Jane Kemboi',
    phone: '07** *** 214',
    amount: 'Ksh 21,000',
    time: 'dakika 4 zilizopita'
  },
  {
    initial: 'N',
    name: 'Erick Ouma',
    phone: '07** *** 805',
    amount: 'Ksh 12,500',
    time: 'dakika 2 zilizopita'
  }
];

export const KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
  'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
  "Murang'a", 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

export const LOAN_REASONS = [
  'Biashara', 'Elimu', 'Dharura', 'Matibabu', 'Kilimo',
  'Binafsi', 'Kodi ya Nyumba', 'Karo ya Shule', 'Nyingineyo', 'Michango'
];

export function formatKES(amount: number): string {
  return 'KES ' + Number(amount).toLocaleString('en-KE');
}

export function formatKSH(amount: number): string {
  return 'KSH ' + Number(amount).toLocaleString('en-KE');
}

export function formatPhoneDisplay(rawPhone: string): string {
  // Strip any non-digits
  const digits = rawPhone.replace(/\D/g, '');
  // If starts with 254, take last 9 digits
  const local = digits.startsWith('254') ? digits.slice(3) : digits.startsWith('0') ? digits.slice(1) : digits;
  if (local.length >= 9) {
    return `+254 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 9)}`;
  }
  return `+254 ${local}`;
}

export function getLoanOption(amount: number): LoanOption {
  return LOAN_OPTIONS.find(o => o.amount === amount) || {
    amount,
    label: formatKES(amount),
    fee: Math.round(amount * 0.03),
    feeText: `Service fee: KES ${Math.round(amount * 0.03)}`
  };
}
