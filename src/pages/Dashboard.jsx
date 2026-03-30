import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/lib/Utils";
import { Trophy, Puzzle, Bot } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
} from "recharts";

const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [themePerformance, setThemePerformance] = useState([]);
  const [themePerformanceLoading, setThemePerformanceLoading] = useState(true);
  const [solveSummary, setSolveSummary] = useState(null);
  const [hintMistakeSummary, setHintMistakeSummary] = useState(null);
  const [solveTimeVsRating, setSolveTimeVsRating] = useState([]);
  const [solveTimeVsRatingLoading, setSolveTimeVsRatingLoading] = useState(true);

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const [userRes, themeRes, summaryRes, hintMistakeRes, solveTimeRes] = await Promise.all([
          fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/puzzle/theme-performance`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/puzzle/solve-summary`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/puzzle/hint-mistake-summary`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/puzzle/solve-time-vs-rating`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (userRes.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const userData = await userRes.json();
        setUser(userData);

        if (themeRes.ok) {
          const themeData = await themeRes.json();
          setThemePerformance(Array.isArray(themeData?.themes) ? themeData.themes : []);
        } else {
          setThemePerformance([]);
        }

        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          setSolveSummary(summaryData);
        } else {
          setSolveSummary(null);
        }

        if (hintMistakeRes.ok) {
          const hmData = await hintMistakeRes.json();
          setHintMistakeSummary(hmData);
        } else {
          setHintMistakeSummary(null);
        }

        if (solveTimeRes.ok) {
          const stData = await solveTimeRes.json();
          const points = Array.isArray(stData?.points) ? stData.points : [];
          setSolveTimeVsRating(
            points
              .map((p) => ({
                rating: Number(p.rating),
                solveTimeSeconds: Number(p.solveTimeSeconds),
              }))
              .filter(
                (p) =>
                  Number.isFinite(p.rating) &&
                  Number.isFinite(p.solveTimeSeconds) &&
                  p.solveTimeSeconds >= 0
              )
          );
        } else {
          setSolveTimeVsRating([]);
        }
      } catch (err) {
        console.error(err);
        navigate("/login");
      } finally {
        setLoading(false);
        setThemePerformanceLoading(false);
        setSolveTimeVsRatingLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="mixed-app-bg min-h-screen flex items-center justify-center text-slate-800">
        <p className="text-lg animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  const formatSeconds = (seconds) => {
    if (seconds === null || seconds === undefined) return "—";
    const total = Number(seconds);
    if (!Number.isFinite(total)) return "—";
    const m = Math.floor(total / 60).toString().padStart(2, "0");
    const s = Math.floor(total % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const puzzleAccuracy =
    user.total_puzzles > 0
      ? ((user.solved_puzzles / user.total_puzzles) * 100).toFixed(1)
      : 0;

  const aiAccuracy =
    user.total_ai_games > 0
      ? ((user.ai_games_won / user.total_ai_games) * 100).toFixed(1)
      : 0;

  const elo = user.elo || 1200;

  const rank =
    elo < 1000
      ? "Beginner"
      : elo < 1400
      ? "Intermediate"
      : elo < 1800
      ? "Advanced"
      : "Master";

  const puzzleChartData = [
    { name: "Solved", value: user.solved_puzzles },
    { name: "Unsolved", value: user.total_puzzles - user.solved_puzzles },
  ];

  const aiChartData = [
    { name: "Wins", value: user.ai_games_won },
    { name: "Losses", value: user.total_ai_games - user.ai_games_won },
  ];

  const donutDataRaw = hintMistakeSummary
    ? [
        { name: "Solved cleanly", value: hintMistakeSummary.solvedCleanly },
        { name: "Hints used", value: hintMistakeSummary.hintOnly },
        { name: "Mistakes made", value: hintMistakeSummary.mistakesMade },
      ]
    : [];

  const donutData = donutDataRaw.filter((d) => (d?.value ?? 0) > 0);

  const donutColors = [
    "var(--color-blue-700)",
    "var(--color-amber-500)",
    "var(--color-red-600)",
  ];

  const donutTotal = donutDataRaw.reduce((sum, d) => sum + (Number(d?.value) || 0), 0);

  const donutLegend = donutDataRaw.map((d, index) => {
    const value = Number(d?.value) || 0;
    const pct = donutTotal > 0 ? (value / donutTotal) * 100 : 0;
    return {
      name: d.name,
      value,
      pct: Number.isFinite(pct) ? pct : 0,
      color: donutColors[index % donutColors.length],
    };
  });

  const themeStackedData = themePerformance.map((t) => ({
    themeLabel: isMobile ? t.theme : `${t.theme} (${t.solvePercent}%)`,
    playedCount: t.playedCount,
    solvedCount: t.solvedCount,
    unsolvedCount: t.unsolvedCount,
    solvePercent: t.solvePercent,
  }));

  const themeChartHeight = Math.max(260, themeStackedData.length * (isMobile ? 44 : 32));
  const yAxisWidth = isMobile ? 90 : 160;
  const chartMarginLeft = isMobile ? 0 : 90;

  const statCards = [
    { label: "Puzzles Solved", value: `${user.solved_puzzles} / ${user.total_puzzles}` },
    { label: "AI Wins", value: `${user.ai_games_won} / ${user.total_ai_games}` },
    { label: "ELO Rating", value: `${elo} (${rank})` },
    { label: "Puzzle Accuracy", value: `${puzzleAccuracy}%` },
    { label: "Avg. Puzzle Solve Time", value: formatSeconds(solveSummary?.averageSolveTimeSeconds) },
    { label: "Fastest Puzzle Solve", value: formatSeconds(solveSummary?.fastestSolveTimeSeconds) },
    { label: "Highest Rated Puzzle Solved", value: `${solveSummary?.highestRatedPuzzleSolved?.rating ?? "—"}` },
    { label: "AI Win Rate", value: `${aiAccuracy}%` },
  ];

  return (
    <div className="mixed-app-bg min-h-screen p-6 text-gray-800">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-wide">
          Welcome back, <span className="text-blue-700">{user.username}</span>
        </h1>
        <p className="text-gray-600 mt-1">Track your chess progress and performance</p>
      </div>

      {/* Stats cards */}
      <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Your Stats</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 p-4 shadow-sm"
            >
              <div className="text-xs uppercase tracking-wider text-gray-500">{s.label}</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-md border border-white/60 p-4 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-2 text-gray-700 flex items-center gap-2">
            <Puzzle size={18} /> Puzzle Games
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={puzzleChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="var(--color-blue-700)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-white/60 p-4 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-2 text-gray-700 flex items-center gap-2">
            <Bot size={18} /> AI Games
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={aiChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="var(--color-gray-700)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white/70 backdrop-blur-md border border-white/60 p-4 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-2 text-gray-700 flex items-center gap-2">
            <Trophy size={18} /> Puzzle Solve Breakdown
          </h3>

          {!hintMistakeSummary ? (
            <div className="text-sm text-gray-600">Solve some puzzles to see this breakdown.</div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-stretch">
              <div className="w-full md:w-1/2">
                <div className="h-65">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData.length > 0 ? donutData : [{ name: "No data", value: 1 }]}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={105}
                        paddingAngle={4}
                        cornerRadius={6}
                        labelLine={false}
                        label={false}
                      >
                        {(donutData.length > 0 ? donutData : [{ name: "No data", value: 1 }]).map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${entry.name}-${index}`}
                              fill={
                                donutData.length > 0
                                  ? donutColors[index % donutColors.length]
                                  : "var(--color-gray-300)"
                              }
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => {
                          const v = Number(value) || 0;
                          const pct = donutTotal > 0 ? (v / donutTotal) * 100 : 0;
                          const pctLabel = Number.isFinite(pct) ? `${pct.toFixed(1)}%` : "0.0%";
                          return [`${v} (${pctLabel})`, name];
                        }}
                        contentStyle={{ borderRadius: 12 }}
                      />
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-gray-800"
                        style={{ fontSize: 14, fontWeight: 600 }}
                      >
                        {hintMistakeSummary.totalSolved}
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2">
                  {donutLegend.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-sm text-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-sm"
                          style={{ backgroundColor: item.color }}
                          aria-hidden="true"
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="tabular-nums text-gray-800">
                        {item.value}{" "}
                        <span className="text-gray-500">({item.pct.toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-wider text-gray-500">
                    Total puzzles solved
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">
                    {hintMistakeSummary.totalSolved}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-wider text-gray-500">Hints used</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">
                    {hintMistakeSummary.hintOnly}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-wider text-gray-500">
                    Mistakes made
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">
                    {hintMistakeSummary.mistakesMade}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-wider text-gray-500">
                    Solved cleanly
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">
                    {hintMistakeSummary.solvedCleanly}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">No hint, no mistake</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white/70 backdrop-blur-md border border-white/60 p-4 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-2 text-gray-700 flex items-center gap-2">
            <Puzzle size={18} /> Solve Time vs Puzzle Rating
          </h3>

          {solveTimeVsRatingLoading ? (
            <div className="text-sm text-gray-600">Loading solve time chart...</div>
          ) : solveTimeVsRating.length === 0 ? (
            <div className="text-sm text-gray-600">Solve some puzzles to see this chart.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  type="number"
                  dataKey="rating"
                  name="Rating"
                  allowDecimals={false}
                  domain={[500, "dataMax"]}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  label={
                    isMobile
                      ? undefined
                      : { value: "Puzzle rating", position: "insideBottom", offset: -10 }
                  }
                />
                <YAxis
                  type="number"
                  dataKey="solveTimeSeconds"
                  name="Solve time"
                  allowDecimals={false}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  label={
                    isMobile
                      ? undefined
                      : { value: "Solve time (seconds)", angle: -90, position: "insideLeft" }
                  }
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const p = payload[0]?.payload;
                    if (!p) return null;
                    return (
                      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                        <div className="text-sm font-semibold text-gray-800 mb-1">Puzzle</div>
                        <div className="text-xs text-gray-700">Rating: {p.rating}</div>
                        <div className="text-xs text-gray-700">
                          Solve time: {formatSeconds(p.solveTimeSeconds)}
                        </div>
                      </div>
                    );
                  }}
                />
                <Scatter name="Solves" data={solveTimeVsRating} fill="var(--color-blue-700)" />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="lg:col-span-2 bg-white/70 backdrop-blur-md border border-white/60 p-4 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-2 text-gray-700 flex items-center gap-2">
            <Puzzle size={18} /> Puzzle Performance By Theme
          </h3>

          {themePerformanceLoading ? (
            <div className="text-sm text-gray-600">Loading theme performance...</div>
          ) : themeStackedData.length === 0 ? (
            <div className="text-sm text-gray-600">
              Play some puzzles to see theme performance.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={themeChartHeight}>
              <BarChart
                data={themeStackedData}
                layout="vertical"
                margin={{ left: chartMarginLeft, right: 20, top: 10, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  label={
                    isMobile
                      ? undefined
                      : { value: "Total games played", position: "insideBottom", offset: -10 }
                  }
                />
                <YAxis
                  type="category"
                  dataKey="themeLabel"
                  width={yAxisWidth}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <Legend verticalAlign="top" align="center" />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const row = payload[0]?.payload;
                    if (!row) return null;
                    return (
                      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                        <div className="text-sm font-semibold text-gray-800 mb-1">{label}</div>
                        <div className="text-xs text-gray-700">Played: {row.playedCount}</div>
                        <div className="text-xs text-gray-700">Solved: {row.solvedCount}</div>
                        <div className="text-xs text-gray-700">Unsolved: {row.unsolvedCount}</div>
                        <div className="text-xs text-gray-700">Solve %: {row.solvePercent}%</div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="solvedCount"
                  name="Solved"
                  stackId="a"
                  fill="var(--color-blue-700)"
                />
                <Bar
                  dataKey="unsolvedCount"
                  name="Unsolved"
                  stackId="a"
                  fill="var(--color-gray-400)"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;