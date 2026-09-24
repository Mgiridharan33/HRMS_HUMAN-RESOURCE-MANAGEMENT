import React from 'react';
import "./EmployeeSimplePages.css";

function Announcements() {
  return (
    <main className="employee-simple-page">
      <div className="employee-simple-shell">
        <span className="employee-simple-eyebrow">Employee portal</span>
        <h1 className="employee-simple-title">Announcements</h1>
        <p className="employee-simple-description">
          Keep up with HR updates, company news, and important notices.
        </p>
        <section className="employee-simple-card">
          <h2>No announcements yet</h2>
          <p>New announcements from HR will appear here.</p>
        </section>
      </div>
    </main>
  )
}

export default Announcements