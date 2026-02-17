'use client';

import React, { useState, useEffect } from 'react';

// Common structure for a "row" of logic
// e.g. IF gender=male AND age>18 THEN require "Army Certificate"
// BUT wait, the parent component handles "require X".
// Ideally, this component just emits a JSON object representing the CONDITION.
// The parent uses this condition to decide whether to show a field or require a doc.

interface LogicBuilderProps {
  value: string; // JSON string of the rule/condition
  onChange: (value: string) => void;
  // Available fields to check against (e.g. valid variables)
  fields: {
    name: string;
    label: string;
    type?: string;
    options?: { label: string; value: string }[];
  }[];
}

// Built-in system fields that refer to the Customer Profile or Order Context
const SYSTEM_FIELDS = [
  {
    name: 'gender',
    label: 'الجنس (ذكر/أنثى)',
    type: 'select',
    options: [
      { label: 'ذكر', value: 'male' },
      { label: 'أنثى', value: 'female' },
    ],
  },
  { name: 'age', label: 'العمر (سنة)', type: 'number' },
  {
    name: 'maritalStatus',
    label: 'الحالة الاجتماعية',
    type: 'select',
    options: [
      { label: 'أعزب', value: 'single' },
      { label: 'متزوج', value: 'married' },
    ],
  },
];

const OPERATORS = [
  { value: 'eq', label: 'يساوي (=)' },
  { value: 'neq', label: 'لا يساوي (!=)' },
  { value: 'gt', label: 'أكبر من (>)' },
  { value: 'lt', label: 'أصغر من (<)' },
  { value: 'contains', label: 'يحتوي على' },
];

