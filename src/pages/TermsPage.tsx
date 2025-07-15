import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Όροι Χρήσης
            </CardTitle>
            <p className="text-muted-foreground text-center">
              Τελευταία ενημέρωση: {new Date().toLocaleDateString('el-GR')}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Αποδοχή Όρων</h2>
              <p className="text-muted-foreground">
                Χρησιμοποιώντας την εφαρμογή ForMyPet, συμφωνείτε με αυτούς τους όρους χρήσης. 
                Εάν δεν συμφωνείτε, παρακαλώ μην χρησιμοποιείτε την εφαρμογή.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Περιγραφή Υπηρεσίας</h2>
              <p className="text-muted-foreground">
                Η ForMyPet είναι μια εφαρμογή διαχείρισης κατοικίδιων που επιτρέπει στους χρήστες να:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-muted-foreground mt-2">
                <li>Διαχειρίζονται προφίλ κατοικίδιων</li>
                <li>Παρακολουθούν ιατρικά αρχεία</li>
                <li>Προγραμματίζουν εκδηλώσεις και υπενθυμίσεις</li>
                <li>Καταγράφουν έξοδα</li>
                <li>Διαμοιράζονται πρόσβαση με μέλη της οικογένειας</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Υποχρεώσεις Χρήστη</h2>
              <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                <li>Παροχή ακριβών και ενημερωμένων πληροφοριών</li>
                <li>Διατήρηση της ασφάλειας του λογαριασμού σας</li>
                <li>Χρήση της εφαρμογής σύμφωνα με τους νόμους</li>
                <li>Μη κατάχρηση ή παρενόχληση άλλων χρηστών</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Περιορισμοί Ευθύνης</h2>
              <p className="text-muted-foreground">
                Η ForMyPet παρέχεται "ως έχει" χωρίς εγγυήσεις. Δεν αναλαμβάνουμε ευθύνη για:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-muted-foreground mt-2">
                <li>Ιατρικές αποφάσεις βασισμένες στην εφαρμογή</li>
                <li>Απώλεια δεδομένων λόγω τεχνικών προβλημάτων</li>
                <li>Διακοπές υπηρεσίας</li>
                <li>Ζημίες από κακή χρήση της εφαρμογής</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Ιατρική Επισήμανση</h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                  Σημαντικό: Η ForMyPet δεν αντικαθιστά την επαγγελματική κτηνιατρική φροντίδα. 
                  Συμβουλευτείτε πάντα έναν κτηνίατρο για ιατρικά θέματα των κατοικίδιων σας.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Τερματισμός</h2>
              <p className="text-muted-foreground">
                Μπορείτε να τερματίσετε τον λογαριασμό σας ανά πάσα στιγμή. Διατηρούμε το δικαίωμα 
                να τερματίσουμε λογαριασμούς που παραβιάζουν αυτούς τους όρους.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Αλλαγές Όρων</h2>
              <p className="text-muted-foreground">
                Διατηρούμε το δικαίωμα να τροποποιήσουμε αυτούς τους όρους. Οι χρήστες θα ενημερώνονται 
                για σημαντικές αλλαγές μέσω της εφαρμογής ή email.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Επικοινωνία</h2>
              <p className="text-muted-foreground">
                Για ερωτήσεις σχετικά με αυτούς τους όρους, επικοινωνήστε μαζί μας στο:{" "}
                <a href="mailto:info@formypet.gr" className="text-primary hover:underline">
                  info@formypet.gr
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TermsPage;