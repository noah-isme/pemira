import type { JSX } from 'react'
import Header from '../components/Header'
import '../styles/Tentang.css'

const Tentang = (): JSX.Element => {
    return (
        <div className="tentang-page">
            <Header />

            <main className="tentang-container">
                <div className="tentang-header">
                    <h1 className="tentang-title">Tentang PEMIRA UNIWA</h1>
                    <p className="tentang-subtitle">
                        PEMILIHAN UMUM RAYA UNIVERSITAS WAHIDIYAH 2025
                    </p>
                </div>

                <div className="tentang-content">
                    <section className="tentang-section">
                        <h2 className="section-title">Apa itu PEMIRA?</h2>
                        <div className="section-content">
                            <p>
                                PEMIRA (Pemilihan Umum Raya) adalah kegiatan pemilihan ketua Badan Eksekutif Mahasiswa (BEM)
                                Universitas Wahidiyah yang diselenggarakan secara demokratis dan transparan.
                            </p>
                            <p>
                                PEMIRA UNIWA 2025 merupakan ajang bagi mahasiswa untuk menyalurkan aspirasi dan memilih
                                pemimpin yang akan mewakili suara mahasiswa dalam mengembangkan dan memajukan universitas.
                            </p>
                        </div>
                    </section>

                    <section className="tentang-section">
                        <h2 className="section-title">Visi PEMIRA UNIWA 2025</h2>
                        <div className="section-content">
                            <blockquote className="vision-quote">
                                "Terwujudnya pemilihan ketua BEM yang demokratis, transparan, dan berkualitas
                                untuk kemajuan Universitas Wahidiyah"
                            </blockquote>
                        </div>
                    </section>

                    <section className="tentang-section">
                        <h2 className="section-title">Misi PEMIRA UNIWA 2025</h2>
                        <div className="section-content">
                            <ul className="mission-list">
                                <li>Menyelenggarakan pemilihan yang demokratis dan transparan</li>
                                <li>Meningkatkan partisipasi mahasiswa dalam proses demokrasi</li>
                                <li>Menghasilkan pemimpin yang kompeten dan visioner</li>
                                <li>Membangun kesadaran mahasiswa akan pentingnya demokrasi</li>
                                <li>Mendorong inovasi dalam sistem pemilihan digital</li>
                            </ul>
                        </div>
                    </section>

                    <section className="tentang-section">
                        <h2 className="section-title">Tentang Universitas Wahidiyah</h2>
                        <div className="section-content">
                            <p>
                                Universitas Wahidiyah adalah perguruan tinggi swasta yang berkomitmen
                                untuk menghasilkan lulusan yang berkualitas, inovatif, dan berdaya saing tinggi.
                            </p>
                            <p>
                                Dengan motto yang menginspirasi, Universitas Wahidiyah terus berkembang menjadi
                                institusi pendidikan yang mampu menghasilkan sumber daya manusia yang siap menghadapi
                                tantangan global dan berkontribusi untuk kemajuan masyarakat.
                            </p>
                        </div>
                    </section>

                    <section className="tentang-section">
                        <h2 className="section-title">Teknologi Pemilihan</h2>
                        <div className="section-content">
                            <p>
                                PEMIRA UNIWA 2025 menggunakan sistem pemilihan elektronik (e-voting) yang modern
                                dan aman untuk memastikan proses pemilihan berjalan lancar dan transparan.
                            </p>
                            <div className="tech-features">
                                <div className="tech-feature">
                                    <div className="feature-icon">🔒</div>
                                    <h4>Keamanan Data</h4>
                                    <p>Enkripsi dan autentikasi untuk melindungi data pemilih</p>
                                </div>
                                <div className="tech-feature">
                                    <div className="feature-icon">📱</div>
                                    <h4>Akses Mudah</h4>
                                    <p>Dapat diakses melalui berbagai perangkat</p>
                                </div>
                                <div className="tech-feature">
                                    <div className="feature-icon">⚡</div>
                                    <h4>Real-time</h4>
                                    <p>Pemantauan hasil pemilihan secara langsung</p>
                                </div>
                                <div className="tech-feature">
                                    <div className="feature-icon">📊</div>
                                    <h4>Transparan</h4>
                                    <p>Laporan dan statistik yang dapat diakses publik</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="tentang-section">
                        <h2 className="section-title">Panitia PEMIRA UNIWA 2025</h2>
                        <div className="section-content">
                            <p>
                                PEMIRA UNIWA 2025 diselenggarakan oleh panitia yang terdiri dari mahasiswa berpengalaman
                                dan dibawah pengawasan dosen serta pihak Universitas Wahidiyah.
                            </p>
                            <p>
                                Panitia berkomitmen untuk menyelenggarakan pemilihan yang fair, jujur, dan sesuai
                                dengan prinsip-prinsip demokrasi.
                            </p>
                        </div>
                    </section>

                    <section className="tentang-section">
                        <h2 className="section-title">Kontak & Informasi</h2>
                        <div className="section-content">
                            <div className="contact-info">
                                <div className="contact-item">
                                    <h4>📧 Email</h4>
                                    <p>pemira@wahidiyah.ac.id</p>
                                </div>
                                <div className="contact-item">
                                    <h4>📱 Sosial Media</h4>
                                    <p>@pemirauwahidiyah (Instagram)</p>
                                </div>
                                <div className="contact-item">
                                    <h4>🏛️ Alamat</h4>
                                    <p>Jl. KH. Wachid Hasyim, Bandar Lor, Kota Kediri</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="tentang-section">
                        <h2 className="section-title">Kredit Pengembang</h2>
                        <div className="section-content">
                            <div className="developer-credit">
                                <p>
                                    Website ini dikembangkan oleh{' '}
                                    <a href="https://noahis.me" target="_blank" rel="noopener noreferrer" className="dev-link">
                                        noahis.me
                                    </a>
                                </p>
                                <p className="credit-note">
                                    Terima kasih atas dukungan dan kontribusi dalam mewujudkan sistem pemilihan yang modern dan transparan.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default Tentang