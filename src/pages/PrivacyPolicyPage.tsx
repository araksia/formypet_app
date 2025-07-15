import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicyPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Πολιτική Απορρήτου
            </CardTitle>
            <p className="text-muted-foreground text-center">
              Τελευταία ενημέρωση: {new Date().toLocaleDateString('el-GR')}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Εισαγωγή</h2>
              <p className="text-muted-foreground">
                Η ForMyPet σέβεται το απόρρητό σας και δεσμεύεται να προστατεύσει τις προσωπικές σας πληροφορίες. 
                Αυτή η Πολιτική Απορρήτου εξηγεί πώς συλλέγουμε, χρησιμοποιούμε και προστατεύουμε τις πληροφορίες σας.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Πληροφορίες που Συλλέγουμε</h2>
              <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                <li>Στοιχεία λογαριασμού (email, όνομα)</li>
                <li>Πληροφορίες κατοικίδιων (όνομα, είδος, ηλικία, φωτογραφίες)</li>
                <li>Ιατρικά αρχεία και εξετάσεις</li>
                <li>Εκδηλώσεις και υπενθυμίσεις</li>
                <li>Έξοδα και δαπάνες</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Πώς Χρησιμοποιούμε τις Πληροφορίες</h2>
              <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                <li>Παροχή και βελτίωση των υπηρεσιών μας</li>
                <li>Αποστολή ειδοποιήσεων και υπενθυμίσεων</li>
                <li>Επικοινωνία μαζί σας για θέματα υποστήριξης</li>
                <li>Διασφάλιση της ασφάλειας της εφαρμογής</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Κοινοποίηση Πληροφοριών</h2>
              <p className="text-muted-foreground">
                Δεν πουλάμε, ανταλλάσσουμε ή μεταφέρουμε τις προσωπικές σας πληροφορίες σε τρίτους χωρίς τη συγκατάθεσή σας, 
                εκτός εάν απαιτείται από τον νόμο.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Ασφάλεια Δεδομένων</h2>
              <p className="text-muted-foreground">
                Χρησιμοποιούμε κατάλληλα τεχνικά και οργανωτικά μέτρα για την προστασία των προσωπικών σας δεδομένων 
                από μη εξουσιοδοτημένη πρόσβαση, χρήση ή αποκάλυψη.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Τα Δικαιώματά σας</h2>
              <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                <li>Πρόσβαση στα προσωπικά σας δεδομένα</li>
                <li>Διόρθωση ανακριβών πληροφοριών</li>
                <li>Διαγραφή των δεδομένων σας</li>
                <li>Περιορισμός της επεξεργασίας</li>
                <li>Φορητότητα δεδομένων</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Επικοινωνία</h2>
              <p className="text-muted-foreground">
                Για οποιεσδήποτε ερωτήσεις σχετικά με αυτή την πολιτική απορρήτου, επικοινωνήστε μαζί μας στο:{" "}
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

export default PrivacyPolicyPage;