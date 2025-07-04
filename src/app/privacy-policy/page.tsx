import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Privacy Policy for NeuraCode
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Last updated: July 5, 2025
            </p>
          </div>

          <div className="space-y-8 text-left">
            <p className="text-lg leading-relaxed">
              This Privacy Policy describes how NeuraCode ("we", "us", or "our")
              collects, uses, and discloses your personal information when you
              visit our website, use our services, or otherwise communicate with
              us (collectively, the "Services"). For purposes of this Privacy
              Policy, "you" and "your" means you as the user of the Services.
            </p>

            <p className="text-lg leading-relaxed">
              Please read this Privacy Policy carefully. By using and accessing
              any of the Services, you agree to the collection, use, and
              disclosure of your information as described in this Privacy
              Policy. If you do not agree to this Privacy Policy, please do not
              use or access any of the Services.
            </p>

            <div className="space-y-4">
              <h2 className="border-b pb-2 text-3xl font-semibold tracking-tight">
                1. Changes to This Privacy Policy
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                We may update this Privacy Policy from time to time, including
                to reflect changes to our practices or for other operational,
                legal, or regulatory reasons. We will post the revised Privacy
                Policy on the Site and update the "Last updated" date.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="border-b pb-2 text-3xl font-semibold tracking-tight">
                2. How We Collect and Use Your Personal Information
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                To provide the Services, we collect personal information about
                you from a variety of sources. The information that we collect
                and use varies depending on how you interact with us.
              </p>

              <div className="space-y-3 pl-4">
                <h3 className="text-2xl font-semibold tracking-tight">
                  2.1. Information You Provide Directly to Us
                </h3>
                <ul className="list-disc space-y-2 pl-6 text-lg text-muted-foreground">
                  <li>
                    <strong>Account Information:</strong> When you register for
                    an account, we collect your name, email address, and
                    password.
                  </li>
                  <li>
                    <strong>User-Generated Content:</strong> We collect the
                    information you create and store using our Services, such as
                    notes, todos, bookmarks, and reminders.
                  </li>
                  <li>
                    <strong>Communications:</strong> If you contact us directly,
                    we may receive additional information about you such as your
                    name, email address, the contents of the message and/or
                    attachments you may send us, and any other information you
                    may choose to provide.
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pl-4">
                <h3 className="text-2xl font-semibold tracking-tight">
                  2.2. Information We Collect Automatically
                </h3>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  We may automatically collect certain information about your
                  interaction with the Services ("Usage Data"). To do this, we
                  may use cookies, pixels and similar technologies ("Cookies").
                  Usage Data may include information about how you access and
                  use our Site and your account, including device information,
                  browser information, information about your network
                  connection, your IP address and other information regarding
                  your interaction with the Services.
                </p>
              </div>

              <div className="space-y-3 pl-4">
                <h3 className="text-2xl font-semibold tracking-tight">
                  2.3. Information We Obtain from Third Parties
                </h3>
                <ul className="list-disc space-y-2 pl-6 text-lg text-muted-foreground">
                  <li>
                    <strong>WhatsApp/Meta:</strong> If you choose to connect
                    your WhatsApp account to our Services, we will receive your
                    WhatsApp phone number and other profile information to
                    enable integration and send you notifications as part of the
                    Services. Your interaction with WhatsApp is governed by
                    Meta's Privacy Policy.
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="border-b pb-2 text-3xl font-semibold tracking-tight">
                3. How We Use Your Personal Information
              </h2>
              <ul className="list-disc space-y-2 pl-6 text-lg text-muted-foreground">
                <li>
                  <strong>Providing Products and Services:</strong> We use your
                  personal information to provide you with the Services,
                  including to create and manage your account, store your
                  content, and enable features.
                </li>
                <li>
                  <strong>Communicating with You:</strong> We use your personal
                  information to send you notifications (including via WhatsApp,
                  if you opt-in), provide customer support, and respond to your
                  inquiries.
                </li>
                <li>
                  <strong>Security and Fraud Prevention:</strong> We use your
                  personal information to detect, investigate or take action
                  regarding possible fraudulent, illegal or malicious activity.
                </li>
                <li>
                  <strong>Service Improvement:</strong> We use your information
                  to understand how our users interact with our Services to
                  improve and optimize them.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="border-b pb-2 text-3xl font-semibold tracking-tight">
                4. How We Disclose Personal Information
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                In certain circumstances, we may disclose your personal
                information to third parties. Such circumstances may include:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-lg text-muted-foreground">
                <li>
                  With vendors or other third parties who perform services on
                  our behalf (e.g., cloud hosting providers, data analytics
                  providers).
                </li>
                <li>
                  With third-party platforms like Meta to provide the WhatsApp
                  API integration, when you explicitly authorize it.
                </li>
                <li>
                  To comply with any applicable legal obligations, to enforce
                  any applicable terms of service, and to protect or defend the
                  Services, our rights, and the rights of our users or others.
                </li>
                <li>
                  In connection with a business transaction such as a merger or
                  bankruptcy.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="border-b pb-2 text-3xl font-semibold tracking-tight">
                5. Security and Retention of Your Information
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Please be aware that no security measures are perfect or
                impenetrable, and we cannot guarantee "perfect security." We
                retain your personal information as long as is necessary to
                provide the Services, comply with our legal obligations, resolve
                disputes, and enforce our policies.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="border-b pb-2 text-3xl font-semibold tracking-tight">
                6. Your Rights
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Depending on where you live, you may have rights in relation to
                your personal information, such as the right to access,
                correct, or delete the personal information we hold about you.
                To exercise these rights, please contact us using the details
                below.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="border-b pb-2 text-3xl font-semibold tracking-tight">
                7. Children's Data
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                The Services are not intended to be used by children, and we do
                not knowingly collect any personal information about children
                under the age of 13.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="border-b pb-2 text-3xl font-semibold tracking-tight">
                8. Contact Us
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Should you have any questions about our privacy practices or
                this Privacy Policy, or if you would like to exercise any of the
                rights available to you, please email us at{" "}
                <a
                  href="mailto:support@neuracode.app"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  support@neuracode.app
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 