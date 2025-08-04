import React, { useState, useEffect } from 'react';

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
    const numberOfSets = parseInt(formData.setOf) || 1;
    const newSets = Array.from({ length: numberOfSets }, (_, setIndex) => ({
      id: setIndex,
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

  const handleAdditionalInfoChange = (setIndex, field, value) => {
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
    try {
      const baseDate = new Date(castDate);
      baseDate.setDate(baseDate.getDate() + parseInt(ageDays));
      return baseDate.toLocaleDateString('en-US');
    } catch {
      return '';
    }
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
      alert('Form submitted!');
    } catch (err) {
      console.error(err);
      alert('Submission failed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-sm sm:text-base font-sans">
      <h1 className="text-2xl font-bold mb-4 text-slate-700">Concrete Testing Form</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {['client', 'reportNo', 'project', 'technician', 'location'].map((field) => (
            <div key={field}>
              <label className="block font-medium text-gray-700 capitalize">{field.replace(/([A-Z])/g, ' $1')}:</label>
              <input
                required
                type="text"
                value={formData[field]}
                onChange={(e) => handleFormChange(field, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          ))}
          <div>
            <label className="block font-medium text-gray-700">Cast Date:</label>
            <input
              required
              type="date"
              value={formData.castDate}
              onChange={(e) => handleFormChange('castDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700">Number of Sets:</label>
            <select
              value={formData.setOf}
              onChange={(e) => handleFormChange('setOf', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {sets.map((set, setIndex) => (
          <div key={setIndex} className="bg-gray-50 border border-gray-200 p-4 rounded-lg space-y-4">
            <h2 className="text-lg font-semibold text-slate-700">Test Set {setIndex + 1}</h2>

            <table className="w-full table-auto border-collapse text-sm">
              <thead className="bg-slate-100 border">
                <tr>
                  <th className="border px-2 py-1">Sample ID</th>
                  <th className="border px-2 py-1">Break Date</th>
                  <th className="border px-2 py-1">Age (days)</th>
                  <th className="border px-2 py-1">Load (lbs)</th>
                  <th className="border px-2 py-1">Area (sq.in.)</th>
                  <th className="border px-2 py-1">Strength (psi)</th>
                  <th className="border px-2 py-1">% Design</th>
                  <th className="border px-2 py-1">Fracture Type</th>
                </tr>
              </thead>
              <tbody>
                {set.samples.map((sample, sampleIndex) => {
                  const id = generateSampleId(formData.client, formData.project, setIndex, sampleIndex);
                  const breakDate = calculateBreakDate(formData.castDate, sample.age);
                  return (
                    <tr key={sampleIndex}>
                      <td className="border px-2 py-1">{id}</td>
                      <td className="border px-2 py-1">{breakDate}</td>
                      <td className="border px-2 py-1">
                        <input type="number" value={sample.age} onChange={(e) => handleSampleChange(setIndex, sampleIndex, 'age', e.target.value)} className="w-full p-1 border" />
                      </td>
                      <td className="border px-2 py-1">
                        <input type="number" value={sample.load} onChange={(e) => handleSampleChange(setIndex, sampleIndex, 'load', e.target.value)} className="w-full p-1 border" />
                      </td>
                      <td className="border px-2 py-1">
                        <input type="number" step="0.01" value={sample.area} onChange={(e) => handleSampleChange(setIndex, sampleIndex, 'area', e.target.value)} className="w-full p-1 border" />
                      </td>
                      <td className="border px-2 py-1">
                        <input type="number" value={sample.strength} onChange={(e) => handleSampleChange(setIndex, sampleIndex, 'strength', e.target.value)} className="w-full p-1 border" />
                      </td>
                      <td className="border px-2 py-1">
                        <input type="number" step="0.01" value={sample.percentDesign} onChange={(e) => handleSampleChange(setIndex, sampleIndex, 'percentDesign', e.target.value)} className="w-full p-1 border" />
                      </td>
                      <td className="border px-2 py-1">
                        <input type="text" value={sample.fractureType} onChange={(e) => handleSampleChange(setIndex, sampleIndex, 'fractureType', e.target.value)} className="w-full p-1 border" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <button type="button" onClick={() => addSampleRow(setIndex)} className="text-blue-600 hover:underline text-sm mt-1">
              + Add Sample
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {Object.keys(set.additionalInfo).map((field) => (
                <div key={field}>
                  <label className="block text-gray-600 text-sm capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <input
                    type="text"
                    value={set.additionalInfo[field]}
                    onChange={(e) => handleAdditionalInfoChange(setIndex, field, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4">
          <button type="submit" className="bg-slate-700 text-white px-6 py-2 rounded hover:bg-slate-800">
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConcreteTestingForm;
