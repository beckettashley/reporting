'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { TYPE_COLOR, type MetricType } from '../data';
import { cn } from '@/lib/utils';

export type MetricNodeData = {
  label: string;
  type: MetricType;
  filtered?: boolean;
  highlighted?: boolean;
  dimmed?: boolean;
};

export type SectionGroupNodeData = {
  label: string;
};

export const CARD_W = 184;
export const CARD_H = 56;
export const CARD_GAP = 16;
export const SECTION_PAD = 16;
export const SECTION_HEADER_H = 36;

const TYPE_LABEL: Record<MetricType, string> = {
  result: 'Result',
  actionable: 'Actionable',
  diagnostic: 'Diagnostic',
  cost: 'Costs',
};

export function MetricNode({ data, selected }: NodeProps & { data: MetricNodeData }) {
  const color = TYPE_COLOR[data.type];

  return (
    <div
      className={cn(
        'group relative flex h-full w-full cursor-grab select-none flex-col justify-between rounded-[5px] bg-white px-2 py-1.5 transition-opacity active:cursor-grabbing',
        data.filtered && 'opacity-10',
        data.dimmed && !data.filtered && 'opacity-25',
      )}
      style={{
        border: `1.5px solid ${color.border}`,
        boxShadow: selected
          ? `0 0 0 2px ${color.border}40, 0 1px 3px rgba(0,0,0,0.08)`
          : '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-1.5 !w-1.5 !border-0 !bg-transparent"
        isConnectable={false}
      />

      <div className="flex flex-1 items-center justify-center px-1 text-center text-[11px] font-medium leading-[1.15] text-slate-900">
        {data.label}
      </div>

      <div className="flex">
        <div
          className="inline-flex w-fit items-center gap-1 rounded-[3px] px-[5px] py-[2px] text-[8.5px] font-semibold leading-none tracking-tight"
          style={{ backgroundColor: color.chip, color: color.text }}
        >
          <span
            className="inline-block h-[6px] w-[6px] rounded-[1px]"
            style={{ backgroundColor: color.border }}
          />
          {TYPE_LABEL[data.type]}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-1.5 !w-1.5 !border-0 !bg-transparent"
        isConnectable={false}
      />
    </div>
  );
}

export function SectionGroupNode({ data }: NodeProps & { data: SectionGroupNodeData }) {
  return (
    <div className="relative h-full w-full cursor-grab rounded-[6px] border border-slate-200 bg-white active:cursor-grabbing">
      <div className="absolute left-[14px] top-[10px] text-[13px] font-bold leading-none tracking-[-0.01em] text-slate-900">
        {data.label}
      </div>
    </div>
  );
}

export const nodeTypes = {
  metric: MetricNode,
  section: SectionGroupNode,
};
