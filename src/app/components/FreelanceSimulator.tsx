"use client";

import React, { useState, useMemo, useEffect } from "react";

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
  incomeTax: number;
  residentTax: number;
  healthInsurance: number;
  pension: number;
  businessTax: number;
  consumptionTax: number;
  idecoMonthly: number;
  kyosaiMonthly: number;
}

function calculateFreelanceScenario(inputs: ScenarioInputs) {
  const {
    dailyRate, workDays, commissionRate, businessGuarantee, cargoInsurance,
    vehicleRental, vehicleInsurance, mapApp, customExpensesTotal, annualCustomExpensesTotal,
    incomeTax, residentTax, healthInsurance, pension, businessTax, consumptionTax,
    idecoMonthly, kyosaiMonthly
  } = inputs;

  const annualExpensesMonthlyBuffer = annualCustomExpensesTotal / 12;
  const annualSales = dailyRate * workDays * 12;
  const monthlyGrossSales = annualSales / 12;
  const monthlyCommission = monthlyGrossSales * (commissionRate / 100);
  const monthlyFixedExpenses = businessGuarantee + cargoInsurance + vehicleRental + vehicleInsurance + mapApp + customExpensesTotal + annualExpensesMonthlyBuffer;
  const totalMonthlyExpenses = monthlyCommission + monthlyFixedExpenses;
  const annualExpenses = totalMonthlyExpenses * 12;
  const monthlyTaxPool = incomeTax + residentTax + healthInsurance + pension + businessTax + consumptionTax;
  const totalMonthlySavings = idecoMonthly + kyosaiMonthly;
  const businessCashflow = monthlyGrossSales - totalMonthlyExpenses - totalMonthlySavings;
  const realTakeHome = businessCashflow - monthlyTaxPool;

  const chartData = [
    { name: "手取り", value: Math.round(realTakeHome) },
    { name: "経費", value: Math.round(totalMonthlyExpenses + totalMonthlySavings) },
    { name: "税金・社保", value: Math.round(monthlyTaxPool) },
  ].filter(item => item.value > 0);

  return {
    chartData,
    annualSales,
    monthlyGrossSales,
    totalMonthlyExpenses,
    annualExpenses,
    monthlyTaxPool,
    totalMonthlySavings,
    businessCashflow,
    realTakeHome,
    annualCustomExpensesTotal,
  };
}

// Simple Tooltip Component
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="cursor-help"
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 w-64 p-3 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg shadow-xl -top-2 left-6 animate-in fade-in duration-200">
          {text}
          <div className="absolute w-2 h-2 bg-white border-l border-b border-slate-200 transform rotate-45 -left-1 top-3"></div>
        </div>
      )}
    </div>
  );
}

