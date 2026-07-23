import type { CongestionRecord } from '../types';

interface CongestionDetailCardProps {
  records: CongestionRecord[];
  canSaveFavorite: boolean;
  onSaveFavorite: (record: CongestionRecord) => void;
}

const GATE_LABEL: Record<CongestionRecord['gateType'], string> = {
  arrival: '입국장',
  departure: '출국장',
};

const LABEL_CLASS: Record<CongestionRecord['congestionLabel'], string> = {
  원활: 'congestion-badge congestion-badge--low',
  보통: 'congestion-badge congestion-badge--mid',
  혼잡: 'congestion-badge congestion-badge--high',
};

export function CongestionDetailCard({
  records,
  canSaveFavorite,
  onSaveFavorite,
}: CongestionDetailCardProps) {
  return (
    <section className="detail-grid">
      {records.map((record) => (
        <article key={record.id} className="detail-card">
          <header className="detail-card__header">
            <span className="detail-card__terminal">{record.terminal}</span>
            <span>{GATE_LABEL[record.gateType]}</span>
          </header>

          <p className="detail-card__level">{record.congestionLevel}</p>
          <span className={LABEL_CLASS[record.congestionLabel]}>{record.congestionLabel}</span>

          {canSaveFavorite ? (
            <button type="button" onClick={() => onSaveFavorite(record)}>
              즐겨찾기 저장
            </button>
          ) : (
            <p className="detail-card__login-hint">로그인하면 즐겨찾기에 저장할 수 있습니다.</p>
          )}
        </article>
      ))}
    </section>
  );
}
