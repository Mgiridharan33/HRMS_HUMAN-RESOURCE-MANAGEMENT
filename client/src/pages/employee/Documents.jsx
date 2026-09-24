import React from 'react';
import "./EmployeeSimplePages.css";

function Documents() {
  return (
    <main className="employee-simple-page">
      <div className="employee-simple-shell">
        <span className="employee-simple-eyebrow">Employee portal</span>
        <h1 className="employee-simple-title">Documents</h1>
        <p className="employee-simple-description">
          Access your employment documents and shared files.
        </p>
        <section className="employee-simple-card">
          <h2>No documents yet</h2>
          <p>Documents shared by HR will appear here.</p>
        </section>
      </div>
    </main>
  )
}

export default Documents