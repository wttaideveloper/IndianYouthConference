export interface PolicyLink {
  text: string
  path: string
}

export type PolicyBlock =
  | { type: 'paragraph'; text: string; links?: PolicyLink[] }
  | { type: 'list'; items: Array<{ text: string; links?: PolicyLink[] }> }

export interface PolicySection {
  heading: string
  blocks: PolicyBlock[]
}

export interface PolicyContactDetail {
  label: string
  value: string
  href?: string
}

export interface Policy {
  path: string
  footerLabel: string
  title: string
  browserTitle: string
  subtitle: string
  sections: PolicySection[]
  contactIntro: string
  contactDetails: PolicyContactDetail[]
}

const contactIntro =
  'Questions, requests, complaints, or legal notices concerning this policy may be sent using the following details:'

const contactDetails: PolicyContactDetail[] = [
  { label: 'Website', value: 'www.indianyouthconference.com', href: 'https://www.indianyouthconference.com' },
  {
    label: 'Address',
    value: 'Building No. 20/1416/1, Pax Street 1, Nellikunnu, Thrissur, Kerala - 680005, India',
  },
  { label: 'Phone', value: '+91 7012963015', href: 'tel:+917012963015' },
  { label: 'Email', value: 'indianyouthconference@gmail.com', href: 'mailto:indianyouthconference@gmail.com' },
]

