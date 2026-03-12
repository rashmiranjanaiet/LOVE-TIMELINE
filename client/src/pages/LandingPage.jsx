import { Link } from "react-router-dom";

import { useAuth } from "../auth-context.jsx";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="page-shell landing-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Private relationship scrapbook</p>
          <h1>Keep every chapter of your love story in one timeline.</h1>
          <p className="hero-text">
            Save first meetings, anniversaries, birthdays, trips, photos, and video memories, then
            let n8n handle reminders and romantic messages in the background.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to={isAuthenticated ? "/dashboard" : "/auth"}>
              {isAuthenticated ? "Open Dashboard" : "Start Your Timeline"}
            </Link>
            <a className="secondary-button" href="#features">
              Explore Features
            </a>
          </div>
        </div>

        <div className="hero-metrics">
          <div className="metric-card">
            <span className="metric-number">365+</span>
            <p>days of memories tracked with one anniversary counter.</p>
          </div>
          <div className="metric-card">
            <span className="metric-number">n8n</span>
            <p>automation hooks for reminders, new-memory emails, and monthly love notes.</p>
          </div>
        </div>
      </section>

      <section className="feature-grid" id="features">
        <article className="feature-card">
          <h2>Shared timeline</h2>
          <p>Capture milestones in order with images, videos, places, and story notes.</p>
        </article>
        <article className="feature-card">
          <h2>Smart counters</h2>
          <p>See days together and the next anniversary countdown as soon as you log in.</p>
        </article>
        <article className="feature-card">
          <h2>Automation-ready</h2>
          <p>Trigger n8n when a memory is added and run daily or monthly email workflows on a schedule.</p>
        </article>
      </section>
    </div>
  );
}
