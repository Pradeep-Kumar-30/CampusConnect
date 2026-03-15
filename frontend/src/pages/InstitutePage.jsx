import React from "react";

const Section = ({ title, children }) => (
  <section style={{ marginBottom: "1.5rem" }}>
    <h2 style={{ margin: 0, marginBottom: "0.4rem", fontSize: "1.1rem" }}>
      {title}
    </h2>
    <div style={{ fontSize: "0.9rem", color: "#cbd5f5" }}>{children}</div>
  </section>
);

const InstitutePage = () => {
  return (
    <div className="grid grid-2">
      <div>
        <div className="card">
          <Section title="About IIIT Bhagalpur">
            <p>
              Indian Institute of Information Technology Bhagalpur is an
              Institute of National Importance established in 2017 under a
              public–private partnership between the Ministry of Education,
              Government of India, Government of Bihar and BELTRON. The
              permanent campus is located at Sabour on a 50‑acre green campus,
              with modern academic buildings, hostels and research
              infrastructure.
            </p>
            <p>
              The institute focuses on information technology and allied
              disciplines, with a strong emphasis on research, innovation and
              industry collaboration that can directly benefit the region as
              well as the country.
            </p>
          </Section>
          <Section title="Vision">
            <p>
              To build a vibrant research and innovation ecosystem in eastern
              India that is globally recognised for cutting‑edge work in
              information technology and for creating technology‑driven
              solutions with real social and economic impact.
            </p>
          </Section>
          <Section title="Mission">
            <ul style={{ paddingLeft: "1.1rem", margin: 0 }}>
              <li>
                Promote high‑quality education in IT and allied areas through
                research‑led teaching.
              </li>
              <li>
                Encourage innovation, entrepreneurship and technology transfer
                that solves local as well as global problems.
              </li>
              <li>
                Build collaborations with academia, industry and government
                organisations in India and abroad.
              </li>
              <li>
                Nurture socially responsible graduates with strong technical
                skills and professional ethics.
              </li>
            </ul>
          </Section>
        </div>
      </div>
      <div>
        <div className="card">
          <Section title="Academic programmes">
            <p>
              IIIT Bhagalpur currently offers undergraduate, postgraduate and
              doctoral programmes in core and emerging areas of engineering and
              technology.
            </p>
            <ul style={{ paddingLeft: "1.1rem", marginTop: "0.4rem" }}>
              <li>
                <strong>B.Tech</strong> in Computer Science &amp; Engineering,
                Electronics &amp; Communication Engineering, Mathematics &amp;
                Computing, and Mechatronics &amp; Automation.
              </li>
              <li>
                <strong>M.Tech</strong> specialisations focusing on AI and Data
                Science, VLSI &amp; Embedded Systems, and Electric Vehicle
                Technology.
              </li>
              <li>
                <strong>Ph.D. programmes</strong> across computing, electronics,
                mechanical and interdisciplinary domains.
              </li>
            </ul>
          </Section>
          <Section title="Campus and student life">
            <p>
              The campus hosts academic blocks, laboratories, hostels and
              sports facilities, with an emphasis on student clubs, technical
              societies and hackathons. The intranet platform you are using is
              designed to complement this ecosystem by providing a digital hub
              for notes, announcements, discussions and collaboration inside
              the institute&apos;s network.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default InstitutePage;

