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
      const resultDate = new Date(baseDate.getTime());
      resultDate.setDate(resultDate.getDate() + parseInt(ageDays));
      return resultDate.toLocaleDateString('en-US');
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
    <div className="max-w-5xl mx-auto p-6 text-sm font-sans text-slate-800">
      <h1 className="text-2xl font-bold mb-6 text-slate-700 text-center">Compressive Strength Test Report</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 border border-gray-200 rounded">
          {[
            ['Client Name', 'client'],
            ['Report Number', 'reportNo'],
            ['Project Name', 'project'],
            ['Technician Name', 'technician'],
            ['Location', 'location']
          ].map(([label, key]) => (
            <div key={key}>
              <label className="block font-medium">{label}</label>
              <input
                type="text"
                value={formData[key]}
                onChange={(e) => handleFormChange(key, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
          ))}
          <div>
            <label className="block font-medium">Cast Date</label>
            <input
              type="date"
              value={formData.castDate}
              onChange={(e) => handleFormChange('castDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block font-medium">Number of Sets</label>
            <select
              value={formData.setOf}
              onChange={(e) => handleFormChange('setOf', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </section>

        {sets.map((set, setIndex) => (
          <div key={setIndex} className="bg-white border border-gray-300 p-4 rounded space-y-4">
            <h2 className="text-lg font-semibold text-slate-700">Test Set {setIndex + 1}</h2>

            <table className="w-full text-sm border border-gray-300">
              <thead className="bg-gray-100 text-left">
                <tr>
                  {['Sample No.', 'Break Date', 'Age (days)', 'Load (lbs)', 'Area (sq.in.)', 'Strength (psi)', '% Design', 'Fracture Type'].map((label) => (
                    <th key={label} className="border px-2 py-1">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {set.samples.map((sample, sampleIndex) => {
                  const sampleId = generateSampleId(formData.client, formData.project, setIndex, sampleIndex);
                  const breakDate = calculateBreakDate(formData.castDate, sample.age);
                  return (
                    <tr key={sampleIndex}>
                      <td className="border px-2 py-1">{sampleId}</td>
                      <td className="border px-2 py-1">{breakDate}</td>
                      {['age', 'load', 'area', 'strength', 'percentDesign', 'fractureType'].map((field) => (
                        <td key={field} className="border px-2 py-1">
                          <input
                            type={field === 'fractureType' ? 'text' : 'number'}
                            step="any"
                            value={sample[field]}
                            onChange={(e) => handleSampleChange(setIndex, sampleIndex, field, e.target.value)}
                            className="w-full p-1 border border-gray-300 rounded"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <button type="button" onClick={() => addSampleRow(setIndex)} className="text-blue-600 mt-2 hover:underline">
              + Add Sample
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {Object.entries(set.additionalInfo).map(([field, value]) => (
                <div key={field}>
                  <label className="block text-sm font-medium capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleAdditionalInfoChange(setIndex, field, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center pt-6">
          <button type="submit" className="bg-slate-700 text-white px-8 py-2 rounded hover:bg-slate-800">
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConcreteTestingForm;
