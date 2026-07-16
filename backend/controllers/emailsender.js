import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "8822.stkabirdin@gmail.com",
    pass: "ptowpjzziktiqzcx",
  },
});

export const sendVerificationMail = (email, doctorName, appointmentDate) => {
  const mailOptions = {
    from: "8822.stkabirdin@gmail.com",
    to: email, // make sure this variable is defined
    subject: "Appointment Cancellation Notice",
    text: `Dear Patient,\n\nWe regret to inform you that your appointment with Dr. ${doctorName}, scheduled for ${appointmentDate}, has been cancelled.\n\nWe apologize for any inconvenience and encourage you to reschedule.\n\nBest regards,\nPrescripto Health Team`,
    html: `
      <h2 style="color: #d9534f; font-family: Arial, sans-serif;">Appointment Cancelled</h2>
      <p style="font-family: Arial, sans-serif; color: #333;">
        Dear Patient,<br/><br/>
        We regret to inform you that your appointment with <strong>Dr. ${doctorName}</strong>,
        scheduled for <strong>${appointmentDate}</strong>, has been <strong>cancelled</strong>.<br/><br/>
        We apologize for any inconvenience this may cause.<br/>
        Please feel free to <strong>reschedule at your convenience</strong>.<br/><br/>
        If you have any questions, don't hesitate to contact us.<br/><br/>
        Best regards,<br/>
        <strong>Prescripto Health Team</strong>
      </p>
    `,
  };
  transport.sendMail(mailOptions, (err, data) => {
    if (err) {
      console.log("Error sending email:", err);
    } else {
      console.log("Email sent:", data.response);
    }
  });
};

export const sendPaymentReceipt = (email, appointmentData, transactionId) => {
  // Calculate the current payment amount
  const totalAmount = appointmentData.amount;
  const minAmount = Math.ceil(totalAmount * 0.2); // 20% of total fees
  const remainingAmount = totalAmount - minAmount; // 80% of total fees
  
  // Determine the current payment amount based on payment type
  let currentPayment;
  if (appointmentData.paidAmount === totalAmount) {
    // Full payment
    currentPayment = totalAmount;
  } else if (appointmentData.paidAmount > minAmount) {
    // Online payment (remaining amount)
    currentPayment = remainingAmount;
  } else {
    // Minimum payment
    currentPayment = minAmount;
  }

  const mailOptions = {
    from: "8822.stkabirdin@gmail.com",
    to: email,
    subject: "Payment Receipt - Prescripto",
    text: `Dear ${appointmentData.userData.name},\n\nThank you for your payment. Here are your payment and appointment details:\n\nAppointment Details:\nDoctor: Dr. ${appointmentData.docData.name}\nSpecialization: ${appointmentData.docData.specialization}\nDate: ${appointmentData.slotDate}\nTime: ${appointmentData.slotTime}\nAppointment ID: ${appointmentData._id}\nAppointment Type: ${appointmentData.type || 'Regular'}\n\nPayment Details:\nTransaction ID: ${transactionId}\nAmount Paid: ₹${currentPayment}\nPayment Date: ${new Date().toLocaleDateString()}\n\nPatient Details:\nName: ${appointmentData.userData.name}\nEmail: ${appointmentData.userData.email}\n\nThank you for choosing Prescripto.\n\nBest regards,\nPrescripto Health Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #3399cc; margin-bottom: 5px;">Payment Receipt</h2>
          <p style="color: #666; font-size: 14px;">Transaction ID: ${transactionId}</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Appointment Details</h3>
          <p><strong>Appointment ID:</strong> ${appointmentData._id}</p>
          <p><strong>Doctor:</strong> Dr. ${appointmentData.docData.name}</p>
          <p><strong>Date:</strong> ${appointmentData.slotDate}</p>
          <p><strong>Time:</strong> ${appointmentData.slotTime}</p>
          <p><strong>Appointment Type:</strong> ${appointmentData.type || 'Regular'}</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Payment Details</h3>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Amount Paid:</strong> ₹${currentPayment}</p>
          <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Patient Details</h3>
          <p><strong>Name:</strong> ${appointmentData.userData.name}</p>
          <p><strong>Email:</strong> ${appointmentData.userData.email}</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; font-size: 14px;">This is an automated receipt. Please keep it for your records.</p>
          <p style="margin-top: 10px;">Thank you for choosing Prescripto.</p>
          <p style="color: #3399cc; font-weight: bold;">Prescripto Health Team</p>
        </div>
      </div>
    `,
  };
  transport.sendMail(mailOptions, (err, data) => {
    if (err) {
      console.log("Error sending receipt email:", err);
    } else {
      console.log("Receipt email sent:", data.response);
    }
  });
};
