import AdminLayout from '../components/admin/AdminLayout'
import { useMonitoringLive } from '../hooks/useMonitoringLive'
import '../styles/AdminMonitoring.css'

const AdminMonitoringLiveCount = (): JSX.Element => {
  const {
    summary,
    candidates,
    faculty,
    tps,
    logs,
    chartMode,
    setChartMode,
    filters,
    setFilters,
    participationPercent,
    publicLiveEnabled,
    setPublicLiveEnabled,
    refreshNow,
    exportSnapshot,
  } = useMonitoringLive()

  return (
    <AdminLayout title="Monitoring Voting">
      <div className="monitoring-page">
        <header className="monitoring-hero">
          <div className="hero-left">
            <div className="badge-row">
              <span className={`status-chip ${summary.statusType}`}>{summary.statusLabel}</span>
              <span className="soft-chip">Mode: Online + TPS</span>
              <span className="soft-chip">Update: {summary.lastUpdated}</span>
            </div>
            <h1>Monitoring Voting & Live Count</h1>
            <p className="hero-subtitle">Pantau suara masuk, TPS, dan partisipasi secara real-time.</p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" type="button" onClick={refreshNow}>
              Refresh Sekarang
            </button>
            <button className="btn-primary" type="button" onClick={exportSnapshot}>
              Export Data
            </button>
          </div>
        </header>

        <section className="summary-grid">
          <article className="summary-card">
            <div className="label-row">
              <span className="pill success">Total Suara</span>
              <span className="muted">{participationPercent}%</span>
            </div>
            <h3>{summary.votesIn.toLocaleString('id-ID')} / {summary.totalVoters.toLocaleString('id-ID')}</h3>
            <div className="progress">
              <div style={{ width: `${participationPercent}%` }} />
            </div>
            <p className="muted">Partisipasi realtime</p>
          </article>
          <article className="summary-card">
            <div className="label-row">
              <span className="pill">Online</span>
              <span className="pill">TPS</span>
            </div>
            <div className="split-stat">
              <div>
                <p className="muted">Online</p>
                <strong>{summary.onlineVotes.toLocaleString('id-ID')}</strong>
              </div>
              <div>
                <p className="muted">TPS</p>
                <strong>{summary.tpsVotes.toLocaleString('id-ID')}</strong>
              </div>
            </div>
          </article>
          <article className="summary-card">
            <div className="label-row">
              <span className="pill">Status TPS</span>
            </div>
            <h3>{summary.tpsActive}/{summary.tpsTotal} aktif</h3>
            <p className="muted">TPS bermasalah: {summary.tpsTotal - summary.tpsActive}</p>
            <label className="toggle-row">
              <input type="checkbox" checked={publicLiveEnabled} onChange={() => setPublicLiveEnabled((prev) => !prev)} />
              Live Count Publik {publicLiveEnabled ? 'Aktif' : 'Mati'}
            </label>
          </article>
        </section>

        <section className="monitoring-grid">
          <article className="card chart-card">
            <div className="chart-header">
              <div>
                <h2>Perolehan Suara per Kandidat</h2>
                <p className="muted">Realtime</p>
              </div>
              <div className="chart-filters">
                <select value={filters.faculty} onChange={(event) => setFilters((prev) => ({ ...prev, faculty: event.target.value }))}>
                  <option value="all">Semua Fakultas</option>
                  <option value="teknik">Teknik</option>
                  <option value="ekonomi">Ekonomi</option>
                </select>
                <select value={filters.tps} onChange={(event) => setFilters((prev) => ({ ...prev, tps: event.target.value }))}>
                  <option value="all">Semua TPS</option>
                  <option value="tps-1">TPS 1</option>
                  <option value="tps-2">TPS 2</option>
                </select>
                <div className="chart-toggle">
                  <button className={chartMode === 'bar' ? 'active' : ''} onClick={() => setChartMode('bar')} type="button">
                    Bar
                  </button>
                  <button className={chartMode === 'pie' ? 'active' : ''} onClick={() => setChartMode('pie')} type="button">
                    Pie
                  </button>
                </div>
              </div>
            </div>

            <div className={`candidate-chart ${chartMode}`}>
              {candidates.map((candidate) => (
                <div key={candidate.id} className="candidate-row">
                  <div className="candidate-info">
                    <span className="badge" style={{ background: candidate.color }} />
                    <strong>{candidate.name}</strong>
                  </div>
                  <div className="candidate-bar">
                    <div style={{ width: `${candidate.percentage}%`, background: candidate.color }} />
                  </div>
                  <div className="candidate-votes">
                    {candidate.votes.toLocaleString('id-ID')} ({candidate.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="card participation-card">
            <div className="card-header">
              <h2>Partisipasi per Fakultas</h2>
              <button className="btn-link" type="button">
                Detail Fakultas →
              </button>
            </div>
            <div className="faculty-list">
              {faculty.map((row) => {
                const percent = Math.round((row.voted / row.total) * 100)
                return (
                  <div key={row.faculty} className="faculty-row">
                    <div className="faculty-meta">
                      <strong>{row.faculty}</strong>
                      <span className="muted">
                        {row.voted.toLocaleString('id-ID')} / {row.total.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="faculty-bar">
                      <div style={{ width: `${percent}%` }} />
                    </div>
                    <span className="percent">{percent}%</span>
                  </div>
                )
              })}
            </div>
          </article>
        </section>

        <section className="card tps-card">
          <div className="card-header">
            <h2>Status TPS</h2>
            <button className="btn-link" type="button" onClick={() => (window.location.href = '/tps-panel')}>
              Buka Panel TPS →
            </button>
          </div>
          <div className="tps-grid">
            {tps.slice(0, 6).map((row) => (
              <div key={row.id} className="tps-tile">
                <div>
                  <h4>{row.name}</h4>
                  <p className="muted">{row.location}</p>
                  <p className="votes">{row.votes.toLocaleString('id-ID')} suara</p>
                </div>
                <span className={`status-pill ${row.status}`}>{row.status === 'active' ? '✔ Aktif' : row.status === 'issue' ? '⚠ Lambat' : 'Tutup'}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card activity-card">
          <div className="card-header">
            <h2>Aktivitas Pemilu</h2>
            <button className="btn-link" type="button">
              Lihat Log Lengkap →
            </button>
          </div>
          <ul className="activity-list">
            {logs.slice(0, 6).map((log) => (
              <li key={log.id}>
                <span className="pulse-dot" />
                <div>
                  <span className="time">{log.timestamp}</span>
                  <p>{log.message}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminLayout>
  )
}

export default AdminMonitoringLiveCount
