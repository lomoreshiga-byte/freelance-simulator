"use client";

import React, { useState, useMemo } from "react";
import {
  Calculator,
  Wallet,
  PiggyBank,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Gift,
  Building2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// Chart Colors
const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

/**
 * Freelance Lifestyle Defense Fund Simulator
 *
 * A single-file Next.js client component to calculate "Real Take-home" vs "Tax Pool".
 */

// --- Pure Calculation Logic ---
interface ScenarioInputs {
  dailyRate: number;
  workDays: number;
  commissionRate: number;
  businessGuarantee: number;
  cargoInsurance: number;
  vehicleRental: number;
  vehicleInsurance: number;
  mapApp: number;
  customExpensesTotal: number;
  annualCustomExpensesTotal: number;
  manualTax: number;
  idecoMonthly: number;
  kyosaiMonthly: number;
}

function calculateFreelanceScenario(inputs: ScenarioInputs) {
  const {
    dailyRate, workDays, commissionRate, businessGuarantee, cargoInsurance,
    vehicleRental, vehicleInsurance, mapApp, customExpensesTotal, annualCustomExpensesTotal,
    manualTax,
    idecoMonthly, kyosaiMonthly
  } = inputs;

  // Convert annual to monthly
  const annualExpensesMonthlyBuffer = annualCustomExpensesTotal / 12;

  // 1. Sales
  const annualSales = dailyRate * workDays * 12;
  const monthlyGrossSales = annualSales / 12;

  // 2. Business Expenses (Deductible)
  const monthlyCommission = monthlyGrossSales * (commissionRate / 100);
  const monthlyFixedExpenses = businessGuarantee + cargoInsurance + vehicleRental + vehicleInsurance + mapApp + customExpensesTotal + annualExpensesMonthlyBuffer;
  const totalMonthlyExpenses = monthlyCommission + monthlyFixedExpenses;
  const annualExpenses = totalMonthlyExpenses * 12;

  // 3. Tax / Social Insurance (Manual Input)
  // This is now a direct subtraction from cashflow
  const monthlyTaxPool = manualTax;

  // 4. Savings (Cash outflows that are assets)
  // iDeCo & Kyosai
  const totalMonthlySavings = idecoMonthly + kyosaiMonthly;

  // 5. "True" Take Home (Lifestyle Fund)
  const businessCashflow = monthlyGrossSales - totalMonthlyExpenses - totalMonthlySavings;
  const realTakeHome = businessCashflow - monthlyTaxPool;

  // Chart Data
  const chartData = [
    { name: "手取り", value: Math.round(realTakeHome) },
    { name: "経費", value: Math.round(totalMonthlyExpenses + totalMonthlySavings) },
    { name: "税金・社保", value: Math.round(monthlyTaxPool) },
  ].filter(item => item.value > 0);

  return {
    chartData,
    annualSales,
    annualExpenses,
    monthlyTaxPool,
    realTakeHome,
    monthlyGrossSales,
    totalMonthlySavings,
    monthlyCommission,
    totalMonthlyExpenses
  };
}

export default function FreelanceSimulator() {
  // --- State ---
  // Basic
  const [dailyRate, setDailyRate] = useState<number | "">(17424);
  const [workDays, setWorkDays] = useState<number | "">(21);

  // Expenses Breakdown
  const [commissionRate, setCommissionRate] = useState<number | "">(12); // %
  const [businessGuarantee, setBusinessGuarantee] = useState<number | "">(1000);
  const [cargoInsurance, setCargoInsurance] = useState<number | "">(1500);
  const [vehicleRental, setVehicleRental] = useState<number | "">(35000);
  const [vehicleInsurance, setVehicleInsurance] = useState<number | "">(0);
  const [mapApp, setMapApp] = useState<number | "">(300);
  // Custom Expenses (Dynamic List)
  const [customExpenses, setCustomExpenses] = useState<{ id: number; name: string; amount: number | "" }[]>([
    { id: 1, name: "その他経費", amount: 0 },
  ]);
  // Annual Custom Expenses
  const [annualCustomExpenses, setAnnualCustomExpenses] = useState<{ id: number; name: string; amount: number | "" }[]>([
    { id: 1, name: "年会費・税金等", amount: 0 },
  ]);

  // Attributes
  // Tax & Savings (Manual & iDeCo/Kyosai)
  const [manualTax, setManualTax] = useState<number | "">(50000); // Default manual tax
  const [idecoMonthly, setIdecoMonthly] = useState<number | "">(0); // Max 68,000
  const [kyosaiMonthly, setKyosaiMonthly] = useState<number | "">(0); // Max 70,000

  // UI State
  const [showAdvanced, setShowAdvanced] = useState(true);



  // --- Calculations ---
  const result = useMemo(() => {
    return calculateFreelanceScenario({
      dailyRate: Number(dailyRate),
      workDays: Number(workDays),
      commissionRate: Number(commissionRate),
      businessGuarantee: Number(businessGuarantee),
      cargoInsurance: Number(cargoInsurance),
      vehicleRental: Number(vehicleRental),
      vehicleInsurance: Number(vehicleInsurance),
      mapApp: Number(mapApp),
      customExpensesTotal: customExpenses.reduce((sum, item) => sum + Number(item.amount), 0),
      annualCustomExpensesTotal: annualCustomExpenses.reduce((sum, item) => sum + Number(item.amount), 0),
      manualTax: Number(manualTax),
      idecoMonthly: Number(idecoMonthly),
      kyosaiMonthly: Number(kyosaiMonthly),
    });
  }, [
    dailyRate,
    workDays,
    commissionRate,
    businessGuarantee,
    cargoInsurance,
    vehicleRental,
    vehicleInsurance,
    mapApp,
    customExpenses,
    annualCustomExpenses,
    manualTax,
    idecoMonthly,
    kyosaiMonthly,
  ]);



  // Utility to format currency
  const fmt = (n: number) =>
    new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      <header className="mb-8 flex items-center space-x-3 border-b-2 border-indigo-100 pb-4">
        <div className="p-3 bg-indigo-600 rounded-lg shadow-lg">
          <Calculator className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            生活防衛資金シミュレーター
          </h1>
          <p className="text-slate-500 text-sm md:text-base">
            簡単・シンプルな手取り計算
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24">
        {/* OUTPUTS SECTION (Mobile: Top, Desktop: Right) */}
        <div className="lg:col-span-7 space-y-5 order-1 lg:order-2">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Simplified to 2 Cards: Sales -> Take Home */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 1. Monthly Sales Card */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-5 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                  <Building2 size={60} />
                </div>
                <p className="text-blue-100 font-medium mb-1 flex items-center text-xs md:text-sm">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  月商
                </p>
                <div className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                  {fmt(result.monthlyGrossSales)}
                </div>
              </div>

              {/* 2. Real Take Home Card */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-5 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                  <Wallet size={60} />
                </div>
                <p className="text-emerald-100 font-medium mb-1 flex items-center text-xs md:text-sm">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  本当の手取り
                </p>
                <div className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                  {fmt(result.realTakeHome)}
                </div>
                <p className="text-emerald-100/80 text-[10px] md:text-xs mt-2">
                  ※税金・社保・経費を引いた残り
                </p>
              </div>
            </div>

            {/* Explanatory Note */}
            <div className="text-xs text-slate-400 text-right">
              ※ 手取り = 売上 - (経費 + 節税 + 税金・社保)
            </div>



            {/* Chart Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <PiggyBank className="w-5 h-5 mr-2 text-indigo-600" />
                収支内訳 (月額)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={result.chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => fmt(Number(value) || 0)}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Breakdown (Desktop mainly, but good for mobile details too) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 md:p-6">
              <h3 className="text-md md:text-lg font-semibold mb-4 text-slate-800">月間資金フロー内訳</h3>
              <div className="space-y-3 md:space-y-4 border-t border-slate-100 pt-4">
                {/* Row 1: Sales */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium">月商</span>
                  <span className="font-bold text-slate-800">{fmt(result.monthlyGrossSales)}</span>
                </div>

                {/* Deductions Block */}
                <div className="pl-4 border-l-2 border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">経費</span>
                    <span className="text-slate-500">- {fmt(result.totalMonthlyExpenses)}</span>
                  </div>
                  {(result.totalMonthlySavings > 0) && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-blue-600 font-medium flex items-center">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        節税積立 (iDeCo等)
                      </span>
                      <span className="text-blue-600 text-right">- {fmt(result.totalMonthlySavings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-rose-600 font-medium flex items-center">
                      <PiggyBank className="w-3 h-3 mr-1" />
                      税金
                    </span>
                    <span className="text-rose-600">- {fmt(result.monthlyTaxPool)}</span>
                  </div>
                </div>

                {/* Final Result */}
                <div className="flex justify-between items-center text-sm pt-4 border-t border-dashed border-slate-200">
                  <span className="font-bold text-slate-800 text-lg">手残り (生活費)</span>
                  <span className="font-bold text-emerald-600 text-2xl">{fmt(result.realTakeHome)}</span>
                </div>

              </div>
            </div>
          </div>

          {/* INPUTS SECTION (Mobile: Bottom, Desktop: Left) */}
          <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">

            {/* Section 1: Income & Basic Work */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 md:p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-700">
                <CheckCircle2 className="w-5 h-5 mr-2 text-indigo-500" />
                収入・稼働設定
              </h2>



              {/* Daily Rate */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3 text-slate-600">
                  日給単価 (税抜)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="10000"
                    max="100000"
                    step="1000"
                    value={Number(dailyRate)}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full h-8 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 active:accent-indigo-700 touch-none"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={dailyRate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) {
                        setDailyRate(val === "" ? "" : Number(val));
                      }
                    }}
                    className="w-24 p-2 text-lg border border-slate-300 rounded text-right font-mono"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2 text-right">
                  年商: {fmt(Number(dailyRate) * Number(workDays) * 12)}
                </p>
              </div>

              {/* Work Days */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-3 text-slate-600">
                  月間稼働日数
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="10"
                    max="31"
                    step="1"
                    value={Number(workDays)}
                    onChange={(e) => setWorkDays(Number(e.target.value))}
                    className="w-full h-8 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 active:accent-indigo-700 touch-none"
                  />
                  <span className="w-24 text-right font-mono font-bold text-xl">{workDays}日</span>
                </div>
              </div>
            </div>

            {/* Section 2: Expenses & Family */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 md:p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-700">
                <Building2 className="w-5 h-5 mr-2 text-indigo-500" />
                経費・家族設定
              </h2>

              <div className="space-y-4 mb-6">
                {/* Commission */}
                <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                  <label className="block text-sm font-medium mb-3 text-indigo-900">
                    事務手数料 (売上の{commissionRate}%)
                  </label>
                  <div className="flex items-center space-x-6 mb-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="commissionRate"
                        value={10}
                        checked={Number(commissionRate) === 10}
                        onChange={() => setCommissionRate(10)}
                        className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-slate-700 font-medium">10%</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="commissionRate"
                        value={12}
                        checked={Number(commissionRate) === 12}
                        onChange={() => setCommissionRate(12)}
                        className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-slate-700 font-medium">12%</span>
                    </label>
                  </div>
                  <div className="text-right text-indigo-700 font-bold">
                    -{fmt(result.monthlyCommission)}
                  </div>
                </div>

                {/* Detailed Fixed Expenses */}
                <div className="space-y-3 pt-2">
                  <p className="text-sm font-semibold text-slate-700">固定経費</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">業務保証料</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={businessGuarantee}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*$/.test(val)) setBusinessGuarantee(val === "" ? "" : Number(val));
                        }}
                        className="w-full p-2 border border-slate-300 rounded font-mono text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">貨物保険</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={cargoInsurance}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*$/.test(val)) setCargoInsurance(val === "" ? "" : Number(val));
                        }}
                        className="w-full p-2 border border-slate-300 rounded font-mono text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">車両レンタル</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={vehicleRental}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*$/.test(val)) setVehicleRental(val === "" ? "" : Number(val));
                        }}
                        className="w-full p-2 border border-slate-300 rounded font-mono text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">車両保険 (任意)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={vehicleInsurance}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*$/.test(val)) setVehicleInsurance(val === "" ? "" : Number(val));
                        }}
                        className="w-full p-2 border border-slate-300 rounded font-mono text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">地図アプリ</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={mapApp}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*$/.test(val)) setMapApp(val === "" ? "" : Number(val));
                        }}
                        className="w-full p-2 border border-slate-300 rounded font-mono text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom Expenses List */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-slate-700">その他の経費 (リスト)</p>
                    <button
                      onClick={() => {
                        const newId = customExpenses.length > 0 ? Math.max(...customExpenses.map(c => c.id)) + 1 : 1;
                        setCustomExpenses([...customExpenses, { id: newId, name: "", amount: "" }]);
                      }}
                      className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 font-medium transition-colors"
                    >
                      + 追加
                    </button>
                  </div>

                  <div className="space-y-2">
                    {customExpenses.map((expense, index) => (
                      <div key={expense.id} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="項目名"
                          value={expense.name}
                          onChange={(e) => {
                            const newExpenses = [...customExpenses];
                            newExpenses[index].name = e.target.value;
                            setCustomExpenses(newExpenses);
                          }}
                          className="flex-1 p-2 text-sm border border-slate-300 rounded"
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="金額"
                          value={expense.amount}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val)) {
                              const newExpenses = [...customExpenses];
                              newExpenses[index].amount = val === "" ? "" : Number(val);
                              setCustomExpenses(newExpenses);
                            }
                          }}
                          className="w-24 p-2 text-sm border border-slate-300 rounded font-mono text-right"
                        />
                        <button
                          onClick={() => {
                            const newExpenses = customExpenses.filter((_, i) => i !== index);
                            setCustomExpenses(newExpenses);
                          }}
                          className="text-slate-400 hover:text-red-500 p-1"
                          title="削除"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {customExpenses.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-2">経費項目がありません</p>
                    )}
                  </div>
                </div>

                {/* Annual Custom Expenses List */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-slate-700">年払い経費 (リスト)</p>
                    <button
                      onClick={() => {
                        const newId = annualCustomExpenses.length > 0 ? Math.max(...annualCustomExpenses.map(c => c.id)) + 1 : 1;
                        setAnnualCustomExpenses([...annualCustomExpenses, { id: newId, name: "", amount: "" }]);
                      }}
                      className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 font-medium transition-colors"
                    >
                      + 追加
                    </button>
                  </div>

                  <div className="space-y-2">
                    {annualCustomExpenses.map((expense, index) => (
                      <div key={expense.id} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="項目名"
                          value={expense.name}
                          onChange={(e) => {
                            const newExpenses = [...annualCustomExpenses];
                            newExpenses[index].name = e.target.value;
                            setAnnualCustomExpenses(newExpenses);
                          }}
                          className="flex-1 p-2 text-sm border border-slate-300 rounded"
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="金額 (年額)"
                          value={expense.amount}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val)) {
                              const newExpenses = [...annualCustomExpenses];
                              newExpenses[index].amount = val === "" ? "" : Number(val);
                              setAnnualCustomExpenses(newExpenses);
                            }
                          }}
                          className="w-24 p-2 text-sm border border-slate-300 rounded font-mono text-right"
                        />
                        <button
                          onClick={() => {
                            const newExpenses = annualCustomExpenses.filter((_, i) => i !== index);
                            setAnnualCustomExpenses(newExpenses);
                          }}
                          className="text-slate-400 hover:text-red-500 p-1"
                          title="削除"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {annualCustomExpenses.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-2">経費項目がありません</p>
                    )}
                  </div>
                  {annualCustomExpenses.reduce((sum, item) => sum + Number(item.amount), 0) > 0 && (
                    <div className="text-right text-xs text-slate-500">
                      月額換算: +{fmt(Math.round(annualCustomExpenses.reduce((sum, item) => sum + Number(item.amount), 0) / 12))}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-2 flex justify-between items-center bg-slate-50 p-2 rounded">
                  <span className="text-sm font-bold text-slate-600">経費合計 (月額)</span>
                  <span className="text-lg font-bold text-slate-800">{fmt(result.totalMonthlyExpenses)}</span>
                </div>

              </div>
            </div>


          </div>

          {/* Section 3: Tax Savings & Advanced (Collapsible) */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex justify-between items-center p-4 bg-indigo-100/50 hover:bg-indigo-100 transition-colors text-indigo-900 font-semibold"
            >
              <div className="flex items-center">
                <TrendingDown className="w-5 h-5 mr-2" />
                税金
              </div>
              {showAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {showAdvanced && (
              <div className="p-5 space-y-6">

                {/* Manual Tax Input */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-bold text-slate-700">税金 (月額)</label>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">手入力</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={manualTax}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val)) setManualTax(val === "" ? "" : Number(val));
                      }}
                      className="flex-1 p-2 border border-slate-300 rounded text-right font-mono text-base bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="50000"
                    />
                    <span className="ml-2 text-slate-500">円</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    ※所得税・住民税・国民年金・国民健康保険の合計額を入力してください
                  </p>
                </div>

                <div className="border-t border-slate-200 my-4"></div>

                {/* iDeCo */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-slate-700">iDeCo</label>
                    <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full">最大68,000</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="68000"
                    step="1000"
                    value={Number(idecoMonthly)}
                    onChange={(e) => setIdecoMonthly(Number(e.target.value))}
                    className="w-full h-6 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-3"
                  />
                  <div className="flex justify-end">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={idecoMonthly}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val)) {
                          setIdecoMonthly(val === "" ? "" : Number(val));
                        }
                      }}
                      className="w-28 p-2 border border-indigo-200 rounded text-right font-mono text-base bg-white"
                    />
                  </div>
                </div>

                {/* Kyosai */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-slate-700">小規模企業共済</label>
                    <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full">最大70,000</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="70000"
                    step="1000"
                    value={Number(kyosaiMonthly)}
                    onChange={(e) => setKyosaiMonthly(Number(e.target.value))}
                    className="w-full h-6 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-3"
                  />
                  <div className="flex justify-end">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={kyosaiMonthly}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val)) {
                          setKyosaiMonthly(val === "" ? "" : Number(val));
                        }
                      }}
                      className="w-28 p-2 border border-indigo-200 rounded text-right font-mono text-base bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Footer for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-2xl lg:hidden z-50">
        <div className="grid grid-cols-2 gap-4 items-end max-w-lg mx-auto">
          <div className="text-left">
            <p className="text-[10px] text-slate-500 mb-1">月商 (売上)</p>
            <p className="text-xl font-bold text-slate-700 leading-none">{fmt(result.monthlyGrossSales)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 mb-1">本当の手取り</p>
            <p className="text-2xl font-bold text-emerald-600 leading-none">{fmt(result.realTakeHome)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}


