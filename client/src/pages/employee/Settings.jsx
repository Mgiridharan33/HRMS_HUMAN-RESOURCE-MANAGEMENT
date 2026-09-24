import React from 'react';
import "./EmployeeSimplePages.css";

function Settings() {
  return (
    <main className="employee-simple-page">
      <div className="employee-simple-shell">
        <span className="employee-simple-eyebrow">Employee portal</span>
        <h1 className="employee-simple-title">Settings</h1>
        <p className="employee-simple-description">
          Manage your employee portal preferences.
        </p>
        <section className="employee-simple-card">
          <h2>Account settings</h2>
          <p>Your account preferences will appear here.</p>
        </section>
      </div>
    </main>
  )
}

export default Settings