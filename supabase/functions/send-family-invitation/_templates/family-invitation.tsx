import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Button,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface FamilyInvitationEmailProps {
  invitedEmail: string
  petName: string
  inviterName: string
  role: string
  message?: string
  acceptUrl: string
}

const roleTranslations: Record<string, string> = {
  family_member: 'Μέλος Οικογένειας',
  caretaker: 'Φροντιστής',
  viewer: 'Παρατηρητής'
}

export const FamilyInvitationEmail = ({
  invitedEmail,
  petName,
  inviterName,
  role,
  message,
  acceptUrl,
}: FamilyInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>Πρόσκληση για διαχείριση του {petName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logo}>🐾 PetHelper</Text>
        </Section>
        
        <Heading style={h1}>Πρόσκληση για διαχείριση κατοικίδιου</Heading>
        
        <Text style={text}>
          Γεια σας,
        </Text>
        
        <Text style={text}>
          Ο/Η <strong>{inviterName}</strong> σας προσκαλεί να γίνετε <strong>{roleTranslations[role] || role}</strong> 
          για το κατοικίδιό του <strong>{petName}</strong> στην πλατφόρμα PetHelper.
        </Text>

        {message && (
          <Section style={messageBox}>
            <Text style={messageTitle}>Προσωπικό μήνυμα:</Text>
            <Text style={messageText}>"{message}"</Text>
          </Section>
        )}

        <Text style={text}>
          Ως {roleTranslations[role] || role}, θα μπορείτε να:
        </Text>

        <ul style={list}>
          <li style={listItem}>Προβάλλετε τις πληροφορίες του κατοικίδιου</li>
          {(role === 'family_member' || role === 'caretaker') && (
            <li style={listItem}>Επεξεργάζεστε τα στοιχεία και προσθέτετε νέες εγγραφές</li>
          )}
          {role === 'family_member' && (
            <li style={listItem}>Προσκαλείτε άλλα μέλη οικογένειας</li>
          )}
        </ul>

        <Section style={buttonContainer}>
          <Button href={acceptUrl} style={button}>
            Αποδοχή Πρόσκλησης
          </Button>
        </Section>

        <Text style={smallText}>
          Αν δεν μπορείτε να κάνετε κλικ στο κουμπί, αντιγράψτε και επικολλήστε αυτό το link στον browser σας:
        </Text>
        <Text style={linkText}>{acceptUrl}</Text>

        <Hr style={hr} />

        <Text style={footer}>
          Αυτή η πρόσκληση λήγει σε 7 ημέρες. Αν δεν θέλετε να συμμετάσχετε, 
          μπορείτε να αγνοήσετε αυτό το email.
        </Text>

        <Text style={footer}>
          Με εκτίμηση,<br />
          Η ομάδα PetHelper
        </Text>
      </Container>
    </Body>
  </Html>
)

export default FamilyInvitationEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '20px 30px',
  textAlign: 'center' as const,
}

const logo = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#2563eb',
  margin: '0',
}

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '30px 0',
  padding: '0 30px',
  textAlign: 'center' as const,
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  padding: '0 30px',
}

const messageBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '6px',
  margin: '24px 30px',
  padding: '20px',
}

const messageTitle = {
  color: '#374151',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const messageText = {
  color: '#6b7280',
  fontSize: '14px',
  fontStyle: 'italic',
  margin: '0',
}

const list = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  padding: '0 30px',
}

const listItem = {
  margin: '8px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const smallText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0 8px 0',
  padding: '0 30px',
}

const linkText = {
  color: '#2563eb',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 16px 0',
  padding: '0 30px',
  wordBreak: 'break-all' as const,
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 30px',
}

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
  padding: '0 30px',
}