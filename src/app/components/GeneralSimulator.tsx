"use client";

import React, { useState, useMemo, useEffect } from "react";

// --- Types & Constants ---
type BusinessType = "type1" | "type2" | "type3" | "writer";

interface BusinessCategory {
    id: BusinessType;
    label: string;
    taxRate: number;
}

const BUSINESS_CATEGORIES: BusinessCategory[] = [
    { id: "type1", label: "第1種 (5%): 飲食, 小売, デザイン, 配送等", taxRate: 0.05 },
    { id: "type2", label: "第2種 (4%): 畜産, 水産等", taxRate: 0.04 },
    { id: "type3", label: "第3種 (3%): 医業, 弁護士等", taxRate: 0.03 },
    { id: "writer", label: "免除 (0%): 文筆, 漫画家, 音楽家等", taxRate: 0 },
];

interface ExpenseItem {
    id: string;
    name: string;
    amount: number;
}

// --- Custom UI Components (Shadcn-like) ---
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm transition-all ${className}`}>
        {children}
    </div>
);

const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <label className={`text-sm font-semibold text-slate-700 block mb-1.5 ${className}`}>
        {children}
    </label>
);

const Input = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={`w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-right ${props.className}`}
    />
);

const Switch = ({ checked, onChange, label }: { checked: boolean; onChange: (val: boolean) => void; label: string }) => (
    <label className="flex items-center cursor-pointer group">
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-slate-300"}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? "transform translate-x-4" : ""}`}></div>
        </div>
        <span className="ml-3 text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
    </label>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative inline-block">
            <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="cursor-help">
                {children}
            </div>
            {show && (
                <div className="absolute z-50 w-64 p-3 text-xs leading-relaxed text-slate-100 bg-slate-900 rounded-lg shadow-xl -top-2 left-7 animate-in fade-in zoom-in duration-150">
                    {text}
                    <div className="absolute w-2 h-2 bg-slate-900 transform rotate-45 -left-1 top-3"></div>
                </div>
            )}
        </div>
    );
};

