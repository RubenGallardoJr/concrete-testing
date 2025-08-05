import React, { useState, useEffect } from 'react';
import './theme.css'; // optional if you created theme.css
import './index.css'; // required

const webhookUrl = 'https://hook.us2.make.com/l8daf5wo9l8kul56ux6ljxqn1ek93vl6';

const ConcreteTestingForm = () => {
  const today = new Date().toISOString().slice(0, 10);

  const [formData, setFormData] = useState({
    client: '',
    reportNo: '',
    project: '',
    technician: '',
    castDate: today,
    location: '',
    setOf: 1,
  });

  const [sets, setSets] = useState([]);

  useEffect(() => {
    const num = parseInt(formData.setOf) || 1;
    const newSets = Array.from({ length: num }, (_, i) => ({
      id: i,
      samples: [
        {
          age: '',
          load: '',
          area: '',
          strength: '',
          percentDesign: '',
          fractureType: ''
        }
      ],
      additionalInfo: {
        supplier: '',
        truck: '',
        auditNo: '',
        designNo: '',
        productNo: '',
        batchTime: '',
        sampleTime: '',
        concreteTemp: '',
        ambientTemp: '',
        slump: '',
        airContent: '',
        unitWeight: '',
        fieldCured: '',
        sampleType: '',
        sampleSize: '',
        arrivalTime: '',
        departureTime: '',
        remarks: '',
        personNotified: ''
      }
    }));
    setSets(newSets);
  }, [formData.setOf]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSampleChange = (setIndex, sampleIndex, field, value) => {
    const updated = [...sets];
    updated[setIndex].samples[sampleIndex][field] = value;
    setSets(updated);
  };

  const handleAdditionalChange = (setIndex, field, value) => {
    const updated = [...sets];
    updated[setIndex].additionalInfo[field] = value;
    setSets(updated);
  };

  const addSampleRow = (setIndex) => {
    const updated = [...sets];
    updated[setIndex].samples.push({
      age: '',
      load: '',
      area: '',
      strength: '',
      percentDesign: '',
      fractureType: ''
    });
    setSets(updated);
  };

  const generateSampleId = (client, project, setNum, sampleNum) => {
    const c = (client?.charAt(0) || 'C').toUpperCase();
    const p = (project?.charAt(0) || 'P').toUpperCase();
    return `${c}${p}-${setNum + 1}-${sampleNum + 1}`;
  };

  const calculateBreakDate = (castDate, ageDays) => {
    if (!castDate || !ageDays) return '';
    const base = new Date(castDate);
    const days = parseInt(ageDays);
    if (isNaN(days)) return '';
    const result = new Date(base);
    result.setDate(result.getDate() + days);
    return result.toLocaleDateString('en-US');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = `${formData.client} - ${formData.project} - ${formData.reportNo}`;
    const payload = {
      ...formData,
      sets,
      reportTitle: title,
      submittedAt: new Date().toISOString()
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      alert('Report submitted!');
    } catch (err) {
      console.error(err);
      alert('Submission failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans text-slate-800">
      <h1 className="text-2xl font-bold mb-6 text-center text-slate-700">Compressive Strength Test Report</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Information */}
        <section className="form-section grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            ['Client Name', 'client'],
            ['Report Number', 'reportNo'],
            ['Project Name', 'project'],
            ['Technician Name', 'technician'],
            ['Location', 'location']
          ].map(([label, key]) => (
            <div key={key}>
              <label className="form-label">{label}</label>
              <input
                type="text"
                className="form-input"
                value={formData[key]}
                onChange={(e) => handleFormChange(key, e.target.value)}
                required
              />
            </div>
          ))}
          <div>
            <label className="form-label">Cast Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.castDate}
              onChange={(e) => handleFormChange('castDate', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="form-label">Number of Sets</label>
            <select
              className="form-input"
              value={formData.setOf}
              onChange={(e) => handleFormChange('setOf', e.target.value)}
              required
            >
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </section>

        {/* Per Set Sections */}
        {sets.map((set, setIndex) => (
          <div key={setIndex} className="form-section space-y-4">
            <h2 className="text-lg font-semibold">Test Set {setIndex + 1}</h2>

            {/* Sample Table */}
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {['Sample ID', 'Break Date', 'Age', 'Load (lbs)', 'Area (sq.in.)', 'Strength (psi)', '% Design', 'Fracture Type']
                    .map(col => (
                      <th key={col} className="border px-2 py-1 text-left">{col}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {set.samples.map((s, i) => {
                  const sid = generateSampleId(formData.client, formData.project, setIndex, i);
                  const breakDate = calculateBreakDate(formData.castDate, s.age);
                  return (
                    <tr key={i}>
                      <td className="border px-2 py-1">{sid}</td>
                      <td className="border px-2 py-1">{breakDate}</td>
                      {['age', 'load', 'area', 'strength', 'percentDesign', 'fractureType'].map(field => (
                        <td key={field} className="border px-2 py-1">
                          <input
                            type={field === 'fractureType' ? 'text' : 'number'}
                            value={s[field]}
                            onChange={(e) => handleSampleChange(setIndex, i, field, e.target.value)}
                            className="w-full p-1 border border-gray-300 rounded"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button type="button" onClick={() => addSampleRow(setIndex)} className="text-blue-600 hover:underline mt-1">
              + Add Sample
            </button>

            {/* Additional Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
              {Object.entries(set.additionalInfo).map(([field, value]) => (
                <div key={field}>
                  <label className="form-label">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={value}
                    onChange={(e) => handleAdditionalChange(setIndex, field, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Submit Button */}
        <div className="text-center">
          <button type="submit" className="bg-slate-700 text-white px-8 py-2 rounded hover:bg-slate-800">
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConcreteTestingForm;
