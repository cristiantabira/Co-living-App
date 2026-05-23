const nodemailer = require('nodemailer');

// Configurare Nodemailer - pentru development folosim Ethereal (auto-generated)
let transporter;

// Inițializare transporter cu Ethereal
(async () => {
    try {
        // Genereaza test account automat pe Ethereal
        const testAccount = await nodemailer.createTestAccount();
        
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        
        console.log(`\n✅ EMAIL SERVICE READY`);
        console.log(`📧 Ethereal Test Account:`);
        console.log(`   Email: ${testAccount.user}`);
        console.log(`   Password: ${testAccount.pass}`);
        console.log(`   ➜ Preview URL va aparea cu fiecare email trimis!\n`);
    } catch (error) {
        console.error('❌ Eroare la inițializare Ethereal:', error.message);
    }
})();

// Template pentru email de notificare de cheltuială
const expenseNotificationTemplate = (recipientName, payerName, expenseDescription, amount, expenseType) => {
    const subject = expenseType === 'ADMIN' 
        ? `🏢 Noua Factură: ${expenseDescription}`
        : `💸 Noua Cheltuială: ${expenseDescription}`;
    
    const title = expenseType === 'ADMIN'
        ? 'Noua Factură pentru tine'
        : `${payerName} a adăugat o cheltuială`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; font-size: 24px;">Co-living App</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Notificare Cheltuială</p>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <p style="margin: 0 0 15px 0; font-size: 16px; color: #333;">
                    Salut <strong>${recipientName}</strong>! 👋
                </p>
                <p style="margin: 0 0 15px 0; font-size: 16px; color: #333;">
                    ${title}
                </p>
                
                <div style="background: white; padding: 15px; border-left: 4px solid ${expenseType === 'ADMIN' ? '#3b82f6' : '#ef4444'}; border-radius: 8px; margin: 15px 0;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                        <strong>Descriere:</strong> ${expenseDescription}
                    </p>
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                        <strong>Plătit de:</strong> ${payerName}
                    </p>
                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: ${expenseType === 'ADMIN' ? '#3b82f6' : '#ef4444'};">
                        Suma: ${amount} lei
                    </p>
                </div>

                <p style="margin: 15px 0; font-size: 14px; color: #666;">
                    ${expenseType === 'ADMIN' 
                        ? 'Aceasta este o factură administrativă care a fost distribuită tuturor colegilor din complex.'
                        : 'Accesează aplicația pentru a vedea detaliile complete și pentru a plăti.'
                    }
                </p>
            </div>

            <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0; font-size: 12px; color: #999;">
                    © 2024 Co-living App | Notificări Automate
                </p>
            </div>
        </div>
    `;

    return { subject, html };
};

// Template pentru email de reminder de plată
const paymentReminderTemplate = (debtorName, creditorName, amount, expenseDescription) => {
    const subject = `⏰ Reminder: Plătește ${creditorName}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; font-size: 24px;">Co-living App</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Reminder de Plată</p>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <p style="margin: 0 0 15px 0; font-size: 16px; color: #333;">
                    Salut <strong>${debtorName}</strong>! 👋
                </p>
                <p style="margin: 0 0 15px 0; font-size: 16px; color: #333;">
                    <strong>${creditorName}</strong> ți-a trimis un reminder să plătești pentru o cheltuială comună.
                </p>
                
                <div style="background: white; padding: 15px; border-left: 4px solid #f97316; border-radius: 8px; margin: 15px 0;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                        <strong>Descriere:</strong> ${expenseDescription}
                    </p>
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                        <strong>De plătit lui:</strong> ${creditorName}
                    </p>
                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #f97316;">
                        Suma: ${amount} lei
                    </p>
                </div>

                <p style="margin: 15px 0; font-size: 14px; color: #666;">
                    Te rog achitează această datorie cât mai curând posibil. Mulțumim!
                </p>
            </div>

            <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0; font-size: 12px; color: #999;">
                    © 2024 Co-living App | Notificări Automate
                </p>
            </div>
        </div>
    `;

    return { subject, html };
};

// Funcție pentru a trimite email de notificare de cheltuială
const sendExpenseNotification = async (recipientEmail, recipientName, payerName, expenseDescription, amount, expenseType = 'PERSONAL') => {
    try {
        const { subject, html } = expenseNotificationTemplate(recipientName, payerName, expenseDescription, amount, expenseType);

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@coliving-app.com',
            to: recipientEmail,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        
        console.log(`✓ Email trimis la ${recipientEmail}`);
        if (previewUrl) {
            console.log(`  📧 Preview: ${previewUrl}`);
        }
        return true;
    } catch (error) {
        console.error(`✗ Eroare la trimiterea emailului către ${recipientEmail}:`, error.message);
        return false;
    }
};

// Funcție pentru a trimite email de reminder de plată
const sendPaymentReminder = async (debtorEmail, debtorName, creditorName, amount, expenseDescription) => {
    try {
        const { subject, html } = paymentReminderTemplate(debtorName, creditorName, amount, expenseDescription);

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@coliving-app.com',
            to: debtorEmail,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        
        console.log(`✓ Reminder trimis la ${debtorEmail}`);
        if (previewUrl) {
            console.log(`  📧 Preview: ${previewUrl}`);
        }
        return true;
    } catch (error) {
        console.error(`✗ Eroare la trimiterea reminder-ului către ${debtorEmail}:`, error.message);
        return false;
    }
};

// Funcție pentru a trimite notificări la toți debtorii
const notifyAllDebtors = async (debtors, payerName, expenseDescription, totalAmount, expenseType = 'PERSONAL') => {
    const promises = debtors.map((debtor) =>
        sendExpenseNotification(
            debtor.email,
            debtor.name,
            payerName,
            expenseDescription,
            totalAmount,
            expenseType
        )
    );
    
    await Promise.all(promises);
};

module.exports = {
    sendExpenseNotification,
    sendPaymentReminder,
    notifyAllDebtors,
};