// --- Main Component ---
export default function GeneralSimulator() {
    // --- States ---
    const [revenueMode, setRevenueMode] = useState<"monthly" | "yearly">("monthly");
    const [revenue, setRevenue] = useState<number>(0);
    const [businessType, setBusinessType] = useState<BusinessType>("type1");
    const [blueTaxReturn, setBlueTaxReturn] = useState(true); // 65万円控除

    // Expenses
    const [expenseMode, setExpenseMode] = useState<"percentage" | "detail">("percentage");
    const [expensePercentage, setExpensePercentage] = useState(20);
    const [detailedExpenses, setDetailedExpenses] = useState<ExpenseItem[]>([]);
    const [newExpName, setNewExpName] = useState("");
    const [newExpAmount, setNewExpAmount] = useState("");

    // Taxes & Insurance (Manual Overrides)
    const [manualHealth, setManualHealth] = useState<number | null>(null);
    const [manualPension, setManualPension] = useState<number | null>(null);
    const [manualIncomeTax, setManualIncomeTax] = useState<number | null>(null);
    const [manualResidentTax, setManualResidentTax] = useState<number | null>(null);
    const [manualBusinessTax, setManualBusinessTax] = useState<number | null>(null);
    const [manualConsumptionTax, setManualConsumptionTax] = useState<number | null>(null);

    // Invoice
    const [isInvoice, setIsInvoice] = useState(false);
    const [isTwoPercentRule, setIsTwoPercentRule] = useState(true);

    // Social Investment
    const [ideco, setIdeco] = useState(0);
    const [kyosai, setKyosai] = useState(0);

    // --- Calculations ---
    const result = useMemo(() => {
        const yearlyRevenue = revenueMode === "monthly" ? revenue * 12 : revenue;

        // Expenses
        const yearlyExpenses = expenseMode === "percentage"
            ? yearlyRevenue * (expensePercentage / 100)
            : detailedExpenses.reduce((sum, item) => sum + item.amount * 12, 0);

        // Business Profit (Blue return deduction)
        const blueDeduction = blueTaxReturn ? 650000 : 100000;
        const businessProfit = Math.max(0, yearlyRevenue - yearlyExpenses);
        const profitAfterBlue = Math.max(0, businessProfit - blueDeduction);

        // Social Insurance (Estimate)
        // Roughly 10-14% of profit for Health + Pension (Fixed roughly in JP for simplistic estimation here, then allow manual)
        const estimatedHealth = Math.min(900000, profitAfterBlue * 0.1);
        const estimatedPension = 16980 * 12; // Standard National Pension

        const healthToUse = manualHealth !== null ? manualHealth * 12 : estimatedHealth;
        const pensionToUse = manualPension !== null ? manualPension * 12 : estimatedPension;
        const totalSocInsurance = healthToUse + pensionToUse;

        // Income Tax (Progressive)
        const taxableIncome = Math.max(0, profitAfterBlue - totalSocInsurance - ideco * 12 - kyosai * 12 - 480000); // 480k basic deduction
        let calculatedIncomeTax = 0;
        if (taxableIncome <= 1950000) calculatedIncomeTax = taxableIncome * 0.05;
        else if (taxableIncome <= 3300000) calculatedIncomeTax = taxableIncome * 0.10 - 97500;
        else if (taxableIncome <= 6950000) calculatedIncomeTax = taxableIncome * 0.20 - 427500;
        else if (taxableIncome <= 9000000) calculatedIncomeTax = taxableIncome * 0.23 - 636000;
        else if (taxableIncome <= 18000000) calculatedIncomeTax = taxableIncome * 0.33 - 1536000;
        else calculatedIncomeTax = taxableIncome * 0.45 - 4796000;
        calculatedIncomeTax *= 1.021; // Reconstruction tax

        const incomeTaxToUse = manualIncomeTax !== null ? manualIncomeTax * 12 : calculatedIncomeTax;

        // Resident Tax (10% flat + 5000)
        const residentTaxToUse = manualResidentTax !== null ? manualResidentTax * 12 : (taxableIncome * 0.10 + 5000);

        // Business Tax
        // 課税標準額 = (事業所得 + 青色申告特別控除) - 事業主控除290万円
        const category = BUSINESS_CATEGORIES.find(c => c.id === businessType);
        const businessProfitBeforeDeduction = businessProfit; // すでに yearlyRevenue - yearlyExpenses
        const businessTaxBase = Math.max(0, businessProfitBeforeDeduction - 2900000);
        const calculatedBusTax = businessTaxBase * (category?.taxRate || 0);
        const busTaxToUse = manualBusinessTax !== null ? manualBusinessTax * 12 : calculatedBusTax;

        // Consumption Tax
        let consumptionTaxToUse = 0;
        if (isInvoice) {
            if (isTwoPercentRule) {
                consumptionTaxToUse = yearlyRevenue * 0.02; // Simple calculation for 2割特例
            } else {
                consumptionTaxToUse = (yearlyRevenue - yearlyExpenses) * 0.1; // Very rough standard
            }
        }
        if (manualConsumptionTax !== null) consumptionTaxToUse = manualConsumptionTax * 12;

        const totalTaxesAndSoc = totalSocInsurance + incomeTaxToUse + residentTaxToUse + busTaxToUse + consumptionTaxToUse;
        const yearlyTakeHome = businessProfit - totalTaxesAndSoc - (ideco + kyosai) * 12;
        const monthlyTakeHome = yearlyTakeHome / 12;

        return {
            yearlyRevenue,
            yearlyExpenses,
            businessProfit,
            yearlyTakeHome,
            monthlyTakeHome,
            breakdown: {
                health: healthToUse / 12,
                pension: pensionToUse / 12,
                incomeTax: incomeTaxToUse / 12,
                residentTax: residentTaxToUse / 12,
                businessTax: busTaxToUse / 12,
                consumptionTax: consumptionTaxToUse / 12,
                socInsurance: totalSocInsurance / 12,
                totalMonthlyOut: (totalTaxesAndSoc + (ideco + kyosai) * 12) / 12,
                savings: (ideco + kyosai),
            }
        };
    }, [revenue, revenueMode, businessType, blueTaxReturn, expenseMode, expensePercentage, detailedExpenses, manualHealth, manualPension, manualIncomeTax, manualResidentTax, manualBusinessTax, manualConsumptionTax, isInvoice, isTwoPercentRule, ideco, kyosai]);

    // --- Handlers ---
    const addExpense = () => {
        if (!newExpName || !newExpAmount) return;
        setDetailedExpenses([...detailedExpenses, { id: Date.now().toString(), name: newExpName, amount: Number(newExpAmount) }]);
        setNewExpName("");
        setNewExpAmount("");
    };

    const removeExpense = (id: string) => {
        setDetailedExpenses(detailedExpenses.filter(e => e.id !== id));
    };

    const format = (num: number) => Math.round(num).toLocaleString();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            {/* Header Bento Card */}
            <Card className="p-8 mb-8 bg-slate-900 border-none text-white overflow-hidden relative">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="w-full md:w-auto">
                        <h1 className="text-4xl md:text-3xl font-bold tracking-tight mb-2 text-black">のこるくん</h1>
                        <p className="text-slate-400 text-sm md:text-base">個人事業主の為の手取りシミュレーター</p>
                    </div>
                    <div className="flex flex-row justify-between w-full md:w-auto gap-4 md:gap-12">
                        <div className="text-left md:text-right">
                            <p className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">月間手取り</p>
                            <p className="text-2xl md:text-4xl lg:text-5xl font-bold text-emerald-400">¥{format(result.monthlyTakeHome)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">年間手取り</p>
                            <p className="text-2xl md:text-4xl lg:text-5xl font-bold text-emerald-400">¥{format(result.yearlyTakeHome)}</p>
                        </div>
                    </div>
                </div>
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl shrink-0 pointer-events-none"></div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Input Settings (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Revenue & Profile Section */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                            収入・業種の設定
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <Label>売上入力方式</Label>
                                        <div className="flex bg-slate-100 p-1 rounded-lg">
                                            <button
                                                onClick={() => setRevenueMode("monthly")}
                                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${revenueMode === "monthly" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
                                            >月額</button>
                                            <button
                                                onClick={() => setRevenueMode("yearly")}
                                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${revenueMode === "yearly" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
                                            >年商</button>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <Input
                                            type="number"
                                            value={revenue}
                                            onChange={(e) => setRevenue(Number(e.target.value))}
                                            className="text-2xl h-14 pr-10"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-indigo-600 transition-colors">円</span>
                                    </div>
                                </div>

                                <div>
                                    <Label>業種（事業税の判定）</Label>
                                    <select
                                        value={businessType}
                                        onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                                    >
                                        {BUSINESS_CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-6 px-4 py-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                <Switch
                                    checked={blueTaxReturn}
                                    onChange={setBlueTaxReturn}
                                    label="青色申告（65万円控除）を利用"
                                />
                                <div className="space-y-4">
                                    <Switch checked={isInvoice} onChange={setIsInvoice} label="インボイス（消費税）納税あり" />
                                    {isInvoice && (
                                        <div className="pl-8 space-y-3 animate-in slide-in-from-left-2 transition-all">
                                            <Switch checked={isTwoPercentRule} onChange={setIsTwoPercentRule} label="2割特例を利用（簡易計算）" />
                                            <p className="text-[10px] text-slate-500 leading-tight">
                                                ※インボイス登録から3年間、売上にかかる消費税の20%分のみを納税する特例です。
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Expenses Section */}
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                                経費の入力
                            </h2>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setExpenseMode("percentage")}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${expenseMode === "percentage" ? "bg-white shadow-sm text-amber-600" : "text-slate-500 hover:text-slate-700"}`}
                                >概算モデル</button>
                                <button
                                    onClick={() => setExpenseMode("detail")}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${expenseMode === "detail" ? "bg-white shadow-sm text-amber-600" : "text-slate-500 hover:text-slate-700"}`}
                                >詳細リスト</button>
                            </div>
                        </div>

                        {expenseMode === "percentage" ? (
                            <div className="py-8 space-y-8">
                                <div className="flex justify-between items-end mb-2">
                                    <Label className="mb-0">売上の何％を経費とするか</Label>
                                    <span className="text-3xl font-black text-amber-600 font-mono">{expensePercentage}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="90" step="5"
                                    value={expensePercentage}
                                    onChange={(e) => setExpensePercentage(Number(e.target.value))}
                                    className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-amber-500"
                                />
                                <div className="grid grid-cols-4 text-center text-[10px] font-bold text-slate-400">
                                    <div>エンジニア等<br />(10-20%)</div>
                                    <div>デザイナー等<br />(20-40%)</div>
                                    <div>小売・配送等<br />(40-60%)</div>
                                    <div>飲食・仕入多<br />(60%~)</div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="max-h-60 overflow-y-auto space-y-2 mb-4 pr-1">
                                    {detailedExpenses.length === 0 && <p className="text-center py-8 text-slate-400 text-sm">項目を追加してください</p>}
                                    {detailedExpenses.map(exp => (
                                        <div key={exp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 group animate-in fade-in slide-in-from-top-1">
                                            <span className="text-sm font-bold text-slate-700">{exp.name}</span>
                                            <div className="flex items-center gap-4">
                                                <span className="font-mono font-bold text-sm">¥{format(exp.amount)} <span className="text-[10px] text-slate-400">/月</span></span>
                                                <button onClick={() => removeExpense(exp.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <input
                                        placeholder="費目（地代家賃など）"
                                        className="flex-1 min-w-[150px] px-4 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                                        value={newExpName} onChange={(e) => setNewExpName(e.target.value)}
                                    />
                                    <input
                                        type="number" placeholder="金額/月"
                                        className="flex-1 min-w-[100px] md:w-32 px-4 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-right font-mono"
                                        value={newExpAmount} onChange={(e) => setNewExpAmount(e.target.value)}
                                    />
                                    <button onClick={addExpense} className="w-full sm:w-auto px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors whitespace-nowrap">+ 追加</button>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Social Investment */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                            節税・将来への備え (月額)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="mb-0">iDeCo</Label>
                                    <span className="font-mono font-bold text-emerald-600">¥{format(ideco)}</span>
                                </div>
                                <input type="range" min="0" max="68000" step="1000" value={ideco} onChange={e => setIdeco(Number(e.target.value))} className="w-full accent-emerald-500" />
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="mb-0">小規模企業共済</Label>
                                    <span className="font-mono font-bold text-emerald-600">¥{format(kyosai)}</span>
                                </div>
                                <input type="range" min="0" max="70000" step="1000" value={kyosai} onChange={e => setKyosai(Number(e.target.value))} className="w-full accent-emerald-500" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Results & Advisory (1/3 width) */}
                <div className="space-y-6">
                    <Card className="p-6 border-indigo-100 bg-indigo-50/30 sticky top-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-slate-900 rounded-full"></span>
                            税金・社会保険の内訳
                        </h2>

                        <p className="text-[10px] font-bold text-indigo-600 mb-4 bg-indigo-100 px-2 py-1 rounded inline-block uppercase tracking-wider">
                            金額クリックで手動入力可能
                        </p>

                        <div className="space-y-0.5">
                            {[
                                { label: "国健・年金", value: result.breakdown.socInsurance, state: manualHealth, setter: setManualHealth, hint: "国民健康保険と国民年金の合計。自治体により大きく変動します。" },
                                { label: "所得税", value: result.breakdown.incomeTax, state: manualIncomeTax, setter: setManualIncomeTax, hint: "年間の利益から控除を引いた額に累進税率を掛けた額の1/12。" },
                                { label: "住民税", value: result.breakdown.residentTax, state: manualResidentTax, setter: setManualResidentTax, hint: "所得に対して一律約10%で計算される地方税。" },
                                { label: "事業税", value: result.breakdown.businessTax, state: manualBusinessTax, setter: setManualBusinessTax, hint: "事業所得290万円を超える場合に課税。業種により税率が異なります。" },
                                { label: "消費税", value: result.breakdown.consumptionTax, state: manualConsumptionTax, setter: setManualConsumptionTax, hint: "インボイス登録者の納税額。2割特例または本則課税での概算。" },
                            ].map((tax, i) => (
                                <div key={i} className="flex items-center justify-between py-3 border-b border-indigo-100 last:border-none group">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-600">{tax.label}</span>
                                        <Tooltip text={tax.hint}>
                                            <svg className="w-3.5 h-3.5 text-slate-300 cursor-help hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </Tooltip>
                                    </div>
                                    <div className="relative">
                                        {tax.state === null ? (
                                            <button
                                                onClick={() => tax.setter(Math.round(tax.value))}
                                                className="font-mono font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                                            >
                                                ¥{format(tax.value)}
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-1 animate-in zoom-in-95">
                                                <input
                                                    type="number"
                                                    className="w-20 text-right font-mono font-bold text-indigo-600 bg-white border border-indigo-300 rounded px-1 text-sm outline-none"
                                                    value={tax.state}
                                                    onChange={(e) => tax.setter(Number(e.target.value))}
                                                    autoFocus
                                                />
                                                <button onClick={() => tax.setter(null)} className="text-xs text-slate-400 hover:text-red-500">×</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-4 bg-white rounded-xl border border-indigo-100 shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-slate-500">支出合計 (月平均)</span>
                                <span className="text-xl font-black text-slate-900">¥{format(result.breakdown.totalMonthlyOut + result.yearlyExpenses / 12)}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                <div className="bg-amber-400 h-full" style={{ width: `${(result.yearlyExpenses / 12 / result.breakdown.totalMonthlyOut) * 100}%` }}></div>
                                <div className="bg-indigo-500 h-full flex-1"></div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                                <h3 className="text-xs font-black text-emerald-700 uppercase mb-2 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                    資金繰りアドバイス
                                </h3>
                                <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                                    税金と社保のために、毎月 <span className="text-sm font-bold underline decoration-emerald-300">¥{format(result.breakdown.totalMonthlyOut - result.breakdown.savings)}</span> を事業用口座とは別の「納税用口座」へ移動させておくと安心です。
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

            </div>

            {/* Footer / Info */}
            <div className="mt-12 text-center text-slate-400">
                <p className="text-[10px] font-medium max-w-2xl mx-auto leading-relaxed">
                    ※本シミュレーターは概算値であり、正確な税額を保証するものではありません。実際の確定申告や納税に関しては、お住まいの自治体や税務署、税理士にご相談ください。
                </p>
            </div>

        </div>
    );
}