export default function FreelanceSimulator() {

  const fmt = (num: number) => `¥${num.toLocaleString()}`;

  // State
  // State
  const [dailyRate, setDailyRate] = useState<string>("");
  const [workDays, setWorkDays] = useState<string>("");
  const [commissionRate, setCommissionRate] = useState<string>("");
  const [businessGuarantee, setBusinessGuarantee] = useState<string>("");
  const [cargoInsurance, setCargoInsurance] = useState<string>("");
  const [vehicleRental, setVehicleRental] = useState<string>("");
  const [vehicleInsurance, setVehicleInsurance] = useState<string>("");
  const [mapApp, setMapApp] = useState<string>("");
  const [incomeTax, setIncomeTax] = useState<string>("");
  const [residentTax, setResidentTax] = useState<string>("");
  const [healthInsurance, setHealthInsurance] = useState<string>("");
  const [pension, setPension] = useState<string>("");
  const [businessTax, setBusinessTax] = useState<string>("");
  const [consumptionTax, setConsumptionTax] = useState<string>("");
  const [idecoMonthly, setIdecoMonthly] = useState<string>("");
  const [kyosaiMonthly, setKyosaiMonthly] = useState<string>("");

  const [customExpenses, setCustomExpenses] = useState<Array<{ name: string; amount: string }>>([]);
  const [annualCustomExpenses, setAnnualCustomExpenses] = useState<Array<{ name: string; amount: string }>>([]);

  // State for adding new custom expenses
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>("");

  // State for adding new annual expenses
  const [newAnnualExpenseName, setNewAnnualExpenseName] = useState("");
  const [newAnnualExpenseAmount, setNewAnnualExpenseAmount] = useState<string>("");

  // Functions to manage custom expenses
  const addCustomExpense = () => {
    if (newExpenseName.trim() && newExpenseAmount !== "") {
      setCustomExpenses([...customExpenses, { name: newExpenseName, amount: newExpenseAmount }]);
      setNewExpenseName("");
      setNewExpenseAmount("");
    }
  };

  const removeCustomExpense = (index: number) => {
    setCustomExpenses(customExpenses.filter((_, i) => i !== index));
  };

  const updateCustomExpense = (index: number, amount: string) => {
    const updated = [...customExpenses];
    updated[index].amount = amount;
    setCustomExpenses(updated);
  };

  // Functions to manage annual expenses
  const addAnnualExpense = () => {
    if (newAnnualExpenseName.trim() && newAnnualExpenseAmount !== "") {
      setAnnualCustomExpenses([...annualCustomExpenses, { name: newAnnualExpenseName, amount: newAnnualExpenseAmount }]);
      setNewAnnualExpenseName("");
      setNewAnnualExpenseAmount("");
    }
  };

  const removeAnnualExpense = (index: number) => {
    setAnnualCustomExpenses(annualCustomExpenses.filter((_, i) => i !== index));
  };

  const updateAnnualExpense = (index: number, amount: string) => {
    const updated = [...annualCustomExpenses];
    updated[index].amount = amount;
    setAnnualCustomExpenses(updated);
  };

  const result = useMemo(() => {
    const customExpensesTotal = customExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const annualCustomExpensesTotal = annualCustomExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

    return calculateFreelanceScenario({
      dailyRate: Number(dailyRate),
      workDays: Number(workDays),
      commissionRate: Number(commissionRate),
      businessGuarantee: Number(businessGuarantee),
      cargoInsurance: Number(cargoInsurance),
      vehicleRental: Number(vehicleRental),
      vehicleInsurance: Number(vehicleInsurance),
      mapApp: Number(mapApp),
      customExpensesTotal,
      annualCustomExpensesTotal,
      healthInsurance: Number(healthInsurance),
      pension: Number(pension),
      incomeTax: Number(incomeTax),
      residentTax: Number(residentTax),
      businessTax: Number(businessTax),
      consumptionTax: Number(consumptionTax),
      idecoMonthly: Number(idecoMonthly),
      kyosaiMonthly: Number(kyosaiMonthly),
    });
  }, [
    dailyRate, workDays, commissionRate, businessGuarantee, cargoInsurance,
    vehicleRental, vehicleInsurance, mapApp, customExpenses, annualCustomExpenses,
    healthInsurance, pension, incomeTax, residentTax, businessTax, consumptionTax,
    idecoMonthly, kyosaiMonthly,
  ]);

  // Load data from LocalStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("freelance-simulator-data");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.dailyRate !== undefined) setDailyRate(String(data.dailyRate));
        if (data.workDays !== undefined) setWorkDays(String(data.workDays));
        if (data.commissionRate !== undefined) setCommissionRate(String(data.commissionRate));
        if (data.businessGuarantee !== undefined) setBusinessGuarantee(String(data.businessGuarantee));
        if (data.cargoInsurance !== undefined) setCargoInsurance(String(data.cargoInsurance));
        if (data.vehicleRental !== undefined) setVehicleRental(String(data.vehicleRental));
        if (data.vehicleInsurance !== undefined) setVehicleInsurance(String(data.vehicleInsurance));
        if (data.mapApp !== undefined) setMapApp(String(data.mapApp));
        if (data.customExpenses !== undefined) setCustomExpenses(data.customExpenses.map((i: { name: string; amount: string | number }) => ({ ...i, amount: String(i.amount) })));
        if (data.annualCustomExpenses !== undefined) setAnnualCustomExpenses(data.annualCustomExpenses.map((i: { name: string; amount: string | number }) => ({ ...i, amount: String(i.amount) })));
        if (data.incomeTax !== undefined) setIncomeTax(String(data.incomeTax));
        if (data.residentTax !== undefined) setResidentTax(String(data.residentTax));
        if (data.healthInsurance !== undefined) setHealthInsurance(String(data.healthInsurance));
        if (data.pension !== undefined) setPension(String(data.pension));
        if (data.businessTax !== undefined) setBusinessTax(String(data.businessTax));
        if (data.consumptionTax !== undefined) setConsumptionTax(String(data.consumptionTax));
        if (data.idecoMonthly !== undefined) setIdecoMonthly(String(data.idecoMonthly));
        if (data.kyosaiMonthly !== undefined) setKyosaiMonthly(String(data.kyosaiMonthly));
      } catch (e) {
        console.error("Failed to load saved data:", e);
      }
    }
  }, []);

  // Save data to LocalStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
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
      incomeTax,
      residentTax,
      healthInsurance,
      pension,
      businessTax,
      consumptionTax,
      idecoMonthly,
      kyosaiMonthly,
    };
    localStorage.setItem("freelance-simulator-data", JSON.stringify(dataToSave));
  }, [
    dailyRate, workDays, commissionRate, businessGuarantee, cargoInsurance,
    vehicleRental, vehicleInsurance, mapApp, customExpenses, annualCustomExpenses,
    healthInsurance, pension, incomeTax, residentTax, businessTax, consumptionTax,
    idecoMonthly, kyosaiMonthly,
  ]);

  // Reset all data
  const resetAllData = () => {
    if (confirm("全てのデータをリセットしますか?")) {
      localStorage.removeItem("freelance-simulator-data");
      setDailyRate("");
      setWorkDays("");
      setCommissionRate("");
      setBusinessGuarantee("");
      setCargoInsurance("");
      setVehicleRental("");
      setVehicleInsurance("");
      setMapApp("");
      setCustomExpenses([]);
      setAnnualCustomExpenses([]);
      setIncomeTax("");
      setResidentTax("");
      setHealthInsurance("");
      setPension("");
      setBusinessTax("");
      setConsumptionTax("");
      setIdecoMonthly("");
      setKyosaiMonthly("");
    }
  };

  const revenuePercentage = result.monthlyGrossSales > 0
    ? ((result.realTakeHome / result.monthlyGrossSales) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                個人事業主お金シミュレーター
              </h1>
              <p className="text-slate-600 text-sm lg:text-base mt-2">
                税金・経費を引いた&quot;真の手取り&quot;を即座に計算
              </p>
            </div>
            <button
              onClick={resetAllData}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-red-600 hover:border-red-300 transition-colors"
            >
              リセット
            </button>
          </div>
        </header>

        {/* Hero Section - Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">

          {/* Monthly Revenue Card */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 lg:p-8">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-600">月商（売上）</h3>
            </div>
            <div className="text-4xl lg:text-5xl font-bold text-slate-900 mb-2">
              {fmt(result.monthlyGrossSales)}
            </div>
            <p className="text-sm text-slate-500">年間売上: {fmt(result.annualSales)}</p>
          </div>

          {/* Real Take Home Card */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">本当の手取り</h3>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {revenuePercentage}%
              </span>
            </div>
            <div className="text-4xl lg:text-5xl font-bold text-emerald-700 mb-6">
              {fmt(result.realTakeHome)}
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2">
              <div className="text-xs text-slate-600 mb-2">
                <span>収入の内訳</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-600 transition-all duration-500"
                  style={{ width: `${result.monthlyGrossSales > 0 ? Math.max(0, Math.min(100, (result.realTakeHome / result.monthlyGrossSales) * 100)) : 0}%` }}
                  title="手取り"
                />
                <div
                  className="bg-amber-500 transition-all duration-500"
                  style={{ width: `${result.monthlyGrossSales > 0 ? Math.max(0, Math.min(100, (result.totalMonthlyExpenses / result.monthlyGrossSales) * 100)) : 0}%` }}
                  title="経費"
                />
                <div
                  className="bg-rose-600 transition-all duration-500"
                  style={{ width: `${result.monthlyGrossSales > 0 ? Math.max(0, Math.min(100, (result.monthlyTaxPool / result.monthlyGrossSales) * 100)) : 0}%` }}
                  title="税金"
                />
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <span className="text-slate-600">手取り</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-slate-600">経費</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-rose-600 rounded-full"></div>
                  <span className="text-slate-600">税金</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid - Input Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

          {/* Income Settings */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">収入・稼働設定</h2>
            </div>

            <div className="space-y-6">
              {/* Daily Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-600">
                    日給単価 (税込)
                  </label>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={dailyRate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) setDailyRate(val);
                  }}
                  className="w-full px-4 py-2.5 text-right text-lg font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="0"
                />
              </div>

              {/* Work Days */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-600">月間稼働日数</label>
                  <span className="text-sm font-semibold text-slate-900">{workDays}日</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="31"
                  value={Number(workDays)}
                  onChange={(e) => setWorkDays(e.target.value)}
                  className="w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Commission Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-600">
                    手数料率
                  </label>
                  <span className="text-sm font-semibold text-slate-900">{commissionRate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={Number(commissionRate)}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Fixed Expenses */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">固定経費（月額）</h2>
            </div>

            <div className="space-y-4">
              {[
                { label: "事業保障", value: businessGuarantee, setter: setBusinessGuarantee },
                { label: "貨物保険", value: cargoInsurance, setter: setCargoInsurance },
                { label: "車両レンタル", value: vehicleRental, setter: setVehicleRental },
                { label: "車両保険", value: vehicleInsurance, setter: setVehicleInsurance },
                { label: "地図アプリ", value: mapApp, setter: setMapApp },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-600 min-w-[100px]">{item.label}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={item.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) item.setter(val);
                    }}
                    className="flex-1 px-3 py-2 text-right font-mono text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="0"
                  />
                  <span className="text-sm text-slate-500">円</span>
                </div>
              ))}

              {/* Custom Expenses */}
              {customExpenses.length > 0 && (
                <>
                  <div className="pt-3 border-t border-slate-200"></div>
                  {customExpenses.map((expense, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <label className="text-sm font-medium text-slate-600 sm:min-w-[100px]">{expense.name}</label>
                      <div className="flex items-center gap-2 w-full sm:flex-1">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={expense.amount}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val)) updateCustomExpense(index, val);
                          }}
                          className="flex-1 px-3 py-2 text-right font-mono text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                          placeholder="0"
                        />
                        <span className="text-sm text-slate-500">円</span>
                        <button
                          onClick={() => removeCustomExpense(index)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1"
                          title="削除"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Add New Expense Form */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newExpenseName}
                    onChange={(e) => setNewExpenseName(e.target.value)}
                    placeholder="項目名"
                    className="w-full sm:w-32 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                  <div className="flex items-center gap-2 w-full sm:flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={newExpenseAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val)) setNewExpenseAmount(val);
                      }}
                      placeholder="金額"
                      className="flex-1 px-3 py-2 text-right font-mono text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                    <span className="text-sm text-slate-500">円</span>
                    <button
                      onClick={addCustomExpense}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                    >
                      + 追加
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">経費合計</span>
                <span className="text-lg font-bold text-slate-900">{fmt(result.totalMonthlyExpenses)}</span>
              </div>
            </div>
          </div>

          {/* Annual Expenses */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">年間経費（年払い）</h2>
              <p className="text-sm text-slate-500 mt-1">
                年払いの保険料やサーバー代、確定申告費用など。<br />
                月額換算して固定経費に含まれます。
              </p>
            </div>

            <div className="space-y-4">
              {annualCustomExpenses.length > 0 && (
                <>
                  {annualCustomExpenses.map((expense, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <label className="text-sm font-medium text-slate-600 sm:min-w-[100px]">{expense.name}</label>
                      <div className="flex items-center gap-2 w-full sm:flex-1">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={expense.amount}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val)) updateAnnualExpense(index, val);
                          }}
                          className="flex-1 px-3 py-2 text-right font-mono text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                          placeholder="0"
                        />
                        <span className="text-sm text-slate-500">円</span>
                        <button
                          onClick={() => removeAnnualExpense(index)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1"
                          title="削除"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-slate-200"></div>
                </>
              )}

              {/* Add New Annual Expense Form */}
              <div className="">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newAnnualExpenseName}
                    onChange={(e) => setNewAnnualExpenseName(e.target.value)}
                    placeholder="項目名"
                    className="w-full sm:w-32 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                  <div className="flex items-center gap-2 w-full sm:flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={newAnnualExpenseAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val)) setNewAnnualExpenseAmount(val);
                      }}
                      placeholder="金額"
                      className="flex-1 px-3 py-2 text-right font-mono text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                    <span className="text-sm text-slate-500">円</span>
                    <button
                      onClick={addAnnualExpense}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                    >
                      + 追加
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">年間合計</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-900">{fmt(result.annualCustomExpensesTotal)}</span>
                  <p className="text-xs text-slate-500">月額換算: {fmt(Math.round(result.annualCustomExpensesTotal / 12))}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Insurance */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">社会保険（毎月の支払い）</h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-2">
                  <label className="text-sm font-medium text-slate-600">
                    国民健康保険
                  </label>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={healthInsurance}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) setHealthInsurance(val);
                  }}
                  className="w-full px-4 py-2.5 text-right font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="0"
                />
              </div>

              <div>
                <div className="mb-2">
                  <label className="text-sm font-medium text-slate-600">
                    国民年金
                  </label>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pension}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) setPension(val);
                  }}
                  className="w-full px-4 py-2.5 text-right font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="0"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm text-slate-600">社会保険合計</span>
                <span className="text-sm font-semibold text-slate-900">{fmt(Number(healthInsurance) + Number(pension))}</span>
              </div>
            </div>
          </div>

          {/* Tax Reserve */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">税金の積立(翌年の支払い用)</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  label: "所得税",
                  value: incomeTax,
                  setter: setIncomeTax,
                  hint: "利益から各種控除を引いた額に、税率（5%〜45%）を掛けて計算。195万円以下なら × 5%。195万〜330万円なら × 10% - 97,500円。× 1.021 （復興特別所得税）"
                },
                {
                  label: "住民税",
                  value: residentTax,
                  setter: setResidentTax,
                  hint: "前年の所得に対して一律10% ＋ 均等割（年5,000円）"
                },
                {
                  label: "個人事業税",
                  value: businessTax,
                  setter: setBusinessTax,
                  hint: "事業所得が290万円を超えた場合にのみ発生します。 税率：5%"
                },
                {
                  label: "消費税",
                  value: consumptionTax,
                  setter: setConsumptionTax,
                  hint: "インボイス登録者のみ対象。売上の10%預かりから、「2割特例」などを適用して計算。"
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-2">
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                      {item.label}
                      <Tooltip text={item.hint}>
                        <svg className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" strokeWidth="2" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" />
                        </svg>
                      </Tooltip>
                    </label>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={item.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) item.setter(val);
                    }}
                    className="w-full px-4 py-2.5 text-right font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              ))}


              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm text-slate-600">積立合計</span>
                <span className="text-sm font-semibold text-slate-900">
                  {fmt(Number(incomeTax) + Number(residentTax) + Number(businessTax) + Number(consumptionTax))}
                </span>
              </div>
            </div>
          </div>

          {/* Savings */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">オススメの節税</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* iDeCo */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-600">iDeCo</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">最大68,000</span>
                    <span className="text-sm font-semibold text-slate-900">{fmt(Number(idecoMonthly))}</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="68000"
                  step="1000"
                  value={Number(idecoMonthly)}
                  onChange={(e) => setIdecoMonthly(e.target.value)}
                  className="w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600 mb-3"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={idecoMonthly}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) setIdecoMonthly(val);
                  }}
                  className="w-full px-4 py-2.5 text-right font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Kyosai */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-600">小規模企業共済</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">最大70,000</span>
                    <span className="text-sm font-semibold text-slate-900">{fmt(Number(kyosaiMonthly))}</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="70000"
                  step="1000"
                  value={Number(kyosaiMonthly)}
                  onChange={(e) => setKyosaiMonthly(e.target.value)}
                  className="w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600 mb-3"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={kyosaiMonthly}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) setKyosaiMonthly(val);
                  }}
                  className="w-full px-4 py-2.5 text-right font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-2xl lg:hidden z-50">
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            <div>
              <p className="text-xs text-slate-500 mb-1">月商</p>
              <p className="text-xl font-bold text-slate-900">{fmt(result.monthlyGrossSales)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-1">本当の手取り</p>
              <p className="text-xl font-bold text-emerald-600">{fmt(result.realTakeHome)}</p>
            </div>
          </div>
        </div>

        {/* Bottom Padding for Mobile */}
        <div className="h-24 lg:hidden"></div>
      </div>
    </div>
  );
}
