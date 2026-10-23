export interface CertificateHtmlParams {
  name: string;
  certId: string;
  dateIssued: string;
  xp: number;
  level: number;
  streak: number;
  lessonsCompleted: number;
  totalLessons: number;
  perfectCount: number;
  perfectPct: number;
  badgeLabel: string;
  badgeColor: string;
  badgeDescription: string;
  photoBase64: string;
  qrDataUrl: string;
}

export const buildCertificateHtml = async (params: CertificateHtmlParams): Promise<string> => {
  const escapeHtml = (value: string): string =>
    value.replace(/[&<>"']/g, (character) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return entities[character];
    });

  const {
    name,
    certId,
    dateIssued,
    xp,
    level,
    streak,
    lessonsCompleted,
    totalLessons,
    perfectCount,
    perfectPct,
    badgeLabel,
    badgeColor,
    badgeDescription,
    photoBase64,
    qrDataUrl,
  } = params;

  const safeName = escapeHtml(name);
  const safeCertId = escapeHtml(certId);
  const safeDate = escapeHtml(dateIssued);
  const safeBadgeDescription = escapeHtml(badgeDescription);

  const initial = escapeHtml((name.trim()[0] || 'M').toUpperCase());
  const photoHtml = photoBase64
    ? `<img src="${photoBase64}" class="photo" alt="Student photo" />`
    : `<div class="photo-placeholder">${initial}</div>`;
  const qrHtml = qrDataUrl
    ? `<img src="${qrDataUrl}" class="qr" alt="Certificate verification QR code" />`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Menya Certificate — ${safeName}</title>
<style>
  @page { size: A4 portrait; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    width: 210mm;
    height: 297mm;
    background: #FBF8F1;
    color: #14212B;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    overflow: hidden;
  }
  .page { position: relative; width: 210mm; height: 297mm; padding: 14mm; }
  .frame {
    position: absolute;
    inset: 9mm;
    border: 1.2px solid #D9A441;
    border-radius: 3mm;
  }
  .frame-inner {
    position: absolute;
    inset: 11mm;
    border: 0.5px solid rgba(11,110,132,0.24);
    border-radius: 2mm;
  }
  .accent {
    position: absolute;
    top: 14.5mm;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 1.2mm;
  }
  .accent span { width: 12mm; height: 1.2mm; border-radius: 1mm; }
  .accent .blue { background: #2B6CB0; }
  .accent .gold { background: #D9A441; }
  .accent .green { background: #2F9E6E; }

  .content {
    position: absolute;
    inset: 18mm 21mm 15mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .brand { display: flex; align-items: center; gap: 2.5mm; }
  .brand-mark {
    width: 11mm;
    height: 11mm;
    border-radius: 3mm;
    background: #0B6E84;
    color: #FFFFFF;
    font-size: 14pt;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .brand-name {
    font-size: 14pt;
    font-weight: 700;
    letter-spacing: 3px;
    color: #0B6E84;
  }
  .eyebrow {
    margin-top: 6mm;
    font-size: 8.5pt;
    font-weight: 600;
    letter-spacing: 2.4px;
    color: #83919D;
    text-transform: uppercase;
  }
  h1 {
    margin: 2mm 0 0;
    font-size: 30pt;
    line-height: 1.12;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #14212B;
  }
  .rule { width: 46mm; height: 0.8mm; background: #D9A441; border-radius: 1mm; margin: 5mm 0; }
  .certify { font-size: 10pt; color: #83919D; letter-spacing: 0.4px; }
  .name {
    font-size: 34pt;
    line-height: 1.2;
    font-weight: 700;
    color: #0B6E84;
    margin: 3mm 0 2mm;
    max-width: 155mm;
  }
  .statement {
    font-size: 11.5pt;
    line-height: 1.65;
    color: #536471;
    max-width: 145mm;
    margin: 0 auto;
  }
  .course { font-size: 14pt; font-weight: 700; color: #14212B; margin-top: 5mm; }
  .stats {
    display: flex;
    width: 150mm;
    margin-top: 9mm;
    padding: 5mm 0;
    border-top: 0.4px solid #E3DCCB;
    border-bottom: 0.4px solid #E3DCCB;
  }
  .stat { flex: 1; padding: 0 3mm; border-right: 0.4px solid #E3DCCB; }
  .stat:last-child { border-right: none; }
  .stat-value { font-size: 18pt; line-height: 1.1; font-weight: 700; color: #0B6E84; }
  .stat-label { font-size: 7.5pt; letter-spacing: 1.2px; color: #83919D; text-transform: uppercase; margin-top: 1mm; }
  .tier { margin-top: 6mm; font-size: 9pt; color: #536471; letter-spacing: 0.3px; }
  .tier strong { font-weight: 700; }
  .seal-wrap { margin-top: 7mm; display: flex; flex-direction: column; align-items: center; }
  .seal {
    width: 32mm;
    height: 32mm;
    border: 0.8mm double #D9A441;
    border-radius: 50%;
    background: #FFFDF8;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .seal-mark { width: 3mm; height: 3mm; transform: rotate(45deg); border-radius: 0.5mm; }
  .seal-tier { margin-top: 1mm; font-size: 9pt; font-weight: 700; letter-spacing: 1px; color: #0B6E84; }
  .seal-label { margin-top: 0.5mm; font-size: 6pt; letter-spacing: 0.9px; color: #83919D; }
  .footer { margin-top: auto; width: 100%; }
  .bottom {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    width: 100%;
    padding-top: 6mm;
    border-top: 0.4px solid #E3DCCB;
  }
  .photo-block { width: 36mm; text-align: center; }
  .photo {
    width: 34mm;
    height: 34mm;
    border-radius: 50%;
    object-fit: cover;
    border: 1mm solid #0B6E84;
  }
  .photo-placeholder {
    width: 34mm;
    height: 34mm;
    margin: 0 auto;
    border-radius: 50%;
    border: 1mm solid #0B6E84;
    background: #F2F7F8;
    color: #0B6E84;
    font-size: 20pt;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .photo-caption { margin-top: 2mm; font-size: 6.5pt; letter-spacing: 1px; color: #83919D; text-transform: uppercase; }
  .signature { flex: 1; padding: 0 8mm; text-align: center; }
  .sig-name { font-family: 'Brush Script MT', 'Segoe Script', Georgia, serif; font-size: 22pt; line-height: 1; color: #14212B; }
  .sig-line { width: 64mm; height: 0.3mm; background: #83919D; margin: 2.5mm auto; }
  .sig-role { font-size: 7pt; color: #536471; letter-spacing: 0.4px; }
  .qr-block { width: 32mm; text-align: center; }
  .qr { width: 26mm; height: 26mm; }
  .qr-label { margin-top: 1.5mm; font-size: 6pt; letter-spacing: 0.8px; color: #83919D; text-transform: uppercase; }
  .meta {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-top: 5mm;
    font-size: 6.5pt;
    letter-spacing: 0.3px;
    color: #83919D;
  }
</style>
</head>
<body>
  <div class="page">
    <div class="frame"></div>
    <div class="frame-inner"></div>
    <div class="accent"><span class="blue"></span><span class="gold"></span><span class="green"></span></div>

    <div class="content">
      <div class="brand">
        <div class="brand-mark">M</div>
        <div class="brand-name">MENYA</div>
      </div>
      <div class="eyebrow">Kinyarwanda Language Program</div>
      <h1>Certificate<br/>of Completion</h1>
      <div class="rule"></div>

      <div class="certify">This certifies that</div>
      <div class="name">${safeName}</div>
      <div class="statement">
        has successfully completed the Menya Kinyarwanda course,
        demonstrating commitment to learning the language and culture of Rwanda.
      </div>
      <div class="course">Kinyarwanda · ${lessonsCompleted}/${totalLessons} lessons</div>

      <div class="stats">
        <div class="stat">
          <div class="stat-value">${xp}</div>
          <div class="stat-label">Total XP</div>
        </div>
        <div class="stat">
          <div class="stat-value">${perfectCount}</div>
          <div class="stat-label">Perfect Lessons</div>
        </div>
        <div class="stat">
          <div class="stat-value">${streak}</div>
          <div class="stat-label">Best Streak</div>
        </div>
        <div class="stat">
          <div class="stat-value">${level}</div>
          <div class="stat-label">Level</div>
        </div>
      </div>

      <div class="tier">
        <strong style="color:${badgeColor};">${badgeLabel} CERTIFICATE</strong> · ${safeBadgeDescription}
      </div>

      <div class="seal-wrap">
        <div class="seal" style="border-color:${badgeColor};">
          <div class="seal-mark" style="background:${badgeColor};"></div>
          <div class="seal-tier" style="color:${badgeColor};">${badgeLabel}</div>
          <div class="seal-label">OFFICIAL MENYA</div>
        </div>
      </div>

      <div class="footer">
        <div class="bottom">
          <div class="photo-block">
            ${photoHtml}
            <div class="photo-caption">Student</div>
          </div>
          <div class="signature">
            <div class="sig-name">Runi RW</div>
            <div class="sig-line"></div>
            <div class="sig-role">Menya App · runirw.com</div>
          </div>
          <div class="qr-block">
            ${qrHtml}
            <div class="qr-label">Scan to verify</div>
          </div>
        </div>
        <div class="meta">
          <div>Certificate ID: ${safeCertId}</div>
          <div>Issued ${safeDate}</div>
          <div>Perfect rate ${Math.round(perfectPct)}%</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
};
