import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CongestionRecord } from '../types';

interface TerminalCompareChartProps {
  records: CongestionRecord[];
}

const GATE_LABEL: Record<CongestionRecord['gateType'], string> = {
  arrival: '입국장',
  departure: '출국장',
};

// 선택한 날짜·시간 하나에 대해 입국장/출국장 별로 T1 vs T2 인원을 비교한다.
export function TerminalCompareChart({ records }: TerminalCompareChartProps) {
  const chartData = useMemo(() => {
    const byGate = new Map<string, { gate: string; T1: number; T2: number }>();

    records.forEach((record) => {
      const gate = GATE_LABEL[record.gateType];
      const entry = byGate.get(gate) ?? { gate, T1: 0, T2: 0 };
      entry[record.terminal] = record.congestionLevel;
      byGate.set(gate, entry);
    });

    return Array.from(byGate.values());
  }, [records]);

  return (
    <section className="compare-chart">
      <h2>터미널별 비교 (선택한 시간대)</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="gate" stroke="var(--chart-text)" tick={{ fill: 'var(--chart-text)' }} />
          <YAxis stroke="var(--chart-text)" tick={{ fill: 'var(--chart-text)' }} />
          <Tooltip
            contentStyle={{ background: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-grid)' }}
            labelStyle={{ color: 'var(--chart-text)' }}
            itemStyle={{ color: 'var(--chart-text)' }}
          />
          <Legend wrapperStyle={{ color: 'var(--chart-text)' }} />
          <Bar dataKey="T1" fill="var(--chart-t1)" name="T1" />
          <Bar dataKey="T2" fill="var(--chart-t2)" name="T2" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
