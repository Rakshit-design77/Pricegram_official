export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl space-y-6">
      <h1 className="text-3xl font-black uppercase tracking-tight">Privacy Policy</h1>
      <p className="text-xs text-muted-foreground font-bold uppercase">Last Updated: June 7, 2026</p>
      
      <div className="space-y-4 text-sm text-foreground/80 leading-relaxed font-semibold">
        <p>
          At PriceGram, we prioritize the privacy of our visitors. This Privacy Policy document outlines the types of information collected and recorded by PriceGram and how we use it.
        </p>

        <h3 className="text-lg font-bold text-foreground pt-2">1. Personal Information Collected</h3>
        <p>
          If you create an account using Clerk, we store your profile parameters (name, email, profile picture). If you configure Price Drop Alerts, we record your email or phone number to deliver tracking notifications.
        </p>

        <h3 className="text-lg font-bold text-foreground pt-2">2. Local Storage and Cookies</h3>
        <p>
          We use cookies and local storage tokens to store your pincodes and locations, search history, wishlist selections, and premium tier activation parameters.
        </p>

        <h3 className="text-lg font-bold text-foreground pt-2">3. Third-Party Links</h3>
        <p>
          PriceGram contains affiliate links to other websites (such as Amazon, Flipkart, Myntra). Once you click on these links, you are subject to the privacy policies of those destination stores. We encourage you to read their privacy disclosures.
        </p>

        <p className="pt-4 text-xs text-muted-foreground font-normal">
          For any clarifications regarding this policy, please reach out to legal@pricegram.app.
        </p>
      </div>
    </div>
  );
}
