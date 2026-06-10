// ─────────────────────────────────────────────
// Калькулятор ипотеки (аннуитет / дифференцированный)
// + досрочные погашения: разовые и регулярные
// ─────────────────────────────────────────────

export type PaymentType = 'annuity' | 'differentiated';

// 'issue' — день, в который выдан кредит; 'last' — последний день месяца; число 1..31
export type PaymentDay = 'issue' | 'last' | number;

export type PrepaymentMode = 'shorten' | 'lower';
export type Frequency = 'week' | 'month' | '2months' | 'quarter' | 'halfyear' | 'year';

export type OneTimePrepayment = {
  id: string;
  kind: 'one-time';
  date: string; // ISO
  amount: number;
  mode: PrepaymentMode;
  allToPrincipal: boolean;
};

export type RecurringPrepayment = {
  id: string;
  kind: 'recurring';
  frequency: Frequency;
  startDate: string;     // ISO
  endDate?: string;      // ISO; undefined → бессрочно (до закрытия кредита)
  amount: number;
  mode: PrepaymentMode;
  allToPrincipal: boolean;
};

export type Prepayment = OneTimePrepayment | RecurringPrepayment;

export type Mortgage = {
  id: string;
  name: string;
  principal: number;
  termMonths: number;
  issueDate: string;          // ISO
  rate: number;               // % годовых
  paymentType: PaymentType;
  paymentDay: PaymentDay;
  prepayments: Prepayment[];
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

export function annuityPayment(principal: number, termMonths: number, ratePct: number): number {
  if (termMonths <= 0 || principal <= 0) return 0;
  const r = ratePct / 12 / 100;
  if (r === 0) return principal / termMonths;
  const pow = Math.pow(1 + r, termMonths);
  return (principal * r * pow) / (pow - 1);
}

function advanceByFrequency(d: Date, f: Frequency): Date {
  const next = new Date(d);
  if (f === 'week') next.setDate(next.getDate() + 7);
  else if (f === 'month') next.setMonth(next.getMonth() + 1);
  else if (f === '2months') next.setMonth(next.getMonth() + 2);
  else if (f === 'quarter') next.setMonth(next.getMonth() + 3);
  else if (f === 'halfyear') next.setMonth(next.getMonth() + 6);
  else if (f === 'year') next.setFullYear(next.getFullYear() + 1);
  return next;
}

type ExpandedEvent = {
  date: string;
  amount: number;
  mode: PrepaymentMode;
  allToPrincipal: boolean;
};

function expandPrepayments(prepayments: Prepayment[], horizon: Date): ExpandedEvent[] {
  const events: ExpandedEvent[] = [];
  for (const pp of prepayments) {
    if (pp.kind === 'one-time') {
      events.push({
        date: pp.date,
        amount: pp.amount,
        mode: pp.mode,
        allToPrincipal: pp.allToPrincipal,
      });
    } else {
      let cur = new Date(pp.startDate);
      const end = pp.endDate ? new Date(pp.endDate) : horizon;
      // safety cap on number of generated events
      const cap = 1000;
      let count = 0;
      while (cur <= end && cur <= horizon && count < cap) {
        events.push({
          date: cur.toISOString(),
          amount: pp.amount,
          mode: pp.mode,
          allToPrincipal: pp.allToPrincipal,
        });
        cur = advanceByFrequency(cur, pp.frequency);
        count++;
      }
    }
  }
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return events;
}

function computePaymentDate(issue: Date, paymentDay: PaymentDay, monthOffset: number): Date {
  if (paymentDay === 'issue') {
    const d = new Date(issue.getFullYear(), issue.getMonth() + monthOffset, issue.getDate());
    return d;
  }
  if (paymentDay === 'last') {
    return new Date(issue.getFullYear(), issue.getMonth() + monthOffset + 1, 0);
  }
  const targetDay = paymentDay as number;
  let d = new Date(issue.getFullYear(), issue.getMonth() + monthOffset, targetDay);
  // fallback на последний день месяца если такого числа нет
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  if (d.getMonth() !== (issue.getMonth() + monthOffset + 12) % 12 || targetDay > daysInMonth) {
    d = new Date(issue.getFullYear(), issue.getMonth() + monthOffset + 1, 0);
  }
  return d;
}

// ─────────────────────────────────────────────
// Симуляция графика
// ─────────────────────────────────────────────

export type ScheduleRow = {
  date: string;
  payment: number;          // регулярный платёж (без досрочки)
  interest: number;
  principalPart: number;
  prepayment: number;       // досрочно в этом месяце
  balance: number;          // остаток после регулярного платежа и досрочки
};

type SimResult = {
  schedule: ScheduleRow[];
  totalRegular: number;
  totalInterest: number;
  totalPrepaid: number;
  monthsTaken: number;
};

function simulateSchedule(mortgage: Mortgage, prepayments: Prepayment[]): SimResult {
  const r = mortgage.rate / 12 / 100;
  let balance = mortgage.principal;

  let A = annuityPayment(mortgage.principal, mortgage.termMonths, mortgage.rate);
  let principalPerMonth = mortgage.principal / mortgage.termMonths;

  const issue = new Date(mortgage.issueDate);
  const horizonYears = Math.max(50, Math.ceil(mortgage.termMonths / 12) * 2);
  const horizon = new Date(issue);
  horizon.setFullYear(horizon.getFullYear() + horizonYears);

  const events = expandPrepayments(prepayments, horizon);
  let eventIdx = 0;

  const schedule: ScheduleRow[] = [];
  let totalRegular = 0;
  let totalInterest = 0;
  let totalPrepaid = 0;

  const safety = mortgage.termMonths * 3 + 36;

  for (let i = 1; i <= safety; i++) {
    if (balance <= 0.01) break;

    const paymentDate = computePaymentDate(issue, mortgage.paymentDay, i);

    // 1) Apply prepayments dated <= paymentDate (in chronological order)
    let prepaymentApplied = 0;
    while (
      eventIdx < events.length &&
      new Date(events[eventIdx].date).getTime() <= paymentDate.getTime()
    ) {
      const ev = events[eventIdx];
      if (new Date(ev.date).getTime() < issue.getTime()) {
        eventIdx++;
        continue;
      }
      const amt = Math.min(ev.amount, balance);
      balance -= amt;
      prepaymentApplied += amt;
      totalPrepaid += amt;

      // Recalculate payment for "lower" mode
      if (ev.mode === 'lower' && balance > 0.01) {
        const remaining = mortgage.termMonths - (i - 1);
        if (remaining > 0) {
          if (mortgage.paymentType === 'annuity') {
            A = annuityPayment(balance, remaining, mortgage.rate);
          } else {
            principalPerMonth = balance / remaining;
          }
        }
      }
      eventIdx++;
    }

    if (balance <= 0.01) {
      // Loan paid off entirely by prepayment(s)
      schedule.push({
        date: paymentDate.toISOString(),
        payment: 0,
        interest: 0,
        principalPart: 0,
        prepayment: prepaymentApplied,
        balance: 0,
      });
      break;
    }

    // 2) Regular payment
    const interest = balance * r;
    let principalPart: number;
    let payment: number;

    if (mortgage.paymentType === 'annuity') {
      principalPart = Math.min(A - interest, balance);
      if (principalPart <= 0) {
        // Платеж не покрывает проценты — выходим, чтобы не зацикливаться
        break;
      }
      payment = principalPart + interest;
    } else {
      principalPart = Math.min(principalPerMonth, balance);
      payment = principalPart + interest;
    }

    balance = Math.max(0, balance - principalPart);
    totalRegular += payment;
    totalInterest += interest;

    schedule.push({
      date: paymentDate.toISOString(),
      payment,
      interest,
      principalPart,
      prepayment: prepaymentApplied,
      balance,
    });
  }

  return {
    schedule,
    totalRegular,
    totalInterest,
    totalPrepaid,
    monthsTaken: schedule.length,
  };
}

// ─────────────────────────────────────────────
// Высокоуровневый расчет
// ─────────────────────────────────────────────

export type CalcResult = {
  schedule: ScheduleRow[];
  initialPayment: number;       // первый ежемесячный платёж
  totalPaid: number;             // сумма всех выплат (регулярные + досрочные)
  totalInterest: number;
  totalPrepaid: number;
  monthsTaken: number;
  payoffDate: string | null;

  // Срез "сегодня"
  currentBalance: number;
  currentPayment: number;
  currentMonthIndex: number;     // сколько месяцев уже прошло
  remainingMonths: number;
  paidPrincipal: number;

  // Сравнение без досрочек
  baseTotalInterest: number;
  baseMonths: number;
  interestSavings: number;
  monthsSaved: number;
};

export function calculate(mortgage: Mortgage, today: Date = new Date()): CalcResult {
  const baseSim = simulateSchedule(mortgage, []);
  const sim = simulateSchedule(mortgage, mortgage.prepayments);

  const initialPayment =
    mortgage.paymentType === 'annuity'
      ? annuityPayment(mortgage.principal, mortgage.termMonths, mortgage.rate)
      : mortgage.principal / mortgage.termMonths +
        (mortgage.principal * (mortgage.rate / 12 / 100));

  let currentBalance = mortgage.principal;
  let currentPayment = initialPayment;
  let currentMonthIndex = 0;
  let paidPrincipal = 0;
  for (const row of sim.schedule) {
    if (new Date(row.date).getTime() > today.getTime()) break;
    currentBalance = row.balance;
    paidPrincipal = mortgage.principal - row.balance;
    currentMonthIndex += 1;
    if (row.payment > 0) currentPayment = row.payment;
  }

  return {
    schedule: sim.schedule,
    initialPayment,
    totalPaid: sim.totalRegular + sim.totalPrepaid,
    totalInterest: sim.totalInterest,
    totalPrepaid: sim.totalPrepaid,
    monthsTaken: sim.monthsTaken,
    payoffDate: sim.schedule.length ? sim.schedule[sim.schedule.length - 1].date : null,
    currentBalance,
    currentPayment,
    currentMonthIndex,
    remainingMonths: Math.max(0, sim.monthsTaken - currentMonthIndex),
    paidPrincipal,
    baseTotalInterest: baseSim.totalInterest,
    baseMonths: baseSim.monthsTaken,
    interestSavings: baseSim.totalInterest - sim.totalInterest,
    monthsSaved: baseSim.monthsTaken - sim.monthsTaken,
  };
}

// ─────────────────────────────────────────────
// Date helpers (DD.MM.YYYY)
// ─────────────────────────────────────────────

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatDateRu(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function parseDateRu(s: string): Date | null {
  const m = s.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return null;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  const d = new Date(yyyy, mm - 1, dd);
  if (
    d.getFullYear() !== yyyy ||
    d.getMonth() !== mm - 1 ||
    d.getDate() !== dd
  ) {
    return null;
  }
  return d;
}

// ─────────────────────────────────────────────
// Константы для UI
// ─────────────────────────────────────────────

export const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'week', label: 'Раз в неделю' },
  { value: 'month', label: 'Раз в месяц' },
  { value: '2months', label: 'Раз в 2 месяца' },
  { value: 'quarter', label: 'Раз в квартал' },
  { value: 'halfyear', label: 'Раз в полгода' },
  { value: 'year', label: 'Раз в год' },
];

export function frequencyLabel(f: Frequency): string {
  return FREQUENCY_OPTIONS.find((x) => x.value === f)?.label ?? f;
}

export function paymentDayLabel(pd: PaymentDay): string {
  if (pd === 'issue') return 'в день выдачи';
  if (pd === 'last') return 'в последний день месяца';
  return `${pd}-го числа`;
}

export const PAYMENT_DAY_OPTIONS: { value: PaymentDay; label: string }[] = [
  { value: 'issue', label: 'В день выдачи' },
  { value: 'last', label: 'Последний день месяца' },
  ...Array.from({ length: 30 }, (_, i) => ({
    value: (i + 1) as PaymentDay,
    label: `${i + 1}-е число`,
  })),
];

export function newPrepaymentId(): string {
  return `pp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function newMortgageId(): string {
  return `mtg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
