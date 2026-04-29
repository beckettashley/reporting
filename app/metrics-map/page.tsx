'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  type Node,
  type Edge as RFEdge,
  type NodeMouseHandler,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { domains, metrics, edges, TYPE_COLOR, TYPE_DESC, type MetricType } from './data';
import { computeLayout } from './compute-layout';
import {
  nodeTypes,
  CARD_W,
  CARD_H,
  type MetricNodeData,
  type SectionGroupNodeData,
} from './components/nodes';
import { cn } from '@/lib/utils';

type FilterType = 'all' | MetricType;

const TYPE_PILLS: { type: FilterType; label: string; color?: string }[] = [
  { type: 'all', label: 'All' },
  { type: 'result', label: 'Result', color: TYPE_COLOR.result.border },
  { type: 'actionable', label: 'Actionable', color: TYPE_COLOR.actionable.border },
  { type: 'diagnostic', label: 'Diagnostic', color: TYPE_COLOR.diagnostic.border },
  { type: 'cost', label: 'Cost', color: TYPE_COLOR.cost.border },
];

function MetricsMap() {
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');

  const sections = useMemo(() => computeLayout(), []);

  // Build the set of edges adjacent to the selected metric
  const adjacentEdgeIds = useMemo(() => {
    if (!selectedMetricId) return new Set<string>();
    const set = new Set<string>();
    edges.forEach(([s, t]) => {
      if (s === selectedMetricId || t === selectedMetricId) {
        set.add(`${s}__${t}`);
      }
    });
    return set;
  }, [selectedMetricId]);

  const adjacentMetricIds = useMemo(() => {
    if (!selectedMetricId) return new Set<string>();
    const set = new Set<string>([selectedMetricId]);
    edges.forEach(([s, t]) => {
      if (s === selectedMetricId) set.add(t);
      if (t === selectedMetricId) set.add(s);
    });
    return set;
  }, [selectedMetricId]);

  const metricById = useMemo(() => {
    const m = new Map<string, (typeof metrics)[number]>();
    metrics.forEach((metric) => m.set(metric.id, metric));
    return m;
  }, []);

  const nodes: Node[] = useMemo(() => {
    const result: Node[] = [];

    sections.forEach((section) => {
      result.push({
        id: section.id,
        type: 'section',
        position: { x: section.x, y: section.y },
        data: { label: section.domain.label } satisfies SectionGroupNodeData,
        style: { width: section.width, height: section.height },
        selectable: false,
        draggable: true,
      });

      section.metrics.forEach(({ metric, x, y }) => {
        const isFiltered = filterType !== 'all' && metric.type !== filterType;
        const isDimmed =
          selectedMetricId !== null && !adjacentMetricIds.has(metric.id);

        result.push({
          id: metric.id,
          type: 'metric',
          parentId: section.id,
          extent: 'parent',
          position: { x, y },
          data: {
            label: metric.label,
            type: metric.type,
            filtered: isFiltered,
            dimmed: isDimmed,
          } satisfies MetricNodeData,
          style: { width: CARD_W, height: CARD_H },
          selectable: true,
          draggable: true,
          selected: metric.id === selectedMetricId,
        });
      });
    });

    return result;
  }, [sections, selectedMetricId, adjacentMetricIds, filterType]);

  const flowEdges: RFEdge[] = useMemo(() => {
    return edges.map(([s, t]) => {
      const id = `${s}__${t}`;
      const isHighlighted = adjacentEdgeIds.has(id);
      const sourceMetric = metricById.get(s);
      const targetMetric = metricById.get(t);

      const sourceFiltered =
        filterType !== 'all' && sourceMetric && sourceMetric.type !== filterType;
      const targetFiltered =
        filterType !== 'all' && targetMetric && targetMetric.type !== filterType;
      const isFiltered = Boolean(sourceFiltered || targetFiltered);

      const isDimmed =
        selectedMetricId !== null && !adjacentEdgeIds.has(id);

      return {
        id,
        source: s,
        target: t,
        type: 'smoothstep',
        style: {
          stroke: isHighlighted ? '#0f172a' : '#94a3b8',
          strokeWidth: isHighlighted ? 1.8 : 1,
          opacity: isFiltered ? 0.08 : isDimmed ? 0.2 : 0.55,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isHighlighted ? '#0f172a' : '#94a3b8',
          width: 14,
          height: 14,
        },
      };
    });
  }, [adjacentEdgeIds, selectedMetricId, filterType, metricById]);

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    if (node.type === 'metric') {
      setSelectedMetricId((prev) => (prev === node.id ? null : node.id));
    }
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedMetricId(null);
  }, []);

  const selectedMetric = selectedMetricId ? metricById.get(selectedMetricId) : null;
  const selectedDomain = selectedMetric
    ? domains.find((d) => d.id === selectedMetric.parent)
    : null;
  const incoming = selectedMetricId
    ? edges
        .filter(([, t]) => t === selectedMetricId)
        .map(([s]) => metricById.get(s))
        .filter((m): m is NonNullable<typeof m> => Boolean(m))
    : [];
  const outgoing = selectedMetricId
    ? edges
        .filter(([s]) => s === selectedMetricId)
        .map(([, t]) => metricById.get(t))
        .filter((m): m is NonNullable<typeof m> => Boolean(m))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b bg-white px-5 py-3">
        <div>
          <h1 className="text-base font-semibold text-slate-900">
            Reporting Metrics — Source Map
          </h1>
          <p className="text-xs text-slate-500">
            Interactive transcription of <code>docs/Reporting Metrics 2026.pdf</code>. Click a card for detail; arrows show direct impact.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Filter:</span>
          {TYPE_PILLS.map((pill) => (
            <button
              key={pill.type}
              onClick={() => setFilterType(pill.type)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors',
                filterType === pill.type
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400',
              )}
            >
              {pill.color ? (
                <span
                  className="inline-block h-2 w-2 rounded-sm"
                  style={{ backgroundColor: pill.color }}
                />
              ) : null}
              {pill.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
            fitViewOptions={{ padding: 0.1 }}
            minZoom={0.15}
            maxZoom={2}
            nodesDraggable
            nodesConnectable={false}
            elementsSelectable
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={24} size={1} color="#e2e8f0" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        <aside className="flex w-[340px] flex-col overflow-y-auto border-l bg-white p-5">
          {selectedMetric ? (
            <>
              <h2 className="text-base font-semibold text-slate-900">
                {selectedMetric.label}
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: TYPE_COLOR[selectedMetric.type].chip,
                    color: TYPE_COLOR[selectedMetric.type].text,
                  }}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-sm"
                    style={{ backgroundColor: TYPE_COLOR[selectedMetric.type].border }}
                  />
                  {selectedMetric.type}
                </span>
                {selectedDomain ? (
                  <span className="text-xs text-slate-500">{selectedDomain.label}</span>
                ) : null}
              </div>

              <section className="mt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Definition
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                  {selectedMetric.desc}
                </p>
              </section>

              <section className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type meaning
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                  {TYPE_DESC[selectedMetric.type]}
                </p>
              </section>

              {incoming.length > 0 ? (
                <section className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Fed by ({incoming.length})
                  </h3>
                  <ul className="mt-1.5 space-y-1">
                    {incoming.map((m) => (
                      <li key={m.id}>
                        <button
                          onClick={() => setSelectedMetricId(m.id)}
                          className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-sm text-slate-700 hover:bg-slate-100"
                        >
                          <span className="text-slate-400">←</span>
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-sm"
                            style={{ backgroundColor: TYPE_COLOR[m.type].border }}
                          />
                          {m.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {outgoing.length > 0 ? (
                <section className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Feeds into ({outgoing.length})
                  </h3>
                  <ul className="mt-1.5 space-y-1">
                    {outgoing.map((m) => (
                      <li key={m.id}>
                        <button
                          onClick={() => setSelectedMetricId(m.id)}
                          className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-sm text-slate-700 hover:bg-slate-100"
                        >
                          <span className="text-slate-400">→</span>
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-sm"
                            style={{ backgroundColor: TYPE_COLOR[m.type].border }}
                          />
                          {m.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          ) : (
            <div className="text-sm text-slate-500">
              <p className="font-medium text-slate-700">
                Click a metric for detail.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-slate-500">
                <li>• Each card is a metric, color-coded by type.</li>
                <li>• Each box is a domain from the source PDF.</li>
                <li>• Arrows show direct impact.</li>
                <li>• Use the filter pills to isolate by type.</li>
                <li>• Pan and zoom with the canvas controls.</li>
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default function MetricsMapPage() {
  return (
    <ReactFlowProvider>
      <MetricsMap />
    </ReactFlowProvider>
  );
}
