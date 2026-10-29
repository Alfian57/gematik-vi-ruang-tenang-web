import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  MessageCircle,
} from "lucide-react";
import { DashboardStats } from "@/types/admin";

interface AdminStatsCardsProps {
  stats: DashboardStats;
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const cards = [
    {
      label: "Total Pengguna",
      value: stats.users.total.toLocaleString(),
      icon: Users,
      trend: {
        isPositive: stats.users.growth >= 0,
        text: `${stats.users.growth >= 0 ? "+" : ""}${stats.users.growth.toFixed(1)}% bulan ini`,
      },
      chartData: stats.users.chart_data,
    },
    {
      label: "Total Artikel",
      value: stats.articles.total.toLocaleString(),
      icon: FileText,
      subtitle: `+${stats.articles.this_month} bulan ini`,
    },
    {
      label: "Sesi Chat",
      value: stats.chat_sessions.total.toLocaleString(),
      icon: MessageCircle,
      subtitle: `+${stats.chat_sessions.today} hari ini`,
      chartData: stats.chat_sessions.chart_data,
    },
    {
      label: "Total Pesan",
      value: stats.messages.total.toLocaleString(),
      icon: MessageCircle,
      subtitle: `+${stats.messages.today} hari ini`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const maxChartVal =
          card.chartData && card.chartData.length > 0
            ? Math.max(...card.chartData, 1)
            : 1;

        return (
          <Card
            key={card.label}
            className="rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            <CardContent className="p-3.5 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground truncate">
                  {card.label}
                </span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
              </div>

              <div className="mt-1.5 flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                    {card.value}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] sm:text-xs">
                    {card.trend ? (
                      <>
                        {card.trend.isPositive ? (
                          <TrendingUp className="w-3.5 h-3.5 text-primary shrink-0" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        )}
                        <span
                          className={`truncate font-medium ${
                            card.trend.isPositive ? "text-primary" : "text-red-500"
                          }`}
                        >
                          {card.trend.text}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground truncate">
                        {card.subtitle}
                      </span>
                    )}
                  </div>
                </div>

                {card.chartData && card.chartData.length > 0 && (
                  <div
                    className="flex items-end gap-1 h-7 w-16 shrink-0 mb-0.5"
                    aria-hidden="true"
                  >
                    {card.chartData.map((value, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-colors"
                        style={{
                          height: `${Math.max(
                            15,
                            (value / maxChartVal) * 100
                          )}%`,
                        }}
                        title={`${value}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
