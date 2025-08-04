import React, { useState, useEffect } from 'react';

const ConcreteTestingForm = () => {
  const [formData, setFormData] = useState({
    client: '',
    project: '',
    castDate: '',
    location: '',
    reportNo: '',
    technician: '',
    setOf: '1'
  });

  const [tables, setTables] = useState([]);
  const [webhookUrl, setWebhookUrl] = useState('https://hook.us1.make.com/your-make-webhook-url'); // <-- Replace with your webhook
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const numberOfTables = parseInt(formData.setOf) || 1;
    const newTables = Array.from({ length: numberOfTables }, (_, index) => ({
      id: index,
      tableData: [{ ageDays: '', areaSqIn: '' }],
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
        sampleSize: ''
      }
    }));
    setTables(newTables);
  }, [formData.setOf]);

  const generateSampleNumber = (client, project, tableIndex, rowIndex) => {
    const clientInitial = (client?.charAt(0) || 'C').toLowerCase();
    const projectInitial = (project?.charAt(0) || 'P').toLowerCase();
    const sampleNum = (tableIndex * 10) + rowIndex + 1;
    return `${clientInitial}${projectInitial}-${sampleNum}`;
  };

  const calculateDate = (castDate, ageDays) => {
    if (!castDate || !ageDays) return '';
    try {
      const [year, month, day] = castDate.split('-').map(Number);
      const cast = new Date(year, month - 1, day);
      cast.setDate(cast.getDate() + parseInt(ageDays));
      return `${cast.getMonth() + 1}/${cast.getDate()}/${cast.getFullYear().toString().slice(-2)}`;
    } catch {
      return '';
    }
  };

  const generateDocumentContent = () => {
    let content = `Project: ${formData.project}\nClient: ${formData.client}\n`;
    if (formData.castDate) content += `Cast Date: ${formData.castDate}\n`;
    if (formData.location) content += `Location: ${formData.location}\n`;
    if (formData.reportNo) content += `Report No: ${formData.reportNo}\n`;
    if (formData.technician) content += `Technician: ${formData.technician}\n`;
    content += `Set Of: ${formData.setOf}\n\n`;

    tables.forEach((table, tableIndex) => {
      content += `Test Data Set ${tableIndex + 1}:\nSample Number\tDate\tAge (Days)\tArea (Sq.In)\n`;
      table.tableData.forEach((row, rowIndex) => {
        const sampleNumber = generateSampleNumber(formData.client, formData.project, tableIndex, rowIndex);
        const testDate = calculateDate(formData.castDate, row.ageDays);
        content += `${sampleNumber}\t${testDate}\t${row.ageDays}\t${row.areaSqIn}\n`;
      });

      content += `\nAdditional Information:\n`;
      for (const [key, value] of Object.entries(table.additionalInfo)) {
        if (value) content += `${key}: ${value}\n`;
      }
      content += '\n';
    });

    return content;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const documentContent = generateDocumentContent();

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          ...formData,
          documentTitle: `${formData.client} - ${formData.project} - Concrete Testing Report`,
          documentContent,
          tables,
          timestamp: new Date().toISOString()
        })
      });
      alert('Form submitted!');
    } catch (error) {
      alert('Submission failed. Check console.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Concrete Testing Form</h1>
      <form onSubmit={handleSubmit}>
        <label>Client:<br />
          <input value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} required />
        </label><br /><br />
        <label>Project:<br />
          <input value={formData.project} onChange={(e) => setFormData({ ...formData, project: e.target.value })} required />
        </label><br /><br />
        <label>Cast Date:<br />
          <input type="date" value={formData.castDate} onChange={(e) => setFormData({ ...formData, castDate: e.target.value })} required />
        </label><br /><br />
        <label>Set Of (1-5):<br />
          <select value={formData.setOf} onChange={(e) => setFormData({ ...formData, setOf: e.target.value })}>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label><br /><br />

        {tables.map((table, tableIndex) => (
          <div key={tableIndex}>
            <h3>Test Set {tableIndex + 1}</h3>
            {table.tableData.map((row, rowIndex) => (
              <div key={rowIndex}>
                <label>Age (Days): <input type="number" value={row.ageDays} onChange={(e) => {
                  const updated = [...tables];
                  updated[tableIndex].tableData[rowIndex].ageDays = e.target.value;
                  setTables(updated);
                }} /></label>
                <label> Area (Sq.In): <input type="number" step="0.1" value={row.areaSqIn} onChange={(e) => {
                  const updated = [...tables];
                  updated[tableIndex].tableData[rowIndex].areaSqIn = e.target.value;
                  setTables(updated);
                }} /></label>
              </div>
            ))}
            <br />
          </div>
        ))}

        <label>Webhook URL:<br />
          <input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} required />
        </label><br /><br />

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Form'}
        </button>
      </form>
    </div>
  );
};

export default ConcreteTestingForm;
