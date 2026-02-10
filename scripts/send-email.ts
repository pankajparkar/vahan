import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

interface EmailConfig {
  to: string;
  from: string;
  gmailUser: string;
  gmailAppPassword: string;
}

function getConfig(): EmailConfig {
  const to = process.env.EMAIL_TO;
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!to || !gmailUser || !gmailAppPassword) {
    console.error('Missing required environment variables:');
    if (!to) console.error('  - EMAIL_TO: recipient email address');
    if (!gmailUser) console.error('  - GMAIL_USER: your Gmail address');
    if (!gmailAppPassword) console.error('  - GMAIL_APP_PASSWORD: Gmail App Password');
    console.error('\nTo create a Gmail App Password:');
    console.error('1. Go to https://myaccount.google.com/apppasswords');
    console.error('2. Select "Mail" and your device');
    console.error('3. Generate and copy the 16-char password');
    process.exit(1);
  }

  return {
    to,
    from: `Vahan Automation <${gmailUser}>`,
    gmailUser,
    gmailAppPassword,
  };
}

function getLatestDownloads(downloadDir: string): string[] {
  if (!fs.existsSync(downloadDir)) {
    console.error(`Download directory not found: ${downloadDir}`);
    return [];
  }

  const files = fs.readdirSync(downloadDir);
  const xlsxFiles = files
    .filter((f) => f.endsWith('.xlsx'))
    .map((f) => ({
      name: f,
      path: path.join(downloadDir, f),
      mtime: fs.statSync(path.join(downloadDir, f)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  // Get the latest session files (files created within 10 minutes of the most recent file)
  if (xlsxFiles.length === 0) return [];

  const latestTime = xlsxFiles[0].mtime;
  const sessionThreshold = 10 * 60 * 1000; // 10 minutes

  const sessionFiles = xlsxFiles
    .filter((f) => latestTime - f.mtime < sessionThreshold)
    .map((f) => f.path);

  return sessionFiles;
}

async function sendEmail(): Promise<void> {
  const config = getConfig();
  const downloadDir = path.join(process.cwd(), 'downloads');
  const attachments = getLatestDownloads(downloadDir);

  if (attachments.length === 0) {
    console.error('No Excel files found to send.');
    process.exit(1);
  }

  console.log(`Found ${attachments.length} Excel files from latest session:`);
  attachments.forEach((f) => console.log(`  - ${path.basename(f)}`));

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.gmailUser,
      pass: config.gmailAppPassword,
    },
  });

  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const fileList = attachments
    .map((f) => `  - ${path.basename(f)}`)
    .join('\n');

  const mailOptions = {
    from: config.from,
    to: config.to,
    subject: `Vahan Dashboard Data - ${today}`,
    text: `Hi,\n\nPlease find attached the Vahan Dashboard data extraction files.\n\nFiles included:\n${fileList}\n\nStates: Goa, Gujarat, Maharashtra, Madhya Pradesh\nY-Axis: Maker\nX-Axis: Month Wise & Fuel\nVehicle Categories: LIGHT MOTOR VEHICLE, LIGHT PASSENGER VEHICLE\n\nThis is an automated email from Vahan Dashboard Automation.\n`,
    html: `
      <h2>Vahan Dashboard Data - ${today}</h2>
      <p>Please find attached the Vahan Dashboard data extraction files.</p>
      <h3>Files included:</h3>
      <ul>
        ${attachments.map((f) => `<li>${path.basename(f)}</li>`).join('\n        ')}
      </ul>
      <h3>Configuration:</h3>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
        <tr><td><strong>States</strong></td><td>Goa, Gujarat, Maharashtra, Madhya Pradesh</td></tr>
        <tr><td><strong>Y-Axis</strong></td><td>Maker</td></tr>
        <tr><td><strong>X-Axis</strong></td><td>Month Wise &amp; Fuel</td></tr>
        <tr><td><strong>Vehicle Categories</strong></td><td>LIGHT MOTOR VEHICLE, LIGHT PASSENGER VEHICLE</td></tr>
      </table>
      <br>
      <p><em>This is an automated email from Vahan Dashboard Automation.</em></p>
    `,
    attachments: attachments.map((filePath) => ({
      filename: path.basename(filePath),
      path: filePath,
    })),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`\nEmail sent successfully!`);
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Sent to: ${config.to}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    process.exit(1);
  }
}

sendEmail();
