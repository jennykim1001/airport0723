import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CongestionRecord } from '../types';

interface CongestionTrendChartProps {
  records: CongestionRecord[];
}

interface TrendPoint {
  time: string;
  'T1 입국': number | null;
  'T1 출국': number | null;
  'T2 입국': number | null;
  'T2 출국': number | null;
}

const SERIES_KEY: Record<string, keyof Omit<TrendPoint, 'time'>> = {
  'T1-arrival': 'T1 입국',
  'T1-departure': 'T1 출국',
  'T2-arrival': 'T2 입국',
  'T2-departure': 'T2 출국',
};

// 하루 전체 시간대에 대해 T1/T2 x 입국·출국 4개 라인으로 혼잡도 변화를 보여준다.
export function CongestionTrendChart({ records }: CongestionTrendChartProps) {
  const chartData = useMemo(() => {
    const byTime = new Map<string, TrendPoint>();

    records.forEach((record) => {
      const point = byTime.get(record.time) ?? {
        time: record.time,
        'T1 입국': null,
        'T1 출국': null,
        'T2 입국': null,
        'T2 출국': null,
      };
      const key = SERIES_KEY[`${record.terminal}-${record.gateType}`];
      point[key] = record.congestionLevel;
      byTime.set(record.time, point);
    });

    return Array.from(byTime.values()).sort((a, b) => a.time.localeCompare(b.time));
  }, [records]);

  return (
    <section className="trend-chart">
      <h2>시간대별 혼잡도 추이</h2>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="time" stroke="var(--chart-text)" tick={{ fill: 'var(--chart-text)' }} />
          <YAxis stroke="var(--chart-text)" tick={{ fill: 'var(--chart-text)' }} />
          <Tooltip
            contentStyle={{ background: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-grid)' }}
            labelStyle={{ color: 'var(--chart-text)' }}
            itemStyle={{ color: 'var(--chart-text)' }}
          />
          <Legend wrapperStyle={{ color: 'var(--chart-text)' }} />
          <Line type="monotone" dataKey="T1 입국" stroke="var(--chart-t1)" strokeWidth={2} dot={false} />
          <Line
            type="monotone"
            dataKey="T1 출국"
            stroke="var(--chart-t1)"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
          />
          <Line type="monotone" dataKey="T2 입국" stroke="var(--chart-t2)" strokeWidth={2} dot={false} />
          <Line
            type="monotone"
            dataKey="T2 출국"
            stroke="var(--chart-t2)"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
