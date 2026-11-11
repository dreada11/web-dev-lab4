import { useState } from "react";
import "./DiscountCalculator.css";

const CATEGORIES = [
  { id: "electronics", label: "Электроника", discount: 5 },
  { id: "clothing", label: "Одежда", discount: 10 },
  { id: "groceries", label: "Продукты", discount: 10 },
  { id: "books", label: "Книги", discount: 20 },
  { id: "other", label: "Другое", discount: 0 },
];
const VAT_RATE = 0.22;

function DiscountCalculator() {
  const [items, setItems] = useState([{ id: Date.now(), price: "", category: "electronics" }]);
  const [promoCode, setPromoCode] = useState("");
  const [customDiscount, setCustomDiscount] = useState(0);
  const [includeVAT, setIncludeVAT] = useState(true);
  const [calculated, setCalculated] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), price: "", category: "electronics" }]);
    setCalculated(false);
  };

  const handleRemoveItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
      setCalculated(false);
    }
  };

  const handleItemChange = (id, field, value) => {
    if (field === "price" && value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    setCalculated(false);
  };

  const handleCalculate = () => {
    let hasError = false;
    for (let item of items) {
      const numPrice = parseFloat(item.price);
      if (!item.price.trim() || isNaN(numPrice) || numPrice <= 0) {
        hasError = true;
        break;
      }
    }

    if (hasError) {
      setError("Заполните корректно цену для всех товаров");
      setCalculated(false);
      return;
    }

    setError("");
    setCalculated(true);

    const totalSum = items.reduce((sum, item) => sum + parseFloat(item.price), 0);
    const totalDiscount = items.reduce((sum, item) => {
      const discountPct = customDiscount > 0 
        ? customDiscount 
        : CATEGORIES.find((c) => c.id === item.category)?.discount || 0;
      return sum + parseFloat(item.price) * (discountPct / 100);
    }, 0);

    let currentTotal = totalSum - totalDiscount;
    
    if (promoCode.trim().toUpperCase() === "WELCOME10") {
      currentTotal -= currentTotal * 0.10;
    }
    
    if (includeVAT) {
      currentTotal += currentTotal * VAT_RATE;
    }

    setHistory((prev) => [
      { id: Date.now(), total: currentTotal, date: new Date().toLocaleString() },
      ...prev,
    ].slice(0, 5));
  };

  const handleReset = () => {
    setItems([{ id: Date.now(), price: "", category: "electronics" }]);
    setPromoCode("");
    setCustomDiscount(0);
    setIncludeVAT(true);
    setCalculated(false);
    setError("");
  };

  let totalSum = 0;
  let totalDiscountAmt = 0;
  let promoDiscountAmt = 0;
  let vatAmount = 0;
  let finalTotal = 0;

  if (calculated) {
    totalSum = items.reduce((sum, item) => sum + parseFloat(item.price), 0);
    
    totalDiscountAmt = items.reduce((sum, item) => {
      const discountPct = customDiscount > 0 
        ? customDiscount 
        : CATEGORIES.find((c) => c.id === item.category)?.discount || 0;
      return sum + parseFloat(item.price) * (discountPct / 100);
    }, 0);

    const afterCategoryDiscount = totalSum - totalDiscountAmt;

    if (promoCode.trim().toUpperCase() === "WELCOME10") {
      promoDiscountAmt = afterCategoryDiscount * 0.10;
    }

    const afterPromo = afterCategoryDiscount - promoDiscountAmt;

    if (includeVAT) {
      vatAmount = afterPromo * VAT_RATE;
    }

    finalTotal = afterPromo + vatAmount;
  }

  const formatRub = (value) =>
    value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="calculator-wrapper">
      <h2 className="calculator-title">Калькулятор скидок</h2>

      {items.map((item, index) => (
        <div key={item.id} style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginBottom: "10px" }}>
          <div className="field" style={{ flex: 1, marginBottom: 0 }}>
            <label className="field__label">Цена (₽) {index + 1}</label>
            <input
              type="text"
              className="field__input"
              value={item.price}
              onChange={(e) => handleItemChange(item.id, "price", e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="field" style={{ flex: 1, marginBottom: 0 }}>
            <label className="field__label">Категория</label>
            <select
              className="field__input field__select"
              value={item.category}
              onChange={(e) => handleItemChange(item.id, "category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => handleRemoveItem(item.id)}
            disabled={items.length === 1}
            style={{
              padding: "10px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: items.length === 1 ? "not-allowed" : "pointer",
              height: "42px"
            }}
          >
            X
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddItem}
        style={{ marginBottom: "20px", padding: "8px 16px", background: "#e5e7eb", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
      >
        + Добавить товар
      </button>

      <div className="field">
        <label className="field__label">Промокод (WELCOME10)</label>
        <input
          type="text"
          className="field__input"
          value={promoCode}
          onChange={(e) => { setPromoCode(e.target.value); setCalculated(false); }}
          placeholder="Введите промокод"
        />
      </div>

      <div className="field">
        <label className="field__label">Кастомная скидка (заменяет категорию): {customDiscount}%</label>
        <input
          type="range"
          min="0"
          max="50"
          value={customDiscount}
          onChange={(e) => { setCustomDiscount(Number(e.target.value)); setCalculated(false); }}
          style={{ width: "100%", cursor: "pointer" }}
        />
      </div>

      <div className="field" style={{ flexDirection: "row", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <input
          type="checkbox"
          id="vatCheck"
          checked={includeVAT}
          onChange={(e) => { setIncludeVAT(e.target.checked); setCalculated(false); }}
          style={{ width: "16px", height: "16px", cursor: "pointer" }}
        />
        <label htmlFor="vatCheck" style={{ cursor: "pointer", fontWeight: "bold" }}>Учитывать НДС (22%)</label>
      </div>

      {error && <div style={{ color: "#ef4444", marginBottom: "15px", textAlign: "center", fontSize: "14px" }}>{error}</div>}

      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={handleCalculate}>Рассчитать</button>
        <button type="button" className="btn btn--secondary" onClick={handleReset}>Сбросить</button>
      </div>

      {calculated && (
        <div className="results">
          <h3 className="results__title">Результаты расчёта</h3>
          <table className="results__table">
            <tbody>
              <tr><td>Сумма без скидки:</td><td className="results__value">{formatRub(totalSum)} ₽</td></tr>
              <tr><td>Скидка (категория/кастом):</td><td className="results__value results__value--discount">-{formatRub(totalDiscountAmt)} ₽</td></tr>
              {promoCode.trim().toUpperCase() === "WELCOME10" && (
                <tr><td>Промокод WELCOME10 (-10%):</td><td className="results__value results__value--discount">-{formatRub(promoDiscountAmt)} ₽</td></tr>
              )}
              {includeVAT && (
                <tr><td>НДС (22%):</td><td className="results__value">+{formatRub(vatAmount)} ₽</td></tr>
              )}
              <tr className="results__row--total"><td>Итого к оплате:</td><td className="results__value">{formatRub(finalTotal)} ₽</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: "30px", borderTop: "1px solid #e5e7eb", paddingTop: "20px" }}>
          <h4 style={{ margin: "0 0 10px", fontSize: "16px" }}>История расчётов (последние 5):</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {history.map((h) => (
              <li key={h.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: "14px" }}>
                <span style={{ color: "#6b7280" }}>{h.date}</span>
                <span style={{ fontWeight: "bold" }}>{formatRub(h.total)} ₽</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default DiscountCalculator;