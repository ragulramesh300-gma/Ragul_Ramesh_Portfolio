export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    const { name, email, message } = payload || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error('BREVO_API_KEY environment variable is missing.');
      return res.status(500).json({
        error: 'Email service is not yet configured. Please set BREVO_API_KEY in Vercel environment variables.'
      });
    }

    // Verified Brevo sender address
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'ragulramesh1900@gmail.com';
    const recipientEmail = 'ragulramesh1900@gmail.com';

    // 1. Send notification email to Ragul
    const notifyResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'Portfolio Contact Form',
          email: senderEmail
        },
        to: [
          {
            email: recipientEmail,
            name: 'Ragul Ramesh'
          }
        ],
        replyTo: {
          email: email,
          name: name
        },
        subject: `New Portfolio Message from ${name}`,
        htmlContent: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="border-bottom: 2px solid #2563eb; padding-bottom: 14px; margin-bottom: 22px;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #2563eb;">Portfolio Inquiry</span>
              <h2 style="color: #0f172a; margin: 6px 0 0; font-size: 20px;">You received a new message</h2>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 14px; width: 100px;"><strong>From:</strong></td>
                <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${escapeHtml(name)}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 14px;"><strong>Email:</strong></td>
                <td style="padding: 6px 0; color: #2563eb; font-size: 14px;"><a href="mailto:${escapeHtml(email)}" style="color: #2563eb; text-decoration: underline;">${escapeHtml(email)}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 14px;"><strong>Received:</strong></td>
                <td style="padding: 6px 0; color: #0f172a; font-size: 14px;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
              </tr>
            </table>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; padding: 18px; border-radius: 8px; margin: 20px 0;">
              <div style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Message Content:</div>
              <p style="margin: 0; color: #0f172a; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message)}</p>
            </div>

            <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 14px;">
              💡 <em>Tip: You can hit <strong>Reply</strong> in your email client to directly reply to ${escapeHtml(name)}.</em>
            </p>
          </div>
        `
      })
    });

    if (!notifyResponse.ok) {
      const errDetails = await notifyResponse.text();
      console.error('Brevo notification delivery error:', errDetails);
      return res.status(502).json({
        error: 'Failed to deliver notification email through Brevo.',
        details: errDetails
      });
    }

    // 2. Send professional auto-reply email to the visitor
    try {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: 'Ragul Ramesh',
            email: senderEmail
          },
          to: [
            {
              email: email,
              name: name
            }
          ],
          replyTo: {
            email: recipientEmail,
            name: 'Ragul Ramesh'
          },
          subject: 'Thanks for contacting me',
          htmlContent: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px;">
                <span style="font-size: 18px; font-weight: 800; color: #0f172a;">RR<span style="color: #2563eb;">.</span></span>
              </div>
              
              <h2 style="color: #0f172a; margin: 0 0 16px; font-size: 20px;">Hi ${escapeHtml(name)},</h2>
              <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 14px;">
                Thank you for reaching out through my portfolio website!
              </p>
              <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 18px;">
                I have received your message and will reply shortly.
              </p>

              <div style="background: #f8fafc; border-left: 3px solid #cbd5e1; padding: 14px 16px; border-radius: 6px; margin: 20px 0;">
                <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 600; margin-bottom: 6px;">Your message:</div>
                <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.5; font-style: italic;">"${escapeHtml(message)}"</p>
              </div>

              <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 24px 0 4px;">
                Best regards,
              </p>
              <p style="color: #0f172a; font-size: 16px; font-weight: 700; margin: 0;">
                Ragul Ramesh
              </p>
              <p style="color: #64748b; font-size: 13px; margin: 2px 0 0;">
                Full Stack Developer · <a href="https://ragulramesh.vercel.app" style="color: #2563eb; text-decoration: none;">ragulramesh.vercel.app</a>
              </p>
            </div>
          `
        })
      });
    } catch (autoErr) {
      console.warn('Auto-reply non-fatal error:', autoErr);
    }

    return res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Server error handling contact request:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
