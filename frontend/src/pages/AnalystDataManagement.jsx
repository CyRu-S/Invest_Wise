import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Database,
  Download,
  FileSpreadsheet,
  Filter,
  PencilLine,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import api from '../services/api';
import './AnalystDataManagement.css';

const CATEGORY_OPTIONS = ['EQUITY', 'DEBT', 'HYBRID', 'ELSS'];

const EMPTY_FORM = {
  fundName: '',
  tickerSymbol: '',
  category: 'EQUITY',
  riskRating: '3',
  currentNav: '',
  expenseRatio: '',
  fundManager: '',
  minInvestment: '',
  description: '',
};

function toFormValues(fund) {
  return {
    fundName: fund?.fundName || '',
    tickerSymbol: fund?.tickerSymbol || '',
    category: fund?.category || 'EQUITY',
    riskRating: String(fund?.riskRating ?? 3),
    currentNav: fund?.currentNav ?? '',
    expenseRatio: fund?.expenseRatio ?? '',
    fundManager: fund?.fundManager || '',
    minInvestment: fund?.minInvestment ?? '',
    description: fund?.description || '',
  };
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return 'INR 0';
  return `INR ${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function formatDecimal(value, digits = 2) {
  if (value === null || value === undefined || value === '') return '0.00';
  return Number(value).toFixed(digits);
}

function normalizePayload(values) {
  return {
    fundName: values.fundName.trim(),
    tickerSymbol: values.tickerSymbol.trim().toUpperCase(),
    category: values.category,
    riskRating: Number(values.riskRating || 0),
    currentNav: values.currentNav === '' ? null : Number(values.currentNav),
    expenseRatio: values.expenseRatio === '' ? null : Number(values.expenseRatio),
    fundManager: values.fundManager.trim(),
    minInvestment: values.minInvestment === '' ? null : Number(values.minInvestment),
    description: values.description.trim(),
  };
}

function parseDelimitedRow(row) {
  const cells = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < row.length; index += 1) {
    const char = row[index];
    const nextChar = row[index + 1];

    if (char === '"' && quoted && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === ',' && !quoted) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseImportText(text) {
  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  const headers = parseDelimitedRow(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line, index) => {
    const cells = parseDelimitedRow(line);
    const row = headers.reduce((accumulator, header, cellIndex) => {
      accumulator[header] = cells[cellIndex] ?? '';
      return accumulator;
    }, {});

    return {
      rowNumber: index + 2,
      fundName: row.fundName || row.name || '',
      tickerSymbol: (row.tickerSymbol || row.ticker || '').toUpperCase(),
      category: (row.category || 'EQUITY').toUpperCase(),
      riskRating: row.riskRating || row.risk || '3',
      currentNav: row.currentNav || row.nav || '',
      expenseRatio: row.expenseRatio || row.expense || '',
      fundManager: row.fundManager || row.manager || '',
      minInvestment: row.minInvestment || row.minimumInvestment || '',
      description: row.description || '',
    };
  });
}

function parseImportFileContent(text, extension) {
  if (extension === 'json') {
    const parsed = JSON.parse(text);
    const items = Array.isArray(parsed) ? parsed : [];
    return items.map((item, index) => ({
      rowNumber: index + 1,
      fundName: item.fundName || item.name || '',
      tickerSymbol: (item.tickerSymbol || item.ticker || '').toUpperCase(),
      category: (item.category || 'EQUITY').toUpperCase(),
      riskRating: item.riskRating ?? item.risk ?? '3',
      currentNav: item.currentNav ?? item.nav ?? '',
      expenseRatio: item.expenseRatio ?? item.expense ?? '',
      fundManager: item.fundManager ?? item.manager ?? '',
      minInvestment: item.minInvestment ?? item.minimumInvestment ?? '',
      description: item.description ?? '',
    }));
  }

  return parseImportText(text);
}

function getImportValidationError(row) {
  if (!row.fundName) return 'Missing fund name';
  if (!row.tickerSymbol) return 'Missing ticker symbol';
  if (!CATEGORY_OPTIONS.includes(row.category)) return 'Invalid category';
  if (Number(row.riskRating) < 1 || Number(row.riskRating) > 5) return 'Risk must be between 1 and 5';
  return '';
}

function buildImportPreview(rows, funds) {
  const fundMap = new Map(funds.map((fund) => [fund.tickerSymbol?.toUpperCase(), fund]));

  return rows
    .map((row) => {
      const existing = fundMap.get(row.tickerSymbol);
      const validationError = getImportValidationError(row);
      const isValid = !validationError;

      return {
        ...row,
        id: existing?.id ?? null,
        mode: existing ? 'update' : 'create',
        isValid,
        validationError,
      };
    })
    .filter((row) => row.fundName || row.tickerSymbol);
}

export default function AnalystDataManagement() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState(null);
  const [formValues, setFormValues] = useState(EMPTY_FORM);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [importRows, setImportRows] = useState([]);
  const [importResults, setImportResults] = useState([]);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  const loadFunds = async () => {
    try {
      const response = await api.get('/funds/public');
      setFunds(response.data);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Unable to load fund records right now.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFunds();
  }, []);

  const filteredFunds = useMemo(() => {
    return funds.filter((fund) => {
      const matchesSearch =
        !searchQuery ||
        fund.fundName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fund.tickerSymbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fund.fundManager?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || fund.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, funds, searchQuery]);

  const selectedFund = useMemo(
    () => funds.find((fund) => fund.id === selectedId) || null,
    [funds, selectedId]
  );

  const importPreview = useMemo(() => buildImportPreview(importRows, funds), [funds, importRows]);

  const stats = useMemo(() => {
    const categories = new Set(funds.map((fund) => fund.category).filter(Boolean)).size;
    const averageExpense =
      funds.reduce((sum, fund) => sum + Number(fund.expenseRatio || 0), 0) / Math.max(funds.length, 1);
    const highRiskCount = funds.filter((fund) => Number(fund.riskRating) >= 4).length;

    return {
      total: funds.length,
      categories,
      averageExpense,
      highRiskCount,
    };
  }, [funds]);

  const resetForm = () => {
    setSelectedId(null);
    setFormValues(EMPTY_FORM);
  };

  const handleFieldChange = (field, value) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSelectFund = (fund) => {
    setSelectedId(fund.id);
    setFormValues(toFormValues(fund));
    setMessage({ type: '', text: '' });
    requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = normalizePayload(formValues);

      if (selectedId) {
        await api.put(`/funds/${selectedId}`, payload);
        setMessage({ type: 'success', text: `${payload.tickerSymbol} updated successfully.` });
      } else {
        await api.post('/funds', payload);
        setMessage({ type: 'success', text: `${payload.tickerSymbol} created successfully.` });
        resetForm();
      }

      await loadFunds();
    } catch (error) {
      console.error(error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to save this fund right now.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFund = async (fund) => {
    if (!fund?.id) return;
    if (!window.confirm(`Delete ${fund.fundName}? This will remove its history as well.`)) return;

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.delete(`/funds/${fund.id}`);
      setMessage({ type: 'success', text: `${fund.tickerSymbol} deleted successfully.` });
      if (selectedId === fund.id) {
        resetForm();
      }
      await loadFunds();
    } catch (error) {
      console.error(error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Delete is unavailable for this account.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const content = await file.text();
      const parsedRows = parseImportFileContent(content, extension);
      setImportRows(parsedRows);
      setImportResults([]);
      setMessage({
        type: 'success',
        text: `${parsedRows.length} rows prepared for import review.`,
      });
    } catch (error) {
      console.error(error);
      setImportRows([]);
      setMessage({ type: 'error', text: 'Unable to parse that file. Use CSV or JSON.' });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadTemplate = () => {
    const csv = [
      'fundName,tickerSymbol,category,riskRating,currentNav,expenseRatio,fundManager,minInvestment,description',
      'Sample Equity Alpha Fund,SEAF,EQUITY,4,152.4380,1.25,Riya Kapoor,5000,Large cap growth strategy with active selection',
      'Sample Debt Shield Fund,SDSF,DEBT,2,112.1250,0.65,Arjun Mehta,1000,Income-oriented debt allocation fund',
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'investwise-fund-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyImport = async () => {
    const readyRows = importPreview.filter((row) => row.isValid);
    if (!readyRows.length) {
      setMessage({ type: 'error', text: 'No valid rows are ready to import.' });
      return;
    }

    setImporting(true);
    setMessage({ type: '', text: '' });

    let created = 0;
    let updated = 0;
    let failed = 0;
    const results = [];

    for (const row of importPreview) {
      if (!row.isValid) {
        failed += 1;
        results.push({
          rowNumber: row.rowNumber,
          tickerSymbol: row.tickerSymbol || 'Unknown',
          status: 'invalid',
          message: row.validationError,
        });
        continue;
      }

      try {
        const payload = normalizePayload(row);

        if (row.mode === 'update' && row.id) {
          await api.put(`/funds/${row.id}`, payload);
          updated += 1;
          results.push({
            rowNumber: row.rowNumber,
            tickerSymbol: row.tickerSymbol,
            status: 'updated',
            message: 'Existing fund updated',
          });
        } else {
          await api.post('/funds', payload);
          created += 1;
          results.push({
            rowNumber: row.rowNumber,
            tickerSymbol: row.tickerSymbol,
            status: 'created',
            message: 'New fund created',
          });
        }
      } catch (error) {
        console.error(error);
        failed += 1;
        results.push({
          rowNumber: row.rowNumber,
          tickerSymbol: row.tickerSymbol || 'Unknown',
          status: 'failed',
          message: error.response?.data?.message || 'Request failed for this row',
        });
      }
    }

    setImportResults(results);
    if (!failed) {
      setImportRows([]);
    }

    setMessage({
      type: failed ? 'error' : 'success',
      text: failed
        ? `Import finished with issues. ${created} created, ${updated} updated, ${failed} failed or invalid.`
        : `Import applied successfully. ${created} created, ${updated} updated.`,
    });

    await loadFunds();
    setImporting(false);
  };

  if (loading) {
    return (
      <div className="page-container analyst-data-page">
        <div className="analyst-data-loading">
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container analyst-data-page" id="analyst-data-page">
      <section className="analyst-data-hero">
        <div className="analyst-data-hero__copy">
          <span className="analyst-data-hero__kicker">
            <Sparkles size={16} />
            Analyst Data Management
          </span>
          <h1>Maintain the live fund universe from one analyst workspace.</h1>
          <p>
            Create records, update live fund metadata, and apply reviewed imports without dropping
            back into placeholder pipeline tools.
          </p>
          <div className="analyst-data-hero__chips">
            <span className="analyst-data-chip">Manual fund editor</span>
            <span className="analyst-data-chip">Bulk import review</span>
          </div>
        </div>

        <div className="analyst-data-hero__summary">
          <div className="analyst-data-hero__stat analyst-data-hero__stat--indigo">
            <span>Total funds</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="analyst-data-hero__stat analyst-data-hero__stat--violet">
            <span>Categories</span>
            <strong>{stats.categories}</strong>
          </div>
          <div className="analyst-data-hero__stat analyst-data-hero__stat--emerald">
            <span>Avg expense</span>
            <strong>{formatDecimal(stats.averageExpense)}%</strong>
          </div>
          <div className="analyst-data-hero__stat analyst-data-hero__stat--amber">
            <span>High risk funds</span>
            <strong>{stats.highRiskCount}</strong>
          </div>
        </div>
      </section>

      {message.text ? (
        <div className={`analyst-data-feedback analyst-data-feedback--${message.type}`}>
          {message.text}
        </div>
      ) : null}

      <section className="analyst-data-workspace">
        <form ref={editorRef} className="analyst-data-panel analyst-data-editor" onSubmit={handleSubmit}>
          <div className="analyst-data-panel__header">
            <div>
              <span className="analyst-data-panel__eyebrow">
                <PencilLine size={15} />
                {selectedId ? 'Edit fund record' : 'Create fund record'}
              </span>
              <h2>{selectedId ? 'Refine the selected fund metadata.' : 'Add a new fund into coverage.'}</h2>
            </div>
          </div>

          <div className="analyst-data-form-grid">
            <label className="analyst-data-field analyst-data-field--span-2">
              <span>Fund name</span>
              <input
                type="text"
                value={formValues.fundName}
                onChange={(event) => handleFieldChange('fundName', event.target.value)}
                placeholder="Nifty Growth Equity Fund"
                required
              />
            </label>

            <label className="analyst-data-field">
              <span>Ticker</span>
              <input
                type="text"
                value={formValues.tickerSymbol}
                onChange={(event) => handleFieldChange('tickerSymbol', event.target.value.toUpperCase())}
                placeholder="NGEF"
                required
              />
            </label>

            <label className="analyst-data-field">
              <span>Category</span>
              <select
                value={formValues.category}
                onChange={(event) => handleFieldChange('category', event.target.value)}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="analyst-data-field">
              <span>Risk rating</span>
              <input
                type="number"
                min="1"
                max="5"
                value={formValues.riskRating}
                onChange={(event) => handleFieldChange('riskRating', event.target.value)}
                required
              />
            </label>

            <label className="analyst-data-field">
              <span>Current NAV</span>
              <input
                type="number"
                min="0"
                step="0.0001"
                value={formValues.currentNav}
                onChange={(event) => handleFieldChange('currentNav', event.target.value)}
              />
            </label>

            <label className="analyst-data-field">
              <span>Expense ratio</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formValues.expenseRatio}
                onChange={(event) => handleFieldChange('expenseRatio', event.target.value)}
              />
            </label>

            <label className="analyst-data-field">
              <span>Min investment</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formValues.minInvestment}
                onChange={(event) => handleFieldChange('minInvestment', event.target.value)}
              />
            </label>

            <label className="analyst-data-field analyst-data-field--span-2">
              <span>Fund manager</span>
              <input
                type="text"
                value={formValues.fundManager}
                onChange={(event) => handleFieldChange('fundManager', event.target.value)}
                placeholder="A manager name"
              />
            </label>

            <label className="analyst-data-field analyst-data-field--span-2">
              <span>Description</span>
              <textarea
                rows="4"
                value={formValues.description}
                onChange={(event) => handleFieldChange('description', event.target.value)}
                placeholder="What should analysts and investors know about this fund?"
              />
            </label>
          </div>

          <div className="analyst-data-editor__actions">
            <button type="submit" className="analyst-data-primary" disabled={saving}>
              <Save size={15} />
              {saving ? 'Saving...' : selectedId ? 'Save changes' : 'Create fund'}
            </button>

            <button type="button" className="analyst-data-ghost" onClick={resetForm} disabled={saving}>
              <Plus size={15} />
              Reset form
            </button>
          </div>
        </form>

        <div className="analyst-data-panel analyst-data-import">
          <div className="analyst-data-panel__header">
            <div>
              <span className="analyst-data-panel__eyebrow">
                <Upload size={15} />
                Bulk import
              </span>
              <h2>Review file rows before they touch the live dataset.</h2>
            </div>
          </div>

          <p className="analyst-data-import__copy">
            Upload a CSV or JSON file. Matching ticker symbols will update existing funds; new
            tickers will be created.
          </p>

          <div className="analyst-data-import__controls">
            <label className="analyst-data-upload">
              <FileSpreadsheet size={18} />
              <span>Choose CSV or JSON</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleImportFile}
              />
            </label>

            <button type="button" className="analyst-data-ghost" onClick={handleDownloadTemplate}>
              <Download size={15} />
              Download template
            </button>

            <button
              type="button"
              className="analyst-data-primary"
              onClick={handleApplyImport}
              disabled={!importPreview.some((row) => row.isValid) || importing}
            >
              <Upload size={15} />
              {importing ? 'Applying...' : 'Apply import'}
            </button>
          </div>

          <div className="analyst-data-import__note">
            Expected columns: `fundName`, `tickerSymbol`, `category`, `riskRating`, `currentNav`,
            `expenseRatio`, `fundManager`, `minInvestment`, `description`.
          </div>

          <div className="analyst-data-import__preview">
            {importPreview.length ? (
              importPreview.slice(0, 6).map((row) => (
                <div key={`${row.rowNumber}-${row.tickerSymbol}`} className="analyst-data-import__row">
                  <div>
                    <strong>{row.tickerSymbol || 'Missing ticker'}</strong>
                    <span>{row.fundName || 'Missing fund name'}</span>
                  </div>
                  <div className="analyst-data-import__meta">
                    <span className={`analyst-data-pill analyst-data-pill--${row.mode}`}>
                      {row.mode}
                    </span>
                    <span className={`analyst-data-pill ${row.isValid ? 'analyst-data-pill--valid' : 'analyst-data-pill--invalid'}`}>
                      {row.isValid ? 'ready' : 'needs fixing'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="analyst-data-empty">
                <Database size={18} />
                <p>No import file queued yet.</p>
              </div>
            )}
          </div>

          {importResults.length ? (
            <div className="analyst-data-import__results">
              <h3>Last import results</h3>
              <div className="analyst-data-import__results-list">
                {importResults.slice(0, 8).map((result) => (
                  <div key={`${result.rowNumber}-${result.tickerSymbol}-${result.status}`} className="analyst-data-import__result">
                    <strong>Row {result.rowNumber} · {result.tickerSymbol}</strong>
                    <span className={`analyst-data-pill analyst-data-pill--result-${result.status}`}>{result.status}</span>
                    <p>{result.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="analyst-data-dataset">
        <div className="analyst-data-dataset__header">
          <div>
            <span className="analyst-data-panel__eyebrow">
              <Database size={15} />
              Live dataset
            </span>
            <h2>Search the tracked fund inventory and load any row into the editor.</h2>
          </div>
          <div className="analyst-data-toolbar">
            <label className="analyst-data-toolbar__field analyst-data-toolbar__field--search">
              <Search size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by fund, ticker, or manager"
              />
            </label>

            <label className="analyst-data-toolbar__field analyst-data-toolbar__field--select">
              <span>
                <Filter size={14} />
                Category
              </span>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="ALL">All categories</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="analyst-data-table-shell">
          <table className="analyst-data-table">
            <thead>
              <tr>
                <th>Fund</th>
                <th>Category</th>
                <th>Risk</th>
                <th>NAV</th>
                <th>Expense</th>
                <th>Minimum</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFunds.map((fund) => (
                <tr key={fund.id} className={fund.id === selectedId ? 'is-selected' : ''}>
                  <td>
                    <div className="analyst-data-table__fund">
                      <strong>{fund.fundName}</strong>
                      <span>{fund.tickerSymbol}</span>
                    </div>
                  </td>
                  <td>{fund.category}</td>
                  <td>{fund.riskRating}/5</td>
                  <td>{formatDecimal(fund.currentNav, 4)}</td>
                  <td>{formatDecimal(fund.expenseRatio)}%</td>
                  <td>{formatCurrency(fund.minInvestment)}</td>
                  <td>
                    <button
                      type="button"
                      className="analyst-data-table__action"
                      onClick={() => handleSelectFund(fund)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!filteredFunds.length ? (
            <div className="analyst-data-empty analyst-data-empty--table">
              <Search size={18} />
              <p>No funds match the current search and category filter.</p>
            </div>
          ) : null}
        </div>

        {selectedFund ? (
          <div className="analyst-data-selected-bar">
            <div>
              <span className="analyst-data-panel__eyebrow">
                <Trash2 size={15} />
                Selected record
              </span>
              <h3>{selectedFund.fundName}</h3>
              <p>Delete the currently selected fund from the tracked inventory.</p>
            </div>
            <button
              type="button"
              className="analyst-data-danger"
              onClick={() => handleDeleteFund(selectedFund)}
              disabled={saving}
            >
              <Trash2 size={15} />
              Delete selected fund
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