export default function LogicBuilder({ value, onChange, fields }: LogicBuilderProps) {
  // We will store an array of rules. All rules must be true (AND logic) for simplicity now.
  // Or we can support groups later. Let's stick to simple AND for MVP.
  // Structure: [ { field: 'gender', op: 'eq', value: 'male' }, ... ]

  type Rule = { field: string; op: string; value: string };
  const [rules, setRules] = useState<Rule[]>([]);

  // Parse initial value (JSON)
  useEffect(() => {
    try {
      if (!value) {
        setRules([]);
        return;
      }
      const data = JSON.parse(value);
      // We expect a simple object mapping like: {"gender":"male", "age":">18"}
      // We need to convert it to our Rule[] format.
      // Note: This format is legacy/simplified. We might want to upgrade it,
      // but let's stick to the current string format for compatibility if other systems use it.
      // Format: key: value. If value starts with > or < or !, we extract op.

      const loadedRules: Rule[] = [];
      Object.entries(data).forEach(([k, v]) => {
        let valStr = String(v);
        let op = 'eq';

        if (valStr.startsWith('>')) {
          op = 'gt';
          valStr = valStr.substring(1);
        } else if (valStr.startsWith('<')) {
          op = 'lt';
          valStr = valStr.substring(1);
        } else if (valStr.startsWith('!')) {
          op = 'neq';
          valStr = valStr.substring(1);
        } else if (valStr.startsWith('*')) {
          op = 'contains';
          valStr = valStr.substring(1);
        } // Custom convention

        loadedRules.push({ field: k, op, value: valStr });
      });
      setRules(loadedRules);
    } catch {
      setRules([]);
    }
  }, [value]);

  // Merge rules back to JSON string
  const updateJson = (newRules: Rule[]) => {
    if (newRules.length === 0) {
      onChange('');
      return;
    }
    const obj: Record<string, string> = {};
    newRules.forEach(r => {
      if (!r.field) return;
      let prefix = '';
      if (r.op === 'gt') prefix = '>';
      if (r.op === 'lt') prefix = '<';
      if (r.op === 'neq') prefix = '!';
      if (r.op === 'contains') prefix = '*';
      obj[r.field] = prefix + r.value;
    });
    onChange(JSON.stringify(obj));
  };

  const addRule = () => {
    const newRules = [...rules, { field: '', op: 'eq', value: '' }];
    setRules(newRules);
    // Don't update JSON yet until valid? Or just update.
    updateJson(newRules);
  };

  const removeRule = (idx: number) => {
    const newRules = rules.filter((_, i) => i !== idx);
    setRules(newRules);
    updateJson(newRules);
  };

  const updateRule = (idx: number, key: keyof Rule, val: string) => {
    const newRules = rules.map((r, i) => (i === idx ? { ...r, [key]: val } : r));
    setRules(newRules);
    updateJson(newRules);
  };

  // Combine system fields + dynamic fields (questions)
  // Dynamic fields from props are like: { name: 'question_1', label: 'هل لديك ...' }
  const allFieldOptions = [
    { label: '--- بيانات العميل ---', options: SYSTEM_FIELDS },
    { label: '--- إجابات الأسئلة ---', options: fields.map(f => ({ ...f, type: 'text' })) }, // Treat questions as text/select generic
  ];

  return (
    <div className='bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3'>
      <div className='flex justify-between items-center'>
        <h4 className='text-xs font-black text-slate-500 uppercase tracking-widest'>
          حدد الشروط اللازمة (Logic)
        </h4>
        <button
          type='button'
          onClick={addRule}
          className='text-[10px] font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors'
        >
          + إضافة شرط
        </button>
      </div>

      {rules.length === 0 ? (
        <div className='text-center py-2 text-xs text-slate-400 font-medium italic'>
          يظهر دائماً (بدون شروط)
        </div>
      ) : (
        <div className='space-y-2'>
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className='flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm'
            >
              {/* Field Select */}
              <select
                value={rule.field}
                onChange={e => updateRule(idx, 'field', e.target.value)}
                className='text-xs font-bold text-slate-700 bg-slate-50 border-transparent rounded-md focus:bg-white focus:border-indigo-200 outline-none py-1.5 px-2 flex-1'
              >
                <option value=''>اختر الحقل...</option>
                {allFieldOptions.map((group, gIdx) => (
                  <optgroup key={gIdx} label={group.label}>
                    {group.options.map(opt => (
                      <option key={opt.name} value={opt.name}>
                        {opt.label || opt.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              {/* Operator Select */}
              <select
                value={rule.op}
                onChange={e => updateRule(idx, 'op', e.target.value)}
                className='text-xs font-bold text-slate-600 bg-slate-50 border-transparent rounded-md focus:bg-white focus:border-indigo-200 outline-none py-1.5 px-1 w-24'
              >
                {OPERATORS.map(op => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>

              {/* Value Input or Select */}
              {(() => {
                const selectedField =
                  SYSTEM_FIELDS.find(f => f.name === rule.field) ||
                  fields.find(f => f.name === rule.field);
                if (selectedField?.options && selectedField.options.length > 0) {
                  return (
                    <select
                      value={rule.value}
                      onChange={e => updateRule(idx, 'value', e.target.value)}
                      className='text-xs font-bold text-slate-800 bg-slate-50 border-transparent rounded-md focus:bg-white focus:border-indigo-200 outline-none py-1.5 px-3 flex-1 min-w-[80px]'
                    >
                      <option value=''>اختر القيمة...</option>
                      {selectedField.options.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  );
                }
                return (
                  <input
                    type='text'
                    value={rule.value}
                    onChange={e => updateRule(idx, 'value', e.target.value)}
                    placeholder='القيمة (مثال: نعم, 18)'
                    className='text-xs font-bold text-slate-800 bg-slate-50 border-transparent rounded-md focus:bg-white focus:border-indigo-200 outline-none py-1.5 px-3 flex-1 min-w-[80px]'
                  />
                );
              })()}

              {/* Remove Button */}
              <button
                type='button'
                onClick={() => removeRule(idx)}
                className='w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors'
              >
                ×
              </button>
            </div>
          ))}
          <p className='text-[9px] text-slate-400 px-1'>
            * يجب أن تتحقق <strong>جميع</strong> الشروط أعلاه (AND)
          </p>
        </div>
      )}
    </div>
  );
}
