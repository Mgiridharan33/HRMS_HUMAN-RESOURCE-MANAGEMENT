import React from 'react';
import "./EmployeeSimplePages.css";

function Payroll() {
  return (
    <main className="employee-simple-page">
      <div className="employee-simple-shell">
        <span className="employee-simple-eyebrow">Employee portal</span>
        <h1 className="employee-simple-title">Payroll</h1>
        <p className="employee-simple-description">
          Review salary information, payslips, and payment history.
        </p>
        <section className="employee-simple-card">
          <h2>Payroll workspace</h2>
          <p>Your payroll records will appear here.</p>
        </section>
      </div>
    </main>
  )
}

export default Payroll