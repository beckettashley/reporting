"use client"

interface Product {
  name: string
  logo?: string
  color?: string
}

interface Metric {
  label: string
  emoji?: string
  values: (string | boolean | number)[]
}

interface ProductComparisonProps {
  products: Product[]
  metrics: Metric[]
  className?: string
}

export function ProductComparison({ products, metrics, className = "" }: ProductComparisonProps) {
  if (products.length === 0 || metrics.length === 0) {
    return <div className="p-4 text-sm text-muted-foreground">Add products and metrics to display comparison</div>
  }

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <div className="inline-grid gap-0 min-w-full md:w-full" style={{ gridTemplateColumns: `160px repeat(${products.length}, 1fr)` }}>
        {/* Header Row */}
        <div className="col-span-1 sticky left-0 z-10" />
        {products.map((product, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center p-3 md:p-4 border-b border-border bg-muted/30"
          >
            {product.logo && (
              <img src={product.logo} alt={product.name} className="h-6 md:h-8 object-contain mb-2" />
            )}
            <p className="text-xs md:text-sm font-semibold text-center text-foreground">{product.name}</p>
          </div>
        ))}

        {/* Metric Rows */}
        {metrics.map((metric, metricIdx) => (
          <div key={metricIdx} className="contents">
            {/* Metric Label */}
            <div className="sticky left-0 z-10 flex items-center gap-2 p-3 md:p-4 border-b border-r border-border bg-background">
              {metric.emoji && <span className="text-base md:text-lg">{metric.emoji}</span>}
              <p className="text-xs md:text-sm font-medium text-foreground">{metric.label}</p>
            </div>

            {/* Metric Values */}
            {products.map((product, productIdx) => {
              const value = metric.values[productIdx]
              return (
                <div
                  key={`${metricIdx}-${productIdx}`}
                  className="flex items-center justify-center p-3 md:p-4 border-b border-border min-h-14 bg-background"
                >
                  <div className="text-center">
                    {typeof value === "boolean" ? (
                      <span className="text-lg">{value ? "✓" : "✗"}</span>
                    ) : (
                      <p className="text-xs md:text-sm text-foreground">{value}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
