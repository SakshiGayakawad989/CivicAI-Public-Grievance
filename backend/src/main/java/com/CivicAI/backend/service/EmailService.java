
package com.CivicAI.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.CivicAI.backend.entity.Complaint;
import com.CivicAI.backend.entity.User;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Send an email when a complaint is submitted.
     */
    public void sendComplaintSubmittedEmail(Complaint complaint) {

        if (complaint == null) {
            System.out.println(
                    "Email skipped: complaint is null.");
            return;
        }

        String subject = "CivicAI - Complaint Submitted";

        String body =
                "Dear Citizen,\n\n"
                + "Your complaint has been submitted successfully "
                + "to CivicAI.\n\n"
                + "Complaint ID: " + complaint.getId() + "\n"
                + "Title: " + complaint.getTitle() + "\n"
                + "Category: " + complaint.getCategory() + "\n"
                + "Priority: " + complaint.getPriority() + "\n"
                + "Status: " + complaint.getStatus() + "\n\n"
                + "We will notify you when the status of your "
                + "complaint changes.\n\n"
                + "Thank you for using CivicAI.\n"
                + "CivicAI Team";

        sendEmail(complaint, subject, body);
    }

    /**
     * Send an email when a complaint moves to IN_PROGRESS.
     */
    public void sendInProgressEmail(Complaint complaint) {

        if (complaint == null) {
            System.out.println(
                    "Email skipped: complaint is null.");
            return;
        }

        String subject =
                "CivicAI - Complaint Work in Progress";

        String body =
                "Dear Citizen,\n\n"
                + "Work has started on your complaint.\n\n"
                + "Complaint ID: " + complaint.getId() + "\n"
                + "Title: " + complaint.getTitle() + "\n"
                + "Status: " + complaint.getStatus() + "\n\n"
                + "Our team is working to resolve the issue.\n\n"
                + "Thank you for your patience.\n"
                + "CivicAI Team";

        sendEmail(complaint, subject, body);
    }

    /**
     * Send an email when a complaint is resolved.
     */
    public void sendResolvedEmail(Complaint complaint) {

        if (complaint == null) {
            System.out.println(
                    "Email skipped: complaint is null.");
            return;
        }

        String subject = "CivicAI - Complaint Resolved";

        String body =
                "Dear Citizen,\n\n"
                + "Your complaint has been marked as resolved.\n\n"
                + "Complaint ID: " + complaint.getId() + "\n"
                + "Title: " + complaint.getTitle() + "\n"
                + "Status: " + complaint.getStatus() + "\n\n"
                + "Resolution Details: "
                + (complaint.getResolutionDescription() != null
                        ? complaint.getResolutionDescription()
                        : "No additional resolution details provided.")
                + "\n\n"
                + "Thank you for using CivicAI.\n"
                + "CivicAI Team";
        
        sendEmail(complaint, subject, body);
    }

    /**
     * Send an email to a registered citizen or guest citizen.
     */
    private void sendEmail(
            Complaint complaint,
            String subject,
            String body) {

        if (complaint == null) {
            System.out.println(
                    "Email skipped: complaint is null.");
            return;
        }

        String recipientEmail = null;

        // Registered citizen
        User user = complaint.getUser();

        if (user != null
                && user.getEmail() != null
                && !user.getEmail().trim().isEmpty()) {

            recipientEmail = user.getEmail().trim();

        } else {
            // Guest citizen
            String guestEmail = complaint.getGuestEmail();

            if (guestEmail != null
                    && !guestEmail.trim().isEmpty()) {

                recipientEmail = guestEmail.trim();
            }
        }

        if (recipientEmail == null) {
            System.out.println(
                    "Email skipped: no recipient email for complaint ID "
                    + complaint.getId());
            return;
        }

        if (senderEmail == null
                || senderEmail.trim().isEmpty()) {

            System.out.println(
                    "Email skipped: sender email is not configured.");
            return;
        }

        try {
            SimpleMailMessage message =
                    new SimpleMailMessage();

            message.setFrom(senderEmail.trim());
            message.setTo(recipientEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

            System.out.println(
                    "Email sent successfully to "
                    + recipientEmail
                    + " for complaint ID "
                    + complaint.getId());

        } catch (MailException e) {
            System.err.println(
                    "Failed to send email for complaint ID "
                    + complaint.getId()
                    + ": "
                    + e.getMessage());
        }
    }
}
