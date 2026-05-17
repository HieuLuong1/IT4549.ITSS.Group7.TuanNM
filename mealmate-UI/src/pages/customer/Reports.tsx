import React, { useEffect, useMemo, useState } from "react";
import "./Reports.css";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useAuth } from "@/context/AuthContext";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  fetchCategories,
  fetchReportOverview,
  type CategoryOption,
  type ReportOverview,
  type ReportPoint,
  type TrendItem
} from "@/features/reports/api/reportApi";

const timeTabs = [
  { label: "7 ngày", days: 7 },
  { label: "30 ngày", days: 30 },
  { label: "3 tháng", days: 90 },
  { label: "1 năm", days: 365 },
  { label: "Tùy chọn", days: 30 }
];

const weekdayLabels = ["T.2", "T.3", "Hôm nay", "T.5", "T.6", "T.7", "CN"];

const formatPercent = (value: number) => {
  const rounded = Math.round(value);
  if (rounded === 0) {
    return "0%";
  }
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
};

const formatAbsolutePercent = (value: number) => `${Math.abs(Math.round(value))}%`;

const formatShortDate = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return parsed.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

const buildChartData = (series: ReportPoint[]) =>
  series.map((point) => ({
    date: formatShortDate(point.date),
    value: point.value
  }));

const TimeRangeTabs: React.FC<{
  activeLabel: string;
  onSelect: (label: string) => void;
}> = ({ activeLabel, onSelect }) => {
  return (
    <div className="user-reports-tabs">
      {timeTabs.map((tab) => (
        <button
          key={tab.label}
          className={tab.label === activeLabel ? "active" : ""}
          type="button"
          onClick={() => onSelect(tab.label)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

const CategorySelect: React.FC<{
  categories: CategoryOption[];
  selectedId: number | null;
  onChange: (value: number | null) => void;
}> = ({ categories, selectedId, onChange }) => {
  return (
    <div className="user-reports-select">
      <select
        value={selectedId ?? "all"}
        onChange={(event) => {
          const value = event.target.value;
          onChange(value === "all" ? null : Number(value));
        }}
      >
        <option value="all">Tất cả danh mục</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <span className="caret" />
    </div>
  );
};

const PrimaryButton: React.FC<{ label: string }> = ({ label }) => {
  return (
    <button className="user-reports-primary" type="button">
      <span className="export-icon" />
      {label}
    </button>
  );
};

const SummaryCard: React.FC<{
  purchasedCount: number;
  changePercent: number;
  series: ReportPoint[];
}> = ({ purchasedCount, changePercent, series }) => {
  const chartData = useMemo(() => buildChartData(series), [series]);

  return (
    <div className="user-reports-card">
      <div className="user-reports-card-header">
        <div>
          <div className="user-reports-label">Thực phẩm đã mua</div>
          <div className="user-reports-value">
            <span>{purchasedCount}</span>
            <small>mục</small>
          </div>
        </div>
        <div className="user-reports-chip">
          <span className="arrow" />
          <span>{formatPercent(changePercent)}</span>
        </div>
      </div>
      <div className="user-reports-line-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 16, right: 8, left: 8, bottom: 0 }}>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Tooltip
              cursor={false}
              formatter={(value: number) => [`${value} mục`, ""]}
              labelFormatter={() => ""}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#006B55"
              strokeWidth={2.6}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const TrendCard: React.FC<{ items: TrendItem[] }> = ({ items }) => {
  const chartItems = items.length
    ? items
    : [{ categoryId: null, label: "Chưa có dữ liệu", count: 1, percent: 100, color: "#E4E7ED" }];

  return (
    <div className="user-reports-card">
      <div className="user-reports-card-title">Xu hướng tiêu thụ</div>
      <div className="user-reports-trend">
        <div className="user-reports-donut">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartItems}
                dataKey="count"
                nameKey="label"
                innerRadius={38}
                outerRadius={58}
                paddingAngle={2}
                stroke="none"
              >
                {chartItems.map((item, index) => (
                  <Cell key={`${item.label}-${index}`} fill={item.color || "#006B55"} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <span className="donut-core" />
        </div>
        <div className="user-reports-legend">
          {items.map((item) => (
            <div className="legend-row" key={`${item.label}-${item.categoryId ?? "none"}`}>
              <div className="legend-left">
                <span className="legend-dot" style={{ background: item.color || "#006B55" }} />
                <span>{item.label}</span>
              </div>
              <strong>{`${Math.round(item.percent)}%`}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WasteCard: React.FC<{
  expiredCount: number;
  changePercent: number;
  note: string;
}> = ({ expiredCount, changePercent, note }) => {
  const prefix = changePercent > 0 ? "Tăng" : changePercent < 0 ? "Giảm" : "Không đổi";

  return (
    <div className="user-reports-card waste">
      <div className="user-reports-card-header">
        <div className="user-reports-card-title">Lãng phí</div>
        <div className="waste-icon" />
      </div>
      <div className="waste-body">
        <div className="waste-count">
          <span className="waste-number">{String(expiredCount).padStart(2, "0")}</span>
          <span className="waste-label">sản phẩm đã hết hạn</span>
        </div>
        <div className="waste-bar">
          <div className="waste-bar-fill" />
        </div>
        <p className="waste-note">
          {prefix} <span>{formatAbsolutePercent(changePercent)}</span> so với kỳ trước. {note}
        </p>
      </div>
    </div>
  );
};

const DetailChart: React.FC<{
  purchaseSeries: ReportPoint[];
  usedSeries: ReportPoint[];
  expiredSeries: ReportPoint[];
}> = ({ purchaseSeries, usedSeries, expiredSeries }) => {
  const [activeTab, setActiveTab] = useState<"purchase" | "used" | "expired">("purchase");
  const currentSeries = useMemo(() => {
    if (activeTab === "used") {
      return usedSeries;
    }
    if (activeTab === "expired") {
      return expiredSeries;
    }
    return purchaseSeries;
  }, [activeTab, expiredSeries, purchaseSeries, usedSeries]);

  const latestPoint = currentSeries[currentSeries.length - 1];
  const chartData = useMemo(() => buildChartData(currentSeries), [currentSeries]);

  return (
    <div className="user-reports-detail">
      <div className="detail-header">
        <div>
          <h2>Phân tích chi tiết</h2>
          <p>Chu kỳ nhập và xuất thực phẩm định kỳ</p>
        </div>
        <div className="detail-tabs">
          <button
            className={activeTab === "purchase" ? "active" : ""}
            type="button"
            onClick={() => setActiveTab("purchase")}
          >
            Mua vào
          </button>
          <button
            className={activeTab === "used" ? "active" : ""}
            type="button"
            onClick={() => setActiveTab("used")}
          >
            Tiêu thụ
          </button>
          <button
            className={activeTab === "expired" ? "active" : ""}
            type="button"
            onClick={() => setActiveTab("expired")}
          >
            Hết hạn
          </button>
        </div>
      </div>
      <div className="detail-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Tooltip
              formatter={(value: number) => [`${value} mục`, ""]}
              labelFormatter={(label) => label}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#006B55"
              strokeWidth={2.6}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="detail-tooltip">
          <div>{latestPoint ? formatShortDate(latestPoint.date) : "--"}</div>
          <div className="detail-tooltip-value">
            <span className="dot" />
            <span>{latestPoint ? `${latestPoint.value} mục` : "0 mục"}</span>
          </div>
        </div>
      </div>
      <div className="detail-weekdays">
        {weekdayLabels.map((label) => (
          <span key={label} className={label === "Hôm nay" ? "active" : ""}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedTab, setSelectedTab] = useState(timeTabs[1].label);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [report, setReport] = useState<ReportOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { from, to } = useMemo(() => {
    const tabConfig = timeTabs.find((tab) => tab.label === selectedTab) || timeTabs[1];
    const today = new Date();
    const toDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const fromDate = new Date(toDate);
    fromDate.setUTCDate(fromDate.getUTCDate() - (tabConfig.days - 1));

    return {
      from: fromDate.toISOString().slice(0, 10),
      to: toDate.toISOString().slice(0, 10)
    };
  }, [selectedTab]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch {
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (!user?.userId) {
      return;
    }

    const loadReport = async () => {
      setIsLoading(true);
      try {
        const data = await fetchReportOverview({
          from,
          to,
          userId: user.userId,
          categoryId: selectedCategoryId ?? undefined
        });
        setReport(data);
      } catch {
        setReport(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [from, selectedCategoryId, to, user?.userId]);

  const trendItems = report?.trend.items ?? [];
  const summary = report?.summary;
  const waste = report?.waste;
  const detail = report?.detail;

  return (
    <div className="user-reports">
      <div className="user-reports-layout">
        <Sidebar />
        <div className="user-reports-page">
          <Topbar title="Báo cáo thống kê" showSearch={false} />

          <div className="user-reports-content">
            <div className="user-reports-toolbar">
              <TimeRangeTabs activeLabel={selectedTab} onSelect={setSelectedTab} />
              <div className="user-reports-actions">
                <CategorySelect
                  categories={categories}
                  selectedId={selectedCategoryId}
                  onChange={setSelectedCategoryId}
                />
                <PrimaryButton label="Xuất báo cáo" />
              </div>
            </div>

            <div className="user-reports-summary">
              <SummaryCard
                purchasedCount={summary?.purchasedCount ?? 0}
                changePercent={summary?.changePercent ?? 0}
                series={summary?.series ?? []}
              />
              <TrendCard items={trendItems} />
              <WasteCard
                expiredCount={waste?.expiredCount ?? 0}
                changePercent={waste?.changePercent ?? 0}
                note={waste?.note ?? ""}
              />
            </div>

            <DetailChart
              purchaseSeries={detail?.purchaseSeries ?? []}
              usedSeries={detail?.usedSeries ?? []}
              expiredSeries={detail?.expiredSeries ?? []}
            />
            {isLoading && <div className="user-reports-loading">Đang tải dữ liệu...</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