export const POLICIES: Policy[] = [
  {
    path: '/terms-and-conditions',
    footerLabel: 'Terms & Conditions',
    title: 'Terms and Conditions',
    browserTitle: 'Terms & Conditions | Indian Youth Conference',
    subtitle: 'Website and conference registration terms',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        blocks: [
          {
            type: 'paragraph',
            text: 'By accessing www.indianyouthconference.com, registering for an event, submitting information, making a payment or donation, or using any related service, you agree to these Terms and Conditions. If you do not agree, do not use the website or complete a registration.',
          },
        ],
      },
      {
        heading: '2. About the Website',
        blocks: [
          {
            type: 'paragraph',
            text: 'The website is operated for Indian Youth Conference to provide conference information, receive registrations, communicate event updates, and facilitate related payments or donations. The organizer may update event details, schedules, speakers, venues, accommodation arrangements, or programme content when reasonably necessary.',
          },
        ],
      },
      {
        heading: '3. Eligibility and Minors',
        blocks: [
          {
            type: 'paragraph',
            text: 'You must provide accurate and complete information. A person below 18 years of age may register only with the consent and supervision of a parent or lawful guardian. The organizer may request proof of age, identity, or guardian consent when reasonably required for safeguarding or event administration.',
          },
        ],
      },
      {
        heading: '4. Registration',
        blocks: [
          {
            type: 'list',
            items: [
              {
                text: 'A registration is confirmed only after successful payment, where applicable, and issue of a confirmation by email, message, or on-screen receipt.',
              },
              {
                text: 'Registrations are personal and may not be resold. Transfers are permitted only under the Refund and Cancellation Policy and after organizer approval.',
              },
              {
                text: 'The organizer may refuse or cancel a registration for inaccurate information, payment failure, misconduct, safety concerns, capacity limits, or breach of these terms.',
              },
            ],
          },
        ],
      },
      {
        heading: '5. Fees, Payments, and Taxes',
        blocks: [
          {
            type: 'paragraph',
            text: 'All displayed fees are in Indian Rupees unless stated otherwise. Payment processing may be handled by an independent payment gateway. You authorize the gateway and the organizer to process the payment information necessary to complete the transaction. Any applicable taxes or gateway charges will be disclosed where required.',
          },
        ],
      },
      {
        heading: '6. Event Services',
        blocks: [
          {
            type: 'paragraph',
            text: "The registration page or confirmation will identify the inclusions for the relevant ticket category. Unless expressly stated, travel to and from the venue, personal expenses, medical costs, and services not listed as included remain the participant's responsibility.",
          },
        ],
      },
      {
        heading: '7. Participant Responsibilities',
        blocks: [
          {
            type: 'list',
            items: [
              {
                text: 'Follow venue rules, event instructions, safeguarding requirements, and the Code of Conduct.',
                links: [{ text: 'Code of Conduct', path: '/code-of-conduct' }],
              },
              {
                text: 'Take reasonable care of personal belongings and arrange suitable travel, health, and insurance needs.',
              },
              {
                text: 'Disclose relevant accessibility, dietary, or emergency requirements early enough for the organizer to consider reasonable arrangements. Fulfilment cannot be guaranteed.',
              },
            ],
          },
        ],
      },
      {
        heading: '8. Event Changes, Postponement, and Force Majeure',
        blocks: [
          {
            type: 'paragraph',
            text: 'The organizer may change, postpone, relocate, shorten, convert to an online or hybrid format, or cancel the event because of safety concerns, government directions, severe weather, epidemic, natural disaster, venue failure, civil disturbance, transport disruption, speaker unavailability, or another circumstance beyond reasonable control. Remedies will be governed by the Refund and Cancellation Policy and applicable law.',
          },
        ],
      },
      {
        heading: '9. Photography and Recordings',
        blocks: [
          {
            type: 'paragraph',
            text: 'Photography, audio recording, livestreaming, and video recording may occur at the event. Use of identifiable images is governed by the Photography and Media Consent Policy. Participants must not record private sessions, counselling, minors, or other attendees in a manner that violates instructions, privacy, or law.',
            links: [{ text: 'Photography and Media Consent Policy', path: '/photography-media-consent' }],
          },
        ],
      },
      {
        heading: '10. Intellectual Property',
        blocks: [
          {
            type: 'paragraph',
            text: 'Website content, event branding, designs, recordings, text, graphics, and materials are owned by or licensed to the organizer. You may use them only for personal, non-commercial purposes unless written permission is obtained. Third-party names and marks remain the property of their owners.',
          },
        ],
      },
      {
        heading: '11. Prohibited Use',
        blocks: [
          {
            type: 'list',
            items: [
              {
                text: 'Do not interfere with website security, upload malicious code, scrape data, impersonate another person, submit unlawful content, misuse payment systems, or use the website for fraud or harassment.',
              },
              {
                text: 'Do not reproduce, sell, or commercially exploit event content or participant data without authorization.',
              },
            ],
          },
        ],
      },
      {
        heading: '12. Third-Party Services and Links',
        blocks: [
          {
            type: 'paragraph',
            text: 'The website may link to payment gateways, maps, social platforms, accommodation providers, or other third parties. Their services are governed by their own terms and privacy practices. The organizer is not responsible for third-party systems except to the extent required by law.',
          },
        ],
      },
      {
        heading: '13. Disclaimers',
        blocks: [
          {
            type: 'paragraph',
            text: 'Event information is provided in good faith and may change. The organizer does not guarantee uninterrupted website availability or that all content will be error-free. Nothing on the website constitutes medical, legal, financial, or professional advice.',
          },
        ],
      },
      {
        heading: '14. Limitation of Liability',
        blocks: [
          {
            type: 'paragraph',
            text: 'To the maximum extent permitted by law, the organizer will not be liable for indirect, incidental, special, or consequential loss, loss of opportunity, travel loss, or loss caused by circumstances outside its reasonable control. Nothing in these terms excludes liability that cannot lawfully be excluded, including rights under applicable consumer law.',
          },
        ],
      },
      {
        heading: '15. Indemnity',
        blocks: [
          {
            type: 'paragraph',
            text: 'You agree to be responsible for loss or claims arising from your unlawful conduct, material breach of these terms, infringement of third-party rights, or damage you intentionally or negligently cause, subject to applicable law.',
          },
        ],
      },
      {
        heading: '16. Privacy',
        blocks: [
          {
            type: 'paragraph',
            text: 'Personal information is handled according to the Privacy Policy. By submitting information, you confirm that information supplied about another person is provided with proper authority or consent.',
            links: [{ text: 'Privacy Policy', path: '/privacy-policy' }],
          },
        ],
      },
      {
        heading: '17. Governing Law and Disputes',
        blocks: [
          {
            type: 'paragraph',
            text: 'These terms are governed by the laws of India. The parties should first attempt good-faith resolution through the grievance contact. Subject to applicable consumer rights and mandatory jurisdiction rules, courts at Thrissur, Kerala will have jurisdiction.',
          },
        ],
      },
      {
        heading: '18. Updates',
        blocks: [
          {
            type: 'paragraph',
            text: 'The organizer may update these terms. The version published on the website with its effective date will apply prospectively. Material changes affecting an existing registration will be communicated where reasonably practicable.',
          },
        ],
      },
    ],
    contactIntro,
    contactDetails,
  },
  {
    path: '/privacy-policy',
    footerLabel: 'Privacy Policy',
    title: 'Privacy Policy',
    browserTitle: 'Privacy Policy | Indian Youth Conference',
    subtitle: 'How personal data is collected, used, shared, and protected',
    sections: [
      {
        heading: '1. Scope',
        blocks: [
          {
            type: 'paragraph',
            text: 'This Privacy Policy explains how Indian Youth Conference collects, uses, stores, shares, and protects personal data through www.indianyouthconference.com, conference registration forms, communications, payments, donations, and event operations.',
          },
        ],
      },
      {
        heading: '2. Information We May Collect',
        blocks: [
          {
            type: 'list',
            items: [
              { text: 'Identity and contact details, such as name, age or date of birth, gender where voluntarily provided, address, phone number, and email address.' },
              { text: 'Registration information, ticket category, group or church/organization details, attendance preferences, dietary or accessibility requests, emergency contact information, and guardian details for minors.' },
              { text: 'Payment and transaction details. Full card or banking credentials are generally processed by the payment gateway and are not intended to be stored by the organizer.' },
              { text: 'Communications, feedback, complaints, consent records, and support requests.' },
              { text: 'Technical information such as IP address, browser/device information, cookie identifiers, access logs, and website usage data.' },
              { text: 'Photographs, video, audio, and event recordings where applicable.' },
            ],
          },
        ],
      },
      {
        heading: '3. Purposes of Processing',
        blocks: [
          {
            type: 'list',
            items: [
              { text: 'Process and administer registrations, payments, donations, accommodation or meal arrangements, and event access.' },
              { text: 'Send confirmations, operational notices, schedule changes, safety messages, and participant support.' },
              { text: 'Handle refunds, transfers, complaints, legal obligations, accounting, fraud prevention, and dispute resolution.' },
              { text: 'Provide accessibility and safeguarding support, including emergency response where necessary.' },
              { text: 'Improve the website and event experience, maintain security, and produce aggregated statistics.' },
              { text: 'Send promotional communications where consent or another lawful basis applies. You may opt out of marketing at any time.' },
            ],
          },
        ],
      },
      {
        heading: '4. Consent and Lawful Use',
        blocks: [
          {
            type: 'paragraph',
            text: 'We seek consent where required and use personal data only for lawful purposes connected with the functions described in this policy. Consent may be withdrawn by contacting us, but withdrawal does not affect processing already lawfully completed and may prevent us from providing services that require the data.',
          },
        ],
      },
      {
        heading: '5. Children and Guardian Consent',
        blocks: [
          {
            type: 'paragraph',
            text: "For participants under 18, registration should be completed or approved by a parent or lawful guardian. We may collect guardian contact details and safety information necessary to administer participation. We do not knowingly use children's data for targeted advertising.",
          },
        ],
      },
      {
        heading: '6. Sharing of Information',
        blocks: [
          {
            type: 'paragraph',
            text: 'We may share limited information with authorized volunteers, venues, accommodation or catering providers, technology vendors, email or messaging providers, payment gateways, professional advisers, insurers, emergency services, law-enforcement authorities, or government bodies when reasonably necessary and lawful. Service providers should receive only information needed for their function and should be subject to appropriate confidentiality and security obligations.',
          },
        ],
      },
      {
        heading: '7. International or Remote Processing',
        blocks: [
          {
            type: 'paragraph',
            text: 'Some technology providers may process data outside Kerala or outside India. Where such processing occurs, we will take reasonable steps to use reputable providers and safeguards consistent with applicable law.',
          },
        ],
      },
      {
        heading: '8. Retention',
        blocks: [
          {
            type: 'paragraph',
            text: 'We retain data only as long as reasonably necessary for event administration, safety, accounting, legal compliance, dispute handling, and legitimate recordkeeping. Registration and financial records may be retained for statutory periods. Marketing information is retained until consent is withdrawn or it is no longer needed. Media may be retained as part of the event archive unless removal is requested and reasonably feasible.',
          },
        ],
      },
      {
        heading: '9. Security',
        blocks: [
          {
            type: 'paragraph',
            text: 'We use reasonable administrative, technical, and organizational safeguards appropriate to the nature of the information. No internet transmission or storage system is completely secure, and absolute security cannot be guaranteed.',
          },
        ],
      },
      {
        heading: '10. Your Choices and Rights',
        blocks: [
          {
            type: 'list',
            items: [
              { text: 'Request information about personal data we hold and how it is used.' },
              { text: 'Request correction, updating, or deletion where applicable.' },
              { text: 'Withdraw consent and opt out of marketing communications.' },
              { text: 'Raise a grievance concerning processing or a failure to respond to a request.' },
            ],
          },
          {
            type: 'paragraph',
            text: 'We may need to verify identity before acting on a request. Certain information may be retained where required by law, for fraud prevention, or for the establishment or defence of legal claims.',
          },
        ],
      },
      {
        heading: '11. Cookies and Analytics',
        blocks: [
          {
            type: 'paragraph',
            text: 'The website may use essential cookies and, where enabled, analytics or embedded third-party tools. Details are set out in the Cookie Policy. Non-essential cookies should be used with appropriate notice and choice.',
            links: [{ text: 'Cookie Policy', path: '/cookie-policy' }],
          },
        ],
      },
      {
        heading: '12. Data Breach and Complaints',
        blocks: [
          {
            type: 'paragraph',
            text: 'We will assess suspected personal data incidents and take appropriate containment, investigation, and notification steps required by applicable law. Complaints should first be sent to the grievance contact below.',
          },
        ],
      },
      {
        heading: '13. Changes to This Policy',
        blocks: [
          {
            type: 'paragraph',
            text: 'We may update this policy to reflect legal, operational, or technical changes. The revised effective date will be displayed on the website.',
          },
        ],
      },
    ],
    contactIntro,
    contactDetails,
  },
  {
    path: '/refund-policy',
    footerLabel: 'Refund Policy',
    title: 'Refund Policy',
    browserTitle: 'Refund Policy | Indian Youth Conference',
    subtitle: 'Refunds, deductions, processing time, and transfers',
    sections: [
      {
        heading: '1. Scope',
        blocks: [
          {
            type: 'paragraph',
            text: 'This policy applies to conference registration fees paid directly through the official website or an authorized payment channel. Separate written terms may apply to sponsorships, donations, merchandise, or third-party bookings.',
          },
        ],
      },
      {
        heading: '2. Participant Cancellation',
        blocks: [
          {
            type: 'paragraph',
            text: 'A participant may request cancellation by emailing the organizer from the email address used for registration and providing the registration name, transaction reference, phone number, and reason for cancellation.',
          },
          {
            type: 'paragraph',
            text: 'Approved participant refunds are subject to a 15% deduction from the registration fee to cover administrative, payment-processing, and committed event costs. The remaining eligible amount will be initiated within 14 business days after the cancellation request is approved.',
          },
        ],
      },
      {
        heading: '3. Cancellation Deadline',
        blocks: [
          {
            type: 'paragraph',
            text: 'Refund eligibility is available only for requests received before the cancellation deadline published on the registration page, ticket confirmation, or event notice. If no deadline has yet been published, the organizer will assess the request reasonably based on committed costs and proximity to the event. The organizer should publish a definite deadline before opening paid registrations.',
          },
        ],
      },
      {
        heading: '4. Registration Transfer',
        blocks: [
          {
            type: 'paragraph',
            text: "Instead of cancellation, a participant may request transfer of the registration to another eligible person. Transfer requests must be submitted before the transfer deadline published for the event and must include the replacement participant's accurate details and any required guardian consent. A transfer is effective only after written confirmation by the organizer. Transfers may be refused where prohibited by venue, safeguarding, accommodation, capacity, ticket-category, or legal requirements.",
          },
        ],
      },
      {
        heading: '5. Non-Refundable Circumstances',
        blocks: [
          {
            type: 'list',
            items: [
              { text: 'Requests received after the published cancellation deadline, except where applicable law requires otherwise.' },
              { text: 'Failure to attend, late arrival, early departure, removal for misconduct, or failure to meet eligibility or documentation requirements.' },
              { text: 'Travel, visa, accommodation, or other costs booked independently by the participant.' },
              { text: 'Optional donations, except where required by law or where the payment was made in error and promptly reported.' },
              { text: 'Differences caused solely by bank, card, currency-conversion, or third-party processing charges not received by the organizer.' },
            ],
          },
        ],
      },
      {
        heading: '6. Duplicate or Failed Transactions',
        blocks: [
          {
            type: 'paragraph',
            text: 'Duplicate debits or payments received without a completed registration should be reported promptly with proof of transaction. After verification, an erroneous amount received by the organizer will be refunded without the 15% cancellation deduction, although third-party charges may be outside the organizer\'s control.',
          },
        ],
      },
      {
        heading: '7. Event Postponement or Major Change',
        blocks: [
          {
            type: 'paragraph',
            text: 'If the event is postponed, the registration will ordinarily remain valid for the rescheduled date. The organizer will announce available options, which may include retaining the registration, transferring it, receiving a credit, or requesting a refund. Any deduction will be disclosed and will comply with applicable law.',
          },
        ],
      },
      {
        heading: '8. Event Cancellation by Organizer',
        blocks: [
          {
            type: 'paragraph',
            text: 'If the organizer cancels the event and does not provide a reasonable replacement event or service, affected participants will be offered a refund of the registration fee actually received, subject only to deductions that are lawful, transparent, and genuinely unavoidable. Donations and independent travel or accommodation costs are not included unless expressly promised.',
          },
        ],
      },
      {
        heading: '9. Refund Method and Timing',
        blocks: [
          {
            type: 'paragraph',
            text: 'Approved refunds will normally be returned to the original payment method. The organizer will initiate the refund within 14 business days after approval. Banks and payment gateways may take additional time to credit the account. The participant is responsible for providing correct information where an alternative method is required.',
          },
        ],
      },
      {
        heading: '10. Chargebacks and Disputes',
        blocks: [
          {
            type: 'paragraph',
            text: 'Participants should contact the organizer before initiating a chargeback so the matter can be investigated. Fraudulent or abusive chargebacks may lead to cancellation of registration and recovery action, subject to law.',
          },
        ],
      },
    ],
    contactIntro,
    contactDetails,
  },
  {
    path: '/cancellation-policy',
    footerLabel: 'Cancellation Policy',
    title: 'Cancellation Policy',
    browserTitle: 'Cancellation Policy | Indian Youth Conference',
    subtitle: 'Participant and organizer cancellation rules',
    sections: [
      {
        heading: '1. How to Cancel',
        blocks: [
          {
            type: 'paragraph',
            text: 'Send a cancellation request to indianyouthconference@gmail.com from the registered email address. Include the participant name, registered phone number, transaction or registration reference, and reason for cancellation. A request is not complete until acknowledged by the organizer.',
          },
        ],
      },
      {
        heading: '2. Financial Effect',
        blocks: [
          {
            type: 'paragraph',
            text: 'Where the request is eligible under the Refund Policy, the refundable amount will be calculated after a 15% deduction. The organizer will initiate an approved refund within 14 business days after approval. Bank or gateway processing time is additional.',
            links: [{ text: 'Refund Policy', path: '/refund-policy' }],
          },
        ],
      },
      {
        heading: '3. Transfer Instead of Cancellation',
        blocks: [
          {
            type: 'paragraph',
            text: 'A participant may request transfer to another eligible person before the published transfer deadline. The replacement participant must accept all event terms, provide correct registration information, and supply guardian consent if under 18. Transfer is subject to organizer approval and written confirmation.',
          },
        ],
      },
      {
        heading: '4. Organizer Cancellation of Registration',
        blocks: [
          {
            type: 'paragraph',
            text: 'The organizer may cancel an individual registration because of payment failure, false information, safety or safeguarding concerns, capacity or accommodation limits, violation of the Code of Conduct, unlawful activity, or failure to comply with event requirements. Refund entitlement will depend on the reason and applicable law. A participant removed for serious misconduct may not be entitled to a refund.',
            links: [{ text: 'Code of Conduct', path: '/code-of-conduct' }],
          },
        ],
      },
      {
        heading: '5. Event Cancellation, Postponement, or Relocation',
        blocks: [
          {
            type: 'paragraph',
            text: 'The organizer may cancel, postpone, relocate, shorten, or change the event format when reasonably necessary. Participants will be informed using the contact details supplied. Available remedies will be announced in accordance with the Refund Policy and applicable consumer law.',
            links: [{ text: 'Refund Policy', path: '/refund-policy' }],
          },
        ],
      },
      {
        heading: '6. Force Majeure',
        blocks: [
          {
            type: 'paragraph',
            text: 'Where performance is prevented or materially affected by circumstances beyond reasonable control, including government restriction, epidemic, severe weather, natural disaster, venue unavailability, civil disturbance, transport shutdown, or public-safety risk, the organizer may provide a rescheduled event, credit, transfer, online alternative, or refund option after accounting for legal duties and unavoidable committed costs.',
          },
        ],
      },
      {
        heading: '7. Failure to Attend',
        blocks: [
          {
            type: 'paragraph',
            text: 'Non-attendance without an approved cancellation or transfer is treated as a no-show and is ordinarily non-refundable. Participants remain responsible for independent travel and accommodation arrangements.',
          },
        ],
      },
    ],
    contactIntro,
    contactDetails,
  },
  {
    path: '/digital-delivery-policy',
    footerLabel: 'Digital Delivery Policy',
    title: 'Digital Delivery Policy',
    browserTitle: 'Digital Delivery Policy | Indian Youth Conference',
    subtitle: 'Registration confirmations, tickets, and non-physical delivery',
    sections: [
      {
        heading: '1. No Physical Shipping Unless Stated',
        blocks: [
          {
            type: 'paragraph',
            text: 'The website primarily provides event registration and information services. No physical product is shipped unless a specific product or service page expressly states otherwise.',
          },
        ],
      },
      {
        heading: '2. Digital Delivery',
        blocks: [
          {
            type: 'paragraph',
            text: 'After successful registration and payment, the participant should receive an on-screen confirmation, email, message, receipt, ticket, or registration reference. Digital confirmation is normally sent to the email address or phone number supplied during registration.',
          },
        ],
      },
      {
        heading: '3. Delivery Time',
        blocks: [
          {
            type: 'paragraph',
            text: 'Digital confirmation is generally generated promptly after successful payment. Delays may occur because of payment verification, network failure, incorrect contact details, spam filtering, or manual review. Participants should contact the organizer if confirmation is not received within 24 hours after a successful debit.',
          },
        ],
      },
      {
        heading: '4. Incorrect Contact Details',
        blocks: [
          {
            type: 'paragraph',
            text: 'The participant is responsible for providing accurate contact details and checking spam or promotions folders. The organizer will reasonably assist with re-issuing a confirmation after identity and payment verification.',
          },
        ],
      },
      {
        heading: '5. Event Admission',
        blocks: [
          {
            type: 'paragraph',
            text: 'A digital confirmation does not override eligibility, safety, identity, guardian-consent, or conduct requirements. Participants may be asked to show the confirmation and a valid form of identification at check-in.',
          },
        ],
      },
      {
        heading: '6. Physical Items',
        blocks: [
          {
            type: 'paragraph',
            text: 'If the organizer later offers merchandise or another physical item, the applicable product page should state delivery area, dispatch time, charges, return conditions, and risk of loss. Until such terms are displayed, this policy should not be read as an offer of physical shipping.',
          },
        ],
      },
    ],
    contactIntro,
    contactDetails,
  },
  {
    path: '/cookie-policy',
    footerLabel: 'Cookie Policy',
    title: 'Cookie Policy',
    browserTitle: 'Cookie Policy | Indian Youth Conference',
    subtitle: 'Cookies, analytics, and user choices',
    sections: [
      {
        heading: '1. What Cookies Are',
        blocks: [
          {
            type: 'paragraph',
            text: 'Cookies and similar technologies are small files or identifiers placed on a device or browser. They may help a website function, remember preferences, protect transactions, measure use, or enable embedded services.',
          },
        ],
      },
      {
        heading: '2. Categories We May Use',
        blocks: [
          {
            type: 'list',
            items: [
              { text: 'Strictly necessary cookies for security, forms, sessions, payment flow, and core website functions.' },
              { text: 'Preference cookies that remember choices such as language or display settings.' },
              { text: 'Analytics cookies that help understand aggregate website usage and performance.' },
              { text: 'Third-party or embedded-content cookies associated with maps, video, social media, payment gateways, or other external services.' },
            ],
          },
        ],
      },
      {
        heading: '3. Consent',
        blocks: [
          {
            type: 'paragraph',
            text: 'Strictly necessary cookies may operate without optional consent where permitted. Non-essential analytics, advertising, or third-party cookies should be activated only after appropriate notice and choice. The actual cookie banner and settings must match the technologies deployed on the website.',
          },
        ],
      },
      {
        heading: '4. Managing Cookies',
        blocks: [
          {
            type: 'paragraph',
            text: 'Users may reject or withdraw non-essential cookie consent through the website control, where available, or through browser settings. Blocking some cookies may affect website features, forms, media, or payment functionality.',
          },
        ],
      },
      {
        heading: '5. Third-Party Tools',
        blocks: [
          {
            type: 'paragraph',
            text: 'Third-party providers may set their own cookies and process information under their own privacy terms. The organizer should maintain an up-to-date inventory of all analytics, advertising, embedded media, payment, and social tools used on the website.',
          },
        ],
      },
      {
        heading: '6. Retention and Updates',
        blocks: [
          {
            type: 'paragraph',
            text: 'Cookie duration varies by purpose and provider. This policy may be updated when website technologies change. The organizer should publish a detailed cookie table if non-essential cookies are used.',
          },
        ],
      },
    ],
    contactIntro,
    contactDetails,
  },
  {
    path: '/code-of-conduct',
    footerLabel: 'Code of Conduct',
    title: 'Conference Code of Conduct',
    browserTitle: 'Code of Conduct | Indian Youth Conference',
    subtitle: 'Safety, respect, safeguarding, and enforcement',
    sections: [
      {
        heading: '1. Purpose',
        blocks: [
          {
            type: 'paragraph',
            text: 'The conference is intended to be a safe, respectful, welcoming, and constructive environment. This Code applies to participants, speakers, volunteers, staff, vendors, guests, and online attendees in event venues, accommodation areas, transport arranged by the organizer, digital spaces, and related communications.',
          },
        ],
      },
      {
        heading: '2. Expected Conduct',
        blocks: [
          {
            type: 'list',
            items: [
              { text: 'Treat others with dignity, patience, and respect.' },
              { text: 'Follow safety, venue, accommodation, safeguarding, and session instructions.' },
              { text: 'Respect personal boundaries, privacy, religious or cultural differences, and requests not to be photographed.' },
              { text: 'Use appropriate language and avoid disruption, intimidation, or unwanted contact.' },
              { text: 'Report safety concerns, harassment, injury, or suspected abuse promptly to an organizer or designated safeguarding contact.' },
            ],
          },
        ],
      },
      {
        heading: '3. Prohibited Conduct',
        blocks: [
          {
            type: 'list',
            items: [
              { text: 'Harassment, bullying, stalking, threats, humiliation, discrimination, sexual misconduct, exploitation, or retaliation.' },
              { text: 'Violence, possession of prohibited weapons, unlawful substances, intoxication that creates risk, theft, vandalism, or deliberate damage.' },
              { text: 'Unauthorized access to restricted areas, misuse of participant data, or recording of private or sensitive interactions.' },
              { text: 'Conduct that endangers a child or vulnerable person or breaches guardian, supervision, accommodation, or safeguarding rules.' },
            ],
          },
        ],
      },
      {
        heading: '4. Minors and Safeguarding',
        blocks: [
          {
            type: 'paragraph',
            text: 'Participants under 18 must comply with guardian-consent and supervision arrangements. Adults must not place minors in unsafe or secretive situations, exchange inappropriate private communications, or disregard designated safeguarding procedures. Suspected abuse or imminent danger may be reported to appropriate authorities.',
          },
        ],
      },
      {
        heading: '5. Reporting',
        blocks: [
          {
            type: 'paragraph',
            text: 'Concerns may be reported in person to an organizer or through the contact information below. Reports will be handled as discreetly as reasonably possible, but confidentiality cannot be guaranteed where investigation, safeguarding, or legal reporting is required.',
          },
        ],
      },
      {
        heading: '6. Consequences',
        blocks: [
          {
            type: 'paragraph',
            text: 'The organizer may issue a warning, restrict access, change accommodation or seating, remove a person from the event, cancel registration, contact guardians, venue security, emergency services, or law-enforcement authorities, and prohibit future participation. Serious misconduct may result in removal without refund, subject to applicable law.',
          },
        ],
      },
      {
        heading: '7. Appeals and Non-Retaliation',
        blocks: [
          {
            type: 'paragraph',
            text: 'A person affected by an organizer decision may submit a concise written review request. Retaliation against a person who raises a genuine safety or conduct concern is prohibited.',
          },
        ],
      },
    ],
    contactIntro,
    contactDetails,
  },
  {
    path: '/photography-media-consent',
    footerLabel: 'Photography & Media Consent',
    title: 'Photography and Media Consent Policy',
    browserTitle: 'Photography & Media Consent Policy | Indian Youth Conference',
    subtitle: 'Event photography, recordings, minors, and removal requests',
    sections: [
      {
        heading: '1. Event Recording',
        blocks: [
          {
            type: 'paragraph',
            text: 'The organizer may photograph, film, livestream, or record public sessions, performances, group activities, interviews, and general event scenes for documentation, reporting, educational, archival, promotional, and communication purposes.',
          },
        ],
      },
      {
        heading: '2. Notice and Choice',
        blocks: [
          {
            type: 'paragraph',
            text: 'Visible event notices and registration materials should inform participants that recording may occur. Where reasonably practicable, participants who do not wish to appear prominently should contact the organizer before the event and follow designated seating, badge, or opt-out arrangements. Crowd and background images may be difficult to exclude.',
          },
        ],
      },
      {
        heading: '3. Minors',
        blocks: [
          {
            type: 'paragraph',
            text: 'Identifiable featured images or interviews of minors should be used only with appropriate parent or guardian consent and in line with safeguarding procedures. General crowd images should still be handled carefully and should not expose sensitive information or create a safety risk.',
          },
        ],
      },
      {
        heading: '4. Permitted Use',
        blocks: [
          {
            type: 'paragraph',
            text: 'Subject to applicable law and consent requirements, the organizer may edit, reproduce, publish, display, distribute, and store event media through websites, social media, reports, presentations, news coverage, and promotional materials. The organizer will not intentionally use media in a defamatory, misleading, or exploitative manner.',
          },
        ],
      },
      {
        heading: '5. Participant Recording',
        blocks: [
          {
            type: 'paragraph',
            text: 'Participants may take personal photographs or short recordings only where permitted. They must respect no-recording announcements, private sessions, counselling, worship or prayer requests, minors, intellectual-property restrictions, and requests from individuals not to be recorded. Commercial recording requires prior written approval.',
          },
        ],
      },
      {
        heading: '6. Removal Requests',
        blocks: [
          {
            type: 'paragraph',
            text: 'A participant may request removal of a clearly identifiable image from organizer-controlled online channels by supplying enough information to locate it. The organizer will consider the request reasonably, but removal may not be possible from printed materials, archives, third-party reposts, news coverage, or content already lawfully distributed.',
          },
        ],
      },
      {
        heading: '7. Intellectual Property',
        blocks: [
          {
            type: 'paragraph',
            text: "Media created by or for the organizer remains owned by or licensed to the organizer. This policy does not transfer ownership of a participant's independently created content.",
          },
        ],
      },
    ],
    contactIntro,
    contactDetails,
  },
]

export function getPolicyByPath(pathname: string) {
  return POLICIES.find((policy) => policy.path === pathname)
}
